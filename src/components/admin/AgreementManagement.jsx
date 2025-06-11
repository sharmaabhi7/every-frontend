import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AgreementManagement = () => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState(null);
  const [newAgreementContent, setNewAgreementContent] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchAgreements();
  }, []);
  
  const fetchAgreements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/agreements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAgreements(response.data.agreements);
      setLoading(false);
    } catch (error) {
      setError('Failed to load agreements');
      setLoading(false);
    }
  };
  
  const createAgreement = async (e) => {
    e.preventDefault();
    
    if (!newAgreementContent.trim()) {
      alert('Please enter agreement content');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/agreements`, 
        { content: newAgreementContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Agreement created successfully!');
      setShowCreateModal(false);
      setNewAgreementContent('');
      fetchAgreements();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create agreement');
    }
  };
  
  const updateAgreement = async (agreementId, content) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/agreements/${agreementId}`, 
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Agreement updated successfully!');
      setEditingAgreement(null);
      fetchAgreements();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update agreement');
    }
  };
  
  const deleteAgreement = async (agreementId, version) => {
    if (!confirm(`Are you sure you want to delete agreement version ${version}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/agreements/${agreementId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Agreement deleted successfully!');
      fetchAgreements();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete agreement');
    }
  };
  
  const defaultAgreementContent = `TERMS AND CONDITIONS AGREEMENT

By signing this agreement, you acknowledge and agree to the following terms and conditions:

1. WORK ASSIGNMENT
   - You will be assigned a work task that must be completed within 4 days of starting.
   - The work must be original and completed by you personally.
   - You may save drafts and continue working until submission.

2. DEADLINE COMPLIANCE
   - You have exactly 4 days (96 hours) from the time you start work to submit.
   - Failure to submit within the deadline will result in automatic penalties.
   - Daily reminders will be sent as the deadline approaches.

3. SUBMISSION REQUIREMENTS
   - All work must be submitted through the provided online editor.
   - Once submitted, no further changes can be made.
   - Submissions are final and binding.

4. PENALTIES
   - Late submission will result in automatic penalty status.
   - Penalized users may face restrictions on future assignments.

5. COMMUNICATION
   - All official communication will be sent to your registered email address.
   - You are responsible for checking your email regularly.
   - OTP verification is required for account security.

6. AGREEMENT MODIFICATIONS
   - These terms may be updated from time to time.
   - You will be notified of any significant changes.
   - Continued use of the platform constitutes acceptance of updated terms.

By providing your digital signature below, you confirm that you have read, understood, and agree to be bound by these terms and conditions.

Date: [Current Date]
Signature: [Digital Signature Required]`;
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agreements...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Agreement Management</h1>
              <p className="text-gray-600">Manage agreement content and versions</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setNewAgreementContent(defaultAgreementContent);
                  setShowCreateModal(true);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Create Agreement
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
          
          {/* Current Agreement */}
          {agreements.length > 0 && (
            <div className="mb-8 bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-green-50">
                <h3 className="text-lg leading-6 font-medium text-green-900">
                  Current Agreement (Version {agreements[0].version})
                </h3>
                <p className="text-sm text-green-700">This is the agreement shown to new users</p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto border">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700">
                    {agreements[0].content}
                  </pre>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Created: {new Date(agreements[0].createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => setEditingAgreement(agreements[0])}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Edit Current Agreement
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* All Agreements */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                All Agreement Versions ({agreements.length})
              </h3>
              <p className="text-sm text-gray-500">Manage all agreement versions</p>
            </div>
            
            {agreements.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No agreements found</p>
                <button
                  onClick={() => {
                    setNewAgreementContent(defaultAgreementContent);
                    setShowCreateModal(true);
                  }}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Create First Agreement
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {agreements.map((agreement) => (
                  <li key={agreement._id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-indigo-600">
                            Version {agreement.version}
                            {agreement.version === agreements[0].version && (
                              <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Current
                              </span>
                            )}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="text-sm text-gray-500">
                              {new Date(agreement.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {agreement.content.substring(0, 150)}...
                          </p>
                        </div>
                      </div>
                      <div className="ml-4 flex space-x-2">
                        <button
                          onClick={() => setEditingAgreement(agreement)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteAgreement(agreement._id, agreement.version)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
      
      {/* Create Agreement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Agreement</h3>
            
            <form onSubmit={createAgreement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agreement Content
                </label>
                <textarea
                  value={newAgreementContent}
                  onChange={(e) => setNewAgreementContent(e.target.value)}
                  className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md resize-none"
                  placeholder="Enter agreement content..."
                  required
                />
              </div>
              
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
                  Create Agreement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Agreement Modal */}
      {editingAgreement && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Edit Agreement (Version {editingAgreement.version})
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agreement Content
                </label>
                <textarea
                  value={editingAgreement.content}
                  onChange={(e) => setEditingAgreement({ ...editingAgreement, content: e.target.value })}
                  className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md resize-none"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setEditingAgreement(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateAgreement(editingAgreement._id, editingAgreement.content)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Update Agreement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgreementManagement;
