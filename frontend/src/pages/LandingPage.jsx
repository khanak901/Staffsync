import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  Clock,
  CalendarCheck,
  Megaphone,
  GraduationCap,
  BarChart3,
  CheckCircle2,
  Sparkles,
  Users,
} from 'lucide-react';
import { loginSuccess } from '../redux/slices/authSlice';
import api from '../services/api';

const LandingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleQuickLogin = async (email) => {
    try {
      const res = await api.post('/auth/login', {
        email,
        password: 'password123',
      });
      if (res.data.success) {
        dispatch(loginSuccess(res.data.data));
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Quick login failed:', err);
    }
  };

  return (
    <div className="bg-white min-vh-100 d-flex flex-column">
      {/* Top Header / Navigation */}
      <header className="navbar navbar-expand-lg border-bottom sticky-top bg-white px-4 py-3">
        <div className="container-fluid d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2.5">
            <div
              className="d-flex align-items-center justify-content-center text-white rounded-3 shadow-sm"
              style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              }}
            >
              <Layers size={24} />
            </div>
            <div>
              <h4 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.5px' }}>
                Staff<span style={{ color: '#4f46e5' }}>Sync</span>
              </h4>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <Link to="/login" className="btn btn-outline-custom">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary-custom d-none d-sm-inline-flex align-items-center gap-2">
              <span>Get Started</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-5" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)' }}>
        <div className="container py-4 text-center">
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill bg-light border mb-3 shadow-xs">
            <Sparkles size={16} className="text-primary" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4f46e5' }}>
              MERN Stack Powered • Modern Human Resource Management
            </span>
          </div>

          <h1 className="display-4 fw-extrabold text-dark mb-3" style={{ letterSpacing: '-1.5px', lineHeight: 1.15 }}>
            All-In-One Modern HR Platform <br className="d-none d-md-block" />
            for <span style={{ color: '#4f46e5' }}>High-Performing</span> Teams
          </h1>

          <p className="lead text-muted mx-auto mb-4" style={{ maxWidth: '720px', fontSize: '1.15rem' }}>
            StaffSync automates employee records, live attendance punch clock, multi-tier leave approvals, company
            announcements, and professional training programs across employees, managers, and HR personnel.
          </p>

          <div className="d-flex flex-wrap align-items-center justify-content-center gap-3 mb-5">
            <a href="#demo-accounts" className="btn btn-primary-custom px-4 py-2.5 fs-6 d-flex align-items-center gap-2">
              <Sparkles size={18} />
              <span>Explore Interactive 1-Click Demo</span>
            </a>
            <Link to="/login" className="btn btn-outline-custom px-4 py-2.5 fs-6">
              Sign In to Your Workspace
            </Link>
          </div>

          {/* Quick Role Test Drives (1-Click Logins) */}
          <div id="demo-accounts" className="card-custom p-4 p-md-5 mx-auto text-start shadow-sm" style={{ maxWidth: '980px', background: '#ffffff' }}>
            <div className="text-center mb-4">
              <h4 className="fw-bold mb-1">⚡ Instant Test Drive: Experience Every Persona</h4>
              <p className="text-muted small">
                Click any role card below to instantly log in and experience StaffSync from that user's perspective:
              </p>
            </div>

            <div className="row g-3">
              {/* HR Card */}
              <div className="col-md-4">
                <div
                  className="card h-100 p-3 border rounded-3 position-relative cursor-pointer transition"
                  style={{
                    backgroundColor: '#fffdf5',
                    borderColor: '#fde68a',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onClick={() => handleQuickLogin('hr@staffsync.io')}
                >
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="badge badge-role-hr px-2 py-1">HR Director</span>
                    <span className="small text-muted">EMP-HR-001</span>
                  </div>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                      alt="Sarah Connor"
                      className="rounded-circle"
                      style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                    />
                    <div>
                      <h6 className="fw-bold mb-0">Sarah Connor</h6>
                      <small className="text-muted">VP of People Ops</small>
                    </div>
                  </div>
                  <p className="small text-muted mb-3" style={{ fontSize: '0.8rem' }}>
                    Full administrative oversight, employee CRUD, company-wide attendance tracking, leave governance & analytics.
                  </p>
                  <button className="btn btn-warning btn-sm w-100 fw-semibold text-dark mt-auto d-flex align-items-center justify-content-center gap-1.5">
                    <span>Log in as HR</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Manager Card */}
              <div className="col-md-4">
                <div
                  className="card h-100 p-3 border rounded-3 position-relative cursor-pointer transition"
                  style={{
                    backgroundColor: '#faf5ff',
                    borderColor: '#e9d5ff',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onClick={() => handleQuickLogin('manager@staffsync.io')}
                >
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="badge badge-role-manager px-2 py-1">Team Lead</span>
                    <span className="small text-muted">EMP-MGR-002</span>
                  </div>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80"
                      alt="Michael Scott"
                      className="rounded-circle"
                      style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                    />
                    <div>
                      <h6 className="fw-bold mb-0">Michael Scott</h6>
                      <small className="text-muted">Engineering Lead</small>
                    </div>
                  </div>
                  <p className="small text-muted mb-3" style={{ fontSize: '0.8rem' }}>
                    Team attendance monitoring, review and approve/reject leave requests with remarks, manage team trainings.
                  </p>
                  <button className="btn btn-sm w-100 fw-semibold text-white mt-auto d-flex align-items-center justify-content-center gap-1.5" style={{ background: '#7e22ce' }}>
                    <span>Log in as Manager</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Employee Card */}
              <div className="col-md-4">
                <div
                  className="card h-100 p-3 border rounded-3 position-relative cursor-pointer transition"
                  style={{
                    backgroundColor: '#f0f9ff',
                    borderColor: '#bae6fd',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onClick={() => handleQuickLogin('employee@staffsync.io')}
                >
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="badge badge-role-employee px-2 py-1">Employee</span>
                    <span className="small text-muted">EMP-DEV-003</span>
                  </div>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                      alt="Alex Morgan"
                      className="rounded-circle"
                      style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                    />
                    <div>
                      <h6 className="fw-bold mb-0">Alex Morgan</h6>
                      <small className="text-muted">Senior Frontend Dev</small>
                    </div>
                  </div>
                  <p className="small text-muted mb-3" style={{ fontSize: '0.8rem' }}>
                    Clock in/out with digital punch clock, apply for leaves, track leave balances, view announcements, enroll in trainings.
                  </p>
                  <button className="btn btn-primary-custom btn-sm w-100 fw-semibold mt-auto d-flex align-items-center justify-content-center gap-1.5">
                    <span>Log in as Employee</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-5 bg-white border-top">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="badge px-3 py-1 rounded-pill mb-2" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
              Core Features
            </span>
            <h2 className="fw-bold text-dark">Built to Support the Entire Employee Lifecycle</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '650px' }}>
              StaffSync delivers tailored capabilities for every stage of modern human resource operations.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card-custom p-4 h-100">
                <div className="stat-card-icon mb-3 text-primary" style={{ backgroundColor: '#eef2ff' }}>
                  <Clock size={24} />
                </div>
                <h5 className="fw-bold text-dark">Digital Attendance Clock</h5>
                <p className="text-muted small">
                  Live clock-in and clock-out with elapsed time tracking, automatic late arrival tagging, work location selection, and attendance history logs.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card-custom p-4 h-100">
                <div className="stat-card-icon mb-3 text-success" style={{ backgroundColor: '#ecfdf5' }}>
                  <CalendarCheck size={24} />
                </div>
                <h5 className="fw-bold text-dark">Automated Leave Management</h5>
                <p className="text-muted small">
                  Employees apply with instant balance validation (Sick, Casual, Annual). Managers and HR review requests with customized feedback notes.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card-custom p-4 h-100">
                <div className="stat-card-icon mb-3 text-warning" style={{ backgroundColor: '#fffbeb' }}>
                  <Megaphone size={24} />
                </div>
                <h5 className="fw-bold text-dark">Company Announcements</h5>
                <p className="text-muted small">
                  Broadcast notices with priority flags (Urgent, High, Medium, Low), target audience by department, and push real-time notifications.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card-custom p-4 h-100">
                <div className="stat-card-icon mb-3 text-purple" style={{ backgroundColor: '#faf5ff', color: '#7e22ce' }}>
                  <GraduationCap size={24} />
                </div>
                <h5 className="fw-bold text-dark">Training & Development</h5>
                <p className="text-muted small">
                  Curate internal development programs, track employee enrollment, manage capacity limits, and monitor individual completion progress.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card-custom p-4 h-100">
                <div className="stat-card-icon mb-3 text-info" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                  <BarChart3 size={24} />
                </div>
                <h5 className="fw-bold text-dark">HR Analytics & Reports</h5>
                <p className="text-muted small">
                  Real-time departmental headcount distribution, daily attendance rates, leave type breakdown, and payroll budget overview.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card-custom p-4 h-100">
                <div className="stat-card-icon mb-3 text-danger" style={{ backgroundColor: '#fef2f2', color: '#b91c1c' }}>
                  <ShieldCheck size={24} />
                </div>
                <h5 className="fw-bold text-dark">Enterprise Security & RBAC</h5>
                <p className="text-muted small">
                  JWT authentication, bcrypt password hashing, role-based access control middleware, and protected endpoints across all modules.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-top bg-light py-4 text-center">
        <div className="container">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-2">
              <div
                className="d-flex align-items-center justify-content-center text-white rounded-2 shadow-xs"
                style={{ width: '28px', height: '28px', background: '#4f46e5' }}
              >
                <Layers size={16} />
              </div>
              <span className="fw-bold text-dark">StaffSync</span>
              <span className="text-muted small">| Modern Human Resource Management Solution</span>
            </div>
            <div className="text-muted small">
              Built with MERN Stack • React.js • Node.js • Express.js • MongoDB • Bootstrap 5
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
