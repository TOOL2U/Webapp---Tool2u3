// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyBx1SYa8sJo3Zjb37nvVnHpCwnauyjSatA",
  authDomain: "tool2u-82126.firebaseapp.com",
  projectId: "tool2u-82126",
  storageBucket: "tool2u-82126.firebasestorage.app",
  messagingSenderId: "161088210082",
  appId: "1:161088210082:web:06678600eabb7213ba83fb",
  measurementId: "G-YJSPVT23JF"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Customize notification here
  const notificationTitle = payload.notification.title || 'New Order';
  const notificationOptions = {
    body: payload.notification.body || 'You have received a new order',
    icon: '/favicon.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
