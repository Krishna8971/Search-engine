import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, token } = useAuth();

  // Calculate cart totals
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemsCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  // Fetch cart items from API
  const fetchCartItems = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setCartItems([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
      } else {
        throw new Error('Failed to fetch cart items');
      }
    } catch (err) {
      console.error('Error fetching cart items:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  // Add item to cart
  const addToCart = useCallback(async (product) => {
    if (!isAuthenticated || !token) {
      throw new Error('Please login to add items to cart');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:8000/api/cart/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
        return { success: true, message: 'Item added to cart successfully' };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add item to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  // Update item quantity in cart
  const updateCartItem = useCallback(async (productId, quantity) => {
    if (!isAuthenticated || !token) {
      throw new Error('Please login to update cart');
    }

    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:8000/api/cart/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
        return { success: true, message: 'Cart updated successfully' };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update cart');
      }
    } catch (err) {
      console.error('Error updating cart:', err);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  // Remove item from cart
  const removeFromCart = useCallback(async (productId) => {
    if (!isAuthenticated || !token) {
      throw new Error('Please login to remove items from cart');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:8000/api/cart/remove', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
        return { success: true, message: 'Item removed from cart successfully' };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to remove item from cart');
      }
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    if (!isAuthenticated || !token) {
      throw new Error('Please login to clear cart');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:8000/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setCartItems([]);
        return { success: true, message: 'Cart cleared successfully' };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to clear cart');
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  // Check if item is in cart
  const isInCart = useCallback((productId) => {
    return cartItems.some(item => item.product_id === productId);
  }, [cartItems]);

  // Get item quantity in cart
  const getItemQuantity = useCallback((productId) => {
    const item = cartItems.find(item => item.product_id === productId);
    return item ? item.quantity : 0;
  }, [cartItems]);

  // Fetch cart items when authentication status changes
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchCartItems();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated, token, fetchCartItems]);

  const value = {
    cartItems,
    cartTotal,
    cartItemsCount,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    isInCart,
    getItemQuantity,
    fetchCartItems
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
