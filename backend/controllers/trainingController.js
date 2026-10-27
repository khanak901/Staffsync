const dbStore = require('../services/dbStore');

// @desc    Get all training programs
// @route   GET /api/trainings
// @access  Private
const getAllTrainings = async (req, res) => {
  try {
    const trainings = dbStore.getTrainings();
    res.json({
      success: true,
      count: trainings.length,
      data: trainings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new training program (HR / Manager)
// @route   POST /api/trainings
// @access  Private (HR / Manager)
const createTraining = async (req, res) => {
  try {
    const { title, description, trainer, department, startDate, endDate, durationHours, capacity, location } =
      req.body;

    if (!title || !description || !trainer || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Please provide all required training details' });
    }

    const newTraining = {
      _id: `trn-${Date.now()}`,
      title,
      description,
      trainer,
      department: department || 'All',
      startDate,
      endDate,
      durationHours: Number(durationHours) || 8,
      capacity: Number(capacity) || 30,
      location: location || 'Virtual (Google Meet / Zoom)',
      status: 'Upcoming',
      enrolledEmployees: [],
      materials: [
        { title: 'Session Syllabus & Overview', url: 'https://staffsync.internal/training/overview.pdf' },
      ],
      createdAt: new Date(),
    };

    dbStore.addTraining(newTraining);

    // Notify company or department
    dbStore.addNotification({
      _id: `notif-${Date.now()}`,
      recipientId: 'ALL',
      title: `New Training Program: ${title}`,
      message: `${trainer} will be hosting "${title}". Enroll now!`,
      type: 'training',
      isRead: false,
      link: '/trainings',
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Training program created successfully',
      data: newTraining,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Enroll in training (Employee)
// @route   POST /api/trainings/:id/enroll
// @access  Private
const enrollTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const training = dbStore.findTrainingById(id);

    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }

    const alreadyEnrolled = training.enrolledEmployees.some((e) => e.employeeId === req.user.employeeId);
    if (alreadyEnrolled) {
      return res.status(400).json({ success: false, message: 'You are already enrolled in this training program' });
    }

    if (training.enrolledEmployees.length >= training.capacity) {
      return res.status(400).json({ success: false, message: 'Training capacity full!' });
    }

    const updatedEnrolled = [
      ...training.enrolledEmployees,
      {
        employeeId: req.user.employeeId,
        employeeName: req.user.name,
        enrolledAt: new Date(),
        progress: 0,
        completed: false,
      },
    ];

    const updated = dbStore.updateTraining(id, { enrolledEmployees: updatedEnrolled });

    // Send confirmation notification
    dbStore.addNotification({
      _id: `notif-${Date.now()}`,
      recipientId: req.user.employeeId,
      title: 'Enrolled in Training',
      message: `You are enrolled in "${training.title}". Class commences on ${training.startDate}.`,
      type: 'training',
      isRead: false,
      link: '/trainings',
      createdAt: new Date(),
    });

    res.json({
      success: true,
      message: 'Successfully enrolled in training program!',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update employee training progress
// @route   PUT /api/trainings/:id/progress
// @access  Private
const updateTrainingProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;
    const training = dbStore.findTrainingById(id);

    if (!training) {
      return res.status(404).json({ success: false, message: 'Training program not found' });
    }

    const enrolled = [...training.enrolledEmployees];
    const idx = enrolled.findIndex((e) => e.employeeId === req.user.employeeId);

    if (idx === -1) {
      return res.status(400).json({ success: false, message: 'You are not enrolled in this program' });
    }

    const newProgress = Math.min(100, Math.max(0, Number(progress) || 0));
    enrolled[idx].progress = newProgress;
    enrolled[idx].completed = newProgress === 100;

    const updated = dbStore.updateTraining(id, { enrolledEmployees: enrolled });

    res.json({
      success: true,
      message: 'Progress updated',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllTrainings,
  createTraining,
  enrollTraining,
  updateTrainingProgress,
};
