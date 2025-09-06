import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Cart = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="container py-8">
          <h1 className="text-3xl font-bold text-primary">Shopping Cart</h1>
        </div>
      </div>

      {/* Empty Cart Content */}
      <div className="container py-16">
        <div className="text-center">
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
            <button className="btn btn-primary btn-lg px-8">
              Continue Shopping
            </button>
            <button className="btn btn-secondary btn-lg px-8">
              View Wishlist
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
                onClick={() => window.location.href = '/shop'}
              >
                Browse All Products
              </button>
              <button 
                className="btn btn-secondary btn-lg px-8"
                onClick={() => window.location.href = '/shop?category=Electronics'}
              >
                Electronics
              </button>
              <button 
                className="btn btn-secondary btn-lg px-8"
                onClick={() => window.location.href = '/shop?category=Fashion'}
              >
                Fashion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Summary Sidebar (for when cart has items) */}
      <div className="hidden">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Order Summary</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-secondary">Subtotal</span>
              <span className="font-medium">$0.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Shipping</span>
              <span className="font-medium">Free</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Tax</span>
              <span className="font-medium">$0.00</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-semibold">$0.00</span>
              </div>
            </div>
          </div>

          <button className="btn btn-primary btn-full">
            Proceed to Checkout
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
