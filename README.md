# Cui Zhiwei — Full-Stack Portfolio & Blog

Capstone project for **Web Data Management and Application** (100 marks).

A production-ready personal portfolio built as two parts:

- **`server/`** — a secure RESTful API in Node.js + Express, backed by MongoDB (Mongoose) and deployed to a cloud host.
- **`client/`** — a React single-page application that consumes every endpoint, with routing, a Context-based auth layer and an admin dashboard.

**Student:** Cui Zhiwei · **ID:** 24998007

---

## 1. Live deployment

| What | URL |
| --- | --- |
| Front-end (React, `npm run build`) | `https://cui-zhiwei-capstone.vercel.app` |
| Back-end API | `https://cui-zhiwei-api.vercel.app/api` |
| API reference (live calls) | `https://cui-zhiwei-capstone.vercel.app/api-docs` |

The production client is compiled with an absolute API base (`VITE_API_URL`), so every browser request goes to the deployed API — never to `localhost` and never to a mock.

---

## 2. What it does

### Back-end (50 marks)

- MVC structure: `models/`, `controllers/`, `routes/`, `middleware/`.
- Mongoose models with validation: **User, Project, BlogPost, Comment, Message, Skill**.
- Password hashing with bcrypt (via `bcryptjs`), JWT issuance on login/register.
- `protect` middleware (JWT verification + `req.user`) and `adminOnly` authorization.
- Ownership checks: only a post's author (or an admin) can update/delete it.
- `helmet`, CORS allowlist, rate limiting, request-size limits, input sanitization, central error handler with a consistent JSON envelope.
- Comment and contact relationships with `populate()`.

### Front-end (50 marks)

- Component-based React (Header, Footer, ProjectCard, PostCard, AdminDashboard, etc.).
- React Router with public, dynamic and a protected `/admin` route.
- `useState` / `useEffect` data fetching with loading and error states.
- Controlled forms for contact, login, register and commenting.
- Auth Context managing token/user + login/logout, auth-aware header.
- Admin dashboard: full CRUD for projects, posts, skills and the contact inbox, all sending `Authorization: Bearer <token>`.
- Responsive editorial design system built with CSS custom properties.

---

## 3. API endpoints

Everything is mounted under `/api`. Responses use a consistent shape:

```json
{ "success": true, "count": 6, "data": [], "meta": { "page": 1, "limit": 9, "total": 6, "pages": 1 } }
```

Errors:

```json
{ "success": false, "message": "…", "errors": { "field": "…" } }
```

**Auth key:** `—` public · `Bearer` any signed-in account · `Admin` role `admin` only · `Author` the post's author (or an admin).

| Method | Path | Auth | Purpose / expected body |
| --- | --- | --- | --- |
| GET | `/` | — | Self-describing route map. |
| GET | `/health` | — | Uptime + database status. |
| POST | `/users/register` | — | `{username, email, password}` → 201 + JWT (role `author`). |
| POST | `/users/login` | — | `{email, password}` → 200 + JWT. One message for both failures. |
| GET | `/users/me` | Bearer | Re-validates the token; returns `{_id, username, email, role}`. |
| GET | `/projects` | — | All projects. `?featured=true`, `?category=`, `?status=`, `?q=` |
| GET | `/projects/:id` | — | One project. Malformed id → 400. |
| POST | `/projects` | Admin | `{title, description, summary?, problem?, solution?, outcome?, category?, status?, year?, role?, timeline?, techStack?, highlights?, imageUrl?, repoUrl?, liveUrl?, featured?, order?}`. Owner from token. |
| PUT/PATCH | `/projects/:id` | Admin | Partial update. |
| DELETE | `/projects/:id` | Admin | Delete. |
| GET | `/skills` | — | Skills. `?category=`, `?minLevel=` |
| GET | `/skills/:id` | — | One skill. |
| POST | `/skills` | Admin | `{name, category, level (1–5), order?}` |
| PUT/PATCH | `/skills/:id` | Admin | Partial update. |
| DELETE | `/skills/:id` | Admin | Delete. |
| GET | `/blog` | — | Published posts, author populated, `commentCount` + `readTime`. `?tag=`, `?q=`, `?page=`, `?limit=` |
| GET | `/blog/manage` | Bearer | Own posts (all, incl. drafts, for admins). |
| GET | `/blog/:id` | — | One post + `comments` array + `commentCount`. |
| POST | `/blog` | Bearer | `{title, content, excerpt?, tags?, coverImage?, published?, featured?}`. Author from token. |
| PUT/PATCH | `/blog/:id` | Author | Partial update. |
| DELETE | `/blog/:id` | Author | Deletes the post and its comments. |
| GET | `/blog/:postId/comments` | — | Comments for a post, author populated. |
| POST | `/blog/:postId/comments` | Bearer | `{body}` — author from token, never the body. |
| DELETE | `/blog/:postId/comments/:commentId` | Bearer | Comment author, post author or admin. |
| POST | `/contact` | — | `{name, email, message}` → 201. 400 on invalid email / short message. |
| GET | `/contact` | Admin | Inbox, newest first (`no-store`). |
| PATCH/PUT | `/contact/:id/read` | Admin | `{read: true|false}` mark/unmark read. |
| DELETE | `/contact/:id` | Admin | Delete a message. |
| GET | `/admin/stats` | Bearer | Counters for the dashboard. |
| GET | `/admin/activity` | Admin | Merged feed of the 10 newest events. |

