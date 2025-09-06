import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const About = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16">
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
              About EcoFinds
            </h1>
            <p className="text-lg mb-xl" style={{ 
              opacity: 0.9,
              color: '#f3eae0'
            }}>
              Making sustainable living accessible to everyone
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-xl">
              <h2 className="font-bold mb-md" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                Our Story
              </h2>
              <p className="text-lg text-secondary">
                Founded with a vision to make sustainable living accessible to everyone
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg leading-relaxed mb-6 text-secondary">
                  Founded in 2023, EcoFinds began with a simple mission: to make eco-friendly products more accessible to conscious consumers. We believe that sustainable living shouldn't be a luxury, but a choice available to everyone.
                </p>
                <p className="text-lg leading-relaxed text-secondary">
                  Today, we partner with over 100 sustainable brands to bring you carefully curated products that are good for both you and the planet.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-surface-light">
          <div className="container">
            <div className="text-center mb-xl">
              <h2 className="font-bold mb-md" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                Our Values
              </h2>
              <p className="text-lg text-secondary">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Value 1 */}
              <div 
                className="text-center rounded-lg shadow-md p-8 cursor-pointer hover:transform hover:-translate-y-1 transition-transform"
                style={{ backgroundColor: '#f3eae0' }}
              >
                <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-md text-primary text-4xl">
                  🌱
                </div>
                <h3 className="text-lg font-bold mb-sm">
                  Sustainability
                </h3>
                <p className="text-secondary">
                  Every product we offer meets strict environmental standards.
                </p>
              </div>

              {/* Value 2 */}
              <div 
                className="text-center rounded-lg shadow-md p-8 cursor-pointer hover:transform hover:-translate-y-1 transition-transform"
                style={{ backgroundColor: '#f3eae0' }}
              >
                <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-md text-primary text-4xl">
                  🔍
                </div>
                <h3 className="text-lg font-bold mb-sm">
                  Transparency
                </h3>
                <p className="text-secondary">
                  We believe in full disclosure about our products and practices.
                </p>
              </div>

              {/* Value 3 - Community (moved to third position) */}
              <div 
                className="text-center rounded-lg shadow-md p-8 cursor-pointer hover:transform hover:-translate-y-1 transition-transform sm:col-span-2 lg:col-span-1"
                style={{ backgroundColor: '#f3eae0' }}
              >
                <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-md text-primary text-4xl">
                  🤝
                </div>
                <h3 className="text-lg font-bold mb-sm">
                  Community
                </h3>
                <p className="text-secondary">
                  Building a community of conscious consumers and ethical brands.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-xl">
              <h2 className="font-bold mb-md" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                Contact Us
              </h2>
              <p className="text-lg text-secondary">
                Get in touch with our team
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-bold mb-6">Get in Touch</h3>
                <p className="text-lg mb-8 text-secondary">
                  Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-primary text-xl">
                      📍
                    </div>
                    <p className="text-lg text-secondary">123 Eco Street, Green City</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-primary text-xl">
                      📧
                    </div>
                    <p className="text-lg text-secondary">hello@ecofinds.com</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-primary text-xl">
                      📱
                    </div>
                    <p className="text-lg text-secondary">(555) 123-4567</p>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2 text-secondary">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input w-full"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-secondary">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input w-full"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2 text-secondary">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    className="form-input w-full resize-none"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="btn btn-lg w-full"
                  style={{ backgroundColor: '#2f486d', color: '#FFFFFF', border: 'none' }}
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
