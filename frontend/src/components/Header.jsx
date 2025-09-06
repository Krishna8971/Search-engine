import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/global.css';

const navLinkStyle = ({ isActive }) => ({
  color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
  padding: 'var(--spacing-sm) var(--spacing-md)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--font-size-sm)',
  fontWeight: 500,
  textDecoration: 'none',
  transition: 'background 0.2s ease, color 0.2s ease',
  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent'
});

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobile = () => setMobileOpen(o => !o);

  return (
    <header className="bg-white shadow-md sticky top-0 z-40" style={{
      borderBottom: '1px solid var(--border-color)',
      padding: 'var(--spacing-md) 0'
    }}>
      <div className="container flex justify-between items-center">
        
        {/* Logo + Company Name */}
        <NavLink to="/" style={{ textDecoration: "none" }} className="flex items-center gap-2">
          <img 
            src="/logo512.png" 
            alt="Ecofinds Logo" 
            style={{ width: "60px", height: "60px" }} 
          />
          <span
            className="text-primary font-bold"
            style={{ fontSize: 'var(--font-size-xl)' }}
          >
            EcoFinds
          </span>
        </NavLink>

        {/* Desktop Nav */}
        <nav className="header-desktop-nav">
          <div className="flex items-center" style={{ gap: 'var(--spacing-lg)' }}>
            <NavLink to="/" style={navLinkStyle} end>Home</NavLink>
            <NavLink to="/about" style={navLinkStyle}>About</NavLink>
            <NavLink to="/shop" style={navLinkStyle}>Shop</NavLink>
            <NavLink to="/contact" style={navLinkStyle}>Contact Us</NavLink>
          </div>
        </nav>

        {/* Actions (Login/Dashboard, Cart) */}
        <div className="flex items-center" style={{ gap: 'var(--spacing-md)' }}>
          {isAuthenticated ? (
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary btn-sm header-desktop-action">Dashboard</button>
          ) : (
            <button onClick={() => navigate('/login')} className="btn btn-primary btn-sm header-desktop-action">Login</button>
          )}

          {/* Cart */}
          <div onClick={() => navigate("/cart")} style={{ cursor: "pointer", fontSize: '1.5rem', lineHeight: 1 }}>
            🛒
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="bg-white border-t border-gray-200 shadow-sm">
          <div className="container" style={{ padding: 'var(--spacing-md) 0' }}>
            <div className="flex flex-col" style={{ gap: 'var(--spacing-sm)' }}>
              <NavLink onClick={() => setMobileOpen(false)} to="/" style={navLinkStyle} end>Home</NavLink>
              <NavLink onClick={() => setMobileOpen(false)} to="/about" style={navLinkStyle}>About</NavLink>
              <NavLink onClick={() => setMobileOpen(false)} to="/shop" style={navLinkStyle}>Shop</NavLink>
              <NavLink onClick={() => setMobileOpen(false)} to="/contact" style={navLinkStyle}>Contact Us</NavLink>
              {isAuthenticated ? (
                <>
                  <NavLink onClick={() => setMobileOpen(false)} to="/dashboard" style={navLinkStyle}>Dashboard</NavLink>
                  <button onClick={handleLogout} className="btn btn-secondary btn-full">Logout</button>
                </>
              ) : (
                <button onClick={() => { setMobileOpen(false); navigate('/login'); }} className="btn btn-primary btn-full">Login</button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

