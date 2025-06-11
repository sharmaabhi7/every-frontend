import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    alternativeMobileNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const { register, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (!formData.mobileNumber) newErrors.mobileNumber = 'Mobile number is required';
    else if (!/^\d{10}$/.test(formData.mobileNumber)) newErrors.mobileNumber = 'Mobile number must be 10 digits';

    if (formData.alternativeMobileNumber && !/^\d{10}$/.test(formData.alternativeMobileNumber)) {
      newErrors.alternativeMobileNumber = 'Alternative mobile number must be 10 digits';
    }

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    try {
      console.log('Submitting registration form with data:', {
        name: formData.name,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        alternativeMobileNumber: formData.alternativeMobileNumber || '',
        password: formData.password
      });

      const response = await register({
        name: formData.name,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        alternativeMobileNumber: formData.alternativeMobileNumber || '',
        password: formData.password
      });

      console.log('Registration response:', response);
      alert('Registration successful! Please check your email for OTP.');
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setSubmitError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <input
                id="mobileNumber"
                name="mobileNumber"
                type="text"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.mobileNumber ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Mobile Number"
                value={formData.mobileNumber}
                onChange={handleChange}
              />
              {errors.mobileNumber && <p className="mt-2 text-sm text-red-600">{errors.mobileNumber}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="alternativeMobileNumber" className="block text-sm font-medium text-gray-700">
                Alternative Mobile Number (Optional)
              </label>
              <input
                id="alternativeMobileNumber"
                name="alternativeMobileNumber"
                type="text"
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.alternativeMobileNumber ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Alternative Mobile Number"
                value={formData.alternativeMobileNumber}
                onChange={handleChange}
              />
              {errors.alternativeMobileNumber && (
                <p className="mt-2 text-sm text-red-600">{errors.alternativeMobileNumber}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {submitError && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
              {submitError}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>

          <div className="text-sm text-center">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;