import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Building2, ShieldCheck, HelpCircle, Layers, CheckCircle2, TrendingUp } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  
  const API_URL = 'http://localhost:8080/api';

  useEffect(() => {
    // Fetch categories
    fetch(`${API_URL}/categories`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setCategories(data))
      .catch(err => console.error("Error fetching categories:", err));

    // Fetch cities
    fetch(`${API_URL}/cities`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setCities(data))
      .catch(err => console.error("Error fetching cities:", err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    let url = `/search?term=${encodeURIComponent(searchTerm)}`;
    if (selectedCityId) {
      url += `&cityId=${selectedCityId}`;
    }
    navigate(url);
  };

  const handleCitySelect = (city) => {
    setCityInput(city.name);
    setSelectedCityId(city.id);
    setShowCityDropdown(false);
  };

  const filteredCities = cities.filter(c =>
    c.name.toLowerCase().includes(cityInput.toLowerCase())
  );

  return (
    <div className="home-view">
      {/* Hero Search Section */}
      <section className="hero-section">
        <div className="hero-container">
          <h1 className="hero-title">
            India’s Leading <span>B2B Business Directory</span>
          </h1>
          <p className="hero-subtitle">
            Connect with verified manufacturers, suppliers, exporters, and service providers across India instantly.
          </p>

          <form onSubmit={handleSearch} className="search-container">
            {/* Search Term input */}
            <div className="search-field">
              <Search size={20} />
              <input
                type="text"
                className="search-input"
                placeholder="Find Products, Services or Companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* City input & selection dropdown */}
            <div className="search-field">
              <MapPin size={20} />
              <input
                type="text"
                className="search-input"
                placeholder="Select Location/City..."
                value={cityInput}
                onChange={(e) => {
                  setCityInput(e.target.value);
                  setSelectedCityId('');
                  setShowCityDropdown(true);
                }}
                onFocus={() => setShowCityDropdown(true)}
              />
              
              {showCityDropdown && cityInput.length >= 0 && (
                <div className="search-dropdown">
                  {filteredCities.length > 0 ? (
                    filteredCities.map((city) => (
                      <div
                        key={city.id}
                        className="search-dropdown-item"
                        onClick={() => handleCitySelect(city)}
                      >
                        <strong>{city.name}</strong>, {city.state}
                      </div>
                    ))
                  ) : (
                    <div className="search-dropdown-item" style={{ color: '#94a3b8' }}>No locations found</div>
                  )}
                </div>
              )}
            </div>

            {/* Submit search button */}
            <button type="submit" className="search-btn">
              <Search size={18} /> Search
            </button>
          </form>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container" style={{ padding: '2.5rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(30,58,138,0.06)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '50%' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', margin: 0 }}>Verified Suppliers</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trustworthy B2B contacts</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(16,185,129,0.06)', color: 'var(--accent)', padding: '0.75rem', borderRadius: '50%' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', margin: 0 }}>100% Secure Leads</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Direct messaging delivery</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(251,191,36,0.06)', color: '#d97706', padding: '0.75rem', borderRadius: '50%' }}>
              <Layers size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', margin: 0 }}>Wide Range</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>All B2B industries covered</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(59,130,246,0.06)', color: 'var(--primary-light)', padding: '0.75rem', borderRadius: '50%' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', margin: 0 }}>Connect & Grow</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Accelerate sales pipelines</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="section container">
        <div className="section-header">
          <h2 className="section-title">Explore Business Listings by Categories</h2>
          <p className="section-subtitle">Discover leading businesses classified by industrial sectors and services</p>
        </div>

        <div className="category-grid">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="category-card"
              onClick={() => navigate(`/search?categoryId=${cat.id}`)}
            >
              <div className="category-icon">
                <Building2 size={28} />
              </div>
              <h3>{cat.name}</h3>
              <p>{cat.description || "Browse leading suppliers, exporters and manufacturers."}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Cities Section */}
      <section className="section" style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Find Suppliers by Top Cities</h2>
            <p className="section-subtitle">Browse directories for businesses located in industrial hubs across India</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {cities.map((city) => (
              <div
                key={city.id}
                onClick={() => navigate(`/search?cityId=${city.id}`)}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: '#f8fafc',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--secondary)';
                  e.currentTarget.style.background = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = '#f8fafc';
                }}
              >
                <h4 style={{ margin: 0, fontSize: '1rem' }}>{city.name}</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{city.state}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join CTA Section */}
      <section className="container" style={{ padding: '4rem 1rem' }}>
        <div className="cta-section">
          <h2 className="cta-title">List Your Business</h2>
          <p className="cta-desc">
            Boost your company's online visibility, showcase your product catalogs, and receive genuine buyer inquiries. Submit your details to our administrators to create your listing.
          </p>
          <div className="cta-btn-group">
            <Link to="/search">
              <button className="cta-btn">Browse Listings</button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
