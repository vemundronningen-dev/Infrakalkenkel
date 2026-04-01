# XML to Pricing Sheet SaaS (MVP)

Production-ready MVP built with **Next.js App Router + TypeScript**, **Supabase Auth/Postgres/Storage**, **Tailwind CSS**, and designed for deployment on **Vercel**.

## Features

- Magic-link login with Supabase Auth
- Dashboard listing current user's saved estimates
- XML upload flow storing original source file in Supabase Storage
- NS3459-like XML parser into normalized estimate items
- Postgres persistence of `estimates` and `estimate_items`
- Editable pricing sheet table with autosave for `unit_price` + `comment`
- Recalculated line totals and estimate total
- RLS + storage policies so users only see their own data

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- xml2js

## Project Structure

- `src/app/login` – login page
- `src/app/dashboard` – estimate list
- `src/app/estimate/new` – upload and parse XML
- `src/app/estimate/[id]` – editable pricing sheet
- `src/app/api/upload-xml` – upload + parse + insert DB rows
- `src/app/api/estimate-items/[id]` – autosave item updates
- `src/lib/xml-parser.ts` – NS3459-like XML mapping logic
- `supabase/migrations` – schema, RLS, and storage policies

## XML Mapping

Mapped fields:

- `ProsjektNS/Navn` -> `project_name`
- `ProsjektNS/Valuta` -> `currency`
- `Post/Postnr` -> `postnr`
- `Post/Kode/ID` -> `code`
- `Post/Kode/Kodetekst/Overskrift` -> `title`
- `Post/Prisinfo/Enhet` -> `unit`
- `Post/Prisinfo/Mengde` -> `quantity`

Description composition (joined with newline):

- `Overskrift`
- `Stikkordvalg`
- `Matrisevalg`
- `AndreKravJa`
- `AndreKravNei`
- `Uformatert`

RTF is intentionally ignored in v1.

## Setup

1. Create Supabase project.
2. Run migration SQL from `supabase/migrations/20260401152000_init.sql`.
3. Copy `.env.example` to `.env.local` and fill values:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (optional for future admin tasks)
4. Install dependencies and run:

```bash
npm install
npm run dev
```

## Deploy (Vercel)

1. Push to GitHub repository.
2. Import project in Vercel.
3. Set environment variables from `.env.example`.
4. Deploy.

## Notes

- Middleware protects routes and redirects unauthenticated users to `/login`.
- Autosave uses `PATCH /api/estimate-items/:id`.
- `recalculate_estimate_total` SQL function keeps estimate totals synchronized.
