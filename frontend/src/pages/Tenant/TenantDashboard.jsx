import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axios';
import '../Admin/AdminDashboard.css';

const TenantDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myProperty: null,
    rentDue: 0,
    maintenanceRequests: 0,
    nextPaymentDate: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [propertiesRes, maintenanceRes] = await Promise.all([
        api.get('/properties'),
        api.get('/maintenance'),
      ]);

      const properties = propertiesRes.data;
      const maintenance = maintenanceRes.data;

      const myProperty = properties.find(
        (p) => p.tenant?._id === user._id || p.tenant === user._id
      );

      const myMaintenanceRequests = maintenance.filter(
        (m) => m.tenant === user._id || m.tenant?._id === user._id
      );

      setStats({
        myProperty,
        rentDue: myProperty?.price || 0,
        maintenanceRequests: myMaintenanceRequests.length,
        nextPaymentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
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
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}</h1>
        <p className="text-muted">Here's an overview of your rental</p>
      </div>

      {!stats.myProperty ? (
        <div className="empty-state">
          <div className="empty-icon">🏠</div>
          <h3>No Property Assigned</h3>
          <p>You don't have any property assigned yet. Contact your landlord or administrator.</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card stat-card-primary">
              <div className="stat-icon">🏠</div>
              <div className="stat-details">
                <h3>1</h3>
                <p>My Property</p>
              </div>
            </div>

            <div className="stat-card stat-card-warning">
              <div className="stat-icon">💰</div>
              <div className="stat-details">
                <h3>${stats.rentDue}</h3>
                <p>Monthly Rent</p>
              </div>
            </div>

            <div className="stat-card stat-card-info">
              <div className="stat-icon">🔧</div>
              <div className="stat-details">
                <h3>{stats.maintenanceRequests}</h3>
                <p>Maintenance Requests</p>
              </div>
            </div>

            <div className="stat-card stat-card-success">
              <div className="stat-icon">📅</div>
              <div className="stat-details">
                <h3>{stats.nextPaymentDate}</h3>
                <p>Next Payment</p>
              </div>
            </div>
          </div>

          <div className="dashboard-info">
            <div className="info-card">
              <h3>Quick Actions</h3>
              <ul className="action-list">
                <li>View your property details and lease information</li>
                <li>Submit maintenance requests when needed</li>
                <li>Track your maintenance request status</li>
                <li>Communicate with your landlord</li>
                <li>View payment history and receipts</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TenantDashboard;
