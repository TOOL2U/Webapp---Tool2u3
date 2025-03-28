import { useEffect, useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { requestFCMToken } from '../firebase/config';

export default function NotificationManager() {
  const { fcmToken, notificationPermissionStatus, requestPermission, refreshToken } = useNotification();
  const [tokenCopied, setTokenCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [directToken, setDirectToken] = useState<string | null>(null);

  const copyTokenToClipboard = (token: string) => {
    navigator.clipboard.writeText(token);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 3000);
  };

  const handleRefreshToken = async () => {
    setIsRefreshing(true);
    await refreshToken();
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const getDirectToken = async () => {
    setIsRefreshing(true);
    try {
      const token = await requestFCMToken();
      if (token) {
        setDirectToken(token);
        console.log("Direct FCM token retrieved:", token);
      } else {
        console.log("Failed to get direct FCM token");
      }
    } catch (error) {
      console.error("Error getting direct FCM token:", error);
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    // Log current state for debugging
    console.log('NotificationManager state:', {
      fcmToken,
      directToken,
      notificationPermissionStatus
    });
  }, [fcmToken, directToken, notificationPermissionStatus]);

  // Try to get token directly on component mount if permission is granted
  useEffect(() => {
    if (notificationPermissionStatus === 'granted' && !fcmToken && !directToken) {
      getDirectToken();
    }
  }, [notificationPermissionStatus, fcmToken, directToken]);

  const displayToken = fcmToken || directToken;

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-2">Notification Settings</h2>
      
      {notificationPermissionStatus === 'unsupported' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-yellow-700">
            Your browser doesn't support notifications. Please use a modern browser like Chrome, Firefox, or Edge.
          </p>
        </div>
      )}
      
      {notificationPermissionStatus !== 'granted' && notificationPermissionStatus !== 'unsupported' && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Enable notifications to receive alerts when new orders come in.
          </p>
          <button
            onClick={requestPermission}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Enable Notifications
          </button>
        </div>
      )}
      
      {notificationPermissionStatus === 'granted' && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Your device is registered to receive notifications.
          </p>
          
          {displayToken ? (
            <>
              <p className="text-sm text-gray-600 mb-2">
                Use this token in make.com:
              </p>
              <div className="flex items-center">
                <div className="flex-1 bg-gray-100 p-2 rounded-md overflow-x-auto text-xs font-mono">
                  {displayToken}
                </div>
                <button
                  onClick={() => copyTokenToClipboard(displayToken)}
                  className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {tokenCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </>
          ) : (
            <div className="mt-2">
              <p className="text-sm text-amber-600 mb-2">
                FCM token not available. Try refreshing the token.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleRefreshToken}
                  disabled={isRefreshing}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isRefreshing ? 'Refreshing...' : 'Refresh Token'}
                </button>
                <button
                  onClick={getDirectToken}
                  disabled={isRefreshing}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isRefreshing ? 'Refreshing...' : 'Get Direct Token'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {notificationPermissionStatus === 'denied' && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700 mb-2">
            Notifications are blocked. Please update your browser settings to allow notifications from this site.
          </p>
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
          </button>
          
          {showInstructions && (
            <div className="mt-3 text-sm">
              <h3 className="font-medium mb-2">How to enable notifications:</h3>
              
              <div className="mb-3">
                <h4 className="font-medium">Chrome:</h4>
                <ol className="list-decimal list-inside ml-2">
                  <li>Click the lock/info icon in the address bar</li>
                  <li>Find "Notifications" in the site settings</li>
                  <li>Change from "Block" to "Allow"</li>
                  <li>Refresh the page</li>
                </ol>
              </div>
              
              <div className="mb-3">
                <h4 className="font-medium">Firefox:</h4>
                <ol className="list-decimal list-inside ml-2">
                  <li>Click the shield icon in the address bar</li>
                  <li>Click "Site Permissions"</li>
                  <li>Find "Notification" and change to "Allow"</li>
                  <li>Refresh the page</li>
                </ol>
              </div>
              
              <div className="mb-3">
                <h4 className="font-medium">Safari:</h4>
                <ol className="list-decimal list-inside ml-2">
                  <li>Click Safari in the menu bar</li>
                  <li>Select "Settings for This Website..."</li>
                  <li>Find "Notifications" and select "Allow"</li>
                  <li>Refresh the page</li>
                </ol>
              </div>
              
              <div className="mb-3">
                <h4 className="font-medium">Edge:</h4>
                <ol className="list-decimal list-inside ml-2">
                  <li>Click the lock icon in the address bar</li>
                  <li>Click "Site permissions"</li>
                  <li>Find "Notifications" and change to "Allow"</li>
                  <li>Refresh the page</li>
                </ol>
              </div>
              
              <p className="mt-2">After enabling notifications, click the "Enable Notifications" button again.</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-200">
        <details className="text-sm text-gray-600">
          <summary className="font-medium cursor-pointer">Debugging Information</summary>
          <div className="mt-2 p-2 bg-gray-50 rounded">
            <p><strong>Permission Status:</strong> {notificationPermissionStatus}</p>
            <p><strong>Context FCM Token:</strong> {fcmToken ? 'Available' : 'Not Available'}</p>
            <p><strong>Direct FCM Token:</strong> {directToken ? 'Available' : 'Not Available'}</p>
            <p><strong>Service Worker Registered:</strong> {navigator.serviceWorker ? 'Available' : 'Not Available'}</p>
            <button
              onClick={getDirectToken}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Force Token Refresh
            </button>
          </div>
        </details>
      </div>
    </div>
  );
}
