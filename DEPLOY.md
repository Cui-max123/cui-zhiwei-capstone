# Deployment guide

The capstone needs two reachable URLs: the built React client and the API. This
guide covers the lowest-friction paths. Pick one host per half.

## 0. Prerequisites

1. A **MongoDB Atlas** cluster (free M0 is enough).
   - Create a cluster, add a database user (read/write), and allow network access from anywhere (`0.0.0.0/0`) for the hosted API.
   - Copy the connection string and put the database name in it, e.g. `mongodb+srv://USER:PASSWORD@cluster0.xxxx.mongodb.net/cui_portfolio?retryWrites=true&w=majority`.
2. A long random JWT secret: `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.

---

## 1. Back-end on Render (recommended)

The repo already contains `render.yaml`, so you can use a Blueprint.

**Blueprint (easiest):**

1. Push this repo to GitHub.
2. On [render.com](https://render.com) → **New** → **Blueprint**, select the repo.
3. Render reads `render.yaml`, creates the `server/` web service, and asks for the three secrets:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_ORIGINS` (your front-end origin, e.g. `https://your-gh-username.github.io`)
4. After it builds, open the service and **Seed** it once:
   - Render shell: `npm run seed`

**Manual (no Blueprint):**

1. Render → **New** → **Web Service** → connect the repo.
2. Settings:
   - Root directory: `server`
   - Build command: `npm ci`
   - Start command: `npm start`
   - Environment: `NODE_ENV=production`, `TRUST_PROXY=1`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGINS`.
3. Health check path: `/api/health`.
4. Deploy, then run `npm run seed` once from the Render shell.

Your API URL is `https://<service>.onrender.com`; the API base is `.../api`.

> Free Render services sleep after inactivity — the first request after a pause is slow. That is expected on the free tier.

---

## 2. Front-end on Vercel (recommended)

1. Push the repo to GitHub.
2. On [vercel.com](https://vercel.com) → **New Project** → import the repo.
3. Set:
   - Root directory: `client`
   - Build command: `npm run build` (the included `vercel.json` adds the SPA rewrite)
   - Environment variable: `VITE_API_URL=https://<service>.onrender.com/api`
4. Deploy. Copy the `https://<project>.vercel.app` URL.

> **Important:** add the final Vercel URL to `CLIENT_ORIGINS` on Render, then redeploy, so CORS allows the browser.

---

## 3. Front-end on GitHub Pages

A workflow is included at `.github/workflows/deploy-pages.yml`.

1. In the repo settings → **Secrets and variables → Actions**, add:
   - `VITE_API_URL` = `https://<service>.onrender.com/api`
2. In **Settings → Pages**, set source to **GitHub Actions**.
3. Push. The workflow builds `client/` with `VITE_BASE=/<repo>/` and publishes to Pages.

The site is then at `https://<username>.github.io/<repo>/`. Add that origin to `CLIENT_ORIGINS` on Render.

### Manual Pages deploy

```bash
cd client
VITE_API_URL=https://<service>.onrender.com/api VITE_BASE=/<repo>/ npm run build
# then publish dist/ to the gh-pages branch (any static host works)
```

The build writes a `404.html` copy of `index.html` so deep links (`/blog/:id`, `/admin`) survive a hard refresh.

---

## 4. Alternative: back-end on Vercel / Docker

- **Vercel serverless:** the repo includes `server/vercel.json` + `server/api/index.js`. Create a Vercel project with root `server`, env vars `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGINS`, `TRUST_PROXY=1`.
- **Docker:** `cd server && docker build -t cui-api .` then `docker run -p 5000:5000 -e MONGO_URI=… -e JWT_SECRET=… -e CLIENT_ORIGINS=… cui-api`.

---

## 5. After both are live

1. Verify:
   ```bash
   curl https://<service>.onrender.com/api/health
   curl https://<service>.onrender.com/api/projects
   ```
2. Open the front-end, visit `/projects`, `/blog`, `/api-docs`, and sign in as the admin to confirm the dashboard writes work.
3. Update the **Live deployment** table in `README.md` with the real URLs.
