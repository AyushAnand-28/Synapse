import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import studyPlanRoutes from './routes/studyPlanRoutes';
import graphRoutes from './routes/graphRoutes';

dotenv.config();

export const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup API routes
app.use('/api/v1/plans', studyPlanRoutes);
app.use('/api/v1/graph', graphRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});
