import type { User } from "@prisma/client";
import { logger } from "@/server/lib/logger";
import { chatCompletion, type ChatMessage } from "./client";
import { buildSystemPrompt, buildPublicSystemPrompt } from "./catalogue";
import {
  ADMIN_API_TOOL,
  SITE_API_TOOL,
  executeAdminApi,
  executeSiteApi,
  type ActionLog,
} from "./tools";
import type { AssistantMode } from "./authorize";

export type ClientMessage = { role: "user" | "assistant"; content: string };
export type ReplyLang = "en" | "hi";
export type ToolMode = "admin" | "site" | "none";

export type SahuBhaiResult = {
  reply: string;
  actions: ActionLog[];
  truncated: boolean;
};

const MAX_ITERATIONS: Record<Exclude<ToolMode, "none">, number> = { admin: 8, site: 4 };

export async function runSahuBhai(params: {
  history: ClientMessage[];
  // "admin" → admin_api tool (SUPER_ADMIN only); "site" → read-only public
  // data tool (public site); "none" → plain chat.
  tools: ToolMode;
  lang: ReplyLang;
  mode: AssistantMode;
  origin: string;
  cookie: string;
  user: Pick<User, "name" | "role"> | null;
}): Promise<SahuBhaiResult> {
  const systemPrompt =
    params.tools === "admin" && params.user
      ? buildSystemPrompt({ mode: params.mode, user: params.user, lang: params.lang })
      : buildPublicSystemPrompt(params.lang, params.tools === "site");

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...params.history.map((m): ChatMessage => ({ role: m.role, content: m.content })),
  ];

  if (params.tools === "none") {
    const message = await chatCompletion({ messages });
    return {
      reply: message.content?.trim() || "(No response — please try again.)",
      actions: [],
      truncated: false,
    };
  }

  const tool = params.tools === "admin" ? ADMIN_API_TOOL : SITE_API_TOOL;
  const toolName = tool.function.name;
  const maxIterations = MAX_ITERATIONS[params.tools];
  const actions: ActionLog[] = [];
  let priorResults = "";

  for (let i = 0; i < maxIterations; i++) {
    const message = await chatCompletion({ messages, tools: [tool] });
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

      if (call.function.name !== toolName) {
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify({ error: `Unknown tool "${call.function.name}".` }),
        });
        continue;
      }

      const { result, action } =
        params.tools === "admin"
          ? await executeAdminApi({
              raw: parsedArgs,
              mode: params.mode,
              origin: params.origin,
              cookie: params.cookie,
              priorResults,
            })
          : await executeSiteApi({ raw: parsedArgs, origin: params.origin });

      if (action) actions.push(action);
      priorResults += result;
      messages.push({ role: "tool", tool_call_id: call.id, content: result });
    }
  }

  // Hit the iteration cap — ask for a plain-text wrap-up with no more tools.
  logger.warn("Sahu Bhai hit iteration cap", { tools: params.tools, actions: actions.length });
  const summary = await chatCompletion({
    messages: [
      ...messages,
      {
        role: "user",
        content:
          "Do not make any more tool calls. Answer the user now with what you have — what you found, and anything still unknown.",
      },
    ],
  });

  return {
    reply:
      summary.content?.trim() ||
      "Couldn't finish that — please try asking in a simpler way.",
    actions,
    truncated: true,
  };
}
