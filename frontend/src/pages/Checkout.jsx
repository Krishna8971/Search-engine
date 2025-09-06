import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { 
    cartItems, 
    cartTotal, 
    cartItemsCount, 
    loading, 
    clearCart 
  } = useCart();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    paymentMethod: 'credit',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState(null);

  
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cartItemsCount === 0) {
      showNotification('Your cart is empty!', 'error');
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_items: cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price
          })),
          shipping_address: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country
          },
          payment_info: {
            method: formData.paymentMethod,
            cardNumber: formData.cardNumber,
            expiryDate: formData.expiryDate,
            cvv: formData.cvv,
            nameOnCard: formData.nameOnCard
          }
        }),
      });

      if (response.ok) {
        const result = await response.json();
        showNotification('Order placed successfully!', 'success');
        
        
        await clearCart();
        
        
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        const errorData = await response.json();
        showNotification(errorData.detail || 'Checkout failed. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      showNotification('Checkout failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  
  if (cartItemsCount === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="checkout-container">
      <Header />
      
      {/* Notification */}
      {notification && (
        <div className={`checkout-notification ${
          notification.type === 'error' ? 'error' : 
          notification.type === 'info' ? 'info' : 'success'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header Section */}
      <div className="checkout-header">
        <div className="container">
          <div className="checkout-header-content py-8">
            <h1 className="checkout-title">Checkout</h1>
            <p className="checkout-subtitle">
              Complete your order for {cartItemsCount} item{cartItemsCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="checkout-form-container">
            <form onSubmit={handleSubmit} className="checkout-form">
              {/* Personal Information */}
              <div className="form-section">
                <h3 className="form-section-title">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">Last Name *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">Phone *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="form-section">
                <h3 className="form-section-title">Shipping Address</h3>
                <div className="form-group">
                  <label htmlFor="address" className="form-label">Address *</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label htmlFor="city" className="form-label">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="state" className="form-label">State *</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="zipCode" className="form-label">ZIP Code *</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="country" className="form-label">Country *</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>

              {/* Payment Information */}
              <div className="form-section">
                <h3 className="form-section-title">Payment Information</h3>
                <div className="form-group">
                  <label className="form-label">Payment Method *</label>
                  <div className="payment-methods">
                    <label className="payment-method">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit"
                        checked={formData.paymentMethod === 'credit'}
                        onChange={handleInputChange}
                      />
                      <span>Credit Card</span>
                    </label>
                    <label className="payment-method">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="debit"
                        checked={formData.paymentMethod === 'debit'}
                        onChange={handleInputChange}
                      />
                      <span>Debit Card</span>
                    </label>
                    <label className="payment-method">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={formData.paymentMethod === 'paypal'}
                        onChange={handleInputChange}
                      />
                      <span>PayPal</span>
                    </label>
                  </div>
                </div>

                {formData.paymentMethod !== 'paypal' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="cardNumber" className="form-label">Card Number *</label>
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label htmlFor="expiryDate" className="form-label">Expiry Date *</label>
                        <input
                          type="text"
                          id="expiryDate"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="cvv" className="form-label">CVV *</label>
                        <input
                          type="text"
                          id="cvv"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="nameOnCard" className="form-label">Name on Card *</label>
                      <input
                        type="text"
                        id="nameOnCard"
                        name="nameOnCard"
                        value={formData.nameOnCard}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Submit Button */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="btn btn-secondary"
                  disabled={isProcessing}
                >
                  Back to Cart
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isProcessing || loading}
                >
                  {isProcessing ? 'Processing...' : `Place Order - $${cartTotal.toFixed(2)}`}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="order-summary-container">
            <div className="order-summary">
              <h3 className="order-summary-title">Order Summary</h3>
              
              <div className="order-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="order-item">
                    <div className="order-item-image">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          onError={(e) => {
                            e.target.src = `https://via.placeholder.com/60x60?text=${encodeURIComponent(item.title)}`;
                          }}
                        />
                      ) : (
                        <div className="placeholder-image">📦</div>
                      )}
                    </div>
                    <div className="order-item-details">
                      <h4 className="order-item-title">{item.title}</h4>
                      <p className="order-item-seller">by {item.seller_name}</p>
                      <p className="order-item-quantity">Qty: {item.quantity}</p>
                    </div>
                    <div className="order-item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-totals">
                <div className="total-row">
                  <span className="total-label">Subtotal</span>
                  <span className="total-value">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span className="total-label">Shipping</span>
                  <span className="total-value" style={{color: '#10b981'}}>Free</span>
                </div>
                <div className="total-row">
                  <span className="total-label">Tax</span>
                  <span className="total-value">$0.00</span>
                </div>
                <div className="total-row total-final">
                  <span className="total-label">Total</span>
                  <span className="total-value">${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
