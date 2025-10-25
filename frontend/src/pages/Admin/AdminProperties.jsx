import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import PropertyModal from '../../components/Admin/PropertyModal';
import './AdminProperties.css';

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [landlords, setLandlords] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [propertiesRes, usersRes] = await Promise.all([
        api.get('/properties'),
        api.get('/users'),
      ]);

      setProperties(propertiesRes.data);
      const users = usersRes.data;
      setLandlords(users.filter((u) => u.role === 'landlord'));
      setTenants(users.filter((u) => u.role === 'tenant'));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      await api.delete(`/properties/${id}`);
      setProperties(properties.filter((p) => p._id !== id));
    } catch (error) {
      alert('Failed to delete property');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProperty(null);
  };

  const handleModalSuccess = () => {
    fetchData();
    handleModalClose();
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
          <h1>Properties</h1>
          <p className="text-muted">Manage all properties in the system</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add Property
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏠</div>
          <h3>No Properties Yet</h3>
          <p>Get started by adding your first property</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Add Property
          </button>
        </div>
      ) : (
        <div className="properties-grid">
          {properties.map((property) => (
            <div key={property._id} className="property-card">
              <div className="property-header">
                <h3>{property.title}</h3>
                <span className={`badge badge-${property.status === 'available' ? 'success' : property.status === 'occupied' ? 'info' : 'warning'}`}>
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
                {property.landlord && (
                  <div className="property-detail-item">
                    <span className="detail-icon">👤</span>
                    <span>Landlord: {property.landlord.name}</span>
                  </div>
                )}
                {property.tenant && (
                  <div className="property-detail-item">
                    <span className="detail-icon">🏘️</span>
                    <span>Tenant: {property.tenant.name}</span>
                  </div>
                )}
              </div>

              <div className="property-actions">
                <button className="btn btn-outline btn-sm" onClick={() => handleEdit(property)}>
                  Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(property._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <PropertyModal
          property={editingProperty}
          landlords={landlords}
          tenants={tenants}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default AdminProperties;
