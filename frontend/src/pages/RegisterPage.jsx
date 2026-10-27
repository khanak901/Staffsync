import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Layers, Mail, Lock, User, Briefcase, Building, AlertCircle, ArrowRight } from 'lucide-react';
import { loginSuccess, setLoading, setError } from '../redux/slices/authSlice';
import api from '../services/api';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
    department: 'Engineering',
    designation: 'Software Engineer',
  });
  const [localError, setLocalError] = useState('');

  const { isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    try {
      dispatch(setLoading(true));
      const res = await api.post('/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department,
        designation: formData.designation,
      });

      if (res.data.success) {
        dispatch(loginSuccess(res.data.data));
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check inputs.';
      setLocalError(msg);
      dispatch(setError(msg));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div className="card-custom p-4 p-md-5 w-100 shadow-sm" style={{ maxWidth: '580px', background: '#ffffff' }}>
        <div className="text-center mb-4">
          <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none mb-3">
            <div
              className="d-flex align-items-center justify-content-center text-white rounded-3 shadow-sm"
              style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
            >
              <Layers size={24} />
            </div>
            <h4 className="fw-bold mb-0 text-dark">
              Staff<span style={{ color: '#4f46e5' }}>Sync</span>
            </h4>
          </Link>
          <h5 className="fw-bold text-dark">Create your account</h5>
          <p className="text-muted small">Join StaffSync organization platform</p>
        </div>

        {localError && (
          <div className="alert alert-danger d-flex align-items-center gap-2 p-2.5 small mb-3 rounded-3" role="alert">
            <AlertCircle size={16} />
            <div>{localError}</div>
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="row g-3 mb-3">
            <div className="col-sm-6">
              <label className="form-label small fw-semibold text-dark">First Name</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  name="firstName"
                  className="form-control border-start-0 ps-0"
                  placeholder="Jane"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="col-sm-6">
              <label className="form-label small fw-semibold text-dark">Last Name</label>
              <input
                type="text"
                name="lastName"
                className="form-control"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-dark">Work Email</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <Mail size={16} />
              </span>
              <input
                type="email"
                name="email"
                className="form-control border-start-0 ps-0"
                placeholder="jane.doe@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-sm-4">
              <label className="form-label small fw-semibold text-dark">System Role</label>
              <select name="role" className="form-select" value={formData.role} onChange={handleChange}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR Personnel</option>
              </select>
            </div>
            <div className="col-sm-4">
              <label className="form-label small fw-semibold text-dark">Department</label>
              <select
                name="department"
                className="form-select"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
            <div className="col-sm-4">
              <label className="form-label small fw-semibold text-dark">Designation</label>
              <input
                type="text"
                name="designation"
                className="form-control"
                placeholder="Job title"
                value={formData.designation}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-sm-6">
              <label className="form-label small fw-semibold text-dark">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  name="password"
                  className="form-control border-start-0 ps-0"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="col-sm-6">
              <label className="form-label small fw-semibold text-dark">Confirm Password</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control border-start-0 ps-0"
                  placeholder="Re-type password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary-custom w-100 py-2.5 d-flex align-items-center justify-content-center gap-2"
            disabled={isLoading}
          >
            <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-top text-muted small">
          Already have an account?{' '}
          <Link to="/login" className="text-primary fw-semibold text-decoration-none">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
