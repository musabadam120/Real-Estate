import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/axios';
import '../Admin/AdminProperties.css';

const LandlordProperties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await api.get('/properties');
      const myProperties = response.data.filter(
        (p) => p.landlord?._id === user._id || p.landlord === user._id
      );
      setProperties(myProperties);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
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
      <div className="page-header">
        <div>
          <h1>My Properties</h1>
          <p className="text-muted">Manage your property portfolio</p>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏠</div>
          <h3>No Properties Assigned</h3>
          <p>Contact your administrator to get properties assigned to you</p>
        </div>
      ) : (
        <div className="properties-grid">
          {properties.map((property) => (
            <div key={property._id} className="property-card">
              <div className="property-header">
                <h3>{property.title}</h3>
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

              <div className="property-details">
                <div className="property-detail-item">
                  <span className="detail-icon">📍</span>
                  <span>{property.address}</span>
                </div>
                <div className="property-detail-item">
                  <span className="detail-icon">💰</span>
                  <span>${property.price}/month</span>
                </div>
                {property.tenant && (
                  <>
                    <div className="property-detail-item">
                      <span className="detail-icon">👤</span>
                      <span>Tenant: {property.tenant.name}</span>
                    </div>
                    <div className="property-detail-item">
                      <span className="detail-icon">📧</span>
                      <span>{property.tenant.email}</span>
                    </div>
                  </>
                )}
                {property.phone && (
                  <div className="property-detail-item">
                    <span className="detail-icon">📞</span>
                    <span>{property.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LandlordProperties;
