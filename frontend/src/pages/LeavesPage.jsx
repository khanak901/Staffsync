import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  FileText,
  User,
  Calendar,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import api from '../services/api';

const LeavesPage = () => {
  const { user } = useSelector((state) => state.auth);
  const canApprove = user?.role === 'manager' || user?.role === 'hr';

  const [activeTab, setActiveTab] = useState('my-leaves');
  const [myLeaves, setMyLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [balances, setBalances] = useState({ sick: 12, casual: 10, annual: 18 });
  const [loading, setLoading] = useState(true);

  // Apply Modal State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leaveType: 'Annual Leave',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [applyError, setApplyError] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);

  // Review Modal State
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewAction, setReviewAction] = useState('Approved');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const myRes = await api.get('/leaves/my');
      if (myRes.data.success) {
        setMyLeaves(myRes.data.data);
        if (myRes.data.balances) setBalances(myRes.data.balances);
      }

      if (canApprove) {
        const allRes = await api.get('/leaves');
        if (allRes.data.success) {
          setAllLeaves(allRes.data.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Calculate day difference
  const calcDays = () => {
    if (!applyForm.startDate || !applyForm.endDate) return 1;
    const d1 = new Date(applyForm.startDate);
    const d2 = new Date(applyForm.endDate);
    const diff = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diff) || diff < 1 ? 1 : diff;
  };

  const requestedDays = calcDays();

  // Handle Apply
  const handleApply = async (e) => {
    e.preventDefault();
    setApplyLoading(true);
    setApplyError('');
    try {
      const res = await api.post('/leaves/apply', applyForm);
      if (res.data.success) {
        setShowApplyModal(false);
        setApplyForm({
          leaveType: 'Annual Leave',
          startDate: '',
          endDate: '',
          reason: '',
        });
        fetchData();
      }
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setApplyLoading(false);
    }
  };

  // Handle Review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;
    setReviewLoading(true);
    try {
      const res = await api.put(`/leaves/${selectedLeave._id}/review`, {
        status: reviewAction,
        reviewComments: reviewComment,
      });
      if (res.data.success) {
        setSelectedLeave(null);
        setReviewComment('');
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to review leave');
    } finally {
      setReviewLoading(false);
    }
  };

  const pendingApprovalsCount = allLeaves.filter((l) => l.status === 'Pending').length;

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1 text-dark">Leave Management</h3>
          <p className="text-muted small mb-0">
            Submit time-off requests, monitor leave quotas, and oversee departmental approvals.
          </p>
        </div>

        <button
          className="btn btn-primary-custom d-flex align-items-center gap-2"
          onClick={() => {
            setApplyError('');
            setShowApplyModal(true);
          }}
        >
          <Plus size={18} />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Balance Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card-custom p-4 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
                Sick Leave
              </span>
              <span className="badge bg-success-subtle text-success">Active</span>
            </div>
            <div className="d-flex align-items-baseline gap-2 mb-2">
              <h2 className="fw-bold text-dark mb-0">{balances.sick}</h2>
              <span className="text-muted small">/ 12 days quota</span>
            </div>
            <div className="progress" style={{ height: '6px' }}>
              <div
                className="progress-bar bg-success"
                style={{ width: `${(balances.sick / 12) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card-custom p-4 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
                Casual Leave
              </span>
              <span className="badge bg-warning-subtle text-warning">Active</span>
            </div>
            <div className="d-flex align-items-baseline gap-2 mb-2">
              <h2 className="fw-bold text-dark mb-0">{balances.casual}</h2>
              <span className="text-muted small">/ 10 days quota</span>
            </div>
            <div className="progress" style={{ height: '6px' }}>
              <div
                className="progress-bar bg-warning"
                style={{ width: `${(balances.casual / 10) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card-custom p-4 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
                Annual Vacation Leave
              </span>
              <span className="badge bg-primary-subtle text-primary">Active</span>
            </div>
            <div className="d-flex align-items-baseline gap-2 mb-2">
              <h2 className="fw-bold text-dark mb-0">{balances.annual}</h2>
              <span className="text-muted small">/ 18 days quota</span>
            </div>
            <div className="progress" style={{ height: '6px' }}>
              <div
                className="progress-bar bg-primary"
                style={{ width: `${(balances.annual / 18) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-3 border-bottom pb-2">
        <button
          className={`btn btn-sm ${activeTab === 'my-leaves' ? 'btn-primary-custom' : 'btn-light border'}`}
          onClick={() => setActiveTab('my-leaves')}
        >
          My Leave History ({myLeaves.length})
        </button>

        {canApprove && (
          <button
            className={`btn btn-sm d-flex align-items-center gap-1.5 ${activeTab === 'approvals' ? 'btn-primary-custom' : 'btn-light border'}`}
            onClick={() => setActiveTab('approvals')}
          >
            <span>Team & Organization Approvals</span>
            {pendingApprovalsCount > 0 && (
              <span className="badge bg-warning text-dark ms-1">{pendingApprovalsCount}</span>
            )}
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MY LEAVE REQUESTS                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'my-leaves' && (
        <div className="card-custom overflow-hidden">
          <div className="table-responsive">
            <table className="table table-custom align-middle">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Supervisor Review</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted small">
                      Loading your leave records...
                    </td>
                  </tr>
                ) : myLeaves.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted small">
                      No leave requests submitted yet. Click "Apply for Leave" above!
                    </td>
                  </tr>
                ) : (
                  myLeaves.map((l) => (
                    <tr key={l._id}>
                      <td className="fw-bold text-dark">{l.leaveType}</td>
                      <td>
                        <span className="text-dark small">
                          {l.startDate} → {l.endDate}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{l.totalDays} days</span>
                      </td>
                      <td className="small text-muted" style={{ maxWidth: '240px' }}>
                        {l.reason}
                      </td>
                      <td>
                        <StatusBadge status={l.status} />
                      </td>
                      <td className="small text-muted">
                        {l.reviewedBy ? (
                          <div>
                            <strong>{l.reviewedBy}</strong>: "{l.reviewComments || 'Approved'}"
                          </div>
                        ) : (
                          <span className="text-muted fst-italic">Pending review</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: APPROVALS QUEUE (MANAGER & HR)                                     */}
      {/* ========================================================================= */}
      {activeTab === 'approvals' && canApprove && (
        <div className="card-custom overflow-hidden">
          <div className="table-responsive">
            <table className="table table-custom align-middle">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates Requested</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted small">
                      Loading approvals queue...
                    </td>
                  </tr>
                ) : allLeaves.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted small">
                      No leave requests found.
                    </td>
                  </tr>
                ) : (
                  allLeaves.map((l) => (
                    <tr key={l._id}>
                      <td>
                        <div className="fw-bold text-dark">{l.employeeName}</div>
                        <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                          {l.employeeId} • {l.department}
                        </div>
                      </td>
                      <td className="fw-semibold text-dark">{l.leaveType}</td>
                      <td className="small text-dark">
                        {l.startDate} → {l.endDate}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{l.totalDays}d</span>
                      </td>
                      <td className="small text-muted" style={{ maxWidth: '220px' }}>
                        "{l.reason}"
                      </td>
                      <td>
                        <StatusBadge status={l.status} />
                      </td>
                      <td className="text-end">
                        {l.status === 'Pending' ? (
                          <button
                            className="btn btn-sm btn-primary-custom"
                            onClick={() => {
                              setSelectedLeave(l);
                              setReviewAction('Approved');
                              setReviewComment('Approved after team schedule verification');
                            }}
                          >
                            Review & Decide
                          </button>
                        ) : (
                          <span className="text-muted small">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* APPLY FOR LEAVE MODAL                                                     */}
      {/* ========================================================================= */}
      {showApplyModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(15, 23, 42, 0.5)', zIndex: 1200, backdropFilter: 'blur(4px)' }}
        >
          <div className="card-custom bg-white p-4 w-100 shadow-lg" style={{ maxWidth: '520px' }}>
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <h5 className="fw-bold mb-0 text-dark">Apply for Leave</h5>
              <button className="btn btn-sm btn-light p-1" onClick={() => setShowApplyModal(false)}>
                <X size={18} />
              </button>
            </div>

            {applyError && <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">{applyError}</div>}

            <form onSubmit={handleApply}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Leave Type *</label>
                <select
                  className="form-select"
                  value={applyForm.leaveType}
                  onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
                >
                  <option value="Annual Leave">Annual Vacation Leave ({balances.annual} days left)</option>
                  <option value="Sick Leave">Sick Leave ({balances.sick} days left)</option>
                  <option value="Casual Leave">Casual Leave ({balances.casual} days left)</option>
                  <option value="Maternity/Paternity">Maternity/Paternity Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-dark">Start Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={applyForm.startDate}
                    onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-dark">End Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={applyForm.endDate}
                    onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              {applyForm.startDate && applyForm.endDate && (
                <div className="p-2 mb-3 bg-light rounded text-muted small d-flex align-items-center justify-content-between">
                  <span>Total working days requested:</span>
                  <strong className="text-dark fs-6">{requestedDays} day(s)</strong>
                </div>
              )}

              <div className="mb-4">
                <label className="form-label small fw-semibold text-dark">Reason for Leave *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Please state the purpose and handover notes if applicable..."
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                <button
                  type="button"
                  className="btn btn-outline-custom"
                  onClick={() => setShowApplyModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary-custom" disabled={applyLoading}>
                  {applyLoading ? 'Submitting...' : 'Submit Leave Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REVIEW LEAVE MODAL (MANAGER & HR)                                         */}
      {/* ========================================================================= */}
      {selectedLeave && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(15, 23, 42, 0.5)', zIndex: 1200, backdropFilter: 'blur(4px)' }}
        >
          <div className="card-custom bg-white p-4 w-100 shadow-lg" style={{ maxWidth: '520px' }}>
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <div>
                <h5 className="fw-bold mb-0 text-dark">Review Leave Application</h5>
                <span className="small text-muted">{selectedLeave.employeeName} ({selectedLeave.department})</span>
              </div>
              <button className="btn btn-sm btn-light p-1" onClick={() => setSelectedLeave(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-light rounded-3 mb-3">
              <div className="d-flex justify-content-between small text-muted mb-1">
                <span>Leave Type:</span>
                <strong className="text-dark">{selectedLeave.leaveType}</strong>
              </div>
              <div className="d-flex justify-content-between small text-muted mb-1">
                <span>Duration:</span>
                <strong className="text-dark">
                  {selectedLeave.startDate} to {selectedLeave.endDate} ({selectedLeave.totalDays} days)
                </strong>
              </div>
              <div className="small text-muted mt-2 pt-2 border-top">
                <span>Reason:</span>
                <p className="mb-0 text-dark fw-semibold mt-0.5">"{selectedLeave.reason}"</p>
              </div>
            </div>

            <form onSubmit={handleReviewSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Decision</label>
                <div className="d-flex gap-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="decision"
                      id="decApprove"
                      checked={reviewAction === 'Approved'}
                      onChange={() => setReviewAction('Approved')}
                    />
                    <label className="form-check-label text-success fw-bold small" htmlFor="decApprove">
                      Approve Request
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="decision"
                      id="decReject"
                      checked={reviewAction === 'Rejected'}
                      onChange={() => setReviewAction('Rejected')}
                    />
                    <label className="form-check-label text-danger fw-bold small" htmlFor="decReject">
                      Reject Request
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-dark">Supervisor Remarks / Feedback</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Add feedback to employee..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                <button
                  type="button"
                  className="btn btn-outline-custom"
                  onClick={() => setSelectedLeave(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn ${reviewAction === 'Approved' ? 'btn-success' : 'btn-danger'} fw-semibold`}
                  disabled={reviewLoading}
                >
                  {reviewLoading ? 'Processing...' : `Confirm ${reviewAction}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavesPage;
