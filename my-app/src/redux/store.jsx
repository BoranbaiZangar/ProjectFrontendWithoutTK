// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth";
import restaurantReducer from "./restaurants";
import orderReducer from "./orders";
import userReducer from "./auth";
import dishReducer from "./dishes";
import toastReducer      from "./toast";   

const store = configureStore({
  reducer: {
    auth: authReducer,
    restaurants: restaurantReducer,
    orders: orderReducer,
    users: userReducer,
    dishes: dishReducer,
    toasts:      toastReducer,
  },
});

export default store;
