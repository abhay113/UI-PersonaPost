// App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import AuthComponent from './components/AuthComponent';
import OnboardComponent from './components/OnboardComponent';
import ChatComponent from './components/ChatComponent';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to update authentication state
  const updateAuthState = () => {
    const auth = localStorage.getItem('isAuthenticated') === 'true';
    const onboard = localStorage.getItem('isOnboarded') === 'true';
    setIsAuthenticated(auth);
    setIsOnboarded(onboard);
  };

  useEffect(() => {
    updateAuthState();
    setLoading(false);

    // Listen for storage changes (optional - for multi-tab sync)
    const handleStorageChange = () => {
      updateAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/auth"
          element={<AuthComponent onAuthSuccess={updateAuthState} />}
        />

        <Route
          path="/onboard"
          element={
            isAuthenticated ? (
              isOnboarded ? <Navigate to="/chat" replace /> : <OnboardComponent onOnboardSuccess={updateAuthState} />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/chat"
          element={
            isAuthenticated && isOnboarded ? (
              <ChatComponent />
            ) : (
              <Navigate to={isAuthenticated ? "/onboard" : "/auth"} replace />
            )
          }
        />

        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
};

export default App;