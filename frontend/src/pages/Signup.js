import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('All fields are required');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/signup`, { username, email, password, role });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-logo">BlogHub</h1>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join our blogging community</p>
        </div>
        
        {error && (
          <div className="error-message">
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="success-message">
            <span>{success}</span>
          </div>
        )}
        
        <form className="auth-form" onSubmit={handleSignup}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              placeholder="Create a password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              minLength="6"
              required
            />
          </div>
          
          <div className="form-group">
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="form-select"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <small className="form-hint">
              {role === 'admin' ? 'Admin can approve/reject blogs' : 'User can create blogs for approval'}
            </small>
          </div>
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
