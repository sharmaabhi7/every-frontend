import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPassword, setUserPassword] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    alternativeMobileNumber: '',
    password: '',
    role: 'user'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setUsers(response.data.users);
      setLoading(false);
    } catch (error) {
      setError('Failed to load users');
      setLoading(false);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/users`, newUser, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      alert('User created successfully! OTP sent to email.');
      setShowCreateModal(false);
      setNewUser({
        name: '',
        email: '',
        mobileNumber: '',
        alternativeMobileNumber: '',
        password: '',
        role: 'user'
      });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create user');
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`, updates, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      alert('User updated successfully!');
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user');
    }
  };

  const deleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      alert('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const sendOTP = async (userId, userName) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/send-otp`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      alert(`OTP sent to ${userName} successfully!`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const sendAgreementLink = async (userId, userName) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/send-agreement`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      alert(`Agreement link and OTP sent to ${userName} successfully!`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send agreement link');
    }
  };

  const viewPassword = async (userId, userName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/password`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
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
        { 
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      alert(`${userName} has been penalized successfully!`);
      fetchUsers();
    } catch (error) {
      alert('Failed to penalize user: ' + (error.response?.data?.message || error.message));
    }
  };

  const removePenalty = async (userId, userName) => {
    if (!confirm(`Are you sure you want to remove penalty from ${userName}?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/remove-penalty`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      alert(`Penalty removed from ${userName} successfully!`);
      fetchUsers();
    } catch (error) {
      alert('Failed to remove penalty: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusBadge = (user) => {
    if (user.isPenalized) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Penalized</span>;
    }
    if (user.workSubmitted) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Submitted</span>;
    }
    if (user.workStartedAt) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Working</span>;
    }
    if (user.isSignedAgreement) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Signed</span>;
    }
    if (user.isVerified) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Verified</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Pending</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">Manage all users in the system</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Create User
              </button>
              <button
                onClick={() => navigate('/admin-dashboard')}
                className="px-4 py-2 text-indigo-600 hover:text-indigo-800"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                All Users ({users.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.mobileNumber}</div>
                        {user.alternativeMobileNumber && (
                          <div className="text-sm text-gray-500">{user.alternativeMobileNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => viewPassword(user._id, user.name)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            View Password
                          </button>
                          <button
                            onClick={() => sendOTP(user._id, user.name)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Send OTP
                          </button>
                          <button
                            onClick={() => sendAgreementLink(user._id, user.name)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Send Agreement
                          </button>
                          <button
                            onClick={() => setEditingUser(user)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          {user.isPenalized ? (
                            <button
                              onClick={() => removePenalty(user._id, user.name)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Remove Penalty
                            </button>
                          ) : (
                            <button
                              onClick={() => penalizeUser(user._id, user.name)}
                              className="text-orange-600 hover:text-orange-900"
                            >
                              Penalize
                            </button>
                          )}
                          <button
                            onClick={() => deleteUser(user._id, user.name)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New User</h3>

            <form onSubmit={createUser} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="text"
                placeholder="Mobile Number"
                value={newUser.mobileNumber}
                onChange={(e) => setNewUser({ ...newUser, mobileNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="text"
                placeholder="Alternative Mobile (Optional)"
                value={newUser.alternativeMobileNumber}
                onChange={(e) => setNewUser({ ...newUser, alternativeMobileNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit User</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                <input
                  type="text"
                  value={editingUser.mobileNumber}
                  onChange={(e) => setEditingUser({ ...editingUser, mobileNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingUser.isVerified}
                    onChange={(e) => setEditingUser({ ...editingUser, isVerified: e.target.checked })}
                    className="mr-2"
                  />
                  Verified
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingUser.isSignedAgreement}
                    onChange={(e) => setEditingUser({ ...editingUser, isSignedAgreement: e.target.checked })}
                    className="mr-2"
                  />
                  Signed Agreement
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingUser.isPenalized}
                    onChange={(e) => setEditingUser({ ...editingUser, isPenalized: e.target.checked })}
                    className="mr-2"
                  />
                  Penalized
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    updateUser(editingUser._id, {
                      name: editingUser.name,
                      mobileNumber: editingUser.mobileNumber,
                      isVerified: editingUser.isVerified,
                      isSignedAgreement: editingUser.isSignedAgreement,
                      isPenalized: editingUser.isPenalized
                    });
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Update User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default UserManagement;
