import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [detailedData, setDetailedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { isConnected, workStartNotifications, clearNotifications } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchDetailedData();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
      setLoading(false);
    } catch (error) {
      setError('Failed to load dashboard stats');
      setLoading(false);
    }
  };

  const fetchDetailedData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/detailed-user-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDetailedData(response.data);
    } catch (error) {
      console.error('Failed to load detailed data:', error);
    }
  };

  const triggerAutomation = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/trigger-automation`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Automation triggered successfully!');
      fetchStats();
      fetchDetailedData();
    } catch (error) {
      alert('Failed to trigger automation: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  const StatCard = ({ title, value, color, icon }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center`}>
              <span className="text-white font-bold">{icon}</span>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Real-time connection status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-800"
                >
                  🔔
                  {workStartNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {workStartNotifications.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border">
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-medium">Work Start Notifications</h3>
                        {workStartNotifications.length > 0 && (
                          <button
                            onClick={clearNotifications}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {workStartNotifications.length === 0 ? (
                          <p className="text-gray-500 text-sm">No new notifications</p>
                        ) : (
                          workStartNotifications.map((notification, index) => (
                            <div key={index} className="border-b border-gray-200 pb-2 mb-2 last:border-b-0">
                              <div className="text-sm font-medium text-gray-900">
                                {notification.userName} started work
                              </div>
                              <div className="text-xs text-gray-500">
                                {notification.userEmail}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(notification.timestamp).toLocaleString()}
                              </div>
                              <div className="text-xs text-blue-600 mt-1">
                                Project: {notification.projectLink}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('/admin/users')}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Manage Users
              </button>
              <button
                onClick={() => navigate('/admin/agreements')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Manage Agreements
              </button>
              <button
                onClick={() => navigate('/admin/signed-agreements')}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Signed Agreements
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              color="bg-blue-500"
              icon="👥"
            />
            <StatCard
              title="Verified Users"
              value={stats?.verifiedUsers || 0}
              color="bg-green-500"
              icon="✓"
            />
            <StatCard
              title="Signed Agreements"
              value={stats?.signedUsers || 0}
              color="bg-purple-500"
              icon="📝"
            />
            <StatCard
              title="Working Users"
              value={stats?.workingUsers || 0}
              color="bg-yellow-500"
              icon="⚡"
            />
            <StatCard
              title="Submitted Work"
              value={stats?.submittedUsers || 0}
              color="bg-indigo-500"
              icon="📤"
            />
            <StatCard
              title="Penalized Users"
              value={stats?.penalizedUsers || 0}
              color="bg-red-500"
              icon="⚠"
            />
          </div>

          {/* Tab Navigation */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'overview', name: 'Overview', icon: '📊' },
                  { id: 'signed-agreements', name: 'Signed Agreements', icon: '📝' },
                  { id: 'verified-users', name: 'Verified Users', icon: '✅' },
                  { id: 'active-users', name: 'Active/Working Users', icon: '⚡' },
                  { id: 'submitted-work', name: 'Submitted Work', icon: '📤' },
                  { id: 'penalized-work', name: 'Penalized Work', icon: '⚠️' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div>
                  {/* Quick Actions */}
                  <div className="mb-8">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                      Quick Actions
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <button
                        onClick={() => navigate('/admin/users')}
                        className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
                      >
                        <div className="text-2xl mb-2">👥</div>
                        <div className="font-medium">Manage Users</div>
                        <div className="text-sm text-gray-500">Create, edit, delete users</div>
                      </button>

                      <button
                        onClick={() => navigate('/admin/agreements')}
                        className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
                      >
                        <div className="text-2xl mb-2">📝</div>
                        <div className="font-medium">Agreements</div>
                        <div className="text-sm text-gray-500">Manage agreement content</div>
                      </button>

                      <button
                        onClick={triggerAutomation}
                        className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
                      >
                        <div className="text-2xl mb-2">🤖</div>
                        <div className="font-medium">Trigger Automation</div>
                        <div className="text-sm text-gray-500">Run penalty checks</div>
                      </button>

                      <button
                        onClick={() => setActiveTab('penalized-work')}
                        className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
                      >
                        <div className="text-2xl mb-2">⚠️</div>
                        <div className="font-medium">Penalized Users</div>
                        <div className="text-sm text-gray-500">View penalized work</div>
                      </button>

                      <button
                        onClick={() => setActiveTab('submitted-work')}
                        className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
                      >
                        <div className="text-2xl mb-2">📤</div>
                        <div className="font-medium">Submitted Work</div>
                        <div className="text-sm text-gray-500">View all submissions</div>
                      </button>
                    </div>
                  </div>

                  {/* System Overview */}
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                      System Overview
                    </h3>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">User Registration Rate</div>
                          <div className="text-sm text-gray-500">
                            {stats?.verifiedUsers || 0} out of {stats?.totalUsers || 0} users verified
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {stats?.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0}%
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">Agreement Completion Rate</div>
                          <div className="text-sm text-gray-500">
                            {stats?.signedUsers || 0} out of {stats?.verifiedUsers || 0} verified users signed
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">
                            {stats?.verifiedUsers > 0 ? Math.round((stats.signedUsers / stats.verifiedUsers) * 100) : 0}%
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">Work Completion Rate</div>
                          <div className="text-sm text-gray-500">
                            {stats?.submittedUsers || 0} out of {stats?.signedUsers || 0} signed users submitted
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-600">
                            {stats?.signedUsers > 0 ? Math.round((stats.submittedUsers / stats.signedUsers) * 100) : 0}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'signed-agreements' && (
                <UserDataTable
                  title="Users with Signed Agreements"
                  data={detailedData?.signedAgreements || []}
                  showSignature={true}
                  onRefresh={fetchDetailedData}
                />
              )}

              {activeTab === 'verified-users' && (
                <UserDataTable
                  title="Verified Users"
                  data={detailedData?.verifiedUsers || []}
                  onRefresh={fetchDetailedData}
                />
              )}

              {activeTab === 'active-users' && (
                <UserDataTable
                  title="Active/Working Users"
                  data={detailedData?.activeUsers || []}
                  showWorkStatus={true}
                  onRefresh={fetchDetailedData}
                />
              )}

              {activeTab === 'submitted-work' && (
                <SubmittedWorkTable
                  title="Submitted Work"
                  data={detailedData?.submittedWork || []}
                  onRefresh={fetchDetailedData}
                />
              )}

              {activeTab === 'penalized-work' && (
                <PenalizedWorkTable
                  title="Penalized Work"
                  data={detailedData?.penalizedWork || []}
                  onRefresh={fetchDetailedData}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// UserDataTable Component
const UserDataTable = ({ title, data, showSignature, showWorkStatus, onRefresh }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPassword, setUserPassword] = useState('');

  const viewPassword = async (userId, userName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/password`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserPassword(response.data.password);
      setSelectedUser({ id: userId, name: userName });
      setShowPasswordModal(true);
    } catch (error) {
      alert('Failed to fetch password: ' + (error.response?.data?.message || error.message));
    }
  };

  const penalizeUser = async (userId, userName) => {
    const reason = prompt(`Enter reason for penalizing ${userName}:`);
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/penalize`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`${userName} has been penalized successfully!`);
      onRefresh();
    } catch (error) {
      alert('Failed to penalize user: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title} ({data.length})</h3>
        <button
          onClick={onRefresh}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              {showSignature && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signature</th>}
              {showWorkStatus && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Started</th>}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    {user.isVerified && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Verified</span>}
                    {user.isSignedAgreement && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Signed</span>}
                    {user.isPenalized && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Penalized</span>}
                  </div>
                </td>
                {showSignature && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.signature ? (
                      <span className="text-green-600 text-sm">✓ Signed</span>
                    ) : (
                      <span className="text-gray-400 text-sm">Not signed</span>
                    )}
                  </td>
                )}
                {showWorkStatus && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.workStartedAt ? (
                      <span className="text-sm text-gray-900">
                        {new Date(user.workStartedAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Not started</span>
                    )}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => viewPassword(user._id, user.name)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Password
                  </button>
                  {!user.isPenalized && (
                    <button
                      onClick={() => penalizeUser(user._id, user.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Penalize
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-bold text-gray-900 mb-4">User Password</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">User: {selectedUser?.name}</p>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800 mb-2">⚠️ Security Warning: Viewing plaintext passwords is not recommended for security reasons.</p>
                  <p className="font-mono text-sm bg-white p-2 rounded border">{userPassword}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedUser(null);
                    setUserPassword('');
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// SubmittedWorkTable Component
const SubmittedWorkTable = ({ title, data, onRefresh }) => {
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);

  const viewWork = async (userId, userName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/work`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedWork({ userName: userName, ...response.data });
      setShowWorkModal(true);
    } catch (error) {
      alert('Failed to fetch work: ' + (error.response?.data?.message || error.message));
    }
  };

  const penalizeUser = async (userId, userName) => {
    const reason = prompt(`Enter reason for penalizing ${userName}:`);
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/penalize`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`${userName} has been penalized successfully!`);
      onRefresh();
    } catch (error) {
      alert('Failed to penalize user: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title} ({data.length})</h3>
        <button
          onClick={onRefresh}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.work?.isSubmitted ? 'Submitted' : 'In Progress'}
                  </div>
                  {user.work?.submittedAt && (
                    <div className="text-sm text-gray-500">
                      {new Date(user.work.submittedAt).toLocaleString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.workStartedAt && (
                    <span className="text-sm text-gray-900">
                      Started: {new Date(user.workStartedAt).toLocaleDateString()}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.isPenalized ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Penalized</span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => viewWork(user._id, user.name)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Work
                  </button>
                  {!user.isPenalized && (
                    <button
                      onClick={() => penalizeUser(user._id, user.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Penalize
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Work Content Modal */}
      {showWorkModal && selectedWork && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Work Content - {selectedWork.userName}</h3>
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Started: {selectedWork.user?.workStartedAt ? new Date(selectedWork.user.workStartedAt).toLocaleString() : 'N/A'}</p>
                    <p className="text-sm text-gray-600">Submitted: {selectedWork.user?.workSubmitted ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    {selectedWork.work?.submittedAt && (
                      <p className="text-sm text-gray-600">Submission Time: {new Date(selectedWork.work.submittedAt).toLocaleString()}</p>
                    )}
                    {selectedWork.work?.lastSaved && (
                      <p className="text-sm text-gray-600">Last Saved: {new Date(selectedWork.work.lastSaved).toLocaleString()}</p>
                    )}
                  </div>
                </div>
                <div className="border rounded p-4 bg-gray-50 max-h-96 overflow-y-auto">
                  <h4 className="font-medium mb-2">Work Content:</h4>
                  <div className="whitespace-pre-wrap text-sm">
                    {selectedWork.work?.content || 'No content available'}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowWorkModal(false);
                    setSelectedWork(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// PenalizedWorkTable Component
const PenalizedWorkTable = ({ title, data, onRefresh }) => {
  const removePenalty = async (userId, userName) => {
    if (!confirm(`Are you sure you want to remove penalty from ${userName}?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/remove-penalty`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Penalty removed from ${userName} successfully!`);
      onRefresh();
    } catch (error) {
      alert('Failed to remove penalty: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title} ({data.length})</h3>
        <button
          onClick={onRefresh}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penalty Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Penalized</span>
                    {user.penalizedAt && (
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(user.penalizedAt).toLocaleString()}
                      </div>
                    )}
                    {user.penalizedReason && (
                      <div className="text-sm text-gray-600 mt-1">
                        Reason: {user.penalizedReason.replace('_', ' ')}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.workSubmitted ? 'Submitted' : user.workStartedAt ? 'In Progress' : 'Not Started'}
                  </div>
                  {user.workStartedAt && (
                    <div className="text-sm text-gray-500">
                      Started: {new Date(user.workStartedAt).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => removePenalty(user._id, user.name)}
                    className="text-green-600 hover:text-green-900"
                  >
                    Remove Penalty
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
