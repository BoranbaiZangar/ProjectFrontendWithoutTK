import React from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppRoutes from "./routes";
import Toast from "./components/Toast";

// Компонент для условного рендеринга Footer
const ConditionalFooter = () => {
  const location = useLocation();
  // Показываем Footer только на маршрутах "/" и "/restaurants"
  const showFooter = location.pathname === "/" || location.pathname === "/restaurants";
  
  return showFooter ? <Footer /> : null;
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Navbar />
        <div className="container">
          <AppRoutes />
        </div>
        <ConditionalFooter />
        <Toast />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
