import React from 'react';

export const StatusBadge = ({ status }) => {
  const s = (status || '').toLowerCase();

  let bg = '#f1f5f9';
  let color = '#475569';
  let border = '#e2e8f0';

  if (s === 'present' || s === 'approved' || s === 'active' || s === 'completed') {
    bg = '#ecfdf5';
    color = '#047857';
    border = '#a7f3d0';
  } else if (s === 'late' || s === 'pending' || s === 'in-progress' || s === 'probation' || s === 'medium') {
    bg = '#fffbeb';
    color = '#b45309';
    border = '#fde68a';
  } else if (s === 'rejected' || s === 'absent' || s === 'terminated' || s === 'urgent' || s === 'high') {
    bg = '#fef2f2';
    color = '#b91c1c';
    border = '#fecaca';
  } else if (s === 'on-leave' || s === 'upcoming') {
    bg = '#eff6ff';
    color = '#1d4ed8';
    border = '#bfdbfe';
  }

  return (
    <span
      className="badge px-2.5 py-1 text-xs fw-semibold rounded-pill"
      style={{
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        letterSpacing: '0.3px',
      }}
    >
      {status}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const r = (role || '').toLowerCase();
  if (r === 'hr') {
    return <span className="badge badge-role-hr px-2.5 py-1 rounded-pill">HR Admin</span>;
  }
  if (r === 'manager') {
    return <span className="badge badge-role-manager px-2.5 py-1 rounded-pill">Manager</span>;
  }
  return <span className="badge badge-role-employee px-2.5 py-1 rounded-pill">Employee</span>;
};

export default StatusBadge;