Create returns `201`; read/update returns `200`; delete returns `204` with no body.

---

## 4. Accounts

Seeded demo accounts (change these for production):

| Role | Email | Password |
| --- | --- | --- |
| Admin (portfolio author) | `cui@cuizhiwei.dev` | `CuiZhiwei2026!` |
| Author (reader, can comment) | `linwei@example.com` | `Reader2026!` |
| Author (reader, can comment) | `maya@example.com` | `Reader2026!` |

Registration is open (creates an `author`). Portfolio project/skill management is admin-only; any signed-in account can write posts and comment.

Promote an existing account to admin:

```bash
cd server && npm run make:admin -- you@example.com
```

---

## 5. Run it locally

### 5.1 Back-end

**Option A — real MongoDB Atlas (recommended):**

```bash
cd server
npm install
cp .env.example .env        # fill in MONGO_URI and JWT_SECRET
npm run seed                # seed sample content
npm run dev                 # http://localhost:5000
```

Generate a JWT secret:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

**Option B — in-memory MongoDB (no Atlas needed):**

```bash
cd server
npm install
npm run dev:memory          # spins up an in-memory MongoDB + seeds data
```

### 5.2 Front-end

```bash
cd client
npm install
cp .env.example .env.local  # leave VITE_API_URL empty to use the Vite proxy
npm run dev                 # http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:5000`, so the client talks to the local API with no CORS setup.

### 5.3 Connecting front-end to a deployed back-end

Set `VITE_API_URL` to the absolute API base when building:

```bash
cd client
VITE_API_URL=https://your-api.onrender.com/api npm run build
```

Add `https://your-front-end.example` to `CLIENT_ORIGINS` in the server `.env` so CORS allows it.

---

## 6. Tests

```bash
# Back-end — 23 integration tests against an in-memory MongoDB
cd server && npm test

# Front-end — unit tests (format helpers + Markdown renderer)
cd client && npm test
```

The back-end suite covers registration, login, JWT validation, ownership checks, project CRUD, comments, contact inbox permissions, skills and the error envelope.

---

## 7. Deployment

Full step-by-step instructions are in [`DEPLOY.md`](DEPLOY.md). In short:

- **API** → Render (web service, `server/` root, health check `/api/health`) — or Railway/Docker.
- **Client** → Vercel / Netlify, or GitHub Pages (`npm run build` with `VITE_API_URL` + `VITE_BASE`).

A `render.yaml` blueprint and a `Dockerfile` are included.

---

## 8. Project structure

```
server/
  src/
    app.js  server.js
    config/        env + database connection
    models/        User, Project, Post, Comment, Message, Skill
    controllers/   auth, project, post, comment, contact, skill, admin
    routes/        one router per resource
    middleware/    protect, adminOnly, validate, sanitize, rate-limit, error handler
    validators/    Zod request schemas
    utils/         ApiError, slug, pagination, text helpers
    seed/          sample data + seed runner
  tests/           integration tests
  api/index.js     Vercel serverless entry point
client/
  src/
    components/    Header, Footer, ProjectCard, PostCard, Modal, Markdown, …
    context/       AuthContext, ToastContext
    hooks/         useApi, useDocumentTitle
    pages/         Home, Projects, ProjectDetail, Blog, PostDetail, Contact,
                   Login, Register, Admin, ApiDocs, NotFound
    lib/           api client, site config, formatting, asset resolution
    styles/        design system (CSS custom properties)
  public/          favicon, portrait, project/post cover SVGs
```

---

## 9. Make it yours

The site ships with tasteful **sample content** about a generic full-stack student. Before submitting, replace it with your own:

- `server/src/seed/data.js` — projects, skills, posts (the posts live in `server/src/seed/posts/*.md`) and messages.
- `client/src/lib/site.js` — name, role, email, social links and hero copy.
- `server/.env` / `client/.env` — real connection strings and origins.
