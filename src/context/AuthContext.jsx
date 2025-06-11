import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      const userData = {
        id: localStorage.getItem('userId'),
        name: localStorage.getItem('userName'),
        email: localStorage.getItem('userEmail'),
        role: localStorage.getItem('userRole')
      };
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('AuthContext: Making registration API call to:', `${import.meta.env.VITE_API_URL}/api/auth/register`);
      console.log('AuthContext: Registration data:', userData);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, userData);
      console.log('AuthContext: Registration API response:', response);
      setLoading(false);
      return response.data;
    } catch (error) {
      console.error('AuthContext: Registration API error:', error);
      setLoading(false);
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      setLoading(true);
      console.log('AuthContext: Making OTP verification API call');
      console.log('AuthContext: Email:', email, 'OTP:', otp);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, { email, otp });
      console.log('AuthContext: OTP verification response:', response);
      setLoading(false);
      return response.data;
    } catch (error) {
      console.error('AuthContext: OTP verification error:', error);
      setLoading(false);
      setError(error.response?.data?.message || 'OTP verification failed');
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });

      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userRole', user.role);

      setUser(user);
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const adminLogin = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/admin-login`, { email, password });

      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userRole', user.role);

      setUser(user);
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Admin login failed');
      throw error;
    }
  };

  const signAgreement = async (signature, token) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/sign-agreement`,
        { signature },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { token: newToken, user } = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userRole', user.role);

      setUser(user);
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Agreement signing failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        verifyOTP,
        login,
        adminLogin,
        signAgreement,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};