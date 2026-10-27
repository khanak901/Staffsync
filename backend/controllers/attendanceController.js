const dbStore = require('../services/dbStore');

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const formatTime = (dateObj) => {
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// @desc    Get attendance status for today for current user
// @route   GET /api/attendance/today
// @access  Private
const getTodayStatus = async (req, res) => {
  try {
    const today = getTodayDateString();
    const record = dbStore.findAttendanceToday(req.user.employeeId, today);

    res.json({
      success: true,
      data: record || null,
      todayDate: today,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clock In / Punch Attendance
// @route   POST /api/attendance/clock-in
// @access  Private (Employee)
const clockIn = async (req, res) => {
  try {
    const today = getTodayDateString();
    const existing = dbStore.findAttendanceToday(req.user.employeeId, today);

    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already clocked in for today!' });
    }

    const now = new Date();
    const timeStr = formatTime(now);

    // If clocking in after 9:30 AM, flag as Late
    const hour = now.getHours();
    const minute = now.getMinutes();
    const isLate = hour > 9 || (hour === 9 && minute > 30);

    const emp = dbStore.findEmployeeById(req.user.employeeId);

    const newRecord = {
      _id: `att-${Date.now()}`,
      employeeId: req.user.employeeId,
      employeeName: req.user.name,
      department: emp ? emp.department : 'General',
      date: today,
      checkIn: timeStr,
      checkOut: null,
      totalHours: 0,
      status: isLate ? 'Late' : 'Present',
      workLocation: req.body.workLocation || 'Office',
      notes: req.body.notes || (isLate ? 'Late arrival recorded' : 'On-time check-in'),
      createdAt: now,
    };

    dbStore.addAttendance(newRecord);

    res.status(201).json({
      success: true,
      message: `Clocked in successfully at ${timeStr}`,
      data: newRecord,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clock Out
// @route   POST /api/attendance/clock-out
// @access  Private (Employee)
const clockOut = async (req, res) => {
  try {
    const today = getTodayDateString();
    const existing = dbStore.findAttendanceToday(req.user.employeeId, today);

    if (!existing) {
      return res.status(400).json({ success: false, message: 'You have not clocked in today yet!' });
    }

    if (existing.checkOut) {
      return res.status(400).json({ success: false, message: 'You have already clocked out for today!' });
    }

    const now = new Date();
    const timeStr = formatTime(now);

    // Calculate approximate hours worked (assuming 8 hours or proportional)
    const checkInTime = new Date(existing.createdAt || Date.now());
    const diffMs = now - checkInTime;
    const hours = Math.max(1, +(diffMs / (1000 * 60 * 60)).toFixed(1));

    const updated = dbStore.updateAttendance(existing._id, {
      checkOut: timeStr,
      totalHours: hours > 1 ? hours : 8.0,
      notes: existing.notes + (req.body.notes ? ` | Out: ${req.body.notes}` : ''),
    });

    res.json({
      success: true,
      message: `Clocked out successfully at ${timeStr}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance records for current user
// @route   GET /api/attendance/my
// @access  Private
const getMyAttendance = async (req, res) => {
  try {
    const list = dbStore.getAttendance({ employeeId: req.user.employeeId });
    res.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all attendance records (HR / Manager view)
// @route   GET /api/attendance
// @access  Private (HR / Manager)
const getAllAttendance = async (req, res) => {
  try {
    const { date, department, employeeId } = req.query;
    const filters = {};
    if (date) filters.date = date;
    if (department && department !== 'All') filters.department = department;
    if (employeeId) filters.employeeId = employeeId;

    let records = dbStore.getAttendance(filters);

    // If manager, only their department or team if not HR
    if (req.user.role === 'manager') {
      const mgr = dbStore.findEmployeeById(req.user.employeeId);
      if (mgr && (!department || department === 'All')) {
        records = records.filter((r) => r.department === mgr.department);
      }
    }

    // Summary statistics for selected date/filter
    const presentCount = records.filter((r) => r.status === 'Present').length;
    const lateCount = records.filter((r) => r.status === 'Late').length;
    const leaveCount = records.filter((r) => r.status === 'On-Leave').length;

    res.json({
      success: true,
      count: records.length,
      data: records,
      stats: {
        total: records.length,
        present: presentCount,
        late: lateCount,
        onLeave: leaveCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add manual attendance record (HR override)
// @route   POST /api/attendance/manual
// @access  Private (HR)
const addManualAttendance = async (req, res) => {
  try {
    const { employeeId, date, checkIn, checkOut, status, workLocation, notes } = req.body;

    const emp = dbStore.findEmployeeById(employeeId);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const newRecord = {
      _id: `att-${Date.now()}`,
      employeeId,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      date: date || getTodayDateString(),
      checkIn: checkIn || '09:00 AM',
      checkOut: checkOut || '05:30 PM',
      totalHours: 8.5,
      status: status || 'Present',
      workLocation: workLocation || 'Office',
      notes: notes || 'Manual entry by HR admin',
      createdAt: new Date(),
    };

    dbStore.addAttendance(newRecord);

    res.status(201).json({
      success: true,
      message: 'Attendance entry created',
      data: newRecord,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTodayStatus,
  clockIn,
  clockOut,
  getMyAttendance,
  getAllAttendance,
  addManualAttendance,
};
