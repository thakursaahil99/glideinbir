# Sahu Bhai — admin AI assistant

Sahu Bhai is a chat assistant inside `/admin`. You type instructions in plain
language (Hindi / Hinglish / English) and it performs the admin work for you by
calling the same `/api/admin/**` REST API the admin screens use.

## How it works

- A floating **Sahu Bhai** button sits at the bottom-right of every admin page.
- It has **one tool**: `admin_api(method, path, body?)`. Every call runs as the
  **signed-in admin's own session**, so role permissions, zod validation and the
  audit log all apply exactly as they do for the normal UI.
- Replies in **English by default**; only switches to Hindi/Hinglish if you explicitly ask.
- Two modes (toggle in the panel header):
  - **Read-only** — only `GET`; it explains what it *would* change.
  - **Make changes** (act) — it can `POST` / `PATCH` / `DELETE`.
- Deletes are recorded in the audit log and can be restored from
  **Deleted data** (`/admin/audit`, Super Admin).

## Safety

- Path allowlist: only `/api/admin/**`, never `/api/admin/assistant` itself.
- Method whitelist; read-only mode blocks all writes.
- Per-user rate limit (20 requests/min) and an 8-step cap per message.
- The LLM API key is server-only and never sent to the browser.
- A manager role only succeeds on endpoints their role allows — others return
  the API's own 403, which Sahu Bhai relays.

## Setup

The feature is **disabled until `SAHU_BHAI_API_KEY` is set**. It works with any
OpenAI-compatible chat-completions provider — pick one with a free tier:

| Provider | `SAHU_BHAI_BASE_URL` | `SAHU_BHAI_MODEL` | Get a key |
|---|---|---|---|
| Groq (default) | `https://api.groq.com/openai/v1` | `openai/gpt-oss-120b` (or `qwen/qwen3.8-27b`) | console.groq.com |
| Google Gemini | `https://generativelanguage.googleapis.com/v1beta/openai/` | `gemini-2.0-flash` | aistudio.google.com |
| OpenRouter | `https://openrouter.ai/api/v1` | a `:free` model | openrouter.ai |
| Ollama (local, no key) | `http://localhost:11434/v1` | `qwen2.5:3b` | — (runs on your machine) |

```bash
# .env
SAHU_BHAI_API_KEY="your-provider-key"   # any non-empty string for Ollama
SAHU_BHAI_BASE_URL="https://api.groq.com/openai/v1"
SAHU_BHAI_MODEL="openai/gpt-oss-120b"
```

Restart `next dev` after changing env vars. The model must support tool /
function calling. Groq model ids change over time — check
`GET https://api.groq.com/openai/v1/models` if one stops working.

**Production (Vercel):** set the same three vars in Project → Settings →
Environment Variables (Production), then redeploy.

## Files

| Path | Role |
|---|---|
| `src/components/admin/sahu-bhai.tsx` | Floating chat panel (client) |
| `src/app/api/admin/assistant/route.ts` | `POST` endpoint, RBAC + rate limit |
| `src/server/modules/assistant/agent.ts` | Tool-call loop |
| `src/server/modules/assistant/client.ts` | OpenAI-compatible LLM call (no SDK) |
| `src/server/modules/assistant/tools.ts` | The `admin_api` tool executor |
| `src/server/modules/assistant/authorize.ts` | Path / method / mode guardrails |
| `src/server/modules/assistant/catalogue.ts` | System prompt + API reference |
| `src/lib/admin-roles.ts` | Shared list of admin roles |
