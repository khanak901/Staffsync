const dbStore = require('../services/dbStore');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
const getAllAnnouncements = async (req, res) => {
  try {
    const list = dbStore.getAnnouncements();
    const userEmp = dbStore.findEmployeeById(req.user.employeeId);
    const userDept = userEmp ? userEmp.department : 'All';

    // Filter announcements relevant to user (All or their specific department, unless HR)
    let filtered = list;
    if (req.user.role !== 'hr') {
      filtered = list.filter(
        (a) => a.targetAudience === 'All' || a.targetAudience.toLowerCase() === userDept.toLowerCase()
      );
    }

    res.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create announcement (HR or Manager)
// @route   POST /api/announcements
// @access  Private (HR / Manager)
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority, targetAudience, category, pinned } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Please provide title and content' });
    }

    const newAnnouncement = {
      _id: `ann-${Date.now()}`,
      title,
      content,
      priority: priority || 'Medium',
      targetAudience: targetAudience || 'All',
      postedBy: req.user.name,
      postedByRole: req.user.role,
      category: category || 'General',
      pinned: !!pinned,
      createdAt: new Date(),
    };

    dbStore.addAnnouncement(newAnnouncement);

    // Broadcast notification to ALL or target department
    dbStore.addNotification({
      _id: `notif-${Date.now()}`,
      recipientId: 'ALL',
      title: `Company Announcement: ${title}`,
      message: `${req.user.name} posted: ${title}`,
      type: 'announcement',
      isRead: false,
      link: '/announcements',
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Announcement posted successfully',
      data: newAnnouncement,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (HR only)
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = dbStore.deleteAnnouncement(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
};
