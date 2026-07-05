# Console Ecommerce

**Premium AI Powered MERN Stack E-Commerce Platform**

A production-ready full-stack e-commerce application built with React, Vite, Node.js, Express, MongoDB, Redux Toolkit, and JWT authentication.

## Features

- JWT Authentication with refresh tokens, bcrypt password encryption
- Role-based access control (Admin / User)
- Product CRUD with search, filter, sort, and pagination
- Shopping cart (guest + authenticated) with coupon codes
- Checkout with mock payment gateway and COD
- Order management with tracking and cancellation
- Intelligent recommendation engine (RapidMiner + fallback)
- Admin dashboard with analytics
- Contact form with React Hook Form validation
- Dark/Light mode, responsive premium UI
- Deployment ready for Vercel + Render

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, Vite, Redux Toolkit, Tailwind CSS, Framer Motion, Axios |
| Backend | Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs |
| Deployment | Vercel (Frontend), Render (Backend), MongoDB Atlas |

## Project Structure

```
Console-Ecommerce/
├── backend/          # Express API server
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   └── utils/
├── frontend/         # React Vite app
│   └── src/
│       ├── api/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       ├── redux/
│       └── utils/
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Seed Database

```bash
cd backend
npm run seed
```

**Demo Credentials:**
- Admin: `admin@console.com` / `Admin@123`
- User: `user@console.com` / `User@123`

## Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend (.env)

```env
# Local development only
VITE_API_URL=http://localhost:5000/api
```

On Vercel, **do not** set `VITE_API_URL` to a placeholder. Production builds use `/api` (proxied via `vercel.json`).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get profile |
| GET | /api/products | List products (search/filter/sort) |
| GET | /api/products/search | Search products |
| POST | /api/orders | Create order |
| GET | /api/analytics/recommendations | Get recommendations |
| GET | /api/analytics/dashboard | Admin dashboard stats |

## Deployment

### Backend (Render)

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. **Root Directory:** `backend`
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`
6. Add environment variables (copy from your local `backend/.env`):
   - `MONGO_URI` — your Atlas connection string
   - `JWT_SECRET` — a long random string
   - `JWT_REFRESH_SECRET` — another long random string
   - `CLIENT_URL` — `https://console-e-commerce-avob.vercel.app,http://localhost:5173`
   - `NODE_ENV` — `production`
7. Deploy and copy your Render URL (e.g. `https://console-ecommerce-api.onrender.com`)
8. After deploy, run seed once from Render Shell or locally against Atlas:
   ```bash
   cd backend && npm run seed
   ```

### Frontend (Vercel)

1. Import the repository on Vercel
2. **Settings → General → Root Directory:** set to `frontend` and save
3. **Settings → Environment Variables:** **remove** any `VITE_API_URL` that points to `your-backend.onrender.com` or other placeholders. Production uses `/api` automatically.
4. Edit `frontend/vercel.json` — replace `REPLACE-WITH-YOUR-RENDER-APP` with your actual Render hostname (no trailing slash):
   ```json
   "destination": "https://console-ecommerce-api.onrender.com/api/:path*"
   ```
5. Commit, push, and redeploy

**Why `/api` proxy?** The browser calls your Vercel domain (`/api/...`), and Vercel forwards to Render. Same-origin requests avoid CORS entirely — no wildcard `*` issues with credentials.

If the build log still shows `npm install --prefix frontend`, the dashboard override was not cleared — that command only works when Root Directory is the repo root, not `frontend`.

### MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user (e.g. `adminconsole`) with a password
3. **Network Access** → add `0.0.0.0/0` (or your IP) so Atlas accepts connections
4. In `backend/.env`, set `MONGO_URI` — replace `YOUR_PASSWORD` with your real password:

```env
MONGO_URI=mongodb+srv://adminconsole:YOUR_PASSWORD@cluster0.njmaucf.mongodb.net/console_ecommerce?retryWrites=true&w=majority&appName=Cluster0
```

5. Seed the database:

```bash
cd backend
npm run seed
```

## License

MIT © 2026 Console Ecommerce. All Rights Reserved.
