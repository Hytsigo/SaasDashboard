# SaaS Dashboard MVP

A production-oriented multi-tenant SaaS dashboard starter built with Next.js + Supabase, focused on secure role-based access, real CRUD flows, and recruiter-friendly DX.

## What Problem This Solves

Most dashboard templates look good but skip the hard parts:

- multi-tenant data isolation,
- role-based permissions,
- secure server mutations,
- import/export workflows,
- onboarding for first-time users.

This project solves those with a practical architecture that can be shipped and extended.

## Demo

- Live demo: `https://your-demo-url.vercel.app`
- Demo video (optional): `https://loom.com/...`

## Demo Credentials

Use one of these options:

1. Self-signup (recommended)

- Create your own account from `/login` (email/password or Google).
- A workspace is auto-created for the new user.

2. Shared demo account (optional)

- Email: `demo@yourapp.com`
- Password: `********`

Note: If there is no data, the app prompts to generate 10 demo leads in one click.

## Architecture (Simple Diagram)

```text
Browser (Next.js App Router)
  |- UI (shadcn/ui + Tailwind)
  |- Client state/server-state (TanStack Query)
  |- Forms + validation (React Hook Form + Zod)
  `- Mutations (next-safe-action)
          |
          v
Next.js Server Routes / Server Actions
  |- Auth guards (organization + role)
  |- Role checks (owner/admin/member)
  `- Business services (leads, members, overview)
          |
          v
Supabase (Postgres + Auth + RLS)
  |- organizations
  |- memberships
  |- leads (soft delete)
  `- activity_logs
```

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript (strict)
- Tailwind CSS 4
- shadcn/ui
- React Hook Form + Zod
- TanStack Query
- next-safe-action
- Supabase (Auth + Postgres + RLS)
- Sentry (hook-ready)
- sonner
- lucide-react
- Husky + lint-staged + commitlint

## Core Features

- Email/password auth + Google OAuth
- Multi-tenant workspace model
- Owner/Admin/Member roles
- Leads module:
  - create/list/detail/update
  - soft delete
  - filtering/search/sorting/pagination
  - CSV import (upsert by email)
  - CSV export
- Overview dashboard:
  - KPI cards
  - pipeline status breakdown
  - recent activity
- One-click demo lead generation for new users

## Local Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Create `.env.local` from `.env.example` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=<project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

SENTRY_DSN=<server-dsn>
NEXT_PUBLIC_SENTRY_DSN=<browser-dsn>
```

### 3) Apply database SQL (Supabase SQL Editor)

Run in this order:

1. `supabase/migrations/20260223120000_init_multi_tenant.sql`
2. `supabase/migrations/20260223123000_auto_onboard_new_users.sql`
3. `supabase/migrations/20260224143000_harden_roles_rls.sql`

### 4) Run app

```bash
npm run dev
```

App URL: `http://localhost:3000`

## Quality Commands

```bash
npm run lint
npm run lint:fix
npm run typecheck
npm run format:check
npm run format
npm run build
```

## Technical Decisions (Why)

### Why TanStack Query?

- Centralized server-state cache
- Built-in retry and stale-time control
- Predictable invalidation after mutations
- Better UX than manual reloads

### Why RLS in Supabase?

- Security at the data layer, not just UI/API layer
- Strong tenant isolation by `organization_id`
- Prevents accidental cross-tenant leaks
- Interview-grade architecture signal

### Why next-safe-action?

- Typed server actions
- Schema-based input validation
- Cleaner mutation boundaries with explicit server logic

## Security Model

- All reads/writes scoped to organization membership
- Role model:
  - `owner`: can manage roles
  - `admin`: operational management
  - `member`: create/edit but cannot delete leads
- Leads use soft delete (`deleted_at`)
- Additional guardrails enforced in backend services and SQL policies

## Current Limitations

- `profiles` table is not fully implemented yet (member list currently shows user IDs)
- Members UI does not yet support invitation flow by email token
- No automated E2E tests yet
- Some SQL repair scripts are still manual fallback tools

## Next Steps

- Add `profiles` (`full_name` + avatar) and show emails/names in members screen
- Add invitation flow (email token)
- Add password recovery UI
- Add charts library for richer overview visuals
- Add automated test coverage (unit + e2e)
- Add CI pipeline checks and preview environment docs

# SaasDashboard
