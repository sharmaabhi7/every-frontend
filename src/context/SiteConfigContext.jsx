import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SiteConfigContext = createContext();

export const useSiteConfig = () => {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
};

export const SiteConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({
    navbarTitle: 'DataEntry Pro',
    footerContactNumber: '+1 (555) 123-4567',
    footerAddress: '123 Business Street, City, State 12345',
    footerEmail: 'bforboll81@gmail.com'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/site-config`
      );
      setConfig(response.data.config);
    } catch (error) {
      console.error('Error fetching site config:', error);
      // Keep default values if fetch fails
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/site-config`,
        newConfig,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      setConfig(response.data.config);
      return { success: true };
    } catch (error) {
      console.error('Error updating site config:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update configuration' 
      };
    }
  };

  const value = {
    config,
    loading,
    updateConfig,
    refreshConfig: fetchConfig
  };

  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export default SiteConfigContext;
