import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Users,
  Clock,
  CalendarCheck,
  GraduationCap,
  Megaphone,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Plus,
  Play,
  Square,
  ArrowRight,
  MapPin,
  TrendingUp,
  FileText,
  DollarSign,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { StatusBadge, RoleBadge } from '../components/StatusBadge';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role || 'employee';

  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [myLeaves, setMyLeaves] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [trainings, setTrainings] = useState([]);

  // Attendance Punch State
  const [punchLocation, setPunchLocation] = useState('Office');
  const [punchNotes, setPunchNotes] = useState('');
  const [punchLoading, setPunchLoading] = useState(false);
  const [punchMessage, setPunchMessage] = useState('');

  // Approval action state
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch today's attendance for current user
      const attRes = await api.get('/attendance/today');
      if (attRes.data.success) {
        setTodayAttendance(attRes.data.data);
      }

      // 2. Fetch announcements
      const annRes = await api.get('/announcements');
      if (annRes.data.success) {
        setAnnouncements(annRes.data.data.slice(0, 4));
      }

      // 3. Fetch trainings
      const trnRes = await api.get('/trainings');
      if (trnRes.data.success) {
        setTrainings(trnRes.data.data.slice(0, 3));
      }

      // 4. Role-specific data
      if (role === 'employee') {
        const leaveRes = await api.get('/leaves/my');
        if (leaveRes.data.success) {
          setMyLeaves(leaveRes.data.data.slice(0, 4));
        }
      } else {
        // Manager or HR
        const analyticsRes = await api.get('/analytics/dashboard');
        if (analyticsRes.data.success) {
          setStatsData(analyticsRes.data.data);
        }

        const approvalsRes = await api.get('/leaves?status=Pending');
        if (approvalsRes.data.success) {
          setPendingApprovals(approvalsRes.data.data);
        }

        if (role === 'manager') {
          const teamRes = await api.get('/employees/team/me');
          if (teamRes.data.success) {
            setTeamMembers(teamRes.data.data);
          }
        }
      }
    } catch (err) {
      console.error('Failed loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [role]);

  // Handle Clock In
  const handleClockIn = async () => {
    setPunchLoading(true);
    setPunchMessage('');
    try {
      const res = await api.post('/attendance/clock-in', {
        workLocation: punchLocation,
        notes: punchNotes,
      });
      if (res.data.success) {
        setTodayAttendance(res.data.data);
        setPunchMessage(' Clocked in successfully!');
        setPunchNotes('');
      }
    } catch (err) {
      setPunchMessage(err.response?.data?.message || 'Failed to clock in');
    } finally {
      setPunchLoading(false);
    }
  };

  // Handle Clock Out
  const handleClockOut = async () => {
    setPunchLoading(true);
    setPunchMessage('');
    try {
      const res = await api.post('/attendance/clock-out', {
        notes: punchNotes,
      });
      if (res.data.success) {
        setTodayAttendance(res.data.data);
        setPunchMessage(' Clocked out successfully. Great job today!');
        setPunchNotes('');
      }
    } catch (err) {
      setPunchMessage(err.response?.data?.message || 'Failed to clock out');
    } finally {
      setPunchLoading(false);
    }
  };

  // Handle Leave Review
  const handleReviewLeave = async (status) => {
    if (!selectedLeave) return;
    setActionLoading(true);
    try {
      await api.put(`/leaves/${selectedLeave._id}/review`, {
        status,
        reviewComments: reviewComment,
      });
      setSelectedLeave(null);
      setReviewComment('');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to review leave');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Welcome Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h3 className="fw-bold mb-0 text-dark">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h3>
            <RoleBadge role={role} />
          </div>
          <p className="text-muted small mb-0">
            {role === 'hr' && 'Organization overview, employee governance, and operational analytics.'}
            {role === 'manager' && 'Team performance, leave approval requests, and workforce coordination.'}
            {role === 'employee' && 'Here is your daily attendance, leave balances, and company updates.'}
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {role === 'employee' && (
            <Link to="/leaves" className="btn btn-primary-custom d-flex align-items-center gap-2">
              <CalendarCheck size={16} />
              <span>Apply for Leave</span>
            </Link>
          )}
          {role === 'manager' && (
            <Link to="/leaves" className="btn btn-primary-custom d-flex align-items-center gap-2">
              <CalendarCheck size={16} />
              <span>Review Leave Queue ({pendingApprovals.length})</span>
            </Link>
          )}
          {role === 'hr' && (
            <>
              <Link to="/employees" className="btn btn-outline-custom d-flex align-items-center gap-2">
                <Users size={16} />
                <span>Employee Directory</span>
              </Link>
              <Link to="/announcements" className="btn btn-primary-custom d-flex align-items-center gap-2">
                <Megaphone size={16} />
                <span>Post Announcement</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. EMPLOYEE DASHBOARD VIEW                                                */}
      {/* ========================================================================= */}
      {role === 'employee' && (
        <div className="row g-4">
          {/* Live Punch Clock Card */}
          <div className="col-lg-5">
            <div className="card-custom p-4 h-100 position-relative overflow-hidden">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="fw-bold text-dark d-flex align-items-center gap-2" style={{ fontSize: '1rem' }}>
                  <Clock size={20} className="text-primary" />
                  <span>Attendance Punch Clock</span>
                </span>
                {todayAttendance && <StatusBadge status={todayAttendance.status} />}
              </div>

              {/* Status display */}
              <div
                className="p-3 rounded-3 mb-3 text-center"
                style={{
                  background: todayAttendance?.checkOut
                    ? '#f1f5f9'
                    : todayAttendance?.checkIn
                    ? '#ecfdf5'
                    : '#eff6ff',
                  border: todayAttendance?.checkOut
                    ? '1px solid #cbd5e1'
                    : todayAttendance?.checkIn
                    ? '1px solid #a7f3d0'
                    : '1px solid #bfdbfe',
                }}
              >
                <div className="text-muted small text-uppercase fw-semibold mb-1" style={{ fontSize: '0.72rem' }}>
                  Today's Status
                </div>
                {todayAttendance ? (
                  <div>
                    <h4 className="fw-bold mb-1" style={{ color: '#0f172a' }}>
                      {todayAttendance.checkOut
                        ? `Shift Finished (${todayAttendance.totalHours} hrs)`
                        : `Clocked In at ${todayAttendance.checkIn}`}
                    </h4>
                    <span className="small text-muted">
                      Location: <strong>{todayAttendance.workLocation}</strong>
                      {todayAttendance.notes ? ` • "${todayAttendance.notes}"` : ''}
                    </span>
                  </div>
                ) : (
                  <div>
                    <h5 className="fw-bold mb-1 text-dark">Not Clocked In Yet</h5>
                    <span className="small text-muted">Core office hours: 9:00 AM – 5:30 PM</span>
                  </div>
                )}
              </div>

              {punchMessage && (
                <div className="alert alert-info py-2 px-3 small rounded-3 mb-3">{punchMessage}</div>
              )}

              {/* Punch Controls */}
              {!todayAttendance?.checkIn && (
                <div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted mb-1">Work Mode</label>
                      <select
                        className="form-select form-select-sm"
                        value={punchLocation}
                        onChange={(e) => setPunchLocation(e.target.value)}
                      >
                        <option value="Office">Office Onsite</option>
                        <option value="Remote">Work From Home</option>
                        <option value="Client-Site">Client Site</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted mb-1">Note (Optional)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Sprint work"
                        value={punchNotes}
                        onChange={(e) => setPunchNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    className="btn btn-success w-100 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                    onClick={handleClockIn}
                    disabled={punchLoading}
                  >
                    <Play size={18} />
                    <span>{punchLoading ? 'Recording...' : 'Punch In (Clock In Now)'}</span>
                  </button>
                </div>
              )}

              {todayAttendance?.checkIn && !todayAttendance?.checkOut && (
                <div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted mb-1">Shift Completion Note</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Finished sprint tasks"
                      value={punchNotes}
                      onChange={(e) => setPunchNotes(e.target.value)}
                    />
                  </div>
                  <button
                    className="btn btn-danger w-100 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                    onClick={handleClockOut}
                    disabled={punchLoading}
                  >
                    <Square size={18} />
                    <span>{punchLoading ? 'Saving...' : 'Punch Out (Clock Out)'}</span>
                  </button>
                </div>
              )}

              {todayAttendance?.checkOut && (
                <div className="text-center py-2 text-success small fw-semibold">
                  <CheckCircle2 size={18} className="me-1 inline" /> Attendance complete for today. See you tomorrow!
                </div>
              )}
            </div>
          </div>

          {/* Leave Balances & Fast Apply */}
          <div className="col-lg-7">
            <div className="card-custom p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="fw-bold text-dark d-flex align-items-center gap-2" style={{ fontSize: '1rem' }}>
                  <CalendarCheck size={20} className="text-primary" />
                  <span>Leave Balances & Status</span>
                </span>
                <Link to="/leaves" className="text-primary small text-decoration-none fw-semibold">
                  View Full History →
                </Link>
              </div>

              {/* 3 Leave Meters */}
              <div className="row g-3 mb-4">
                <div className="col-4">
                  <div className="p-3 rounded-3 text-center bg-light border">
                    <span className="text-muted small text-uppercase" style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                      Sick Leave
                    </span>
                    <h3 className="fw-bold text-dark my-1">
                      {user?.employeeProfile?.leaveBalances?.sick ?? 10}
                    </h3>
                    <div className="progress" style={{ height: '5px' }}>
                      <div
                        className="progress-bar bg-success"
                        style={{
                          width: `${((user?.employeeProfile?.leaveBalances?.sick ?? 10) / 12) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                      of 12 days left
                    </span>
                  </div>
                </div>

                <div className="col-4">
                  <div className="p-3 rounded-3 text-center bg-light border">
                    <span className="text-muted small text-uppercase" style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                      Casual Leave
                    </span>
                    <h3 className="fw-bold text-dark my-1">
                      {user?.employeeProfile?.leaveBalances?.casual ?? 8}
                    </h3>
                    <div className="progress" style={{ height: '5px' }}>
                      <div
                        className="progress-bar bg-warning"
                        style={{
                          width: `${((user?.employeeProfile?.leaveBalances?.casual ?? 8) / 10) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                      of 10 days left
                    </span>
                  </div>
                </div>

                <div className="col-4">
                  <div className="p-3 rounded-3 text-center bg-light border">
                    <span className="text-muted small text-uppercase" style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                      Annual Leave
                    </span>
                    <h3 className="fw-bold text-dark my-1">
                      {user?.employeeProfile?.leaveBalances?.annual ?? 15}
                    </h3>
                    <div className="progress" style={{ height: '5px' }}>
                      <div
                        className="progress-bar bg-primary"
                        style={{
                          width: `${((user?.employeeProfile?.leaveBalances?.annual ?? 15) / 18) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                      of 18 days left
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Leaves Table */}
              <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '0.875rem' }}>
                Recent Leave Requests
              </h6>
              <div className="table-responsive">
                <table className="table table-custom table-sm">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Days</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myLeaves.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted small py-3">
                          No recent leaves requested
                        </td>
                      </tr>
                    ) : (
                      myLeaves.map((l) => (
                        <tr key={l._id}>
                          <td className="fw-semibold text-dark">{l.leaveType}</td>
                          <td className="text-muted small">
                            {l.startDate} → {l.endDate}
                          </td>
                          <td>{l.totalDays}d</td>
                          <td>
                            <StatusBadge status={l.status} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Announcements & Trainings Section */}
          <div className="col-lg-6">
            <div className="card-custom p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="fw-bold text-dark d-flex align-items-center gap-2">
                  <Megaphone size={20} className="text-warning" />
                  <span>Company Announcements</span>
                </span>
                <Link to="/announcements" className="text-primary small text-decoration-none fw-semibold">
                  All Notices →
                </Link>
              </div>

              <div className="d-flex flex-column gap-3">
                {announcements.map((a) => (
                  <div key={a._id} className="p-3 rounded-3 bg-light border">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                        {a.title}
                      </span>
                      <StatusBadge status={a.priority} />
                    </div>
                    <p className="text-muted small mb-2" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                      {a.content}
                    </p>
                    <div className="d-flex justify-content-between align-items-center text-muted" style={{ fontSize: '0.72rem' }}>
                      <span>By {a.postedBy}</span>
                      <span>Audience: {a.targetAudience}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Training & Skills Progression */}
          <div className="col-lg-6">
            <div className="card-custom p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="fw-bold text-dark d-flex align-items-center gap-2">
                  <GraduationCap size={20} className="text-purple" style={{ color: '#7e22ce' }} />
                  <span>Professional Training Programs</span>
                </span>
                <Link to="/trainings" className="text-primary small text-decoration-none fw-semibold">
                  Browse Catalog →
                </Link>
              </div>

              <div className="d-flex flex-column gap-3">
                {trainings.map((t) => {
                  const myEnrollment = t.enrolledEmployees?.find((e) => e.employeeId === user?.employeeId);
                  return (
                    <div key={t._id} className="p-3 rounded-3 bg-light border">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                          {t.title}
                        </span>
                        <StatusBadge status={t.status} />
                      </div>
                      <p className="text-muted small mb-2" style={{ fontSize: '0.8rem' }}>
                        {t.description}
                      </p>
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                          Trainer: <strong>{t.trainer}</strong> • {t.durationHours} hrs
                        </span>
                        {myEnrollment ? (
                          <span className="badge bg-success-subtle text-success border border-success-subtle">
                            Enrolled ({myEnrollment.progress}%)
                          </span>
                        ) : (
                          <Link to="/trainings" className="btn btn-sm btn-outline-primary py-0 px-2" style={{ fontSize: '0.75rem' }}>
                            View & Enroll
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MANAGER DASHBOARD VIEW                                                 */}
      {/* ========================================================================= */}
      {role === 'manager' && (
        <div className="row g-4">
          {/* Top 4 KPI Cards */}
          <div className="col-sm-6 col-xl-3">
            <StatCard
              title="Team Size"
              value={teamMembers.length || 4}
              subtitle="Direct engineering reports"
              icon={Users}
              color="#4f46e5"
              bg="#eef2ff"
            />
          </div>
          <div className="col-sm-6 col-xl-3">
            <StatCard
              title="Present Today"
              value={statsData?.summary?.presentToday ?? 3}
              subtitle="In office & remote"
              icon={Clock}
              color="#10b981"
              bg="#ecfdf5"
            />
          </div>
          <div className="col-sm-6 col-xl-3">
            <StatCard
              title="Pending Approvals"
              value={pendingApprovals.length}
              subtitle="Requires your review"
              icon={CalendarCheck}
              color="#f59e0b"
              bg="#fffbeb"
            />
          </div>
          <div className="col-sm-6 col-xl-3">
            <StatCard
              title="Active Programs"
              value={trainings.length}
              subtitle="Upskilling & workshops"
              icon={GraduationCap}
              color="#7e22ce"
              bg="#faf5ff"
            />
          </div>

          {/* Pending Leave Approvals Queue (Crucial Manager Epic) */}
          <div className="col-lg-7">
            <div className="card-custom p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="fw-bold text-dark d-flex align-items-center gap-2">
                  <CalendarCheck size={20} className="text-warning" />
                  <span>Team Leave Approval Queue ({pendingApprovals.length})</span>
                </span>
                <Link to="/leaves" className="text-primary small text-decoration-none fw-semibold">
                  Manage All Leaves →
                </Link>
              </div>

              {pendingApprovals.length === 0 ? (
                <div className="p-4 text-center text-muted small bg-light rounded-3">
                  <CheckCircle2 size={32} className="text-success mb-2" />
                  <p className="mb-0">All pending team leave requests have been resolved!</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {pendingApprovals.map((req) => (
                    <div key={req._id} className="p-3 rounded-3 bg-light border">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div>
                          <strong className="text-dark">{req.employeeName}</strong>
                          <span className="text-muted small ms-2">({req.department})</span>
                        </div>
                        <StatusBadge status={req.status} />
                      </div>

                      <div className="small text-muted mb-2">
                        <strong>{req.leaveType}</strong>: {req.startDate} to {req.endDate} ({req.totalDays} working days)
                      </div>
                      <div className="p-2 rounded bg-white border small text-dark mb-3">
                        <em>"{req.reason}"</em>
                      </div>

                      {selectedLeave?._id === req._id ? (
                        <div className="p-3 bg-white border rounded-3">
                          <label className="form-label small fw-semibold text-dark mb-1">
                            Supervisor Feedback / Notes:
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-sm mb-2"
                            placeholder="Add approval remarks or rejection rationale..."
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                          />
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-success flex-fill fw-semibold"
                              onClick={() => handleReviewLeave('Approved')}
                              disabled={actionLoading}
                            >
                              Confirm Approval
                            </button>
                            <button
                              className="btn btn-sm btn-danger flex-fill fw-semibold"
                              onClick={() => handleReviewLeave('Rejected')}
                              disabled={actionLoading}
                            >
                              Reject Request
                            </button>
                            <button
                              className="btn btn-sm btn-light border"
                              onClick={() => setSelectedLeave(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-success fw-semibold"
                            onClick={() => {
                              setSelectedLeave(req);
                              setReviewComment('Approved by team lead');
                            }}
                          >
                            Review & Decide
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Team Roster & Attendance Today */}
          <div className="col-lg-5">
            <div className="card-custom p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="fw-bold text-dark d-flex align-items-center gap-2">
                  <Users size={20} className="text-primary" />
                  <span>My Team Roster</span>
                </span>
                <Link to="/employees" className="text-primary small text-decoration-none fw-semibold">
                  Directory →
                </Link>
              </div>

              <div className="d-flex flex-column gap-2">
                {teamMembers.map((emp) => (
                  <div key={emp._id} className="d-flex align-items-center justify-content-between p-2.5 rounded-3 bg-light border">
                    <div className="d-flex align-items-center gap-2.5">
                      <img
                        src={emp.avatar}
                        alt={emp.firstName}
                        className="rounded-circle"
                        style={{ width: '38px', height: '38px', objectFit: 'cover' }}
                      />
                      <div>
                        <div className="fw-bold text-dark small">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                          {emp.designation}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={emp.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. HR DASHBOARD VIEW                                                      */}
      {/* ========================================================================= */}
      {role === 'hr' && (
        <div className="row g-4">
          {/* Top Executive KPI Cards */}
          <div className="col-sm-6 col-xl-3">
            <StatCard
              title="Total Headcount"
              value={statsData?.summary?.totalEmployees ?? 6}
              subtitle="All registered employees"
              icon={Users}
              color="#4f46e5"
              bg="#eef2ff"
            />
          </div>
          <div className="col-sm-6 col-xl-3">
            <StatCard
              title="Attendance Rate"
              value={`${statsData?.summary?.attendanceRate ?? 86}%`}
              subtitle={`${statsData?.summary?.presentToday ?? 4} present today`}
              icon={Clock}
              color="#10b981"
              bg="#ecfdf5"
            />
          </div>
          <div className="col-sm-6 col-xl-3">
            <StatCard
              title="Pending Leaves"
              value={pendingApprovals.length}
              subtitle="Awaiting final HR signoff"
              icon={CalendarCheck}
              color="#f59e0b"
              bg="#fffbeb"
            />
          </div>
          <div className="col-sm-6 col-xl-3">
            <StatCard
              title="Monthly Payroll"
              value={`$${((statsData?.summary?.totalPayroll ?? 540000) / 1000).toFixed(0)}k`}
              subtitle={`Avg $${Math.round((statsData?.summary?.averageSalary ?? 90000) / 1000)}k / staff`}
              icon={DollarSign}
              color="#0284c7"
              bg="#e0f2fe"
            />
          </div>

          {/* Department Headcount Breakdown */}
          <div className="col-lg-6">
            <div className="card-custom p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="fw-bold text-dark d-flex align-items-center gap-2">
                  <BarChart3 size={20} className="text-primary" />
                  <span>Department Distribution</span>
                </span>
                <Link to="/analytics" className="text-primary small text-decoration-none fw-semibold">
                  Detailed Report →
                </Link>
              </div>

              <div className="d-flex flex-column gap-3">
                {statsData?.departmentStats?.map((dept) => (
                  <div key={dept.department}>
                    <div className="d-flex justify-content-between small fw-semibold text-dark mb-1">
                      <span>{dept.department}</span>
                      <span>
                        {dept.count} members ({dept.percentage}%)
                      </span>
                    </div>
                    <div className="progress" style={{ height: '7px' }}>
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
                              : '#64748b',
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent System Activity Log */}
          <div className="col-lg-6">
            <div className="card-custom p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="fw-bold text-dark d-flex align-items-center gap-2">
                  <TrendingUp size={20} className="text-success" />
                  <span>Real-Time Organization Activity</span>
                </span>
              </div>

              <div className="d-flex flex-column gap-2.5">
                {statsData?.recentActivity?.map((act, idx) => (
                  <div key={idx} className="p-2.5 rounded-3 bg-light border d-flex align-items-center justify-content-between">
                    <div>
                      <div className="fw-bold text-dark small">{act.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {act.subtitle}
                      </div>
                    </div>
                    <StatusBadge status={act.badge} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
