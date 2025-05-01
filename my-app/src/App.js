// src/App.js
import React from "react";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes";
import Notification from "./components/Notficiation";

function App() {
  return (
    
    <BrowserRouter>
      <Notification />
      <Navbar />
      <div className="container">
        <AppRoutes />
      </div>
    </BrowserRouter>

);

}

export default App;
