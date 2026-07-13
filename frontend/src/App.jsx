import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// Layout & Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Directory from './pages/Directory';
import Details from './pages/Details';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if session token exists in localStorage
    const savedUser = localStorage.getItem('iyp_session_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Error reading cached user session:", err);
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('iyp_session_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('iyp_session_user');
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar user={user} onLogout={handleLogout} />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<Directory />} />
            <Route path="/listings/:id" element={<Details />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/admin" element={<Admin user={user} />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
