import { addToast } from "./toast";

// Action Types
const FETCH_ORDERS_REQUEST = "orders/FETCH_ORDERS_REQUEST";
const FETCH_ORDERS_SUCCESS = "orders/FETCH_ORDERS_SUCCESS";
const FETCH_ORDERS_FAILURE = "orders/FETCH_ORDERS_FAILURE";
const UPDATE_ORDER_SUCCESS = "orders/UPDATE_ORDER_SUCCESS";
const UPDATE_ORDER_FAIL = "orders/UPDATE_ORDER_FAIL";
const SUBMIT_REVIEW_SUCCESS = "orders/SUBMIT_REVIEW_SUCCESS";
const SUBMIT_REVIEW_FAIL = "orders/SUBMIT_REVIEW_FAIL";
const FETCH_REVIEWS_REQUEST = "orders/FETCH_REVIEWS_REQUEST";
const FETCH_REVIEWS_SUCCESS = "orders/FETCH_REVIEWS_SUCCESS";
const FETCH_REVIEWS_FAILURE = "orders/FETCH_REVIEWS_FAILURE";
const LOAD_STATE_FROM_STORAGE = "orders/LOAD_STATE_FROM_STORAGE";

// Load initial state from localStorage
const loadStateFromStorage = () => {
  try {
    const serializedState = localStorage.getItem("ordersState");
    if (serializedState === null) {
      return {
        list: [],
        reviews: [],
        loading: false,
        error: null,
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Failed to load state from localStorage:", err);
    return {
      list: [],
      reviews: [],
      loading: false,
      error: null,
    };
  }
};

// Save state to localStorage
const saveStateToStorage = (state) => {
  try {
    const serializedState = JSON.stringify({
      list: state.list,
      reviews: state.reviews,
      loading: state.loading,
      error: state.error,
    });
    localStorage.setItem("ordersState", serializedState);
    console.log("Saved to localStorage:", JSON.parse(serializedState));
  } catch (err) {
    console.error("Failed to save state to localStorage:", err);
  }
};

// Initial State
const initialState = loadStateFromStorage();

// Reducer
export default function ordersReducer(state = initialState, action) {
  let newState;
  switch (action.type) {
    case FETCH_ORDERS_REQUEST:
    case FETCH_REVIEWS_REQUEST:
      newState = { ...state, loading: true, error: null };
      saveStateToStorage(newState);
      return newState;
    case FETCH_ORDERS_SUCCESS:
      newState = { ...state, loading: false, list: action.payload };
      saveStateToStorage(newState);
      return newState;
    case FETCH_REVIEWS_SUCCESS:
      newState = { ...state, loading: false, reviews: action.payload };
      saveStateToStorage(newState);
      return newState;
    case FETCH_ORDERS_FAILURE:
    case FETCH_REVIEWS_FAILURE:
      newState = { ...state, loading: false, error: action.payload };
      saveStateToStorage(newState);
      return newState;
    case UPDATE_ORDER_SUCCESS:
      newState = { ...state };
      saveStateToStorage(newState);
      return newState;
    case UPDATE_ORDER_FAIL:
      newState = { ...state, error: action.payload };
      saveStateToStorage(newState);
      return newState;
    case SUBMIT_REVIEW_SUCCESS:
      newState = {
        ...state,
        reviews: [...state.reviews, action.payload],
      };
      saveStateToStorage(newState);
      return newState;
    case SUBMIT_REVIEW_FAIL:
      newState = { ...state, error: action.payload };
      saveStateToStorage(newState);
      return newState;
    case LOAD_STATE_FROM_STORAGE:
      newState = { ...state, ...action.payload };
      saveStateToStorage(newState);
      return newState;
    default:
      return state;
  }
}

// Action Creators

// Load state from storage
export const loadOrdersState = () => ({
  type: LOAD_STATE_FROM_STORAGE,
  payload: loadStateFromStorage(),
});

// Fetch orders
export const fetchOrders = (params) => async (dispatch, getState) => {
  dispatch({ type: FETCH_ORDERS_REQUEST });
  try {
    const { auth: { user } } = getState();
    let url = "http://localhost:5000/orders";
    
    if (params.userId) {
      url += `?user_id=${params.userId}`;
    } else if (params.ownerId) {
      const restaurantsRes = await fetch(`http://localhost:5000/restaurants?owner_id=${params.ownerId}`);
      const restaurants = await restaurantsRes.json();
      const restaurantIds = restaurants.map((r) => r.id).join(",");
      url += `?restaurant_id=${restaurantIds}`;
    } else if (params !== "ALL") {
      if (user.role === "courier") {
        url += `?courier_id=${params}`;
      } else if (user.role === "user") {
        url += `?user_id=${params}`;
      }
    }
    
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch orders: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    
    const normalizedData = data.map((order) => {
      const normalizedOrder = {
        ...order,
        user_id: order.userId || order.user_id,
        courier_id: order.courier_id || order.courierId || null,
        restaurant_id: order.restaurant_id || order.restaurantId || null,
      };
      if (!normalizedOrder.restaurant_id) {
        console.warn(`Order ${order.id} is missing restaurant_id:`, order);
      }
      return normalizedOrder;
    });
    dispatch({ type: FETCH_ORDERS_SUCCESS, payload: normalizedData });
    saveStateToStorage({ ...getState().orders, list: normalizedData });
  } catch (err) {
    dispatch({ type: FETCH_ORDERS_FAILURE, payload: `Failed to fetch orders: ${err.message}` });
    saveStateToStorage({ ...getState().orders, error: `Failed to fetch orders: ${err.message}` });
  }
};

// Fetch reviews
export const fetchReviews = ({ restaurantId, courierId }) => async (dispatch, getState) => {
  dispatch({ type: FETCH_REVIEWS_REQUEST });
  try {
    let url = "http://localhost:5000/reviews";
    if (restaurantId) {
      url += `?restaurantId=${restaurantId}`;
    } else if (courierId) {
      url += `?courierId=${courierId}`;
    }
    
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch reviews: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    dispatch({ type: FETCH_REVIEWS_SUCCESS, payload: data });
    saveStateToStorage({ ...getState().orders, reviews: data });
  } catch (err) {
    dispatch({ type: FETCH_REVIEWS_FAILURE, payload: `Failed to fetch reviews: ${err.message}` });
    saveStateToStorage({ ...getState().orders, error: `Failed to fetch reviews: ${err.message}` });
  }
};

// Update order status
export const updateOrderStatus = (orderId, newStatus) => async (dispatch, getState) => {
  try {
    const res = await fetch(`http://localhost:5000/orders/${orderId}`);
    if (!res.ok) throw new Error(`Failed to fetch order: ${res.status} ${await res.text()}`);
    const order = await res.json();

    const updatedOrder = { 
      ...order, 
      status: newStatus, 
      user_id: order.userId || order.user_id 
    };

    const updateRes = await fetch(`http://localhost:5000/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedOrder),
    });
    if (!updateRes.ok)
      throw new Error(`Failed to update order: ${updateRes.status} ${await updateRes.text()}`);

    if (newStatus === "Delivered" && order.courier_id) {
      const courierRes = await fetch(`http://localhost:5000/couriers?user_id=${order.courier_id}`);
      const couriers = await courierRes.json();
      if (couriers.length) {
        const courier = couriers[0];
        const updatedCourier = { ...courier, is_available: true };

        const courierUpdateRes = await fetch(`http://localhost:5000/couriers/${courier.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedCourier),
        });

        if (!courierUpdateRes.ok)
          throw new Error(`Failed to update courier: ${courierUpdateRes.status} ${await courierUpdateRes.text()}`);
      }
    }

    dispatch(fetchOrders("ALL"));
    dispatch(addToast({ message: "Order status updated successfully!", type: "success" }));
  } catch (err) {
    dispatch({ type: UPDATE_ORDER_FAIL, payload: err.message });
    dispatch(addToast({ message: `Failed to update order: ${err.message}`, type: "error" }));
    saveStateToStorage({ ...getState().orders, error: err.message });
  }
};

// Cancel order
export const cancelOrder = (orderId) => async (dispatch, getState) => {
  try {
    const res = await fetch(`http://localhost:5000/orders/${orderId}`);
    if (!res.ok) throw new Error(`Failed to fetch order: ${res.status} ${await res.text()}`);
    const order = await res.json();
    const updatedOrder = { ...order, status: "Cancelled", user_id: order.userId || order.user_id };

    const updateRes = await fetch(`http://localhost:5000/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedOrder),
    });
    if (!updateRes.ok)
      throw new Error(`Failed to cancel order: ${updateRes.status} ${await updateRes.text()}`);

    dispatch(fetchOrders("ALL"));
    dispatch(addToast({ message: "Order cancelled successfully!", type: "success" }));
  } catch (err) {
    dispatch({ type: UPDATE_ORDER_FAIL, payload: err.message });
    dispatch(addToast({ message: `Failed to cancel order: ${err.message}`, type: "error" }));
    saveStateToStorage({ ...getState().orders, error: err.message });
  }
};

// Assign courier
export const assignCourier = (orderId, courierUserId) => async (dispatch, getState) => {
  try {
    const res = await fetch(`http://localhost:5000/orders/${orderId}`);
    if (!res.ok) throw new Error(`Failed to fetch order: ${res.status} ${await res.text()}`);
    const order = await res.json();
    
    const updatedOrder = { 
      ...order, 
      courier_id: courierUserId, 
      status: "Processing", 
      user_id: order.userId || order.user_id 
    };
    
    const updateRes = await fetch(`http://localhost:5000/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedOrder),
    });
    if (!updateRes.ok)
      throw new Error(`Failed to assign courier: ${updateRes.status} ${await updateRes.text()}`);

    const courierRes = await fetch(`http://localhost:5000/couriers?user_id=${courierUserId}`);
    const couriers = await courierRes.json();
    if (!couriers.length) throw new Error(`Courier with user_id ${courierUserId} not found`);
    const courier = couriers[0];
    const updatedCourier = { ...courier, is_available: false };

    const courierUpdateRes = await fetch(`http://localhost:5000/couriers/${courier.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedCourier),
    });
    if (!courierUpdateRes.ok)
      throw new Error(`Failed to update courier: ${courierUpdateRes.status} ${await courierUpdateRes.text()}`);

    dispatch(fetchOrders("ALL"));
    dispatch(addToast({ message: "Courier assigned successfully!", type: "success" }));
  } catch (err) {
    dispatch({ type: UPDATE_ORDER_FAIL, payload: err.message });
    dispatch(addToast({ message: `Failed to assign courier: ${err.message}`, type: "error" }));
    saveStateToStorage({ ...getState().orders, error: err.message });
  }
};

// Submit review
export const submitReview = (reviewData) => async (dispatch, getState) => {
  try {
    if (!reviewData.restaurantId) {
      throw new Error("Restaurant ID is missing in review data.");
    }
    const reviewWithTimestamp = {
      ...reviewData,
      createdAt: new Date().toISOString(),
    };
    
    const response = await fetch("http://localhost:5000/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewWithTimestamp),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to submit review: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    dispatch({ type: SUBMIT_REVIEW_SUCCESS, payload: data });
    saveStateToStorage({ ...getState().orders, reviews: [...getState().orders.reviews, data] });
    dispatch(addToast({ message: "Review submitted successfully!", type: "success" }));
  } catch (error) {
    dispatch({ type: SUBMIT_REVIEW_FAIL, payload: error.message });
    saveStateToStorage({ ...getState().orders, error: error.message });
    dispatch(addToast({ message: `Failed to submit review: ${error.message}`, type: "error" }));
  }
};