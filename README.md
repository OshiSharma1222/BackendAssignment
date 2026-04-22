# Backend Assignment — Scalable REST API with Auth, RBAC & React Frontend

A production-style full-stack project built for the Backend Developer (Intern) assignment.

- **Backend:** Node.js · Express · Prisma · PostgreSQL (Neon-compatible) · JWT · bcrypt · Swagger
- **Frontend:** React 18 · React Router · Vite · Vanilla CSS (custom design system)
- **Features:** Register / Login, JWT auth, role-based access (USER / ADMIN), CRUD for Tasks, admin-only user management, API versioning (`/api/v1`), validation, rate limiting, OpenAPI docs, pagination + search + filters.

---

## 1. Project Structure

```
BackendAssignment/
├── backend/                    # Node.js + Express + Prisma API
│   ├── prisma/
│   │   └── schema.prisma       # PostgreSQL schema (User, Task)
│   ├── src/
│   │   ├── config/             # env, prisma client, swagger
│   │   ├── controllers/        # auth, task, user controllers
│   │   ├── middleware/         # auth, validate, error handlers
│   │   ├── routes/v1/          # versioned routes (/api/v1)
│   │   ├── utils/              # ApiError, asyncHandler, jwt
│   │   ├── validators/         # express-validator rule sets
│   │   ├── app.js              # Express app (security, CORS, routes)
│   │   ├── server.js           # HTTP server bootstrap
│   │   └── seed.js             # Seeds an initial admin user
│   ├── .env.example
│   └── package.json
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── api/                # fetch client + token handling
│   │   ├── components/         # Navbar, ProtectedRoute, Toast
│   │   ├── context/            # AuthContext (JWT in localStorage)
│   │   ├── pages/              # Home, Login, Register, Dashboard, Admin
│   │   ├── App.jsx, main.jsx, styles.css
│   ├── .env.example
│   └── package.json
├── postman/
│   └── BackendAssignment.postman_collection.json
└── README.md
```

---

## 2. Prerequisites

