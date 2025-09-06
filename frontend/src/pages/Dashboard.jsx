import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/global.css';
import '../styles/Dashboard.css';

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
  const [showEditListing, setShowEditListing] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    images: []
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDeleteProfile, setShowDeleteProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    name: '',
    email: ''
  });

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    if (onLogout) {
      onLogout();
    }
  }, [onLogout]);

  
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    
    const newImageFiles = [...imageFiles, ...files];
    setImageFiles(newImageFiles);
    
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImageFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
   
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImageFiles(newImageFiles);
    setImagePreviews(newPreviews);
  };

  const convertImagesToBase64 = (files) => {
    return Promise.all(files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }));
  };

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
      
      
      const base64Images = imageFiles.length > 0 ? await convertImagesToBase64(imageFiles) : [];
      
      const response = await fetch('http://localhost:8000/api/listings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newListing,
          price: parseFloat(newListing.price),
          images: base64Images
        }),
      });

      if (response.ok) {
        setNewListing({
          title: '',
          description: '',
          price: '',
          category: '',
          condition: '',
          location: '',
          images: []
        });
        setImageFiles([]);
        setImagePreviews([]);
        setShowCreateListing(false);
        fetchDashboardData(); 
        alert('Listing created successfully!');
      } else {
        const errorData = await response.json();
        alert('Error creating listing: ' + (errorData.detail || 'Unknown error'));
      }
    } catch (error) {
      alert('Error creating listing: ' + error.message);
    }
  };

  const editListing = (listing) => {
    setEditingListing(listing);
    setNewListing({
      title: listing.title,
      description: listing.description,
      price: listing.price.toString(),
      category: listing.category,
      condition: listing.condition_type,
      location: listing.location,
      images: listing.images || []
    });
    setImageFiles([]);
    setImagePreviews([]);
    setShowEditListing(true);
  };

  const updateListing = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      
      
      const base64Images = imageFiles.length > 0 ? await convertImagesToBase64(imageFiles) : (editingListing.images || []);
      
      const response = await fetch(`http://localhost:8000/api/listings/${editingListing.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newListing,
          price: parseFloat(newListing.price),
          images: base64Images
        }),
      });

      if (response.ok) {
        setNewListing({
          title: '',
          description: '',
          price: '',
          category: '',
          condition: '',
          location: '',
          images: []
        });
        setImageFiles([]);
        setImagePreviews([]);
        setEditingListing(null);
        setShowEditListing(false);
        fetchDashboardData(); // Refresh data
        alert('Listing updated successfully!');
      } else {
        const errorData = await response.json();
        alert('Error updating listing: ' + (errorData.detail || 'Unknown error'));
      }
    } catch (error) {
      alert('Error updating listing: ' + error.message);
    }
  };

  const deleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`http://localhost:8000/api/listings/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchDashboardData(); 
        alert('Listing deleted successfully!');
      } else {
        const errorData = await response.json();
        alert('Error deleting listing: ' + (errorData.detail || 'Unknown error'));
      }
    } catch (error) {
      alert('Error deleting listing: ' + error.message);
    }
  };


  const openEditProfile = () => {
    setEditProfileData({
      name: user?.name || '',
      email: user?.email || ''
    });
    setShowEditProfile(true);
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('http://localhost:8000/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editProfileData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setShowEditProfile(false);
        alert('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        alert('Error updating profile: ' + (errorData.detail || 'Unknown error'));
      }
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    }
  };

  const deleteProfile = async () => {
    if (!window.confirm('Are you sure you want to delete your profile? This action cannot be undone and will delete all your data including listings, orders, and messages.')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('http://localhost:8000/api/profile', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Profile deleted successfully! You will be logged out.');
        handleLogout();
        navigate('/');
      } else {
        const errorData = await response.json();
        alert('Error deleting profile: ' + (errorData.detail || 'Unknown error'));
      }
    } catch (error) {
      alert('Error deleting profile: ' + error.message);
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
    <div className="dashboard-container">
      <Header />

      {/* Dashboard Header - Full Width */}
      <div className="dashboard-header">
        <div className="container">
          <div className="dashboard-header-content">
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">
              Welcome back, {user?.name}! Manage your listings, orders, and messages.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container">
          
        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{stats.listings_count}</span>
              <span className="stat-label">Active Listings</span>
            </div>
            
            <div className="stat-card">
              <span className="stat-number">{stats.unread_messages}</span>
              <span className="stat-label">Unread Messages</span>
            </div>

            <div className="stat-card">
              <span className="stat-number">{stats.orders_count}</span>
              <span className="stat-label">Orders</span>
            </div>

            <div className="stat-card">
              <span className="stat-number">{stats.average_rating || 'N/A'}</span>
              <span className="stat-label">Avg Rating</span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="tab-navigation">
          {['overview', 'listings', 'messages', 'orders', 'reviews', 'profile'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="content-card">
            <div className="content-card-header">
              <h3 className="content-card-title">Quick Actions</h3>
            </div>
            <div className="quick-actions-grid">
              <button 
                className="quick-action-btn"
                onClick={() => navigate('/shop')}
              >
                <span className="quick-action-icon">🛍️</span>
                Browse Items
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => setShowCreateListing(true)}
              >
                <span className="quick-action-icon">📝</span>
                Create Listing
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => setActiveTab('messages')}
              >
                <span className="quick-action-icon">💬</span>
                Messages ({stats?.unread_messages || 0})
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => setActiveTab('orders')}
              >
                <span className="quick-action-icon">📦</span>
                Orders ({stats?.orders_count || 0})
              </button>
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="content-card">
            <div className="content-card-header">
              <h3 className="content-card-title">My Listings</h3>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateListing(true)}
              >
                + Create New Listing
              </button>
            </div>
            
            {listings.length === 0 ? (
              <div className="text-center">
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '1rem' }}>
                  No listings yet. Create your first listing to get started!
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowCreateListing(true)}
                >
                  Create Your First Listing
                </button>
              </div>
            ) : (
              <div className="listings-grid">
                {listings.map(listing => (
                  <div key={listing.id} className="listing-item">
                    <div className="listing-header">
                      <div>
                        <h4 className="listing-title">{listing.title}</h4>
                        <p className="listing-description">
                          {listing.description}
                        </p>
                        <div className="listing-details">
                          <div className="listing-detail">
                            <span className="listing-detail-label">Price</span>
                            <span className="listing-detail-value">${listing.price}</span>
                          </div>
                          <div className="listing-detail">
                            <span className="listing-detail-label">Category</span>
                            <span className="listing-detail-value">{listing.category}</span>
                          </div>
                          <div className="listing-detail">
                            <span className="listing-detail-label">Condition</span>
                            <span className="listing-detail-value">{listing.condition_type}</span>
                          </div>
                          <div className="listing-detail">
                            <span className="listing-detail-label">Location</span>
                            <span className="listing-detail-value">{listing.location}</span>
                          </div>
                        </div>
                      </div>
                       <div className="listing-actions">
                         <button 
                           className="btn btn-secondary btn-sm"
                           onClick={() => editListing(listing)}
                         >
                           Edit
                         </button>
                         <button 
                           className="btn btn-danger btn-sm"
                           onClick={() => deleteListing(listing.id)}
                         >
                           Delete
                         </button>
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

        {activeTab === 'profile' && (
          <div className="content-card">
            <div className="content-card-header">
              <h3 className="content-card-title">Profile Information</h3>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <button 
                  className="btn btn-primary"
                  onClick={openEditProfile}
                >
                  Edit Profile
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={deleteProfile}
                >
                  Delete Profile
                </button>
              </div>
            </div>
            
            <div className="profile-info">
              <div className="profile-field">
                <label className="profile-label">Name:</label>
                <span className="profile-value">{user?.name || 'N/A'}</span>
              </div>
              <div className="profile-field">
                <label className="profile-label">Email:</label>
                <span className="profile-value">{user?.email || 'N/A'}</span>
              </div>
              <div className="profile-field">
                <label className="profile-label">Member Since:</label>
                <span className="profile-value">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="profile-field">
                <label className="profile-label">Account Status:</label>
                <span className={`profile-status ${user?.is_active ? 'active' : 'inactive'}`}>
                  {user?.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="profile-stats">
              <h4 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)' }}>Account Statistics</h4>
              <div className="profile-stats-grid">
                <div className="profile-stat-item">
                  <span className="profile-stat-number">{stats?.listings_count || 0}</span>
                  <span className="profile-stat-label">Listings</span>
                </div>
                <div className="profile-stat-item">
                  <span className="profile-stat-number">{stats?.orders_count || 0}</span>
                  <span className="profile-stat-label">Orders</span>
                </div>
                <div className="profile-stat-item">
                  <span className="profile-stat-number">{stats?.sales_count || 0}</span>
                  <span className="profile-stat-label">Sales</span>
                </div>
                <div className="profile-stat-item">
                  <span className="profile-stat-number">{stats?.average_rating || 'N/A'}</span>
                  <span className="profile-stat-label">Avg Rating</span>
                </div>
              </div>
            </div>
          </div>
        )}

         {/* Edit Listing Modal */}
         {showEditListing && (
           <div className="modal-overlay">
             <div className="modal-content">
               <div className="modal-header">
                 <h3 className="modal-title">Edit Listing</h3>
                 <button 
                   className="modal-close"
                   onClick={() => {
                     setShowEditListing(false);
                     setEditingListing(null);
                     setImageFiles([]);
                     setImagePreviews([]);
                   }}
                 >
                   ×
                 </button>
               </div>
               <form onSubmit={updateListing}>
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
                 
                 <div className="form-grid">
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
                 
                 <div className="form-grid">
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
                 
                 {/* Image Upload Section */}
                 <div className="form-group">
                   <label className="form-label">Product Images (Max 5)</label>
                   <div className="image-upload-area">
                     <input
                       type="file"
                       multiple
                       accept="image/*"
                       onChange={handleImageUpload}
                       style={{ display: 'none' }}
                       id="image-upload-edit"
                     />
                     <label 
                       htmlFor="image-upload-edit" 
                       className="image-upload-label"
                     >
                       📷 Click to upload new images
                     </label>
                     <p className="image-upload-hint">
                       PNG, JPG, JPEG up to 5MB each. Leave empty to keep existing images.
                     </p>
                   </div>
                   
                   {/* Current Images */}
                   {editingListing && editingListing.images && editingListing.images.length > 0 && (
                     <div style={{ marginBottom: '1rem' }}>
                       <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                         Current images:
                       </p>
                       <div className="image-preview-grid">
                         {editingListing.images.map((image, index) => (
                           <div key={`current-${index}`} className="image-preview-item">
                             <img 
                               src={image} 
                               alt={`Current ${index + 1}`}
                               className="image-preview"
                             />
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                   
                   {/* New Image Previews */}
                   {imagePreviews.length > 0 && (
                     <div>
                       <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                         New images:
                       </p>
                       <div className="image-preview-grid">
                         {imagePreviews.map((preview, index) => (
                           <div key={index} className="image-preview-item">
                             <img 
                               src={preview} 
                               alt={`Preview ${index + 1}`}
                               className="image-preview"
                             />
                             <button
                               type="button"
                               onClick={() => removeImage(index)}
                               className="image-remove-btn"
                             >
                               ×
                             </button>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>
                 
                 <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                   <button type="submit" className="btn btn-primary">Update Listing</button>
                   <button 
                     type="button" 
                     className="btn btn-secondary"
                     onClick={() => {
                       setShowEditListing(false);
                       setEditingListing(null);
                       setImageFiles([]);
                       setImagePreviews([]);
                     }}
                   >
                     Cancel
                   </button>
                 </div>
               </form>
             </div>
           </div>
         )}

         {/* Create Listing Modal */}
         {showCreateListing && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Create New Listing</h3>
                <button 
                  className="modal-close"
                  onClick={() => {
                    setShowCreateListing(false);
                    setImageFiles([]);
                    setImagePreviews([]);
                  }}
                >
                  ×
                </button>
              </div>
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
                
                <div className="form-grid">
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
                
                <div className="form-grid">
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
                
                {/* Image Upload Section */}
                <div className="form-group">
                  <label className="form-label">Product Images (Max 5)</label>
                  <div className="image-upload-area">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      id="image-upload"
                    />
                    <label 
                      htmlFor="image-upload" 
                      className="image-upload-label"
                    >
                      📷 Click to upload images
                    </label>
                    <p className="image-upload-hint">
                      PNG, JPG, JPEG up to 5MB each
                    </p>
                  </div>
                  
                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="image-preview-grid">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="image-preview-item">
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`}
                            className="image-preview"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="image-remove-btn"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                  <button type="submit" className="btn btn-primary">Create Listing</button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowCreateListing(false);
                      setImageFiles([]);
                      setImagePreviews([]);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Edit Profile</h3>
                <button 
                  className="modal-close"
                  onClick={() => setShowEditProfile(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={updateProfile}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editProfileData.name}
                    onChange={(e) => setEditProfileData({...editProfileData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editProfileData.email}
                    onChange={(e) => setEditProfileData({...editProfileData, email: e.target.value})}
                    required
                  />
                </div>
                
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                  <button type="submit" className="btn btn-primary">Update Profile</button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowEditProfile(false)}
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
