const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dbStore = require('../services/dbStore');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'staffsync_secret_jwt_key_2026_modern_hrm_secure_auth', {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = dbStore.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const employee = dbStore.findEmployeeById(user.employeeId);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        avatar: user.avatar,
        employeeProfile: employee || null,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register a new user & employee
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, department, designation } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    const existingUser = dbStore.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Auto-generate employeeId
    const count = dbStore.getEmployees().length + 1;
    const prefix = role === 'hr' ? 'EMP-HR' : role === 'manager' ? 'EMP-MGR' : 'EMP-DEV';
    const employeeId = `${prefix}-${String(count).padStart(3, '0')}`;

    const newUserId = `usr-${Date.now()}`;
    const newEmpId = `emp-${Date.now()}`;

    const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    const newUser = {
      _id: newUserId,
      name: `${firstName} ${lastName}`,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'employee',
      employeeId,
      avatar: defaultAvatar,
      status: 'Active',
      createdAt: new Date(),
    };

    const newEmployee = {
      _id: newEmpId,
      employeeId,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: '+1 (555) 123-4567',
      department: department || 'Engineering',
      designation: designation || (role === 'manager' ? 'Team Lead' : 'Specialist'),
      role: role || 'employee',
      managerId: role === 'employee' ? 'EMP-MGR-002' : null,
      managerName: role === 'employee' ? 'Michael Scott' : 'Executive Board',
      salary: role === 'hr' ? 120000 : role === 'manager' ? 110000 : 85000,
      joiningDate: new Date().toISOString().split('T')[0],
      employmentType: 'Full-Time',
      address: {
        street: '100 Market St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA',
      },
      emergencyContact: {
        name: 'Primary Contact',
        relationship: 'Family',
        phone: '+1 (555) 987-6543',
      },
      leaveBalances: { sick: 12, casual: 10, annual: 18 },
      status: 'Active',
      avatar: defaultAvatar,
      skills: ['Teamwork', 'Communication', 'Problem Solving'],
      createdAt: new Date(),
    };

    dbStore.addUser(newUser);
    dbStore.addEmployee(newEmployee);

    // If manager, also add to managers list
    if (role === 'manager') {
      dbStore.data.managers.push({
        _id: `mgr-${Date.now()}`,
        employeeId,
        name: `${firstName} ${lastName}`,
        department: department || 'Engineering',
        teamMembers: [],
        budget: 150000,
        createdAt: new Date(),
      });
      dbStore.save();
    }

    res.status(201).json({
      success: true,
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        employeeId: newUser.employeeId,
        avatar: newUser.avatar,
        employeeProfile: newEmployee,
        token: generateToken(newUser._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = dbStore.findUserById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const employee = dbStore.findEmployeeById(user.employeeId);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        avatar: user.avatar,
        employeeProfile: employee || null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { phone, address, emergencyContact, skills, avatar } = req.body;
    const employee = dbStore.findEmployeeById(req.user.employeeId);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const updates = {};
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = { ...employee.address, ...address };
    if (emergencyContact !== undefined) updates.emergencyContact = { ...employee.emergencyContact, ...emergencyContact };
    if (skills !== undefined) updates.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim());
    if (avatar !== undefined) {
      updates.avatar = avatar;
      dbStore.updateUser(req.user._id, { avatar });
    }

    const updatedEmp = dbStore.updateEmployee(req.user.employeeId, updates);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedEmp,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { login, register, getMe, updateProfile };
