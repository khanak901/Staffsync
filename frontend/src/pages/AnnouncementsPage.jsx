import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Megaphone, Plus, Trash2, Pin, Calendar, User, Tag, X } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import api from '../services/api';

const AnnouncementsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const canPost = user?.role === 'hr' || user?.role === 'manager';
  const isHR = user?.role === 'hr';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'Medium',
    targetAudience: 'All',
    category: 'General',
    pinned: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements');
      if (res.data.success) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await api.post('/announcements', formData);
      if (res.data.success) {
        setShowModal(false);
        setFormData({
          title: '',
          content: '',
          priority: 'Medium',
          targetAudience: 'All',
          category: 'General',
          pinned: false,
        });
        fetchAnnouncements();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const filtered = announcements.filter((a) => {
    if (selectedCategory === 'All') return true;
    return a.category === selectedCategory;
  });

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1 text-dark">Company Announcements</h3>
          <p className="text-muted small mb-0">
            Official company news, policy updates, event notifications, and team celebrations.
          </p>
        </div>

        {canPost && (
          <button
            className="btn btn-primary-custom d-flex align-items-center gap-2"
            onClick={() => {
              setErrorMsg('');
              setShowModal(true);
            }}
          >
            <Plus size={18} />
            <span>Post Announcement</span>
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {['All', 'General', 'Policy', 'Event', 'Holiday'].map((cat) => (
          <button
            key={cat}
            className={`btn btn-sm rounded-pill px-3 ${selectedCategory === cat ? 'btn-primary-custom' : 'btn-light border'}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="text-center py-5 text-muted small">Loading announcements...</div>
      ) : filtered.length === 0 ? (
        <div className="card-custom p-5 text-center text-muted">
          <Megaphone size={32} className="text-muted mb-2" />
          <h6>No announcements in this category</h6>
        </div>
      ) : (
        <div className="row g-4">
          {filtered.map((item) => (
            <div key={item._id} className="col-lg-6">
              <div className="card-custom p-4 h-100 position-relative d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                    <div className="d-flex align-items-center gap-2">
                      {item.pinned && (
                        <span className="badge bg-warning-subtle text-warning border border-warning-subtle d-flex align-items-center gap-1">
                          <Pin size={12} /> Pinned
                        </span>
                      )}
                      <StatusBadge status={item.priority} />
                      <span className="badge bg-light text-secondary border">{item.category}</span>
                    </div>

                    {isHR && (
                      <button
                        className="btn btn-sm btn-light border text-danger p-1"
                        title="Delete"
                        onClick={() => handleDelete(item._id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <h5 className="fw-bold text-dark mb-2" style={{ letterSpacing: '-0.3px' }}>
                    {item.title}
                  </h5>

                  <p className="text-muted small mb-3" style={{ lineHeight: '1.6', fontSize: '0.875rem' }}>
                    {item.content}
                  </p>
                </div>

                <div className="d-flex flex-wrap align-items-center justify-content-between pt-3 border-top text-muted small" style={{ fontSize: '0.78rem' }}>
                  <span>
                    Posted by <strong>{item.postedBy}</strong>
                  </span>
                  <span>Target: {item.targetAudience}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* POST ANNOUNCEMENT MODAL                                                   */}
      {/* ========================================================================= */}
      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(15, 23, 42, 0.5)', zIndex: 1200, backdropFilter: 'blur(4px)' }}
        >
          <div className="card-custom bg-white p-4 w-100 shadow-lg" style={{ maxWidth: '600px' }}>
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <h5 className="fw-bold mb-0 text-dark">Publish Organization Announcement</h5>
              <button className="btn btn-sm btn-light p-1" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            {errorMsg && <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">{errorMsg}</div>}

            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Announcement Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Q4 Townhall Meeting & Strategy Launch"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-sm-4">
                  <label className="form-label small fw-semibold text-dark">Priority</label>
                  <select
                    className="form-select"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div className="col-sm-4">
                  <label className="form-label small fw-semibold text-dark">Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="General">General</option>
                    <option value="Policy">Policy</option>
                    <option value="Event">Event</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Alert">Alert</option>
                  </select>
                </div>

                <div className="col-sm-4">
                  <label className="form-label small fw-semibold text-dark">Audience</label>
                  <select
                    className="form-select"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  >
                    <option value="All">All Organization</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Content / Message Body *</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Write announcement details..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="form-check mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="pinCheck"
                  checked={formData.pinned}
                  onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                />
                <label className="form-check-label small text-dark fw-semibold" htmlFor="pinCheck">
                  Pin to top of newsfeed
                </label>
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
                  {submitting ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
