import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

const useNotifications = ({ redirectToLogin, showSnackbarMessage }) => {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  const addTokenToUser = async (id, token) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_HOST}/users/${id}/notifications-token`,
        {
          method: "PATCH",
          credentials:
            import.meta.env.VITE_ENV === "production" ? "include" : undefined,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        }
      );
      if (response.status === 401) {
        redirectToLogin();
        return;
      }
      if (!response.ok) {
        showSnackbarMessage({
          message: "Error adding token to user.",
          type: "error",
        });
        return;
      }
      showSnackbarMessage({
        message: "Token added to user successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Error adding token to user:", error);
    }
  };

  const requestPermission = async (id) => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(getMessaging(app), {
        vapidKey,
      });
      if (!token) {
        console.error(
          "No registration token available. Request permission to generate one."
        );
        return;
      }
      addTokenToUser(id, token);
      console.log("Notification permission granted. Token:", token);
    } else {
      console.error("Unable to get permission to notify.");
    }
  };
  return [requestPermission];
};

export default useNotifications;
