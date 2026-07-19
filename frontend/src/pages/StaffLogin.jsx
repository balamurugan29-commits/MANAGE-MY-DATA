import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function StaffLogin({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const API_URL = 'http://localhost:8080/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Invalid username or password.');
      }

      const data = await response.json();

      // Check role restriction: must be ROLE_SUPER_ADMIN, ROLE_ADMIN, or ROLE_EMPLOYEE
      if (data.role !== 'ROLE_SUPER_ADMIN' && data.role !== 'ROLE_ADMIN' && data.role !== 'ROLE_EMPLOYEE') {
        throw new Error("Access restricted. This portal is reserved for Super Boss, Admin, and Employee staff. Please login using the Member portal.");
      }

      onLoginSuccess(data);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check database connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <div className="auth-container" style={{ maxWidth: '420px', margin: '0 auto', background: '#ffffff', padding: '2.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)' }}>
        <h2 className="auth-title" style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>Staff Log In Portal</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem', lineHeight: '1.4' }}>
          Authorized access for Super Boss, Admins, and Employees only.
        </p>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '0.75rem', borderRadius: '8px', color: '#b91c1c', display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', alignItems: 'center' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="username" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                id="username"
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="Enter staff username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" htmlFor="password" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                placeholder="Enter staff password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-light)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', background: 'var(--primary)', color: '#ffffff' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Staff Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}
