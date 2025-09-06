import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Contact from './pages/Contact';
import './styles/global.css';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'login', 'register', 'dashboard', 'shop', 'cart', 'contact'
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);
      setCurrentPage('home');
    } else {
      setCurrentPage('home');
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (data) => {
    setIsAuthenticated(true);
    setCurrentPage('home');
    // You might want to fetch user data here
  };

  const handleRegisterSuccess = (data) => {
    setCurrentPage('login');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
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

  const handleNavigation = (page) => {
    setCurrentPage(page);
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
      return (
        <Home 
          onLoginClick={handleLoginClick} 
          isAuthenticated={isAuthenticated} 
          user={user}
          onNavigation={handleNavigation}
        />
      );
    
    case 'login':
      return (
        <Login 
          onToggleMode={handleRegisterClick}
          onLoginSuccess={handleLoginSuccess}
          onBackToHome={() => setCurrentPage('home')}
          isAuthenticated={isAuthenticated}
          user={user}
          onNavigation={handleNavigation}
        />
      );
    
    case 'register':
      return (
        <Register 
          onToggleMode={handleBackToLogin}
          onRegisterSuccess={handleRegisterSuccess}
          onBackToHome={() => setCurrentPage('home')}
          isAuthenticated={isAuthenticated}
          user={user}
          onNavigation={handleNavigation}
        />
      );
    
    case 'dashboard':
      return <Dashboard onLogout={handleLogout} />;
    
    case 'shop':
      return (
        <Shop 
          isAuthenticated={isAuthenticated}
          user={user}
          onLoginClick={handleLoginClick}
          onLogout={handleLogout}
          onNavigation={handleNavigation}
        />
      );
    
    case 'cart':
      return (
        <Cart 
          isAuthenticated={isAuthenticated}
          user={user}
          onLoginClick={handleLoginClick}
          onLogout={handleLogout}
          onNavigation={handleNavigation}
        />
      );
    
    case 'contact':
      return (
        <Contact 
          isAuthenticated={isAuthenticated}
          user={user}
          onLoginClick={handleLoginClick}
          onLogout={handleLogout}
          onNavigation={handleNavigation}
        />
      );
    
    default:
      return (
        <Home 
          onLoginClick={handleLoginClick} 
          isAuthenticated={isAuthenticated} 
          user={user}
          onNavigation={handleNavigation}
        />
      );
  }
}

export default App;
