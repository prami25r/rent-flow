# RentFollow Backend

Express + TypeScript backend for RentFollow.

## Main folders

- `src/routes` – versioned API routes (`/api/v1`)
- `src/controllers` – HTTP controllers
- `src/services` – business logic
- `src/repositories` – data access via Prisma
- `src/validators` – zod validation schemas
- `src/jobs` – BullMQ queues and scheduled processing
- `src/middleware` – auth and centralized error handling
- `src/utils` – logging, risk, pagination, and helpers
- `src/prisma` – Prisma schema and seed script

## Local setup

1) Install dependencies

```bash
npm install
```

2) Create environment file

```bash
cp .env.example .env
```

3) Start Postgres + Redis

```bash
docker compose up -d db redis
```

4) Generate Prisma client

```bash
npm run prisma:generate
```

5) Run the API

```bash
npm run dev
```

## Why `Invalid environment configuration` happens

The API validates environment variables on startup. If required keys are missing, it exits early.
At minimum you must provide:

- `JWT_SECRET`
- `DATABASE_URL`

`REDIS_PORT` now defaults to `6379` if omitted.
