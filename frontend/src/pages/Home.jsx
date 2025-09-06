import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/global.css';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      
      alert(`Searching for: ${searchQuery}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="text-white" style={{
        background: '#223148',
        padding: '4rem 0'
      }}>
        <div className="container text-center">
          <h1 className="font-bold mb-lg" style={{ 
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            color: '#FFFFFF'
          }}>
            Buy & Sell Second-Hand Items
          </h1>
          <p className="text-lg mb-xl" style={{ 
            opacity: 0.9,
            color: '#f3eae0'
          }}>
            Your trusted marketplace for quality pre-loved items at great prices
          </p>
          
          {/* Search Box */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                className="form-input flex-1 text-lg p-4"
                placeholder="Search for electronics, furniture, clothes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="btn btn-lg px-8"
                style={{
                  backgroundColor: '#2f486d',
                  color: '#f3eae0',
                  border: 'none'
                }}
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-xl">
            <h2 className="font-bold mb-md" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
              Popular Categories
            </h2>
            <p className="text-lg text-secondary">
              Discover amazing deals in these top categories
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Category 1 */}
            <div 
              className="text-center rounded-lg shadow-md p-8 cursor-pointer hover:transform hover:-translate-y-1 transition-transform"
              style={{ backgroundColor: '#f3eae0' }}
              onClick={() => navigate('/shop?category=Electronics')}
            >
              <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-md text-primary text-4xl">
                📱
              </div>
              <h3 className="text-lg font-bold mb-sm">
                Electronics
              </h3>
              <p className="text-secondary">
                Phones, laptops, cameras and more tech items in great condition.
              </p>
            </div>

            {/* Category 2 */}
            <div 
              className="text-center rounded-lg shadow-md p-8 cursor-pointer hover:transform hover:-translate-y-1 transition-transform"
              style={{ backgroundColor: '#f3eae0' }}
              onClick={() => navigate('/shop?category=Furniture')}
            >
              <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-md text-primary text-4xl">
                🪑
              </div>
              <h3 className="text-lg font-bold mb-sm">
                Furniture
              </h3>
              <p className="text-secondary">
                Quality furniture for your home, office, and outdoor spaces.
              </p>
            </div>

            {/* Category 3 */}
            <div 
              className="text-center rounded-lg shadow-md p-8 cursor-pointer hover:transform hover:-translate-y-1 transition-transform"
              style={{ backgroundColor: '#f3eae0' }}
              onClick={() => navigate('/shop?category=Fashion')}
            >
              <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-md text-primary text-4xl">
                👕
              </div>
              <h3 className="text-lg font-bold mb-sm">
                Fashion
              </h3>
              <p className="text-secondary">
                Trendy clothes, shoes, and accessories for all styles.
              </p>
            </div>

            {/* Category 4 */}
            <div 
              className="text-center rounded-lg shadow-md p-8 cursor-pointer hover:transform hover:-translate-y-1 transition-transform"
              style={{ backgroundColor: '#f3eae0' }}
              onClick={() => navigate('/shop?category=Vehicles')}
            >
              <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-md text-primary text-4xl">
                🚗
              </div>
              <h3 className="text-lg font-bold mb-sm">
                Vehicles
              </h3>
              <p className="text-secondary">
                Cars, bikes, and other vehicles from trusted sellers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-surface-light">
        <div className="container">
          <div className="text-center mb-xl">
            <h2 className="font-bold mb-md" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
              Why Choose SecondMarket?
            </h2>
            <p className="text-lg text-secondary">
              The best platform for buying and selling second-hand items
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div style={{
              textAlign: 'center',
              padding: 'var(--spacing-xl)',
              backgroundColor: '#2f486d',
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
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', marginBottom: 'var(--spacing-sm)', color: '#FFFFFF' }}>
                Verified Sellers
              </h3>
              <p style={{ color: '#f3eae0' }}>
                All our sellers are verified to ensure safe and trustworthy transactions.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{
              textAlign: 'center',
              padding: 'var(--spacing-xl)',
              backgroundColor: '#2f486d',
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
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', marginBottom: 'var(--spacing-sm)', color: '#FFFFFF' }}>
                Great Prices
              </h3>
              <p style={{ color: '#f3eae0' }}>
                Find amazing deals and save money on quality second-hand items.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{
              textAlign: 'center',
              padding: 'var(--spacing-xl)',
              backgroundColor: '#2f486d',
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
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', marginBottom: 'var(--spacing-sm)', color: '#FFFFFF' }}>
                Eco-Friendly
              </h3>
              <p style={{ color: '#f3eae0' }}>
                Help reduce waste by giving items a second life through reuse.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t py-16" style={{ backgroundColor: '#223148' }}>
        <div className="container text-center">
          <h2 className="font-bold mb-md" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#FFFFFF' }}>
            Ready to Start Trading?
          </h2>
          <p className="text-lg mb-xl" style={{ color: '#f3eae0' }}>
            Join thousands of users buying and selling on SecondMarket
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              className="btn btn-lg"
              style={{ backgroundColor: '#2f486d', color: '#FFFFFF', border: 'none' }}
              onClick={() => navigate('/shop')}
            >
              Start Buying
            </button>
            <button 
              className="btn btn-lg"
              style={{ backgroundColor: '#f3eae0', color: '#223148', border: 'none' }}
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            >
              Start Selling
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
