import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building,
  Calendar,
  DollarSign,
  Heart,
  Award,
  Edit2,
  X,
  CheckCircle,
} from 'lucide-react';
import { RoleBadge, StatusBadge } from '../components/StatusBadge';
import { updateProfileSuccess } from '../redux/slices/authSlice';
import api from '../services/api';

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [profile, setProfile] = useState(user?.employeeProfile || null);
  const [loading, setLoading] = useState(!user?.employeeProfile);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
    skills: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch latest profile
  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success && res.data.data.employeeProfile) {
        setProfile(res.data.data.employeeProfile);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const openEdit = () => {
    if (!profile) return;
    setFormData({
      phone: profile.phone || '',
      street: profile.address?.street || '',
      city: profile.address?.city || '',
      state: profile.address?.state || '',
      zipCode: profile.address?.zipCode || '',
      emergencyName: profile.emergencyContact?.name || '',
      emergencyRelationship: profile.emergencyContact?.relationship || '',
      emergencyPhone: profile.emergencyContact?.phone || '',
      skills: profile.skills ? profile.skills.join(', ') : '',
    });
    setSuccessMsg('');
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        emergencyContact: {
          name: formData.emergencyName,
          relationship: formData.emergencyRelationship,
          phone: formData.emergencyPhone,
        },
        skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
      };

      const res = await api.put('/auth/profile', payload);
      if (res.data.success) {
        setProfile(res.data.data);
        dispatch(updateProfileSuccess(res.data.data));
        setSuccessMsg('Profile updated successfully!');
        setTimeout(() => setShowEditModal(false), 800);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1 text-dark">Employee Profile & Records</h3>
          <p className="text-muted small mb-0">
            Official employment contract information, contact channels, and emergency details.
          </p>
        </div>

        <button className="btn btn-primary-custom d-flex align-items-center gap-2" onClick={openEdit}>
          <Edit2 size={16} />
          <span>Edit Personal Information</span>
        </button>
      </div>

      <div className="row g-4">
        {/* Left Column: Avatar & Summary Card */}
        <div className="col-lg-4">
          <div className="card-custom p-4 text-center h-100">
            <div className="position-relative d-inline-block mx-auto mb-3">
              <img
                src={profile?.avatar || user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name}
                className="rounded-circle shadow-sm object-fit-cover"
                style={{ width: '110px', height: '110px' }}
              />
            </div>

            <h4 className="fw-bold text-dark mb-1">{profile ? `${profile.firstName} ${profile.lastName}` : user?.name}</h4>
            <div className="text-muted small mb-2">{profile?.designation}</div>

            <div className="d-flex justify-content-center gap-2 mb-3">
              <RoleBadge role={user?.role} />
              <StatusBadge status={profile?.status || 'Active'} />
            </div>

            <div className="p-3 bg-light rounded-3 text-start mb-3 border">
              <div className="d-flex justify-content-between small text-muted mb-2">
                <span>Employee ID</span>
                <strong className="text-dark font-monospace">{profile?.employeeId || user?.employeeId}</strong>
              </div>
              <div className="d-flex justify-content-between small text-muted mb-2">
                <span>Department</span>
                <strong className="text-dark">{profile?.department}</strong>
              </div>
              <div className="d-flex justify-content-between small text-muted mb-2">
                <span>Employment Type</span>
                <strong className="text-dark">{profile?.employmentType}</strong>
              </div>
              <div className="d-flex justify-content-between small text-muted">
                <span>Joined Date</span>
                <strong className="text-dark">{profile?.joiningDate}</strong>
              </div>
            </div>

            {/* Leave Balance Quotas */}
            <div className="text-start">
              <span className="small text-muted fw-bold text-uppercase d-block mb-2" style={{ fontSize: '0.72rem' }}>
                Leave Balances
              </span>
              <div className="row g-2 text-center">
                <div className="col-4">
                  <div className="p-2 bg-light rounded border">
                    <span className="text-muted small" style={{ fontSize: '0.7rem' }}>
                      Sick
                    </span>
                    <div className="fw-bold text-success">{profile?.leaveBalances?.sick ?? 12}d</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-2 bg-light rounded border">
                    <span className="text-muted small" style={{ fontSize: '0.7rem' }}>
                      Casual
                    </span>
                    <div className="fw-bold text-warning">{profile?.leaveBalances?.casual ?? 10}d</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-2 bg-light rounded border">
                    <span className="text-muted small" style={{ fontSize: '0.7rem' }}>
                      Annual
                    </span>
                    <div className="fw-bold text-primary">{profile?.leaveBalances?.annual ?? 18}d</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Tabs/Sections */}
        <div className="col-lg-8">
          <div className="d-flex flex-column gap-4">
            {/* Employment Details */}
            <div className="card-custom p-4">
              <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <Briefcase size={20} className="text-primary" />
                <span>Job & Reporting Structure</span>
              </h5>

              <div className="row g-3">
                <div className="col-sm-6">
                  <span className="text-muted small">Designation / Role Title</span>
                  <div className="fw-semibold text-dark">{profile?.designation}</div>
                </div>
                <div className="col-sm-6">
                  <span className="text-muted small">Department</span>
                  <div className="fw-semibold text-dark">{profile?.department}</div>
                </div>
                <div className="col-sm-6">
                  <span className="text-muted small">Direct Reporting Manager</span>
                  <div className="fw-semibold text-dark">{profile?.managerName || 'Unassigned'}</div>
                </div>
                <div className="col-sm-6">
                  <span className="text-muted small">Annual Compensation</span>
                  <div className="fw-semibold text-dark">${profile?.salary?.toLocaleString() || '75,000'} USD / year</div>
                </div>
              </div>
            </div>

            {/* Contact & Residential Details */}
            <div className="card-custom p-4">
              <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <MapPin size={20} className="text-success" />
                <span>Contact Channels & Address</span>
              </h5>

              <div className="row g-3">
                <div className="col-sm-6">
                  <span className="text-muted small">Official Email Address</span>
                  <div className="fw-semibold text-dark">{profile?.email || user?.email}</div>
                </div>
                <div className="col-sm-6">
                  <span className="text-muted small">Direct Phone Number</span>
                  <div className="fw-semibold text-dark">{profile?.phone || 'Not configured'}</div>
                </div>
                <div className="col-12">
                  <span className="text-muted small">Residential Street Address</span>
                  <div className="fw-semibold text-dark">
                    {profile?.address
                      ? `${profile.address.street}, ${profile.address.city}, ${profile.address.state} ${profile.address.zipCode}, ${profile.address.country || 'USA'}`
                      : '123 Market St, San Francisco, CA'}
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contacts & Skills */}
            <div className="card-custom p-4">
              <div className="row g-4">
                <div className="col-md-6 border-end-md">
                  <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <Heart size={18} className="text-danger" />
                    <span>Emergency Contact</span>
                  </h6>
                  <div className="mb-2">
                    <span className="text-muted small">Contact Person</span>
                    <div className="fw-semibold text-dark">{profile?.emergencyContact?.name || 'Primary Contact'}</div>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted small">Relationship</span>
                    <div className="fw-semibold text-dark">{profile?.emergencyContact?.relationship || 'Family'}</div>
                  </div>
                  <div>
                    <span className="text-muted small">Emergency Phone</span>
                    <div className="fw-semibold text-dark">{profile?.emergencyContact?.phone || '+1 (555) 999-0000'}</div>
                  </div>
                </div>

                <div className="col-md-6">
                  <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <Award size={18} className="text-warning" />
                    <span>Skills & Competencies</span>
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {profile?.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill, index) => (
                        <span key={index} className="badge bg-light text-dark border px-2.5 py-1.5 rounded-pill">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted small">No specific skills listed.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EDIT PERSONAL INFO MODAL                                                  */}
      {/* ========================================================================= */}
      {showEditModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(15, 23, 42, 0.5)', zIndex: 1200, backdropFilter: 'blur(4px)' }}
        >
          <div className="card-custom bg-white p-4 w-100 shadow-lg" style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <h5 className="fw-bold mb-0 text-dark">Update Personal Information</h5>
              <button className="btn btn-sm btn-light p-1" onClick={() => setShowEditModal(false)}>
                <X size={18} />
              </button>
            </div>

            {successMsg && (
              <div className="alert alert-success py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                <CheckCircle size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdate}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Direct Phone</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <h6 className="fw-bold text-dark mt-4 mb-2 small text-uppercase">Residential Address</h6>
              <div className="mb-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Street Address"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="col-3">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div className="col-3">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Zip"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  />
                </div>
              </div>

              <h6 className="fw-bold text-dark mt-4 mb-2 small text-uppercase">Emergency Contact</h6>
              <div className="row g-2 mb-3">
                <div className="col-sm-4">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Full Name"
                    value={formData.emergencyName}
                    onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                  />
                </div>
                <div className="col-sm-4">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Relationship"
                    value={formData.emergencyRelationship}
                    onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
                  />
                </div>
                <div className="col-sm-4">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Phone"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-dark">Skills (comma separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="React, Redux, Node.js, Leadership"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                />
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                <button
                  type="button"
                  className="btn btn-outline-custom"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary-custom" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
