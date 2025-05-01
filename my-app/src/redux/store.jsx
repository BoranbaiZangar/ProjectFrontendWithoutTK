import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth";
import restaurantReducer from "./restaurants";
import orderReducer from "./orders";
import dishReducer from "./dishes";
import toastReducer from "./toast";

const store = configureStore({
  reducer: {
    auth: authReducer,
    restaurants: restaurantReducer,
    orders: orderReducer,
    dishes: dishReducer,
    toasts: toastReducer, // Добавляем редуктор для тостов
  },
});

export default store;