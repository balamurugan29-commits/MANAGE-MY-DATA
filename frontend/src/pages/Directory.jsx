import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Tag, Star, Award, Mail, Phone, ChevronRight, X, AlertCircle, RefreshCw, Building2, CheckCircle } from 'lucide-react';
import MapComponent from '../components/MapComponent';

// Lookup dictionary of areas for major Indian cities
const CITY_AREAS = {
  "Chennai": ["Anna Nagar", "Guindy", "Tambaram", "Adyar", "T. Nagar", "Velachery"],
  "Delhi": ["Connaught Place", "Dwarka", "Saket", "Karol Bagh", "Vasant Kunj", "Okhla"],
  "Mumbai": ["Andheri", "Bandra", "Colaba", "Borivali", "Dadar", "Worli"],
  "Bengaluru": ["Koramangala", "Indiranagar", "Jayanagar", "Whitefield", "Electronic City", "HSR Layout"],
  "Coimbatore": ["Gandhipuram", "RS Puram", "Peelamedu", "Saibaba Colony", "Saravanampatti"],
  "Pune": ["Kothrud", "Koregaon Park", "Hinjawadi", "Viman Nagar", "Baner"],
  "Hyderabad": ["Gachibowli", "Madhapur", "Jubilee Hills", "Banjara Hills", "Secunderabad"],
  "Kolkata": ["Salt Lake", "New Town", "Park Street", "Howrah", "Tollygunge"],
  "Jaipur": ["Malviya Nagar", "Vaishali Nagar", "Mansarovar", "C-Scheme"],
  "Surat": ["Adajan", "Varachha", "Piplod", "Vesu"],
  "Ahmedabad": ["Satellite", "C G Road", "Vastrapur", "Bodakdev"],
  "Noida": ["Sector 62", "Sector 18", "Sector 15", "Sector 63"],
  "Gurugram": ["DLF Phase 3", "Sector 29", "Sohna Road", "Golf Course Road"],
  "Vadodara": ["Alkapuri", "Gotri", "Manjalpur", "Sayajigunj"],
  "Ludhiana": ["Model Town", "Civil Lines", "Sarabha Nagar"]
};

