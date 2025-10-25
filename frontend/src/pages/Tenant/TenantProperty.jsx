import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axios';
import './TenantProperty.css';

const TenantProperty = () => {
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperty();
  }, []);

  const fetchProperty = async () => {
    try {
      const response = await api.get('/properties');
      const myProperty = response.data.find(
        (p) => p.tenant?._id === user._id || p.tenant === user._id
      );
      setProperty(myProperty);
    } catch (error) {
      console.error('Failed to fetch property:', error);
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

  if (!property) {
    return (
      <div className="dashboard-content">
        <div className="empty-state">
          <div className="empty-icon">🏠</div>
          <h3>No Property Assigned</h3>
          <p>You don't have any property assigned yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div>
          <h1>My Property</h1>
          <p className="text-muted">View your rental property details</p>
        </div>
      </div>

      <div className="property-detail-container">
        <div className="property-detail-card">
          <div className="property-detail-header">
            <h2>{property.title}</h2>
            <span
              className={`badge badge-${
                property.status === 'available'
                  ? 'success'
                  : property.status === 'occupied'
                  ? 'info'
                  : 'warning'
              }`}
            >
              {property.status}
            </span>
          </div>

          <div className="property-info-grid">
            <div className="info-section">
              <h3>Property Information</h3>
              <div className="info-items">
                <div className="info-item">
                  <span className="info-label">Address</span>
                  <span className="info-value">📍 {property.address}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Monthly Rent</span>
                  <span className="info-value">💰 ${property.price}</span>
                </div>
                {property.phone && (
                  <div className="info-item">
                    <span className="info-label">Contact Phone</span>
                    <span className="info-value">📞 {property.phone}</span>
                  </div>
                )}
                {property.email && (
                  <div className="info-item">
                    <span className="info-label">Contact Email</span>
                    <span className="info-value">📧 {property.email}</span>
                  </div>
                )}
              </div>
            </div>

            {property.landlord && (
              <div className="info-section">
                <h3>Landlord Information</h3>
                <div className="info-items">
                  <div className="info-item">
                    <span className="info-label">Name</span>
                    <span className="info-value">👤 {property.landlord.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">📧 {property.landlord.email}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantProperty;
