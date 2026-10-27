import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Users,
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  Briefcase,
  Building,
  CheckCircle,
  X,
} from 'lucide-react';
import { StatusBadge, RoleBadge } from '../components/StatusBadge';
import api from '../services/api';

const EmployeesPage = () => {
  const { user } = useSelector((state) => state.auth);
  const isHR = user?.role === 'hr';

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: '',
    role: 'employee',
    salary: 75000,
    managerId: '',
    employmentType: 'Full-Time',
    status: 'Active',
    skills: '',
    password: 'password123',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees', {
        params: {
          search,
          department,
          role: roleFilter,
          status: statusFilter,
        },
      });
      if (res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, department, roleFilter, statusFilter]);

  // Handle Add Employee
  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await api.post('/employees', formData);
      if (res.data.success) {
        setShowAddModal(false);
        resetForm();
        fetchEmployees();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Employee
  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await api.put(`/employees/${selectedEmployee.employeeId}`, formData);
      if (res.data.success) {
        setShowEditModal(false);
        resetForm();
        fetchEmployees();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update employee');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Employee
  const handleDeleteEmployee = async (empId, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the organization?`)) {
      return;
    }
    try {
      await api.delete(`/employees/${empId}`);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  const openEditModal = (emp) => {
    setSelectedEmployee(emp);
    setFormData({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone || '',
      department: emp.department,
      designation: emp.designation,
      role: emp.role,
      salary: emp.salary || 75000,
      managerId: emp.managerId || '',
      employmentType: emp.employmentType || 'Full-Time',
      status: emp.status || 'Active',
      skills: emp.skills ? emp.skills.join(', ') : '',
      password: '',
    });
    setShowEditModal(true);
  };

  const openViewModal = (emp) => {
    setSelectedEmployee(emp);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: 'Engineering',
      designation: '',
      role: 'employee',
      salary: 75000,
      managerId: '',
      employmentType: 'Full-Time',
      status: 'Active',
      skills: '',
      password: 'password123',
    });
    setSelectedEmployee(null);
    setErrorMsg('');
  };

  return (
    <div className="container-fluid p-0">
      {/* Page Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1 text-dark">Employee Management Directory</h3>
          <p className="text-muted small mb-0">
            Maintain employee records, roles, organizational departments, and compensation details.
          </p>
        </div>

        {isHR && (
          <button
            className="btn btn-primary-custom d-flex align-items-center gap-2"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            <Plus size={18} />
            <span>Onboard New Employee</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card-custom p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search by name, email, ID, or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hr">HR Personnel</option>
            </select>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On-Leave">On-Leave</option>
              <option value="Probation">Probation</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="card-custom overflow-hidden">
        <div className="table-responsive">
          <table className="table table-custom align-middle">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Department & Designation</th>
                <th>Role</th>
                <th>Manager</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted small">
                    Loading employee directory...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted small">
                    No employees found matching filter criteria.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2.5">
                        <img
                          src={emp.avatar}
                          alt={emp.firstName}
                          className="rounded-circle object-fit-cover shadow-xs"
                          style={{ width: '40px', height: '40px' }}
                        />
                        <div>
                          <div className="fw-bold text-dark">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                            {emp.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-secondary border font-monospace">
                        {emp.employeeId}
                      </span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{emp.designation}</div>
                      <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        {emp.department} • {emp.employmentType}
                      </div>
                    </td>
                    <td>
                      <RoleBadge role={emp.role} />
                    </td>
                    <td className="small text-muted">{emp.managerName || 'Unassigned'}</td>
                    <td>
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <button
                          className="btn btn-sm btn-light border p-1.5"
                          title="View Details"
                          onClick={() => openViewModal(emp)}
                        >
                          <Eye size={15} className="text-muted" />
                        </button>
                        {isHR && (
                          <>
                            <button
                              className="btn btn-sm btn-light border p-1.5"
                              title="Edit Record"
                              onClick={() => openEditModal(emp)}
                            >
                              <Edit2 size={15} className="text-primary" />
                            </button>
                            <button
                              className="btn btn-sm btn-light border p-1.5"
                              title="Remove"
                              onClick={() => handleDeleteEmployee(emp.employeeId, `${emp.firstName} ${emp.lastName}`)}
                            >
                              <Trash2 size={15} className="text-danger" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADD EMPLOYEE MODAL (HR)                                                   */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(15, 23, 42, 0.5)', zIndex: 1200, backdropFilter: 'blur(4px)' }}
        >
          <div className="card-custom bg-white p-4 w-100 shadow-lg" style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <h5 className="fw-bold mb-0 text-dark">Onboard New Employee</h5>
              <button className="btn btn-sm btn-light p-1" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            {errorMsg && <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">{errorMsg}</div>}

            <form onSubmit={handleCreateEmployee}>
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-dark">First Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Liam"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-dark">Last Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Miller"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-dark">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="liam.miller@staffsync.io"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-dark">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-dark">Department *</label>
                  <select
                    className="form-select"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-dark">Designation / Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Full Stack Engineer"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-sm-4">
                  <label className="form-label small fw-semibold text-dark">Access Role</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="hr">HR Personnel</option>
                  </select>
                </div>
                <div className="col-sm-4">
                  <label className="form-label small fw-semibold text-dark">Employment Type</label>
                  <select
                    className="form-select"
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
                <div className="col-sm-4">
                  <label className="form-label small fw-semibold text-dark">Annual Salary ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="85000"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  />
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-dark">Initial Login Password</label>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="password123"
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-dark">Skills (comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="React, Node.js, Cloud"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                <button
                  type="button"
                  className="btn btn-outline-custom"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary-custom" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Onboard Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT EMPLOYEE MODAL (HR / Manager)                                        */}
      {/* ========================================================================= */}
      {showEditModal && selectedEmployee && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(15, 23, 42, 0.5)', zIndex: 1200, backdropFilter: 'blur(4px)' }}
        >
          <div className="card-custom bg-white p-4 w-100 shadow-lg" style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <div>
                <h5 className="fw-bold mb-0 text-dark">
                  Edit Record: {selectedEmployee.firstName} {selectedEmployee.lastName}
                </h5>
                <span className="badge bg-light text-muted border font-monospace mt-1">
                  {selectedEmployee.employeeId}
                </span>
              </div>
              <button className="btn btn-sm btn-light p-1" onClick={() => setShowEditModal(false)}>
                <X size={18} />
              </button>
            </div>

            {errorMsg && <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">{errorMsg}</div>}

            <form onSubmit={handleUpdateEmployee}>
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-dark">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-dark">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-dark">Department</label>
                  <select
                    className="form-select"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-dark">Designation</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-sm-4">
                  <label className="form-label small fw-semibold text-dark">System Role</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="hr">HR Personnel</option>
                  </select>
                </div>
                <div className="col-sm-4">
                  <label className="form-label small fw-semibold text-dark">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="On-Leave">On-Leave</option>
                    <option value="Probation">Probation</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
                <div className="col-sm-4">
                  <label className="form-label small fw-semibold text-dark">Salary ($/yr)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                <button
                  type="button"
                  className="btn btn-outline-custom"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary-custom" disabled={submitting}>
                  {submitting ? 'Saving changes...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW EMPLOYEE MODAL                                                       */}
      {/* ========================================================================= */}
      {showViewModal && selectedEmployee && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(15, 23, 42, 0.5)', zIndex: 1200, backdropFilter: 'blur(4px)' }}
        >
          <div className="card-custom bg-white p-4 w-100 shadow-lg" style={{ maxWidth: '580px' }}>
            <div className="d-flex align-items-start justify-content-between mb-4">
              <div className="d-flex align-items-center gap-3">
                <img
                  src={selectedEmployee.avatar}
                  alt={selectedEmployee.firstName}
                  className="rounded-circle object-fit-cover shadow-sm"
                  style={{ width: '64px', height: '64px' }}
                />
                <div>
                  <h5 className="fw-bold mb-1 text-dark">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h5>
                  <div className="text-muted small">{selectedEmployee.designation}</div>
                  <div className="d-flex gap-2 mt-1">
                    <RoleBadge role={selectedEmployee.role} />
                    <StatusBadge status={selectedEmployee.status} />
                  </div>
                </div>
              </div>
              <button className="btn btn-sm btn-light p-1" onClick={() => setShowViewModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-6">
                <span className="text-muted small">Employee ID</span>
                <div className="fw-semibold text-dark">{selectedEmployee.employeeId}</div>
              </div>
              <div className="col-6">
                <span className="text-muted small">Department</span>
                <div className="fw-semibold text-dark">{selectedEmployee.department}</div>
              </div>
              <div className="col-6">
                <span className="text-muted small">Email Address</span>
                <div className="fw-semibold text-dark">{selectedEmployee.email}</div>
              </div>
              <div className="col-6">
                <span className="text-muted small">Phone</span>
                <div className="fw-semibold text-dark">{selectedEmployee.phone || 'N/A'}</div>
              </div>
              <div className="col-6">
                <span className="text-muted small">Manager</span>
                <div className="fw-semibold text-dark">{selectedEmployee.managerName || 'Unassigned'}</div>
              </div>
              <div className="col-6">
                <span className="text-muted small">Joining Date</span>
                <div className="fw-semibold text-dark">{selectedEmployee.joiningDate}</div>
              </div>
            </div>

            {/* Leave Balances */}
            <div className="p-3 bg-light rounded-3 mb-4">
              <span className="text-muted small fw-semibold text-uppercase d-block mb-2" style={{ fontSize: '0.72rem' }}>
                Remaining Leave Quotas
              </span>
              <div className="row text-center g-2">
                <div className="col-4">
                  <div className="bg-white p-2 rounded border">
                    <div className="text-muted small">Sick</div>
                    <strong className="text-dark">{selectedEmployee.leaveBalances?.sick ?? 12}d</strong>
                  </div>
                </div>
                <div className="col-4">
                  <div className="bg-white p-2 rounded border">
                    <div className="text-muted small">Casual</div>
                    <strong className="text-dark">{selectedEmployee.leaveBalances?.casual ?? 10}d</strong>
                  </div>
                </div>
                <div className="col-4">
                  <div className="bg-white p-2 rounded border">
                    <div className="text-muted small">Annual</div>
                    <strong className="text-dark">{selectedEmployee.leaveBalances?.annual ?? 18}d</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end">
              <button className="btn btn-outline-custom" onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
