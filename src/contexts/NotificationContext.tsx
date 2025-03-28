import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { requestFCMToken } from '../firebase/config';
import { useAuth } from './AuthContext';

type NotificationPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

interface NotificationContextType {
  fcmToken: string | null;
  notificationPermissionStatus: NotificationPermissionStatus;
  requestPermission: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notificationPermissionStatus, setNotificationPermissionStatus] = 
    useState<NotificationPermissionStatus>('default');
  const { currentUser } = useAuth();

  // Check notification permission on mount
  useEffect(() => {
    checkNotificationPermission();
  }, []);

  // Try to get FCM token when user is logged in and permission is granted
  useEffect(() => {
    if (currentUser && notificationPermissionStatus === 'granted') {
      getAndSetFCMToken();
    }
  }, [currentUser, notificationPermissionStatus]);

  const checkNotificationPermission = () => {
    if (!('Notification' in window)) {
      setNotificationPermissionStatus('unsupported');
      return;
    }
    
    setNotificationPermissionStatus(Notification.permission as NotificationPermissionStatus);
  };

  const getAndSetFCMToken = async () => {
    try {
      const token = await requestFCMToken();
      if (token) {
        setFcmToken(token);
        console.log("FCM token set in context:", token);
      }
    } catch (error) {
      console.error("Error getting FCM token:", error);
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      setNotificationPermissionStatus('unsupported');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermissionStatus(permission as NotificationPermissionStatus);
      
      if (permission === 'granted') {
        getAndSetFCMToken();
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  const refreshToken = async () => {
    if (notificationPermissionStatus === 'granted') {
      await getAndSetFCMToken();
    } else {
      await requestPermission();
    }
  };

  const value = {
    fcmToken,
    notificationPermissionStatus,
    requestPermission,
    refreshToken
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
