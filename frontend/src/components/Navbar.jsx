import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, LogOut, LayoutDashboard, UserCheck, ShieldAlert, Award } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <Link to="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
          <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
          <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path>
        </svg>
        MANAGE<span>MY DATA</span>
      </Link>

      <nav className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Home
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Search Listings
        </NavLink>
        
        {user ? (
          <>
            {(user.role === 'ROLE_BUSINESS' || user.role === 'ROLE_EMPLOYEE') && (
              <NavLink to="/dashboard" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <LayoutDashboard size={16} /> Data Entry Dashboard
              </NavLink>
            )}

            {(user.role === 'ROLE_ADMIN' || user.role === 'ROLE_SUPER_ADMIN') && (
              <NavLink to="/admin" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ShieldAlert size={16} color="var(--primary)" /> Admin Console
              </NavLink>
            )}
            
            <span style={{ fontSize: '0.9rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <UserCheck size={14} /> Hi, {user.username}
            </span>
            
            <button onClick={handleLogout} className="nav-btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.85rem' }}>
              <LogOut size={14} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button className="nav-btn-outline">Log In</button>
            </Link>
            <Link to="/register">
              <button className="nav-btn">Register</button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
