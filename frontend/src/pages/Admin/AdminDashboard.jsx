import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    occupiedProperties: 0,
    totalUsers: 0,
    totalLandlords: 0,
    totalTenants: 0,
    pendingMaintenance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [propertiesRes, usersRes, maintenanceRes] = await Promise.all([
        api.get('/properties'),
        api.get('/users'),
        api.get('/maintenance'),
      ]);

      const properties = propertiesRes.data;
      const users = usersRes.data;
      const maintenance = maintenanceRes.data;

      setStats({
        totalProperties: properties.length,
        occupiedProperties: properties.filter((p) => p.status === 'occupied').length,
        totalUsers: users.length,
        totalLandlords: users.filter((u) => u.role === 'landlord').length,
        totalTenants: users.filter((u) => u.role === 'tenant').length,
        pendingMaintenance: maintenance.filter((m) => m.status === 'pending').length,
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
        <h1>Admin Dashboard</h1>
        <p className="text-muted">Overview of your real estate management system</p>
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
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-icon">🏢</div>
          <div className="stat-details">
            <h3>{stats.totalLandlords}</h3>
            <p>Landlords</p>
          </div>
        </div>

        <div className="stat-card stat-card-secondary">
          <div className="stat-icon">🏘️</div>
          <div className="stat-details">
            <h3>{stats.totalTenants}</h3>
            <p>Tenants</p>
          </div>
        </div>

        <div className="stat-card stat-card-error">
          <div className="stat-icon">🔧</div>
          <div className="stat-details">
            <h3>{stats.pendingMaintenance}</h3>
            <p>Pending Maintenance</p>
          </div>
        </div>
      </div>

      <div className="dashboard-info">
        <div className="info-card">
          <h3>Quick Actions</h3>
          <ul className="action-list">
            <li>Create and manage properties</li>
            <li>Assign landlords and tenants to properties</li>
            <li>Monitor all payments and transactions</li>
            <li>Handle maintenance requests</li>
            <li>View detailed analytics and reports</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
