import { env } from "@/config/env";
import { logger } from "@/server/lib/logger";
import { AppError, RateLimitedError, ServiceUnavailableError } from "@/server/lib/errors";

// Minimal OpenAI-compatible chat-completions client. Deliberately no SDK —
// this way any provider with a /chat/completions endpoint (Groq, Gemini,
// OpenRouter, Cerebras…) works by just changing the env vars.

export type ChatMessage =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: ToolCall[] }
  | { role: "tool"; content: string; tool_call_id: string };

export type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export type ChatTool = {
  type: "function";
  function: { name: string; description: string; parameters: Record<string, unknown> };
};

type AssistantReply = { role: "assistant"; content: string | null; tool_calls?: ToolCall[] };

export function isSahuBhaiConfigured(): boolean {
  return Boolean(env.SAHU_BHAI_API_KEY || env.SAHU_BHAI_API_KEY_2 || env.SAHU_BHAI_API_KEY_3);
}

// The primary provider plus any configured fallbacks, tried in order. A
// request that fails on one because of a rate limit / quota / outage is
// replayed on the next.
type Provider = { name: string; apiKey: string; baseUrl: string; model: string };

function providers(): Provider[] {
  const list: Provider[] = [];
  if (env.SAHU_BHAI_API_KEY) {
    list.push({
      name: "primary",
      apiKey: env.SAHU_BHAI_API_KEY,
      baseUrl: env.SAHU_BHAI_BASE_URL,
      model: env.SAHU_BHAI_MODEL,
    });
  }
  if (env.SAHU_BHAI_API_KEY_2) {
    list.push({
      name: "fallback-2",
      apiKey: env.SAHU_BHAI_API_KEY_2,
      baseUrl: env.SAHU_BHAI_BASE_URL_2,
      model: env.SAHU_BHAI_MODEL_2,
    });
  }
  if (env.SAHU_BHAI_API_KEY_3) {
    if (env.SAHU_BHAI_BASE_URL_3 && env.SAHU_BHAI_MODEL_3) {
      list.push({
        name: "fallback-3",
        apiKey: env.SAHU_BHAI_API_KEY_3,
        baseUrl: env.SAHU_BHAI_BASE_URL_3,
        model: env.SAHU_BHAI_MODEL_3,
      });
    } else {
      logger.warn("Sahu Bhai: SAHU_BHAI_API_KEY_3 set but BASE_URL_3 / MODEL_3 missing — skipping slot 3");
    }
  }
  return list;
}

// Errors worth replaying on the next provider (rate limit, quota, outage,
// bad key, oversized request). A plain malformed-request 400 is not — it
// would fail everywhere.
function shouldFailover(err: unknown): boolean {
  if (!(err instanceof AppError)) return true; // network / unknown → try next
  if (err.statusCode === 400 && err.code === "LLM_ERROR") return false;
  return true;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// "577ms" | "1m26.4s" | "2" (seconds) -> milliseconds
function parseResetHeader(value: string | null): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed) * 1000;
  let ms = 0;
  const m = trimmed.match(/(\d+(?:\.\d+)?)\s*m(?!s)/);
  const s = trimmed.match(/(\d+(?:\.\d+)?)\s*s/);
  const msPart = trimmed.match(/(\d+(?:\.\d+)?)\s*ms/);
  if (m) ms += Number(m[1]) * 60_000;
  if (s) ms += Number(s[1]) * 1000;
  if (msPart) ms += Number(msPart[1]);
  return ms || null;
}

const MAX_RETRIES = 2;

// Fires the request against the configured providers in order. Each is
// tried once (with a short in-provider retry on 429/503 only when it is
// the last provider left); a rate-limit / quota / outage moves on to the
// next. The final provider's failure is thrown as a typed AppError.
async function post(body: Record<string, unknown>): Promise<Response> {
  const ps = providers();
  if (ps.length === 0) {
    throw new ServiceUnavailableError(
      "Sahu Bhai isn't set up yet — an LLM API key is needed. Set SAHU_BHAI_API_KEY in .env (see SAHU_BHAI.md).",
    );
  }

  let lastError: unknown;
  for (let i = 0; i < ps.length; i++) {
    const isLast = i === ps.length - 1;
    try {
      return await postToProvider(ps[i]!, body, isLast);
    } catch (error) {
      lastError = error;
      if (isLast || !shouldFailover(error)) throw error;
      logger.warn("Sahu Bhai: provider failed, falling back", {
        provider: ps[i]!.name,
        next: ps[i + 1]!.name,
        code: error instanceof AppError ? error.code : String(error),
      });
    }
  }
  throw lastError;
}

