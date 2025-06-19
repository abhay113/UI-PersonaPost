import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import AuthComponent from './components/AuthComponent';
import OnboardComponent from './components/OnboardComponent';
import ChatComponent from './components/ChatComponent';
import { AuthProvider, AuthContext } from './context/AuthContext';

const AppRoutes = () => {
  const { isAuthenticated, isOnboarded } = useContext(AuthContext);

  if (!isAuthenticated) return <Navigate to="/auth" />;
  if (!isOnboarded) return <Navigate to="/onboard" />;
  return <Navigate to="/chat" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppRoutes />} />
          <Route path="/auth" element={<AuthComponent />} />
          <Route path="/onboard" element={<OnboardComponent />} />
          <Route path="/chat" element={<ChatComponent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
