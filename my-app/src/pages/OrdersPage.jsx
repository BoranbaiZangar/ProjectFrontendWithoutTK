import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  updateOrderStatus,
  cancelOrder,
  assignCourier,
  submitReview,
} from "../redux/orders";
import { fetchCouriers } from "../redux/couriers";

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list: orders = [], loading: ordersLoading, error: ordersError } =
    useSelector((state) => state.orders || {});
  const { list: couriers = [], loading: couriersLoading, error: couriersError } =
    useSelector((state) => state.couriers || {});

  const [reviewData, setReviewData] = useState({
    courierRating: 0,
    restaurantRating: 0,
    restaurantComment: "",
  });

  useEffect(() => {
    if (user) {
      const target = user.role === "admin" || user.role === "moderator" ? "ALL" : user.id;
      dispatch(fetchOrders(target));
      dispatch(fetchCouriers());
    }
  }, [dispatch, user]);

  const handleAssignCourier = (orderId, courierId) => {
    if (courierId) {
      dispatch(assignCourier(orderId, courierId));
    }
  };

  const handleConfirmOrder = (orderId) => {
    dispatch(updateOrderStatus(orderId, "In Transit"));
  };

  const handleConfirmDelivery = (orderId) => {
    dispatch(updateOrderStatus(orderId, "Delivered"));
  };

  const handleCancelOrder = (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      dispatch(cancelOrder(orderId));
    }
  };

  const handleSubmitReview = (orderId, order) => {
    if (reviewData.courierRating < 1 || reviewData.courierRating > 5 || reviewData.restaurantRating < 1 || reviewData.restaurantRating > 5) {
      dispatch({
        type: "toast/ADD_TOAST",
        payload: { message: "Ratings must be between 1 and 5.", type: "error" },
      });
      return;
    }

    dispatch(
      submitReview({
        orderId,
        userId: user.id,
        courierId: order.courier_id,
        restaurantId: order.restaurant_id,
        courierRating: reviewData.courierRating,
        restaurantRating: reviewData.restaurantRating,
        restaurantComment: reviewData.restaurantComment,
      })
    );
    setReviewData({ courierRating: 0, restaurantRating: 0, restaurantComment: "" });
    dispatch(fetchOrders(user.id)); // Refresh orders after submitting review
  };

  const statusColors = {
    Pending: "#f1c40f",
    "In progress": "#f39c12",
    Processing: "#3498db",
    "In Transit": "#9b59b6",
    Delivered: "#2ecc71",
    Cancelled: "#e74c3c",
  };

  const filteredOrders = user
    ? user.role === "courier"
      ? orders.filter((order) => order.courier_id === user.id)
      : user.role === "user"
        ? orders.filter((order) => order.user_id === user.id)
        : orders
    : [];

  return (
    <div>
      <h2>Orders</h2>
      {ordersLoading && <p>Loading orders...</p>}
      {ordersError && (
        <p style={{ color: "red" }}>
          {typeof ordersError === "string" ? ordersError : JSON.stringify(ordersError)}
        </p>
      )}
      {couriersLoading && <p>Loading couriers...</p>}
      {couriersError && <p style={{ color: "red" }}>Error loading couriers: {couriersError}</p>}
      {!user && <p>Please log in to view orders.</p>}

      {user && (
        <div>
          <p>Debug: User Role: {user.role}</p>
          <p>Debug: User ID: {user.id}</p>
          <p>Debug: Loaded orders count: {orders.length}</p>
          <p>Debug: Filtered orders count: {filteredOrders.length}</p>
        </div>
      )}

      {filteredOrders.length === 0 && !ordersLoading && !ordersError && (
        <p>No orders found.</p>
      )}

      {filteredOrders.map((order) => (
        <div
          key={order.id}
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            marginBottom: "1rem",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <strong>Order #{order.id}</strong>
          <ul>
            {order.items?.map((item, index) => (
              <li key={index}>{item.name} — ₸{item.price}</li>
            ))}
          </ul>
          <p style={{ color: statusColors[order.status] || "#000", fontWeight: "bold" }}>
            Status: {order.status}
          </p>
          <p>Courier ID: {order.courier_id || "Not assigned"}</p>

          {user?.role === "moderator" && order.status === "In progress" && (
            <div>
              <label htmlFor={`courier-select-${order.id}`}>Assign Courier:</label>
              <select
                id={`courier-select-${order.id}`}
                onChange={(e) => handleAssignCourier(order.id, e.target.value)}
                disabled={couriersLoading}
              >
                <option value="">Select Courier</option>
                {couriers
                  .filter((courier) => courier.is_available)
                  .map((courier) => (
                    <option key={courier.user_id} value={courier.user_id}>
                      {courier.name || `Courier ${courier.user_id}`}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {user?.role === "courier" && order.courier_id === user.id && (
            <div>
              {order.status === "Processing" && (
                <button onClick={() => handleConfirmOrder(order.id)}>
                  Confirm Pickup
                </button>
              )}
              {order.status === "In Transit" && (
                <button onClick={() => handleConfirmDelivery(order.id)}>
                  Confirm Delivered
                </button>
              )}
            </div>
          )}

          {user?.role === "user" &&
            (order.status === "Pending" || order.status === "In progress") && (
              <button onClick={() => handleCancelOrder(order.id)}>Cancel Order</button>
            )}

          {user?.role === "user" && order.status === "Delivered" && (
            <div>
              <h4>Leave a Review</h4>
              <div>
                <label>Courier Rating (1-5): </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={reviewData.courierRating}
                  onChange={(e) =>
                    setReviewData({
                      ...reviewData,
                      courierRating: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </div>
              <div>
                <label>Restaurant Rating (1-5): </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={reviewData.restaurantRating}
                  onChange={(e) =>
                    setReviewData({
                      ...reviewData,
                      restaurantRating: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </div>
              <div>
                <label>Restaurant Comment: </label>
                <textarea
                  value={reviewData.restaurantComment}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, restaurantComment: e.target.value })
                  }
                />
              </div>
              <button onClick={() => handleSubmitReview(order.id, order)}>
                Submit Review
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OrdersPage;