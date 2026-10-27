import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = '#4f46e5', bg = '#eef2ff' }) => {
  return (
    <div className="card-custom p-3 p-md-4 h-100 d-flex flex-column justify-content-between">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
            {title}
          </span>
          <h3 className="fw-bold mb-0 mt-1" style={{ color: '#0f172a', fontSize: '1.75rem' }}>
            {value}
          </h3>
        </div>
        <div
          className="stat-card-icon shadow-sm"
          style={{
            backgroundColor: bg,
            color: color,
          }}
        >
          {Icon && <Icon size={24} />}
        </div>
      </div>
      {subtitle && (
        <div className="text-muted small pt-2 border-top d-flex align-items-center" style={{ fontSize: '0.8rem' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default StatCard;
