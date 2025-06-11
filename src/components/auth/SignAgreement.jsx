import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const SignAgreement = () => {
  const [agreement, setAgreement] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [signing, setSigning] = useState(false);
  const { signAgreement } = useContext(AuthContext);
  const { token } = useParams();
  const navigate = useNavigate();
  const sigCanvas = useRef();
  
  useEffect(() => {
    fetchAgreement();
  }, []);
  
  const fetchAgreement = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/agreement`);
      setAgreement(response.data.agreement.content);
      setLoading(false);
    } catch (error) {
      setError('Failed to load agreement');
      setLoading(false);
    }
  };
  
  const clearSignature = () => {
    sigCanvas.current.clear();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (sigCanvas.current.isEmpty()) {
      setError('Please provide your signature');
      return;
    }
    
    try {
      setSigning(true);
      const signatureData = sigCanvas.current.toDataURL();
      await signAgreement(signatureData, token);
      alert('Agreement signed successfully! You can now log in.');
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to sign agreement');
      setSigning(false);
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
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-indigo-600">
            <h1 className="text-2xl font-bold text-white">Agreement Signing</h1>
            <p className="text-indigo-100">Please read the agreement carefully and provide your digital signature</p>
          </div>
          
          <div className="p-6">
            {/* Agreement Content */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Agreement Terms</h2>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto border">
                <div className="whitespace-pre-wrap text-sm text-gray-700">
                  {agreement || 'Default agreement content. Please read all terms and conditions carefully before signing.'}
                </div>
              </div>
            </div>
            
            {/* Signature Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Digital Signature</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <SignatureCanvas
                  ref={sigCanvas}
                  canvasProps={{
                    width: 500,
                    height: 200,
                    className: 'signature-canvas border rounded w-full'
                  }}
                />
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-sm text-gray-600">Sign above</p>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={signing}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {signing ? 'Signing...' : 'Sign Agreement'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignAgreement;
