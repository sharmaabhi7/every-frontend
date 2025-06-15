import { useState, useEffect } from 'react';
import axios from 'axios';

const PDFViewer = ({ isOpen, onClose, onStartWork }) => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPDF, setSelectedPDF] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchPDFs();
    }
  }, [isOpen]);

  const fetchPDFs = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = () => {
    onStartWork();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white min-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            Review Documents Before Starting Work
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="flex h-[calc(90vh-120px)]">
            {/* PDF List Sidebar */}
            <div className="w-1/3 border-r border-gray-200 pr-4">
              <h4 className="font-medium text-gray-900 mb-4">Available Documents ({pdfs.length})</h4>
              {pdfs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">
                    <div className="text-4xl mb-4">📄</div>
                    <p className="text-sm">No documents available</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {pdfs.map((pdf) => (
                    <div
                      key={pdf._id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPDF?._id === pdf._id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedPDF(pdf)}
                    >
                      <div className="flex items-start">
                        <div className="text-2xl mr-3">📄</div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-gray-900 truncate">
                            {pdf.title}
                          </h5>
                          {pdf.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {pdf.description}
                            </p>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            {(pdf.fileSize / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 pl-4">
              {selectedPDF ? (
                <div className="h-full flex flex-col">
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900">{selectedPDF.title}</h4>
                    {selectedPDF.description && (
                      <p className="text-sm text-gray-600 mt-1">{selectedPDF.description}</p>
                    )}
                  </div>
                  <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden">
                    <iframe
                      src={`${import.meta.env.VITE_API_URL}/userpdf/${selectedPDF.filename}`}
                      className="w-full h-full"
                      title={selectedPDF.title}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-4">👈</div>
                    <p>Select a document from the list to view it</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {pdfs.length > 0 ? (
              <>
                📋 Please review all documents before starting your work. 
                These documents will be available during your work session.
              </>
            ) : (
              <>
                ⚠️ No documents are currently available. You can still proceed to start work.
              </>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleStartWork}
              className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Start Work
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
