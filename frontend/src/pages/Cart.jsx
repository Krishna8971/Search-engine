import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

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
    showNotification('Checkout functionality coming soon!', 'info');
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Loading state
  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container py-16">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-secondary">Loading your cart...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'error' ? 'bg-red-500' : 
          notification.type === 'info' ? 'bg-blue-500' : 'bg-green-500'
        } text-white`}>
          {notification.message}
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-primary">Shopping Cart</h1>
            {cartItemsCount > 0 && (
              <div className="text-secondary">
                {cartItemsCount} item{cartItemsCount !== 1 ? 's' : ''} in cart
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container py-8">
        {cartItems.length === 0 ? (
          /* Empty Cart Content */
          <div className="text-center py-16">
            {/* Cart Icon */}
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
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
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Your Cart is Empty
            </h2>
            <p className="text-secondary mb-8 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="btn btn-primary btn-lg px-8"
                onClick={() => navigate('/shop')}
              >
                Continue Shopping
              </button>
            </div>

            {/* Browse More Products */}
            <div className="mt-16">
              <h3 className="text-xl font-semibold text-primary mb-6">
                Browse More Products
              </h3>
              <p className="text-secondary mb-6">
                Discover amazing deals in our comprehensive product catalog
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  className="btn btn-primary btn-lg px-8"
                  onClick={() => navigate('/shop')}
                >
                  Browse All Products
                </button>
                <button 
                  className="btn btn-secondary btn-lg px-8"
                  onClick={() => navigate('/shop?category=Electronics')}
                >
                  Electronics
                </button>
                <button 
                  className="btn btn-secondary btn-lg px-8"
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
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-primary">
                      Cart Items ({cartItemsCount})
                    </h2>
                    <button
                      onClick={handleClearCart}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover"
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
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-primary truncate">
                            {item.title}
                          </h3>
                          <p className="text-sm text-secondary">
                            Seller: {item.seller_name}
                          </p>
                          <p className="text-lg font-semibold text-primary mt-2">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityUpdate(item.product_id, item.quantity - 1)}
                            disabled={updatingItems.has(item.product_id) || item.quantity <= 1}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-medium">
                            {updatingItems.has(item.product_id) ? '...' : item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityUpdate(item.product_id, item.quantity + 1)}
                            disabled={updatingItems.has(item.product_id)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-lg font-semibold text-primary">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          <button
                            onClick={() => handleRemoveItem(item.product_id)}
                            disabled={updatingItems.has(item.product_id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium mt-1 disabled:opacity-50"
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
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h3 className="text-lg font-semibold text-primary mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-secondary">Subtotal</span>
                    <span className="font-medium">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Tax</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg font-semibold">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="btn btn-primary btn-full mb-4"
                >
                  Proceed to Checkout
                </button>

                <button 
                  onClick={() => navigate('/shop')}
                  className="btn btn-secondary btn-full"
                >
                  Continue Shopping
                </button>
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
