const FETCH_COURIERS_REQUEST = "couriers/FETCH_COURIERS_REQUEST";
const FETCH_COURIERS_SUCCESS = "couriers/FETCH_COURIERS_SUCCESS";
const FETCH_COURIERS_FAILURE = "couriers/FETCH_COURIERS_FAILURE";
const UPDATE_COURIER_SUCCESS = "couriers/UPDATE_COURIER_SUCCESS";
const UPDATE_COURIER_FAILURE = "couriers/UPDATE_COURIER_FAILURE";

const initialState = {
  list: [],
  loading: false,
  error: null,
};

export default function couriersReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_COURIERS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_COURIERS_SUCCESS:
      return { ...state, loading: false, list: action.payload };
    case FETCH_COURIERS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case UPDATE_COURIER_SUCCESS:
      return {
        ...state,
        list: state.list.map((c) => (c.id === action.payload.id ? action.payload : c)),
        loading: false,
      };
    case UPDATE_COURIER_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export const fetchCouriers = () => async (dispatch) => {
  dispatch({ type: FETCH_COURIERS_REQUEST });

  try {
    const response = await fetch("http://localhost:5000/couriers");
    if (!response.ok) {
      throw new Error(`Failed to fetch couriers: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    dispatch({ type: FETCH_COURIERS_SUCCESS, payload: data });
  } catch (error) {
    console.error("Fetch cou购销courier error:", error);
    dispatch({ type: FETCH_COURIERS_FAILURE, payload: error.message });
  }
};

export const updateCourier = (courierId, updatedCourier) => async (dispatch) => {
  try {
    const response = await fetch(`http://localhost:5000/couriers/${courierId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedCourier),
    });
    if (!response.ok) {
      throw new Error(`Failed to update courier: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    dispatch({ type: UPDATE_COURIER_SUCCESS, payload: data });
  } catch (error) {
    console.error("Update courier error:", error);
    dispatch({ type: UPDATE_COURIER_FAILURE, payload: error.message });
  }
};