import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axios';
import './TenantMaintenance.css';

const TenantMaintenance = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    property: '',
    issue: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [maintenanceRes, propertiesRes] = await Promise.all([
        api.get('/maintenance'),
        api.get('/properties'),
      ]);

      const allRequests = maintenanceRes.data;
      const myRequests = allRequests.filter(
        (r) => r.tenant === user._id || r.tenant?._id === user._id
      );

      const allProperties = propertiesRes.data;
      const myProperties = allProperties.filter(
        (p) => p.tenant?._id === user._id || p.tenant === user._id
      );

      setRequests(myRequests);
      setProperties(myProperties);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/maintenance', formData);
      setFormData({ property: '', issue: '' });
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner loading-spinner-lg"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div>
          <h1>Maintenance Requests</h1>
          <p className="text-muted">Submit and track your maintenance requests</p>
        </div>
        {properties.length > 0 && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            New Request
          </button>
        )}
      </div>

      {properties.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔧</div>
          <h3>No Property Assigned</h3>
          <p>You need to be assigned to a property to submit maintenance requests</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔧</div>
          <h3>No Maintenance Requests</h3>
          <p>You haven't submitted any maintenance requests yet</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Submit Request
          </button>
        </div>
      ) : (
        <div className="maintenance-list">
          {requests.map((request) => (
            <div key={request._id} className="maintenance-card">
              <div className="maintenance-header">
                <div>
                  <h3>{request.property?.title || 'Property'}</h3>
                  <p className="text-muted text-small">
                    Submitted on {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`badge badge-${
                    request.status === 'pending'
                      ? 'warning'
                      : request.status === 'in-progress'
                      ? 'info'
                      : 'success'
                  }`}
                >
                  {request.status}
                </span>
              </div>

              <div className="maintenance-body">
                <h4>Issue Description</h4>
                <p>{request.issue}</p>

                {request.response && (
                  <>
                    <h4>Response</h4>
                    <p className="maintenance-response">{request.response}</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Maintenance Request</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="input-group">
                  <label htmlFor="property">Property</label>
                  <select
                    id="property"
                    name="property"
                    value={formData.property}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Property</option>
                    {properties.map((property) => (
                      <option key={property._id} value={property._id}>
                        {property.title} - {property.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="issue">Issue Description</label>
                  <textarea
                    id="issue"
                    name="issue"
                    value={formData.issue}
                    onChange={handleChange}
                    placeholder="Describe the issue in detail..."
                    required
                    rows="6"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="loading-spinner"></span>
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantMaintenance;
