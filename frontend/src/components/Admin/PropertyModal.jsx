import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import './PropertyModal.css';

const PropertyModal = ({ property, landlords, tenants, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    price: '',
    status: 'available',
    landlord: '',
    tenant: '',
    email: '',
    phone: '',
    nationality: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || '',
        address: property.address || '',
        price: property.price || '',
        status: property.status || 'available',
        landlord: property.landlord?._id || '',
        tenant: property.tenant?._id || '',
        email: property.email || '',
        phone: property.phone || '',
        nationality: property.nationality || '',
      });
    }
  }, [property]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { ...formData };
      if (!payload.tenant) delete payload.tenant;
      if (!payload.email) delete payload.email;
      if (!payload.phone) delete payload.phone;
      if (!payload.nationality) delete payload.nationality;

      if (property) {
        await api.put(`/properties/${property._id}`, payload);
      } else {
        await api.post('/properties', payload);
      }

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{property ? 'Edit Property' : 'Add New Property'}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="input-group">
              <label htmlFor="title">Property Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Modern 2BR Apartment"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full property address"
                required
              />
            </div>

            <div className="form-row">
              <div className="input-group">
                <label htmlFor="price">Monthly Rent ($)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="1200"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange}>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="landlord">Landlord</label>
              <select
                id="landlord"
                name="landlord"
                value={formData.landlord}
                onChange={handleChange}
                required
              >
                <option value="">Select Landlord</option>
                {landlords.map((landlord) => (
                  <option key={landlord._id} value={landlord._id}>
                    {landlord.name} - {landlord.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="tenant">Tenant (Optional)</label>
              <select id="tenant" name="tenant" value={formData.tenant} onChange={handleChange}>
                <option value="">No Tenant Assigned</option>
                {tenants.map((tenant) => (
                  <option key={tenant._id} value={tenant._id}>
                    {tenant.name} - {tenant.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-section-title">Additional Information (Optional)</div>

            <div className="input-group">
              <label htmlFor="email">Contact Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@property.com"
              />
            </div>

            <div className="input-group">
              <label htmlFor="phone">Contact Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
              />
            </div>

            <div className="input-group">
              <label htmlFor="nationality">Nationality</label>
              <input
                type="text"
                id="nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                placeholder="e.g., USA"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Saving...
                </>
              ) : property ? (
                'Update Property'
              ) : (
                'Create Property'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyModal;
