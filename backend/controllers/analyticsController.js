const dbStore = require('../services/dbStore');

// @desc    Get comprehensive HR & Organization Analytics
// @route   GET /api/analytics/dashboard
// @access  Private (HR / Manager)
const getDashboardStats = async (req, res) => {
  try {
    const employees = dbStore.getEmployees();
    const today = new Date().toISOString().split('T')[0];
    const attendanceToday = dbStore.getAttendance({ date: today });
    const leaves = dbStore.getLeaves();
    const announcements = dbStore.getAnnouncements();
    const trainings = dbStore.getTrainings();

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter((e) => e.status === 'Active').length;

    // Attendance stats today
    const presentToday = attendanceToday.filter((a) => a.status === 'Present').length;
    const lateToday = attendanceToday.filter((a) => a.status === 'Late').length;
    const onLeaveToday = attendanceToday.filter((a) => a.status === 'On-Leave').length;
    const attendanceRate = totalEmployees > 0 ? Math.round(((presentToday + lateToday) / totalEmployees) * 100) : 0;

    // Department breakdown
    const departmentCounts = {};
    employees.forEach((emp) => {
      departmentCounts[emp.department] = (departmentCounts[emp.department] || 0) + 1;
    });

    const departmentStats = Object.keys(departmentCounts).map((dept) => ({
      department: dept,
      count: departmentCounts[dept],
      percentage: Math.round((departmentCounts[dept] / totalEmployees) * 100),
    }));

    // Leave breakdown
    const pendingLeaves = leaves.filter((l) => l.status === 'Pending').length;
    const approvedLeaves = leaves.filter((l) => l.status === 'Approved').length;
    const rejectedLeaves = leaves.filter((l) => l.status === 'Rejected').length;

    const leaveTypeCounts = {};
    leaves.forEach((l) => {
      leaveTypeCounts[l.leaveType] = (leaveTypeCounts[l.leaveType] || 0) + 1;
    });

    // Payroll overview
    const totalPayroll = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
    const averageSalary = totalEmployees > 0 ? Math.round(totalPayroll / totalEmployees) : 0;

    // Recent activity (combining latest leaves, announcements, clock ins)
    const recentActivity = [
      ...leaves.slice(0, 3).map((l) => ({
        type: 'leave',
        title: `Leave Request: ${l.employeeName}`,
        subtitle: `${l.leaveType} (${l.totalDays}d) - ${l.status}`,
        timestamp: l.appliedAt,
        badge: l.status,
      })),
      ...announcements.slice(0, 2).map((a) => ({
        type: 'announcement',
        title: `Announcement: ${a.title}`,
        subtitle: `Posted by ${a.postedBy}`,
        timestamp: a.createdAt,
        badge: a.priority,
      })),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: {
        summary: {
          totalEmployees,
          activeEmployees,
          presentToday,
          lateToday,
          onLeaveToday,
          attendanceRate,
          pendingLeaves,
          approvedLeaves,
          rejectedLeaves,
          totalAnnouncements: announcements.length,
          activeTrainings: trainings.filter((t) => t.status === 'In-Progress' || t.status === 'Upcoming').length,
          totalPayroll,
          averageSalary,
        },
        departmentStats,
        leaveTypeCounts,
        recentActivity,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats };
