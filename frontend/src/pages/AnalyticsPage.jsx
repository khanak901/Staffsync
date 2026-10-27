import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  BarChart3,
  Users,
  Clock,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  PieChart,
  Award,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import api from '../services/api';

const AnalyticsPage = () => {
  const { user } = useSelector((state) => state.auth);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="text-center py-5 text-muted small">Loading organizational analytics...</div>;
  }

  const summary = data?.summary || {};
  const deptStats = data?.departmentStats || [];
  const leaveStats = data?.leaveTypeCounts || {};

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1 text-dark">Executive Analytics & HR Insights</h3>
          <p className="text-muted small mb-0">
            Headcount metrics, daily attendance rates, leave utilization trends, and payroll expenditure.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Total Workforce"
            value={summary.totalEmployees ?? 6}
            subtitle={`${summary.activeEmployees ?? 6} Active records`}
            icon={Users}
            color="#4f46e5"
            bg="#eef2ff"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Attendance Compliance"
            value={`${summary.attendanceRate ?? 86}%`}
            subtitle={`${summary.presentToday ?? 4} Present • ${summary.lateToday ?? 1} Late`}
            icon={Clock}
            color="#10b981"
            bg="#ecfdf5"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Annual Leave Volume"
            value={summary.pendingLeaves + summary.approvedLeaves}
            subtitle={`${summary.approvedLeaves} approved to date`}
            icon={CalendarCheck}
            color="#f59e0b"
            bg="#fffbeb"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            title="Total Annual Payroll"
            value={`$${((summary.totalPayroll ?? 540000) / 1000).toFixed(0)}k`}
            subtitle={`Average $${Math.round((summary.averageSalary ?? 90000) / 1000)}k / year`}
            icon={DollarSign}
            color="#0284c7"
            bg="#e0f2fe"
          />
        </div>
      </div>

      {/* Visual Analytics Sections */}
      <div className="row g-4 mb-4">
        {/* Department Headcount Breakdown */}
        <div className="col-lg-6">
          <div className="card-custom p-4 h-100">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <PieChart size={20} className="text-primary" />
              <span>Headcount by Department</span>
            </h5>

            <div className="d-flex flex-column gap-3 mb-4">
              {deptStats.map((dept) => (
                <div key={dept.department}>
                  <div className="d-flex justify-content-between small fw-semibold text-dark mb-1">
                    <span>{dept.department}</span>
                    <span>
                      {dept.count} team members ({dept.percentage}%)
                    </span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${dept.percentage}%`,
                        backgroundColor:
                          dept.department === 'Engineering'
                            ? '#4f46e5'
                            : dept.department === 'Human Resources'
                            ? '#f59e0b'
                            : dept.department === 'Design'
                            ? '#10b981'
                            : '#06b6d4',
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-light rounded-3 text-muted small">
              Engineering represents the largest operational cluster with 50% of the total staff footprint.
            </div>
          </div>
        </div>

        {/* Leave Type Distribution */}
        <div className="col-lg-6">
          <div className="card-custom p-4 h-100">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <CalendarCheck size={20} className="text-warning" />
              <span>Leave Allocation by Category</span>
            </h5>

            <div className="d-flex flex-column gap-3 mb-4">
              {Object.keys(leaveStats).map((type) => {
                const count = leaveStats[type];
                const totalLeaves = summary.pendingLeaves + summary.approvedLeaves + summary.rejectedLeaves || 1;
                const pct = Math.round((count / totalLeaves) * 100);

                return (
                  <div key={type}>
                    <div className="d-flex justify-content-between small fw-semibold text-dark mb-1">
                      <span>{type}</span>
                      <span>
                        {count} requests ({pct}%)
                      </span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: `${pct}%`,
                          backgroundColor:
                            type === 'Annual Leave'
                              ? '#4f46e5'
                              : type === 'Sick Leave'
                              ? '#10b981'
                              : '#f59e0b',
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-light rounded-3 text-muted small">
              Annual Vacation Leave accounts for the largest proportion of requested PTO.
            </div>
          </div>
        </div>
      </div>

      {/* Operational Highlights */}
      <div className="card-custom p-4">
        <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <Award size={20} className="text-success" />
          <span>Organizational Health Scorecard</span>
        </h5>

        <div className="row g-3 text-center">
          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3 border">
              <span className="text-muted small">Daily Punctuality</span>
              <h3 className="fw-bold text-dark mt-1">94%</h3>
              <span className="badge bg-success-subtle text-success small">High Efficiency</span>
            </div>
          </div>

          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3 border">
              <span className="text-muted small">Leave Approval Velocity</span>
              <h3 className="fw-bold text-dark mt-1">&lt; 4.2 hrs</h3>
              <span className="badge bg-primary-subtle text-primary small">Fast Turnaround</span>
            </div>
          </div>

          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3 border">
              <span className="text-muted small">Training Participation</span>
              <h3 className="fw-bold text-dark mt-1">78%</h3>
              <span className="badge bg-purple-subtle text-purple small" style={{ color: '#7e22ce' }}>Active Learning</span>
            </div>
          </div>

          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3 border">
              <span className="text-muted small">Employee Retention</span>
              <h3 className="fw-bold text-dark mt-1">98.5%</h3>
              <span className="badge bg-success-subtle text-success small">Top Quartile</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
