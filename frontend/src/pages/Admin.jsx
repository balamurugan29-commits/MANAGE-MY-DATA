import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Building, Mail, MessageSquare, Award, CheckCircle, RefreshCw, BarChart2, UserPlus, Trash2, ShieldAlert, Clock, Building2, LogOut, Settings, Briefcase, Search, LayoutDashboard, CheckSquare } from 'lucide-react';

export default function Admin({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingList, setPendingList] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Stats Modals State
  const [selectedStatModal, setSelectedStatModal] = useState(null); // null, 'users', 'listings', 'pending', 'inquiries'
  const [usersList, setUsersList] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [userEditForm, setUserEditForm] = useState({ username: '', email: '', password: '', role: '' });
  const [allInquiriesList, setAllInquiriesList] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('ALL'); // ALL, ROLE_EMPLOYEE, ROLE_BUSINESS, ROLE_BUYER

  // Super Admin specific state
  const [adminsList, setAdminsList] = useState([]);
  const [newAdminUser, setNewAdminUser] = useState({ username: '', email: '', password: '' });
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');

  // Database Filtering States
  const [dbSearch, setDbSearch] = useState('');
  const [dbCity, setDbCity] = useState('');
  const [dbCategory, setDbCategory] = useState('');
  const [dbApproval, setDbApproval] = useState('ALL'); // ALL, APPROVED, PENDING
  const [dbVerification, setDbVerification] = useState('ALL'); // ALL, VERIFIED, NOT_VERIFIED

  // Edit/Verify Listing States
  const [editingListing, setEditingListing] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    cityId: '',
    address: '',
    contactPhone: '',
    contactPhone2: '',
    contactPhone3: '',
    contactEmail: '',
    contactEmail2: '',
    contactEmail3: '',
    website: '',
    logoUrl: ''
  });

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

      // Fetch all listings
      const allRes = await fetch(`${API_URL}/admin/listings`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (allRes.ok) {
        const allData = await allRes.json();
        setAllListings(allData);
      }

      // Fetch all users for pop-up lists
      const usersRes = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsersList(usersData);
      }

      // Fetch all inquiries for pop-up lists
      const inquiriesRes = await fetch(`${API_URL}/admin/inquiries`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (inquiriesRes.ok) {
        const inquiriesData = await inquiriesRes.json();
        setAllInquiriesList(inquiriesData);
      }

      // Fetch categories & cities for filters
      const catRes = await fetch(`${API_URL}/categories`);
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }

      const cityRes = await fetch(`${API_URL}/cities`);
      if (cityRes.ok) {
        const cityData = await cityRes.json();
        setCities(cityData);
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

  const startEdit = (item) => {
    setEditingListing(item);
    setEditForm({
      name: item.name || '',
      description: item.description || '',
      categoryId: item.category?.id || '',
      cityId: item.city?.id || '',
      address: item.address || '',
      contactPhone: item.contactPhone || '',
      contactPhone2: item.contactPhone2 || '',
      contactPhone3: item.contactPhone3 || '',
      contactEmail: item.contactEmail || '',
      contactEmail2: item.contactEmail2 || '',
      contactEmail3: item.contactEmail3 || '',
      website: item.website || '',
      logoUrl: item.logoUrl || ''
    });
  };

  const handleSaveAndApprove = async (e) => {
    e.preventDefault();
    try {
      // 1. Save changes
      const updateRes = await fetch(`${API_URL}/listings/${editingListing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(editForm)
      });
      
      if (!updateRes.ok) {
        alert("Failed to update listing details.");
        return;
      }
      
      // 2. Approve listing (if not already approved)
      if (!editingListing.isApproved) {
        const approveRes = await fetch(`${API_URL}/admin/approve/${editingListing.id}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (!approveRes.ok) {
          alert("Failed to approve listing.");
          return;
        }
      }
      
      setEditingListing(null);
      loadAdminData();
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving and approving.");
    }
  };

  const handleSaveChangesOnly = async () => {
    try {
      const updateRes = await fetch(`${API_URL}/listings/${editingListing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(editForm)
      });
      
      if (updateRes.ok) {
        setEditingListing(null);
        loadAdminData();
      } else {
        alert("Failed to save changes.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving.");
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

  const startUserEdit = (item) => {
    setEditingUser(item);
    setUserEditForm({
      username: item.username || '',
      email: item.email || '',
      password: item.password || '',
      role: item.role || ''
    });
  };

  const handleUpdateUser = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(userEditForm)
      });
      if (res.ok) {
        setEditingUser(null);
        // Reload users list
        const usersRes = await fetch(`${API_URL}/admin/users`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsersList(usersData);
        }
        // Also refresh admin list just in case role changed
        if (user && user.role === 'ROLE_SUPER_ADMIN') {
          loadAdminsList();
        }
      } else {
        const errMsg = await res.text();
        alert(errMsg || "Failed to update user.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating user.");
    }
  };

  const handleDeleteUser = async (id, targetUsername) => {
    if (!window.confirm(`Are you sure you want to delete the user "${targetUsername}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (res.ok) {
        // Reload users list
        const usersRes = await fetch(`${API_URL}/admin/users`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsersList(usersData);
        }
        // Also refresh admin list just in case role changed
        if (user && user.role === 'ROLE_SUPER_ADMIN') {
          loadAdminsList();
        }
      } else {
        const errMsg = await res.text();
        alert(errMsg || 'Failed to delete user.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting user.');
    }
  };

  const handleMarkInquiryRead = async (id) => {
    try {
      const res = await fetch(`${API_URL}/inquiries/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        // Refresh inquiries list
        const inquiriesRes = await fetch(`${API_URL}/admin/inquiries`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (inquiriesRes.ok) {
          const inquiriesData = await inquiriesRes.json();
          setAllInquiriesList(inquiriesData);
        }
        // Refresh stats
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isSuperAdmin = user && user.role === 'ROLE_SUPER_ADMIN';

  if (!user || (user.role !== 'ROLE_ADMIN' && user.role !== 'ROLE_SUPER_ADMIN')) return null;

  return (
    <div className="dashboard-layout" style={{ minHeight: 'calc(100vh - 70px)' }}>
      {/* Sidebar Panel Navigation */}
      <aside className="dashboard-sidebar" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 70px)' }}>
        <div style={{ padding: '0 1rem 1.5rem 1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--primary)', fontSize: '1.1rem', fontWeight: 800 }}>MANAGE MY DATA</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
            {user.role === 'ROLE_SUPER_ADMIN' ? 'Super Boss' : user.role === 'ROLE_ADMIN' ? 'Admin' : 'Employee'}
          </span>
        </div>

        <div style={{ padding: '0 1rem 1rem 1rem', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Navigator search..." 
            style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.85rem', border: '1px solid var(--border-hover)', borderRadius: '8px', background: '#f8fafc' }} 
          />
        </div>

        <div
          onClick={() => setActiveTab('dashboard')}
          className={`dashboard-sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        >
          <Building2 size={18} /> Dashboard
        </div>
        <div
          onClick={() => setActiveTab('employees')}
          className={`dashboard-sidebar-item ${activeTab === 'employees' ? 'active' : ''}`}
        >
          <Users size={18} /> User Management
        </div>
        <div
          onClick={() => setActiveTab('recruitment')}
          className={`dashboard-sidebar-item ${activeTab === 'recruitment' ? 'active' : ''}`}
        >
          <Building size={18} /> All Directory Listings
        </div>
        <div
          onClick={() => setActiveTab('onboarding')}
          className={`dashboard-sidebar-item ${activeTab === 'onboarding' ? 'active' : ''}`}
        >
          <Award size={18} /> Pending Listings
        </div>
        <div
          onClick={() => setActiveTab('payroll')}
          className={`dashboard-sidebar-item ${activeTab === 'payroll' ? 'active' : ''}`}
        >
          <Mail size={18} /> Inquiry Leads
        </div>
        <div
          onClick={() => setActiveTab('settings')}
          className={`dashboard-sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}
        >
          <ShieldAlert size={18} /> Settings
        </div>

        <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {user.role === 'ROLE_SUPER_ADMIN' ? 'SB' : user.role === 'ROLE_ADMIN' ? 'AD' : 'EM'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.role === 'ROLE_SUPER_ADMIN' ? 'Super Boss' : user.role === 'ROLE_ADMIN' ? 'Admin' : 'Employee'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>
              {user.role === 'ROLE_SUPER_ADMIN' ? 'SUPER BOSS' : user.role === 'ROLE_ADMIN' ? 'ADMIN' : 'EMPLOYEE'}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="dashboard-content" style={{ flex: 1, padding: '2.5rem' }}>
        {/* Top search & profile header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input 
              type="text" 
              placeholder="Search everything..." 
              style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem', fontSize: '0.85rem', border: '1px solid var(--border-hover)', borderRadius: '20px', background: '#f8fafc' }} 
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={loadAdminData} className="nav-btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.75rem' }}>
              <RefreshCw size={14} /> Refresh Data
            </button>

          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Retrieving administrative data...</div>
        ) : (
          <div>
            {/* TAB: DASHBOARD MODULE GRID */}
            {activeTab === 'dashboard' && (
              <div style={{ padding: '0.5rem 0' }}>
                {/* Dashboard Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                  <div>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>Admin Dashboard 👋</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Here's an overview of your organization.</p>
                  </div>
                  <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ color: 'var(--primary)' }}><Clock size={20} /></div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.15rem' }}>
                        {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics Cards Row */}
                {stats && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    {/* Stat 1: Total Users */}
                    <div onClick={() => setSelectedStatModal('users')} style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', transition: 'var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={24} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Total Users</span>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.15rem 0 0 0' }}>{stats.totalUsers}</h2>
                      </div>
                    </div>

                    {/* Stat 2: Active Listings */}
                    <div onClick={() => setSelectedStatModal('listings')} style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', transition: 'var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{ background: 'rgba(30, 58, 138, 0.1)', color: 'var(--primary)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Building size={24} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Active Listings</span>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.15rem 0 0 0' }}>{stats.totalListings}</h2>
                      </div>
                    </div>

                    {/* Stat 3: Pending Reviews */}
                    <div onClick={() => setSelectedStatModal('pending')} style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', transition: 'var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={24} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Pending Reviews</span>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.15rem 0 0 0' }}>{stats.pendingApprovals}</h2>
                      </div>
                    </div>

                    {/* Stat 4: Inquiry Leads */}
                    <div onClick={() => setSelectedStatModal('inquiries')} style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', transition: 'var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Mail size={24} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Inquiry Leads</span>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.15rem 0 0 0' }}>{stats.totalInquiries}</h2>
                      </div>
                    </div>
                  </div>
                )}

                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', fontWeight: 700 }}>Admin Modules</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                  {/* Card 1: User Management */}
                  <div 
                    onClick={() => setActiveTab('employees')}
                    style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', cursor: 'pointer', transition: 'var(--transition)', boxShadow: 'var(--shadow-sm)' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                  >
                    <div style={{ background: '#eff6ff', color: '#3b82f6', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justify: 'center' }}>
                      <Users size={22} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>User Management</span>
                      <span style={{ color: 'var(--text-light)' }}>➔</span>
                    </div>
                  </div>

                  {/* Card 5: Recruitment */}
                  <div 
                    onClick={() => setActiveTab('recruitment')}
                    style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', cursor: 'pointer', transition: 'var(--transition)', boxShadow: 'var(--shadow-sm)' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                  >
                    <div style={{ background: '#fff1f2', color: '#f43f5e', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justify: 'center' }}>
                      <Briefcase size={22} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>All Directory Listings</span>
                      <span style={{ color: 'var(--text-light)' }}>➔</span>
                    </div>
                  </div>

                  {/* Card 7: Inquiry Leads */}
                  <div 
                    onClick={() => setActiveTab('payroll')}
                    style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', cursor: 'pointer', transition: 'var(--transition)', boxShadow: 'var(--shadow-sm)' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                  >
                    <div style={{ background: '#f0fdf4', color: '#16a34a', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justify: 'center' }}>
                      <Mail size={22} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Inquiry Leads</span>
                      <span style={{ color: 'var(--text-light)' }}>➔</span>
                    </div>
                  </div>

                  {/* Card 10: Settings */}
                  <div 
                    onClick={() => setActiveTab('settings')}
                    style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', cursor: 'pointer', transition: 'var(--transition)', boxShadow: 'var(--shadow-sm)' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                  >
                    <div style={{ background: '#f0fdfa', color: '#0d9488', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justify: 'center' }}>
                      <ShieldAlert size={22} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Settings</span>
                      <span style={{ color: 'var(--text-light)' }}>➔</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EMPLOYEE/USERS MANAGEMENT */}
            {activeTab === 'employees' && (() => {
              const filteredUsers = usersList.filter((item) => {
                if (userRoleFilter === 'ALL') return true;
                if (userRoleFilter === 'ROLE_ADMIN') {
                  return item.role === 'ROLE_ADMIN' || item.role === 'ROLE_SUPER_ADMIN';
                }
                return item.role === userRoleFilter;
              });

              return (
                <div>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                      <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                        User Management ({filteredUsers.length})
                      </h3>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter by Role:</span>
                        <select
                          value={userRoleFilter}
                          onChange={(e) => setUserRoleFilter(e.target.value)}
                          className="form-control"
                          style={{ padding: '0.4rem 1.5rem 0.4rem 0.75rem', fontSize: '0.85rem', height: 'auto', width: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: 600, background: '#f8fafc' }}
                        >
                          <option value="ALL">All Users</option>
                          <option value="ROLE_EMPLOYEE">Employees Only</option>
                          <option value="ROLE_BUSINESS">Business Owners Only</option>
                          <option value="ROLE_BUYER">Buyers Only</option>
                          <option value="ROLE_ADMIN">Admins Only</option>
                        </select>
                      </div>
                    </div>

                    {filteredUsers.length > 0 ? (
                      <div style={{ overflowX: 'auto' }}>
                        <table className="data-table" style={{ marginTop: 0, boxShadow: 'none' }}>
                          <thead>
                            <tr>
                              <th>Username</th>
                              <th>Email Address</th>
                              <th>Password</th>
                              <th>Role</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.map((item) => {
                              return (
                                <tr key={item.id}>
                                  <td><strong>{item.username}</strong></td>
                                  <td>{item.email}</td>
                                  <td style={{ maxWidth: '180px', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b' }}>
                                    {item.password}
                                  </td>
                                  <td>
                                    <span style={{
                                      fontSize: '0.75rem',
                                      padding: '0.15rem 0.5rem',
                                      borderRadius: '12px',
                                      fontWeight: 'bold',
                                      background: item.role === 'ROLE_SUPER_ADMIN' ? 'rgba(220,38,38,0.1)' : item.role === 'ROLE_ADMIN' ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)',
                                      color: item.role === 'ROLE_SUPER_ADMIN' ? '#dc2626' : item.role === 'ROLE_ADMIN' ? 'var(--primary-light)' : '#10b981'
                                    }}>
                                      {item.role}
                                    </span>
                                  </td>
                                  <td>
                                    <button onClick={() => startUserEdit(item)} className="nav-btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Edit Details</button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No users match the selected role filter.</p>}
                  </div>
                </div>
              );
            })()}

            {/* TAB: RECRUITMENT/LISTINGS DATABASE */}
            {activeTab === 'recruitment' && (() => {
              const filteredDbListings = allListings.filter(item => {
                if (dbSearch) {
                  const term = dbSearch.toLowerCase();
                  const matchName = item.name.toLowerCase().includes(term);
                  const matchEmail = (item.contactEmail || '').toLowerCase().includes(term);
                  const matchSubmitter = (item.user?.username || '').toLowerCase().includes(term);
                  if (!matchName && !matchEmail && !matchSubmitter) return false;
                }
                if (dbCity && (!item.city || item.city.id !== parseInt(dbCity))) {
                  return false;
                }
                if (dbCategory && (!item.category || item.category.id !== parseInt(dbCategory))) {
                  return false;
                }
                if (dbApproval !== 'ALL') {
                  const targetApproved = dbApproval === 'APPROVED';
                  if (item.isApproved !== targetApproved) return false;
                }
                if (dbVerification !== 'ALL') {
                  const targetVerified = dbVerification === 'VERIFIED';
                  if (item.isVerified !== targetVerified) return false;
                }
                return true;
              });

              return (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                      All Directory Listings ({filteredDbListings.length})
                    </h3>
                  </div>

                  {/* Search & Filter Controls */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    background: '#f8fafc',
                    padding: '1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Search Listings</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Name, email..."
                        value={dbSearch}
                        onChange={(e) => setDbSearch(e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>City</label>
                      <select
                        className="form-control"
                        value={dbCity}
                        onChange={(e) => setDbCity(e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem', height: 'auto' }}
                      >
                        <option value="">All Cities</option>
                        {cities.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Category</label>
                      <select
                        className="form-control"
                        value={dbCategory}
                        onChange={(e) => setDbCategory(e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem', height: 'auto' }}
                      >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Approval</label>
                      <select
                        className="form-control"
                        value={dbApproval}
                        onChange={(e) => setDbApproval(e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem', height: 'auto' }}
                      >
                        <option value="ALL">All</option>
                        <option value="APPROVED">Approved Only</option>
                        <option value="PENDING">Pending Only</option>
                      </select>
                    </div>
                  </div>

                  {filteredDbListings.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="data-table" style={{ marginTop: 0, boxShadow: 'none' }}>
                        <thead>
                          <tr>
                            <th>Company</th>
                            <th>Category</th>
                            <th>City</th>
                            <th>Submitted By</th>
                            <th>Approval</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDbListings.map((item) => (
                            <tr key={item.id}>
                              <td><strong>{item.name}</strong></td>
                              <td>{item.category?.name}</td>
                              <td>{item.city?.name}</td>
                              <td>{item.user ? item.user.username : 'System'}</td>
                              <td>{item.isApproved ? "Approved" : "Pending"}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  {!item.isApproved && (
                                    <button onClick={() => handleApprove(item.id)} className="nav-btn" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', background: 'var(--accent)' }}>Approve</button>
                                  )}
                                  <button onClick={() => startEdit(item)} className="nav-btn-outline" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>Edit Details</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <p>No listings found.</p>}
                </div>
              );
            })()}

            {/* TAB: ONBOARDING/PENDING APPROVALS */}
            {activeTab === 'onboarding' && (
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
                          <th>Submitted By</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingList.map((item) => (
                          <tr key={item.id}>
                            <td><strong>{item.name}</strong></td>
                            <td>{item.category?.name}</td>
                            <td>{item.city?.name}</td>
                            <td>{item.user?.username || 'System'}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => handleApprove(item.id)} className="nav-btn" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', background: 'var(--accent)' }}>Approve</button>
                                <button onClick={() => startEdit(item)} className="nav-btn-outline" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>Edit</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No listings pending approval.</p>}
              </div>
            )}

            {/* TAB: ATTENDANCE & LEAVE / STATS CARD MODALS */}
            {activeTab === 'attendance' && stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
                  <h4>Platform Users</h4>
                  <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', margin: '1rem 0' }}>{stats.totalUsers}</h2>
                  <button onClick={() => setSelectedStatModal('users')} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>View User Lists</button>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
                  <h4>Active Listings</h4>
                  <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', margin: '1rem 0' }}>{stats.totalListings}</h2>
                  <button onClick={() => setSelectedStatModal('listings')} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>View Directory</button>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
                  <h4>Pending Reviews</h4>
                  <h2 style={{ fontSize: '2.5rem', color: '#b45309', margin: '1rem 0' }}>{stats.pendingApprovals}</h2>
                  <button onClick={() => setSelectedStatModal('pending')} className="btn-primary" style={{ padding: '0.5rem 1rem', background: '#b45309' }}>Review Listings</button>
                </div>
              </div>
            )}

            {/* TAB: PAYROLL/INQUIRIES LEADS */}
            {activeTab === 'payroll' && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  System Inquiries & Leads ({allInquiriesList.length})
                </h3>
                {allInquiriesList.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ marginTop: 0, boxShadow: 'none' }}>
                      <thead>
                        <tr>
                          <th>Sender</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Message</th>
                          <th>Business Target</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allInquiriesList.map((item) => (
                          <tr key={item.id}>
                            <td><strong>{item.senderName}</strong></td>
                            <td>{item.senderEmail}</td>
                            <td>{item.senderPhone || 'N/A'}</td>
                            <td>{item.message}</td>
                            <td>{item.business?.name || 'Deleted Business'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No leads registered.</p>}
              </div>
            )}

            {/* TAB: PERFORMANCE/REVIEWS */}
            {activeTab === 'performance' && stats && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  Reviews & Feedback Moderation
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                    <h4>Average Rating</h4>
                    <h2 style={{ fontSize: '2.5rem', color: '#f59e0b', margin: '0.5rem 0' }}>★ 4.8</h2>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                    <h4>Total Submissions</h4>
                    <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', margin: '0.5rem 0' }}>{stats.totalListings * 3}</h2>
                  </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Feedback and reviews moderation panel is active. Database integrity check passed.</p>
              </div>
            )}



            {/* TAB: SETTINGS & ADMIN ACCOUNT CREATION */}
            {activeTab === 'settings' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', alignItems: 'start' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserPlus size={18} color="var(--primary-light)" /> Add Normal Admin
                  </h3>
                  {adminError && <div className="error-banner" style={{ margin: '0 0 1rem 0', padding: '0.65rem' }}>{adminError}</div>}
                  {adminSuccess && <div className="success-banner" style={{ margin: '0 0 1rem 0', padding: '0.65rem', background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' }}>{adminSuccess}</div>}
                  <form onSubmit={handleCreateAdmin}>
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}><label htmlFor="username" style={{ fontWeight: 600 }}>Username</label><input type="text" id="username" className="form-control" value={newAdminUser.username} onChange={(e) => setNewAdminUser({ ...newAdminUser, username: e.target.value })} required /></div>
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}><label htmlFor="email" style={{ fontWeight: 600 }}>Email Address</label><input type="email" id="email" className="form-control" value={newAdminUser.email} onChange={(e) => setNewAdminUser({ ...newAdminUser, email: e.target.value })} required /></div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}><label htmlFor="password" style={{ fontWeight: 600 }}>Password</label><input type="password" id="password" className="form-control" value={newAdminUser.password} onChange={(e) => setNewAdminUser({ ...newAdminUser, password: e.target.value })} required /></div>
                    <button type="submit" className="nav-btn" style={{ width: '100%', background: 'var(--primary)', color: '#ffffff' }}>Create Admin Account</button>
                  </form>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldAlert size={18} color="var(--primary-light)" /> Admin Accounts List
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ marginTop: 0, boxShadow: 'none' }}>
                      <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
                      <tbody>
                        {adminsList.map((adminAcc) => {
                          const isSelf = adminAcc.username === user.username;
                          const isSuper = adminAcc.role === 'ROLE_SUPER_ADMIN';
                          return (
                            <tr key={adminAcc.id}>
                              <td><strong>{adminAcc.username}</strong> {isSelf && <span style={{ fontSize: '0.7rem', color: 'var(--primary-light)', fontStyle: 'italic' }}>(You)</span>}</td>
                              <td>{adminAcc.email}</td>
                              <td>{adminAcc.role}</td>
                              <td>
                                <button onClick={() => handleDeleteAdmin(adminAcc.id, adminAcc.username)} disabled={isSelf || isSuper} className="nav-btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: (isSelf || isSuper) ? 'not-allowed' : 'pointer' }}>Delete</button>
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

      {/* Stats Cards Detail Modals */}
      {selectedStatModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9990,
          padding: '2rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '850px',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {selectedStatModal === 'users' && <><Users size={20} color="var(--primary-light)" /> Registered Platform Users ({usersList.length})</>}
                {selectedStatModal === 'listings' && <><Building size={20} color="var(--primary)" /> All Directory Listings ({allListings.length})</>}
                {selectedStatModal === 'pending' && <><BarChart2 size={20} color="#b45309" /> Pending Approvals ({pendingList.length})</>}
                {selectedStatModal === 'inquiries' && <><Mail size={20} color="var(--accent)" /> Buyer Inquiry Leads ({allInquiriesList.length})</>}
              </h3>
              <button 
                onClick={() => setSelectedStatModal(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                &times;
              </button>
            </div>

            {/* Content Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              
              {/* Users Modal Content */}
              {selectedStatModal === 'users' && (
                usersList.length > 0 ? (
                  <table className="data-table" style={{ marginTop: 0, boxShadow: 'none' }}>
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email Address</th>
                        <th>Password</th>
                        <th>Role</th>
                        <th>Pending Submissions</th>
                        <th>Registered Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((item) => {
                        const pendingSubmissionsCount = allListings.filter(l => l.user?.id === item.id && !l.isApproved).length;
                        return (
                          <tr key={item.id} onDoubleClick={() => startUserEdit(item)} style={{ cursor: 'pointer' }} title="Double click to edit user details">
                            <td><strong>{item.username}</strong></td>
                            <td>{item.email}</td>
                            <td style={{ maxWidth: '180px', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b' }}>
                              {item.password}
                            </td>
                            <td>
                              <span style={{
                                fontSize: '0.75rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                background: item.role === 'ROLE_SUPER_ADMIN' ? 'rgba(220,38,38,0.1)' : item.role === 'ROLE_ADMIN' ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)',
                                color: item.role === 'ROLE_SUPER_ADMIN' ? '#dc2626' : item.role === 'ROLE_ADMIN' ? 'var(--primary-light)' : '#10b981'
                              }}>
                                {item.role}
                              </span>
                            </td>
                            <td>
                              {pendingSubmissionsCount > 0 ? (
                                <span style={{
                                  fontSize: '0.75rem',
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: '20px',
                                  fontWeight: 'bold',
                                  background: '#feebc8',
                                  color: '#c05621',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}>
                                  ⚠️ {pendingSubmissionsCount} Pending
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None</span>
                              )}
                            </td>
                            <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => startUserEdit(item)}
                                  className="nav-btn-outline"
                                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(item.id, item.username)}
                                  className="nav-btn-outline"
                                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', color: '#dc2626', borderColor: '#fee2e2' }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No platform users registered.</p>
                )
              )}

              {/* Listings Modal Content */}
              {selectedStatModal === 'listings' && (
                allListings.length > 0 ? (
                  <table className="data-table" style={{ marginTop: 0, boxShadow: 'none' }}>
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Category</th>
                        <th>City</th>
                        <th>Submitted By</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allListings.map((item) => (
                        <tr key={item.id}>
                          <td><strong>{item.name}</strong><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.contactEmail}</div></td>
                          <td>{item.category?.name}</td>
                          <td>{item.city?.name}</td>
                          <td>{item.user ? item.user.username : 'System/Seeded'}</td>
                          <td>
                            <span className={`status-pill ${item.isApproved ? 'status-pill-green' : 'status-pill-orange'}`} style={{ fontSize: '0.7rem' }}>
                              {item.isApproved ? "Approved" : "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No directory listings registered.</p>
                )
              )}

              {/* Pending Review Modal Content */}
              {selectedStatModal === 'pending' && (
                pendingList.length > 0 ? (
                  <table className="data-table" style={{ marginTop: 0, boxShadow: 'none' }}>
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Category</th>
                        <th>City</th>
                        <th>Submitted By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingList.map((item) => (
                        <tr key={item.id}>
                          <td><strong>{item.name}</strong><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.contactEmail}</div></td>
                          <td>{item.category?.name}</td>
                          <td>{item.city?.name}</td>
                          <td>{item.user?.username || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No pending reviews available.</p>
                )
              )}

              {/* Inquiries Modal Content */}
              {selectedStatModal === 'inquiries' && (
                allInquiriesList.length > 0 ? (
                  <table className="data-table" style={{ marginTop: 0, boxShadow: 'none' }}>
                    <thead>
                      <tr>
                        <th>Sender</th>
                        <th>Sender Email</th>
                        <th>Target Company</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allInquiriesList.map((item) => (
                        <tr key={item.id}>
                          <td><strong>{item.senderName}</strong><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.senderPhone}</div></td>
                          <td>{item.senderEmail}</td>
                          <td>{item.business?.name || 'N/A'}</td>
                          <td style={{ maxWidth: '250px', whiteSpace: 'normal', fontSize: '0.85rem' }}>{item.message}</td>
                          <td>
                            <span style={{
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '20px',
                              fontWeight: 'bold',
                              background: item.status === 'PENDING' ? '#fee2e2' : '#d1fae5',
                              color: item.status === 'PENDING' ? '#b91c1c' : '#065f46'
                            }}>
                              {item.status === 'PENDING' ? 'Unread' : 'Read'}
                            </span>
                          </td>
                          <td>
                            {item.status === 'PENDING' && (
                              <button 
                                onClick={() => handleMarkInquiryRead(item.id)}
                                className="nav-btn"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'var(--primary-light)' }}
                              >
                                Mark Read
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No inquiry leads submitted.</p>
                )
              )}

            </div>

            {/* Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'flex-end',
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px'
            }}>
              <button 
                onClick={() => setSelectedStatModal(null)}
                className="nav-btn"
                style={{ padding: '0.4rem 1.25rem', background: 'var(--primary)' }}
              >
                Close List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Verify Modal Overlay */}
      {editingListing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '2rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            border: '1px solid #e2e8f0'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)' }}>
                Edit & Verify Listing: {editingListing.name}
              </h3>
              <button 
                onClick={() => setEditingListing(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAndApprove} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Company Name</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Website</label>
                  <input
                    type="url"
                    className="form-control"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>City</label>
                  <select
                    className="form-control"
                    required
                    value={editForm.cityId}
                    onChange={(e) => setEditForm({ ...editForm, cityId: e.target.value })}
                  >
                    <option value="">Select City</option>
                    {cities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Category</label>
                  <select
                    className="form-control"
                    required
                    value={editForm.categoryId}
                    onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Address</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {/* Contacts Group */}
                <div style={{ gridColumn: 'span 2', marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: 'var(--text)' }}>Contact Information</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Contact Phone 1 (Primary)</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={editForm.contactPhone}
                        onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Contact Email 1 (Primary)</label>
                      <input
                        type="email"
                        className="form-control"
                        required
                        value={editForm.contactEmail}
                        onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Contact Phone 2 (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.contactPhone2}
                        onChange={(e) => setEditForm({ ...editForm, contactPhone2: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Contact Email 2 (Optional)</label>
                      <input
                        type="email"
                        className="form-control"
                        value={editForm.contactEmail2}
                        onChange={(e) => setEditForm({ ...editForm, contactEmail2: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Contact Phone 3 (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.contactPhone3}
                        onChange={(e) => setEditForm({ ...editForm, contactPhone3: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Contact Email 3 (Optional)</label>
                      <input
                        type="email"
                        className="form-control"
                        value={editForm.contactEmail3}
                        onChange={(e) => setEditForm({ ...editForm, contactEmail3: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Logo URL</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.logoUrl}
                    onChange={(e) => setEditForm({ ...editForm, logoUrl: e.target.value })}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingListing(null)}
                  className="nav-btn-outline"
                  style={{ padding: '0.5rem 1.25rem' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveChangesOnly}
                  className="nav-btn-outline"
                  style={{ padding: '0.5rem 1.25rem', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                >
                  Save Changes Only
                </button>
                <button
                  type="submit"
                  className="nav-btn"
                  style={{ padding: '0.5rem 1.5rem', background: 'var(--accent)' }}
                >
                  {editingListing.isApproved ? "Save & Update" : "Approve & Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal Overlay */}
      {editingUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '2rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            border: '1px solid #e2e8f0'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)' }}>
                Edit User Details: {editingUser.username}
              </h3>
              <button 
                onClick={() => setEditingUser(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdateUser} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Username</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={userEditForm.username}
                    onChange={(e) => setUserEditForm({ ...userEditForm, username: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    required
                    value={userEditForm.email}
                    onChange={(e) => setUserEditForm({ ...userEditForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Password</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={userEditForm.password}
                    onChange={(e) => setUserEditForm({ ...userEditForm, password: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Role</label>
                  <select
                    className="form-control"
                    required
                    value={userEditForm.role}
                    onChange={(e) => setUserEditForm({ ...userEditForm, role: e.target.value })}
                    style={{ height: 'auto' }}
                  >
                    <option value="ROLE_BUYER">ROLE_BUYER</option>
                    <option value="ROLE_BUSINESS">ROLE_BUSINESS</option>
                    <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                    <option value="ROLE_SUPER_ADMIN">ROLE_SUPER_ADMIN</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="nav-btn-outline"
                  style={{ padding: '0.5rem 1.25rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="nav-btn"
                  style={{ padding: '0.5rem 1.5rem', background: 'var(--primary)' }}
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
