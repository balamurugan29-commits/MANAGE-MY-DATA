import React from 'react';

export default function Footer() {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '3rem 2rem 1.5rem 2rem', borderTop: '1px solid #1e293b' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ flex: '1 1 300px' }}>
          <h3 style={{ color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            MANAGE<span style={{ color: '#fbbf24' }}>MY DATA</span>
          </h3>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            Premier B2B directory connecting verified manufacturers, suppliers, exporters, and service providers with global and domestic buyers since 2026.
          </p>
        </div>
        
        <div>
          <h4 style={{ color: '#ffffff', marginBottom: '1rem', fontSize: '1rem' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', fontSize: '0.9rem', lineHeight: '2' }}>
            <li><a href="#/" style={{ color: '#94a3b8' }}>Home</a></li>
            <li><a href="#/search" style={{ color: '#94a3b8' }}>Search Directory</a></li>
            <li><a href="#/register" style={{ color: '#94a3b8' }}>Register Business</a></li>
            <li><a href="#/login" style={{ color: '#94a3b8' }}>Member Login</a></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#ffffff', marginBottom: '1rem', fontSize: '1rem' }}>B2B Categories</h4>
          <ul style={{ listStyle: 'none', fontSize: '0.9rem', lineHeight: '2' }}>
            <li><a href="#/search" style={{ color: '#94a3b8' }}>Industrial Machinery</a></li>
            <li><a href="#/search" style={{ color: '#94a3b8' }}>Electronics & Electrical</a></li>
            <li><a href="#/search" style={{ color: '#94a3b8' }}>Real Estate & Construction</a></li>
            <li><a href="#/search" style={{ color: '#94a3b8' }}>Business Services</a></li>
          </ul>
        </div>
      </div>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '1.5rem', borderTop: '1px solid #1e293b', textAlign: 'center', fontSize: '0.8rem' }}>
        <p>&copy; {new Date().getFullYear()} MANAGE MY DATA. Created with React & Spring Boot. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
