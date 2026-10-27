const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  targetAudience: {
    type: String,
    enum: ['All', 'Engineering', 'Human Resources', 'Marketing', 'Sales', 'Finance', 'Design', 'Operations'],
    default: 'All',
  },
  postedBy: {
    type: String,
    default: 'HR Department',
  },
  postedByRole: {
    type: String,
    default: 'hr',
  },
  category: {
    type: String,
    enum: ['General', 'Policy', 'Event', 'Holiday', 'Alert', 'Celebration'],
    default: 'General',
  },
  pinned: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
