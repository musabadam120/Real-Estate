import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === 'all') return true;
    return user.role === filter;
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
          <h1>Users</h1>
          <p className="text-muted">Manage all users in the system</p>
        </div>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'filter-tab-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Users ({users.length})
        </button>
        <button
          className={`filter-tab ${filter === 'admin' ? 'filter-tab-active' : ''}`}
          onClick={() => setFilter('admin')}
        >
          Admins ({users.filter((u) => u.role === 'admin').length})
        </button>
        <button
          className={`filter-tab ${filter === 'landlord' ? 'filter-tab-active' : ''}`}
          onClick={() => setFilter('landlord')}
        >
          Landlords ({users.filter((u) => u.role === 'landlord').length})
        </button>
        <button
          className={`filter-tab ${filter === 'tenant' ? 'filter-tab-active' : ''}`}
          onClick={() => setFilter('tenant')}
        >
          Tenants ({users.filter((u) => u.role === 'tenant').length})
        </button>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                    <span>{user.name}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge badge-${user.role === 'admin' ? 'error' : user.role === 'landlord' ? 'warning' : 'info'}`}>
                    {user.role}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(user._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <p>No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
