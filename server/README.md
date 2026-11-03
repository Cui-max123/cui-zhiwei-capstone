# Portfolio & Blog API (server)

The Express + Mongoose back end for Cui Zhiwei's portfolio. See the repository
root `README.md` for the full endpoint reference, local setup and deployment
steps.

## Quick start (in-memory database, no Atlas required)

```bash
npm ci
npm run dev:memory
```

The API starts on `http://localhost:5000/api`, seeded with sample data.
Admin account: `cui@cuizhiwei.dev` / `CuiZhiwei2026!`.

## Quick start (real MongoDB Atlas)

```bash
npm ci
Copy-Item .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run seed
npm run dev
```

## Tests

```bash
npm test
```

The test suite runs against an in-memory MongoDB and covers authentication,
authorization, ownership checks, CRUD and the error envelope.
