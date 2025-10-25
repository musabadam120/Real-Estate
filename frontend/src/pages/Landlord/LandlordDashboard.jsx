import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axios';
import '../Admin/AdminDashboard.css';

const LandlordDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProperties: 0,
    occupiedProperties: 0,
    totalTenants: 0,
    pendingMaintenance: 0,
    totalRentCollected: 0,
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

      const myProperties = properties.filter(
        (p) => p.landlord?._id === user._id || p.landlord === user._id
      );

      setStats({
        totalProperties: myProperties.length,
        occupiedProperties: myProperties.filter((p) => p.status === 'occupied').length,
        totalTenants: myProperties.filter((p) => p.tenant).length,
        pendingMaintenance: maintenance.filter(
          (m) => m.status === 'pending' && myProperties.some((p) => p._id === m.property)
        ).length,
        totalRentCollected: myProperties.reduce((sum, p) => sum + (p.price || 0), 0),
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
        <p className="text-muted">Here's an overview of your properties</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">🏠</div>
          <div className="stat-details">
            <h3>{stats.totalProperties}</h3>
            <p>Total Properties</p>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-icon">✅</div>
          <div className="stat-details">
            <h3>{stats.occupiedProperties}</h3>
            <p>Occupied Properties</p>
          </div>
        </div>

        <div className="stat-card stat-card-info">
          <div className="stat-icon">👥</div>
          <div className="stat-details">
            <h3>{stats.totalTenants}</h3>
            <p>Active Tenants</p>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-icon">🔧</div>
          <div className="stat-details">
            <h3>{stats.pendingMaintenance}</h3>
            <p>Pending Requests</p>
          </div>
        </div>
      </div>

      <div className="dashboard-info">
        <div className="info-card">
          <h3>Quick Actions</h3>
          <ul className="action-list">
            <li>View and manage your properties</li>
            <li>Track tenant information and contacts</li>
            <li>Handle maintenance requests from tenants</li>
            <li>Monitor rent payments and history</li>
            <li>Communicate with tenants directly</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LandlordDashboard;
