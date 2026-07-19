import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ShoppingBag, MailCheck, User, Award, ShieldAlert, BadgeInfo, CheckCircle2, AlertCircle, Plus, Trash2, CheckSquare, Eye, Upload } from 'lucide-react';

const CITY_AREAS = {
  "Chennai": ["Adyar", "Velachery", "T. Nagar", "Anna Nagar", "Guindy", "OMR", "Mylapore", "Tambaram", "Chromepet", "Nungambakkam"],
  "Coimbatore": ["Gandhipuram", "Peelamedu", "RS Puram", "Singanallur", "Saibaba Colony", "Saravanampatti", "Kovaipudur"],
  "Bengaluru": ["Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "Jayanagar", "Electronic City", "Marathahalli", "BTM Layout"],
  "Mumbai": ["Andheri", "Bandra", "Colaba", "Borivali", "Dadar", "Thane", "Vashi", "Juhu", "Kurla"],
  "Delhi": ["Connaught Place", "Dwarka", "Saket", "Karol Bagh", "Vasant Kunj", "Rajouri Garden", "Lajpat Nagar", "Rohini"],
  "Pune": ["Kothrud", "Koregaon Park", "Hinjewadi", "Viman Nagar", "Baner", "Hadapsar"],
  "Hyderabad": ["Gachibowli", "Madhapur", "Jubilee Hills", "Banjara Hills", "Secunderabad", "Kondapur"],
  "Kolkata": ["Salt Lake", "New Town", "Park Street", "Howrah", "Tollygunge", "Garia"],
  "Jaipur": ["Malviya Nagar", "Vaishali Nagar", "C Scheme", "Mansarovar", "Raja Park"],
  "Ahmedabad": ["Satellite", "C G Road", "Vastrapur", "Bodakdev", "Bapunagar", "Ghatlodia"],
  "Surat": ["Varachha", "Adajan", "Piplod", "Vesu", "Katargam"],
  "Noida": ["Sector 62", "Sector 18", "Sector 15", "Sector 137"],
  "Gurugram": ["DLF Phase 3", "Sector 45", "Sohna Road", "Golf Course Road"],
  "Vadodara": ["Alkapuri", "Akota", "Gotri", "Manjalpur"],
  "Ludhiana": ["Model Town", "Civil Lines", "Sarabha Nagar", "Ferozepur Road"]
};

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const logoInputRef = useRef(null);
  const productImgInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
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
  const [cityInputVal, setCityInputVal] = useState('');
  const [bizState, setBizState] = useState('');
  const [bizArea, setBizArea] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizPhone2, setBizPhone2] = useState('');
  const [bizPhone3, setBizPhone3] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  const [bizEmail2, setBizEmail2] = useState('');
  const [bizEmail3, setBizEmail3] = useState('');
  const [bizWeb, setBizWeb] = useState('');
  const [bizLogo, setBizLogo] = useState('');
  const [bizGst, setBizGst] = useState('');
  const [bizSuccess, setBizSuccess] = useState('');
  const [bizError, setBizError] = useState('');
  const [businessUsers, setBusinessUsers] = useState([]);
  const [bizUserId, setBizUserId] = useState('');
  const [bizOwnerUsername, setBizOwnerUsername] = useState('');

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
    if (user.role === 'ROLE_ADMIN' || user.role === 'ROLE_SUPER_ADMIN') {
      navigate('/admin');
      return;
    }
    // Load category and city helpers
    fetch(`${API_URL}/categories`).then(r => r.json()).then(setCategories).catch(console.error);
    fetch(`${API_URL}/cities`).then(r => r.json()).then(setCities).catch(console.error);

    if (user.role === 'ROLE_EMPLOYEE') {
      fetch(`${API_URL}/listings/business-users`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
        .then(r => r.json())
        .then(setBusinessUsers)
        .catch(console.error);
    }

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
          const currentId = selectedListing ? selectedListing.id : null;
          // Look for previously selected listing, otherwise default to first in list
          const biz = (currentId && data.find(b => b.id === currentId)) || data[0];
          setSelectedListing(biz);
          // Pre-populate fields
          setBizName(biz.name);
          setBizDesc(biz.description || '');
          setBizCatId(biz.category?.id || '');
          setBizCityId(biz.city?.id || '');
          setCityInputVal(biz.city?.name || '');
          setBizState(biz.city?.state || '');
          setBizArea(biz.area || '');
          setBizAddress(biz.address || '');
          setBizPhone(biz.contactPhone || '');
          setBizPhone2(biz.contactPhone2 || '');
          setBizPhone3(biz.contactPhone3 || '');
          setBizEmail(biz.contactEmail || '');
          setBizEmail2(biz.contactEmail2 || '');
          setBizEmail3(biz.contactEmail3 || '');
          setBizWeb(biz.website || '');
          setBizLogo(biz.logoUrl || '');
          setBizGst(biz.gstNumber || '');
          setBizUserId(biz.user?.id || '');
          setBizOwnerUsername(biz.user?.username || '');

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

  const handleAddNewListing = () => {
    setSelectedListing(null);
    setBizName('');
    setBizDesc('');
    setBizCatId('');
    setBizCityId('');
    setCityInputVal('');
    setBizState('');
    setBizArea('');
    setBizAddress('');
    setBizPhone('');
    setBizPhone2('');
    setBizPhone3('');
    setBizEmail('');
    setBizEmail2('');
    setBizEmail3('');
    setBizWeb('');
    setBizLogo('');
    setBizGst('');
    setBizUserId('');
    setBizOwnerUsername('');
    setProducts([]);
    setInquiries([]);
  };

  // Submit Listing Update or Creation
  const handleSaveListing = async (e) => {
    e.preventDefault();
    setBizError('');
    setBizSuccess('');

    let cityIdToSubmit = bizCityId;
    let finalUserId = bizUserId ? parseInt(bizUserId) : null;

    if (user.role === 'ROLE_EMPLOYEE') {
      if (!bizOwnerUsername.trim()) {
        throw new Error("Please specify a business owner username.");
      }
      const matchedUser = businessUsers.find(
        u => u.username.toLowerCase() === bizOwnerUsername.trim().toLowerCase()
      );
      if (!matchedUser) {
        throw new Error(`Username "${bizOwnerUsername}" not found. Please enter a valid registered business owner's username.`);
      }
      finalUserId = matchedUser.id;
    }

    try {
      // If the city is custom/new, create it first
      if (bizCityId === 'NEW' || !bizCityId) {
        if (!cityInputVal.trim()) {
          throw new Error("Please specify a city name.");
        }
        const createCityRes = await fetch(`${API_URL}/cities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({
            name: cityInputVal.trim(),
            state: bizState
          })
        });

        if (!createCityRes.ok) {
          throw new Error("Failed to register new city location.");
        }

        const createdCity = await createCityRes.json();
        cityIdToSubmit = createdCity.id.toString();
        setBizCityId(cityIdToSubmit);
        
        // Refresh local cities array
        const citiesRes = await fetch(`${API_URL}/cities`);
        if (citiesRes.ok) {
          const freshCities = await citiesRes.json();
          setCities(freshCities);
        }
      }

      const url = selectedListing ? `${API_URL}/listings/${selectedListing.id}` : `${API_URL}/listings`;
      const method = selectedListing ? 'PUT' : 'POST';

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
          cityId: parseInt(cityIdToSubmit),
          address: bizAddress,
          contactPhone: bizPhone,
          contactPhone2: bizPhone2 || null,
          contactPhone3: bizPhone3 || null,
          contactEmail: bizEmail,
          contactEmail2: bizEmail2 || null,
          contactEmail3: bizEmail3 || null,
          website: bizWeb,
          logoUrl: bizLogo,
          gstNumber: bizGst || null,
          area: bizArea,
          userId: finalUserId
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

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      if (!res.ok) {
        throw new Error("Failed to upload logo image.");
      }

      const data = await res.json();
      setBizLogo(data.url);
      setBizSuccess("Logo uploaded successfully!");
    } catch (err) {
      setBizError(err.message);
    }
  };

  const handleProductImgUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      if (!res.ok) {
        throw new Error("Failed to upload product image.");
      }

      const data = await res.json();
      setProdImg(data.url);
      setProdSuccess("Product image uploaded successfully!");
    } catch (err) {
      setProdError(err.message);
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

  return (
    <div className="dashboard-layout">
      {/* Sidebar Panel Navigation */}
      <aside className="dashboard-sidebar">
        <div style={{ padding: '0 1rem 1.5rem 1rem', borderBottom: '1px solid #1e293b', marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#ffffff', fontSize: '1.1rem' }}>Supplier Center</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>B2B Dashboard</span>
        </div>

        {(user.role === 'ROLE_EMPLOYEE' || (user.role === 'ROLE_BUSINESS' && myListings.length > 1)) && (
          <div style={{ padding: '0 1rem 1.5rem 1rem', borderBottom: '1px solid #1e293b', marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'var(--text-light)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Active Listing Workspace:</label>
            <select
              value={selectedListing ? selectedListing.id : ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  handleAddNewListing();
                } else {
                  const biz = myListings.find(b => b.id === parseInt(val));
                  setSelectedListing(biz);
                  setBizName(biz.name);
                  setBizDesc(biz.description || '');
                  setBizCatId(biz.category?.id || '');
                  setBizCityId(biz.city?.id || '');
                  setCityInputVal(biz.city?.name || '');
                  setBizState(biz.city?.state || '');
                  setBizArea(biz.area || '');
                  setBizAddress(biz.address || '');
                  setBizPhone(biz.contactPhone || '');
                  setBizPhone2(biz.contactPhone2 || '');
                  setBizPhone3(biz.contactPhone3 || '');
                  setBizEmail(biz.contactEmail || '');
                  setBizEmail2(biz.contactEmail2 || '');
                  setBizEmail3(biz.contactEmail3 || '');
                  setBizWeb(biz.website || '');
                  setBizLogo(biz.logoUrl || '');
                  setBizGst(biz.gstNumber || '');
                  setBizUserId(biz.user?.id || '');
                  fetchProducts(biz.id);
                }
              }}
              className="form-control"
              style={{ padding: '0.45rem', fontSize: '0.85rem', background: '#f8fafc', color: 'var(--text-main)', border: '1px solid var(--border-hover)', width: '100%', borderRadius: '8px', fontWeight: 600 }}
            >
              {user.role === 'ROLE_EMPLOYEE' && <option value="">+ Add New Listing</option>}
              {myListings.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        <div
          onClick={() => setActiveTab('listing')}
          className={`dashboard-sidebar-item ${activeTab === 'listing' ? 'active' : ''}`}
        >
          <Building2 size={18} /> {selectedListing ? "Company Profile" : "Create Listing"}
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

                {selectedListing && !selectedListing.isApproved && (
                  <div style={{
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    color: '#92400e',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1rem' }}>
                      <AlertCircle size={20} color="#d97706" style={{ flexShrink: 0 }} />
                      <span>Listing Under Review (Approval Pending)</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#b45309', lineHeight: '1.5' }}>
                      Your company profile has been submitted and is currently **Pending Approval**. It will be visible in the public search directory once verified and approved by the platform administrators. You can still modify your details below.
                    </p>
                  </div>
                )}

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
                    {user.role === 'ROLE_EMPLOYEE' && (
                      <div className="form-group">
                        <label className="form-label">Associate with Business Owner (User Account Username) *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter registered business owner's username..."
                          required
                          value={bizOwnerUsername}
                          onChange={(e) => setBizOwnerUsername(e.target.value)}
                        />
                      </div>
                    )}

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
                      <label className="form-label">Company Logo / Image</label>
                      
                      {/* Hidden Input */}
                      <input
                        type="file"
                        ref={logoInputRef}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleLogoUpload}
                      />

                      {/* Clickable Custom Upload Box Container */}
                      <div 
                        onClick={() => logoInputRef.current.click()}
                        style={{ 
                          border: '1px dashed var(--border-hover)', 
                          borderRadius: '14px', 
                          padding: '1.25rem', 
                          background: '#ffffff',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ 
                            width: '42px', 
                            height: '42px', 
                            borderRadius: '50%', 
                            background: '#EFF6FF', 
                            color: '#3B82F6', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}>
                            <Upload size={20} />
                          </div>
                          <div>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Company Logo Upload</p>
                            <p style={{ fontSize: '9px', color: '#94a3b8', margin: '2px 0 0 0' }}>Drag & drop or click • Single file • Max 5MB</p>
                          </div>
                        </div>

                        {bizLogo && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setPreviewImage(bizLogo)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px'
                              }}
                              title="View Logo"
                            >
                              <Eye size={18} />
                            </button>
                            <img 
                              src={bizLogo.startsWith('/uploads') ? `http://localhost:8080${bizLogo}` : bizLogo} 
                              alt="Logo Preview" 
                              style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-hover)' }} 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">GST Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 22AAAAA0000A1Z5 (Optional)"
                        value={bizGst}
                        onChange={(e) => setBizGst(e.target.value.toUpperCase())}
                        maxLength={15}
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
                      <label className="form-label">State *</label>
                      <select
                        className="form-control"
                        required
                        value={bizState}
                        onChange={(e) => {
                          const stateVal = e.target.value;
                          setBizState(stateVal);
                          setBizCityId('');
                          setCityInputVal('');
                          setBizArea('');
                        }}
                      >
                        <option value="">Select State</option>
                        {[...new Set(cities.map(c => c.state))].sort().map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">City Location *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Type or select city..."
                        value={cityInputVal}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCityInputVal(val);
                          
                          // Check if it matches an existing city for the selected state
                          const match = cities.find(c => c.state === bizState && c.name.toLowerCase() === val.toLowerCase().trim());
                          if (match) {
                            setBizCityId(match.id.toString());
                          } else {
                            setBizCityId('NEW');
                          }
                        }}
                        disabled={!bizState}
                        list="city-suggestions"
                        required
                      />
                      <datalist id="city-suggestions">
                        {cities.filter(c => c.state === bizState).map(city => (
                          <option key={city.id} value={city.name} />
                        ))}
                      </datalist>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Area / Location *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Type or select area..."
                        value={bizArea}
                        onChange={(e) => setBizArea(e.target.value)}
                        disabled={!bizCityId}
                        list="area-suggestions"
                        required
                      />
                      <datalist id="area-suggestions">
                        {(() => {
                          const selectedCityObj = cities.find(c => c.id === parseInt(bizCityId));
                          const cityName = selectedCityObj ? selectedCityObj.name : '';
                          const areas = CITY_AREAS[cityName] || ["Downtown", "Industrial Area", "Main Market", "Suburbs", "Central Business District"];
                          return areas.map(ar => (
                            <option key={ar} value={ar} />
                          ));
                        })()}
                      </datalist>
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Contact Phone *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Primary phone (Mandatory)"
                        required
                        value={bizPhone}
                        onChange={(e) => setBizPhone(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Contact Phone 2</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Alternative phone 2"
                        value={bizPhone2}
                        onChange={(e) => setBizPhone2(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Contact Phone 3</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Alternative phone 3"
                        value={bizPhone3}
                        onChange={(e) => setBizPhone3(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Contact Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Primary email (Mandatory)"
                        required
                        value={bizEmail}
                        onChange={(e) => setBizEmail(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Contact Email 2</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Alternative email 2"
                        value={bizEmail2}
                        onChange={(e) => setBizEmail2(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Contact Email 3</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Alternative email 3"
                        value={bizEmail3}
                        onChange={(e) => setBizEmail3(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
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
                              src={prod.imageUrl ? (prod.imageUrl.startsWith('/uploads') ? 'http://localhost:8080' + prod.imageUrl : prod.imageUrl) : "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300"}
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
                      <label className="form-label">Product Image</label>
                      
                      {/* Hidden Input */}
                      <input
                        type="file"
                        ref={productImgInputRef}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleProductImgUpload}
                      />

                      {/* Clickable Custom Upload Box Container */}
                      <div 
                        onClick={() => productImgInputRef.current.click()}
                        style={{ 
                          border: '1px dashed var(--border-hover)', 
                          borderRadius: '14px', 
                          padding: '1.25rem', 
                          background: '#ffffff',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ 
                            width: '42px', 
                            height: '42px', 
                            borderRadius: '50%', 
                            background: '#EFF6FF', 
                            color: '#3B82F6', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}>
                            <Upload size={20} />
                          </div>
                          <div>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Product Image Upload</p>
                            <p style={{ fontSize: '9px', color: '#94a3b8', margin: '2px 0 0 0' }}>Drag & drop or click • Single file • Max 5MB</p>
                          </div>
                        </div>

                        {prodImg && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setPreviewImage(prodImg)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px'
                              }}
                              title="View Product Image"
                            >
                              <Eye size={18} />
                            </button>
                            <img 
                              src={prodImg.startsWith('/uploads') ? `http://localhost:8080${prodImg}` : prodImg} 
                              alt="Product Preview" 
                              style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-hover)' }} 
                            />
                          </div>
                        )}
                      </div>
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

      {/* Photo Preview Modal */}
      {previewImage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{
            background: '#ffffff',
            padding: '1.5rem',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            position: 'relative',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'var(--text-light)',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}
            >
              &times;
            </button>
            <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontWeight: 700 }}>Photo Preview</h4>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)', minHeight: '200px' }}>
              <img
                src={previewImage.startsWith('/uploads') ? `http://localhost:8080${previewImage}` : previewImage}
                alt="Uploaded Preview"
                style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
