# Deployment (Free Tier)

## Netlify (Frontend + Backend Functions)
- This repo now supports Netlify Functions backend through `/api/*`.
- `netlify.toml` routes `/api/*` to `samridhi-properties/netlify/functions/api.cjs`.
- Set these Netlify environment variables:
  - `JWT_SECRET` = strong random string
  - `ADMIN_PASSWORD` = prime admin password used for login
  - `FRONTEND_ORIGIN` = your site URL (optional, for explicit CORS)
- Keep `VITE_API_BASE_URL` empty for same-origin API calls on Netlify.
- Deploy from repository root; `base` is already configured to `samridhi-properties`.

### Admin access flow
- Login from the app using username + password.
- After login, admin token is used to fetch inquiries and enable add/edit/delete property actions.
- Inquiry list is restricted to authenticated admin requests.

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
