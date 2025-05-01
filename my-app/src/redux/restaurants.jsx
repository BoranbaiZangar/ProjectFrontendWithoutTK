const FETCH_RESTAURANTS_REQUEST = "restaurants/FETCH_RESTAURANTS_REQUEST";
const FETCH_RESTAURANTS_SUCCESS = "restaurants/FETCH_RESTAURANTS_SUCCESS";
const FETCH_RESTAURANTS_FAILURE = "restaurants/FETCH_RESTAURANTS_FAILURE";

const FETCH_RESTAURANT_BY_ID_SUCCESS = "restaurants/FETCH_RESTAURANT_BY_ID_SUCCESS";
const CLEAR_SELECTED_RESTAURANT = "restaurants/CLEAR_SELECTED_RESTAURANT";

const FETCH_OWNER_SUCCESS = "restaurants/FETCH_OWNER_SUCCESS";
const CLEAR_OWNER = "restaurants/CLEAR_OWNER";

const UPDATE_RESTAURANT_STATUS_SUCCESS = "restaurants/UPDATE_RESTAURANT_STATUS_SUCCESS";
const UPDATE_RESTAURANT_STATUS_FAILURE = "restaurants/UPDATE_RESTAURANT_STATUS_FAILURE";

const initialState = {
  list: [],
  selected: null,
  owner: null,
  loading: false,
  error: null,
};

export default function restaurantReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_RESTAURANTS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_RESTAURANTS_SUCCESS:
      return { ...state, loading: false, list: action.payload };
    case FETCH_RESTAURANTS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case FETCH_RESTAURANT_BY_ID_SUCCESS:
      return { ...state, selected: action.payload, loading: false };
    case CLEAR_SELECTED_RESTAURANT:
      return { ...state, selected: null };
    case FETCH_OWNER_SUCCESS:
      return { ...state, owner: action.payload, loading: false };
    case CLEAR_OWNER:
      return { ...state, owner: null };
    case UPDATE_RESTAURANT_STATUS_SUCCESS:
      return {
        ...state,
        list: state.list.map((r) =>
          r.id === action.payload.id ? action.payload : r
        ),
        selected:
          state.selected && state.selected.id === action.payload.id
            ? action.payload
            : state.selected,
        loading: false,
      };
    case UPDATE_RESTAURANT_STATUS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export const fetchRestaurants = () => async (dispatch, getState) => {
  dispatch({ type: FETCH_RESTAURANTS_REQUEST });
  try {
    const res = await fetch("http://localhost:5000/restaurants");
    if (!res.ok) {
      throw new Error("Failed to fetch restaurants");
    }
    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Unexpected response format: Expected an array of restaurants");
    }

    const { user } = getState().auth;
    let filteredRestaurants = [];

    if (user?.role === "user") {
      filteredRestaurants = data.filter((r) => r.status === "active");
    } else if (user?.role === "admin") {
      filteredRestaurants = data;
    } else if (user?.role === "moderator") {
      filteredRestaurants = data.filter(
        (r) => r.status === "pending" || r.status === "active" || r.status === "rejected"
      );
    } else if (user?.role === "owner") {
      filteredRestaurants = data.filter((r) => r.owner_id === user.id);
    } else {
      filteredRestaurants = data.filter((r) => r.status === "active");
    }

    dispatch({ type: FETCH_RESTAURANTS_SUCCESS, payload: filteredRestaurants });
  } catch (err) {
    dispatch({ type: FETCH_RESTAURANTS_FAILURE, payload: err.message });
  }
};

export const fetchRestaurantById = (id) => async (dispatch) => {
  dispatch({ type: FETCH_RESTAURANTS_REQUEST });
  try {
    const res = await fetch(`http://localhost:5000/restaurants/${String(id)}`);
    if (!res.ok) {
      throw new Error("Failed to fetch restaurant");
    }
    const data = await res.json();
    dispatch({ type: FETCH_RESTAURANT_BY_ID_SUCCESS, payload: data });
  } catch (err) {
    dispatch({ type: FETCH_RESTAURANTS_FAILURE, payload: err.message });
  }
};

export const fetchOwnerById = (ownerId) => async (dispatch) => {
  dispatch({ type: FETCH_RESTAURANTS_REQUEST });
  try {
    const res = await fetch(`http://localhost:5000/users/${String(ownerId)}`);
    if (!res.ok) {
      throw new Error("Failed to fetch owner");
    }
    const data = await res.json();
    dispatch({ type: FETCH_OWNER_SUCCESS, payload: data });
  } catch (err) {
    dispatch({ type: FETCH_RESTAURANTS_FAILURE, payload: err.message });
  }
};

export const updateRestaurantStatus = (id, status) => async (dispatch) => {
  dispatch({ type: FETCH_RESTAURANTS_REQUEST });
  try {
    const res = await fetch(`http://localhost:5000/restaurants/${String(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      throw new Error("Failed to update restaurant status");
    }
    const updatedRestaurant = await res.json();
    dispatch({ type: UPDATE_RESTAURANT_STATUS_SUCCESS, payload: updatedRestaurant });
  } catch (err) {
    dispatch({ type: UPDATE_RESTAURANT_STATUS_FAILURE, payload: err.message });
  }
};

export const clearSelectedRestaurant = () => ({
  type: CLEAR_SELECTED_RESTAURANT,
});

export const clearOwner = () => ({
  type: CLEAR_OWNER,
});