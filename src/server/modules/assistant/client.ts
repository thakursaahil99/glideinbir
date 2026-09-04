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

export async function chatCompletion(
  params: { messages: ChatMessage[]; tools?: ChatTool[] },
  attempt = 0,
): Promise<AssistantReply> {
  if (!env.SAHU_BHAI_API_KEY) {
    throw new ServiceUnavailableError(
      "Sahu Bhai isn't set up yet — an LLM API key is needed. Set SAHU_BHAI_API_KEY in .env (see SAHU_BHAI.md).",
    );
  }

  const url = `${env.SAHU_BHAI_BASE_URL.replace(/\/+$/, "")}/chat/completions`;
  const payload: Record<string, unknown> = {
    model: env.SAHU_BHAI_MODEL,
    temperature: 0.4,
    messages: params.messages,
  };
  if (params.tools && params.tools.length > 0) {
    payload.tools = params.tools;
    payload.tool_choice = "auto";
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.SAHU_BHAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    logger.error("Sahu Bhai LLM request failed", { error: String(error) });
    throw new AppError("Couldn't reach the Sahu Bhai LLM (network error).", 502, "LLM_UNREACHABLE");
  }

  // Rate limited (free tiers cap tokens-per-minute) — the bucket refills
  // continuously, so a short wait usually clears it. Retry a couple of times.
  if (res.status === 429 && attempt < MAX_RETRIES) {
    const waitMs = Math.min(
      parseResetHeader(res.headers.get("retry-after")) ??
        parseResetHeader(res.headers.get("x-ratelimit-reset-tokens")) ??
        3000,
      9000,
    );
    logger.warn("Sahu Bhai LLM 429 — retrying", { attempt, waitMs });
    await sleep(waitMs + 250);
    return chatCompletion(params, attempt + 1);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    logger.error("Sahu Bhai LLM error response", { status: res.status, body: text.slice(0, 500) });
    if (res.status === 429) {
      throw new RateLimitedError(
        "Sahu Bhai abhi busy hai (free-tier ka per-minute limit). ~15-20 second ruk ke phir bhejo, ya thoda chhota sawaal karo.",
      );
    }
    throw new AppError(
      `LLM provider returned an error (${res.status}). ${text.slice(0, 200)}`.trim(),
      502,
      "LLM_ERROR",
    );
  }

  const data = (await res.json().catch(() => null)) as {
    choices?: { message?: AssistantReply }[];
  } | null;
  const message = data?.choices?.[0]?.message;
  if (!message) {
    throw new AppError("The LLM returned an empty response.", 502, "LLM_EMPTY");
  }
  return message;
}
