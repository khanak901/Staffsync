import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarCheck,
  Megaphone,
  GraduationCap,
  BarChart3,
  UserCircle,
  LogOut,
  X,
  Layers,
} from 'lucide-react';
import { logout } from '../redux/slices/authSlice';
import { RoleBadge } from './StatusBadge';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const isHR = user?.role === 'hr';
  const isManager = user?.role === 'manager';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['employee', 'manager', 'hr'] },
    { label: 'Employees', path: '/employees', icon: Users, roles: ['manager', 'hr'] },
    { label: 'Attendance', path: '/attendance', icon: Clock, roles: ['employee', 'manager', 'hr'] },
    { label: 'Leave Requests', path: '/leaves', icon: CalendarCheck, roles: ['employee', 'manager', 'hr'] },
    { label: 'Announcements', path: '/announcements', icon: Megaphone, roles: ['employee', 'manager', 'hr'] },
    { label: 'Training & Skills', path: '/trainings', icon: GraduationCap, roles: ['employee', 'manager', 'hr'] },
    { label: 'Analytics & Reports', path: '/analytics', icon: BarChart3, roles: ['manager', 'hr'] },
    { label: 'My Profile', path: '/profile', icon: UserCircle, roles: ['employee', 'manager', 'hr'] },
  ];

  const allowedNav = navItems.filter((item) => item.roles.includes(user?.role || 'employee'));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100"
          style={{ background: 'rgba(15, 23, 42, 0.4)', zIndex: 999, backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand justify-content-between">
          <div className="d-flex align-items-center gap-2.5">
            <div
              className="d-flex align-items-center justify-content-center text-white rounded-3 shadow-sm"
              style={{
                width: '38px',
                height: '38px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              }}
            >
              <Layers size={22} />
            </div>
            <div>
              <h5 className="fw-bold mb-0" style={{ letterSpacing: '-0.3px', color: '#0f172a' }}>
                Staff<span style={{ color: '#4f46e5' }}>Sync</span>
              </h5>
              <div className="text-muted" style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.4px' }}>
                HR MANAGEMENT
              </div>
            </div>
          </div>
          <button className="btn btn-sm btn-light d-lg-none text-muted p-1" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Navigation links */}
        <div className="sidebar-nav">
          <div className="text-uppercase text-muted px-3 mb-2" style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.6px' }}>
            Main Menu
          </div>
          {allowedNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item-custom ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (window.innerWidth < 992) onClose();
                }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom User Card */}
        <div className="p-3 border-top bg-light">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center gap-2">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name}
                className="rounded-circle object-fit-cover shadow-xs"
                style={{ width: '36px', height: '36px' }}
              />
              <div style={{ lineHeight: '1.2' }}>
                <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.825rem', maxWidth: '120px' }}>
                  {user?.name}
                </div>
                <RoleBadge role={user?.role} />
              </div>
            </div>
            <button
              className="btn btn-sm btn-outline-danger p-1.5 rounded-3"
              title="Logout"
              onClick={() => dispatch(logout())}
            >
              <LogOut size={16} />
            </button>
          </div>
          <div className="text-muted text-center" style={{ fontSize: '0.7rem' }}>
            StaffSync v1.0 • Modern HRMS
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
