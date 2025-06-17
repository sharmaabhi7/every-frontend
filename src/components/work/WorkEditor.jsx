import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import QuillEditor from '../common/QuillEditor';
import axios from 'axios';

const WorkEditor = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [pdfs, setPdfs] = useState([]);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [showPDFSidebar, setShowPDFSidebar] = useState(false);
  const navigate = useNavigate();
  const autoSaveRef = useRef();

  useEffect(() => {
    console.log('WorkEditor: Component mounted, loading draft and checking work status');
    loadDraft();
    checkWorkStatus();
    loadPDFs();

    // Auto-save every 30 seconds
    autoSaveRef.current = setInterval(() => {
      if (content && !isReadOnly) {
        saveDraft(false);
      }
    }, 30000);

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Update time remaining every minute
    const timer = setInterval(() => {
      updateTimeRemaining();
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const loadDraft = async () => {
    try {
      console.log('WorkEditor: Loading draft...');
      const token = localStorage.getItem('token');
      console.log('WorkEditor: Token found:', !!token);

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/work/draft`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      console.log('WorkEditor: Draft response:', response.data);

      if (response.data.work) {
        setContent(response.data.work.content || '');
        setLastSaved(response.data.work.lastSaved);
        console.log('WorkEditor: Draft loaded successfully');
      } else {
        console.log('WorkEditor: No existing draft found');
      }
      setLoading(false);
    } catch (error) {
      console.error('WorkEditor: Failed to load draft:', error);
      setLoading(false);
    }
  };

  const loadPDFs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/work/pdfs`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      setPdfs(response.data.pdfs || []);
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    }
  };

  const checkWorkStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      const { workStatus, timeRemaining: remaining } = response.data;
      setTimeRemaining(remaining);

      if (workStatus === 'submitted' || workStatus === 'overdue') {
        setIsReadOnly(true);
      }
    } catch (error) {
      console.error('Failed to check work status:', error);
    }
  };

  const updateTimeRemaining = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      setTimeRemaining(response.data.timeRemaining);

      if (response.data.workStatus === 'overdue') {
        setIsReadOnly(true);
      }
    } catch (error) {
      console.error('Failed to update time remaining:', error);
    }
  };

  const saveDraft = async (showMessage = true) => {
    if (isReadOnly) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/work/save-draft`,
        { content },
        { 
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true 
        }
      );

      setLastSaved(response.data.work.lastSaved);
      if (showMessage) {
        alert('Draft saved successfully!');
      }
    } catch (error) {
      if (showMessage) {
        alert('Failed to save draft');
      }
    } finally {
      setSaving(false);
    }
  };

  const submitWork = async () => {
    if (isReadOnly) return;

    if (!content.trim()) {
      alert('Please add some content before submitting');
      return;
    }

    if (!confirm('Are you sure you want to submit your work? This action cannot be undone.')) {
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/work/submit`,
        { content },
        { 
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true 
        }
      );

      const { message, reviewDeadline } = response.data;
      const reviewDate = reviewDeadline ? new Date(reviewDeadline).toLocaleString() : '';

      alert(`${message}${reviewDate ? `\n\nReview deadline: ${reviewDate}` : ''}`);
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit work');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeRemaining = (milliseconds) => {
    if (!milliseconds) return 'Time expired';

    const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000));
    const hours = Math.floor((milliseconds % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));

    return `${days}d ${hours}h ${minutes}m`;
  };

  const downloadPDF = async (pdf) => {
    try {
      const token = localStorage.getItem('token');

      // Use work endpoint for PDF downloads (accessible to all authenticated users)
      const endpoint = `${import.meta.env.VITE_API_URL}/api/work/pdfs/${pdf._id}/download`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', pdf.originalName || `${pdf.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download PDF: ' + (error.response?.data?.message || error.message));
    }
  };

  // Custom modules and formats are now handled in QuillEditor component

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isReadOnly ? 'Work Viewer' : 'Work Editor'}
              </h1>
              {timeRemaining && timeRemaining > 0 && (
                <p className="text-sm text-gray-600">
                  Time remaining: <span className="font-medium text-red-600">
                    {formatTimeRemaining(timeRemaining)}
                  </span>
                </p>
              )}
              {timeRemaining && timeRemaining <= 0 && (
                <p className="text-sm text-red-600 font-medium">Time expired</p>
              )}
            </div>

            <div className="flex space-x-4">
              {lastSaved && (
                <span className="text-sm text-gray-500 self-center">
                  Last saved: {new Date(lastSaved).toLocaleString()}
                </span>
              )}

              {pdfs.length > 0 && (
                <button
                  onClick={() => setShowPDFSidebar(!showPDFSidebar)}
                  className={`px-4 py-2 rounded ${
                    showPDFSidebar
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  📄 PDFs ({pdfs.length})
                </button>
              )}

              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Back to Dashboard
              </button>

              {!isReadOnly && (
                <>
                  <button
                    onClick={() => saveDraft(true)}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Draft'}
                  </button>

                  <button
                    onClick={submitWork}
                    disabled={submitting}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Work'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
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
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            {(pdf.fileSize / 1024 / 1024).toFixed(2)} MB
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadPDF(pdf);
                            }}
                            className="text-xs text-indigo-600 hover:text-indigo-800"
                          >
                            📥 Download
                          </button>
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedPDF && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-900">{selectedPDF.title}</h4>
                        <button
                          onClick={() => downloadPDF(selectedPDF)}
                          className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        >
                          📥 Download
                        </button>
                      </div>
                      <div className="border border-gray-300 rounded">
                        <iframe
                          src={`${import.meta.env.VITE_API_URL}/userpdf/${selectedPDF.filename}`}
                          className="w-full h-96"
                          title={selectedPDF.title}
                        />
                      </div>
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
                {isReadOnly && (
                  <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                    This work is in read-only mode. {timeRemaining <= 0 ? 'The deadline has passed.' : 'Work has been submitted.'}
                  </div>
                )}

                <QuillEditor
                  value={content}
                  onChange={setContent}
                  readOnly={isReadOnly}
                  style={{ height: '500px', marginBottom: '50px' }}
                  placeholder={isReadOnly ? '' : 'Start writing your work here...'}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkEditor;
