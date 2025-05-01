const FETCH_ORDERS_REQUEST = "orders/FETCH_ORDERS_REQUEST";
const FETCH_ORDERS_SUCCESS = "orders/FETCH_ORDERS_SUCCESS";
const FETCH_ORDERS_FAILURE = "orders/FETCH_ORDERS_FAILURE";
const UPDATE_ORDER_SUCCESS = "orders/UPDATE_ORDER_SUCCESS";
const UPDATE_ORDER_FAIL = "orders/UPDATE_ORDER_FAIL";
const SUBMIT_REVIEW_SUCCESS = "orders/SUBMIT_REVIEW_SUCCESS";
const SUBMIT_REVIEW_FAIL = "orders/SUBMIT_REVIEW_FAIL";

const initialState = {
  list: [],
  loading: false,
  error: null,
};

export default function ordersReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_ORDERS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_ORDERS_SUCCESS:
      return { ...state, loading: false, list: action.payload };
    case FETCH_ORDERS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case UPDATE_ORDER_SUCCESS:
      return { ...state }; // will reload list via fetch
    case UPDATE_ORDER_FAIL:
      return { ...state, error: action.payload };
    case SUBMIT_REVIEW_SUCCESS:
      return { ...state };
    case SUBMIT_REVIEW_FAIL:
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// Fetch orders (admin/moderator vs user vs owner vs courier)
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
    
    console.log("Fetching orders with URL:", url);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch orders: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    console.log("Fetched orders:", data);
    
    // Normalize user_id/userId and courier_id
    const normalizedData = data.map((order) => ({
      ...order,
      user_id: order.userId || order.user_id,
      courier_id: order.courier_id || order.courierId || null,
    }));
    dispatch({ type: FETCH_ORDERS_SUCCESS, payload: normalizedData });
  } catch (err) {
    console.error("Fetch orders error:", err);
    dispatch({ type: FETCH_ORDERS_FAILURE, payload: `Failed to fetch orders: ${err.message} (URL: ${url})` });
  }
};

// Update order status by replacing the resource
export const updateOrderStatus = (orderId, newStatus) => async (dispatch) => {
  try {
    const res = await fetch(`http://localhost:5000/orders/${orderId}`);
    if (!res.ok) throw new Error(`Failed to fetch order: ${res.status} ${await res.text()}`);
    const order = await res.json();
    const updatedOrder = { ...order, status: newStatus, user_id: order.userId || order.user_id };

    const updateRes = await fetch(`http://localhost:5000/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedOrder),
    });
    if (!updateRes.ok)
      throw new Error(`Failed to update order: ${updateRes.status} ${await updateRes.text()}`);

    dispatch(fetchOrders("ALL"));
    dispatch({ type: "toast/ADD_TOAST", payload: { message: "Order status updated successfully!", type: "success" } });
  } catch (err) {
    console.error("Update order status error:", err);
    dispatch({ type: UPDATE_ORDER_FAIL, payload: err.message });
    dispatch({ type: "toast/ADD_TOAST", payload: { message: `Failed to update order: ${err.message}`, type: "error" } });
  }
};

// Cancel order (set status to Cancelled)
export const cancelOrder = (orderId) => async (dispatch) => {
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
    dispatch({ type: "toast/ADD_TOAST", payload: { message: "Order cancelled successfully!", type: "success" } });
  } catch (err) {
    console.error("Cancel order error:", err);
    dispatch({ type: UPDATE_ORDER_FAIL, payload: err.message });
    dispatch({ type: "toast/ADD_TOAST", payload: { message: `Failed to cancel order: ${err.message}`, type: "error" } });
  }
};

// Assign courier by patching courier_id and status
export const assignCourier = (orderId, courierUserId) => async (dispatch) => {
  try {
    // Fetch existing order
    const res = await fetch(`http://localhost:5000/orders/${orderId}`);
    if (!res.ok) throw new Error(`Failed to fetch order: ${res.status} ${await res.text()}`);
    const order = await res.json();
    
    // Update courier assignment and status
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

    // Update courier availability
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
    dispatch({ type: "toast/ADD_TOAST", payload: { message: "Courier assigned successfully!", type: "success" } });
  } catch (err) {
    console.error("Assign courier error:", err);
    dispatch({ type: UPDATE_ORDER_FAIL, payload: err.message });
    dispatch({ type: "toast/ADD_TOAST", payload: { message: `Failed to assign courier: ${err.message}`, type: "error" } });
  }
};

// Submit review
export const submitReview = (reviewData) => async (dispatch) => {
  try {
    const reviewWithTimestamp = {
      ...reviewData,
      createdAt: new Date().toISOString(),
    };
    
    console.log("Submitting review:", reviewWithTimestamp);
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
    console.log("Review submitted successfully:", data);
    dispatch({ type: SUBMIT_REVIEW_SUCCESS, payload: data });
    dispatch({ type: "toast/ADD_TOAST", payload: { message: "Review submitted successfully!", type: "success" } });
  } catch (error) {
    console.error("Submit review error:", error);
    dispatch({ type: SUBMIT_REVIEW_FAIL, payload: error.message });
    dispatch({ type: "toast/ADD_TOAST", payload: { message: `Failed to submit review: ${error.message}`, type: "error" } });
  }
};