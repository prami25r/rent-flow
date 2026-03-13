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

## Run

```bash
npm install
npm run dev
```
