const fs = require('fs');
const path = require('path');
const { initialData } = require('../seed/seedData');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

class DataStore {
  constructor() {
    this.data = {
      users: [],
      employees: [],
      managers: [],
      attendance: [],
      leaves: [],
      announcements: [],
      trainings: [],
      notifications: [],
    };
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        if (fileContent && fileContent.trim().length > 0) {
          this.data = JSON.parse(fileContent);
          // Check that all required collections exist
          for (const key of Object.keys(initialData)) {
            if (!this.data[key]) {
              this.data[key] = [...initialData[key]];
            }
          }
          console.log(' Local DataStore loaded from file persistence.');
          return;
        }
      }

      // If no file exists, seed with initialData
      this.resetToSeed();
    } catch (err) {
      console.warn(' Failed loading existing db.json, initializing from seedData:', err.message);
      this.resetToSeed();
    }
  }

  resetToSeed() {
    this.data = JSON.parse(JSON.stringify(initialData));
    this.save();
    console.log(' Local DataStore initialized with rich default seed data.');
  }

  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error(' Error persisting data to disk:', err.message);
    }
  }

  // Users
  getUsers() {
    return this.data.users;
  }
  findUserByEmail(email) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
  findUserById(id) {
    return this.data.users.find((u) => u._id === id || u.employeeId === id);
  }
  addUser(user) {
    this.data.users.push(user);
    this.save();
    return user;
  }
  updateUser(id, updates) {
    const idx = this.data.users.findIndex((u) => u._id === id || u.employeeId === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
      return this.data.users[idx];
    }
    return null;
  }

  // Employees
  getEmployees() {
    return this.data.employees;
  }
  findEmployeeById(id) {
    return this.data.employees.find((e) => e._id === id || e.employeeId === id);
  }
  findEmployeeByEmail(email) {
    return this.data.employees.find((e) => e.email.toLowerCase() === email.toLowerCase());
  }
  addEmployee(emp) {
    this.data.employees.push(emp);
    this.save();
    return emp;
  }
  updateEmployee(id, updates) {
    const idx = this.data.employees.findIndex((e) => e._id === id || e.employeeId === id);
    if (idx !== -1) {
      this.data.employees[idx] = { ...this.data.employees[idx], ...updates };
      this.save();
      return this.data.employees[idx];
    }
    return null;
  }
  deleteEmployee(id) {
    const initialLen = this.data.employees.length;
    this.data.employees = this.data.employees.filter((e) => e._id !== id && e.employeeId !== id);
    this.data.users = this.data.users.filter((u) => u._id !== id && u.employeeId !== id);
    this.save();
    return this.data.employees.length < initialLen;
  }

  // Managers
  getManagers() {
    return this.data.managers;
  }
  findManagerByEmployeeId(empId) {
    return this.data.managers.find((m) => m.employeeId === empId);
  }

  // Attendance
  getAttendance(filters = {}) {
    let records = [...this.data.attendance];
    if (filters.employeeId) {
      records = records.filter((r) => r.employeeId === filters.employeeId);
    }
    if (filters.date) {
      records = records.filter((r) => r.date === filters.date);
    }
    if (filters.department && filters.department !== 'All') {
      records = records.filter((r) => r.department === filters.department);
    }
    return records.sort((a, b) => (b.date > a.date ? 1 : -1));
  }
  findAttendanceToday(employeeId, todayDate) {
    return this.data.attendance.find((a) => a.employeeId === employeeId && a.date === todayDate);
  }
  addAttendance(record) {
    this.data.attendance.push(record);
    this.save();
    return record;
  }
  updateAttendance(id, updates) {
    const idx = this.data.attendance.findIndex((a) => a._id === id);
    if (idx !== -1) {
      this.data.attendance[idx] = { ...this.data.attendance[idx], ...updates };
      this.save();
      return this.data.attendance[idx];
    }
    return null;
  }

  // Leaves
  getLeaves(filters = {}) {
    let records = [...this.data.leaves];
    if (filters.employeeId) {
      records = records.filter((l) => l.employeeId === filters.employeeId);
    }
    if (filters.status && filters.status !== 'All') {
      records = records.filter((l) => l.status === filters.status);
    }
    if (filters.department && filters.department !== 'All') {
      records = records.filter((l) => l.department === filters.department);
    }
    return records.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
  }
  findLeaveById(id) {
    return this.data.leaves.find((l) => l._id === id);
  }
  addLeave(leave) {
    this.data.leaves.unshift(leave);
    this.save();
    return leave;
  }
  updateLeave(id, updates) {
    const idx = this.data.leaves.findIndex((l) => l._id === id);
    if (idx !== -1) {
      this.data.leaves[idx] = { ...this.data.leaves[idx], ...updates };
      this.save();
      return this.data.leaves[idx];
    }
    return null;
  }

  // Announcements
  getAnnouncements() {
    return [...this.data.announcements].sort(
      (a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.createdAt) - new Date(a.createdAt)
    );
  }
  findAnnouncementById(id) {
    return this.data.announcements.find((a) => a._id === id);
  }
  addAnnouncement(ann) {
    this.data.announcements.unshift(ann);
    this.save();
    return ann;
  }
  deleteAnnouncement(id) {
    const len = this.data.announcements.length;
    this.data.announcements = this.data.announcements.filter((a) => a._id !== id);
    this.save();
    return this.data.announcements.length < len;
  }

  // Trainings
  getTrainings() {
    return [...this.data.trainings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  findTrainingById(id) {
    return this.data.trainings.find((t) => t._id === id);
  }
  addTraining(trn) {
    this.data.trainings.unshift(trn);
    this.save();
    return trn;
  }
  updateTraining(id, updates) {
    const idx = this.data.trainings.findIndex((t) => t._id === id);
    if (idx !== -1) {
      this.data.trainings[idx] = { ...this.data.trainings[idx], ...updates };
      this.save();
      return this.data.trainings[idx];
    }
    return null;
  }

  // Notifications
  getNotifications(recipientId) {
    if (!recipientId) return [...this.data.notifications];
    return this.data.notifications
      .filter((n) => n.recipientId === recipientId || n.recipientId === 'ALL')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  addNotification(notif) {
    this.data.notifications.unshift(notif);
    this.save();
    return notif;
  }
  markNotificationAsRead(id) {
    const notif = this.data.notifications.find((n) => n._id === id);
    if (notif) {
      notif.isRead = true;
      this.save();
      return notif;
    }
    return null;
  }
  markAllNotificationsAsRead(recipientId) {
    this.data.notifications.forEach((n) => {
      if (n.recipientId === recipientId || n.recipientId === 'ALL') {
        n.isRead = true;
      }
    });
    this.save();
    return true;
  }
}

const dbStore = new DataStore();
module.exports = dbStore;
