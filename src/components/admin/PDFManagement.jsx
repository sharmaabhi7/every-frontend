import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PDFManagement = () => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    file: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPDFs();
  }, []);

  const fetchPDFs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/pdfs`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      setPdfs(response.data.pdfs || []);
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadData({ ...uploadData, file });
    } else {
      alert('Please select a valid PDF file');
      e.target.value = '';
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadData.file || !uploadData.title.trim()) {
      alert('Please provide a title and select a PDF file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('pdf', uploadData.file);
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/pdfs/upload`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );
      
      alert('PDF uploaded successfully!');
      setShowUploadModal(false);
      setUploadData({ title: '', description: '', file: null });
      fetchPDFs();
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Failed to upload PDF');
    } finally {
      setUploading(false);
    }
  };

  const togglePDFStatus = async (pdfId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/admin/pdfs/${pdfId}/toggle`,
        { isActive: !currentStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      fetchPDFs();
    } catch (error) {
      console.error('Error toggling PDF status:', error);
      alert('Failed to update PDF status');
    }
  };

  const deletePDF = async (pdfId, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/pdfs/${pdfId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      alert('PDF deleted successfully');
      fetchPDFs();
    } catch (error) {
      console.error('Error deleting PDF:', error);
      alert('Failed to delete PDF');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
              <h1 className="text-3xl font-bold text-gray-900">PDF Management</h1>
              <p className="text-gray-600">Manage PDFs available to users during work</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Upload PDF
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
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Uploaded PDFs ({pdfs.length})
              </h3>
              
              {pdfs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    <div className="text-4xl mb-4">📄</div>
                    <h3 className="text-lg font-medium">No PDFs uploaded</h3>
                    <p className="text-sm">Upload PDFs that users can view during work</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {pdfs.map((pdf) => (
                    <div key={pdf._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="text-2xl mr-3">📄</div>
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">{pdf.title}</h4>
                              <p className="text-sm text-gray-500">{pdf.description}</p>
                              <div className="text-xs text-gray-400 mt-1">
                                {formatFileSize(pdf.fileSize)} • Uploaded {new Date(pdf.uploadedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            pdf.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {pdf.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => togglePDFStatus(pdf._id, pdf.isActive)}
                            className={`px-3 py-1 text-sm rounded ${
                              pdf.isActive 
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {pdf.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => deletePDF(pdf._id, pdf.title)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Upload PDF</h3>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">PDF File</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="mt-1 block w-full"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
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

export default PDFManagement;
