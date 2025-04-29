import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders, updateOrderStatus, cancelOrder } from "../redux/orders";

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list, loading, error } = useSelector((state) => state.orders);

  const statuses = ["Processing", "In Transit", "Delivered"];
  const allStatuses = ["In progress", "Processing", "In Transit", "Delivered", "Cancelled"];

  const statusColors = {
    "In progress": "#f39c12",
    "Processing": "#3498db",
    "In Transit": "#9b59b6",
    "Delivered": "#2ecc71",
    "Cancelled": "#e74c3c"
  };

  useEffect(() => {
    if (user) {
      dispatch(fetchOrders(user.role === "Admin" ? "ALL" : user.id));
    }
  }, [dispatch, user]);

  const handleStatusChange = (orderId, newStatus) => {
    if (newStatus !== "" && statuses.includes(newStatus)) {
      dispatch(updateOrderStatus(orderId, newStatus));
    }
  };

  const handleCancelOrder = (orderId) => {
    const confirmed = window.confirm("Are you sure you want to cancel this order?");
    if (confirmed) {
      dispatch(cancelOrder(orderId));
    }
  };

  return (
    <div>
      <h2>Orders</h2>
      {loading && <p>Loading...</p>}
      {error && (
        <p style={{ color: "red" }}>
          {typeof error === "string" ? error : JSON.stringify(error)}
        </p>
      )}

      {list.map((order) => (
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
            {order.items.map((item, index) => (
              <li key={index}>
                {item.name} — ${item.price}
              </li>
            ))}
          </ul>
          <p style={{ 
            color: statusColors[order.status] || "#000000",
            fontWeight: "bold"
          }}>
            Status: {order.status}
          </p>
          {/* Админ рөліндегі адам заказды өзгерте алады. 
          Егер тапырыс жеткізілсе немесе бас тартылған жағдайда, тапсырыстын күйі өзгере алалмайды.*/}
          {user?.role === "Admin" && order.status !== "Delivered" && order.status !== "Cancelled" && (
            <div>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                style={{
                  padding: "0.3rem",
                  borderRadius: "4px",
                  marginTop: "0.5rem",
                }}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* Сатушы рөліндегі адам тек в прогрессе деген жағдайда, тапсырыстан бас тарта алалады. */}
          {user?.role === "Customer" && order.status === "In progress" && (
            <div>
              <button
                onClick={() => handleCancelOrder(order.id)}
                style={{
                  marginTop: "0.5rem",
                  padding: "0.4rem 1rem",
                  backgroundColor: "#e74c3c",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel Order
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OrdersPage;