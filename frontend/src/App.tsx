import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingSplash from './components/LoadingSplash';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationSystem from './components/NotificationSystem';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Batches from './pages/Batches';
import Messages from './pages/Messages';
import Analytics from './pages/Analytics';
import LoginPage from './pages/Login';
import { getToken, clearToken } from './api';
import { ThemeProvider } from './components/ThemeProvider';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for existing valid token on mount
    const token = getToken();
    setIsLoggedIn(!!token);
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    clearToken();
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return <LoadingSplash isVisible={true} />;
  }

  if (!isLoggedIn) {
    return (
      <ThemeProvider>
        <LoginPage onLogin={handleLogin} />
        <NotificationSystem position="top-right" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <Layout onLogout={handleLogout}>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/batches" element={<Batches />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/login" element={<Navigate to="/" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </ErrorBoundary>
        </Layout>
      </Router>
      <NotificationSystem position="top-right" />
    </ThemeProvider>
  );
};

export default App;
