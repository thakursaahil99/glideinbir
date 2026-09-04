import type { User } from "@prisma/client";
import { logger } from "@/server/lib/logger";
import { chatCompletion, type ChatMessage } from "./client";
import { buildSystemPrompt, buildPublicSystemPrompt } from "./catalogue";
import { ADMIN_API_TOOL, executeAdminApi, type ActionLog } from "./tools";
import type { AssistantMode } from "./authorize";

const MAX_ITERATIONS = 8;

export type ClientMessage = { role: "user" | "assistant"; content: string };

export type SahuBhaiResult = {
  reply: string;
  actions: ActionLog[];
  truncated: boolean;
};

export async function runSahuBhai(params: {
  history: ClientMessage[];
  // "admin" gives the admin_api tool (SUPER_ADMIN only); "none" is a plain
  // chat assistant (other admins + the whole public site).
  tools: "admin" | "none";
  mode: AssistantMode;
  origin: string;
  cookie: string;
  user: Pick<User, "name" | "role"> | null;
}): Promise<SahuBhaiResult> {
  const systemPrompt =
    params.tools === "admin" && params.user
      ? buildSystemPrompt({ mode: params.mode, user: params.user })
      : buildPublicSystemPrompt();

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...params.history.map((m): ChatMessage => ({ role: m.role, content: m.content })),
  ];

  // No tools — one straight completion.
  if (params.tools === "none") {
    const message = await chatCompletion({ messages });
    return {
      reply: message.content?.trim() || "(No response — please try again.)",
      actions: [],
      truncated: false,
    };
  }

  const actions: ActionLog[] = [];
  let priorResults = "";

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const message = await chatCompletion({ messages, tools: [ADMIN_API_TOOL] });
    messages.push({
      role: "assistant",
      content: message.content ?? null,
      tool_calls: message.tool_calls,
    });

    if (!message.tool_calls || message.tool_calls.length === 0) {
      return {
        reply: message.content?.trim() || "(No response — please try again.)",
        actions,
        truncated: false,
      };
    }

    for (const call of message.tool_calls) {
      let parsedArgs: unknown = {};
      try {
        parsedArgs = JSON.parse(call.function.arguments || "{}");
      } catch {
        parsedArgs = {};
      }

      if (call.function.name !== "admin_api") {
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify({ error: `Unknown tool "${call.function.name}".` }),
        });
        continue;
      }

      const { result, action } = await executeAdminApi({
        raw: parsedArgs,
        mode: params.mode,
        origin: params.origin,
        cookie: params.cookie,
        priorResults,
      });
      if (action) actions.push(action);
      priorResults += result;
      messages.push({ role: "tool", tool_call_id: call.id, content: result });
    }
  }

  // Hit the iteration cap — ask for a plain-text wrap-up with no more tools.
  logger.warn("Sahu Bhai hit iteration cap", { actions: actions.length });
  const summary = await chatCompletion({
    messages: [
      ...messages,
      {
        role: "user",
        content:
          "Do not make any more tool calls. Give the user a plain summary of what happened so far — what is done and what is still pending.",
      },
    ],
  });

  return {
    reply:
      summary.content?.trim() ||
      "Couldn't finish (too many steps). Please break the request into smaller parts and try again.",
    actions,
    truncated: true,
  };
}
