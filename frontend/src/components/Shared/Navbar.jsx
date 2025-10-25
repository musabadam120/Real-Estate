import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin, isLandlord, isTenant } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isLandlord) return '/landlord/dashboard';
    if (isTenant) return '/tenant/dashboard';
    return '/';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={getDashboardLink()} className="navbar-logo">
          <span className="logo-icon">🏠</span>
          <span className="logo-text">EstateManager</span>
        </Link>

        <div className="navbar-menu">
          <div className="navbar-user">
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
