import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Shop = ({ isAuthenticated, user, onLoginClick, onLogout, onNavigation }) => {
  // Sample product data
  const [products] = useState([
    {
      id: 1,
      name: "Wireless Headphones",
      price: 99.99,
      image: "https://via.placeholder.com/300x300?text=Headphones",
      rating: 4.5,
      category: "Electronics"
    },
    {
      id: 2,
      name: "Smart Watch",
      price: 249.99,
      image: "https://via.placeholder.com/300x300?text=Smart+Watch",
      rating: 4.8,
      category: "Electronics"
    },
    {
      id: 3,
      name: "Running Shoes",
      price: 129.99,
      image: "https://via.placeholder.com/300x300?text=Running+Shoes",
      rating: 4.3,
      category: "Sports"
    },
    {
      id: 4,
      name: "Laptop Backpack",
      price: 59.99,
      image: "https://via.placeholder.com/300x300?text=Backpack",
      rating: 4.6,
      category: "Accessories"
    },
    {
      id: 5,
      name: "Coffee Maker",
      price: 89.99,
      image: "https://via.placeholder.com/300x300?text=Coffee+Maker",
      rating: 4.4,
      category: "Home"
    },
    {
      id: 6,
      name: "Bluetooth Speaker",
      price: 79.99,
      image: "https://via.placeholder.com/300x300?text=Speaker",
      rating: 4.7,
      category: "Electronics"
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Electronics', 'Sports', 'Accessories', 'Home'];

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0v15z"/>
        </svg>
      );
    }

    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isAuthenticated={isAuthenticated} user={user} onLoginClick={onLoginClick} onLogout={onLogout} onNavigation={onNavigation} />
      
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Shop Our Products</h1>
          <p className="text-gray-600">Discover our amazing collection of products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
              {/* Product Image */}
              <div className="aspect-w-1 aspect-h-1">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-64 object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-600 font-medium">{product.category}</span>
                  <div className="flex items-center">
                    {renderStars(product.rating)}
                    <span className="ml-1 text-sm text-gray-600">({product.rating})</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Products Message */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No products found in this category.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Shop;
