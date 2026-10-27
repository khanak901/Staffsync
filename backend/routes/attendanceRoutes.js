const express = require('express');
const router = express.Router();
const {
  getTodayStatus,
  clockIn,
  clockOut,
  getMyAttendance,
  getAllAttendance,
  addManualAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/today', protect, getTodayStatus);
router.post('/clock-in', protect, clockIn);
router.post('/clock-out', protect, clockOut);
router.get('/my', protect, getMyAttendance);
router.get('/', protect, authorize('hr', 'manager'), getAllAttendance);
router.post('/manual', protect, authorize('hr'), addManualAttendance);

module.exports = router;
