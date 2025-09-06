import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import '../styles/Shop.css';

const Shop = () => {
  useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State for listings and UI
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalListings, setTotalListings] = useState(0);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const categories = ['All', 'Electronics', 'Furniture', 'Fashion', 'Vehicles', 'Sports', 'Home', 'Accessories', 'Books'];
  const itemsPerPage = 12;

  // Helper function to safely get the first image
  const getFirstImage = (images) => {
    if (!images) return null;
    
    try {
      // If images is already an array, return the first image
      if (Array.isArray(images)) {
        return images.length > 0 ? images[0] : null;
      }
      
      // If images is a string, try to parse it
      if (typeof images === 'string') {
        const parsedImages = JSON.parse(images);
        return Array.isArray(parsedImages) && parsedImages.length > 0 ? parsedImages[0] : null;
      }
      
      return null;
    } catch (error) {
      console.warn('Error parsing images:', error);
      return null;
    }
  };

  // Handle URL parameters for category filtering
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams, categories]);

  // Fetch listings from API
  const fetchListings = async (category = selectedCategory, search = searchQuery, page = currentPage) => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage
      });
      
      if (category && category !== 'All') {
        params.append('category', category);
      }
      
      if (search) {
        params.append('search', search);
      }
      
      const response = await fetch(`http://localhost:8000/api/listings?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched listings data:', data);
      
      setListings(data.listings || []);
      setTotalListings(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to load listings. Please try again later.');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    fetchListings();
  }, [selectedCategory, searchQuery, currentPage]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchListings(selectedCategory, searchQuery, 1);
  };

  // Handle category filter
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setSearchParams(category !== 'All' ? { category } : {});
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${
            currentPage === i ? 'active' : ''
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          Previous
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          Next
        </button>
      </div>
    );
  };

  // Render loading state
  if (loading) {
    return (
      <div className="shop-container">
        <Header />
        <div className="shop-header">
          <div className="container shop-header-content">
            <h1 className="shop-title">Shop Our Products</h1>
            <p className="shop-subtitle">Discover amazing second-hand items from our community</p>
          </div>
        </div>
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading listings...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="shop-container">
        <Header />
        <div className="shop-header">
          <div className="container shop-header-content">
            <h1 className="shop-title">Shop Our Products</h1>
            <p className="shop-subtitle">Discover amazing second-hand items from our community</p>
          </div>
        </div>
        <div className="container">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Oops! Something went wrong</h2>
            <p className="error-message">{error}</p>
            <button 
              onClick={() => fetchListings()}
              className="retry-btn"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="shop-container">
      <Header />
      
      {/* Header Section */}
      <div className="shop-header">
        <div className="container shop-header-content">
          <h1 className="shop-title">Shop Our Products</h1>
          <p className="shop-subtitle">Discover amazing second-hand items from our community</p>
        </div>
      </div>

      <div className="container">
        {/* Search and Filter Section */}
        <div className="search-filter-section">
          {/* Search Bar */}
          <div className="search-container">
            <h3 className="search-title">Search Products</h3>
            <form onSubmit={handleSearch} className="search-form">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title, description, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button 
                  type="submit"
                  className="search-button"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Category Filter */}
          <div className="category-section">
            <h3 className="category-title">Filter by Category</h3>
            <div className="category-buttons">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`category-btn ${
                    selectedCategory === category ? 'active' : ''
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="results-counter">
            Showing {listings.length} of {totalListings} listings
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        </div>

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div className="empty-container">
            <div className="empty-icon">🔍</div>
            <h3 className="empty-title">No listings found</h3>
            <p className="empty-message">
              {searchQuery || selectedCategory !== 'All' 
                ? 'Try adjusting your search or filter criteria'
                : 'No listings available at the moment. Check back later!'
              }
            </p>
            {(searchQuery || selectedCategory !== 'All') && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSearchParams({});
                }}
                className="clear-filters-btn"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="products-grid">
              {listings.map((listing) => {
                // Add error boundary for each listing
                try {
                  return (
                    <div key={listing.id} className="product-card">
                  {/* Listing Image */}
                  <div className="product-image-container">
                    {getFirstImage(listing.images) ? (
                      <img
                        src={getFirstImage(listing.images)}
                        alt={listing.title}
                        className="product-image"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/300x300?text=${encodeURIComponent(listing.title)}`;
                        }}
                      />
                    ) : (
                      <div className="product-image-placeholder">
                        📦
                      </div>
                    )}
                  </div>

                  {/* Listing Info */}
                  <div className="product-info">
                    <div className="product-header">
                      <span className="product-category">{listing.category}</span>
                      <span className="product-views">{listing.views || 0}</span>
                    </div>

                    <h3 className="product-title">{listing.title}</h3>
                    
                    <p className="product-description">{listing.description}</p>
                    
                    {/* Condition and Location */}
                    <div className="product-details">
                      <div className="product-detail-row">
                        <span className="product-detail-label">Condition:</span>
                        <span>{listing.condition_type}</span>
                      </div>
                      <div className="product-detail-row">
                        <span className="product-detail-label">Location:</span>
                        <span>{listing.location}</span>
                      </div>
                    </div>

                    {/* Seller Info */}
                    <div className="product-seller">
                      <span>Seller: {listing.seller_name}</span>
                    </div>
                    
                    <div className="product-footer">
                      <span className="product-price">${parseFloat(listing.price).toFixed(2)}</span>
                      <button className="view-details-btn">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
                  );
                } catch (error) {
                  console.error('Error rendering listing:', listing, error);
                  return (
                    <div key={listing.id} className="product-card">
                      <div className="product-image-container">
                        <div className="product-image-placeholder">
                          ⚠️
                        </div>
                      </div>
                      <div className="product-info">
                        <h3 className="product-title">Error loading listing</h3>
                        <p className="product-description">There was an error displaying this listing.</p>
                      </div>
                    </div>
                  );
                }
              })}
            </div>

            {/* Pagination */}
            {renderPagination()}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Shop;