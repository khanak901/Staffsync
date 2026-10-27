import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  GraduationCap,
  Plus,
  Users,
  Clock,
  Calendar,
  CheckCircle,
  ExternalLink,
  BookOpen,
  X,
  Play,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import api from '../services/api';

const TrainingsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const canCreate = user?.role === 'manager' || user?.role === 'hr';

  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    trainer: user?.name || '',
    department: 'All',
    startDate: '',
    endDate: '',
    durationHours: 12,
    capacity: 25,
    location: 'Virtual Classroom (Zoom)',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Progress update state
  const [editingProgressId, setEditingProgressId] = useState(null);
  const [tempProgress, setTempProgress] = useState(0);

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/trainings');
      if (res.data.success) {
        setTrainings(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  // Handle Enroll
  const handleEnroll = async (id) => {
    try {
      const res = await api.post(`/trainings/${id}/enroll`);
      if (res.data.success) {
        fetchTrainings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Enrollment failed');
    }
  };

  // Handle Progress Update
  const handleSaveProgress = async (id) => {
    try {
      const res = await api.put(`/trainings/${id}/progress`, { progress: tempProgress });
      if (res.data.success) {
        setEditingProgressId(null);
        fetchTrainings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update progress');
    }
  };

  // Handle Create Program
  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await api.post('/trainings', formData);
      if (res.data.success) {
        setShowModal(false);
        setFormData({
          title: '',
          description: '',
          trainer: user?.name || '',
          department: 'All',
          startDate: '',
          endDate: '',
          durationHours: 12,
          capacity: 25,
          location: 'Virtual Classroom (Zoom)',
        });
        fetchTrainings();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create training program');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1 text-dark">Training & Development Programs</h3>
          <p className="text-muted small mb-0">
            Professional skill workshops, compliance training, and workforce development curriculum.
          </p>
        </div>

        {canCreate && (
          <button
            className="btn btn-primary-custom d-flex align-items-center gap-2"
            onClick={() => {
              setErrorMsg('');
              setShowModal(true);
            }}
          >
            <Plus size={18} />
            <span>Create Training Program</span>
          </button>
        )}
      </div>

      {/* Program Cards */}
      {loading ? (
        <div className="text-center py-5 text-muted small">Loading training programs...</div>
      ) : trainings.length === 0 ? (
        <div className="card-custom p-5 text-center text-muted">
          <GraduationCap size={32} className="mb-2" />
          <h6>No training programs scheduled currently.</h6>
        </div>
      ) : (
        <div className="row g-4">
          {trainings.map((t) => {
            const isEnrolled = t.enrolledEmployees?.some((e) => e.employeeId === user?.employeeId);
            const myEnrollment = t.enrolledEmployees?.find((e) => e.employeeId === user?.employeeId);
            const enrollmentCount = t.enrolledEmployees?.length || 0;

            return (
              <div key={t._id} className="col-lg-6">
                <div className="card-custom p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <StatusBadge status={t.status} />
                      <span className="badge bg-light text-secondary border">
                        {t.department} Department
                      </span>
                    </div>

                    <h5 className="fw-bold text-dark mb-2">{t.title}</h5>
                    <p className="text-muted small mb-3" style={{ fontSize: '0.875rem' }}>
                      {t.description}
                    </p>

                    <div className="p-3 bg-light rounded-3 mb-3 small text-muted">
                      <div className="row g-2">
                        <div className="col-6">
                          Trainer: <strong className="text-dark">{t.trainer}</strong>
                        </div>
                        <div className="col-6">
                          Duration: <strong className="text-dark">{t.durationHours} Hours</strong>
                        </div>
                        <div className="col-6">
                          Dates:{' '}
                          <strong className="text-dark">
                            {t.startDate} → {t.endDate}
                          </strong>
                        </div>
                        <div className="col-6">
                          Enrolled:{' '}
                          <strong className="text-dark">
                            {enrollmentCount} / {t.capacity}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Progress tracking if enrolled */}
                    {isEnrolled && (
                      <div className="p-3 bg-white border rounded-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="small fw-semibold text-dark">My Progress</span>
                          <span className="badge bg-success-subtle text-success">
                            {myEnrollment.progress}% Completed
                          </span>
                        </div>
                        <div className="progress mb-2" style={{ height: '6px' }}>
                          <div
                            className="progress-bar bg-success"
                            style={{ width: `${myEnrollment.progress}%` }}
                          ></div>
                        </div>

                        {editingProgressId === t._id ? (
                          <div className="d-flex align-items-center gap-2 mt-2">
                            <input
                              type="range"
                              className="form-range flex-fill"
                              min="0"
                              max="100"
                              step="10"
                              value={tempProgress}
                              onChange={(e) => setTempProgress(Number(e.target.value))}
                            />
                            <button
                              className="btn btn-sm btn-success py-0 px-2 small"
                              onClick={() => handleSaveProgress(t._id)}
                            >
                              Save {tempProgress}%
                            </button>
                            <button
                              className="btn btn-sm btn-light border py-0 px-1"
                              onClick={() => setEditingProgressId(null)}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-sm btn-link p-0 text-primary small text-decoration-none"
                            onClick={() => {
                              setEditingProgressId(t._id);
                              setTempProgress(myEnrollment.progress);
                            }}
                          >
                            Update my completion progress
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-top d-flex align-items-center justify-content-between">
                    <span className="small text-muted">{t.location}</span>

                    {isEnrolled ? (
                      <span className="badge bg-success-subtle text-success py-1.5 px-3 border border-success-subtle d-flex align-items-center gap-1">
                        <CheckCircle size={14} /> Enrolled
                      </span>
                    ) : (
                      <button
                        className="btn btn-primary-custom btn-sm"
                        onClick={() => handleEnroll(t._id)}
                        disabled={enrollmentCount >= t.capacity}
                      >
                        {enrollmentCount >= t.capacity ? 'Class Full' : 'Enroll Now'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE TRAINING MODAL (MANAGER & HR)                                      */}
      {/* ========================================================================= */}
      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(15, 23, 42, 0.5)', zIndex: 1200, backdropFilter: 'blur(4px)' }}
        >
          <div className="card-custom bg-white p-4 w-100 shadow-lg" style={{ maxWidth: '600px' }}>
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <h5 className="fw-bold mb-0 text-dark">Schedule Training Program</h5>
              <button className="btn btn-sm btn-light p-1" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            {errorMsg && <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">{errorMsg}</div>}

            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Program Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Advanced Docker & Kubernetes Architecture"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Course Description *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Outline key learning objectives..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-dark">Instructor / Trainer *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.trainer}
                    onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
                    required
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-dark">Target Department</label>
                  <select
                    className="form-select"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="All">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-dark">Start Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-dark">End Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-dark">Duration (Hours)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.durationHours}
                    onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-dark">Max Capacity</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                <button
                  type="button"
                  className="btn btn-outline-custom"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary-custom" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Schedule Training'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingsPage;
