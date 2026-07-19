import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Mail, AlertCircle, CheckCircle2, UserCog } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ROLE_BUSINESS');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:8080/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (username.trim().length < 3 || username.trim().length > 20) {
      setError('Username must be between 3 and 20 characters.');
      setLoading(false);
      return;
    }

    if (password.length < 3 || password.length > 40) {
      setError('Password must be between 3 and 40 characters.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role })
      });

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message || 'Registration failed.');
      }

      setSuccess('Account created successfully! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-container">
        <h2 className="auth-title">Register Account</h2>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '0.75rem', borderRadius: '8px', color: '#b91c1c', display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', alignItems: 'center' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '0.75rem', borderRadius: '8px', color: '#166534', display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', alignItems: 'center' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                id="username"
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="Choose username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                id="email"
                type="email"
                className="form-control"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="Enter email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                id="password"
                type="password"
                className="form-control"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="Choose secure password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" htmlFor="role">Account Type</label>
            <div style={{ position: 'relative' }}>
              <UserCog size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <select
                id="role"
                className="form-control"
                style={{ paddingLeft: '2.25rem', appearance: 'none', cursor: 'pointer' }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="ROLE_BUSINESS">Business listing owner (Sell products/services)</option>
                <option value="ROLE_BUYER">Individual Buyer (Submit reviews & inquiries)</option>
                <option value="ROLE_EMPLOYEE">Data Entry Employee (Manage listings database)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already a member? <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Log In</Link>
        </p>
      </div>
    </div>
  );
}
