import express from 'express';
import { authorize } from '../middleware/auth.js';
import { createActivityLimiter } from '../middleware/rateLimiter.js';
import {
  createActivity,
  deleteActivity,
  filterActivities,
  getActivityById,
  getActivities,
  updateActivity,
  vetCounter
} from '../controllers/activityController.js';

const router = express.Router();

// ✅ Read-only routes (GET - generally allowed for all roles)
router.get('/', getActivities);
router.get('/filter', filterActivities);
router.get('/vet-counter/:petName', vetCounter);
router.get('/:id', getActivityById);

// ✅ Write routes (POST/PUT/DELETE - rate limited)
// Development: allow all users to create
// Production: require admin/user role (uncomment authorize check)
router.post('/', createActivityLimiter, createActivity);
router.put('/:id', authorize(['admin', 'user']), updateActivity);
router.delete('/:id', authorize(['admin']), deleteActivity);

export default router;