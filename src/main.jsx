import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.jsx";
import "./index.css";
import UserAgentDetector from "./UserAgentDetector.jsx";
import MobileApp from "./MobileApp.jsx";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("ServiceWorker registered with scope:", registration.scope);
      })
      .catch((error) => {
        console.error("ServiceWorker registration failed:", error);
      });
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  const deferredPrompt = event;
  const installButton = document.createElement("button");
  installButton.textContent = "Install App";
  installButton.style.position = "fixed";
  installButton.style.bottom = "20px";
  installButton.style.right = "20px";
  installButton.style.zIndex = "1000";
  document.body.appendChild(installButton);

  installButton.addEventListener("click", () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }
      document.body.removeChild(installButton);
    });
  });
});

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <UserAgentDetector Desktop={() => <App />} Mobile={() => <MobileApp />} />
  </BrowserRouter>
);
