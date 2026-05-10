# Craftly AI

AI-powered workspace for freelancers and small agencies — CRM, documents, time, and client workflows in one place. **Phase 1** focuses on auth, dashboard shell, CRM, and time tracking.

Full product context, stack decisions, phases, and coding rules live in **[`CLAUDE.md`](./CLAUDE.md)**.

## Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript  
- **UI:** Tailwind CSS 4, shadcn/ui (Base preset)  
- **Backend:** Supabase (Postgres, Auth, Edge Functions)  
- **Package manager:** npm (`package-lock.json`)

## Prerequisites

- **Node.js** 20+ recommended  
- A **Supabase** project ([supabase.com](https://supabase.com)) for local development

## Getting started

```bash
git clone https://github.com/JunaidParamberi/craftlyai-v2.git
cd craftlyai-v2
npm install
```

### Environment variables

```bash
cp .env.example .env
```

Edit **`.env`** (gitignored — never commit secrets):

- `NEXT_PUBLIC_SUPABASE_URL` — Project URL from Supabase → Settings → API  
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Publishable key (`sb_publishable_…`), or use legacy anon JWT via `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional: `NEXT_PUBLIC_APP_URL` (e.g. `http://localhost:3000`).

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Development server       |
| `npm run build`| Production build         |
| `npm run start`| Serve production build   |
| `npm run lint` | ESLint (Next.js config)  |

### Check Supabase connectivity

With the dev server running:

```bash
curl -s http://localhost:3000/api/health/supabase
```

A JSON response with `"ok": true` means PostgREST accepted your URL and API key.

## Git workflow

- Default branch: **`main`**  
- Commit **without** `.env`; only **`.env.example`** stays in the repo with placeholders.  
- Typical flow: small commits per feature → `git push origin main`, or use a branch + PR for larger work.

```bash
git status          # confirm .env is not staged
git add -A
git commit -m "feat: describe change"
git push origin main
```

## Documentation

| File | Purpose |
|------|---------|
| [`CLAUDE.md`](./CLAUDE.md) | Roadmap, phases, conventions, feature checklist |
| [`.env.example`](./.env.example) | Safe env template |

## License

Private / all rights reserved unless stated otherwise by the authors.
