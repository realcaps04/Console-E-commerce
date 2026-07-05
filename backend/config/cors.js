const parseAllowedOrigins = () =>
  (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

export const isAllowedOrigin = (origin) => {
  const allowedOrigins = parseAllowedOrigins();

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Allow Vercel production + preview URLs when listed in CLIENT_URL or in development
  if (/^https:\/\/[\w.-]+\.vercel\.app$/.test(origin)) {
    return (
      allowedOrigins.some((entry) => entry.includes('.vercel.app')) ||
      process.env.NODE_ENV !== 'production'
    );
  }

  return false;
};

export const corsOptions = {
  origin(origin, callback) {
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, origin || true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

export const logAllowedOrigins = () => {
  const origins = parseAllowedOrigins();
  console.log(`CORS allowed origins: ${origins.join(', ')}`);
};
