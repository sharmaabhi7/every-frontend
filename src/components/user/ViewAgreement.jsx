import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const ViewAgreement = () => {
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAgreement();
  }, []);

  const fetchAgreement = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/get-agreement/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAgreement(response.data.agreement);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load agreement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agreement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 text-lg font-medium">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Back to Dashboard
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
              <h1 className="text-3xl font-bold text-gray-900">My Signed Agreement</h1>
              <p className="text-gray-600">View your digitally signed agreement</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Agreement Info Card */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Agreement Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Signed By</dt>
                  <dd className="mt-1 text-sm text-gray-900">{agreement.userName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{agreement.userEmail}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Mobile Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{agreement.userMobileNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Signed Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(agreement.signedAt).toLocaleString()}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Agreement Content */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Agreement Content
              </h3>
              <div className="border rounded-lg p-6 bg-gray-50 max-h-96 overflow-y-auto">
                <div 
                  className="prose max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: agreement.content }}
                />
              </div>
            </div>
          </div>

          {/* Digital Signature */}
          <div className="bg-white shadow rounded-lg mt-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Digital Signature
              </h3>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Your Digital Signature:</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
                    <img 
                      src={agreement.signature} 
                      alt="Digital Signature" 
                      className="max-h-24 mx-auto"
                      style={{ maxWidth: '300px' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    This signature was captured digitally on {new Date(agreement.signedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Download Info */}
          {agreement.pdfPath && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <div className="flex items-center">
                <div className="text-blue-600 mr-3">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900">PDF Copy Available</h4>
                  <p className="text-sm text-blue-700">
                    A PDF copy of your signed agreement was sent to your email address when you signed it.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Legal Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
            <div className="flex items-start">
              <div className="text-yellow-600 mr-3 mt-1">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-yellow-900">Legal Notice</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  This digitally signed agreement is legally binding. Please keep this for your records. 
                  If you have any questions about the terms, please contact the administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewAgreement;
