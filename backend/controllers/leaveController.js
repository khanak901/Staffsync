const dbStore = require('../services/dbStore');

// Calculate day difference between two YYYY-MM-DD dates
const calculateDays = (start, end) => {
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
};

// @desc    Apply for leave (Employee)
// @route   POST /api/leaves/apply
// @access  Private (Employee)
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Please fill all required leave details' });
    }

    const employee = dbStore.findEmployeeById(req.user.employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const totalDays = calculateDays(startDate, endDate);

    // Check balances
    const balanceKey =
      leaveType === 'Sick Leave' ? 'sick' : leaveType === 'Casual Leave' ? 'casual' : 'annual';

    if (employee.leaveBalances && employee.leaveBalances[balanceKey] < totalDays) {
      return res.status(400).json({
        success: false,
        message: `Insufficient leave balance! You have ${employee.leaveBalances[balanceKey]} days available for ${leaveType}, but requested ${totalDays} days.`,
      });
    }

    const newLeave = {
      _id: `lev-${Date.now()}`,
      employeeId: req.user.employeeId,
      employeeName: req.user.name,
      department: employee.department,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      status: 'Pending',
      appliedAt: new Date(),
      reviewedBy: null,
      reviewComments: '',
      reviewedAt: null,
    };

    dbStore.addLeave(newLeave);

    // Send notification to manager / HR
    const managerEmpId = employee.managerId || 'EMP-MGR-002';
    dbStore.addNotification({
      _id: `notif-${Date.now()}`,
      recipientId: managerEmpId,
      title: `New Leave Request from ${req.user.name}`,
      message: `${req.user.name} applied for ${totalDays} days of ${leaveType} (${startDate} to ${endDate}).`,
      type: 'leave',
      isRead: false,
      link: '/leaves',
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully for review',
      data: newLeave,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my leaves and balances
// @route   GET /api/leaves/my
// @access  Private
const getMyLeaves = async (req, res) => {
  try {
    const list = dbStore.getLeaves({ employeeId: req.user.employeeId });
    const employee = dbStore.findEmployeeById(req.user.employeeId);

    res.json({
      success: true,
      data: list,
      balances: employee ? employee.leaveBalances : { sick: 12, casual: 10, annual: 18 },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all leaves (Manager / HR view)
// @route   GET /api/leaves
// @access  Private (Manager / HR)
const getAllLeaves = async (req, res) => {
  try {
    const { status, department, employeeId } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (department && department !== 'All') filters.department = department;
    if (employeeId) filters.employeeId = employeeId;

    let leaves = dbStore.getLeaves(filters);

    // If manager, filter to their team or department
    if (req.user.role === 'manager') {
      const mgr = dbStore.findEmployeeById(req.user.employeeId);
      if (mgr && (!department || department === 'All')) {
        leaves = leaves.filter((l) => l.department === mgr.department);
      }
    }

    const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
    const approvedCount = leaves.filter((l) => l.status === 'Approved').length;
    const rejectedCount = leaves.filter((l) => l.status === 'Rejected').length;

    res.json({
      success: true,
      count: leaves.length,
      data: leaves,
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Review / Approve / Reject leave
// @route   PUT /api/leaves/:id/review
// @access  Private (Manager / HR)
const reviewLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewComments } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
    }

    const leave = dbStore.findLeaveById(id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const updated = dbStore.updateLeave(id, {
      status,
      reviewComments: reviewComments || (status === 'Approved' ? 'Approved by supervisor' : 'Rejected after review'),
      reviewedBy: req.user.name,
      reviewedAt: new Date(),
    });

    // If approved, deduct balance from employee profile
    if (status === 'Approved') {
      const emp = dbStore.findEmployeeById(leave.employeeId);
      if (emp && emp.leaveBalances) {
        const typeKey =
          leave.leaveType === 'Sick Leave' ? 'sick' : leave.leaveType === 'Casual Leave' ? 'casual' : 'annual';
        const currentBal = emp.leaveBalances[typeKey] || 0;
        emp.leaveBalances[typeKey] = Math.max(0, currentBal - leave.totalDays);
        dbStore.updateEmployee(emp.employeeId, { leaveBalances: emp.leaveBalances });
      }
    }

    // Send notification to employee
    dbStore.addNotification({
      _id: `notif-${Date.now()}`,
      recipientId: leave.employeeId,
      title: `Leave Request ${status}`,
      message: `Your request for ${leave.totalDays} day(s) of ${leave.leaveType} was ${status.toLowerCase()} by ${req.user.name}. ${reviewComments ? `Note: "${reviewComments}"` : ''}`,
      type: 'leave',
      isRead: false,
      link: '/leaves',
      createdAt: new Date(),
    });

    res.json({
      success: true,
      message: `Leave request has been ${status.toLowerCase()}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
};
