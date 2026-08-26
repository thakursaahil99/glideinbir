# Glideinbir — Platform Architecture

Paragliding, Paragliding School & Hotel booking platform. One Next.js app, one
Node/TypeScript backend layer (API routes + server actions), one PostgreSQL
database, one Prisma schema, one central admin panel.

This document is the deliverable requested before any implementation begins:
architecture, feature breakdown, ER relationships, Prisma schema reference,
folder structure, API design, auth architecture, booking flow, payment flow,
and admin architecture. Implementation proceeds only after this is agreed,
in the phases listed at the end.

---

## 1. Complete Architecture

```
                         ┌─────────────────────────┐
                         │        Browser           │
                         │  Customer site / Admin   │
                         └────────────┬─────────────┘
                                      │ HTTPS
                         ┌────────────▼─────────────┐
                         │        Next.js App         │
                         │  App Router (RSC + SSR/SSG) │
                         │                             │
                         │  /app/(site)      customer  │
                         │  /app/(account)   customer   │
                         │  /app/admin       admin      │
                         │  /app/api/*       API routes │
                         └────────────┬─────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
   ┌──────────▼─────────┐  ┌──────────▼─────────┐  ┌──────────▼─────────┐
   │   Service layer      │  │   Auth layer         │  │  Payment layer       │
   │ (modules/*/services) │  │ session, RBAC guards  │  │ Razorpay orders,     │
   │ booking, pricing,    │  │ password hashing      │  │ verification,        │
   │ availability          │  │                       │  │ webhooks             │
   └──────────┬─────────┘  └──────────┬─────────┘  └──────────┬─────────┘
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      │
                         ┌────────────▼─────────────┐
                         │   Prisma Client (typed)    │
                         └────────────┬─────────────┘
                                      │
                         ┌────────────▼─────────────┐
                         │   PostgreSQL (single DB)   │
                         └───────────────────────────┘

   External services (all called only from the server, never the browser):
   - Razorpay (orders, payment verification, webhooks, refunds)
   - Cloud object storage (Cloudinary or S3-compatible) for images/video
   - SMTP/email provider (Resend/SES) for transactional email
   - Future: WhatsApp Business API / SMS gateway, behind the same
     Notification service interface
```

**Key architectural decisions**

| Decision | Choice | Why |
|---|---|---|
| Backend location | Next.js Route Handlers + Server Actions, organized as a modular service layer under `src/server/` | Avoids running two deployments; still fully separates business logic from UI — routes/actions are thin, all logic lives in `services/` |
| Auth | Custom credential auth: bcrypt password hashing, DB-backed sessions (opaque token in httpOnly cookie, hashed in DB), no third-party auth SaaS | Full control over RBAC and session revocation; avoids coupling core booking security to a fast-moving external auth library |
| Booking model | ONE `Booking` table with typed line-item tables (`BookingItemParagliding`, `BookingItemSchool`, `BookingItemHotel`) | Single booking/payment/status lifecycle for every business line, per section 6/25 requirement, while keeping each item type's fields strongly typed instead of one wide nullable-column table |
| Availability | Explicit counters (`bookedSeats`, `bookedRooms`) mutated only inside a DB transaction with a row lock, never derived purely from counting bookings at read time | Correctness under concurrency (section 7) with fast reads |
| Money | `Decimal(10,2)` everywhere, never float | Avoids rounding errors in prices/refunds |
| Storage | Cloud object storage (Cloudinary/S3), DB stores only URLs | Matches requirement in section "Storage"; keeps Postgres small and fast |
| Admin | Same Next.js app, `/admin` route group, same DB, gated by `UserRole` | Section 11 mandates exactly one central admin panel |

---

## 2. Feature Breakdown

**Paragliding module** — categories, packages, media, slots (date+time+capacity),
availability, bookings, reviews, FAQs. Admin: full CRUD + slot management.

**School module** — courses, instructors, training batches (course + instructor +
schedule + capacity), availability, bookings, reviews, FAQs. Admin: full CRUD
for courses/instructors/batches.

**Hotel module** — hotels, amenities, rooms, per-date room availability,
bookings by date range, reviews, FAQs. Admin: full CRUD for hotels/rooms,
inventory management.

**Booking module (central)** — one `Booking` aggregate per checkout, supporting
paragliding-only, school-only, hotel-only, or any combination in a single
booking; status lifecycle shared across all types.

