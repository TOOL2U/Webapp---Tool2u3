// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBx1SYa8sJo3Zjb37nvVnHpCwnauyjSatA",
  authDomain: "tool2u-82126.firebaseapp.com",
  projectId: "tool2u-82126",
  storageBucket: "tool2u-82126.firebasestorage.app",
  messagingSenderId: "161088210082",
  appId: "1:161088210082:web:06678600eabb7213ba83fb",
  measurementId: "G-YJSPVT23JF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize messaging with better error handling
let messaging = null;
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app);
    console.log('Firebase messaging initialized successfully');
  } else {
    console.log('Firebase messaging not available: serviceWorker not supported');
  }
} catch (error) {
  console.error('Error initializing Firebase messaging:', error);
}

// Function to request FCM token
export async function requestFCMToken() {
  try {
    if (!messaging) {
      console.error('Messaging is not available');
      return null;
    }
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log("User not logged in");
      return null;
    }
    
    // Request permission first
    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission not granted');
        return null;
      }
    }
    
    const token = await getToken(messaging, {
      vapidKey: "BLBz-RwVqDXvdVZrXCYqQZQJhW_kKMgajwlnfBYyHBqKx9lUPpuLQP9mABhWh6Qjf_bY1jw-X4EE0Uy2ZcJdK-8"
    });

    if (token) {
      console.log("FCM Registration Token:", token);
      
      // Subscribe to the "drivers" topic
      try {
        // Note: This direct approach won't work in the browser due to CORS
        // This should be handled by your backend service
        console.log("Would subscribe to drivers topic with token:", token);
        
        // Instead of direct API call, you can store the token in Firestore
        // and have a Cloud Function handle the topic subscription
        
        return token;
      } catch (subscribeError) {
        console.error("Error subscribing to topic:", subscribeError);
        return token; // Still return the token even if topic subscription fails
      }
    } else {
      console.log("No registration token available");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving FCM token:", error);
    return null;
  }
}

export { app, auth, analytics, db, messaging };
