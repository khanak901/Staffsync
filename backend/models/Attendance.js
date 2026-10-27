const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
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
  date: {
    type: String, // YYYY-MM-DD
    required: true,
    index: true,
  },
  checkIn: {
    type: String, // HH:mm:ss or timestamp string
    default: null,
  },
  checkOut: {
    type: String,
    default: null,
  },
  totalHours: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Present', 'Late', 'Half-day', 'Absent', 'On-Leave'],
    default: 'Present',
  },
  workLocation: {
    type: String,
    enum: ['Office', 'Remote', 'Client-Site'],
    default: 'Office',
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
