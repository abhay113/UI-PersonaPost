import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: JSX.Element;
    requireOnboarding?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireOnboarding = true }) => {
    const { isAuthenticated, isOnboarded, loading } = useAuth();

    if (loading) return null; // or show a loading spinner if desired

    if (!isAuthenticated) {
        return <Navigate to="/auth" />;
    }

    if (requireOnboarding && !isOnboarded) {
        return <Navigate to="/onboard" />;
    }

    if (!requireOnboarding && isOnboarded) {
        return <Navigate to="/chat" />;
    }

    return children;
};

export default ProtectedRoute;
