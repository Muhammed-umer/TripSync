importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the Service Worker
// Use the exact config from your firebase.js file
firebase.initializeApp({
  apiKey: "AIzaSyD6Xy8egFjo0IBgrKn2sSv997uwHel2Ls4",
  authDomain: "tripsync-6eff1.firebaseapp.com",
  projectId: "tripsync-6eff1",
  storageBucket: "tripsync-6eff1.firebasestorage.app",
  messagingSenderId: "138670764849",
  appId: "1:138670764849:web:350db1a958413e5846f610"
});

const messaging = firebase.messaging();

// Background notification handler
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png', // Ensure this exists in your public folder
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});