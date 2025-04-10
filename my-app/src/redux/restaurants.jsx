// src/redux/restaurants.js

// 🏷 Action Types
const FETCH_RESTAURANTS_REQUEST = "restaurants/FETCH_RESTAURANTS_REQUEST";
const FETCH_RESTAURANTS_SUCCESS = "restaurants/FETCH_RESTAURANTS_SUCCESS";
const FETCH_RESTAURANTS_FAILURE = "restaurants/FETCH_RESTAURANTS_FAILURE";

const FETCH_RESTAURANT_BY_ID_SUCCESS = "restaurants/FETCH_RESTAURANT_BY_ID_SUCCESS";
const CLEAR_SELECTED_RESTAURANT = "restaurants/CLEAR_SELECTED_RESTAURANT";

const FETCH_OWNER_SUCCESS = "restaurants/FETCH_OWNER_SUCCESS"; // Новое действие для владельца
const CLEAR_OWNER = "restaurants/CLEAR_OWNER"; // Очистка владельца

// 🌐 Initial State
const initialState = {
  list: [],
  selected: null,
  owner: null, // Добавляем поле для хранения данных владельца
  loading: false,
  error: null,
};

// 🔁 Reducer
export default function restaurantReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_RESTAURANTS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_RESTAURANTS_SUCCESS:
      return { ...state, loading: false, list: action.payload };
    case FETCH_RESTAURANTS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case FETCH_RESTAURANT_BY_ID_SUCCESS:
      return { ...state, selected: action.payload, loading: false }; // Добавляем loading: false
    case CLEAR_SELECTED_RESTAURANT:
      return { ...state, selected: null };
    case FETCH_OWNER_SUCCESS: // Новый кейс для владельца
      return { ...state, owner: action.payload, loading: false };
    case CLEAR_OWNER: // Очистка данных владельца
      return { ...state, owner: null };
    default:
      return state;
  }
}

// 📦 Thunk: получить все рестораны
export const fetchRestaurants = () => async (dispatch) => {
  dispatch({ type: FETCH_RESTAURANTS_REQUEST });

  try {
    const res = await fetch("http://localhost:5000/restaurants");
    const data = await res.json();
    dispatch({ type: FETCH_RESTAURANTS_SUCCESS, payload: data });
  } catch (err) {
    dispatch({ type: FETCH_RESTAURANTS_FAILURE, payload: err.message });
  }
};

// 📦 Thunk: получить один ресторан по id
export const fetchRestaurantById = (id) => async (dispatch) => {
  dispatch({ type: FETCH_RESTAURANTS_REQUEST }); // Добавляем индикацию загрузки
  try {
    const res = await fetch(`http://localhost:5000/restaurants/${id}`);
    if (!res.ok) {
      throw new Error("Failed to fetch restaurant");
    }
    const data = await res.json();
    dispatch({ type: FETCH_RESTAURANT_BY_ID_SUCCESS, payload: data });
  } catch (err) {
    dispatch({ type: FETCH_RESTAURANTS_FAILURE, payload: err.message });
  }
};

// 📦 Thunk: получить владельца по id
export const fetchOwnerById = (ownerId) => async (dispatch) => {
  dispatch({ type: FETCH_RESTAURANTS_REQUEST }); // Индикация загрузки
  try {
    const res = await fetch(`http://localhost:5000/users/${ownerId}`); // Предполагаемый endpoint для получения пользователя
    if (!res.ok) {
      throw new Error("Failed to fetch owner");
    }
    const data = await res.json();
    dispatch({ type: FETCH_OWNER_SUCCESS, payload: data });
  } catch (err) {
    dispatch({ type: FETCH_RESTAURANTS_FAILURE, payload: err.message });
  }
};

// 🔄 Очистить выбранный ресторан
export const clearSelectedRestaurant = () => ({
  type: CLEAR_SELECTED_RESTAURANT,
});

// 🔄 Очистить данные владельца
export const clearOwner = () => ({
  type: CLEAR_OWNER,
});