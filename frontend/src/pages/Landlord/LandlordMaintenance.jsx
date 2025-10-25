import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axios';
import '../Tenant/TenantMaintenance.css';

const LandlordMaintenance = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const [maintenanceRes, propertiesRes] = await Promise.all([
        api.get('/maintenance'),
        api.get('/properties'),
      ]);

      const myProperties = propertiesRes.data.filter(
        (p) => p.landlord?._id === user._id || p.landlord === user._id
      );

      const myPropertyIds = myProperties.map((p) => p._id);

      const myRequests = maintenanceRes.data.filter((r) =>
        myPropertyIds.includes(r.property?._id || r.property)
      );

      setRequests(myRequests);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);

    try {
      await api.put(`/maintenance/${id}`, { status: newStatus });
      setRequests(
        requests.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
      );
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResponseUpdate = async (id, response) => {
    const newResponse = prompt('Enter your response:', response || '');
    if (newResponse === null) return;

    setUpdatingId(id);

    try {
      await api.put(`/maintenance/${id}`, { response: newResponse });
      setRequests(
        requests.map((r) => (r._id === id ? { ...r, response: newResponse } : r))
      );
    } catch (error) {
      alert('Failed to update response');
    } finally {
      setUpdatingId(null);
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
          <p className="text-muted">Manage maintenance requests from your tenants</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔧</div>
          <h3>No Maintenance Requests</h3>
          <p>There are no maintenance requests at this time</p>
        </div>
      ) : (
        <div className="maintenance-list">
          {requests.map((request) => (
            <div key={request._id} className="maintenance-card">
              <div className="maintenance-header">
                <div>
                  <h3>{request.property?.title || 'Property'}</h3>
                  <p className="text-muted text-small">
                    Submitted by {request.tenant?.name || 'Tenant'} on{' '}
                    {new Date(request.createdAt).toLocaleDateString()}
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
                    <h4>Your Response</h4>
                    <p className="maintenance-response">{request.response}</p>
                  </>
                )}
              </div>

              <div className="maintenance-actions">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleResponseUpdate(request._id, request.response)}
                  disabled={updatingId === request._id}
                >
                  {request.response ? 'Edit Response' : 'Add Response'}
                </button>

                {request.status === 'pending' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleStatusUpdate(request._id, 'in-progress')}
                    disabled={updatingId === request._id}
                  >
                    Mark In Progress
                  </button>
                )}

                {request.status === 'in-progress' && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleStatusUpdate(request._id, 'resolved')}
                    disabled={updatingId === request._id}
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LandlordMaintenance;
