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
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    // Allow non-browser requests (curl, Postman) and whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true,
}));

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
