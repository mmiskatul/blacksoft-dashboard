# Blacksoft Dashboard

Standalone content-management dashboard for the Blacksoft public website.

## Run locally

```bash
npm install
npm run dev
```

The dashboard runs on `http://localhost:3000` by default. Set
`NEXT_PUBLIC_API_BASE_URL` when the FastAPI backend is not available at
`http://localhost:8000/api`.

The public website remains in `MishiAi-frontend`; this app owns the dashboard
routes at its root (`/`, `/capabilities`, `/team-members`, and so on).

## Authentication

Sign-in requires the administrator email and password configured in the
backend, followed by a six-digit verification code delivered through SMTP.
Sessions use expiring bearer tokens. Password recovery is available at
`/forgot-password` and also requires an SMTP-delivered code.
