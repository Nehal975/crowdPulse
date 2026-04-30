import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import axios from "axios";

// Modern Admin Dashboard with Gradient Design
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizers: 0,
    totalEvents: 0,
    totalRevenue: 0
  });
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit user state
  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({
    username: '',
    email: '',
    role: ''
  });

  // Edit event state
  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    location: '',
    eventDateTime: '',
    price: 0,
    totalSeats: 0
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please login first");
          setLoading(false);
          return;
        }

        // Fetch users
        const usersRes = await axios.get(`${import.meta.env.VITE_API}/user/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(usersRes.data.users || []);

        // Fetch events
        const eventsRes = await axios.get(`${import.meta.env.VITE_API}/events`);
        setEvents(eventsRes.data.events || []);

        // Calculate stats
        const allUsers = usersRes.data.users || [];
        const allEvents = eventsRes.data.events || [];
        
        setStats({
          totalUsers: allUsers.length,
          totalOrganizers: allUsers.filter(u => u.role === 'Organizer').length,
          totalEvents: allEvents.length,
          totalRevenue: allEvents.reduce((sum, e) => sum + (e.totalRevenue || 0), 0)
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Delete event
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API}/events/delete-event/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setEvents(events.filter(e => e._id !== eventId));
      setStats({
        ...stats,
        totalEvents: stats.totalEvents - 1
      });
      alert("Event deleted successfully!");
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event");
    }
  };

  // Edit event - open edit form
  const handleEditEvent = (event) => {
    setEditingEvent(event._id);
    setEditForm({
      title: event.title || '',
      description: event.description || '',
      location: event.location || '',
      eventDateTime: event.eventDateTime ? new Date(event.eventDateTime).toISOString().slice(0, 16) : '',
      price: event.price || 0,
      totalSeats: event.totalSeats || 0
    });
  };

  // Save event edits
  const handleSaveEvent = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${import.meta.env.VITE_API}/events/update-event/${eventId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setEvents(events.map(e => e._id === eventId ? { ...e, ...editForm } : e));
      setEditingEvent(null);
      alert("Event updated successfully!");
    } catch (err) {
      console.error("Error updating event:", err);
      alert("Failed to update event");
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingEvent(null);
    setEditForm({
      title: '',
      description: '',
      location: '',
      eventDateTime: '',
      price: 0,
      totalSeats: 0
    });
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API}/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setUsers(users.filter(u => u._id !== userId));
      setStats({
        ...stats,
        totalUsers: stats.totalUsers - 1
      });
      alert("User deleted successfully!");
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user");
    }
  };

  // Edit user - open edit form
  const handleEditUser = (user) => {
    setEditingUser(user._id);
    setEditUserForm({
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'Attendee'
    });
  };

  // Save user edits
  const handleSaveUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${import.meta.env.VITE_API}/user/${userId}`, editUserForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setUsers(users.map(u => u._id === userId ? { ...u, ...editUserForm } : u));
      setEditingUser(null);
      alert("User updated successfully!");
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update user");
    }
  };

  // Cancel user edit
  const handleCancelUserEdit = () => {
    setEditingUser(null);
    setEditUserForm({
      username: '',
      email: '',
      role: ''
    });
  };

  // Filter users by role
  const [userFilter, setUserFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  
  const filteredUsers = users.filter(user => {
    // Role filter
    if (userFilter !== 'all' && user.role !== userFilter) {
      return false;
    }
    // Search filter
    if (userSearch) {
      const searchLower = userSearch.toLowerCase();
      return (
        user.username?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Menu items
  const menuItems = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'users', label: '👥 Users', icon: '👥' },
    { id: 'events', label: '🎉 Events', icon: '🎉' },
    { id: 'settings', label: '⚙️ Settings', icon: '⚙️' }
  ];

  if (loading) {
    return (
      <div style={{ 
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '20px',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ fontWeight: '500' }}>Loading Admin Dashboard...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', 
        minHeight: '100vh',
        padding: '40px',
        color: 'white'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          padding: '40px',
          borderRadius: '16px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <h1 style={{ fontSize: '28px', marginBottom: '16px', color: '#f5576c' }}>⚠️ Admin Dashboard</h1>
          <p style={{ color: '#f5576c', marginBottom: '12px', fontSize: '16px' }}>Error: {error}</p>
          <p style={{ opacity: 0.8 }}>Please login as admin first.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', 
      minHeight: '100vh',
      color: 'white'
    }}>
      {/* Header with Gradient */}
      <div style={{
        padding: '24px 40px',
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            🎯 Admin Dashboard
          </h1>
          <p style={{ fontSize: '14px', opacity: 0.9, marginTop: '4px' }}>Manage your platform with ease</p>
        </div>
        <Link 
          to="/"
          style={{
            padding: '12px 24px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '10px',
            color: 'white',
            textDecoration: 'none',
            fontWeight: '600',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          ← Back to Home
        </Link>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
        {/* Sidebar with Gradient */}
        <div style={{
          width: '260px',
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
          padding: '20px',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                width: '100%',
                padding: '14px 18px',
                marginBottom: '10px',
                backgroundColor: activeTab === item.id ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                background: activeTab === item.id ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: activeTab === item.id ? 'bold' : '500',
                textAlign: 'left',
                transition: 'all 0.3s ease',
                boxShadow: activeTab === item.id ? '0 4px 15px rgba(102, 126, 234, 0.4)' : 'none'
              }}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '30px' }}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ fontSize: '28px', marginBottom: '28px', fontWeight: 'bold' }}>📊 Overview</h2>
              
              {/* Stats Cards with Gradients */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '28px',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                }}>
                  <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>👥 Total Users</p>
                  <p style={{ fontSize: '42px', fontWeight: 'bold', color: 'white' }}>{stats.totalUsers}</p>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  padding: '28px',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(245, 87, 108, 0.3)'
                }}>
                  <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>🎤 Organizers</p>
                  <p style={{ fontSize: '42px', fontWeight: 'bold', color: 'white' }}>{stats.totalOrganizers}</p>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  padding: '28px',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)'
                }}>
                  <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>🎉 Total Events</p>
                  <p style={{ fontSize: '42px', fontWeight: 'bold', color: 'white' }}>{stats.totalEvents}</p>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  padding: '28px',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(67, 233, 123, 0.3)'
                }}>
                  <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>💰 Total Revenue</p>
                  <p style={{ fontSize: '42px', fontWeight: 'bold', color: 'white' }}>₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>

              {/* Recent Events with Gradient */}
              <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                padding: '28px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h3 style={{ fontSize: '22px', marginBottom: '20px', fontWeight: 'bold' }}>📅 Recent Events</h3>
                {events.slice(0, 5).map(event => (
                  <div key={event._id} style={{
                    padding: '16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background 0.3s ease',
                    borderRadius: '8px'
                  }}>
                    <span style={{ fontSize: '16px', fontWeight: '500' }}>{event.title}</span>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>{event.location}</span>
                      <button 
                        onClick={() => handleEditEvent(event)}
                        style={{ padding: '6px 12px', background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteEvent(event._id)}
                        style={{ padding: '6px 12px', background: 'linear-gradient(90deg, #f5576c 0%, #f093fb 100%)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
                {events.length === 0 && <p style={{ textAlign: 'center', opacity: 0.7 }}>No events found</p>}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <h2 style={{ fontSize: '28px', marginBottom: '28px', fontWeight: 'bold' }}>👥 All Users</h2>
              
              {/* Search Bar */}
              <div style={{ marginBottom: '20px' }}>
                <input 
                  type="text" 
                  placeholder="🔍 Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '14px 18px', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255, 255, 255, 0.2)', 
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 
                    color: 'white',
                    fontSize: '15px',
                    outline: 'none',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                  }}
                />
              </div>
              
              {/* Filter Buttons */}
              <div style={{ marginBottom: '24px', display: 'flex', gap: '14px' }}>
                <button 
                  onClick={() => setUserFilter('all')}
                  style={{ 
                    padding: '10px 20px', 
                    background: userFilter === 'all' ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)', 
                    borderRadius: '10px', 
                    color: 'white', 
                    cursor: 'pointer',
                    fontWeight: userFilter === 'all' ? 'bold' : '500',
                    fontSize: '14px'
                  }}
                >
                  All ({users.length})
                </button>
                <button 
                  onClick={() => setUserFilter('Attendee')}
                  style={{ 
                    padding: '10px 20px', 
                    background: userFilter === 'Attendee' ? 'linear-gradient(90deg, #7c3aed 0%, #a855f7 100%)' : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)', 
                    borderRadius: '10px', 
                    color: 'white', 
                    cursor: 'pointer',
                    fontWeight: userFilter === 'Attendee' ? 'bold' : '500',
                    fontSize: '14px'
                  }}
                >
                  🎫 Attendees ({users.filter(u => u.role === 'Attendee').length})
                </button>
                <button 
                  onClick={() => setUserFilter('Organizer')}
                  style={{ 
                    padding: '10px 20px', 
                    background: userFilter === 'Organizer' ? 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)' : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)', 
                    borderRadius: '10px', 
                    color: 'white', 
                    cursor: 'pointer',
                    fontWeight: userFilter === 'Organizer' ? 'bold' : '500',
                    fontSize: '14px'
                  }}
                >
                  🎤 Organizers ({users.filter(u => u.role === 'Organizer').length})
                </button>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '15px' }}>👤 Name</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '15px' }}>📧 Email</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '15px' }}>🎭 Role</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '15px' }}>📅 Joined</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '15px' }}>⚡ Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user._id} style={{ borderBottom: '1px solid #374151' }}>
                        {editingUser === user._id ? (
                          /* Edit User Form */
                          <>
                            <td style={{ padding: '12px' }}>
                              <input 
                                type="text" 
                                value={editUserForm.username}
                                onChange={(e) => setEditUserForm({...editUserForm, username: e.target.value})}
                                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #374151', backgroundColor: '#374151', color: 'white', width: '100%' }}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input 
                                type="email" 
                                value={editUserForm.email}
                                onChange={(e) => setEditUserForm({...editUserForm, email: e.target.value})}
                                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #374151', backgroundColor: '#374151', color: 'white', width: '100%' }}
                              />
                            </td>
                            <td style={{ padding: '12px' }}>
                              <select 
                                value={editUserForm.role}
                                onChange={(e) => setEditUserForm({...editUserForm, role: e.target.value})}
                                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #374151', backgroundColor: '#374151', color: 'white' }}
                              >
                                <option value="Attendee">Attendee</option>
                                <option value="Organizer">Organizer</option>
                                <option value="Admin">Admin</option>
                              </select>
                            </td>
                            <td style={{ padding: '12px' }}>
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  onClick={() => handleSaveUser(user._id)}
                                  style={{ padding: '4px 8px', backgroundColor: '#10b981', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '12px' }}
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={handleCancelUserEdit}
                                  style={{ padding: '4px 8px', backgroundColor: '#6b7280', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '12px' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          /* Normal User Display */
                          <>
                            <td style={{ padding: '12px' }}>{user.username}</td>
                            <td style={{ padding: '12px' }}>{user.email}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                backgroundColor: user.role === 'admin' ? '#dc2626' : user.role === 'Organizer' ? '#2563eb' : '#7c3aed',
                                fontSize: '12px'
                              }}>
                                {user.role}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '12px' }}>
                              {user.role !== 'admin' && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button 
                                    onClick={() => handleEditUser(user)}
                                    style={{ padding: '4px 8px', backgroundColor: '#2563eb', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '12px' }}
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteUser(user._id)}
                                    style={{ padding: '4px 8px', backgroundColor: '#dc2626', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '12px' }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && <p style={{ padding: '20px' }}>No users found</p>}
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div>
              <h2 style={{ fontSize: '28px', marginBottom: '28px', fontWeight: 'bold' }}>🎉 All Events</h2>
              <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}>
                {events.map(event => (
                  <div key={event._id} style={{
                    padding: '20px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    {editingEvent === event._id ? (
                      /* Edit Form */
                      <div>
                        <h4 style={{ marginBottom: '16px', color: '#60a5fa' }}>Editing: {event.title}</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <input 
                            type="text" 
                            placeholder="Title"
                            value={editForm.title}
                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #374151', backgroundColor: '#374151', color: 'white' }}
                          />
                          <input 
                            type="text" 
                            placeholder="Location"
                            value={editForm.location}
                            onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #374151', backgroundColor: '#374151', color: 'white' }}
                          />
                          <input 
                            type="datetime-local" 
                            value={editForm.eventDateTime}
                            onChange={(e) => setEditForm({...editForm, eventDateTime: e.target.value})}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #374151', backgroundColor: '#374151', color: 'white' }}
                          />
                          <input 
                            type="number" 
                            placeholder="Price"
                            value={editForm.price}
                            onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #374151', backgroundColor: '#374151', color: 'white' }}
                          />
                          <input 
                            type="number" 
                            placeholder="Total Seats"
                            value={editForm.totalSeats}
                            onChange={(e) => setEditForm({...editForm, totalSeats: e.target.value})}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #374151', backgroundColor: '#374151', color: 'white' }}
                          />
                        </div>
                        <textarea 
                          placeholder="Description"
                          value={editForm.description}
                          onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                          style={{ marginTop: '12px', padding: '8px', borderRadius: '4px', border: '1px solid #374151', backgroundColor: '#374151', color: 'white', width: '100%', minHeight: '80px' }}
                        />
                        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleSaveEvent(event._id)}
                            style={{ padding: '8px 16px', backgroundColor: '#10b981', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}
                          >
                            Save Changes
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            style={{ padding: '8px 16px', backgroundColor: '#6b7280', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Normal Event Display */
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{event.title}</p>
                          <p style={{ color: 'rgba(255,255,255,0.6)' }}>{event.description?.substring(0, 50)}...</p>
                          <p style={{ color: 'rgba(255,255,255,0.6)' }}>📍 {event.location}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontWeight: '600' }}>📅 {new Date(event.eventDateTime).toLocaleDateString()}</p>
                            <p style={{ color: '#43e97b', fontWeight: 'bold' }}>💰 ₹{event.totalRevenue || 0}</p>
                          </div>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                              onClick={() => handleEditEvent(event)}
                              style={{ padding: '10px 18px', background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: '500', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)' }}
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteEvent(event._id)}
                              style={{ padding: '10px 18px', background: 'linear-gradient(90deg, #f5576c 0%, #f093fb 100%)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: '500', boxShadow: '0 4px 15px rgba(245, 87, 108, 0.3)' }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {events.length === 0 && <p style={{ padding: '20px' }}>No events found</p>}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Settings</h2>
              <div style={{
                backgroundColor: '#1f2937',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #374151'
              }}>
                <p>Admin settings coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
