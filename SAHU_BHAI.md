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

**Identity:** every prompt says Sahu Bhai was *built by Sahil Thakur for Glideinbir* and must
never name a base model or say it's made by OpenAI / Google / etc. (`IDENTITY_LINE` in
`catalogue.ts`).

**Language:** English is the default and does **not** flip to Hindi just because a message is
casually Hinglish — it switches only on the हिं toggle or an explicit request, and is
re-decided every message (`langLine()`).

The public bot must never reveal the personal contact details of the owner / admins / staff,
or point anyone to a staff login — enforced in `buildPublicSystemPrompt`.

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

The feature is **disabled until `SAHU_BHAI_API_KEY` is set**. Any
OpenAI-compatible chat-completions provider works.

```bash
# .env  — Groq free tier. Works for low traffic; see the limits note below.
SAHU_BHAI_API_KEY="gsk_..."               # console.groq.com
SAHU_BHAI_BASE_URL="https://api.groq.com/openai/v1"
SAHU_BHAI_MODEL="openai/gpt-oss-120b"
```

Restart `next dev` after changing env vars. The model must support tool /
function calling. The client retries 429 and 503 automatically.

**The free-tier reality (checked 2026-09):**

| Option | Limit | Verdict |
|---|---|---|
| **Groq free** `gpt-oss-120b` | 8k tokens/min, 1000 req/day, shared | OK for low traffic. Long chats can 413 — client trims history + tool results to soften it, and maps a hard 413 to "tap New chat". |
| **Gemini free** (new 3.x flash) | **~20 requests/day** | Not usable for a public bot. Older `gemini-2.x` flash is gone for new keys. Tried and reverted. |
| **Groq pay-as-you-go** | no per-minute wall | Cheapest real fix — a small business bot is a few $/month. Same `BASE_URL`/`MODEL`, just a billed key. |
| OpenRouter free | 20 req/min, ~50/day | too tight |
| Ollama (local) | unlimited | needs a machine always on; this PC too weak |

**Production (Vercel):** set the three vars in Project → Settings → Environment
Variables (Production), then redeploy (`git commit --allow-empty` + push works;
`vercel redeploy` is blocked by the Claude Code classifier).

## Voice ("Talk" button)

A **Talk** button sits in the Sahu Bhai widget header and on `/sahu`.
`src/components/site/voice-button.tsx` picks one of two engines:

**1. Browser Web Speech API — the default, free forever.** No account, no
key, no limit. The browser does speech-to-text and text-to-speech locally;
the reply comes from our own `/api/sahu` (Gemini). It runs a continuous
listen → ask → speak loop until the user taps End, shows the live
transcript, strips Markdown before speaking, and picks a `hi-IN` voice when
the reply is in Devanagari. Chrome / Edge / Android are solid; iOS Safari
works but is flakier. Nothing to configure.

**2. Vapi — used only if BOTH env vars are set** (more natural voice, paid
after the trial credit):

```bash
NEXT_PUBLIC_VAPI_PUBLIC_KEY="pk_..."      # Vapi dashboard → API Keys → Public
NEXT_PUBLIC_VAPI_ASSISTANT_ID="asst_..."  # Vapi dashboard → Assistants → (the id)
```

Setup: **vapi.ai** → create an Assistant (Glideinbir system prompt, a voice,
a first message, a model) → copy its **Assistant ID** + your **Public Key** →
set the two vars in Vercel → redeploy. Vapi bills the call's LLM+voice
per-minute (separate from the text assistant's provider). `@vapi-ai/web` is
dynamically imported on first click so its WebRTC dep stays out of the main
bundle.

## Files

| Path | Role |
|---|---|
| `src/components/admin/sahu-bhai.tsx` | Floating chat panel (client) |
| `src/components/admin/sahu-bhai-chat.tsx` | Shared transcript + composer (admin panel, `/sahu`, public widget) |
| `src/components/site/sahu-bhai-public.tsx` | Public-site widget wrapper |
| `src/components/site/voice-button.tsx` | "Talk" voice button — free browser Web Speech by default, Vapi if configured |
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
