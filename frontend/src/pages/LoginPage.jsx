import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Layers, Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { loginSuccess, setLoading, setError } from '../redux/slices/authSlice';
import api from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const { isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }

    try {
      dispatch(setLoading(true));
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        dispatch(loginSuccess(res.data.data));
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials. Please try again.';
      setLocalError(msg);
      dispatch(setError(msg));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setLocalError('');
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div className="card-custom p-4 p-md-5 w-100 shadow-sm" style={{ maxWidth: '480px', background: '#ffffff' }}>
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
          <h5 className="fw-bold text-dark">Welcome back</h5>
          <p className="text-muted small">Enter your credentials to access your HR workspace</p>
        </div>

        {/* 1-Click Demo Accounts Selector */}
        <div className="p-3 mb-4 rounded-3 border bg-light">
          <div className="d-flex align-items-center gap-1.5 text-muted small fw-bold text-uppercase mb-2" style={{ fontSize: '0.72rem' }}>
            <Sparkles size={14} className="text-warning" />
            <span>1-Click Demo Login</span>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-warning text-dark flex-fill fw-semibold"
              style={{ fontSize: '0.78rem' }}
              onClick={() => fillDemo('hr@staffsync.io')}
            >
              HR Admin
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary flex-fill fw-semibold"
              style={{ fontSize: '0.78rem', color: '#7e22ce', borderColor: '#d8b4fe' }}
              onClick={() => fillDemo('manager@staffsync.io')}
            >
              Manager
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary flex-fill fw-semibold"
              style={{ fontSize: '0.78rem' }}
              onClick={() => fillDemo('employee@staffsync.io')}
            >
              Employee
            </button>
          </div>
        </div>

        {localError && (
          <div className="alert alert-danger d-flex align-items-center gap-2 p-2.5 small mb-3 rounded-3" role="alert">
            <AlertCircle size={16} />
            <div>{localError}</div>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-dark">Work Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <Mail size={16} />
              </span>
              <input
                type="email"
                className="form-control border-start-0 ps-0"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label small fw-semibold text-dark mb-0">Password</label>
              <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                Default: password123
              </span>
            </div>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <Lock size={16} />
              </span>
              <input
                type="password"
                className="form-control border-start-0 ps-0"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary-custom w-100 py-2.5 d-flex align-items-center justify-content-center gap-2"
            disabled={isLoading}
          >
            <span>{isLoading ? 'Signing in...' : 'Sign In to Workspace'}</span>
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-top text-muted small">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary fw-semibold text-decoration-none">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
