# Deployment (Free Tier)

## 1. Deploy backend to Render
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
