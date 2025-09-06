import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/global.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-16" style={{ backgroundColor: '#f3eac0' }}>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/logo512.png" 
                alt="EcoFinds Logo" 
                style={{ width: "40px", height: "40px" }} 
              />
              <span className="text-2xl font-bold" style={{ color: '#2f486d' }}>
                EcoFinds
              </span>
            </div>
            <p className="text-lg leading-relaxed mb-4" style={{ color: '#223148', opacity: 0.9 }}>
              Making sustainable living accessible to everyone. Your trusted marketplace for quality eco-friendly products.
            </p>
            <p className="text-sm" style={{ color: '#223148', opacity: 0.7 }}>
              &copy; {currentYear} EcoFinds. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-start-2">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#2f486d' }}>
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-sm transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#223148', opacity: 0.8 }}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-sm transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#223148', opacity: 0.8 }}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/shop" 
                  className="text-sm transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#223148', opacity: 0.8 }}
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link 
                  to="/cart" 
                  className="text-sm transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#223148', opacity: 0.8 }}
                >
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Account - FAR RIGHT */}
          <div className="md:col-start-3">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#2f486d' }}>
              Account
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/login" 
                  className="text-sm transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#223148', opacity: 0.8 }}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className="text-sm transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#223148', opacity: 0.8 }}
                >
                  Register
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard" 
                  className="text-sm transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#223148', opacity: 0.8 }}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/checkout" 
                  className="text-sm transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#223148', opacity: 0.8 }}
                >
                  Checkout
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="border-t pt-8" style={{ borderColor: '#2f486d' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm" style={{ color: '#223148', opacity: 0.6 }}>
              Committed to sustainability and environmental responsibility
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm" style={{ color: '#223148', opacity: 0.6 }}>
                🌱 Eco-Friendly
              </span>
              <span className="text-sm" style={{ color: '#223148', opacity: 0.6 }}>
                🤝 Community Driven
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
