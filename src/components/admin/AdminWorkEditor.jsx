import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QuillEditor from '../common/QuillEditor';
import axios from 'axios';

const AdminWorkEditor = () => {
  const { userId } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [userData, setUserData] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [showPDFSidebar, setShowPDFSidebar] = useState(false);
  const [showStartWorkModal, setShowStartWorkModal] = useState(false);
  const [workFormData, setWorkFormData] = useState({
    projectLink: '',
    password: ''
  });
  const navigate = useNavigate();
  const autoSaveRef = useRef();

  useEffect(() => {
    if (userId) {
      loadUserWork();
      loadPDFs();
    }
  }, [userId]);

  useEffect(() => {
    // Auto-save every 30 seconds
    if (content && userData) {
      clearTimeout(autoSaveRef.current);
      autoSaveRef.current = setTimeout(() => {
        saveDraft(false);
      }, 30000);
    }

    return () => clearTimeout(autoSaveRef.current);
  }, [content]);

  const loadUserWork = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/work-edit`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );

      setUserData(response.data.user);
      if (response.data.work) {
        setContent(response.data.work.content || '');
        setLastSaved(response.data.work.lastSaved);
      }
    } catch (error) {
      console.error('Failed to load user work:', error);
      alert('Failed to load user work: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const loadPDFs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/pdfs/active`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      setPdfs(response.data.pdfs || []);
    } catch (error) {
      console.error('Failed to load PDFs:', error);
    }
  };

  const saveDraft = async (showMessage = true) => {
    if (!userData) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/work-save`,
        { content },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );

      setLastSaved(response.data.work.lastSaved);
      if (showMessage) {
        alert('Work saved successfully!');
      }
    } catch (error) {
      if (showMessage) {
        alert('Failed to save work: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStartWork = async (e) => {
    e.preventDefault();
    
    if (!workFormData.projectLink.trim() || !workFormData.password.trim()) {
      alert('Please provide both project link and password');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/start-work`,
        workFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );

      alert('Work started successfully for user!');
      setShowStartWorkModal(false);
      setWorkFormData({ projectLink: '', password: '' });
      loadUserWork(); // Reload to get updated data
    } catch (error) {
      alert('Failed to start work: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user work...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load user data</p>
          <button
            onClick={() => navigate('/admin-dashboard')}
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
              <h1 className="text-3xl font-bold text-gray-900">
                Edit Work - {userData.name}
              </h1>
              <p className="text-gray-600">{userData.email}</p>
              {lastSaved && (
                <p className="text-sm text-gray-500">
                  Last saved: {new Date(lastSaved).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex space-x-4">
              {!userData.workStartedAt && (
                <button
                  onClick={() => setShowStartWorkModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Start Work for User
                </button>
              )}
              {pdfs.length > 0 && (
                <button
                  onClick={() => setShowPDFSidebar(!showPDFSidebar)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {showPDFSidebar ? 'Hide' : 'Show'} Reference PDFs
                </button>
              )}
              <button
                onClick={() => saveDraft(true)}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Work'}
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
          {/* User Info */}
          <div className="mb-6 bg-white shadow rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Work Status:</span>
                <p className="text-sm text-gray-900">
                  {userData.workStartedAt ? 'Started' : 'Not Started'}
                  {userData.workSubmitted && ' (Submitted)'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Started At:</span>
                <p className="text-sm text-gray-900">
                  {userData.workStartedAt 
                    ? new Date(userData.workStartedAt).toLocaleString()
                    : 'Not started'
                  }
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Submitted:</span>
                <p className="text-sm text-gray-900">
                  {userData.workSubmitted ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            {/* PDF Sidebar */}
            {showPDFSidebar && pdfs.length > 0 && (
              <div className="w-1/3 bg-white shadow rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Reference Documents</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                    {pdfs.map((pdf) => (
                      <button
                        key={pdf._id}
                        onClick={() => setSelectedPDF(pdf)}
                        className={`w-full text-left p-2 rounded border ${
                          selectedPDF?._id === pdf._id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {pdf.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(pdf.fileSize / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedPDF && (
                    <div className="border border-gray-300 rounded">
                      <iframe
                        src={`${import.meta.env.VITE_API_URL}/userpdf/${selectedPDF.filename}`}
                        className="w-full h-96"
                        title={selectedPDF.title}
                      />
                    </div>
                  )}

                  {!selectedPDF && (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-2xl mb-2">📄</div>
                      <p className="text-sm">Select a document to view</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Editor */}
            <div className={`${showPDFSidebar && pdfs.length > 0 ? 'w-2/3' : 'w-full'} bg-white shadow rounded-lg`}>
              <div className="p-6">
                <QuillEditor
                  value={content}
                  onChange={setContent}
                  readOnly={false}
                  style={{ height: '500px', marginBottom: '50px' }}
                  placeholder="Edit user's work here..."
                />
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
              <h3 className="text-lg font-bold text-gray-900 mb-4">Start Work for {userData.name}</h3>
              <form onSubmit={handleStartWork} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project Link</label>
                  <input
                    type="url"
                    value={workFormData.projectLink}
                    onChange={(e) => setWorkFormData({ ...workFormData, projectLink: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="text"
                    value={workFormData.password}
                    onChange={(e) => setWorkFormData({ ...workFormData, password: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowStartWorkModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Start Work
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWorkEditor;
