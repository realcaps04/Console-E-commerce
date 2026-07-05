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
VITE_API_URL=http://localhost:5000/api
```

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

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set root directory to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables from `.env.example`

### Frontend (Vercel)

1. Import the repository on Vercel
2. **Settings → General → Root Directory:** set to `frontend` and save
3. **Settings → Build & Development:** turn **OFF** any overrides for Install / Build / Output, or set them exactly to:
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Replace `YOUR_RENDER_BACKEND_URL` in `frontend/vercel.json` with your Render backend host (no trailing slash)
5. Add environment variable `VITE_API_URL` = `https://your-app.onrender.com/api`
6. Redeploy

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
