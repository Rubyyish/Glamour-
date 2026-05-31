import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  getAllUsers, 
  updateUser, 
  deleteUser, 
  getAdminStats,
  getAllTransactions,
  flagTransaction,
  addTransactionNotes
} from '../../api/adminApi';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'transactions'
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    isActive: true,
    role: 'user'
  });
  const [transactionFilters, setTransactionFilters] = useState({
    status: '',
    flagged: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/home');
      return;
    }
    
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        getAllUsers(),
        getAdminStats()
      ]);
      
      if (usersData.success) {
        setUsers(usersData.users);
      }
      
      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await getAllTransactions(transactionFilters);
      
      if (response.success) {
        setTransactions(response.transactions);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchData();
    } else if (activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [activeTab, transactionFilters]);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      role: user.role
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    try {
      const response = await updateUser(selectedUser._id, editForm);
      
      if (response.success) {
        toast.success('User updated successfully');
        setShowEditModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId, userName, userRole) => {
    // Prevent deleting admin accounts
    if (userRole === 'admin') {
      toast.error('Cannot delete admin accounts');
      return;
    }
    
    const confirmDelete = window.confirm(
      `⚠️ DELETE USER ACCOUNT\n\n` +
      `User: ${userName}\n\n` +
      `This will permanently delete:\n` +
      `• User account\n` +
      `• All wardrobes\n` +
      `• All wardrobe items\n\n` +
      `This action CANNOT be undone!\n\n` +
      `Type the user's name to confirm deletion.`
    );
    
    if (confirmDelete) {
      const typedName = prompt(`Type "${userName}" to confirm deletion:`);
      
      if (typedName !== userName) {
        toast.error('Name does not match. Deletion cancelled.');
        return;
      }
      
      try {
        const response = await deleteUser(userId);
        
        if (response.success) {
          toast.success(`User "${userName}" deleted successfully`);
          fetchData();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (confirmLogout) {
      logout();
      toast.success('Logged out successfully! 👋');
    }
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleFlagTransaction = async (transactionId, flagged) => {
    try {
      const response = await flagTransaction(transactionId, flagged);
      
      if (response.success) {
        toast.success(flagged ? 'Transaction flagged' : 'Transaction unflagged');
        fetchTransactions();
      }
    } catch (error) {
      console.error('Error flagging transaction:', error);
      toast.error('Failed to update transaction');
    }
  };

  const handleAddNotes = async (transactionId, notes) => {
    try {
      const response = await addTransactionNotes(transactionId, notes);
      
      if (response.success) {
        toast.success('Notes added successfully');
        setShowTransactionModal(false);
        fetchTransactions();
      }
    } catch (error) {
      console.error('Error adding notes:', error);
      toast.error('Failed to add notes');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: '#2e7d32',
      pending: '#ed6c02',
      failed: '#d32f2f',
      refunded: '#9c27b0',
      cancelled: '#757575'
    };
    return colors[status] || '#666';
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <h1 className="admin-logo">Glamouré Admin</h1>
            <span className="admin-badge">Admin Panel</span>
          </div>
          <div className="admin-header-right">
            <button onClick={() => navigate('/home')} className="back-to-home-btn">
              ← Back to Home
            </button>
            <button onClick={handleLogout} className="admin-logout-btn">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="admin-container">
        {/* Statistics Cards */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon users-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>Total Users</h3>
                <p className="stat-number">{stats.users.total}</p>
                <span className="stat-detail">{stats.users.active} active, {stats.users.inactive} inactive</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon revenue-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>Total Revenue</h3>
                <p className="stat-number">${stats.revenue?.total?.toFixed(2) || '0.00'}</p>
                <span className="stat-detail">${stats.revenue?.recent?.toFixed(2) || '0.00'} last 7 days</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon transactions-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>Transactions</h3>
                <p className="stat-number">{stats.transactions?.total || 0}</p>
                <span className="stat-detail">{stats.transactions?.completed || 0} completed, {stats.transactions?.pending || 0} pending</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon flagged-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                  <line x1="4" y1="22" x2="4" y2="15"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>Flagged</h3>
                <p className="stat-number">{stats.transactions?.flagged || 0}</p>
                <span className="stat-detail">Requires review</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            User Management
          </button>
          <button 
            className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Transactions
          </button>
        </div>

        {/* Users Section */}
        {activeTab === 'users' && (
          <div className="users-section">
            <div className="users-header">
              <h2>User Management</h2>
              <div className="search-container">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Auth Provider</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Wardrobes</th>
                  <th>Items</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-cell">
                        {user.profilePicture ? (
                          <img src={user.profilePicture} alt={user.name} className="user-avatar" />
                        ) : (
                          <div className="user-avatar-placeholder">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`provider-badge ${user.authProvider}`}>
                        {user.authProvider}
                      </span>
                    </td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{user.stats?.wardrobes || 0}</td>
                    <td>{user.stats?.items || 0}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="action-btn edit-btn"
                          title="Edit user"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id, user.name, user.role)}
                          className="action-btn delete-btn"
                          title={user.role === 'admin' ? 'Cannot delete admin accounts' : 'Delete user'}
                          disabled={user.role === 'admin'}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Transactions Section */}
        {activeTab === 'transactions' && (
          <div className="transactions-section">
            <div className="transactions-header">
              <h2>Transaction Management</h2>
              <div className="filters-container">
                <select
                  value={transactionFilters.status}
                  onChange={(e) => setTransactionFilters({...transactionFilters, status: e.target.value, page: 1})}
                  className="filter-select"
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={transactionFilters.flagged}
                  onChange={(e) => setTransactionFilters({...transactionFilters, flagged: e.target.value, page: 1})}
                  className="filter-select"
                >
                  <option value="">All Transactions</option>
                  <option value="true">Flagged Only</option>
                </select>
                <div className="search-container">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
            </div>

            <div className="transactions-table-container">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Item</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment ID</th>
                    <th>Flagged</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td>{new Date(transaction.createdAt).toLocaleString()}</td>
                      <td>
                        <div className="user-cell">
                          {transaction.userId?.profilePicture ? (
                            <img src={transaction.userId.profilePicture} alt={transaction.userName} className="user-avatar-small" />
                          ) : (
                            <div className="user-avatar-placeholder-small">
                              {transaction.userName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div>{transaction.userName}</div>
                            <div className="user-email-small">{transaction.userEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="item-cell">
                          {transaction.itemImage && (
                            <img src={transaction.itemImage} alt={transaction.itemName} className="item-image" />
                          )}
                          <span>{transaction.itemName}</span>
                        </div>
                      </td>
                      <td className="amount-cell">${transaction.amount.toFixed(2)}</td>
                      <td>
                        <span 
                          className="status-badge-transaction" 
                          style={{ backgroundColor: `${getStatusColor(transaction.status)}20`, color: getStatusColor(transaction.status) }}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="payment-id-cell">{transaction.stripeSessionId.substring(0, 20)}...</td>
                      <td>
                        {transaction.flaggedForReview && (
                          <span className="flagged-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                              <line x1="4" y1="22" x2="4" y2="15"/>
                            </svg>
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleViewTransaction(transaction)}
                            className="action-btn view-btn"
                            title="View details"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleFlagTransaction(transaction._id, !transaction.flaggedForReview)}
                            className={`action-btn flag-btn ${transaction.flaggedForReview ? 'flagged' : ''}`}
                            title={transaction.flaggedForReview ? 'Unflag' : 'Flag for review'}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                              <line x1="4" y1="22" x2="4" y2="15"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setTransactionFilters({...transactionFilters, page: transactionFilters.page - 1})}
                  disabled={transactionFilters.page === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </span>
                <button
                  onClick={() => setTransactionFilters({...transactionFilters, page: transactionFilters.page + 1})}
                  disabled={transactionFilters.page === pagination.pages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content edit-user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User</h3>
              <button onClick={() => setShowEditModal(false)} className="modal-close">×</button>
            </div>
            
            <form onSubmit={handleUpdateUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                    />
                    <span>Account Active</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowEditModal(false)} className="modal-cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="modal-save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {showTransactionModal && selectedTransaction && (
        <div className="modal-overlay" onClick={() => setShowTransactionModal(false)}>
          <div className="modal-content transaction-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Transaction Details</h3>
              <button onClick={() => setShowTransactionModal(false)} className="modal-close">×</button>
            </div>
            
            <div className="modal-body transaction-details">
              <div className="detail-section">
                <h4>Transaction Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Transaction ID:</span>
                    <span className="detail-value">{selectedTransaction._id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{new Date(selectedTransaction.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span 
                      className="status-badge-transaction" 
                      style={{ backgroundColor: `${getStatusColor(selectedTransaction.status)}20`, color: getStatusColor(selectedTransaction.status) }}
                    >
                      {selectedTransaction.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Amount:</span>
                    <span className="detail-value amount">${selectedTransaction.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Customer Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{selectedTransaction.userName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedTransaction.userEmail}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">IP Address:</span>
                    <span className="detail-value">{selectedTransaction.ipAddress || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Item Information</h4>
                <div className="item-detail">
                  {selectedTransaction.itemImage && (
                    <img src={selectedTransaction.itemImage} alt={selectedTransaction.itemName} className="item-image-large" />
                  )}
                  <div>
                    <div className="detail-item">
                      <span className="detail-label">Item Name:</span>
                      <span className="detail-value">{selectedTransaction.itemName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Price:</span>
                      <span className="detail-value">${selectedTransaction.itemPrice.toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Category:</span>
                      <span className="detail-value">{selectedTransaction.itemCategory || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Payment Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Stripe Session ID:</span>
                    <span className="detail-value code">{selectedTransaction.stripeSessionId}</span>
                  </div>
                  {selectedTransaction.stripePaymentIntentId && (
                    <div className="detail-item">
                      <span className="detail-label">Payment Intent ID:</span>
                      <span className="detail-value code">{selectedTransaction.stripePaymentIntentId}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Payment Method:</span>
                    <span className="detail-value">{selectedTransaction.paymentMethod}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Currency:</span>
                    <span className="detail-value">{selectedTransaction.currency.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Admin Notes</h4>
                <textarea
                  className="admin-notes-textarea"
                  placeholder="Add notes about this transaction..."
                  defaultValue={selectedTransaction.adminNotes || ''}
                  id="transaction-notes"
                  rows="4"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                onClick={() => setShowTransactionModal(false)} 
                className="modal-cancel-btn"
              >
                Close
              </button>
              <button 
                type="button"
                onClick={() => {
                  const notes = document.getElementById('transaction-notes').value;
                  handleAddNotes(selectedTransaction._id, notes);
                }}
                className="modal-save-btn"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
