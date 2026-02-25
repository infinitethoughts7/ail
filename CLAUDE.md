# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Literacy (AIL) platform for managing a 4-day training program across 40 TMREIS schools in Telangana, India. Three portals serve different roles:

- **Trainer** (`/trainer`) — submit daily session reports, manage students, upload photos/projects
- **Swinfy Admin** (`/swinfy`) — verify/approve submissions, photos, and projects
- **UWH Sponsor** (`/uwh`) — read-only dashboard showing verified program progress

## Commands

### Backend (Django)

```bash
cd backend
source .venv/bin/activate
python manage.py runserver              # Dev server on :8000
python manage.py migrate                # Run migrations
python manage.py makemigrations         # Create new migrations
python manage.py seed_real_data         # Seed districts, schools, curriculum
python manage.py send_scheduled_emails  # Cron: trainer reminders
python manage.py createsuperuser        # Django admin access at /admin/
```

### Frontend (Next.js)

```bash
cd frontend
npm run dev     # Dev server on :3000
npm run build   # Production build
npm run lint    # ESLint
```

Add Shadcn components: `npx shadcn add <component>` (style: `new-york`, base color: `neutral`)

## Architecture

### Stack

- **Backend**: Django 5.2 + DRF 3.16 + PostgreSQL + SimpleJWT (1-day access / 7-day refresh)
- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + TanStack Query 5 + next-auth 4
- **Auth**: Email-based login (`EmailBackend`). next-auth `CredentialsProvider` stores JWT tokens in session cookie.
- **Media**: Local filesystem in dev, AWS S3 (`USE_S3=True`) in prod
- **Email**: Brevo SMTP for OTP and scheduled reminders

### Key Directories

```
backend/
  apps/accounts/     # Custom User model (role field), EmailBackend, JWT login/register, OTP password reset
  apps/dashboard/    # All business logic: models, serializers, views, permissions, signals
  config/            # Django settings, URLs, WSGI

frontend/
  app/{swinfy,trainer,uwh}/  # Role-specific page routes
  components/{swinfy,trainer,uwh}/  # Role-specific components
  components/ui/     # Shadcn UI primitives
  hooks/             # TanStack Query hooks: use-trainer-data.ts, use-swinfy-data.ts, use-uwh-data.ts
  lib/api.ts         # Axios instance with JWT interceptor (auto signOut on 401)
  lib/auth.ts        # next-auth config
  lib/types.ts       # TypeScript interfaces mirroring Django serializers
  lib/program-config.ts  # Frontend mirror of backend program_config.py
  middleware.ts       # Role-based route guards
```

### Auth & API Flow

1. Login POSTs to `/api/auth/login/` → receives `{user, access, refresh}` tokens
2. Axios interceptor (`lib/api.ts`) attaches `Authorization: Bearer <token>` to all requests, caches session for 30s
3. Backend uses DRF permission classes: `IsAdmin`, `IsTrainer`, `IsSponsor`, `IsAdminOrSponsor` (in `apps/dashboard/permissions.py`)
4. Trainers see only their own data; sponsors see only verified/approved content
5. Password reset uses OTP flow: `request-otp` → `verify-otp` → `reset-password` (in `apps/accounts/`)

### Content Approval Pipeline

```
Submission:       draft → submitted → verified | flagged | rejected
SessionPhoto:     pending → approved | rejected  (can also be featured)
ProjectHighlight: pending → approved | featured | rejected
```

Trainers submit → Swinfy admins review → approved content visible to sponsors. Django signals (`apps/dashboard/signals.py`) auto-create `ActivityLog` entries on submission status changes.

### Data Model Constraints

- All models use UUID primary keys
- `Submission` has `unique_together = ["school", "day_number"]` (one submission per school per day)
- `School` supports two trainers: `assigned_trainer` and `second_trainer`
- `UWHControl` is a singleton (always `pk=1`) for program status banner — uses `save()` override to enforce
- Program config lives in `backend/apps/dashboard/program_config.py` (dates, targets, districts, upload limits)

### Frontend Patterns

- All server state via TanStack React Query (no Redux/Zustand). 30s staleTime.
- Query keys: `["role", "resource", ...filters]`
- Forms use React Hook Form + Zod validation
- File uploads as multipart/form-data
- Toasts via sonner
- Charts via recharts (UWH dashboard)
- Animations via framer-motion

### Role-Based Routing (middleware.ts)

| Role | Path Prefix | Default Route |
|------|------------|---------------|
| admin | `/swinfy` | `/swinfy/verification` |
| sponsor | `/uwh` | `/uwh/dashboard` |
| trainer | `/trainer` | `/trainer/form` |

### Backend API Structure

```
/api/auth/{login,register}/
/api/auth/{request-otp,verify-otp,reset-password}/
/api/dashboard/summary/          # Role-branched stats
/api/dashboard/districts/
/api/dashboard/schools/
/api/dashboard/schools/<id>/
/api/dashboard/curriculum/
/api/dashboard/trainer/*          # Trainer-only endpoints
/api/dashboard/swinfy/*           # Admin-only endpoints (verification, photos, projects, uwh-control)
/api/dashboard/uwh/*              # Sponsor-only endpoints (gallery, projects, activity-feed, district-progress)
```

## Deployment

- **Frontend**: Deployed on **Vercel** (auto-deploys from git)
- **Backend**: Deployed on **AWS EC2** (Ubuntu) with Gunicorn at `/var/www/ail/backend/`
- Backend only on EC2 — do NOT run frontend commands on the server

## Environment Variables

**Backend** (`backend/.env`): `SECRET_KEY`, `DEBUG`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `CORS_ALLOWED_ORIGINS`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, optional S3 settings when `USE_S3=True`

**Frontend** (`frontend/.env.local`): `NEXT_PUBLIC_API_URL` (Django URL), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

## Important Notes

- Timezone is `Asia/Kolkata` — all date/time handling uses IST
- Custom User model uses email for authentication (not username). Roles: `admin`, `trainer`, `sponsor`, `principal`
- S3 signed URLs expire after 1 hour (`AWS_QUERYSTRING_EXPIRE = 3600`)
- `AUTH_PASSWORD_VALIDATORS` is empty (disabled for dev)
- Backend views are function-based with `@api_view` decorators (not class-based ViewSets)
