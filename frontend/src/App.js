import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import './styles/global.css';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'login', 'register', 'dashboard'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('home');
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (data) => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleRegisterSuccess = (data) => {
    setCurrentPage('login');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('home');
  };

  const handleLoginClick = () => {
    setCurrentPage('login');
  };

  const handleRegisterClick = () => {
    setCurrentPage('register');
  };

  const handleBackToLogin = () => {
    setCurrentPage('login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show different pages based on current state
  switch (currentPage) {
    case 'home':
      return <Home onLoginClick={handleLoginClick} />;
    
    case 'login':
      return (
        <Login 
          onToggleMode={handleRegisterClick}
          onLoginSuccess={handleLoginSuccess}
          onBackToHome={() => setCurrentPage('home')}
        />
      );
    
    case 'register':
      return (
        <Register 
          onToggleMode={handleBackToLogin}
          onRegisterSuccess={handleRegisterSuccess}
          onBackToHome={() => setCurrentPage('home')}
        />
      );
    
    case 'dashboard':
      return <Dashboard onLogout={handleLogout} />;
    
    default:
      return <Home onLoginClick={handleLoginClick} />;
  }
}

export default App;
