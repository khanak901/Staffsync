const mongoose = require('mongoose');

const TrainingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  trainer: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    default: 'All',
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  durationHours: {
    type: Number,
    default: 8,
  },
  capacity: {
    type: Number,
    default: 30,
  },
  location: {
    type: String,
    default: 'Virtual / Google Meet',
  },
  status: {
    type: String,
    enum: ['Upcoming', 'In-Progress', 'Completed'],
    default: 'Upcoming',
  },
  enrolledEmployees: [
    {
      employeeId: { type: String, required: true },
      employeeName: { type: String, required: true },
      enrolledAt: { type: Date, default: Date.now },
      progress: { type: Number, default: 0 },
      completed: { type: Boolean, default: false },
    },
  ],
  materials: [
    {
      title: String,
      url: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Training || mongoose.model('Training', TrainingSchema);
