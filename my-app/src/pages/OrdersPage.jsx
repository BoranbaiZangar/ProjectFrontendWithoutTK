import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  updateOrderStatus,
  cancelOrder,
  assignCourier,
  submitReview,
  fetchReviews,
} from "../redux/orders";
import { fetchCouriers } from "../redux/couriers";

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list: orders = [], reviews = [], loading: ordersLoading, error: ordersError } =
    useSelector((state) => state.orders || {});
  const { list: couriers = [], loading: couriersLoading, error: couriersError } =
    useSelector((state) => state.couriers || {});
  const [reviewData, setReviewData] = useState({});
  const [showReviewForm, setShowReviewForm] = useState({});

  useEffect(() => {
    if (user) {
      const target = user.role === "admin" || user.role === "moderator" ? "ALL" : user.id;
      dispatch(fetchOrders(target));
      dispatch(fetchCouriers());
      dispatch(fetchReviews({}));
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
    const data = reviewData[orderId];
    if (!data || data.courierRating < 1 || data.courierRating > 5 || data.restaurantRating < 1 || data.restaurantRating > 5) {
      dispatch({
        type: "toast/ADD_TOAST",
        payload: { message: "Ratings must be between 1 and 5.", type: "error" },
      });
      return;
    }

    if (!order.restaurant_id) {
      dispatch({
        type: "toast/ADD_TOAST",
        payload: { message: "Cannot submit review: Restaurant ID is missing for this order.", type: "error" },
      });
      return;
    }

    dispatch(
      submitReview({
        orderId,
        userId: user.id,
        courierId: order.courier_id,
        restaurantId: order.restaurant_id,
        courierRating: data.courierRating,
        restaurantRating: data.restaurantRating,
        restaurantComment: data.restaurantComment,
      })
    ).then(() => {
      setShowReviewForm((prev) => ({ ...prev, [orderId]: false }));
      setReviewData((prev) => ({ ...prev, [orderId]: { courierRating: 0, restaurantRating: 0, restaurantComment: "" } }));
      dispatch(fetchReviews({}));
    });
  };

  const hasReview = (orderId) => {
    return reviews.some((review) => review.orderId === orderId && review.userId === user.id);
  };

  const getReviewForOrder = (orderId) => {
    return reviews.find((review) => review.orderId === orderId && review.userId === user.id);
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
    <div style={{ padding: "20px" }}>
      <h2>Orders</h2>
      {ordersLoading && <p>Loading orders...</p>}
      {ordersError && <p style={{ color: "red" }}>{ordersError}</p>}
      {couriersLoading && <p>Loading couriers...</p>}
      {couriersError && <p style={{ color: "red" }}>Error loading couriers: {couriersError}</p>}
      {!user && <p>Please log in to view orders.</p>}

      {filteredOrders.length === 0 && !ordersLoading && !ordersError && <p>No orders found.</p>}

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
          <p>Restaurant ID: {order.restaurant_id || "Not specified"}</p>

          {user?.role === "moderator" && order.status === "In progress" && (
            <div>
              <label htmlFor={`courier-select-${order.id}`}>Assign Courier: </label>
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
                <button
                  onClick={() => handleConfirmOrder(order.id)}
                  style={{ marginRight: "10px", padding: "5px 10px" }}
                >
                  Confirm Pickup
                </button>
              )}
              {order.status === "In Transit" && (
                <button
                  onClick={() => handleConfirmDelivery(order.id)}
                  style={{ padding: "5px 10px" }}
                >
                  Confirm Delivered
                </button>
              )}
            </div>
          )}

          {user?.role === "user" &&
            (order.status === "Pending" || order.status === "In progress") && (
              <button
                onClick={() => handleCancelOrder(order.id)}
                style={{ padding: "5px 10px", background: "#e74c3c", color: "white", border: "none" }}
              >
                Cancel Order
              </button>
            )}

          {user?.role === "user" && order.status === "Delivered" && order.restaurant_id && (
            <div>
              {hasReview(order.id) ? (
                <div>
                  <h4>Your Review</h4>
                  <p>Courier Rating: {getReviewForOrder(order.id).courierRating} / 5</p>
                  <p>Restaurant Rating: {getReviewForOrder(order.id).restaurantRating} / 5</p>
                  <p>Comment: {getReviewForOrder(order.id).restaurantComment}</p>
                </div>
              ) : (
                <div>
                  {showReviewForm[order.id] ? (
                    <div>
                      <h4>Leave a Review</h4>
                      <div>
                        <label>Courier Rating (1-5): </label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={reviewData[order.id]?.courierRating || 0}
                          onChange={(e) =>
                            setReviewData({
                              ...reviewData,
                              [order.id]: {
                                ...reviewData[order.id],
                                courierRating: parseInt(e.target.value, 10) || 0,
                              },
                            })
                          }
                          style={{ width: "60px", marginBottom: "10px" }}
                        />
                      </div>
                      <div>
                        <label>Restaurant Rating (1-5): </label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={reviewData[order.id]?.restaurantRating || 0}
                          onChange={(e) =>
                            setReviewData({
                              ...reviewData,
                              [order.id]: {
                                ...reviewData[order.id],
                                restaurantRating: parseInt(e.target.value, 10) || 0,
                              },
                            })
                          }
                          style={{ width: "60px", marginBottom: "10px" }}
                        />
                      </div>
                      <div>
                        <label>Restaurant Comment: </label>
                        <textarea
                          value={reviewData[order.id]?.restaurantComment || ""}
                          onChange={(e) =>
                            setReviewData({
                              ...reviewData,
                              [order.id]: {
                                ...reviewData[order.id],
                                restaurantComment: e.target.value,
                              },
                            })
                          }
                          style={{ width: "100%", height: "80px", marginBottom: "10px" }}
                        />
                      </div>
                      <button
                        onClick={() => handleSubmitReview(order.id, order)}
                        style={{ padding: "5px 10px", marginRight: "10px" }}
                      >
                        Submit Review
                      </button>
                      <button
                        onClick={() => setShowReviewForm((prev) => ({ ...prev, [order.id]: false }))}
                        style={{ padding: "5px 10px", background: "#ccc", border: "none" }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowReviewForm((prev) => ({ ...prev, [order.id]: true }))}
                      style={{ padding: "5px 10px" }}
                    >
                      Leave a Review
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OrdersPage;