import { useDispatch, useSelector } from "react-redux";
import { fetchOrders, updateOrderStatus } from "../redux/orders";
import { useEffect } from "react";

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    if (user) {
      dispatch(fetchOrders(user.role === "Admin" ? "ALL" : user.id));
    }
  }, [dispatch, user]);

  const handleStatusChange = (orderId, currentStatus) => {
    const newStatus = prompt("Введите новый статус заказа:", currentStatus);
    if (newStatus && newStatus !== currentStatus) {
      dispatch(updateOrderStatus(orderId, newStatus));
    }
  };

  return (
    <div>
      <h2>Заказы</h2>
      {loading && <p>Загрузка...</p>}
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
          <strong>Заказ #{order.id}</strong>
          <ul>
            {order.items.map((item, index) => (
              <li key={index}>
                {item.name} — ${item.price}
              </li>
            ))}
          </ul>
          <p>Статус: {order.status}</p>

          {user?.role === "Admin" && (
            <button
              onClick={() => handleStatusChange(order.id, order.status)}
              style={{
                marginTop: "0.5rem",
                padding: "0.4rem 1rem",
                backgroundColor: "#2980b9",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Сменить статус
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default OrdersPage;
