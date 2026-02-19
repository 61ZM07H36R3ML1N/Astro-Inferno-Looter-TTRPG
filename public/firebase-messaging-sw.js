// public/firebase-messaging-sw.js

// 1. Import the Firebase background scripts (using the compat version for Service Workers)
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// 2. PASTE YOUR ACTUAL FIREBASE CONFIG HERE
// You cannot use import.meta.env here. You must paste the actual strings.
const firebaseConfig = {
  apiKey: "AIzaSyCM7Y9v5Lgni2gymZvMW1FPs-2LAnENYjs",
  authDomain: "astro-inferno-companion-app.firebaseapp.com",
  projectId: "astro-inferno-companion-app",
  storageBucket: "astro-inferno-companion-app.firebasestorage.app",
  messagingSenderId: "704408833108",
  appId: "1:704408833108:web:c3da44f7cce8b2b126b1c1"
};

// 3. Initialize Firebase in the background
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 4. Handle incoming lock-screen alerts when the app is minimized
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg', // You can change this to a skull icon later!
    badge: '/vite.svg',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});