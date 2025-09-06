import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { 
    cartItems, 
    cartTotal, 
    cartItemsCount, 
    loading, 
    error, 
    updateCartItem, 
    removeFromCart, 
    clearCart 
  } = useCart();
  
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [notification, setNotification] = useState(null);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle quantity update
  const handleQuantityUpdate = async (productId, newQuantity) => {
    if (newQuantity < 0) return;
    
    setUpdatingItems(prev => new Set([...prev, productId]));
    
    try {
      const result = await updateCartItem(productId, newQuantity);
      if (result.success) {
        showNotification(result.message);
      } else {
        showNotification(result.message, 'error');
      }
    } catch (err) {
      showNotification('Failed to update cart item', 'error');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Handle remove item
  const handleRemoveItem = async (productId) => {
    setUpdatingItems(prev => new Set([...prev, productId]));
    
    try {
      const result = await removeFromCart(productId);
      if (result.success) {
        showNotification(result.message);
      } else {
        showNotification(result.message, 'error');
      }
    } catch (err) {
      showNotification('Failed to remove item from cart', 'error');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        const result = await clearCart();
        if (result.success) {
          showNotification(result.message);
        } else {
          showNotification(result.message, 'error');
        }
      } catch (err) {
        showNotification('Failed to clear cart', 'error');
      }
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    if (cartItemsCount === 0) return;
    navigate('/checkout');
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Loading state
  if (loading && cartItems.length === 0) {
    return (
      <div className="cart-container">
        <Header />
        <div className="container py-16">
          <div className="cart-loading">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading your cart...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="cart-container">
      <Header />
      
      {/* Notification */}
      {notification && (
        <div className={`cart-notification ${
          notification.type === 'error' ? 'error' : 
          notification.type === 'info' ? 'info' : 'success'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header Section */}
      <div className="cart-header">
        <div className="container">
          <div className="cart-header-content py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="cart-title">Shopping Cart</h1>
                {cartItemsCount > 0 && (
                  <p className="cart-subtitle">
                    {cartItemsCount} item{cartItemsCount !== 1 ? 's' : ''} in your cart
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {cartItems.length === 0 ? (
          /* Empty Cart Content */
          <div className="empty-cart-container fade-in">
            {/* Cart Icon */}
            <div className="empty-cart-icon">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0H17M9 18h8"
                />
              </svg>
            </div>

            {/* Empty Message */}
            <h2 className="empty-cart-title">
              Your Cart is Empty
            </h2>
            <p className="empty-cart-message">
              Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
            </p>

            {/* Action Buttons */}
            <div className="empty-cart-actions">
              <button 
                className="browse-btn browse-btn-primary"
                onClick={() => navigate('/shop')}
              >
                Continue Shopping
              </button>
            </div>

            {/* Browse More Products */}
            <div className="browse-section">
              <h3 className="browse-title">
                Browse More Products
              </h3>
              <p className="browse-description">
                Discover amazing deals in our comprehensive product catalog
              </p>
              <div className="browse-buttons">
                <button 
                  className="browse-btn browse-btn-primary"
                  onClick={() => navigate('/shop')}
                >
                  Browse All Products
                </button>
                <button 
                  className="browse-btn browse-btn-secondary"
                  onClick={() => navigate('/shop?category=Electronics')}
                >
                  Electronics
                </button>
                <button 
                  className="browse-btn browse-btn-secondary"
                  onClick={() => navigate('/shop?category=Fashion')}
                >
                  Fashion
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Cart with Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="cart-items-container slide-up">
                <div className="cart-items-header">
                  <div className="flex items-center justify-between">
                    <h2 className="cart-items-title">
                      Cart Items ({cartItemsCount})
                    </h2>
                    <button
                      onClick={handleClearCart}
                      className="clear-cart-btn"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>

                <div>
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-item fade-in">
                      <div className="cart-item-content">
                        {/* Product Image */}
                        <div className="cart-item-image">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              onError={(e) => {
                                e.target.src = `https://via.placeholder.com/80x80?text=${encodeURIComponent(item.title)}`;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              📦
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="cart-item-details">
                          <h3 className="cart-item-title">
                            {item.title}
                          </h3>
                          <p className="cart-item-seller">
                            Seller: {item.seller_name}
                          </p>
                          <p className="cart-item-price">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="quantity-controls">
                          <button
                            onClick={() => handleQuantityUpdate(item.product_id, item.quantity - 1)}
                            disabled={updatingItems.has(item.product_id) || item.quantity <= 1}
                            className="quantity-btn"
                          >
                            -
                          </button>
                          <span className="quantity-display">
                            {updatingItems.has(item.product_id) ? '...' : item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityUpdate(item.product_id, item.quantity + 1)}
                            disabled={updatingItems.has(item.product_id)}
                            className="quantity-btn"
                          >
                            +
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="cart-item-total">
                          <p className="cart-item-total-price">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          <button
                            onClick={() => handleRemoveItem(item.product_id)}
                            disabled={updatingItems.has(item.product_id)}
                            className="remove-item-btn"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="order-summary slide-up">
                <h3 className="order-summary-title">Order Summary</h3>
                
                <div className="order-summary-details">
                  <div className="summary-row">
                    <span className="summary-label">Subtotal</span>
                    <span className="summary-value">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Shipping</span>
                    <span className="summary-value" style={{color: '#10b981'}}>Free</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Tax</span>
                    <span className="summary-value">$0.00</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label summary-total">Total</span>
                    <span className="summary-value summary-total">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="cart-action-buttons">
                  <button 
                    onClick={handleCheckout}
                    className="checkout-btn"
                  >
                    Proceed to Checkout
                  </button>

                  <button 
                    onClick={() => navigate('/shop')}
                    className="continue-shopping-btn"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
