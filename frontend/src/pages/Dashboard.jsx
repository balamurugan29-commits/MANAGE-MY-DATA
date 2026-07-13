import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ShoppingBag, MailCheck, User, Award, ShieldAlert, BadgeInfo, CheckCircle2, AlertCircle, Plus, Trash2, CheckSquare } from 'lucide-react';

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('listing'); // listing, products, inquiries
  
  // Listings state
  const [myListings, setMyListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);

  // Form states (Listing)
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [bizName, setBizName] = useState('');
  const [bizDesc, setBizDesc] = useState('');
  const [bizCatId, setBizCatId] = useState('');
  const [bizCityId, setBizCityId] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  const [bizWeb, setBizWeb] = useState('');
  const [bizLogo, setBizLogo] = useState('');
  const [bizSuccess, setBizSuccess] = useState('');
  const [bizError, setBizError] = useState('');

  // Form states (Products)
  const [products, setProducts] = useState([]);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImg, setProdImg] = useState('');
  const [prodSuccess, setProdSuccess] = useState('');
  const [prodError, setProdError] = useState('');

  // Inquiries state
  const [inquiries, setInquiries] = useState([]);

  const API_URL = 'http://localhost:8080/api';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'ROLE_ADMIN' && user.role !== 'ROLE_SUPER_ADMIN') {
      return;
    }

    // Load category and city helpers
    fetch(`${API_URL}/categories`).then(r => r.json()).then(setCategories).catch(console.error);
    fetch(`${API_URL}/cities`).then(r => r.json()).then(setCities).catch(console.error);

    fetchListings();
  }, [user]);

  const fetchListings = async () => {
    setLoadingListings(true);
    try {
      const res = await fetch(`${API_URL}/listings`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyListings(data);
        if (data.length > 0) {
          const biz = data[0];
          setSelectedListing(biz);
          // Pre-populate fields
          setBizName(biz.name);
          setBizDesc(biz.description || '');
          setBizCatId(biz.category?.id || '');
          setBizCityId(biz.city?.id || '');
          setBizAddress(biz.address || '');
          setBizPhone(biz.contactPhone || '');
          setBizEmail(biz.contactEmail || '');
          setBizWeb(biz.website || '');
          setBizLogo(biz.logoUrl || '');

          // Fetch products & inquiries for this business
          fetchProducts(biz.id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingListings(false);
    }
  };

  const fetchProducts = (businessId) => {
    fetch(`${API_URL}/listings/${businessId}/products`)
      .then(r => r.json())
      .then(setProducts)
      .catch(console.error);

    // Also fetch inquiries
    fetch(`${API_URL}/inquiries`, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
      .then(r => r.json())
      .then(setInquiries)
      .catch(console.error);
  };

  // Submit Listing Update or Creation
  const handleSaveListing = async (e) => {
    e.preventDefault();
    setBizError('');
    setBizSuccess('');

    const url = selectedListing ? `${API_URL}/listings/${selectedListing.id}` : `${API_URL}/listings`;
    const method = selectedListing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          name: bizName,
          description: bizDesc,
          categoryId: parseInt(bizCatId),
          cityId: parseInt(bizCityId),
          address: bizAddress,
          contactPhone: bizPhone,
          contactEmail: bizEmail,
          website: bizWeb,
          logoUrl: bizLogo
        })
      });

      if (!res.ok) {
        throw new Error("Failed to save business listing. Review inputs.");
      }

      setBizSuccess(selectedListing ? "Business listing updated successfully!" : "Listing submitted! Pending Admin Approval.");
      fetchListings();
    } catch (err) {
      setBizError(err.message);
    }
  };

  // Add Product to Listing Catalog
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setProdError('');
    setProdSuccess('');

    if (!selectedListing) return;

    try {
      const res = await fetch(`${API_URL}/listings/${selectedListing.id}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          name: prodName,
          description: prodDesc,
          price: prodPrice ? parseFloat(prodPrice) : null,
          imageUrl: prodImg
        })
      });

      if (!res.ok) throw new Error("Could not add product.");

      setProdSuccess("Product added to catalog!");
      setProdName('');
      setProdDesc('');
      setProdPrice('');
      setProdImg('');
      fetchProducts(selectedListing.id);
    } catch (err) {
      setProdError(err.message);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm("Are you sure you want to remove this product from your catalog?")) return;
    try {
      const res = await fetch(`${API_URL}/listings/${selectedListing.id}/products/${prodId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        fetchProducts(selectedListing.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mark Inquiry Lead as Read
  const handleMarkInquiryRead = async (inqId) => {
    try {
      const res = await fetch(`${API_URL}/inquiries/${inqId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        // Refresh inquiries
        fetchProducts(selectedListing.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  if (user.role !== 'ROLE_ADMIN' && user.role !== 'ROLE_SUPER_ADMIN') {
    return (
      <div className="container" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', padding: '3rem 2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-md)' }}>
          <ShieldAlert size={48} style={{ color: 'var(--accent-red)', marginBottom: '1rem' }} />
          <h3>Data Entry Access Restricted</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            Only **Administrators** are authorized to perform data entry, create new listings, or upload product catalogs on MANAGE MY DATA.
          </p>
          <button onClick={() => navigate('/')} className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1.5rem' }}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar Panel Navigation */}
      <aside className="dashboard-sidebar">
        <div style={{ padding: '0 1rem 1.5rem 1rem', borderBottom: '1px solid #1e293b', marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#ffffff', fontSize: '1.1rem' }}>Supplier Center</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>B2B Dashboard</span>
        </div>

        <div
          onClick={() => setActiveTab('listing')}
          className={`dashboard-sidebar-item ${activeTab === 'listing' ? 'active' : ''}`}
        >
          <Building2 size={18} /> My Listing
        </div>

        {selectedListing && (
          <>
            <div
              onClick={() => setActiveTab('products')}
              className={`dashboard-sidebar-item ${activeTab === 'products' ? 'active' : ''}`}
            >
              <ShoppingBag size={18} /> Products Catalog
            </div>

            <div
              onClick={() => setActiveTab('inquiries')}
              className={`dashboard-sidebar-item ${activeTab === 'inquiries' ? 'active' : ''}`}
            >
              <MailCheck size={18} /> Buyer Leads ({inquiries.filter(i => i.status === 'PENDING').length})
            </div>
          </>
        )}
      </aside>

      {/* Main Panel Content */}
      <main className="dashboard-content">
        {loadingListings ? (
          <div>Loading workspace details...</div>
        ) : (
          <>
            {/* TAB: Listing Profile Setup/Edit */}
            {activeTab === 'listing' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                  <h2>Company Profile</h2>
                  {selectedListing && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <span className={`status-pill ${selectedListing.isApproved ? 'status-pill-green' : 'status-pill-orange'}`}>
                        {selectedListing.isApproved ? "Approved Listing" : "Approval Pending"}
                      </span>
                      {selectedListing.isVerified && (
                        <span className="status-pill status-pill-green" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Award size={12} /> Verified
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {!selectedListing && (
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1rem', borderRadius: '8px', color: '#1e3a8a', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <BadgeInfo size={20} />
                    <span>You haven't listed your business yet. Fill out the details below to publish your B2B directory profile!</span>
                  </div>
                )}

                {bizSuccess && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '0.75rem', borderRadius: '8px', color: '#166534', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <CheckCircle2 size={18} /> <span>{bizSuccess}</span>
                  </div>
                )}

                {bizError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '0.75rem', borderRadius: '8px', color: '#b91c1c', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <AlertCircle size={18} /> <span>{bizError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveListing} style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '2rem', borderRadius: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Company Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter official business name"
                        required
                        value={bizName}
                        onChange={(e) => setBizName(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Logo / Image URL</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Paste logo image URL link"
                        value={bizLogo}
                        onChange={(e) => setBizLogo(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Industry Category *</label>
                      <select
                        className="form-control"
                        required
                        value={bizCatId}
                        onChange={(e) => setBizCatId(e.target.value)}
                      >
                        <option value="">Select industry classification</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">City Location *</label>
                      <select
                        className="form-control"
                        required
                        value={bizCityId}
                        onChange={(e) => setBizCityId(e.target.value)}
                      >
                        <option value="">Select operation city</option>
                        {cities.map(city => (
                          <option key={city.id} value={city.id}>{city.name}, {city.state}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Company Description</label>
                    <textarea
                      rows="4"
                      className="form-control"
                      placeholder="Write details about your company, products, and services..."
                      value={bizDesc}
                      onChange={(e) => setBizDesc(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Office Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter street, office, suite details"
                      value={bizAddress}
                      onChange={(e) => setBizAddress(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="form-group">
                      <label className="form-label">Contact Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Office telephone/mobile"
                        value={bizPhone}
                        onChange={(e) => setBizPhone(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Contact Email</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Inquiry box email"
                        value={bizEmail}
                        onChange={(e) => setBizEmail(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Website URL</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="www.example.com"
                        value={bizWeb}
                        onChange={(e) => setBizWeb(e.target.value)}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.75rem 2.5rem' }}>
                    {selectedListing ? "Update Profile" : "Register Business Listing"}
                  </button>
                </form>
              </div>
            )}

            {/* TAB: Catalog Products list & add form */}
            {activeTab === 'products' && selectedListing && (
              <div>
                <h2 style={{ marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>Products & Services Catalog</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
                  {/* Catalog list */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>Active Products ({products.length})</h3>

                    {products.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {products.map(prod => (
                          <div key={prod.id} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', alignItems: 'center' }}>
                            <img
                              src={prod.imageUrl || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300"}
                              alt={prod.name}
                              style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover', background: '#f1f5f9' }}
                            />
                            <div style={{ flex: 1 }}>
                              <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{prod.name}</h4>
                              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{prod.description || "No description provided."}</p>
                              <span style={{ fontSize: '0.9rem', color: 'var(--primary-light)', fontWeight: 700 }}>
                                {prod.price ? `₹${prod.price.toLocaleString('en-IN')}` : "Ask for Quote"}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: '0.5rem' }}
                              title="Delete Product"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No products listed in catalog yet.</p>
                    )}
                  </div>

                  {/* Add form */}
                  <form onSubmit={handleAddProduct} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Plus size={18} /> Add New Catalog Item
                    </h3>

                    {prodSuccess && (
                      <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '0.75rem', borderRadius: '8px', color: '#166534', fontSize: '0.85rem', marginBottom: '1rem' }}>
                        {prodSuccess}
                      </div>
                    )}

                    {prodError && (
                      <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '0.75rem', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem', marginBottom: '1rem' }}>
                        {prodError}
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">Product/Service Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Submersible Pumps, Digital SEO"
                        required
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Price (INR)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 15000 (leave blank for Quote requests)"
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Product Image URL</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="https://images.com/pump.jpg"
                        value={prodImg}
                        onChange={(e) => setProdImg(e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label">Specifications / Details</label>
                      <textarea
                        rows="3"
                        className="form-control"
                        placeholder="Enter technical specifications, capacity, or scope details..."
                        value={prodDesc}
                        onChange={(e) => setProdDesc(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="btn-primary">Add to Catalog</button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB: Inquiries / Buyer Leads list */}
            {activeTab === 'inquiries' && selectedListing && (
              <div>
                <h2 style={{ marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>Buyer Leads & Inquiries</h2>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                  {inquiries.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {inquiries.map(inq => (
                        <div
                          key={inq.id}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '1.25rem',
                            background: inq.status === 'PENDING' ? 'rgba(251,191,36,0.03)' : '#ffffff',
                            borderLeft: inq.status === 'PENDING' ? '4px solid var(--secondary)' : '1px solid #e2e8f0',
                            transition: 'var(--transition)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <div>
                              <strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>{inq.senderName}</strong>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                {inq.senderEmail} {inq.senderPhone && ` | ${inq.senderPhone}`}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                                {new Date(inq.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                              </span>

                              {inq.status === 'PENDING' && (
                                <button
                                  onClick={() => handleMarkInquiryRead(inq.id)}
                                  className="nav-btn"
                                  style={{
                                    padding: '0.25rem 0.5rem',
                                    fontSize: '0.75rem',
                                    background: 'var(--primary-light)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.2rem'
                                  }}
                                >
                                  <CheckSquare size={12} /> Mark Read
                                </button>
                              )}

                              {inq.status === 'READ' && (
                                <span className="status-pill status-pill-green">Responded</span>
                              )}
                            </div>
                          </div>

                          <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.9rem', color: 'var(--text-main)', border: '1px solid #f1f5f9' }}>
                            {inq.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No buyer leads received yet. Build catalog and profiles to gain visibility!</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
