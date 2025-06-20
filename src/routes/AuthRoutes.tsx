import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '../components/AuthComponent';
import ChatComponent from '../components/ChatComponent';
import OnboardComponent from '../components/OnboardComponent';
import ProtectedRoute from '../components/ProtectedRoute.tsx';

<Routes>
    {/* Public Route */}
    <Route path="/auth" element={<AuthPage />} />

    {/* Private Route - only if authenticated AND onboarded */}
    <Route
        path="/chat"
        element={
            <ProtectedRoute>
                <ChatComponent />
            </ProtectedRoute>
        }
    />

    {/* Onboarding Route - only if authenticated AND NOT onboarded */}
    <Route
        path="/onboard"
        element={
            <ProtectedRoute requireOnboarding={false}>
                <OnboardComponent />
            </ProtectedRoute>
        }
    />

    {/* Default: redirect unknown routes to /auth */}
    <Route path="*" element={<Navigate to="/auth" />} />
</Routes>
