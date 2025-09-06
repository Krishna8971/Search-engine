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
        {/* Logo */}
        <Link to="/" className="flex items-center" style={{ textDecoration: 'none' }}>
          <div className="flex items-center justify-center" style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'var(--primary-color)',
            borderRadius: 'var(--radius-md)',
            marginRight: 'var(--spacing-sm)'
          }}>
            <span className="text-white font-bold" style={{ fontSize: 'var(--font-size-lg)' }}>S</span>
          </div>
          <span className="text-primary font-bold" style={{ 
            fontSize: 'var(--font-size-xl)'
          }}>
            SecondMarket
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="header-desktop-nav">
          <div className="flex items-center" style={{ gap: 'var(--spacing-lg)' }}>
            <NavLink to="/" style={navLinkStyle} end>Home</NavLink>
            <NavLink to="/shop" style={navLinkStyle}>Shop</NavLink>
            <NavLink to="/cart" style={navLinkStyle}>Cart</NavLink>
            <NavLink to="/contact" style={navLinkStyle}>Contact</NavLink>
          </div>
        </nav>

        {/* Actions */}
        <div className="flex items-center" style={{ gap: 'var(--spacing-md)' }}>
          {isAuthenticated ? (
            <>
              <span className="text-secondary text-sm hidden sm:block" style={{ 
                maxWidth: 120, 
                whiteSpace: 'nowrap', 
                textOverflow: 'ellipsis', 
                overflow: 'hidden' 
              }}>
                {user?.name || 'User'}
              </span>
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary btn-sm header-desktop-action">Dashboard</button>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm header-desktop-action">Logout</button>
            </>
          ) : (
            <button onClick={() => navigate('/login')} className="btn btn-primary btn-sm header-desktop-action">Login</button>
          )}
          <button 
            aria-label="Menu" 
            onClick={toggleMobile} 
            className="mobile-menu-button btn btn-secondary"
            style={{ padding: '0.5rem' }}
          >
            <span style={{ width: 18, height: 2, background: 'var(--text-primary)', position: 'relative', display: 'block' }}>
              <span style={{ position: 'absolute', top: -6, left: 0, width: 18, height: 2, background: 'var(--text-primary)' }}></span>
              <span style={{ position: 'absolute', top: 6, left: 0, width: 18, height: 2, background: 'var(--text-primary)' }}></span>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="bg-white border-t border-gray-200 shadow-sm">
          <div className="container" style={{ padding: 'var(--spacing-md) 0' }}>
            <div className="flex flex-col" style={{ gap: 'var(--spacing-sm)' }}>
              <NavLink onClick={() => setMobileOpen(false)} to="/" style={navLinkStyle} end>Home</NavLink>
              <NavLink onClick={() => setMobileOpen(false)} to="/shop" style={navLinkStyle}>Shop</NavLink>
              <NavLink onClick={() => setMobileOpen(false)} to="/cart" style={navLinkStyle}>Cart</NavLink>
              <NavLink onClick={() => setMobileOpen(false)} to="/contact" style={navLinkStyle}>Contact</NavLink>
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
