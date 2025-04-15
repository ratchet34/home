import React from "react";
import "../../css/mobile/loading-screen.css";

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Loading, please wait...</p>
    </div>
  );
};

export default LoadingScreen;
