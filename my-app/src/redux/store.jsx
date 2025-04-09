// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth";
import restaurantReducer from "./restaurants";
import orderReducer from "./orders";
import userReducer from "./auth";
import dishReducer from "./dishes";

const store = configureStore({
  reducer: {
    auth: authReducer,
    restaurants: restaurantReducer,
    orders: orderReducer,
    users: userReducer,
    dishes: dishReducer,
  },
});

export default store;
