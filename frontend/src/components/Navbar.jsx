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
      <Link to="/" className="nav-logo">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
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
            {(user.role === 'ROLE_ADMIN' || user.role === 'ROLE_SUPER_ADMIN') && (
              <>
                <NavLink to="/dashboard" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <LayoutDashboard size={16} /> Data Entry Dashboard
                </NavLink>
                <NavLink to="/admin" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldAlert size={16} color="#fbbf24" /> Admin Console
                </NavLink>
              </>
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
              <button className="nav-btn" style={{ background: '#fbbf24', color: '#0f172a' }}>Register</button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
