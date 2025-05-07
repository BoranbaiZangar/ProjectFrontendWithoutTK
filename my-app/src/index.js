import React from "react";
import ReactDOM from "react-dom/client"; // заменили импорт
import App from "./App";
import store from "./redux/store";
import { Provider } from "react-redux";
import "./css/styles.css"; // Подключаем глобальные стили

const root = ReactDOM.createRoot(document.getElementById("root")); // создаём корень
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
