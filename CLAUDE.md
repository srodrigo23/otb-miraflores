# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Management system for **OTB Miraflores**, a neighborhood water-service organization (Bolivia). It tracks neighbors (`vecinos`), their water meters, periodic meter-reading campaigns (`mediciones`/measures), and generates water-consumption debts from readings. It's a monorepo with a React SPA (`client/`) and a FastAPI backend (`service/`). Much of the domain (debts, payments, meetings, collections) is scaffolded but commented out — only **neighbors**, **measures/meter-readings**, and **auth** are wired up in `main.py` and `main.tsx`. Domain code and comments are largely in Spanish.

## Running the stack

From the repo root:

```bash
npm run dev      # runs backend + frontend concurrently (BACKEND blue, FRONTEND green)
npm run api      # backend only  → service/scripts/api.sh → uv run fastapi dev app/main.py (port 8000)
npm run web      # frontend only → cd client && pnpm run dev (Vite, port 5173)
```

Backend uses **uv** (Python ≥3.12); frontend uses **pnpm**. There is no test runner configured in either package — the `service/test/` dir and root `package.json` have no test scripts.

### Frontend (client/)

```bash
pnpm run dev      # Vite dev server
pnpm run build    # tsc -b && vite build  (type-check is part of the build)
pnpm run lint     # eslint .
pnpm run preview
```

### Backend (service/)

```bash
uv run fastapi dev app/main.py                          # dev, hot reload
uvicorn app.main:app --host 0.0.0.0 --port $PORT        # prod (see scripts/start_render.sh)
alembic upgrade head                                    # apply migrations
alembic revision --autogenerate -m "message"            # new migration (autogenerate picks up app.models via Base.metadata)
```

`scripts/start_render.sh` is the Render production entrypoint: `alembic upgrade head` then uvicorn.

## Environments & configuration

Environment is switched by an env var (`ENVIRONMENT` backend, `VITE_ENVIRONMENT` frontend), value `PRODUCTION` vs anything else (dev).

