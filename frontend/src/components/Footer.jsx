import React from 'react';
import '../styles/global.css';

const Footer = () => {
  return (
    <footer className="bg-surface-dark text-secondary py-xl text-center">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} SecondMarket. Your trusted second-hand marketplace.</p>
      </div>
    </footer>
  );
};

export default Footer;
