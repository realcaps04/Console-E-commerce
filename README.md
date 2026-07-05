# Console Ecommerce

**Premium AI Powered MERN Stack E-Commerce Platform**

A production-ready full-stack e-commerce application built with React, Vite, Node.js, Express, MongoDB, Redux Toolkit, and JWT authentication.

## Features

- JWT Authentication with refresh tokens and bcrypt password encryption
- Role-based access control (Admin / User)
- Product CRUD with search, filter, sort, and pagination
- Shopping cart (guest + authenticated) with coupon codes
- Checkout with mock payment gateway and COD
- Order management with tracking and cancellation
- Intelligent recommendation engine (RapidMiner + fallback)
- Admin dashboard with analytics
- Contact form with React Hook Form validation
- Responsive premium UI
- Deployment ready for Vercel + Render

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, Vite, Redux Toolkit, Tailwind CSS, Axios |
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

## License

MIT © 2026 Console Ecommerce. All Rights Reserved.
