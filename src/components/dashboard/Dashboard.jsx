import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStartWorkModal, setShowStartWorkModal] = useState(false);
  const [workFormData, setWorkFormData] = useState({
    projectLink: '',
    password: ''
  });
  const [submittingWork, setSubmittingWork] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleStartWorkClick = () => {
    setShowStartWorkModal(true);
  };

  const handleWorkFormChange = (e) => {
    setWorkFormData({
      ...workFormData,
      [e.target.name]: e.target.value
    });
  };

  const startWork = async () => {
    if (!workFormData.projectLink || !workFormData.password) {
      alert('Please fill in both project link and password');
      return;
    }

    try {
      setSubmittingWork(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/work/start`, {
        projectLink: workFormData.projectLink,
        password: workFormData.password
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Work started successfully! Admin has been notified.');
      setShowStartWorkModal(false);
      setWorkFormData({ projectLink: '', password: '' });
      navigate('/work-editor');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to start work');
    } finally {
      setSubmittingWork(false);
    }
  };

  const continueWork = () => {
    navigate('/work-editor');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'submitted': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'not_started': return 'Not Started';
      case 'in_progress': return 'In Progress';
      case 'submitted': return 'Submitted';
      case 'overdue': return 'Overdue';
      default: return 'Unknown';
    }
  };

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
            onClick={fetchDashboardData}
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
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/profile')}
                className="px-4 py-2 text-indigo-600 hover:text-indigo-800"
              >
                Profile
              </button>
              <button
                onClick={() => navigate('/view-agreement')}
                className="px-4 py-2 text-green-600 hover:text-green-800"
              >
                View Agreement
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Work Status Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">W</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Work Status</dt>
                      <dd className="flex items-baseline">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(dashboardData.workStatus)}`}>
                          {getStatusText(dashboardData.workStatus)}
                        </span>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Remaining Card */}
            {dashboardData.workStatus === 'in_progress' && (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">⏰</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Days Remaining</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {dashboardData.daysLeft} day{dashboardData.daysLeft !== 1 ? 's' : ''}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Penalty Status Card */}
            {dashboardData.user.isPenalized && (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">⚠</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Status</dt>
                        <dd className="text-lg font-medium text-red-600">Penalized</dd>
                        {dashboardData.user.penalizedReason && (
                          <dd className="text-sm text-gray-500 mt-1">
                            Reason: {dashboardData.user.penalizedReason}
                          </dd>
                        )}
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Review Status Card */}
            {dashboardData.workStatus === 'submitted' && dashboardData.work?.submittedAt && (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">📋</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Review Status</dt>
                        <dd className="text-lg font-medium text-blue-600">Under Review</dd>
                        <dd className="text-sm text-gray-500 mt-1">
                          Review deadline: {new Date(new Date(dashboardData.work.submittedAt).getTime() + (24 * 60 * 60 * 1000)).toLocaleString()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Work Actions */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Work Management
                </h3>

                {dashboardData.workStatus === 'not_started' && (
                  <div className="text-center py-8">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Ready to Start?</h4>
                    <p className="text-gray-600 mb-6">
                      You have 4 days to complete your work once you start. Make sure you're ready!
                    </p>
                    <button
                      onClick={handleStartWorkClick}
                      className="px-6 py-3 bg-indigo-600 text-white text-lg font-medium rounded-md hover:bg-indigo-700"
                    >
                      Start Work
                    </button>
                  </div>
                )}

                {dashboardData.workStatus === 'in_progress' && (
                  <div className="text-center py-8">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Continue Your Work</h4>
                    <p className="text-gray-600 mb-6">
                      You have {dashboardData.daysLeft} day{dashboardData.daysLeft !== 1 ? 's' : ''} remaining to complete your work.
                    </p>
                    <button
                      onClick={continueWork}
                      className="px-6 py-3 bg-green-600 text-white text-lg font-medium rounded-md hover:bg-green-700"
                    >
                      Continue Work
                    </button>
                  </div>
                )}

                {dashboardData.workStatus === 'submitted' && (
                  <div className="text-center py-8">
                    <h4 className="text-xl font-semibold text-green-600 mb-2">Work Submitted!</h4>
                    <p className="text-gray-600 mb-4">
                      Congratulations! You have successfully submitted your work.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h5 className="text-sm font-medium text-blue-900 mb-2">📋 Review Process</h5>
                      <p className="text-sm text-blue-700">
                        Your work will be reviewed within 24 hours. You will be notified of the results.
                      </p>
                      {dashboardData.work?.submittedAt && (
                        <p className="text-xs text-blue-600 mt-2">
                          Review deadline: {new Date(new Date(dashboardData.work.submittedAt).getTime() + (24 * 60 * 60 * 1000)).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Submitted on: {new Date(dashboardData.work?.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                )}

                {dashboardData.workStatus === 'overdue' && (
                  <div className="text-center py-8">
                    <h4 className="text-xl font-semibold text-red-600 mb-2">Work Overdue</h4>
                    <p className="text-gray-600 mb-6">
                      Unfortunately, the deadline has passed. You have been penalized.
                    </p>
                    {!dashboardData.user.workSubmitted && (
                      <button
                        onClick={continueWork}
                        className="px-6 py-3 bg-gray-600 text-white text-lg font-medium rounded-md hover:bg-gray-700"
                      >
                        View Work (Read Only)
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Start Work Modal */}
      {showStartWorkModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Start Work</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide the project link and password to begin your work.
              </p>

              <div className="mb-4">
                <label htmlFor="projectLink" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Link *
                </label>
                <input
                  type="url"
                  id="projectLink"
                  name="projectLink"
                  value={workFormData.projectLink}
                  onChange={handleWorkFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://example.com/project"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={workFormData.password}
                  onChange={handleWorkFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter password"
                  required
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Important:</strong> Once you start work, you have exactly 4 days to complete and submit it.
                  The admin will be notified immediately when you begin.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowStartWorkModal(false);
                    setWorkFormData({ projectLink: '', password: '' });
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  disabled={submittingWork}
                >
                  Cancel
                </button>
                <button
                  onClick={startWork}
                  disabled={submittingWork || !workFormData.projectLink || !workFormData.password}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submittingWork ? 'Starting...' : 'Start Work'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
