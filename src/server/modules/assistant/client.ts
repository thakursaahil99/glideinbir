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
  return Boolean(env.SAHU_BHAI_API_KEY);
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

// Fires the request, transparently retrying a 429 while the token bucket
// refills, and turns a hard failure into a typed AppError.
async function post(
  body: Record<string, unknown>,
  attempt = 0,
): Promise<Response> {
  if (!env.SAHU_BHAI_API_KEY) {
    throw new ServiceUnavailableError(
      "Sahu Bhai isn't set up yet — an LLM API key is needed. Set SAHU_BHAI_API_KEY in .env (see SAHU_BHAI.md).",
    );
  }

  const url = `${env.SAHU_BHAI_BASE_URL.replace(/\/+$/, "")}/chat/completions`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.SAHU_BHAI_API_KEY}`,
      },
      body: JSON.stringify({ model: env.SAHU_BHAI_MODEL, temperature: 0.4, ...body }),
    });
  } catch (error) {
    logger.error("Sahu Bhai LLM request failed", { error: String(error) });
    throw new AppError("Couldn't reach the Sahu Bhai LLM (network error).", 502, "LLM_UNREACHABLE");
  }

  if (res.status === 429 && attempt < MAX_RETRIES) {
    const waitMs = Math.min(
      parseResetHeader(res.headers.get("retry-after")) ??
        parseResetHeader(res.headers.get("x-ratelimit-reset-tokens")) ??
        3000,
      9000,
    );
    logger.warn("Sahu Bhai LLM 429 — retrying", { attempt, waitMs });
    await sleep(waitMs + 250);
    return post(body, attempt + 1);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    logger.error("Sahu Bhai LLM error response", { status: res.status, body: text.slice(0, 500) });
    if (res.status === 429) {
      throw new RateLimitedError(
        "Sahu Bhai is busy right now (free-tier per-minute limit). Wait ~15–20 seconds and try again, or send a shorter message.",
      );
    }
    throw new AppError(
      `LLM provider returned an error (${res.status}). ${text.slice(0, 200)}`.trim(),
      502,
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