**Payment module** — Razorpay order creation, checkout, server-side
verification, webhook processing (idempotent), refunds, payment history.

**Coupon module** — server-validated discount codes with usage limits.

**Review module** — booking-gated reviews (only for `COMPLETED` bookings),
admin moderation (approve/hide/delete).

**Notification module** — channel-abstracted notification service; email
implemented first, WhatsApp/SMS/push are additional channel implementations
behind the same interface.

**CMS module** — homepage content, banners, gallery, FAQs, policy pages,
site-wide settings (tax/service fee, business info).

**Admin module** — one dashboard covering all of the above, RBAC-gated by
`UserRole`.

**Customer account module** — profile, all bookings across all types, payment
status/receipts, cancellation/refund status, reviews.

---

## 3. Database / ER Relationship Explanation

Full schema: [`prisma/schema.prisma`](prisma/schema.prisma). Summary of how
the pieces connect:

```
User ─┬──< Booking >─┬──< BookingItemParagliding >── ParaglidingSlot ── ParaglidingPackage ── ParaglidingCategory
      │               │
      │               ├──< BookingItemSchool >── TrainingBatch ── SchoolCourse
      │               │                                  └── Instructor
      │               │
      │               ├──< BookingItemHotel >── Room ── Hotel
      │               │
      │               ├──< Payment >──< Refund
      │               ├── Coupon  (nullable, applied discount)
      │               └──< Review >── (target: package | course | hotel)
      │
      ├──< Session
      ├──< PasswordResetToken
      ├──< Notification
      └──< AuditLog (as actor, when User is an admin)
```

**Why this shape:**

- `Booking` is the single hub: every payment, coupon usage, and review hangs
  off it, and its `status`/`type` fields are the one place booking state
  lives — there is no separate "school booking" or "hotel booking" table with
  its own status machine (explicitly disallowed in section 6).
- `BookingItem*` tables are deliberately per-type rather than one polymorphic
  table with a dozen nullable columns. A combined booking (e.g. package +
  hotel) is simply one `Booking` row with one `BookingItemParagliding` row and
  one `BookingItemHotel` row. Adding a future item type (e.g.
  `BookingItemAddon` for photography/camping) means adding one new table and
  one new relation on `Booking` — nothing else changes.
- Availability is owned by the entity being booked (`ParaglidingSlot.bookedSeats`,
  `TrainingBatch.bookedSeats`, `RoomAvailability.bookedRooms`), not computed
  by aggregating bookings at read time, so a single row lock during checkout
  is sufficient to prevent overselling (section 7).
- `Payment` belongs to `Booking` (not to a `BookingItem`) because Razorpay
  charges once per checkout even when the checkout mixes item types.
  `Refund` belongs to `Payment` since a booking can, in principle, be
  partially refunded across multiple refund events.
- `WebhookEvent` exists purely for idempotency: Razorpay's `event.id` is
  unique-constrained, so a redelivered webhook is detected and skipped before
  any business logic runs.
- `Review` references `Booking` and is unique per `(bookingId, targetType)` —
  this is what prevents unverified/fake reviews: a review can only be created
  through a server action that first checks the booking belongs to the
  requesting user, contains that target, and is `COMPLETED`.
- `Permission` / `UserPermission` sit alongside the simple `UserRole` enum.
  Phase 1–7 authorization checks only need the enum (fast, simple, matches
  "initially create a Super Admin" in section 13). The permission tables exist
  so that later, finer-grained roles can be composed without a schema change.

---

## 4. Prisma Schema

See [`prisma/schema.prisma`](prisma/schema.prisma) — the full, real schema
(not pseudo-code), covering every model in section 14 plus the additions
explained above. Two things intentionally deferred to a follow-up raw-SQL
migration rather than the schema DSL:

1. `CHECK (bookedSeats <= capacity)` / `CHECK (bookedRooms <= totalRooms)` —
   Prisma's schema language has no native CHECK-constraint syntax; these are
   added as a hand-written SQL migration in Phase 2, as a defense-in-depth
   backstop behind the transactional locking (which is the real guarantee).
2. A partial unique index for "at most one active coupon usage per user per
   coupon when `perUserLimit = 1`" — enforced in the service layer plus a
   simple composite unique for the common case (`@@unique([couponId, bookingId])`
   already in the schema); stricter per-user-limit enforcement is
   application-level since limits are configurable per coupon.

---

## 5. Folder Structure

