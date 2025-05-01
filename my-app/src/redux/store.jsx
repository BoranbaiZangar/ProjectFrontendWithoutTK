// src/redux/store.js

import { createStore, combineReducers, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import authReducer from './auth';
import restaurantReducer from './restaurants';
import ordersReducer from './orders';
import dishesReducer from './dishes';
import couriersReducer from './couriers';
import cartReducer from './cart';
import toastReducer from './toast';
import statsReducer from './stats';

const rootReducer = combineReducers({
  auth: authReducer,
  restaurants: restaurantReducer,
  orders: ordersReducer,
  dishes: dishesReducer,
  couriers: couriersReducer,
  cart: cartReducer,
  toasts: toastReducer,
  stats: statsReducer,
});

const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

export default store;
