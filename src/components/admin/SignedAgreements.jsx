import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignedAgreements = () => {
  const [signedAgreements, setSignedAgreements] = useState([]);
  const [filteredAgreements, setFilteredAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSignedAgreements();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAgreements(signedAgreements);
    } else {
      const filtered = signedAgreements.filter(agreement =>
        agreement.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agreement.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agreement.userMobileNumber?.includes(searchQuery)
      );
      setFilteredAgreements(filtered);
    }
  }, [signedAgreements, searchQuery]);

  const fetchSignedAgreements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/signed-agreements`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setSignedAgreements(response.data.signedAgreements);
      setLoading(false);
    } catch (error) {
      setError('Failed to load signed agreements');
      setLoading(false);
    }
  };

  const viewAgreementDetails = async (agreementId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/signed-agreements/${agreementId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setSelectedAgreement(response.data.signedAgreement);
      setShowModal(true);
    } catch (error) {
      alert('Failed to load agreement details: ' + (error.response?.data?.message || error.message));
    }
  };

  const sendAgreementPDF = async (agreementId, userName) => {
    if (!confirm(`Send signed agreement PDF to ${userName}?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/signed-agreements/${agreementId}/send-pdf`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      alert(`Signed agreement PDF sent to ${userName} successfully!`);
    } catch (error) {
      alert('Failed to send PDF: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading signed agreements...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Signed Agreements</h1>
              <p className="text-gray-600">View and manage all signed agreements</p>
            </div>
            <div className="flex space-x-4">
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

          {/* Search Bar */}
          <div className="mb-6 bg-white shadow rounded-lg p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <label htmlFor="search" className="sr-only">Search agreements</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    id="search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Search by name, email, or mobile number..."
                  />
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {filteredAgreements.length} of {signedAgreements.length} agreements
              </div>
            </div>
          </div>

          {/* Signed Agreements Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Signed Agreements ({filteredAgreements.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agreement Version
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Signed Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Signature Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAgreements.map((agreement) => (
                    <tr key={agreement._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{agreement.userName}</div>
                          <div className="text-sm text-gray-500">{agreement.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{agreement.userMobileNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Version {agreement.agreementId?.version || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(agreement.signedAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          ✓ Digitally Signed
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => viewAgreementDetails(agreement._id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => sendAgreementPDF(agreement._id, agreement.userName)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Send PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredAgreements.length === 0 && signedAgreements.length > 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium">No agreements match your search</h3>
                  <p className="text-sm">Try adjusting your search terms.</p>
                </div>
              </div>
            )}

            {signedAgreements.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-medium">No signed agreements found</h3>
                  <p className="text-sm">Signed agreements will appear here once users sign them.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Agreement Details Modal */}
      {showModal && selectedAgreement && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Signed Agreement Details</h3>
              
              {/* User Information */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Signatory Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Name:</span>
                    <p className="text-sm text-gray-900">{selectedAgreement.userName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <p className="text-sm text-gray-900">{selectedAgreement.userEmail}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Mobile:</span>
                    <p className="text-sm text-gray-900">{selectedAgreement.userMobileNumber}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm font-medium text-gray-500">Signed Date:</span>
                  <p className="text-sm text-gray-900">{new Date(selectedAgreement.signedAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Digital Signature */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Digital Signature</h4>
                {selectedAgreement.signature ? (
                  <div className="border border-gray-300 rounded p-4 bg-white">
                    <img 
                      src={selectedAgreement.signature} 
                      alt="Digital Signature" 
                      className="max-w-xs max-h-24 border border-gray-200"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No signature available</p>
                )}
              </div>

              {/* Agreement Content */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Agreement Content</h4>
                <div className="max-h-96 overflow-y-auto border border-gray-300 rounded p-4 bg-gray-50">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700">
                    {selectedAgreement.agreementContent}
                  </pre>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => sendAgreementPDF(selectedAgreement._id, selectedAgreement.userName)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Send PDF to User
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedAgreement(null);
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

export default SignedAgreements;
