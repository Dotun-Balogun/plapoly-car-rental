# Motoria: Car Rental Management System

A complete web-based car rental system built from the Chapter 3 design: customers search, reserve and pay; administrators manage the fleet, reservations, payments and reports.

**Stack:** Next.js 16 (App Router) · TypeScript · Supabase (Postgres, Auth, Row Level Security) · shadcn/ui + Tailwind CSS 4 · pnpm

---

## Setup (about 10 minutes)

### 1. Install

```bash
pnpm install
cp .env.example .env.local
```

### 2. Fill in `.env.local`

Get the Supabase values from **Dashboard → Project Settings → API Keys**. Set your own bank details (they are shown to customers on the payment page).

### 3. Create the database with migrations

```bash
pnpm db:login                                   # opens the browser once
pnpm db:link --project-ref  imorolfdocvlxflhidyr      # the id in your Supabase URL
pnpm db:push                                    # applies everything in supabase/migrations
```

This creates the tables, security rules, booking functions, and a sample fleet of 9 vehicles.
(Delete the samples later from **Admin → Vehicles**.)

### 4. Allow your site in Supabase Auth

**Dashboard → Authentication → URL Configuration**

- Site URL: `http://localhost:3000` (use your Vercel address in production)
- Redirect URLs: add `http://localhost:3000/auth/callback` and `https://YOUR-APP.vercel.app/auth/callback`

While testing you can switch off **Authentication → Sign In / Providers → Email → Confirm email** so new accounts can log in immediately.

### 5. Create the first admin

1. **Dashboard → Authentication → Users → Add user → Create new user** (tick *Auto Confirm User*).
2. Open `supabase/promote-admin.sql`, put that email in, and run it in **SQL Editor**:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Log in with that account and you land on `/admin`.

### 6. Run it

```bash
pnpm dev
```

### 7. Deploy to Vercel

Import the repo into Vercel, add the same variables from `.env.local` (set `NEXT_PUBLIC_SITE_URL` to your Vercel address), and deploy.

---

## How payment works

No payment gateway. After reserving, the customer sees your bank details, the exact amount and a payment reference (to use as the narration), with step-by-step help for **bank transfer** or **USSD**. The payment stays *Pending* until an admin checks the bank account and clicks **Mark as paid** (Admin → Payments, or the dashboard). That confirms the reservation automatically.

## Features

**Customers:** register and log in · search by pickup/return date and type (only free cars appear) · vehicle details · reserve with an automatic total · pay by transfer or USSD · view and cancel bookings.

**Administrators:** dashboard (counts, revenue, payments to verify) · add / edit / delete vehicles and set maintenance · customer list · reservations (confirm, hand over, mark returned, cancel) · payments (mark paid, failed, refunded) · reports with a monthly revenue chart, top vehicles, and CSV exports.

## How it maps to Chapter 3

| Chapter 3 | In this project |
| --- | --- |
| Customer, Administrator tables | `profiles` (linked to Supabase Auth, `role` = `customer` or `admin`) |
| Vehicle, Reservation, Payment tables | `vehicles`, `reservations`, `payments` |
| Three-tier architecture | Next.js UI → Server Actions / Route Handlers → Postgres |
| Prevent double bookings | A database exclusion constraint on overlapping dates |
| Role-based access | Row Level Security + `is_admin()` |

Prices are calculated **inside the database** (`book_vehicle`), so they cannot be tampered with from the browser.

## Useful commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start locally |
| `pnpm build` / `pnpm start` | Production build / run |
| `pnpm typecheck` | Check TypeScript |
| `pnpm db:push` | Apply new migrations to Supabase |
| `pnpm db:types` | Generate Supabase types (optional) |
| `pnpm dlx shadcn@latest add dialog` | Add more shadcn/ui components |

To change the database later, add a new file in `supabase/migrations/` (for example `supabase migration new add_something`) and run `pnpm db:push`. Never edit a migration that has already been pushed.

## Project layout

```
app/                 pages, server actions (app/actions), route handlers
  admin/             admin dashboard, vehicles, reservations, payments, reports
  vehicles/          search, vehicle details + booking form
  reservations/      my bookings + payment instructions
components/          shared UI; components/ui = shadcn/ui primitives
lib/                 Supabase clients, auth helpers, config, utils
proxy.ts             refreshes login sessions and protects private pages
supabase/migrations  the database (schema, functions, security, sample fleet)
```
