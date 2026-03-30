# Deployment (Free Tier)

## Netlify (Frontend + Backend Functions) — RECOMMENDED

### Setup in 3 steps:

1. **Connect to Netlify** from your GitHub repo
2. **Set Environment Variables** in Netlify UI (Settings → Environment):
   ```
   ADMIN_PASSWORD = Sunday@123456789
   JWT_SECRET = samridhi_jwt_secret_2025
   VITE_API_BASE_URL = (leave empty)
   ```
3. **Deploy** ✓

### Admin Login
- **Username**: `lukeshPrime`
- **Password**: `Sunday@123456789` (from `ADMIN_PASSWORD` env)
- After login: manage properties, view inquiries, delete queries

### How it Works
- Frontend: React app deployed to Netlify CDN
- Backend: Express API runs as Netlify Function (`/.netlify/functions/api`)
- Requests to `/api/*` are automatically routed to the function (via `netlify.toml`)
- Inquiries table requires auth token from login

---

## Local Testing

Terminal 1:
```bash
npm run dev:frontend    # http://localhost:5173
```

Terminal 2:
```bash
npm run dev:backend     # http://localhost:5000
```

Login: `lukeshPrime` / `Sunday@123456789`

---

## Alternative: Render + Vercel (Older Setup)
- Push this repo to GitHub.
- In Render, create a new Blueprint service from the repo (it will use `render.yaml`).
- Set environment variables:
  - `ADMIN_PASSWORD` = your admin login password
  - `FRONTEND_ORIGIN` = your Vercel URL (for example `https://samridhi-properties.vercel.app`)
- Deploy and copy the backend URL (for example `https://samridhi-properties-backend.onrender.com`).

## 2. Deploy frontend to Vercel
- Import `samridhi-properties` project in Vercel.
- Add environment variable:
  - `VITE_API_BASE_URL` = your Render backend URL
- Deploy.

## 3. Final cross-origin update
- After Vercel deployment, put the final Vercel URL in Render `FRONTEND_ORIGIN`.
- Redeploy backend once.

## 4. Local dev
- Frontend: `npm run dev:frontend`
- Backend: `npm run dev:backend`
- Both: `npm run dev:all`
