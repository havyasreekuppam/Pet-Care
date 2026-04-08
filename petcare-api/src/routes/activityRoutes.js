import express from 'express';
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

// ✅ Base routes
router.get('/', getActivities);
router.post('/', createActivity);

// ✅ IMPORTANT: Specific routes BEFORE dynamic routes
router.get('/filter', filterActivities);
router.get('/vet-counter/:petName', vetCounter);

// ✅ Dynamic routes (must be last)
router.get('/:id', getActivityById);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);

export default router;