export default function Directory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Search state
  const termParam = searchParams.get('term') || '';
  const cityParam = searchParams.get('cityId') || '';
  const categoryParam = searchParams.get('categoryId') || '';
  const stateParam = searchParams.get('state') || '';
  const areaParam = searchParams.get('area') || '';

  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  const uniqueStates = [...new Set(cities.map(c => c.state))].sort();
  const filteredCities = stateParam ? cities.filter(c => c.state === stateParam) : cities;

  const selectedCityObj = cities.find(c => c.id === parseInt(cityParam));
  const selectedCityName = selectedCityObj ? selectedCityObj.name : '';
  const areasForSelectedCity = selectedCityName ? (CITY_AREAS[selectedCityName] || []) : [];

  const filteredListings = listings.filter(item => {
    if (stateParam && item.city?.state !== stateParam) {
      return false;
    }
    if (areaParam) {
      const areaMatch = (item.area || '').toLowerCase().includes(areaParam.toLowerCase());
      const addressMatch = (item.address || '').toLowerCase().includes(areaParam.toLowerCase());
      return areaMatch || addressMatch;
    }
    return true;
  });

  // Inquiry modal state
  const [activeInquiryListing, setActiveInquiryListing] = useState(null);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState('');
  const [inquiryError, setInquiryError] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  const API_URL = 'http://localhost:8080/api';



  useEffect(() => {
    // Fetch categories & cities for filters
    fetch(`${API_URL}/categories`).then(r => r.json()).then(data => setCategories(data)).catch(console.error);
    fetch(`${API_URL}/cities`).then(r => r.json()).then(data => setCities(data)).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = `${API_URL}/listings/search?`;
    if (termParam) url += `term=${encodeURIComponent(termParam)}&`;
    if (cityParam) url += `cityId=${cityParam}&`;
    if (categoryParam) url += `categoryId=${categoryParam}&`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setListings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [searchParams]);

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }

    // Cascading parameter clears
    if (key === 'state') {
      newParams.delete('cityId');
      newParams.delete('area');
    } else if (key === 'cityId') {
      newParams.delete('area');
    }

    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleOpenInquiry = (listing) => {
    setActiveInquiryListing(listing);
    setInquirySuccess('');
    setInquiryError('');
    setInquiryMsg(`I am interested in your products/services. Please send me more details regarding prices and catalogs.`);
  };

  const handleCloseInquiry = () => {
    setActiveInquiryListing(null);
    setInquiryName('');
    setInquiryEmail('');
    setInquiryPhone('');
    setInquiryMsg('');
  };

  const submitInquiry = async (e) => {
    e.preventDefault();
    setInquiryError('');
    setInquirySuccess('');
    setSubmittingInquiry(true);

    try {
      const response = await fetch(`${API_URL}/listings/${activeInquiryListing.id}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: inquiryName,
          senderEmail: inquiryEmail,
          senderPhone: inquiryPhone,
          message: inquiryMsg
        })
      });

      if (!response.ok) {
        throw new Error('Could not submit inquiry. Please try again.');
      }

      setInquirySuccess("Your inquiry has been successfully sent. The listing owner will contact you shortly.");
      setTimeout(() => {
        handleCloseInquiry();
      }, 2500);

    } catch (err) {
      setInquiryError(err.message);
    } finally {
      setSubmittingInquiry(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>B2B Search Results</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Found {filteredListings.length} registered suppliers matching your criteria
        </p>
      </div>

      <div className="directory-layout">
        {/* Filters Sidebar */}
        <aside className="filter-sidebar">
          <div className="filter-group">
            <h3 className="filter-title">
              <span>Refine Results</span>
              <button 
                onClick={resetFilters} 
                style={{ fontSize: '0.75rem', background: 'transparent', border: 'none', color: 'var(--primary-light)', cursor: 'pointer', fontWeight: 600 }}
              >
                Clear All
              </button>
            </h3>
          </div>

          {/* Keyword search input */}
          <div className="filter-group">
            <label className="form-label">Search Keyword</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Keywords..."
                value={termParam}
                onChange={(e) => handleFilterChange('term', e.target.value)}
              />
            </div>
          </div>

          {/* State select dropdown */}
          <div className="filter-group">
            <label className="form-label">State</label>
            <select
              className="filter-select"
              value={stateParam}
              onChange={(e) => handleFilterChange('state', e.target.value)}
            >
              <option value="">All States</option>
              {uniqueStates.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* City select dropdown */}
          <div className="filter-group">
            <label className="form-label">City / Location</label>
            <select
              className="filter-select"
              value={cityParam}
              onChange={(e) => handleFilterChange('cityId', e.target.value)}
            >
              <option value="">All Cities</option>
              {filteredCities.map((city) => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>

          {/* Area select dropdown */}
          {areasForSelectedCity.length > 0 && (
            <div className="filter-group">
              <label className="form-label">Area / Locality</label>
              <select
                className="filter-select"
                value={areaParam}
                onChange={(e) => handleFilterChange('area', e.target.value)}
              >
                <option value="">All Areas</option>
                {areasForSelectedCity.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          )}

          {/* Category select dropdown */}
          <div className="filter-group">
            <label className="form-label">Industry Category</label>
            <select
              className="filter-select"
              value={categoryParam}
              onChange={(e) => handleFilterChange('categoryId', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </aside>

        {/* Listings Grid */}
        <main>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
              <RefreshCw className="animate-spin" size={36} color="var(--primary-light)" />
              <p style={{ color: 'var(--text-muted)' }}>Searching directory...</p>
            </div>
          ) : filteredListings.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filteredListings.map((item) => (
                <div key={item.id} className="listing-card" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {/* Company Logo mock badge */}
                  <div style={{ width: '100px', height: '100px', margin: '1.5rem', background: '#e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 800, fontSize: '1.75rem', alignSelf: 'flex-start', overflow: 'hidden' }}>
                    {item.logoUrl ? (
                      <img src={item.logoUrl.startsWith('/uploads') ? `http://localhost:8080${item.logoUrl}` : item.logoUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : item.name.charAt(0)}
                  </div>

                  {/* Body details */}
                  <div className="listing-card-body" style={{ paddingLeft: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div className="listing-meta">
                          <Tag size={12} /> {item.category?.name}
                        </div>
                        <h3 className="listing-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                          <Link to={`/listings/${item.id}`}>{item.name}</Link>
                          {item.isVerified && (
                            <span title="Verified Supplier" style={{ display: 'inline-flex', alignSelf: 'center' }}>
                              <Award size={18} color="#10b981" fill="#d1fae5" />
                            </span>
                          )}
                        </h3>
                      </div>
                      
                      {/* Star Rating */}
                      <div className="rating-container" style={{ background: '#fef3c7', padding: '0.25rem 0.65rem', borderRadius: '6px' }}>
                        <Star size={14} className="rating-star" fill="var(--secondary)" />
                        <span>{item.rating > 0 ? item.rating.toFixed(1) : 'New'}</span>
                      </div>
                    </div>

                    <p className="listing-description" style={{ marginTop: '0.75rem' }}>
                      {item.description || "Leading industry solutions, custom manufacturing capabilities, and responsive commercial timelines."}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={14} /> {item.area ? `${item.area}, ` : ''}{item.city?.name}, {item.city?.state}
                      </span>
                      {item.contactPhone && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Phone size={14} /> {item.contactPhone}
                        </span>
                      )}
                    </div>

                    {/* Listing Action buttons */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
                      <Link to={`/listings/${item.id}`}>
                        <button className="nav-btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', color: 'var(--primary)' }}>
                          View Details
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleOpenInquiry(item)}
                        className="nav-btn" 
                        style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', background: 'var(--secondary)', color: 'var(--bg-dark)' }}
                      >
                        Send Inquiry
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <Building2 size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
              <h3>No Listings Found</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                We couldn't find any suppliers matching your search terms. Try modifying your filters or keywords.
              </p>
              <button onClick={resetFilters} className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1.5rem' }}>
                Reset Search Filters
              </button>
            </div>
          )}
        </main>

        {/* Sticky Map Side Panel */}
        <aside style={{ position: 'sticky', top: '100px', height: 'calc(100vh - 140px)', minHeight: '400px' }}>
          <MapComponent 
            listings={filteredListings} 
            selectedCityName={selectedCityName} 
            selectedAreaName={areaParam} 
          />
        </aside>
      </div>

      {/* Inquiry Lead Modal */}
      {activeInquiryListing && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ background: 'var(--primary)', color: '#ffffff', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#ffffff', margin: 0, fontSize: '1.15rem' }}>Send Inquiry to Seller</h3>
              <button onClick={handleCloseInquiry} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={submitInquiry} style={{ padding: '1.5rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', borderLeft: '4px solid var(--secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Recipient: <strong>{activeInquiryListing.name}</strong> ({activeInquiryListing.city?.name})
              </div>

              {inquirySuccess && (
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '0.75rem', borderRadius: '8px', color: '#166534', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <CheckCircle size={16} /> <span>{inquirySuccess}</span>
                </div>
              )}

              {inquiryError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '0.75rem', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <AlertCircle size={16} /> <span>{inquiryError}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your full name"
                  required
                  value={inquiryName}
                  onChange={(e) => setInquiryName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  required
                  value={inquiryEmail}
                  onChange={(e) => setInquiryEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter mobile number"
                  value={inquiryPhone}
                  onChange={(e) => setInquiryPhone(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Inquiry Message</label>
                <textarea
                  rows="4"
                  className="form-control"
                  placeholder="Describe your requirement in detail (e.g. quantity, specifications)"
                  required
                  value={inquiryMsg}
                  onChange={(e) => setInquiryMsg(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={submittingInquiry}>
                {submittingInquiry ? 'Sending Lead...' : 'Send Inquiry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