- **Backend** (`service/.env`, read by `app/core/settings.py`): `ENVIRONMENT=PRODUCTION` selects `DB_URL_SUPABASE` (Postgres), otherwise `DB_URL_SQLITE` (local `db_test.db`). Also `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `PORT`, `CLIENT_URL_PROD`/`CLIENT_URL_DEV` (used as CORS origins). **Note:** `app/_settings.py` is a stale duplicate `Settings` class — the live one is `app/core/settings.py`.
- **Frontend** (`client/.env`): `VITE_BACKEND_URL_PROD`, `VITE_BACKEND_URL_DEV`, `VITE_ENVIRONMENT`. In `src/config.ts`, `apiLink` resolves to the literal `/api` in production and to `VITE_BACKEND_URL_DEV` otherwise.
- **Production API routing**: the SPA is deployed on Vercel; `client/vercel.json` rewrites `/api/*` → the Render backend (`otb-miraflores-service.onrender.com`). This makes the auth cookie first-party in prod (see cookie notes below). Vercel also rewrites all other paths to `index.html` (SPA fallback).

## Auth flow (cookie + JWT)

1. `POST /auth/login` (`routers/auth.py`) verifies credentials with bcrypt (`services/auth.py`), issues a JWT with `sub = str(user.id)` (`services/jwt.py`), and sets it as an **httponly cookie** named `access_token` (`services/cookie.py`).
2. Protected endpoints depend on `get_current_user` (`app/dependencies.py`), which reads the cookie, decodes the JWT (requires `exp` and `sub` claims), and loads the `User`.
3. Frontend `AuthContext` (`client/src/context/AuthContext.tsx`) drives this: all auth calls use `credentials: 'include'`; on mount it calls `/auth/me` to restore the session. `ProtectedRoute` gates the routes.
4. Cookie is `SameSite=Lax`; `secure` is on only in production. The Vercel `/api` proxy is deliberate so the cookie stays first-party (avoids Safari/iOS ITP blocking cross-site cookies).

## Backend architecture (service/app/)

Layered: **routers → services → models/db**. Do not put business logic in routers.

- `main.py` — app factory, CORS, `Base.metadata.create_all` (tables auto-created on startup in addition to Alembic), and `include_router` calls. **Only `auth`, `neighbors`, `measures` routers are active**; `meets`, `collect_debts`, `debts` are commented out.
- `routers/` — thin HTTP handlers, one `APIRouter` per domain with a URL prefix.
- `services/` — business logic (`measures.py`, `crud.py`, `auth.py`, `jwt.py`, `cookie.py`). Note `crud.py` holds neighbor logic while measure logic lives in both `crud.py` and `measures.py`.
- `models/` — SQLAlchemy ORM. Only the models imported in `models/__init__.py` (`Measure`, `MeterReading`, `NeighborMeter`, `Neighbor`, `User`) are registered; the rest exist as files but are commented out of the package.
- `schemas/schema.py` — Pydantic request/response models (`schemas/auth.py` for login).
- `db/database.py` — engine, `SessionLocal`, `Base` (custom `BaseModel.__repr__`), and the `get_db` FastAPI dependency.
- `enums.py` — `UserType` (admin/collector), `MeasureType` (CREATED → IN_PROGRESS → CLOSED measure lifecycle).

### Domain data model

`Neighbor` 1—N `NeighborMeter` (a neighbor's physical water meters, identified by unique `meter_code`) 1—N `MeterReading`. A `Measure` is one reading campaign for a `period` (e.g. `"2025-01"`); it has N `MeterReading`s, one per meter. `POST /measures/{id}/generate-debts` computes consumption as `current_reading − previous_reading` and bills it (≤20 m³ → Bs. 20 flat, else Bs. 1/m³), creating `DebtItem`s (debt models are otherwise dormant). Relationships use `cascade="all, delete-orphan"`.

### Migrations

Alembic is configured in `service/alembic.ini` (`script_location = migrations`). The real DB URL is injected at runtime in `migrations/env.py` from `settings` (same PROD/dev switch as the app) — the `sqlalchemy.url` in `alembic.ini` is a placeholder. `target_metadata = Base.metadata`, so autogenerate sees whatever is registered in `app/models/__init__.py`.

## Frontend architecture (client/src/)

React 18 + TypeScript + Vite + Tailwind, with Material Tailwind, Headless UI, and several icon sets. Routing is **react-router-dom v7**.

- `main.tsx` is the composition root: `ThemeProvider` → `AuthProvider` → `BrowserRouter`. Routes are declared here (not in `App.tsx`). Active routes: `/login`, `/vecinos` (`NeighborsLayout`), `/mediciones` (`MeasuresLayout`), all except login wrapped in `ProtectedRoute`; `/` redirects to `/vecinos`. `App.tsx` (TopNavBar + Outlet + Footer + Toasts) is defined but currently unused/commented out of the tree.
- **Data fetching**: the `useFetchData` hook (`hooks/useFetchData.ts`) is a thin `fetch` wrapper returning `{ data, isLoading, error, execute }`; `execute(url, options)` resolves to `{ ok, data }`. Domain hooks under `hooks/measures/` and `hooks/neighbors/` build on it. Always pass `credentials: 'include'` for authenticated calls. Build request URLs from `apiLink` (`config.ts`).
- **Layout**: `pages/` are screens, composed from `components/` grouped by domain (`neighbors/`, `measures/`, `tables/`, `forms/`, `modals/`, `shared/`, `navigation/`). Forms use `react-hook-form`; tables are custom; toasts via `react-toastify`.
- Types live in `types/` and `interfaces/`; PDF/QR receipt generation uses `@react-pdf/renderer`, `jspdf`, and `qrcode` (`utils/docPdf.ts`, `components/receipts/`).

## Conventions & gotchas

- **Indentation is 2 spaces in the Python backend too** (not PEP 8's 4) — match the surrounding files.
- Lots of intentionally commented-out code marks planned-but-inactive features (debts, payments, meetings, collections). When adding a feature, check whether a scaffold already exists before creating new files. To activate a dormant model/router, uncomment its import in `models/__init__.py` / `main.tsx` / `main.py`.
- `db_test.db`, `.env` files, `*.csv`, and `/data/*` are gitignored. Seed/populate scripts (`service/seed.py`, `service/scripts/populate_full_database.py`, `_seed.py`) read neighbor data from CSVs and may contain hardcoded DB URLs — treat as local one-off tooling, not app code.
- The frontend depends on the Vercel `/api` rewrite in production; hitting the Render URL directly would make the auth cookie cross-site.
