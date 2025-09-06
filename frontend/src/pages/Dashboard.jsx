import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/global.css';

const Dashboard = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    if (onLogout) {
      onLogout();
    }
  }, [onLogout]);

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch('http://localhost:8000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      setError(error.message);
      handleLogout();
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <p className="text-error mb-md">{error}</p>
          <button className="btn btn-primary" onClick={handleLogout}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-color)' }}>
      <Header onLogout={handleLogout} isAuthenticated={true} user={user} />

      {/* Main Content */}
      <main className="container" style={{ padding: 'var(--spacing-2xl) var(--spacing-md)' }}>
        <div style={{
          backgroundColor: 'var(--surface-color)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-2xl)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: 'var(--spacing-xl)'
        }}>
          <h2 className="mb-lg">Dashboard</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--spacing-lg)',
            marginBottom: 'var(--spacing-xl)'
          }}>
            <div style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--primary-light)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center'
            }}>
              <h3 style={{ color: 'var(--primary-color)', margin: '0 0 var(--spacing-sm) 0' }}>
                Profile
              </h3>
              <p style={{ margin: 0 }}>
                <strong>Name:</strong> {user?.name}<br />
                <strong>Email:</strong> {user?.email}
              </p>
            </div>
            
            <div style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--primary-light)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center'
            }}>
              <h3 style={{ color: 'var(--primary-color)', margin: '0 0 var(--spacing-sm) 0' }}>
                My Listings
              </h3>
              <p style={{ margin: 0 }}>Manage your items for sale</p>
              <button className="btn btn-primary mt-sm" style={{ marginTop: 'var(--spacing-sm)' }}>
                View Listings
              </button>
            </div>

            <div style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--primary-light)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center'
            }}>
              <h3 style={{ color: 'var(--primary-color)', margin: '0 0 var(--spacing-sm) 0' }}>
                My Orders
              </h3>
              <p style={{ margin: 0 }}>Track your purchases</p>
              <button className="btn btn-primary mt-sm" style={{ marginTop: 'var(--spacing-sm)' }}>
                View Orders
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: 'var(--surface-color)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-2xl)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: 'var(--spacing-xl)'
        }}>
          <h2 className="mb-lg">Quick Actions</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--spacing-lg)'
          }}>
            <button className="btn btn-primary btn-full" style={{ padding: 'var(--spacing-lg)' }}>
              🛍️ Browse Items
            </button>
            <button className="btn btn-accent btn-full" style={{ padding: 'var(--spacing-lg)' }}>
              📝 Sell an Item
            </button>
            <button className="btn btn-secondary btn-full" style={{ padding: 'var(--spacing-lg)' }}>
              💬 Messages
            </button>
            <button className="btn btn-secondary btn-full" style={{ padding: 'var(--spacing-lg)' }}>
              ⭐ My Reviews
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div style={{
          backgroundColor: 'var(--surface-color)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-2xl)',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center'
        }}>
          <h2 className="mb-lg">Find What You Need</h2>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                placeholder="Search for electronics, furniture, clothes..."
                style={{ fontSize: 'var(--font-size-lg)' }}
              />
            </div>
            <button className="btn btn-primary btn-full">
              Search Marketplace
            </button>
          </div>
          <p className="text-muted mt-lg">
            Discover amazing deals on quality second-hand items from verified sellers.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
