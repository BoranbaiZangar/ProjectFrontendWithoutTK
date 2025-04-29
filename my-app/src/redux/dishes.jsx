// src/redux/dishes.js

const FETCH_DISHES_REQUEST = "dishes/FETCH_DISHES_REQUEST";
const FETCH_DISHES_SUCCESS = "dishes/FETCH_DISHES_SUCCESS";
const FETCH_DISHES_FAILURE = "dishes/FETCH_DISHES_FAILURE";

const initialState = {
  list: [],
  loading: false,
  error: null,
};

export default function dishesReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_DISHES_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_DISHES_SUCCESS:
      return { ...state, loading: false, list: action.payload };
    case FETCH_DISHES_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export const fetchDishes = () => async (dispatch) => {
  dispatch({ type: FETCH_DISHES_REQUEST });

  try {
    const res = await fetch("http://localhost:5000/dishes");

    if (!res.ok) throw new Error("Ошибка при загрузке блюд");

    const data = await res.json();
    dispatch({ type: FETCH_DISHES_SUCCESS, payload: data });
  } catch (err) {
    dispatch({ type: FETCH_DISHES_FAILURE, payload: err.message });
  }
};
