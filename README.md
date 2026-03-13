# RentFollow (rent-flow)

RentFollow is organized into two main apps so the project stays simple to navigate and operate:

- `frontend/` – Next.js 15 + TypeScript UI for landlord authentication, tenant recovery operations, workflow configuration, late fee settings, and analytics.
- `backend/` – Express + TypeScript API with Prisma/PostgreSQL, Redis/BullMQ jobs, JWT auth, and recovery automation logic.

## Project Structure

```text
rent-flow/
├── frontend/   # Web app (App Router, Tailwind, shadcn/ui, React Query, Zustand)
└── backend/    # API + jobs (Express, Prisma, PostgreSQL, Redis, BullMQ)
```

## Run Locally

### Backend

```bash
cd backend
npm install
cp .env.example .env
docker compose up -d db redis
npm run dev
```

> Backend runs on `http://localhost:4000` by default for frontend proxy compatibility.
> `npm run dev` auto-generates Prisma client in backend.

### Frontend

```bash
cd frontend
npm install
# optional if backend is not on :4000
# echo "BACKEND_URL=http://localhost:4000" > .env.local
npm run dev
```

## Notes

- Unused default Next.js public assets were removed to keep the frontend package focused on required project files.
- Existing backend and frontend app code remains in their scoped folders to preserve clear separation of concerns.
