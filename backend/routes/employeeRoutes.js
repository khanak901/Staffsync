const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getMyTeam,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getAllEmployees);
router.get('/team/me', protect, authorize('manager', 'hr'), getMyTeam);
router.get('/:id', protect, getEmployeeById);
router.post('/', protect, authorize('hr'), createEmployee);
router.put('/:id', protect, authorize('hr', 'manager'), updateEmployee);
router.delete('/:id', protect, authorize('hr'), deleteEmployee);

module.exports = router;
