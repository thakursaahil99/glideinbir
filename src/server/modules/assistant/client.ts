import { env } from "@/config/env";
import { logger } from "@/server/lib/logger";
import { AppError, ServiceUnavailableError } from "@/server/lib/errors";

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

export async function chatCompletion(params: {
  messages: ChatMessage[];
  tools?: ChatTool[];
}): Promise<AssistantReply> {
  if (!env.SAHU_BHAI_API_KEY) {
    throw new ServiceUnavailableError(
      "Sahu Bhai isn't set up yet — an LLM API key is needed. Set SAHU_BHAI_API_KEY in .env (see SAHU_BHAI.md).",
    );
  }

  const url = `${env.SAHU_BHAI_BASE_URL.replace(/\/+$/, "")}/chat/completions`;
  const payload: Record<string, unknown> = {
    model: env.SAHU_BHAI_MODEL,
    temperature: 0,
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

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    logger.error("Sahu Bhai LLM error response", { status: res.status, body: text.slice(0, 500) });
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
