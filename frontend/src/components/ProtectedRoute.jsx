import { useAuth } from './authContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = 'employee' }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || (requiredRole === 'admin' && user.role !== 'admin')) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;