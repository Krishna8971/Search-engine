import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/global.css';

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: ''
  });

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

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      // Fetch stats
      const statsResponse = await fetch('http://localhost:8000/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch listings
      const listingsResponse = await fetch('http://localhost:8000/api/listings/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (listingsResponse.ok) {
        const listingsData = await listingsResponse.json();
        setListings(listingsData.listings || []);
      }

      // Fetch messages
      const messagesResponse = await fetch('http://localhost:8000/api/messages/inbox', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setMessages(messagesData.messages || []);
      }

      // Fetch orders
      const ordersResponse = await fetch('http://localhost:8000/api/orders/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData.orders || []);
      }

      // Fetch reviews
      const reviewsResponse = await fetch('http://localhost:8000/api/reviews/received', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }, []);

  const createListing = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/listings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newListing,
          price: parseFloat(newListing.price)
        }),
      });

      if (response.ok) {
        setNewListing({
          title: '',
          description: '',
          price: '',
          category: '',
          condition: '',
          location: ''
        });
        setShowCreateListing(false);
        fetchDashboardData(); // Refresh data
        alert('Listing created successfully!');
      } else {
        const errorData = await response.json();
        alert('Error creating listing: ' + (errorData.detail || 'Unknown error'));
      }
    } catch (error) {
      alert('Error creating listing: ' + error.message);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

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
  <Header />

      {/* Main Content */}
      <main className="container" style={{ padding: 'var(--spacing-2xl) var(--spacing-md)' }}>
        {/* Dashboard Header */}
        <div style={{
          backgroundColor: 'var(--surface-color)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-2xl)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: 'var(--spacing-xl)'
        }}>
          <h2 className="mb-lg">Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
            Welcome back, {user?.name}! Manage your listings, orders, and messages.
          </p>
          
          {/* Stats Cards */}
          {stats && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                  {stats.listings_count}
                </h3>
                <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>Active Listings</p>
              </div>
              
              <div style={{
                padding: 'var(--spacing-lg)',
                backgroundColor: 'var(--primary-light)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center'
              }}>
                <h3 style={{ color: 'var(--primary-color)', margin: '0 0 var(--spacing-sm) 0' }}>
                  {stats.unread_messages}
                </h3>
                <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>Unread Messages</p>
              </div>

              <div style={{
                padding: 'var(--spacing-lg)',
                backgroundColor: 'var(--primary-light)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center'
              }}>
                <h3 style={{ color: 'var(--primary-color)', margin: '0 0 var(--spacing-sm) 0' }}>
                  {stats.orders_count}
                </h3>
                <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>Orders</p>
              </div>

              <div style={{
                padding: 'var(--spacing-lg)',
                backgroundColor: 'var(--primary-light)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center'
              }}>
                <h3 style={{ color: 'var(--primary-color)', margin: '0 0 var(--spacing-sm) 0' }}>
                  {stats.average_rating || 'N/A'}
                </h3>
                <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>Avg Rating</p>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-sm)',
            marginBottom: 'var(--spacing-lg)',
            borderBottom: '1px solid var(--border-color)'
          }}>
            {['overview', 'listings', 'messages', 'orders', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  border: 'none',
                  background: 'none',
                  borderBottom: activeTab === tab ? '2px solid var(--primary-color)' : '2px solid transparent',
                  color: activeTab === tab ? 'var(--primary-color)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div style={{
            backgroundColor: 'var(--surface-color)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-2xl)',
            boxShadow: 'var(--shadow-md)',
            marginBottom: 'var(--spacing-xl)'
          }}>
            <h3 className="mb-lg">Quick Actions</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--spacing-lg)'
            }}>
              <button 
                className="btn btn-primary btn-full" 
                style={{ padding: 'var(--spacing-lg)' }}
                onClick={() => navigate('/shop')}
              >
                🛍️ Browse Items
              </button>
              <button 
                className="btn btn-accent btn-full" 
                style={{ padding: 'var(--spacing-lg)' }}
                onClick={() => setShowCreateListing(true)}
              >
                📝 Create Listing
              </button>
              <button 
                className="btn btn-secondary btn-full" 
                style={{ padding: 'var(--spacing-lg)' }}
                onClick={() => setActiveTab('messages')}
              >
                💬 Messages ({stats?.unread_messages || 0})
              </button>
              <button 
                className="btn btn-secondary btn-full" 
                style={{ padding: 'var(--spacing-lg)' }}
                onClick={() => setActiveTab('orders')}
              >
                📦 Orders ({stats?.orders_count || 0})
              </button>
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div style={{
            backgroundColor: 'var(--surface-color)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-2xl)',
            boxShadow: 'var(--shadow-md)',
            marginBottom: 'var(--spacing-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <h3>My Listings</h3>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateListing(true)}
              >
                + Create New Listing
              </button>
            </div>
            
            {listings.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                No listings yet. Create your first listing to get started!
              </p>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                {listings.map(listing => (
                  <div key={listing.id} style={{
                    padding: 'var(--spacing-lg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--surface-light)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 var(--spacing-sm) 0' }}>{listing.title}</h4>
                        <p style={{ color: 'var(--text-secondary)', margin: '0 0 var(--spacing-sm) 0' }}>
                          {listing.description}
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}>
                          <span><strong>Price:</strong> ${listing.price}</span>
                          <span><strong>Category:</strong> {listing.category}</span>
                          <span><strong>Condition:</strong> {listing.condition}</span>
                          <span><strong>Location:</strong> {listing.location}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        <button className="btn btn-secondary btn-sm">Edit</button>
                        <button className="btn btn-danger btn-sm">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div style={{
            backgroundColor: 'var(--surface-color)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-2xl)',
            boxShadow: 'var(--shadow-md)',
            marginBottom: 'var(--spacing-xl)'
          }}>
            <h3 className="mb-lg">Messages</h3>
            {messages.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                No messages yet.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                {messages.map(message => (
                  <div key={message.id} style={{
                    padding: 'var(--spacing-lg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: message.is_read ? 'var(--surface-light)' : 'var(--primary-light)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 var(--spacing-sm) 0' }}>{message.subject}</h4>
                        <p style={{ color: 'var(--text-secondary)', margin: '0 0 var(--spacing-sm) 0' }}>
                          From: {message.sender_name}
                        </p>
                        <p style={{ margin: '0 0 var(--spacing-sm) 0' }}>{message.content}</p>
                        {message.listing_title && (
                          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                            Re: {message.listing_title}
                          </p>
                        )}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                        {new Date(message.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div style={{
            backgroundColor: 'var(--surface-color)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-2xl)',
            boxShadow: 'var(--shadow-md)',
            marginBottom: 'var(--spacing-xl)'
          }}>
            <h3 className="mb-lg">My Orders</h3>
            {orders.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                No orders yet.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                {orders.map(order => (
                  <div key={order.id} style={{
                    padding: 'var(--spacing-lg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--surface-light)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 var(--spacing-sm) 0' }}>{order.listing_title}</h4>
                        <p style={{ color: 'var(--text-secondary)', margin: '0 0 var(--spacing-sm) 0' }}>
                          Seller: {order.seller_name}
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}>
                          <span><strong>Quantity:</strong> {order.quantity}</span>
                          <span><strong>Total:</strong> ${order.total_price}</span>
                          <span><strong>Status:</strong> {order.status}</span>
                        </div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 'var(--spacing-sm) 0 0 0' }}>
                          {order.shipping_address}
                        </p>
                      </div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div style={{
            backgroundColor: 'var(--surface-color)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-2xl)',
            boxShadow: 'var(--shadow-md)',
            marginBottom: 'var(--spacing-xl)'
          }}>
            <h3 className="mb-lg">Reviews Received</h3>
            {reviews.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                No reviews yet.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                {reviews.map(review => (
                  <div key={review.id} style={{
                    padding: 'var(--spacing-lg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--surface-light)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                          <h4 style={{ margin: 0 }}>{review.listing_title}</h4>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[...Array(5)].map((_, i) => (
                              <span key={i} style={{ color: i < review.rating ? '#fbbf24' : '#d1d5db' }}>★</span>
                            ))}
                          </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', margin: '0 0 var(--spacing-sm) 0' }}>
                          By: {review.reviewer_name}
                        </p>
                        <p style={{ margin: 0 }}>{review.comment}</p>
                      </div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Listing Modal */}
        {showCreateListing && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'var(--surface-color)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-2xl)',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h3 className="mb-lg">Create New Listing</h3>
              <form onSubmit={createListing}>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newListing.title}
                    onChange={(e) => setNewListing({...newListing, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={newListing.description}
                    onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                    required
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div className="form-group">
                    <label className="form-label">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={newListing.price}
                      onChange={(e) => setNewListing({...newListing, price: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-input"
                      value={newListing.category}
                      onChange={(e) => setNewListing({...newListing, category: e.target.value})}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Vehicles">Vehicles</option>
                      <option value="Sports">Sports</option>
                      <option value="Books">Books</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div className="form-group">
                    <label className="form-label">Condition</label>
                    <select
                      className="form-input"
                      value={newListing.condition}
                      onChange={(e) => setNewListing({...newListing, condition: e.target.value})}
                      required
                    >
                      <option value="">Select Condition</option>
                      <option value="New">New</option>
                      <option value="Like New">Like New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newListing.location}
                      onChange={(e) => setNewListing({...newListing, location: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                  <button type="submit" className="btn btn-primary">Create Listing</button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowCreateListing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
