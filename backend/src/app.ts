import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import studyPlanRoutes from './routes/studyPlanRoutes';
import graphRoutes from './routes/graphRoutes';
import performanceLogRoutes from './routes/performanceLogRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

export const app: Express = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://synapse-gamma-mocha.vercel.app',
];

// Add origins from environment variable if present
if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(',').forEach(o => {
    const trimmed = o.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(cors({
  origin: (origin, cb) => {
    // Allow if no origin (non-browser), wildcard in list, or origin in list
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    
    // Log for debugging on Render
    console.warn(`[CORS] Rejected origin: ${origin}`);
    console.warn(`[CORS] Allowed list: ${allowedOrigins.join(', ')}`);
    return cb(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// Explicitly handle pre-flight requests for all routes
app.options('*', cors());

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request logger (dev) ──────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',        authRoutes);          // public
app.use('/api/v1/plans',       studyPlanRoutes);
app.use('/api/v1/graph',       graphRoutes);
app.use('/api/v1/performance', performanceLogRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[GlobalError]', err.message);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});
