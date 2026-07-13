import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Building, Mail, MessageSquare, Award, CheckCircle, RefreshCw, BarChart2, UserPlus, Trash2, ShieldAlert } from 'lucide-react';

export default function Admin({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('moderation');

  // Super Admin specific state
  const [adminsList, setAdminsList] = useState([]);
  const [newAdminUser, setNewAdminUser] = useState({ username: '', email: '', password: '' });
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');

  const API_URL = 'http://localhost:8080/api';

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Fetch platform stats
      const statsRes = await fetch(`${API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch pending listings
      const pendingRes = await fetch(`${API_URL}/admin/pending`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingList(pendingData);
      }

      // Fetch admin accounts list if Super Admin
      if (user && user.role === 'ROLE_SUPER_ADMIN') {
        loadAdminsList();
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminsList = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users/admins`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminsList(data);
      }
    } catch (err) {
      console.error("Error fetching admins list:", err);
    }
  };

  useEffect(() => {
    if (!user || (user.role !== 'ROLE_ADMIN' && user.role !== 'ROLE_SUPER_ADMIN')) {
      navigate('/login');
      return;
    }
    loadAdminData();
  }, [user]);

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this company's directory listing?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/approve/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleVerify = async (id) => {
    try {
      const res = await fetch(`${API_URL}/admin/verify/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');

    if (!newAdminUser.username || !newAdminUser.email || !newAdminUser.password) {
      setAdminError('Please fill out all fields.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admin/users/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(newAdminUser)
      });

      if (res.ok) {
        setAdminSuccess(`Admin account "${newAdminUser.username}" created successfully!`);
        setNewAdminUser({ username: '', email: '', password: '' });
        loadAdminsList();
      } else {
        const errMsg = await res.text();
        setAdminError(errMsg || 'Failed to create admin account.');
      }
    } catch (err) {
      setAdminError('Connection error. Could not create admin.');
    }
  };

  const handleDeleteAdmin = async (id, adminUsername) => {
    if (!window.confirm(`Are you sure you want to delete the admin account "${adminUsername}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/admins/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (res.ok) {
        loadAdminsList();
      } else {
        const errMsg = await res.text();
        alert(errMsg || 'Failed to delete admin.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isSuperAdmin = user && user.role === 'ROLE_SUPER_ADMIN';

  if (!user || (user.role !== 'ROLE_ADMIN' && user.role !== 'ROLE_SUPER_ADMIN')) return null;

  return (
    <div className="container" style={{ padding: '2.5rem 1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Shield color="var(--primary-light)" /> Administration Console
            {isSuperAdmin && <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#dc2626', color: '#ffffff', borderRadius: '20px', fontWeight: 'bold' }}>SUPER ADMIN</span>}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Platform overview, business directory moderation and access control</p>
        </div>

        <button onClick={loadAdminData} className="nav-btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', borderColor: 'var(--primary)' }}>
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Tabs (Only visible for Super Admin) */}
      {isSuperAdmin && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: '#f8fafc', padding: '0.35rem', borderRadius: '8px', border: '1px solid #e2e8f0', maxWidth: '400px' }}>
          <button 
            onClick={() => setActiveTab('moderation')}
            style={{ 
              flex: 1, 
              padding: '0.5rem 1rem', 
              fontSize: '0.85rem', 
              fontWeight: 600, 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              background: activeTab === 'moderation' ? '#ffffff' : 'transparent',
              color: activeTab === 'moderation' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'moderation' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Moderation & Stats
          </button>
          <button 
            onClick={() => setActiveTab('admins')}
            style={{ 
              flex: 1, 
              padding: '0.5rem 1rem', 
              fontSize: '0.85rem', 
              fontWeight: 600, 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              background: activeTab === 'admins' ? '#ffffff' : 'transparent',
              color: activeTab === 'admins' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'admins' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Manage Admins
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Retrieving administrative data...</div>
      ) : (
        <div>
          {/* TAB 1: MODERATION & STATS */}
          {activeTab === 'moderation' && (
            <div>
              {/* Stats Grid */}
              {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--primary-light)', padding: '0.75rem', borderRadius: '8px' }}>
                      <Users size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Users</span>
                      <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats.totalUsers}</h3>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ background: 'rgba(30,58,138,0.1)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '8px' }}>
                      <Building size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Listings</span>
                      <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats.totalListings}</h3>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ background: 'rgba(251,191,36,0.1)', color: '#b45309', padding: '0.75rem', borderRadius: '8px' }}>
                      <BarChart2 size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Pending Review</span>
                      <h3 style={{ fontSize: '1.5rem', margin: 0, color: '#b45309' }}>{stats.pendingApprovals}</h3>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent)', padding: '0.75rem', borderRadius: '8px' }}>
                      <Mail size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Inquiry Leads</span>
                      <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stats.totalInquiries}</h3>
                    </div>
                  </div>
                </div>
              )}

              {/* Pending Listings Panel */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  Pending Listings Approvals ({pendingList.length})
                </h3>

                {pendingList.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ marginTop: 0, boxShadow: 'none' }}>
                      <thead>
                        <tr>
                          <th>Company</th>
                          <th>Category</th>
                          <th>City</th>
                          <th>Contact Phone</th>
                          <th>Submitted By</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingList.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <strong>{item.name}</strong>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.contactEmail}</div>
                            </td>
                            <td>{item.category?.name}</td>
                            <td>{item.city?.name}</td>
                            <td>{item.contactPhone || 'N/A'}</td>
                            <td>{item.user?.username}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  onClick={() => handleApprove(item.id)}
                                  className="nav-btn"
                                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', background: 'var(--accent)' }}
                                >
                                  Approve Listing
                                </button>
                                <button
                                  onClick={() => handleToggleVerify(item.id)}
                                  className="nav-btn-outline"
                                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', color: 'var(--primary-light)', borderColor: 'var(--primary-light)' }}
                                >
                                  {item.isVerified ? "Remove Verify" : "Verify Badge"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2.5rem 0' }}>
                    No business listings are currently pending approval. Great job!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE ADMINS (Super Admin only) */}
          {activeTab === 'admins' && isSuperAdmin && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', alignItems: 'start' }}>
              
              {/* Left Side: Create Admin Form */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserPlus size={18} color="var(--primary-light)" /> Add Normal Admin
                </h3>
                
                {adminError && <div className="error-banner" style={{ margin: '0 0 1rem 0', padding: '0.65rem' }}>{adminError}</div>}
                {adminSuccess && <div className="success-banner" style={{ margin: '0 0 1rem 0', padding: '0.65rem', background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' }}>{adminSuccess}</div>}

                <form onSubmit={handleCreateAdmin}>
                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label htmlFor="username" style={{ fontWeight: 600 }}>Username</label>
                    <input 
                      type="text" 
                      id="username" 
                      className="form-control"
                      value={newAdminUser.username}
                      onChange={(e) => setNewAdminUser({ ...newAdminUser, username: e.target.value })}
                      placeholder="e.g. sub_admin"
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label htmlFor="email" style={{ fontWeight: 600 }}>Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="form-control"
                      value={newAdminUser.email}
                      onChange={(e) => setNewAdminUser({ ...newAdminUser, email: e.target.value })}
                      placeholder="e.g. subadmin@managemydata.com"
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="password" style={{ fontWeight: 600 }}>Password</label>
                    <input 
                      type="password" 
                      id="password" 
                      className="form-control"
                      value={newAdminUser.password}
                      onChange={(e) => setNewAdminUser({ ...newAdminUser, password: e.target.value })}
                      placeholder="Enter a secure password"
                      required 
                    />
                  </div>

                  <button type="submit" className="nav-btn" style={{ width: '100%', background: 'var(--primary)', color: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    Create Admin Account
                  </button>
                </form>
              </div>

              {/* Right Side: Admin Accounts List */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert size={18} color="var(--primary-light)" /> Admin Accounts List
                </h3>

                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table" style={{ marginTop: 0, boxShadow: 'none' }}>
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminsList.map((adminAcc) => {
                        const isSelf = adminAcc.username === user.username;
                        const isSuper = adminAcc.role === 'ROLE_SUPER_ADMIN';
                        return (
                          <tr key={adminAcc.id}>
                            <td>
                              <strong>{adminAcc.username}</strong> {isSelf && <span style={{ fontSize: '0.7rem', color: 'var(--primary-light)', fontStyle: 'italic' }}>(You)</span>}
                            </td>
                            <td>{adminAcc.email}</td>
                            <td>
                              <span style={{ 
                                fontSize: '0.75rem', 
                                padding: '0.15rem 0.5rem', 
                                borderRadius: '12px', 
                                fontWeight: 'bold',
                                background: isSuper ? 'rgba(220,38,38,0.1)' : 'rgba(59,130,246,0.1)',
                                color: isSuper ? '#dc2626' : 'var(--primary-light)'
                              }}>
                                {isSuper ? 'SUPER_ADMIN' : 'ADMIN'}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => handleDeleteAdmin(adminAcc.id, adminAcc.username)}
                                disabled={isSelf || isSuper}
                                className="nav-btn-outline"
                                style={{ 
                                  padding: '0.25rem 0.5rem', 
                                  fontSize: '0.75rem', 
                                  color: (isSelf || isSuper) ? '#cbd5e1' : '#dc2626', 
                                  borderColor: (isSelf || isSuper) ? '#e2e8f0' : '#fee2e2',
                                  background: (isSelf || isSuper) ? '#f8fafc' : 'transparent',
                                  cursor: (isSelf || isSuper) ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
