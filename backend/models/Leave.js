const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    index: true,
  },
  employeeName: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  leaveType: {
    type: String,
    enum: ['Sick Leave', 'Casual Leave', 'Annual Leave', 'Maternity/Paternity', 'Unpaid Leave'],
    required: true,
  },
  startDate: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  endDate: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  totalDays: {
    type: Number,
    required: true,
    min: 1,
  },
  reason: {
    type: String,
    required: [true, 'Please provide reason for leave'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
    index: true,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedBy: {
    type: String,
    default: null,
  },
  reviewComments: {
    type: String,
    default: '',
  },
  reviewedAt: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.models.Leave || mongoose.model('Leave', LeaveSchema);
