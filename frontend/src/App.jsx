import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Shared/ProtectedRoute';
import Layout from './components/Shared/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminProperties from './pages/Admin/AdminProperties';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminMaintenance from './pages/Admin/AdminMaintenance';
import LandlordDashboard from './pages/Landlord/LandlordDashboard';
import LandlordProperties from './pages/Landlord/LandlordProperties';
import LandlordMaintenance from './pages/Landlord/LandlordMaintenance';
import TenantDashboard from './pages/Tenant/TenantDashboard';
import TenantProperty from './pages/Tenant/TenantProperty';
import TenantMaintenance from './pages/Tenant/TenantMaintenance';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="properties" element={<AdminProperties />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="maintenance" element={<AdminMaintenance />} />
          </Route>

          <Route
            path="/landlord"
            element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<LandlordDashboard />} />
            <Route path="properties" element={<LandlordProperties />} />
            <Route path="maintenance" element={<LandlordMaintenance />} />
          </Route>

          <Route
            path="/tenant"
            element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<TenantDashboard />} />
            <Route path="property" element={<TenantProperty />} />
            <Route path="maintenance" element={<TenantMaintenance />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
