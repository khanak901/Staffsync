const mongoose = require('mongoose');

const ManagerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  teamMembers: [{
    type: String, // employeeIds
  }],
  budget: {
    type: Number,
    default: 150000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Manager || mongoose.model('Manager', ManagerSchema);
