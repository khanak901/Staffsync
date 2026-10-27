const express = require('express');
const router = express.Router();
const {
  getAllTrainings,
  createTraining,
  enrollTraining,
  updateTrainingProgress,
} = require('../controllers/trainingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getAllTrainings);
router.post('/', protect, authorize('hr', 'manager'), createTraining);
router.post('/:id/enroll', protect, enrollTraining);
router.put('/:id/progress', protect, updateTrainingProgress);

module.exports = router;
