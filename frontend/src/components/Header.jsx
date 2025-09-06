import React from 'react';
import '../styles/global.css';

const Header = ({ onLoginClick, onLogout, isAuthenticated, user, onNavigation }) => {
  return (
    <header style={{
      backgroundColor: 'var(--surface-color)',
      borderBottom: '1px solid var(--border-color)',
      padding: 'var(--spacing-md) 0',
      boxShadow: 'var(--shadow-md)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <div 
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => onNavigation && onNavigation('home')}
        >
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'var(--primary-color)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 'var(--spacing-sm)'
          }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: 'var(--font-size-lg)' }}>S</span>
          </div>
          <span style={{ 
            fontSize: 'var(--font-size-xl)', 
            fontWeight: 'bold', 
            color: 'var(--primary-color)' 
          }}>
            SecondMarket
          </span>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
          <button
            onClick={() => onNavigation && onNavigation('home')}
            style={{
              color: 'var(--text-secondary)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: '500',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            Home
          </button>
          <button
            onClick={() => onNavigation && onNavigation('shop')}
            style={{
              color: 'var(--text-secondary)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: '500',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            Shop
          </button>
          <button
            onClick={() => onNavigation && onNavigation('cart')}
            style={{
              color: 'var(--text-secondary)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: '500',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            Cart
          </button>
          <button
            onClick={() => onNavigation && onNavigation('contact')}
            style={{
              color: 'var(--text-secondary)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: '500',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--primary-color)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            Contact
          </button>
        </nav>

        {/* User Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          {isAuthenticated ? (
            <>
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                Welcome, {user?.name}
              </span>
              <button
                onClick={() => onNavigation && onNavigation('dashboard')}
                className="btn btn-primary"
                style={{ fontSize: 'var(--font-size-sm)' }}
              >
                Profile
              </button>
              <button
                onClick={onLogout}
                className="btn btn-secondary"
                style={{ fontSize: 'var(--font-size-sm)' }}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={onLoginClick}
              className="btn btn-primary"
              style={{ fontSize: 'var(--font-size-sm)' }}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