async function postToProvider(
  provider: Provider,
  body: Record<string, unknown>,
  isLast: boolean,
  attempt = 0,
): Promise<Response> {
  const url = `${provider.baseUrl.replace(/\/+$/, "")}/chat/completions`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({ model: provider.model, temperature: 0.4, ...body }),
    });
  } catch (error) {
    logger.error("Sahu Bhai LLM request failed", { provider: provider.name, error: String(error) });
    throw new AppError("Couldn't reach the Sahu Bhai LLM (network error).", 502, "LLM_UNREACHABLE");
  }

  // 429 = rate limited; 503 = "high demand". Retry in-provider only when
  // there's no other provider to fall back to — otherwise fail fast and
  // let post() move to the next one.
  if ((res.status === 429 || res.status === 503) && isLast && attempt < MAX_RETRIES) {
    const waitMs = Math.min(
      parseResetHeader(res.headers.get("retry-after")) ??
        parseResetHeader(res.headers.get("x-ratelimit-reset-tokens")) ??
        (res.status === 503 ? 1500 : 3000),
      9000,
    );
    logger.warn(`Sahu Bhai LLM ${res.status} — retrying`, { provider: provider.name, attempt, waitMs });
    await sleep(waitMs + 250);
    return postToProvider(provider, body, isLast, attempt + 1);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    logger.error("Sahu Bhai LLM error response", {
      provider: provider.name,
      status: res.status,
      body: text.slice(0, 500),
    });
    if (res.status === 429) {
      throw new RateLimitedError(
        "Sahu Bhai is busy right now (free-tier per-minute limit). Wait ~15–20 seconds and try again, or send a shorter message.",
      );
    }
    if (res.status === 503) {
      throw new RateLimitedError(
        "Sahu Bhai's model is under heavy load right now. Give it a few seconds and try again.",
      );
    }
    // 413, or a 400 whose body complains about size / tokens / context: the
    // request itself is too big for this model's per-request limit.
    const tooLarge =
      res.status === 413 ||
      (res.status === 400 && /too large|context length|maximum context|tokens per|reduce/i.test(text));
    if (tooLarge) {
      throw new AppError(
        "That conversation got too long for Sahu Bhai's current free model. Tap “New chat” and ask again in a shorter message.",
        413,
        "REQUEST_TOO_LARGE",
      );
    }
    // 401/402/5xx → typed so shouldFailover() lets post() try the next
    // provider; a plain 400 stays a non-failover LLM_ERROR.
    throw new AppError(
      `LLM provider returned an error (${res.status}). ${text.slice(0, 200)}`.trim(),
      res.status === 400 ? 400 : 502,
      "LLM_ERROR",
    );
  }

  return res;
}

function withTools(base: Record<string, unknown>, tools?: ChatTool[]): Record<string, unknown> {
  if (tools && tools.length > 0) return { ...base, tools, tool_choice: "auto" };
  return base;
}

export async function chatCompletion(params: {
  messages: ChatMessage[];
  tools?: ChatTool[];
}): Promise<AssistantReply> {
  const res = await post(withTools({ messages: params.messages }, params.tools));
  const data = (await res.json().catch(() => null)) as {
    choices?: { message?: AssistantReply }[];
  } | null;
  const message = data?.choices?.[0]?.message;
  if (!message) throw new AppError("The LLM returned an empty response.", 502, "LLM_EMPTY");
  return message;
}

type StreamDelta = {
  content?: string;
  tool_calls?: {
    index: number;
    id?: string;
    function?: { name?: string; arguments?: string };
  }[];
};

// Streaming variant — `onText` gets each content delta as it arrives; the
// full assembled message (content + any tool_calls) is returned at the end.
export async function streamChatCompletion(
  params: { messages: ChatMessage[]; tools?: ChatTool[] },
  onText: (delta: string) => void,
): Promise<AssistantReply> {
  const res = await post(withTools({ messages: params.messages, stream: true }, params.tools));
  if (!res.body) throw new AppError("The LLM returned no stream.", 502, "LLM_EMPTY");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
  const toolCalls: ToolCall[] = [];

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") continue;

      let json: { choices?: { delta?: StreamDelta }[] };
      try {
        json = JSON.parse(payload);
      } catch {
        continue;
      }
      const delta = json.choices?.[0]?.delta;
      if (!delta) continue;

      if (delta.content) {
        content += delta.content;
        onText(delta.content);
      }
      for (const tc of delta.tool_calls ?? []) {
        const slot = (toolCalls[tc.index] ??= {
          id: tc.id ?? `call_${tc.index}`,
          type: "function",
          function: { name: "", arguments: "" },
        });
        if (tc.id) slot.id = tc.id;
        if (tc.function?.name) slot.function.name += tc.function.name;
        if (tc.function?.arguments) slot.function.arguments += tc.function.arguments;
      }
    }
  }

  return {
    role: "assistant",
    content: content || null,
    tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
  };
}
