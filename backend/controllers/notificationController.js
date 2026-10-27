const dbStore = require('../services/dbStore');

// @desc    Get current user notifications
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res) => {
  try {
    const list = dbStore.getNotifications(req.user.employeeId);
    const unreadCount = list.filter((n) => !n.isRead).length;

    res.json({
      success: true,
      unreadCount,
      data: list,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notif = dbStore.markNotificationAsRead(req.params.id);
    res.json({
      success: true,
      data: notif,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllRead = async (req, res) => {
  try {
    dbStore.markAllNotificationsAsRead(req.user.employeeId);
    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllRead,
};
