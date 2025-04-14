import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.jsx";
import "./index.css";
import UserAgentDetector from "./UserAgentDetector.jsx";
import MobileApp from "./MobileApp.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <UserAgentDetector Desktop={() => <App />} Mobile={() => <MobileApp />} />
  </BrowserRouter>
);
