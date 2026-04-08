import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import logger from './middleware/logger.js';
import activityRoutes from './routes/activityRoutes.js';
import { healthHandler } from './controllers/activityController.js';

dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors({ origin: ['http://localhost:5173'] }));
app.use(express.json());
app.use(logger);

// ✅ Debug log to confirm router is mounted
app.use('/api/activities', (req, res, next) => {
  console.log(`➡️ Activities route hit: ${req.method} ${req.url}`);
  next();
});

// ✅ Routes
app.get('/api/health', healthHandler);
app.use('/api/activities', activityRoutes);

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route Not Found' });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

export default app;