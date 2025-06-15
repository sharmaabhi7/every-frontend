import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SiteConfigManagement = () => {
  const [config, setConfig] = useState({
    navbarTitle: '',
    footerContactNumber: '',
    footerAddress: '',
    footerEmail: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/site-config`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      setConfig(response.data.config);
    } catch (error) {
      console.error('Error fetching config:', error);
      setMessage('Error loading configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/site-config`,
        config,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      setMessage('Configuration updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating config:', error);
      setMessage('Error updating configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setConfig({
      ...config,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
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
              <h1 className="text-3xl font-bold text-gray-900">Site Configuration</h1>
              <p className="text-gray-600">Manage navbar title and footer information</p>
            </div>
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="px-4 py-2 text-indigo-600 hover:text-indigo-800"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Site Settings</h2>
              <p className="text-sm text-gray-500">
                Update the site branding and contact information displayed to users
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Navbar Title */}
              <div>
                <label htmlFor="navbarTitle" className="block text-sm font-medium text-gray-700">
                  Navbar Title
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="navbarTitle"
                    name="navbarTitle"
                    value={config.navbarTitle}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g., DataEntry Pro"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  This title will appear in the navigation bar across all pages
                </p>
              </div>

              {/* Footer Contact Number */}
              <div>
                <label htmlFor="footerContactNumber" className="block text-sm font-medium text-gray-700">
                  Footer Contact Number
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="footerContactNumber"
                    name="footerContactNumber"
                    value={config.footerContactNumber}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g., +1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Footer Address */}
              <div>
                <label htmlFor="footerAddress" className="block text-sm font-medium text-gray-700">
                  Footer Address
                </label>
                <div className="mt-1">
                  <textarea
                    id="footerAddress"
                    name="footerAddress"
                    rows={3}
                    value={config.footerAddress}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g., 123 Business Street, City, State 12345"
                  />
                </div>
              </div>

              {/* Footer Email */}
              <div>
                <label htmlFor="footerEmail" className="block text-sm font-medium text-gray-700">
                  Footer Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    id="footerEmail"
                    name="footerEmail"
                    value={config.footerEmail}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g., contact@company.com"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>

              {/* Message */}
              {message && (
                <div className={`p-4 rounded-md ${
                  message.includes('Error') 
                    ? 'bg-red-50 text-red-700' 
                    : 'bg-green-50 text-green-700'
                }`}>
                  {message}
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SiteConfigManagement;
