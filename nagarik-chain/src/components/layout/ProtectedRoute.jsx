import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

/**
 * Route guard that checks authentication and role before rendering children.
 * Redirects to the appropriate login page if not authorized.
 */
function ProtectedRoute({ role, children }) {
  const { isAuthenticated, role: userRole } = useAuth();

  if (!isAuthenticated || userRole !== role) {
    const loginPath = role === 'citizen' ? '/citizen/login' : '/admin/login';
    return <Navigate to={loginPath} replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  role: PropTypes.oneOf(['citizen', 'admin']).isRequired,
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
