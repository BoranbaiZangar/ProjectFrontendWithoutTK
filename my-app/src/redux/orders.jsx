// src/redux/orders.js

const FETCH_ORDERS_REQUEST = "orders/FETCH_ORDERS_REQUEST";
const FETCH_ORDERS_SUCCESS = "orders/FETCH_ORDERS_SUCCESS";
const FETCH_ORDERS_FAILURE = "orders/FETCH_ORDERS_FAILURE";

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
    default:
      return state;
  }
}

export const fetchOrders = (userId) => async (dispatch) => {
  dispatch({ type: FETCH_ORDERS_REQUEST });

  try {
    const url =
      userId === "ALL"
        ? "http://localhost:5000/orders"
        : `http://localhost:5000/orders?userId=${userId}`;

    const res = await fetch(url);
    const data = await res.json();

    dispatch({ type: FETCH_ORDERS_SUCCESS, payload: data });
  } catch (err) {
    dispatch({ type: FETCH_ORDERS_FAILURE, payload: err.message });
  }
};

export const updateOrderStatus = (orderId, newStatus) => async (dispatch) => {
  try {
    const res = await fetch(`http://localhost:5000/orders/${orderId}`);
    const order = await res.json();

    const updatedOrder = { ...order, status: newStatus };

    await fetch(`http://localhost:5000/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedOrder),
    });

    dispatch(fetchOrders("ALL"));
  } catch (err) {
    console.error("Ошибка при обновлении статуса:", err);
  }
};

export const cancelOrder = (orderId) => async (dispatch) => {
  try {
    const res = await fetch(`http://localhost:5000/orders/${orderId}`);
    const order = await res.json();

    const updatedOrder = { ...order, status: "Cancelled" };

    await fetch(`http://localhost:5000/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedOrder),
    });

    dispatch(fetchOrders("ALL"));
  } catch (error) {
    console.error("Ошибка при отмене заказа", error);
  }
};