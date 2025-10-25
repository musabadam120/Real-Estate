import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import '../Tenant/TenantMaintenance.css';

const AdminMaintenance = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/maintenance');
      setRequests(response.data);
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) {
      return;
    }

    try {
      await api.delete(`/maintenance/${id}`);
      setRequests(requests.filter((r) => r._id !== id));
    } catch (error) {
      alert('Failed to delete request');
    }
  };

  const filteredRequests = requests.filter((request) => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

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
          <h1>All Maintenance Requests</h1>
          <p className="text-muted">Manage all maintenance requests in the system</p>
        </div>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'filter-tab-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({requests.length})
        </button>
        <button
          className={`filter-tab ${filter === 'pending' ? 'filter-tab-active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({requests.filter((r) => r.status === 'pending').length})
        </button>
        <button
          className={`filter-tab ${filter === 'in-progress' ? 'filter-tab-active' : ''}`}
          onClick={() => setFilter('in-progress')}
        >
          In Progress ({requests.filter((r) => r.status === 'in-progress').length})
        </button>
        <button
          className={`filter-tab ${filter === 'resolved' ? 'filter-tab-active' : ''}`}
          onClick={() => setFilter('resolved')}
        >
          Resolved ({requests.filter((r) => r.status === 'resolved').length})
        </button>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔧</div>
          <h3>No Maintenance Requests</h3>
          <p>There are no maintenance requests matching your filter</p>
        </div>
      ) : (
        <div className="maintenance-list">
          {filteredRequests.map((request) => (
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
                    <h4>Response</h4>
                    <p className="maintenance-response">{request.response}</p>
                  </>
                )}
              </div>

              <div className="maintenance-actions">
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

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(request._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMaintenance;
