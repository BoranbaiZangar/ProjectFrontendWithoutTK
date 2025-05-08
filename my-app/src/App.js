import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes";
import Toast from "./components/Toast";


function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Navbar />
        <div className="container">
          <AppRoutes />
        </div>
        <Toast />
      </BrowserRouter>
    </Provider>
  );
}

export default App;