- Node.js **18+** and npm
- A PostgreSQL database. The easiest option is a free [Neon](https://neon.tech) project (serverless Postgres) — the connection string just drops into `DATABASE_URL`.

---

## 3. Setup — Backend

```bash
cd backend
npm install
cp .env.example .env        # on Windows PowerShell: Copy-Item .env.example .env
```

Edit `backend/.env` and set:

- `DATABASE_URL` — your Neon (or other Postgres) connection string. Example Neon pooled URL:
  ```
  postgresql://USER:PASSWORD@ep-xxxxx-pooler.REGION.aws.neon.tech/dbname?sslmode=require
  ```
- `DIRECT_URL` — the Neon direct (non-pooled) URL if you have one. Prisma migrations use this. If you don't have one, use the same value as `DATABASE_URL`.
- `JWT_SECRET` — any long random string (≥ 32 chars).
- `CORS_ORIGIN` — `http://localhost:5173` during development (the Vite dev server).

Run the initial migration to create the `User` and `Task` tables:

```bash
npm run prisma:migrate -- --name init
```

(Optional) seed an initial admin so you can log in to the Admin panel:

```bash
npm run db:seed
```

Start the API:

```bash
npm run dev
# API:     http://localhost:5000/api/v1
# Health:  http://localhost:5000/health
# Docs:    http://localhost:5000/docs   (Swagger UI)
```

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start API with nodemon |
| `npm start` | Start API |
| `npm run prisma:migrate` | Create a new migration (dev) |
| `npm run prisma:deploy` | Apply migrations (prod) |
| `npm run prisma:studio` | Open Prisma Studio DB browser |
| `npm run db:seed` | Create/promote the seed admin user |

---

## 4. Setup — Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
# UI: http://localhost:5173
```

`VITE_API_BASE_URL` in `frontend/.env` defaults to `http://localhost:5000/api/v1`.

---

## 5. API Overview

All routes are prefixed with `/api/v1`. JSON only. Successful responses use:

```json
{ "success": true, "data": ... , "meta": { ... optional ... } }
```

Errors use:

```json
{ "success": false, "error": { "message": "...", "details": [ ... ] } }
```

### Auth

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | public | Register + return JWT |
| POST | `/auth/login` | public | Login + return JWT |
| GET | `/auth/me` | Bearer | Current user |

### Tasks (authenticated)

Regular users only see their own tasks; admins see all tasks.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/tasks?page=&limit=&status=&priority=&search=` | List (paginated) |
| POST | `/tasks` | Create task |
| GET | `/tasks/:id` | Get task |
| PATCH | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |

### Users (admin only)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/users` | List all users |
| PATCH | `/users/:id/role` | Set role to `USER` / `ADMIN` |
| DELETE | `/users/:id` | Delete a user |

Send the JWT as `Authorization: Bearer <token>`.

### Interactive Docs

Swagger UI is built from JSDoc comments on the routes and served at:

```
http://localhost:5000/docs
```

The raw OpenAPI JSON is at `GET /docs.json`.

### Postman

Import `postman/BackendAssignment.postman_collection.json`. It has a `{{baseUrl}}` and `{{token}}` variable — the login and register requests automatically capture the token into the collection variable.

---

## 6. Security

- **Password hashing** — `bcryptjs` with cost factor 12.
- **JWT** — signed with `JWT_SECRET`, short expiry (`1d` default), verified on every protected request, user re-fetched from DB so revocation is possible.
- **Role-based access** — `authorize('ADMIN')` middleware gates admin routes; task queries are always scoped by `ownerId` for non-admins.
- **Input validation** — every write route uses `express-validator` rules; failures return `400` with per-field details.
- **HTTP hardening** — `helmet` (secure headers), `cors` allow-list, `hpp` (HTTP param pollution), body size limits, `express-rate-limit` (global + stricter auth limiter).
- **Prisma parameterized queries** — prevents SQL injection by construction.
- **No secrets in code** — configuration via `.env`; `.env` is git-ignored.

---

## 7. Scalability Notes

The project is organized so new modules (e.g. `projects`, `comments`, `notifications`) can be added without touching unrelated code:

```
routes/v1/<resource>.routes.js
controllers/<resource>.controller.js
validators/<resource>.validator.js
```

Path forward when traffic grows:

1. **Database** — Neon/Postgres scales vertically easily. Add read replicas via Neon's branching for analytics; use Prisma's `directUrl` + pooled URL (already wired) so the API uses a pooler while migrations go direct.
2. **Stateless API** — JWT auth + no server session means the API is stateless. Run multiple containers behind a load balancer (NGINX, ALB, Fly Machines, Render, etc.) and scale horizontally.
3. **Caching** — plug in Redis for:
   - rate-limit store (`rate-limit-redis`) so limits are shared across instances,
   - caching expensive GET endpoints (e.g. `/tasks` aggregates) with a short TTL,
   - a denylist for revoked JWTs if you need forced logout.
4. **Async work** — move emails, webhooks, or heavy jobs to a queue (BullMQ on Redis, SQS). API stays snappy.
5. **Observability** — `morgan` is already wired; add structured logging (pino), request IDs, and metrics (Prometheus / OpenTelemetry) for SLOs. Ship errors to Sentry.
6. **Deployment** — backend deploys cleanly on Render / Railway / Fly.io / AWS ECS. The frontend deploys on Vercel / Netlify / Cloudflare Pages. Both are decoupled and can scale independently.
7. **Microservices (later)** — if one domain (e.g. notifications) grows, split it out. The versioned `/api/v1` prefix lets you evolve contracts without breaking clients; bump to `/api/v2` for breaking changes.

---

## 8. Demo Flow

1. Start backend (`npm run dev` in `backend/`) and frontend (`npm run dev` in `frontend/`).
2. Visit `http://localhost:5173` → **Register** a user.
3. You land on the **Dashboard** (JWT required). Create, edit, filter, and delete tasks.
4. Run `npm run db:seed` to create an `ADMIN` user (`admin@example.com` / `Admin@12345` by default). Log in as the admin — the **Admin** tab appears and you can manage users and see everyone's tasks.
5. Open `http://localhost:5000/docs` to try the API directly from Swagger UI.

---

## 9. Tech Choices — Why

- **Express** — small, unopinionated, easy to review; universally known.
- **Prisma** — typed DB access, migrations, works seamlessly with **Neon Postgres**, and the generated client is fast to iterate on.
- **PostgreSQL / Neon** — relational integrity for users/tasks, serverless hosting with generous free tier — great DX for a submission project.
- **JWT** — standard stateless auth; easy to scale horizontally.
- **Vite + React** — minimal build config, extremely fast DX, and a real SPA that showcases API integration.

---

## License

MIT
