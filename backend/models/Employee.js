const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    default: '+1 (555) 000-0000',
  },
  department: {
    type: String,
    required: true,
    enum: ['Engineering', 'Human Resources', 'Marketing', 'Sales', 'Finance', 'Design', 'Operations'],
    default: 'Engineering',
  },
  designation: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['employee', 'manager', 'hr'],
    default: 'employee',
  },
  managerId: {
    type: String,
    default: null,
  },
  managerName: {
    type: String,
    default: 'Unassigned',
  },
  salary: {
    type: Number,
    default: 65000,
  },
  joiningDate: {
    type: String,
    default: () => new Date().toISOString().split('T')[0],
  },
  employmentType: {
    type: String,
    enum: ['Full-Time', 'Part-Time', 'Contract', 'Intern'],
    default: 'Full-Time',
  },
  address: {
    street: { type: String, default: '123 Innovation Way' },
    city: { type: String, default: 'San Francisco' },
    state: { type: String, default: 'CA' },
    zipCode: { type: String, default: '94105' },
    country: { type: String, default: 'USA' },
  },
  emergencyContact: {
    name: { type: String, default: 'Primary Contact' },
    relationship: { type: String, default: 'Spouse/Parent' },
    phone: { type: String, default: '+1 (555) 999-8888' },
  },
  leaveBalances: {
    sick: { type: Number, default: 12 },
    casual: { type: Number, default: 10 },
    annual: { type: Number, default: 18 },
  },
  status: {
    type: String,
    enum: ['Active', 'On-Leave', 'Probation', 'Terminated'],
    default: 'Active',
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  skills: [{ type: String }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);
