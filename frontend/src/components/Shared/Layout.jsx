import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import './Layout.css';

const Layout = () => {
  const { isAdmin, isLandlord, isTenant } = useAuth();

  const getLinks = () => {
    if (isAdmin) {
      return [
        { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/admin/properties', icon: '🏠', label: 'Properties' },
        { path: '/admin/users', icon: '👥', label: 'Users' },
        { path: '/admin/maintenance', icon: '🔧', label: 'Maintenance' },
      ];
    }

    if (isLandlord) {
      return [
        { path: '/landlord/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/landlord/properties', icon: '🏠', label: 'My Properties' },
        { path: '/landlord/maintenance', icon: '🔧', label: 'Maintenance' },
      ];
    }

    if (isTenant) {
      return [
        { path: '/tenant/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/tenant/property', icon: '🏠', label: 'My Property' },
        { path: '/tenant/maintenance', icon: '🔧', label: 'Maintenance' },
      ];
    }

    return [];
  };

  return (
    <div className="app-layout">
      <Navbar />
      <div className="layout-container">
        <Sidebar links={getLinks()} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
