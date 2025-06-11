import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const UserProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    alternativeMobileNumber: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchProfile();
  }, []);
  
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const user = response.data.user;
      setProfile({
        name: user.name || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        alternativeMobileNumber: user.alternativeMobileNumber || ''
      });
      setLoading(false);
    } catch (error) {
      setError('Failed to load profile');
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!profile.name.trim()) {
      setError('Name is required');
      return;
    }
    
    if (!profile.mobileNumber.trim()) {
      setError('Mobile number is required');
      return;
    }
    
    if (!/^\d{10}$/.test(profile.mobileNumber)) {
      setError('Mobile number must be 10 digits');
      return;
    }
    
    if (profile.alternativeMobileNumber && !/^\d{10}$/.test(profile.alternativeMobileNumber)) {
      setError('Alternative mobile number must be 10 digits');
      return;
    }
    
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/profile`,
        {
          name: profile.name,
          mobileNumber: profile.mobileNumber,
          alternativeMobileNumber: profile.alternativeMobileNumber
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess('Profile updated successfully!');
      
      // Update localStorage
      localStorage.setItem('userName', profile.name);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
              <p className="text-gray-600">Manage your account information</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-indigo-600 hover:text-indigo-800"
              >
                Dashboard
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
      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                Profile Information
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={profile.email}
                    disabled
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm px-3 py-2 border cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>
                
                <div>
                  <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    name="mobileNumber"
                    id="mobileNumber"
                    value={profile.mobileNumber}
                    onChange={handleChange}
                    maxLength="10"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>
                
                <div>
                  <label htmlFor="alternativeMobileNumber" className="block text-sm font-medium text-gray-700">
                    Alternative Mobile Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="alternativeMobileNumber"
                    id="alternativeMobileNumber"
                    value={profile.alternativeMobileNumber}
                    onChange={handleChange}
                    maxLength="10"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                    placeholder="Enter 10-digit alternative mobile number"
                  />
                </div>
                
                {error && (
                  <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
