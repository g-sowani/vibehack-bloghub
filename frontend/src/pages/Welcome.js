import React from 'react';
import { Link } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-logo">BlogHub</h1>
        <h2 className="welcome-title">Welcome to the Future of Blogging</h2>
        <p className="welcome-subtitle">
          Share your thoughts, connect with readers, and build your audience on our modern blogging platform.
        </p>
        
        <div className="welcome-buttons">
          <Link to="/signup" className="welcome-btn primary">
            Get Started
          </Link>
          <Link to="/login" className="welcome-btn secondary">
            Sign In
          </Link>
        </div>
        
        <div className="welcome-features">
          <div className="feature-card">
            <div className="feature-icon">✍️</div>
            <h3 className="feature-title">Write & Publish</h3>
            <p className="feature-description">Create beautiful blog posts with our intuitive editor</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3 className="feature-title">Community Driven</h3>
            <p className="feature-description">Connect with fellow writers and readers</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3 className="feature-title">Moderated Content</h3>
            <p className="feature-description">Quality assured through our approval system</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;