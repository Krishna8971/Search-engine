import React from 'react';
import '../styles/global.css';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--surface-dark)',
      color: 'var(--text-secondary)',
      padding: 'var(--spacing-xl) 0',
      textAlign: 'center'
    }}>
      <div className="container">
        <p>&copy; {new Date().getFullYear()} SecondMarket. Your trusted second-hand marketplace.</p>
      </div>
    </footer>
  );
};

export default Footer;
