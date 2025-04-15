// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);

// Initialize the Firebase app in the service worker
// "Default" Firebase configuration (prevents errors)
const defaultConfig = {
  apiKey: true,
  projectId: true,
  messagingSenderId: true,
  appId: true,
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

// Handle foreground messages
messaging.onMessage((payload) => {
  console.log("Message received. ", payload);
});

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message ", payload);
  // const notificationTitle = payload.notification?.title;
  // const notificationOptions = {
  //   body: payload.notification?.body,
  //   icon: payload.notification?.image,
  // };

  // self.registration.showNotification(notificationTitle, notificationOptions);
});
