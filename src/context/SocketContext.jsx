import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import PropTypes from 'prop-types';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [workStartNotifications, setWorkStartNotifications] = useState([]);

  useEffect(() => {
    // Only connect if user is admin
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'admin') {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
      
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
        // Join admin room for notifications
        newSocket.emit('join-admin');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      // Listen for work start notifications
      newSocket.on('work-started', (data) => {
        console.log('Work started notification:', data);
        setWorkStartNotifications(prev => [data, ...prev.slice(0, 9)]); // Keep last 10 notifications
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification('New Work Started', {
            body: `${data.userName} has started work`,
            icon: '/favicon.ico'
          });
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const clearNotifications = () => {
    setWorkStartNotifications([]);
  };

  const value = {
    socket,
    isConnected,
    workStartNotifications,
    clearNotifications
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
