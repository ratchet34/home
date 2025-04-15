// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js"
);

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyAnq33bfjFDfxy7_w5huLPuvN_6t9HjBvg",
  authDomain: "home-54990.firebaseapp.com",
  projectId: "home-5499",
  // databaseURL: "https://home-54990.firebaseio.com",
  storageBucket: "home-54990.firebasestorage.app",
  messagingSenderId: "592078196515",
  appId: "1:592078196515:web:e4b4869426b0151ed38696",
  measurementId:
    "BKw1CFdV9Xy9r3-XXrgkkJQ1ZpvTXS-ZIZ-mIasWttDSU5kZXFzOy2ld9XlROh6pNPUxBDw8SC9pxdcSe9oh4qQ",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// Keep in mind that FCM will still show notification messages automatically
// and you should use data messages for custom notifications.
// For more info see:
// https://firebase.google.com/docs/cloud-messaging/concept-options
messaging.onBackgroundMessage(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon-192.png",
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});
