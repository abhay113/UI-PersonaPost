import React, { type JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: JSX.Element;
    requireOnboarding?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireOnboarding = true }) => {
    const { isAuthenticated, isOnboarded } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/auth" />;
    }

    if (requireOnboarding && !isOnboarded) {
        return <Navigate to="/onboard" />;
    }

    return children;
};

export default ProtectedRoute;
