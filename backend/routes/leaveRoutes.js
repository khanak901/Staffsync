const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/apply', protect, applyLeave);
router.get('/my', protect, getMyLeaves);
router.get('/', protect, authorize('hr', 'manager'), getAllLeaves);
router.put('/:id/review', protect, authorize('hr', 'manager'), reviewLeave);

module.exports = router;
