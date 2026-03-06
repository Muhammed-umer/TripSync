importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Use the same config from your firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyD6Xy8egFjo0IBgrKn2sSv997uwHel2Ls4",
  authDomain: "tripsync-6eff1.firebaseapp.com",
  projectId: "tripsync-6eff1",
  messagingSenderId: "138670764849",
  appId: "1:138670764849:web:350db1a958413e5846f610"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// This handles the notification when the app is in the background
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received: ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/TripSync_Logo.png', // Ensure this exists in your public folder
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});