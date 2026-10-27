import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Clock, ChevronDown, LogOut, User, CheckCheck, Menu, Sparkles } from 'lucide-react';
import { logout, loginSuccess } from '../redux/slices/authSlice';
import { RoleBadge } from './StatusBadge';
import api from '../services/api';

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (id, link) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
      if (link) {
        navigate(link);
        setShowNotifications(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Instant persona switcher for demoing
  const handleSwitchPersona = async (roleEmail) => {
    try {
      const res = await api.post('/auth/login', {
        email: roleEmail,
        password: 'password123',
      });
      if (res.data.success) {
        dispatch(loginSuccess(res.data.data));
        setShowRoleSwitcher(false);
        navigate('/dashboard');
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to switch persona:', err);
    }
  };

  return (
    <nav className="top-navbar">
      {/* Left: Mobile Toggle & Page Greeting */}
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-sm btn-light d-lg-none p-2 rounded-8"
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>

        {/* Live digital clock */}
        <div className="d-none d-md-flex align-items-center gap-2 text-muted px-3 py-1.5 rounded-pill bg-light border">
          <Clock size={16} className="text-primary" />
          <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#334155' }}>
            {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} •{' '}
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Right: Quick Role Switcher + Notifications + User Avatar */}
      <div className="d-flex align-items-center gap-2 gap-md-3">
        {/* Quick Demo Switcher */}
        <div className="position-relative">
          <button
            className="btn btn-sm d-flex align-items-center gap-1.5 rounded-pill px-3 py-1.5"
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: '1px solid #e2e8f0',
            }}
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
          >
            <Sparkles size={14} className="text-warning" />
            <span className="d-none d-sm-inline">Demo Switcher:</span>
            <span className="text-capitalize text-primary">{user?.role}</span>
            <ChevronDown size={14} />
          </button>

          {showRoleSwitcher && (
            <div
              className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border p-2"
              style={{ width: '250px', zIndex: 1100 }}
            >
              <div className="text-muted small px-2 py-1 fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>
                Quick Switch Persona
              </div>
              <button
                className={`w-100 text-start btn btn-sm mb-1 d-flex align-items-center justify-content-between p-2 rounded ${user?.role === 'hr' ? 'bg-light fw-bold text-primary' : 'btn-light'}`}
                onClick={() => handleSwitchPersona('hr@staffsync.io')}
              >
                <div>
                  <div style={{ fontSize: '0.85rem' }}>Sarah Connor</div>
                  <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                    HR Director
                  </div>
                </div>
                <RoleBadge role="hr" />
              </button>
              <button
                className={`w-100 text-start btn btn-sm mb-1 d-flex align-items-center justify-content-between p-2 rounded ${user?.role === 'manager' ? 'bg-light fw-bold text-primary' : 'btn-light'}`}
                onClick={() => handleSwitchPersona('manager@staffsync.io')}
              >
                <div>
                  <div style={{ fontSize: '0.85rem' }}>Michael Scott</div>
                  <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                    Engineering Lead
                  </div>
                </div>
                <RoleBadge role="manager" />
              </button>
              <button
                className={`w-100 text-start btn btn-sm d-flex align-items-center justify-content-between p-2 rounded ${user?.role === 'employee' ? 'bg-light fw-bold text-primary' : 'btn-light'}`}
                onClick={() => handleSwitchPersona('employee@staffsync.io')}
              >
                <div>
                  <div style={{ fontSize: '0.85rem' }}>Alex Morgan</div>
                  <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                    Frontend Engineer
                  </div>
                </div>
                <RoleBadge role="employee" />
              </button>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="position-relative">
          <button
            className="btn btn-light position-relative rounded-circle p-2 text-muted"
            style={{ width: '40px', height: '40px' }}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: '0.65rem' }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border p-0"
              style={{ width: '320px', maxHeight: '420px', zIndex: 1100, overflow: 'hidden' }}
            >
              <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-light">
                <span className="fw-bold" style={{ fontSize: '0.9rem' }}>
                  Notifications ({unreadCount} new)
                </span>
                {unreadCount > 0 && (
                  <button
                    className="btn btn-link btn-sm p-0 text-decoration-none text-primary"
                    style={{ fontSize: '0.75rem' }}
                    onClick={handleMarkAllRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted small">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`p-3 border-bottom cursor-pointer ${n.isRead ? 'bg-white' : 'bg-light'}`}
                      style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                      onClick={() => handleMarkAsRead(n._id, n.link)}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="fw-semibold text-dark" style={{ fontSize: '0.825rem' }}>
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span
                            className="bg-primary rounded-circle"
                            style={{ width: '7px', height: '7px' }}
                          ></span>
                        )}
                      </div>
                      <p className="text-muted small mb-1" style={{ fontSize: '0.785rem', lineHeight: '1.4' }}>
                        {n.message}
                      </p>
                      <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown */}
        <div className="position-relative">
          <div
            className="d-flex align-items-center gap-2 cursor-pointer p-1 rounded-pill pe-2"
            style={{ cursor: 'pointer', background: '#f8fafc', border: '1px solid #e2e8f0' }}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="rounded-circle object-fit-cover shadow-sm"
              style={{ width: '34px', height: '34px' }}
            />
            <div className="d-none d-md-block text-start" style={{ lineHeight: '1.2' }}>
              <div className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                {user?.name?.split(' ')[0]}
              </div>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                {user?.employeeId}
              </div>
            </div>
            <ChevronDown size={14} className="text-muted d-none d-sm-block" />
          </div>

          {showUserMenu && (
            <div
              className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border p-2"
              style={{ width: '220px', zIndex: 1100 }}
            >
              <div className="p-2 border-bottom mb-1">
                <div className="fw-bold text-dark" style={{ fontSize: '0.875rem' }}>
                  {user?.name}
                </div>
                <div className="text-muted small text-truncate">{user?.email}</div>
                <div className="mt-1">
                  <RoleBadge role={user?.role} />
                </div>
              </div>
              <Link
                to="/profile"
                className="dropdown-item d-flex align-items-center gap-2 p-2 rounded text-dark text-decoration-none"
                onClick={() => setShowUserMenu(false)}
              >
                <User size={16} />
                <span>My Profile</span>
              </Link>
              <button
                className="dropdown-item d-flex align-items-center gap-2 p-2 rounded text-danger w-100 border-0 bg-transparent text-start"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
