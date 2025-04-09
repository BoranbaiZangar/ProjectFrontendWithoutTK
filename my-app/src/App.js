// src/App.js
import React from "react";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;
