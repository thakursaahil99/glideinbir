# Sahu Bhai — AI assistant

Sahu Bhai runs in two places:

| Surface | Endpoint | Powers |
|---|---|---|
| **Public site** widget (bottom-left) + installed app (`/sahu`, logged out) | `POST /api/sahu` | Free for **3 messages**, then asks for an email (no verification). Before the email: friendly but limited (no live data). After the email (or for a logged-in customer): **full general-purpose assistant** — coding, writing, planning, anything — plus the read-only `site_api` tool for live packages / prices / availability. Still no bookings or account data. |
| **Admin panel** (bottom-right) + `/sahu` (signed-in admin) | `POST /api/admin/assistant` | **SUPER_ADMIN**: full `admin_api` tool (create/edit/delete). Other admin roles: chat only. |

`/sahu` (the installable app's `start_url`) is **open to everyone** — a signed-in admin
gets the admin assistant, anyone else gets the public assistant, so the app is usable right
after "Add to Home Screen" with no login wall. **`/app`** is a shareable "get the app"
landing page (install button + QR + share link).

The public bot must never reveal the personal contact details of the owner / admins / staff —
enforced in the system prompt (`buildPublicSystemPrompt`).

Every conversation (public + admin) is stored and reviewable at **`/admin/sahu-chats`**
(Super Admin only) — grouped by email / user, full transcript, deletable.

## Admin assistant

- The floating **Sahu Bhai** button sits at the bottom-right of every admin page.
- For SUPER_ADMIN it has **one tool**: `admin_api(method, path, body?)`. Every call runs as the
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
| `src/components/admin/sahu-bhai-chat.tsx` | Shared transcript + composer (admin panel, `/sahu`, public widget) |
| `src/components/site/sahu-bhai-public.tsx` | Public-site widget wrapper |
| `src/app/sahu/{layout,page}.tsx` | Full-screen installable app — admin or public depending on who's signed in |
| `src/app/app/page.tsx` | Shareable "get the app" landing (install button, QR, share link) |
| `src/app/api/admin/assistant/route.ts` | `POST` endpoint, RBAC + rate limit |
| `src/app/api/sahu/route.ts` | Public `POST` endpoint — email gate, daily cap, `site_api` after email |
| `src/server/modules/assistant/store.ts` | Chat sessions, email gate (`FREE_MESSAGES`), transcript logging |
| `src/server/modules/assistant/agent.ts` | Tool-call loop |
| `src/server/modules/assistant/client.ts` | OpenAI-compatible LLM call (no SDK) |
| `src/server/modules/assistant/tools.ts` | The `admin_api` tool executor |
| `src/server/modules/assistant/authorize.ts` | Path / method / mode guardrails |
| `src/server/modules/assistant/catalogue.ts` | System prompt + API reference |
| `src/lib/admin-roles.ts` | Shared list of admin roles |
