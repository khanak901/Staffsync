import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  Search,
  Filter,
  Plus,
  X,
  MapPin,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import api from '../services/api';

const AttendancePage = () => {
  const { user } = useSelector((state) => state.auth);
  const isHR = user?.role === 'hr';
  const isManager = user?.role === 'manager';

  const todayStr = new Date().toISOString().split('T')[0];

  // Employee Punch States
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [workLocation, setWorkLocation] = useState('Office');
  const [notes, setNotes] = useState('');
  const [punchLoading, setPunchLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Attendance Records & Filter States
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, late: 0, onLeave: 0 });
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [deptFilter, setDeptFilter] = useState('All');
  const [searchEmp, setSearchEmp] = useState('');

  // HR Manual Entry Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    employeeId: 'EMP-DEV-003',
    date: todayStr,
    checkIn: '09:00 AM',
    checkOut: '05:30 PM',
    status: 'Present',
    workLocation: 'Office',
    notes: 'HR manual regularization',
  });
  const [employeesList, setEmployeesList] = useState([]);

  // Fetch today status for user
  const fetchMyStatus = async () => {
    try {
      const res = await api.get('/attendance/today');
      if (res.data.success) {
        setTodayAttendance(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch all attendance records
  const fetchRecords = async () => {
    setLoadingRecords(true);
    try {
      if (user?.role === 'employee') {
        const res = await api.get('/attendance/my');
        if (res.data.success) {
          setRecords(res.data.data);
        }
      } else {
        const res = await api.get('/attendance', {
          params: {
            date: selectedDate,
            department: deptFilter,
          },
        });
        if (res.data.success) {
          setRecords(res.data.data);
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    fetchMyStatus();
    if (isHR) {
      api.get('/employees').then((res) => {
        if (res.data.success) setEmployeesList(res.data.data);
      });
    }
  }, [user]);

  useEffect(() => {
    fetchRecords();
  }, [selectedDate, deptFilter, user]);

  // Handle Punch In
  const handleClockIn = async () => {
    setPunchLoading(true);
    setMsg('');
    try {
      const res = await api.post('/attendance/clock-in', {
        workLocation,
        notes,
      });
      if (res.data.success) {
        setTodayAttendance(res.data.data);
        setMsg('Clocked in successfully!');
        setNotes('');
        fetchRecords();
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to clock in');
    } finally {
      setPunchLoading(false);
    }
  };

  // Handle Punch Out
  const handleClockOut = async () => {
    setPunchLoading(true);
    setMsg('');
    try {
      const res = await api.post('/attendance/clock-out', { notes });
      if (res.data.success) {
        setTodayAttendance(res.data.data);
        setMsg('Clocked out successfully!');
        setNotes('');
        fetchRecords();
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to clock out');
    } finally {
      setPunchLoading(false);
    }
  };

  // Handle HR Manual Attendance
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/attendance/manual', manualForm);
      if (res.data.success) {
        setShowManualModal(false);
        fetchRecords();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add manual record');
    }
  };

  // Filter records by employee search term
  const displayedRecords = records.filter(
    (r) =>
      r.employeeName?.toLowerCase().includes(searchEmp.toLowerCase()) ||
      r.employeeId?.toLowerCase().includes(searchEmp.toLowerCase())
  );

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1 text-dark">Attendance & Time Tracking</h3>
          <p className="text-muted small mb-0">
            Real-time punch clock, working hour analytics, and daily company attendance rosters.
          </p>
        </div>

        {isHR && (
          <button
            className="btn btn-primary-custom d-flex align-items-center gap-2"
            onClick={() => setShowManualModal(true)}
          >
            <Plus size={18} />
            <span>Record Attendance Entry</span>
          </button>
        )}
      </div>

      {/* Employee Punch Card Widget */}
      <div className="card-custom p-4 mb-4">
        <div className="row align-items-center g-3">
          <div className="col-lg-4 border-end-lg">
            <div className="d-flex align-items-center gap-3">
              <div
                className="stat-card-icon shadow-xs"
                style={{
                  backgroundColor: todayAttendance?.checkIn ? '#ecfdf5' : '#eef2ff',
                  color: todayAttendance?.checkIn ? '#10b981' : '#4f46e5',
                }}
              >
                <Clock size={24} />
              </div>
              <div>
                <span className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
                  My Shift Today ({todayStr})
                </span>
                <h5 className="fw-bold mb-0 text-dark">
                  {todayAttendance?.checkIn
                    ? `Checked In at ${todayAttendance.checkIn}`
                    : 'Not Checked In Yet'}
                </h5>
              </div>
            </div>
            {todayAttendance?.checkOut && (
              <div className="mt-2 text-muted small">
                Checked out at {todayAttendance.checkOut} ({todayAttendance.totalHours} hrs worked)
              </div>
            )}
            {msg && <div className="mt-2 alert alert-info py-1 px-2 small mb-0">{msg}</div>}
          </div>

          <div className="col-lg-8">
            <div className="row g-2 align-items-center justify-content-lg-end">
              {!todayAttendance?.checkIn && (
                <>
                  <div className="col-sm-4">
                    <select
                      className="form-select form-select-sm"
                      value={workLocation}
                      onChange={(e) => setWorkLocation(e.target.value)}
                    >
                      <option value="Office">Office Onsite</option>
                      <option value="Remote">Work From Home</option>
                      <option value="Client-Site">Client Site</option>
                    </select>
                  </div>
                  <div className="col-sm-5">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Note / project (optional)..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <div className="col-sm-3">
                    <button
                      className="btn btn-success btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center gap-1.5"
                      onClick={handleClockIn}
                      disabled={punchLoading}
                    >
                      <Play size={15} />
                      <span>Clock In</span>
                    </button>
                  </div>
                </>
              )}

              {todayAttendance?.checkIn && !todayAttendance?.checkOut && (
                <>
                  <div className="col-sm-8">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Shift completion note..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <div className="col-sm-4">
                    <button
                      className="btn btn-danger btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center gap-1.5"
                      onClick={handleClockOut}
                      disabled={punchLoading}
                    >
                      <Square size={15} />
                      <span>Clock Out</span>
                    </button>
                  </div>
                </>
              )}

              {todayAttendance?.checkOut && (
                <div className="col-12 text-end text-success fw-semibold small">
                  <CheckCircle2 size={16} className="me-1 inline" /> Full day shift recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Management Counters (for HR / Manager) */}
      {!user?.role?.includes('employee') && (
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card-custom p-3 bg-white text-center">
              <span className="text-muted small">Recorded Today</span>
              <h4 className="fw-bold text-dark mb-0">{stats.total}</h4>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card-custom p-3 bg-white text-center">
              <span className="text-muted small">Present Onsite/Remote</span>
              <h4 className="fw-bold text-success mb-0">{stats.present}</h4>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card-custom p-3 bg-white text-center">
              <span className="text-muted small">Late Arrivals</span>
              <h4 className="fw-bold text-warning mb-0">{stats.late}</h4>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card-custom p-3 bg-white text-center">
              <span className="text-muted small">On Approved Leave</span>
              <h4 className="fw-bold text-primary mb-0">{stats.onLeave}</h4>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
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
                placeholder="Search staff in logs..."
                value={searchEmp}
                onChange={(e) => setSearchEmp(e.target.value)}
              />
            </div>
          </div>

          {!user?.role?.includes('employee') && (
            <>
              <div className="col-6 col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <Calendar size={16} />
                  </span>
                  <input
                    type="date"
                    className="form-control border-start-0 ps-0"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-6 col-md-4">
                <select
                  className="form-select"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                >
                  <option value="All">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Attendance Logs Table */}
      <div className="card-custom overflow-hidden">
        <div className="table-responsive">
          <table className="table table-custom align-middle">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Total Hours</th>
                <th>Location</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {loadingRecords ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted small">
                    Loading attendance entries...
                  </td>
                </tr>
              ) : displayedRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted small">
                    No attendance records found for this date.
                  </td>
                </tr>
              ) : (
                displayedRecords.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div className="fw-bold text-dark">{r.employeeName}</div>
                      <div className="text-muted small font-monospace" style={{ fontSize: '0.72rem' }}>
                        {r.employeeId} • {r.department}
                      </div>
                    </td>
                    <td>{r.date}</td>
                    <td>
                      <span className="fw-semibold text-dark">{r.checkIn || '—'}</span>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark">{r.checkOut || '—'}</span>
                    </td>
                    <td>
                      {r.totalHours > 0 ? (
                        <span className="badge bg-light text-dark border">{r.totalHours} hrs</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <span className="d-inline-flex align-items-center gap-1 text-muted small">
                        <MapPin size={13} />
                        {r.workLocation}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="small text-muted text-truncate" style={{ maxWidth: '180px' }}>
                      {r.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MANUAL ATTENDANCE MODAL (HR)                                              */}
      {/* ========================================================================= */}
      {showManualModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(15, 23, 42, 0.5)', zIndex: 1200, backdropFilter: 'blur(4px)' }}
        >
          <div className="card-custom bg-white p-4 w-100 shadow-lg" style={{ maxWidth: '520px' }}>
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <h5 className="fw-bold mb-0 text-dark">Add Manual Attendance Entry</h5>
              <button className="btn btn-sm btn-light p-1" onClick={() => setShowManualModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleManualSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Select Employee</label>
                <select
                  className="form-select"
                  value={manualForm.employeeId}
                  onChange={(e) => setManualForm({ ...manualForm, employeeId: e.target.value })}
                >
                  {employeesList.map((emp) => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.firstName} {emp.lastName} ({emp.employeeId} - {emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-dark">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={manualForm.date}
                    onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-dark">Status</label>
                  <select
                    className="form-select"
                    value={manualForm.status}
                    onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                  >
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Half-day">Half-day</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-dark">Check In Time</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="09:00 AM"
                    value={manualForm.checkIn}
                    onChange={(e) => setManualForm({ ...manualForm, checkIn: e.target.value })}
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-dark">Check Out Time</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="05:30 PM"
                    value={manualForm.checkOut}
                    onChange={(e) => setManualForm({ ...manualForm, checkOut: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-dark">Audit Remarks</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Regularized by HR for business travel"
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                />
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                <button
                  type="button"
                  className="btn btn-outline-custom"
                  onClick={() => setShowManualModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary-custom">
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
