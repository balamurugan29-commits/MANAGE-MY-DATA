import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, Award, Star, ShoppingBag, MessageSquare, Send, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import MapComponent from '../components/MapComponent';

export default function Details() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inquiry Form
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('Please send me more details regarding prices and catalogs.');
  const [inquirySuccess, setInquirySuccess] = useState('');
  const [inquiryError, setInquiryError] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  // Review Form
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const API_URL = 'http://localhost:8080/api';

  const fetchData = () => {
    setLoading(true);
    // Fetch business details
    fetch(`${API_URL}/listings/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Listing not found.");
        return res.json();
      })
      .then(data => {
        setBusiness(data);
        
        // Fetch products
        fetch(`${API_URL}/listings/${id}/products`)
          .then(r => r.json())
          .then(prods => setProducts(prods))
          .catch(console.error);

        // Fetch reviews
        fetch(`${API_URL}/listings/${id}/reviews`)
          .then(r => r.json())
          .then(revs => setReviews(revs))
          .catch(console.error);

        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setInquiryError('');
    setInquirySuccess('');
    setSubmittingInquiry(true);

    try {
      const res = await fetch(`${API_URL}/listings/${id}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: inquiryName,
          senderEmail: inquiryEmail,
          senderPhone: inquiryPhone,
          message: inquiryMsg
        })
      });

      if (!res.ok) throw new Error("Could not send lead inquiry.");
      
      setInquirySuccess("Inquiry sent successfully!");
      setInquiryName('');
      setInquiryEmail('');
      setInquiryPhone('');
      setInquiryMsg('Please send me more details regarding prices and catalogs.');
    } catch (err) {
      setInquiryError(err.message);
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    setSubmittingReview(true);

    try {
      const res = await fetch(`${API_URL}/listings/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: reviewName,
          rating: reviewRating,
          comment: reviewComment
        })
      });

      if (!res.ok) throw new Error("Could not submit review.");
      
      setReviewSuccess("Review submitted successfully!");
      setReviewName('');
      setReviewRating(5);
      setReviewComment('');
      
      // Refresh business rating data & reviews list
      fetchData();
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '1rem' }}>
        <RefreshCw className="animate-spin" size={36} color="var(--primary-light)" />
        <p style={{ color: 'var(--text-muted)' }}>Loading business profile...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <h2 style={{ color: '#b91c1c' }}>Listing Not Found</h2>
        <p>The company directory listing you requested does not exist or may have been removed.</p>
        <Link to="/search" className="btn-primary" style={{ display: 'inline-block', width: 'auto', padding: '0.5rem 1.5rem', marginTop: '1rem' }}>
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Visual Header */}
      <section className="business-detail-header">
        <div className="container" style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Logo Badge mock */}
          <div style={{ width: '120px', height: '120px', background: '#ffffff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 800, fontSize: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
            {business.name.charAt(0)}
          </div>
          
          <div style={{ flex: 1 }}>
            <span style={{ background: 'rgba(251,191,36,0.2)', color: 'var(--secondary)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              {business.category?.name}
            </span>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              {business.name}
              {business.isVerified && (
                <Award size={28} color="#10b981" fill="#d1fae5" title="Verified Seller" />
              )}
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Star size={16} fill="var(--secondary)" color="var(--secondary)" />
                <span style={{ fontWeight: 600 }}>{business.rating > 0 ? business.rating.toFixed(1) : 'New Listing'}</span>
                <span style={{ color: '#94a3b8' }}>({reviews.length} reviews)</span>
              </div>
              
              <span>&bull;</span>
              
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#cbd5e1' }}>
                <MapPin size={16} /> {business.city?.name}, {business.city?.state}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid split */}
      <section className="container" style={{ paddingBottom: '4rem' }}>
        <div className="business-detail-grid">
          {/* Left section: About, Products, Reviews */}
          <div>
            {/* About description */}
            <div className="business-detail-section">
              <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                About Company
              </h2>
              <p style={{ whiteSpace: 'pre-line', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                {business.description || "Leading provider in this category. Focused on delivering premium specifications, high grade execution pipelines, and ensuring responsive customer communication timelines."}
              </p>
            </div>

            {/* Products grid catalog */}
            <div className="business-detail-section">
              <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingBag size={20} /> Products & Services Catalog
              </h2>
              
              {products.length > 0 ? (
                <div className="product-grid">
                  {products.map((prod) => (
                    <div key={prod.id} className="product-card">
                      <img 
                        src={prod.imageUrl || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300"} 
                        alt={prod.name} 
                        className="product-img"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300";
                        }}
                      />
                      <h4 style={{ fontSize: '0.95rem', margin: '0.5rem 0 0.25rem 0' }}>{prod.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px', marginBottom: '0.5rem' }}>
                        {prod.description || "Premium B2B industrial component specifications."}
                      </p>
                      <div style={{ color: 'var(--primary-light)', fontWeight: 700, fontSize: '0.95rem' }}>
                        {prod.price ? `₹${prod.price.toLocaleString('en-IN')}` : "Ask for Quote"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>
                  No catalog products listed yet. Send an inquiry to ask about their offerings.
                </p>
              )}
            </div>

            {/* Reviews Section */}
            <div className="business-detail-section">
              <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={20} /> Customer Reviews
              </h2>

              {/* Reviews listing */}
              <div style={{ marginBottom: '2.5rem' }}>
                {reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <div key={rev.id} className="review-item">
                      <div className="review-meta">
                        <span className="review-author">{rev.userName}</span>
                        <div style={{ display: 'flex', gap: '0.1rem', color: 'var(--secondary)' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              fill={i < rev.rating ? "var(--secondary)" : "none"} 
                              color="var(--secondary)" 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="review-comment">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>No customer reviews posted yet. Be the first to review!</p>
                )}
              </div>

              {/* Add review form */}
              <form onSubmit={handleReviewSubmit} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Write a Review</h3>

                {reviewSuccess && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '0.75rem', borderRadius: '8px', color: '#166534', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <CheckCircle2 size={16} /> <span>{reviewSuccess}</span>
                  </div>
                )}

                {reviewError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '0.75rem', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <AlertCircle size={16} /> <span>{reviewError}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Enter name"
                      required
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Rating</label>
                    <select 
                      className="form-control" 
                      value={reviewRating}
                      onChange={(e) => setReviewRating(parseInt(e.target.value))}
                    >
                      <option value="5">5 Stars (Excellent)</option>
                      <option value="4">4 Stars (Very Good)</option>
                      <option value="3">3 Stars (Average)</option>
                      <option value="2">2 Stars (Poor)</option>
                      <option value="1">1 Star (Terrible)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Review Comment</label>
                  <textarea 
                    rows="3" 
                    className="form-control" 
                    placeholder="Share your experience working with this supplier..."
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.5rem 2rem' }} disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            </div>
          </div>

          {/* Right sidebar: Contacts & Inquiry */}
          <div>
            <div className="inquiry-sidebar-card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                Contact Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <MapPin size={18} style={{ color: 'var(--primary-light)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Address</strong>
                    <div style={{ color: 'var(--text-muted)', marginTop: '0.15rem' }}>{business.address || "Industrial Area Phase 2"}</div>
                    <div style={{ color: 'var(--text-muted)' }}>{business.city?.name}, {business.city?.state}</div>
                  </div>
                </div>

                {business.contactPhone && (
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <Phone size={18} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
                    <div>
                      <strong>Phone</strong>
                      <div style={{ color: 'var(--text-muted)', marginTop: '0.15rem' }}>{business.contactPhone}</div>
                    </div>
                  </div>
                )}

                {business.contactEmail && (
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <Mail size={18} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
                    <div>
                      <strong>Email</strong>
                      <div style={{ color: 'var(--text-muted)', marginTop: '0.15rem' }}>{business.contactEmail}</div>
                    </div>
                  </div>
                )}

                {business.website && (
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <Globe size={18} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
                    <div>
                      <strong>Website</strong>
                      <div style={{ color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        <a href={business.website.startsWith('http') ? business.website : `https://${business.website}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-light)' }}>
                          {business.website}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Interactive Map */}
              <div style={{ height: '220px', width: '100%', marginBottom: '2rem' }}>
                <MapComponent listings={[business]} selectedCityName={business.city?.name} />
              </div>

              {/* Inquiry Lead Form */}
              <form onSubmit={handleInquirySubmit} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Send size={16} /> Send Buyer Inquiry
                </h4>

                {inquirySuccess && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '0.75rem', borderRadius: '8px', color: '#166534', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <CheckCircle2 size={16} /> <span>{inquirySuccess}</span>
                  </div>
                )}

                {inquiryError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '0.75rem', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <AlertCircle size={16} /> <span>{inquiryError}</span>
                  </div>
                )}

                <div className="form-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Your Name" 
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="Your Email" 
                    required
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Mobile Number (Optional)"
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <textarea 
                    rows="3" 
                    className="form-control" 
                    placeholder="Describe your buying requirement..."
                    required
                    value={inquiryMsg}
                    onChange={(e) => setInquiryMsg(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={submittingInquiry}>
                  {submittingInquiry ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