```
glideinbir/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
├── src/
│   ├── app/
│   │   ├── (site)/                     # customer-facing, SSR/SSG
│   │   │   ├── page.tsx                # home
│   │   │   ├── paragliding/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── school/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── hotels/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── booking/[bookingId]/page.tsx
│   │   │   ├── about/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── faq/page.tsx
│   │   │   └── (legal)/terms|privacy|cancellation-policy/page.tsx
│   │   ├── (account)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   ├── reset-password/page.tsx
│   │   │   └── account/
│   │   │       ├── page.tsx            # profile
│   │   │       ├── bookings/page.tsx
│   │   │       └── bookings/[id]/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx              # RBAC guard + shell
│   │   │   ├── page.tsx                # dashboard
│   │   │   ├── paragliding/{packages,categories,slots,bookings}/
│   │   │   ├── school/{courses,instructors,batches,bookings}/
│   │   │   ├── hotels/{list,rooms,availability,bookings}/
│   │   │   ├── bookings/
│   │   │   ├── customers/
│   │   │   ├── payments/
│   │   │   ├── marketing/coupons/
│   │   │   ├── reviews/
│   │   │   ├── content/{homepage,about,faq,banners,gallery,policies}/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── api/
│   │   │   ├── auth/{login,register,logout,forgot-password,reset-password}/route.ts
│   │   │   ├── paragliding/{packages,slots}/route.ts
│   │   │   ├── school/{courses,batches}/route.ts
│   │   │   ├── hotels/{list,rooms,availability}/route.ts
│   │   │   ├── bookings/route.ts
│   │   │   ├── payments/
│   │   │   │   ├── create-order/route.ts
│   │   │   │   ├── verify/route.ts
│   │   │   │   └── webhook/route.ts
│   │   │   ├── coupons/validate/route.ts
│   │   │   ├── reviews/route.ts
│   │   │   └── admin/**/route.ts       # admin CRUD endpoints, RBAC-guarded
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── server/
│   │   ├── modules/
│   │   │   ├── paragliding/{service.ts, repository.ts, validation.ts}
│   │   │   ├── school/{service.ts, repository.ts, validation.ts}
│   │   │   ├── hotel/{service.ts, repository.ts, validation.ts}
│   │   │   ├── booking/{service.ts, pricing.ts, availability.ts, validation.ts}
│   │   │   ├── payment/{razorpay.ts, service.ts, webhook-handlers.ts}
│   │   │   ├── coupon/{service.ts, validation.ts}
│   │   │   ├── review/{service.ts, validation.ts}
│   │   │   ├── notification/{service.ts, channels/email.ts, channels/whatsapp.ts (stub)}
│   │   │   └── content/{service.ts}
│   │   ├── auth/{session.ts, password.ts, rbac.ts, guards.ts}
│   │   ├── db/{prisma.ts}
│   │   ├── storage/{cloud-storage.ts}
│   │   └── lib/{logger.ts, errors.ts, api-response.ts}
│   ├── components/
│   │   ├── ui/                         # design-system primitives
│   │   ├── site/                       # customer-facing composed components
│   │   └── admin/                      # admin-facing composed components
│   ├── lib/                            # shared, framework-agnostic utilities
│   ├── types/
│   └── config/                         # site config, nav, constants
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

Rule enforced throughout: **UI components never call Prisma or Razorpay
directly.** Pages/route handlers call `server/modules/*/service.ts`; services
call `repository.ts` (Prisma) and other services. This is what keeps business
logic out of UI components (section 26).

---

## 6. API Route Design

All mutating routes validate input with Zod, require the session cookie where
applicable, and return a consistent `{ success, data | error }` envelope.

**Public (customer-facing)**
```
GET  /api/paragliding/packages            list + filter
GET  /api/paragliding/packages/[slug]     detail
GET  /api/paragliding/packages/[id]/slots?date=  availability for a date
GET  /api/school/courses
GET  /api/school/courses/[slug]
GET  /api/school/courses/[id]/batches     available batches
GET  /api/hotels
GET  /api/hotels/[slug]
GET  /api/hotels/rooms/[id]/availability?checkIn=&checkOut=
POST /api/coupons/validate                { code, subtotal } → server-checked discount
POST /api/reviews                          (auth required, booking-gated)
```

**Auth**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

**Booking & payment (the centralized flow, section 6/8)**
```
POST /api/bookings                 create a PENDING booking (server computes price)
GET  /api/bookings/[id]            fetch booking (owner or admin)
POST /api/payments/create-order    creates Razorpay order for a booking
POST /api/payments/verify          verifies signature, confirms booking + decrements availability
POST /api/payments/webhook         Razorpay webhook, idempotent, source of truth for final state
```

**Customer account**
```
GET  /api/account/bookings
GET  /api/account/bookings/[id]
```

**Admin** (all under `/api/admin/**`, every handler wrapped by an RBAC guard
that checks `UserRole` — and in future, `UserPermission` — before touching
the DB)
```
/api/admin/paragliding/{categories,packages,slots}         CRUD
/api/admin/school/{courses,instructors,batches}             CRUD
/api/admin/hotels/{hotels,rooms,availability}                CRUD
/api/admin/bookings                                          list/filter/cancel/reschedule/refund
/api/admin/customers                                          list/detail
/api/admin/payments                                            list/detail
/api/admin/coupons                                              CRUD
/api/admin/reviews                                              moderate
/api/admin/content/{pages,faq,media,settings}                CRUD
/api/admin/reports/{revenue,bookings,packages,courses,hotels}  read
```

---

## 7. Authentication Architecture

- Registration: email + password, `bcrypt` hash (cost 12), row created with
  `role = CUSTOMER`.
- Login: verify hash, create a `Session` row (`tokenHash` = SHA-256 of a
  random 32-byte token), set the raw token in an **httpOnly, Secure,
  SameSite=Lax** cookie. Only the hash is stored — a DB leak doesn't yield
  usable session tokens.
- Every request that needs identity looks up `Session` by the hashed cookie
  token, checks `expiresAt`, and loads the `User`. Expired/missing session ⇒
  401.
- Logout deletes the `Session` row (server-side revocation — not just cookie
  clearing).
- Forgot/reset password: `PasswordResetToken` with a hashed, single-use,
  short-TTL (e.g. 30 min) token emailed as a link; consuming it hashes the
  new password and deletes all existing sessions for that user.
- Authorization: a `requireRole(...allowed: UserRole[])` guard wraps every
  admin route handler and every admin server component's data loader.
  `SUPER_ADMIN` passes every check. Sensitive admin actions (refunds,
  cancellations, content publish, settings changes) also write an
  `AuditLog` row with actor, before/after values, and IP.
- Passwords, session tokens, and reset tokens are never logged.

---

## 8. Booking Flow

```
1. Customer configures a booking on the site:
   - Paragliding: package + slot (date/time) + passenger count
   - School: course + batch + student count
   - Hotel: hotel + room + check-in/out + room count + guests
   - Any subset of the above combined in one checkout

2. POST /api/bookings
   - Server re-fetches package/slot/batch/room/course prices from the DB
     (frontend-sent prices are ignored entirely)
   - Server validates availability WITHOUT locking yet (fast pre-check, for
     a clear error message) — real enforcement happens at step 4
   - Server computes subtotal, applies coupon if provided (validated
     server-side against Coupon rules), computes tax/fees from SiteSetting
   - Creates Booking (status PENDING) + its BookingItem* rows in one
     Prisma transaction
   - Returns bookingId + totalAmount

3. POST /api/payments/create-order
   - Creates a Razorpay order for booking.totalAmount (paise), stores it as
     a Payment row (status CREATED) keyed by razorpayOrderId
   - Returns Razorpay order id + key to the client for Checkout

4. Customer completes Razorpay Checkout (client-side widget only handles
   presenting the payment form — no pricing logic lives there)

5. POST /api/payments/verify (also mirrored by the webhook, step 6)
   - Verifies the Razorpay signature server-side (HMAC with key secret)
   - Inside a SERIALIZABLE DB transaction:
     a. Row-lock the relevant ParaglidingSlot / TrainingBatch / each
        RoomAvailability date row (SELECT ... FOR UPDATE, dates in ORDER BY
        to avoid deadlocks)
     b. Re-check bookedSeats/bookedRooms + requested qty <= capacity
     c. If capacity exceeded (lost the race): mark Payment FAILED, mark
        Booking FAILED, flag for refund, return an error — the customer is
        never charged for a seat that doesn't exist (Razorpay capture only
        happens after this check passes, using authorize-then-capture)
     d. Otherwise: increment the locked counters, set Booking CONFIRMED,
        set Payment SUCCESS
   - Triggers confirmation email via the Notification service

6. POST /api/payments/webhook (Razorpay → server)
   - Looks up WebhookEvent by razorpayEventId; if it already exists and is
     processed, return 200 immediately (idempotent — handles Razorpay's
     at-least-once redelivery)
   - Otherwise runs the same verification/confirmation logic as step 5
     (step 5 and the webhook both call the same service function, so
     whichever arrives first wins and the second is a no-op against an
     already-CONFIRMED booking)

7. Customer sees booking confirmation; it appears in Account → My Bookings.
```

This is the same flow regardless of `BookingType` — `PARAGLIDING`, `SCHOOL`,
`HOTEL`, or `COMBINED` all go through one `bookings` → `create-order` →
`verify`/`webhook` pipeline, satisfying the "one centralized booking system"
requirement. Only the availability-locking step (5a) branches per item type
present on the booking.

---

## 9. Payment Flow (Razorpay detail)

- **Server-only secrets**: `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET`
  exist only in server environment variables, never sent to the client. The
  client only ever sees `RAZORPAY_KEY_ID`.
- **Amount authority**: the amount passed to `razorpay.orders.create()` is
  always `booking.totalAmount` read back from the DB inside the same request,
  never a value received from the client.
- **Signature verification**: both the `/verify` endpoint and the webhook
  compute `hmac_sha256(order_id + "|" + payment_id, key_secret)` and compare
  against Razorpay's signature — a mismatch is treated as a failed payment,
  logged, and never confirms a booking.
- **Idempotency**: `WebhookEvent.razorpayEventId` is unique; `Payment.status`
  transitions are guarded (`CREATED → PENDING → SUCCESS|FAILED`, no other
  transition allowed) so a duplicate event can't double-confirm or
  double-decrement availability.
- **Failed/pending**: a Razorpay `payment.failed` event sets `Payment.status
  = FAILED` and `Booking.status = FAILED`; the seat/room/slot lock is never
  incremented for a failed payment. A `payment.authorized`-but-not-captured
  state maps to `Payment.status = PENDING`.
- **Refunds**: admin-initiated from the booking's admin detail page → creates
  a `Refund` row (`INITIATED`), calls `razorpay.payments.refund()`, and the
  `refund.processed`/`refund.failed` webhook updates it to `PROCESSED` or
  `FAILED`; `Booking.status` moves to `REFUND_PENDING` then `REFUNDED`.
  Availability counters are decremented back on a processed refund tied to a
  cancellation.
- No card, UPI, or bank data ever touches Glideinbir's server or database —
  only Razorpay identifiers and status.

---

## 10. Admin Architecture

- Single Next.js route group, `src/app/admin/**`, sharing the same deployment,
  database, and Prisma client as the customer site — not a separate app.
- `admin/layout.tsx` is the one gate: it loads the session, calls
  `requireRole([...])`, and renders the sidebar/topbar shell from section 12;
  every page under it is already guaranteed authenticated + authorized before
  rendering.
- Every admin data-mutating route handler under `/api/admin/**` re-applies
  the same `requireRole` guard server-side (never trusts the UI having hidden
  a button) and writes an `AuditLog` entry for sensitive actions (refund,
  cancel, reschedule, publish content, change settings, change pricing).
- Because every module (paragliding, school, hotels, bookings, payments,
  content) reads/writes the same Prisma models used by the customer site,
  there is structurally no way to end up with disconnected per-section admin
  panels — the requirement in section 11.
- Roles today: `SUPER_ADMIN` (full access) plus the six functional roles from
  section 13, already defined in the `UserRole` enum. `requireRole` calls are
  written per-route against the roles that should reasonably manage that
  resource (e.g. `/api/admin/hotels/**` → `SUPER_ADMIN | HOTEL_MANAGER`), so
  adding a new role later is a matter of updating the allow-list, not
  restructuring anything.

---

## Implementation Phases

Matches section 27. Each phase ships working, reviewable code — not the
whole project at once.

1. Project setup — Next.js, TypeScript, Tailwind, Postgres connection, env config
2. Database schema, migrations, authentication, roles
3. Paragliding module (packages, slots, availability, booking)
4. School module (courses, instructors, batches, availability, booking)
5. Hotel module (hotels, rooms, availability, booking)
6. Centralized checkout, combined bookings, Razorpay integration, verification, webhooks
7. Central admin panel — dashboard + all management modules
8. Customer dashboard, reviews, coupons, notifications
9. SEO, security hardening, performance, testing, production deployment

---

**Next step:** confirm this architecture (or flag anything to change), and
I'll start Phase 1.
