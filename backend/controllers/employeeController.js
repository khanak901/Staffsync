const dbStore = require('../services/dbStore');
const bcrypt = require('bcryptjs');

// @desc    Get all employees with filtering & search
// @route   GET /api/employees
// @access  Private (HR, Manager, or Employee directory)
const getAllEmployees = async (req, res) => {
  try {
    let list = dbStore.getEmployees();
    const { search, department, role, status } = req.query;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.firstName.toLowerCase().includes(q) ||
          e.lastName.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.employeeId.toLowerCase().includes(q) ||
          e.designation.toLowerCase().includes(q)
      );
    }

    if (department && department !== 'All') {
      list = list.filter((e) => e.department.toLowerCase() === department.toLowerCase());
    }

    if (role && role !== 'All') {
      list = list.filter((e) => e.role === role);
    }

    if (status && status !== 'All') {
      list = list.filter((e) => e.status.toLowerCase() === status.toLowerCase());
    }

    res.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single employee details
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res) => {
  try {
    const employee = dbStore.findEmployeeById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Attach recent attendance and leaves
    const recentAttendance = dbStore.getAttendance({ employeeId: employee.employeeId }).slice(0, 7);
    const recentLeaves = dbStore.getLeaves({ employeeId: employee.employeeId }).slice(0, 5);

    res.json({
      success: true,
      data: {
        ...employee,
        recentAttendance,
        recentLeaves,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new employee (HR only)
// @route   POST /api/employees
// @access  Private (HR)
const createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      role = 'employee',
      managerId,
      salary,
      employmentType,
      skills,
      password = 'password123',
    } = req.body;

    if (!firstName || !lastName || !email || !department || !designation) {
      return res.status(400).json({ success: false, message: 'Please fill all required employee details' });
    }

    const existing = dbStore.findEmployeeByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Employee with this email already exists' });
    }

    // Find manager name if managerId is provided
    let managerName = 'Unassigned';
    if (managerId) {
      const mgr = dbStore.findEmployeeById(managerId);
      if (mgr) managerName = `${mgr.firstName} ${mgr.lastName}`;
    }

    // Generate unique ID
    const count = dbStore.getEmployees().length + 1;
    const prefix = role === 'hr' ? 'EMP-HR' : role === 'manager' ? 'EMP-MGR' : 'EMP-DEV';
    const employeeId = `${prefix}-${String(count).padStart(3, '0')}`;

    const newEmpId = `emp-${Date.now()}`;
    const newUserId = `usr-${Date.now()}`;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const defaultAvatar = `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 90000000)}?w=150&auto=format&fit=crop&q=80`;

    const newEmployee = {
      _id: newEmpId,
      employeeId,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || '+1 (555) 000-0000',
      department,
      designation,
      role,
      managerId: managerId || null,
      managerName,
      salary: Number(salary) || 75000,
      joiningDate: new Date().toISOString().split('T')[0],
      employmentType: employmentType || 'Full-Time',
      address: {
        street: '123 Enterprise Blvd',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA',
      },
      emergencyContact: {
        name: 'Primary Contact',
        relationship: 'Family',
        phone: '+1 (555) 999-0000',
      },
      leaveBalances: { sick: 12, casual: 10, annual: 18 },
      status: 'Active',
      avatar: defaultAvatar,
      skills: Array.isArray(skills) ? skills : skills ? skills.split(',').map((s) => s.trim()) : ['Collaboration'],
      createdAt: new Date(),
    };

    const newUser = {
      _id: newUserId,
      name: `${firstName} ${lastName}`,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      employeeId,
      avatar: defaultAvatar,
      status: 'Active',
      createdAt: new Date(),
    };

    dbStore.addEmployee(newEmployee);
    dbStore.addUser(newUser);

    // If role is manager, add to managers collection
    if (role === 'manager') {
      dbStore.data.managers.push({
        _id: `mgr-${Date.now()}`,
        employeeId,
        name: `${firstName} ${lastName}`,
        department,
        teamMembers: [],
        budget: 150000,
        createdAt: new Date(),
      });
      dbStore.save();
    }

    // Add notification for HR
    dbStore.addNotification({
      _id: `notif-${Date.now()}`,
      recipientId: 'EMP-HR-001',
      title: 'New Employee Onboarded',
      message: `${firstName} ${lastName} has been added to the ${department} department.`,
      type: 'system',
      isRead: false,
      link: '/employees',
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: newEmployee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update employee details (HR or Manager)
// @route   PUT /api/employees/:id
// @access  Private (HR / Manager)
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = dbStore.findEmployeeById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const {
      firstName,
      lastName,
      department,
      designation,
      salary,
      role,
      managerId,
      status,
      leaveBalances,
      phone,
      employmentType,
    } = req.body;

    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (department) updates.department = department;
    if (designation) updates.designation = designation;
    if (salary !== undefined) updates.salary = Number(salary);
    if (role) updates.role = role;
    if (status) updates.status = status;
    if (phone) updates.phone = phone;
    if (employmentType) updates.employmentType = employmentType;
    if (leaveBalances) updates.leaveBalances = { ...existing.leaveBalances, ...leaveBalances };

    if (managerId !== undefined) {
      updates.managerId = managerId;
      if (managerId) {
        const mgr = dbStore.findEmployeeById(managerId);
        updates.managerName = mgr ? `${mgr.firstName} ${mgr.lastName}` : 'Unassigned';
      } else {
        updates.managerName = 'Unassigned';
      }
    }

    // If name changed, update user account too
    if (firstName || lastName) {
      const user = dbStore.findUserById(existing.employeeId);
      if (user) {
        dbStore.updateUser(user._id, {
          name: `${updates.firstName || existing.firstName} ${updates.lastName || existing.lastName}`,
          role: updates.role || user.role,
        });
      }
    }

    const updated = dbStore.updateEmployee(id, updates);

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete / deactivate employee
// @route   DELETE /api/employees/:id
// @access  Private (HR only)
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = dbStore.deleteEmployee(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({
      success: true,
      message: 'Employee removed successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get team members for manager
// @route   GET /api/employees/team/me
// @access  Private (Manager)
const getMyTeam = async (req, res) => {
  try {
    const allEmployees = dbStore.getEmployees();
    // Return all employees whose managerId matches current user's employeeId
    const team = allEmployees.filter((e) => e.managerId === req.user.employeeId);

    // If manager has no direct reports assigned yet, provide engineering department members
    const result = team.length > 0 ? team : allEmployees.filter((e) => e.employeeId !== req.user.employeeId && e.department === 'Engineering');

    res.json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getMyTeam,
};
