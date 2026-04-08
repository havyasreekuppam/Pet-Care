import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

import logger from './middleware/logger.js';
import { authenticate, generateToken } from './middleware/auth.js';
import { generalLimiter, createActivityLimiter, readLimiter } from './middleware/rateLimiter.js';
import { monitoringMiddleware, metricsHandler } from './middleware/monitoring.js';
import activityRoutes from './routes/activityRoutes.js';
import { healthHandler } from './controllers/activityController.js';

dotenv.config();

const app = express();
const isDevelopment = process.env.NODE_ENV !== 'production';

// ✅ Security Middleware - MUST be first
// Helmet.js sets various HTTP headers for security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// ✅ CORS - Lockdown to specific origins
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()) 
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
}));

// ✅ Response Compression - Turbo optimization
app.use(compression({
  level: 6, // Compression level (0-9)
  threshold: 1024 // Only compress responses larger than 1KB
}));

// ✅ Body Parser Middleware
app.use(express.json({ limit: '10kb' })); // Limit payload size for security
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// ✅ Logging Middleware
if (isDevelopment) {
  app.use(logger);
} else {
  // Production: use morgan for better HTTP logging
  app.use(morgan('combined', {
    skip: (req) => req.path === '/api/health' // Don't log health checks
  }));
}

// ✅ Rate Limiting - Protect against DDoS
app.use(generalLimiter); // Apply to all routes

// ✅ Authentication & User Context
app.use(authenticate);

// ✅ Monitoring Middleware - Track metrics
app.use(monitoringMiddleware);

// ✅ Debug log to confirm router is mounted
app.use('/api/activities', (req, res, next) => {
  console.log(`➡️ Activities route hit: ${req.method} ${req.url} [User: ${req.user.role}]`);
  next();
});

// ✅ Routes
app.get('/api/health', healthHandler);
app.get('/api/metrics', metricsHandler); // Metrics endpoint
app.use('/api/activities', readLimiter, activityRoutes); // Apply read limiter

// ✅ Test endpoint to generate JWT token (for development)
if (isDevelopment) {
  app.post('/api/test/token', (req, res) => {
    const token = generateToken('test-user', 'admin');
    res.json({ 
      token, 
      message: 'Test token generated (development only)',
      usage: 'Add to request header: Authorization: Bearer <token>'
    });
  });
}

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route Not Found',
    path: req.path,
    method: req.method 
  });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error('Error:', {
    timestamp: new Date().toISOString(),
    status: statusCode,
    message,
    path: req.path,
    method: req.method,
    stack: isDevelopment ? err.stack : undefined
  });

  res.status(statusCode).json({
    error: message,
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
});

export default app;