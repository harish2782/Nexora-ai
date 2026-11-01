import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';

import authRouter from './routes/auth';
import resumesRouter from './routes/resumes';
import analysesRouter from './routes/analyses';
import roadmapRouter from './routes/roadmap';
import skillsRouter from './routes/skills';
import rolesRouter from './routes/roles';
import projectsRouter from './routes/projects';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/resumes', resumesRouter);
app.use('/api/analyses', analysesRouter);
app.use('/api/roadmap-tasks', roadmapRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/projects', projectsRouter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Nexora API running on http://localhost:${PORT}`);
});

export default app;
