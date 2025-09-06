import React, { useState } from 'react';
import '../styles/global.css';

const Home = ({ onLoginClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // This would be where you implement actual search functionality
      alert(`Searching for: ${searchQuery}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-color)' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'var(--surface-color)',
        borderBottom: '1px solid var(--border-color)',
        padding: 'var(--spacing-md) 0'
      }}>
        <div className="container flex justify-between items-center">
          <h1 style={{ margin: 0, color: 'var(--primary-color)', fontSize: 'var(--font-size-xl)' }}>
            SecondMarket
          </h1>
          <div className="flex items-center" style={{ gap: 'var(--spacing-md)' }}>
            <button 
              className="btn btn-secondary"
              onClick={onLoginClick}
            >
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))',
        color: 'white',
        padding: '4rem 0'
      }}>
        <div className="container text-center">
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            marginBottom: 'var(--spacing-lg)',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Buy & Sell Second-Hand Items
          </h1>
          <p style={{ 
            fontSize: 'var(--font-size-lg)', 
            marginBottom: 'var(--spacing-2xl)',
            opacity: 0.9
          }}>
            Your trusted marketplace for quality pre-loved items at great prices
          </p>
          
          {/* Search Box */}
          <form onSubmit={handleSearch} style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="flex" style={{ gap: 'var(--spacing-sm)' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search for electronics, furniture, clothes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  flex: 1,
                  fontSize: 'var(--font-size-lg)',
                  padding: 'var(--spacing-md)'
                }}
              />
              <button 
                type="submit"
                className="btn btn-accent"
                style={{ fontSize: 'var(--font-size-lg)', padding: '0 var(--spacing-xl)' }}
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Featured Categories */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: 'var(--spacing-2xl)' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: 'var(--spacing-md)' }}>
              Popular Categories
            </h2>
            <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-secondary)' }}>
              Discover amazing deals in these top categories
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--spacing-xl)'
          }}>
            {/* Category 1 */}
            <div style={{
              textAlign: 'center',
              padding: 'var(--spacing-xl)',
              backgroundColor: 'var(--surface-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: 'var(--primary-light)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--spacing-md)',
                color: 'var(--primary-color)',
                fontSize: '2.5rem'
              }}>
                📱
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', marginBottom: 'var(--spacing-sm)' }}>
                Electronics
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Phones, laptops, cameras and more tech items in great condition.
              </p>
            </div>

            {/* Category 2 */}
            <div style={{
              textAlign: 'center',
              padding: 'var(--spacing-xl)',
              backgroundColor: 'var(--surface-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: 'var(--primary-light)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--spacing-md)',
                color: 'var(--primary-color)',
                fontSize: '2.5rem'
              }}>
                🪑
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', marginBottom: 'var(--spacing-sm)' }}>
                Furniture
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Quality furniture for your home, office, and outdoor spaces.
              </p>
            </div>

            {/* Category 3 */}
            <div style={{
              textAlign: 'center',
              padding: 'var(--spacing-xl)',
              backgroundColor: 'var(--surface-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: 'var(--primary-light)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--spacing-md)',
                color: 'var(--primary-color)',
                fontSize: '2.5rem'
              }}>
                👕
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', marginBottom: 'var(--spacing-sm)' }}>
                Fashion
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Trendy clothes, shoes, and accessories for all styles.
              </p>
            </div>

            {/* Category 4 */}
            <div style={{
              textAlign: 'center',
              padding: 'var(--spacing-xl)',
              backgroundColor: 'var(--surface-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: 'var(--primary-light)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--spacing-md)',
                color: 'var(--primary-color)',
                fontSize: '2.5rem'
              }}>
                🚗
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', marginBottom: 'var(--spacing-sm)' }}>
                Vehicles
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Cars, bikes, and other vehicles from trusted sellers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--surface-light)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: 'var(--spacing-2xl)' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: 'var(--spacing-md)' }}>
              Why Choose SecondMarket?
            </h2>
            <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-secondary)' }}>
              The best platform for buying and selling second-hand items
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--spacing-xl)'
          }}>
            {/* Feature 1 */}
            <div style={{
              textAlign: 'center',
              padding: 'var(--spacing-xl)',
              backgroundColor: 'var(--surface-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: 'var(--primary-light)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--spacing-md)',
                color: 'var(--primary-color)',
                fontSize: '2rem'
              }}>
                ✓
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', marginBottom: 'var(--spacing-sm)' }}>
                Verified Sellers
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                All our sellers are verified to ensure safe and trustworthy transactions.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{
              textAlign: 'center',
              padding: 'var(--spacing-xl)',
              backgroundColor: 'var(--surface-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: 'var(--primary-light)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--spacing-md)',
                color: 'var(--primary-color)',
                fontSize: '2rem'
              }}>
                �
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', marginBottom: 'var(--spacing-sm)' }}>
                Great Prices
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Find amazing deals and save money on quality second-hand items.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{
              textAlign: 'center',
              padding: 'var(--spacing-xl)',
              backgroundColor: 'var(--surface-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: 'var(--primary-light)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--spacing-md)',
                color: 'var(--primary-color)',
                fontSize: '2rem'
              }}>
                🌱
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', marginBottom: 'var(--spacing-sm)' }}>
                Eco-Friendly
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Help reduce waste by giving items a second life through reuse.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        backgroundColor: 'var(--surface-color)',
        borderTop: '1px solid var(--border-color)',
        padding: '4rem 0'
      }}>
        <div className="container text-center">
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: 'var(--spacing-md)' }}>
            Ready to Start Trading?
          </h2>
          <p style={{ 
            fontSize: 'var(--font-size-lg)', 
            color: 'var(--text-secondary)', 
            marginBottom: 'var(--spacing-xl)' 
          }}>
            Join thousands of users buying and selling on SecondMarket
          </p>
          <div className="flex justify-center" style={{ gap: 'var(--spacing-md)' }}>
            <button 
              className="btn btn-primary btn-lg"
              onClick={onLoginClick}
            >
              Start Buying
            </button>
            <button 
              className="btn btn-accent btn-lg"
              onClick={onLoginClick}
            >
              Start Selling
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'var(--surface-dark)',
        color: 'var(--text-secondary)',
        padding: 'var(--spacing-xl) 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <p>&copy; 2025 SecondMarket. Your trusted second-hand marketplace.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
