# Student Analytics Agent Platform

Greenfield monorepo for a student-first analytics product with:

- `apps/web`: Next.js App Router dashboard and auth UI
- `services/api`: FastAPI backend with auth, exams, analytics, reports, and imports
- `packages/contracts`: shared TypeScript contracts and API client
- `packages/config`: local Postgres and environment examples

## Quick Start

1. Copy env files from [`packages/config/api.env.example`](/Users/karthickrajan/Desktop/Nurogenai%20-%20schoolteacher_AI/packages/config/api.env.example) and [`packages/config/web.env.example`](/Users/karthickrajan/Desktop/Nurogenai%20-%20schoolteacher_AI/packages/config/web.env.example).
2. Install frontend dependencies with `npm install`.
3. Install backend dependencies with `uv sync --project services/api`.
4. Start Postgres with `npm run db:up`.
5. Start the API with `npm run dev:api`.
6. Start the web app with `npm run dev:web`.

## Main Flows

- Student signup and login with email/password or Google Identity Services
- Profile onboarding and subject management
- Exam-centric marks entry with edit/delete support
- CSV import preview and commit
- Analytics overview, trends, and subject priorities
- Cached AI report generation with vetted resource recommendations
