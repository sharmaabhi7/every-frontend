import { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const { verifyOTP, loading } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  if (!email) {
    navigate('/register');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      const response = await verifyOTP(email, otp);
      console.log('OTP verification response:', response);

      if (response.agreementLink) {
        alert('Email verified successfully! Redirecting to agreement signing...');
        window.open(response.agreementLink, '_blank');
      } else {
        alert('Email verified successfully! Please check your email for the agreement link.');
      }

      navigate('/login');
    } catch (error) {
      console.error('OTP verification error:', error);
      setError(error.response?.data?.message || 'OTP verification failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a 6-digit OTP to <span className="font-medium">{email}</span>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
              Enter OTP
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              maxLength="6"
              required
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>

          <div className="text-sm text-center">
            <p>
              Didn't receive the OTP?{' '}
              <button
                type="button"
                className="font-medium text-indigo-600 hover:text-indigo-500"
                onClick={() => navigate('/register')}
              >
                Go back to registration
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
