import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../App';

const PrivateRoute = ({ component: Component, roles }) => {
  const { authState } = useContext(AuthContext);

  if (authState.loading) {
    return <div>Loading...</div>;
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(authState.user.role)) {
    return <Navigate to="/profile" />;
  }

  return <Component />;
};

export default PrivateRoute;

