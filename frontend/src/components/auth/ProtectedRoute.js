// src/components/auth/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { currentUser, isAuthenticated, isAdmin } = useContext(AuthContext);
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (adminOnly && !isAdmin) {
        // Redirect to home if not admin but admin-only route
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;