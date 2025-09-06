import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/global.css';
import '../styles/auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getPasswordStrengthScore = (password) => {
    if (!password) return { score: 0, percent: 0, label: 'Too short' };
    const hasMinLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    const hasNoSpaces = !/\s/.test(password);
    let score = [hasMinLength, hasUpper, hasLower, hasSymbol, hasNoSpaces].filter(Boolean).length;
    if (password.length >= 12) score += 1;
    if (score > 5) score = 5;
    const percentMap = [0, 20, 40, 60, 80, 100];
    const labelMap = ['Too short', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
    return { score, percent: percentMap[score], label: labelMap[score] };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePasswordStrength = (password) => {
    const hasMinLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    const hasNoSpaces = !/\s/.test(password);
    return hasMinLength && hasUpper && hasLower && hasSymbol && hasNoSpaces;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePasswordStrength(formData.password)) {
      newErrors.password = 'Use 8+ chars, 1 upper, 1 lower, 1 symbol, no spaces';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      setMessage('Registration successful! You can now sign in.');
      
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      setMessage(error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-color)' }}>
  <Header />
      <div className="auth-container theme-login">
        <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <h1 className="auth-title">Create your EcoFinds Account</h1>
          <p className="auth-subtitle">Create your account to start buying and selling second-hand items</p>
        </div>

        {message && (
          <div className={message.includes('successful') ? 'success-message' : 'error-message'}>
            {message}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            {(() => { const s = getPasswordStrengthScore(formData.password); return (
              <div className="strength-meter" aria-live="polite">
                <div className={`strength-bar strength-${s.score}`}>
                  <div className="strength-bar-fill" style={{ width: `${s.percent}%` }}></div>
                </div>
                <div className="strength-label">{s.label}</div>
              </div>
            ); })()}
            <div className="password-helper">
              Use 8+ characters with a mix of uppercase, lowercase, and a symbol. No spaces.
            </div>
            {errors.password && <div className="error-chip" role="alert">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.confirmPassword && <div className="error-chip" role="alert">{errors.confirmPassword}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account?</p>
          <button
            type="button"
            className="auth-link auth-link-inline"
            onClick={() => navigate('/login')}
            disabled={loading}
          >
            Sign in here
          </button>
          
          <div style={{ marginTop: 'var(--spacing-md)', textAlign: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
