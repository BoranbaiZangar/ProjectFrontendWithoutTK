// src/components/DishCard.js
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Toast from "./Toast";

const DishCard = ({ dish }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const handleOrder = async () => {
    if (!user) {
      setToast({ message: "Пожалуйста, войдите в аккаунт", type: "error" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (user.role !== "Customer") {
      setToast({ message: "Только покупатели могут оформлять заказы", type: "error" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const order = {
      userId: user.id,
      items: [dish],
      status: "in progress",
    };

    try {
      const res = await fetch("http://localhost:5000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });

      if (!res.ok) throw new Error("Ошибка при создании заказа");

      setToast({ message: "Заказ успешно оформлен!", type: "success" });
      setTimeout(() => {
        setToast(null);
        navigate("/orders");
      }, 1500);
    } catch (err) {
      setToast({ message: "Ошибка при заказе", type: "error" });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "1rem",
        marginBottom: "1rem",
        boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
        backgroundColor: "#fff",
      }}
    >
      <h4 style={{ marginBottom: "0.5rem" }}>{dish.name}</h4>
      <p style={{ fontSize: "14px", color: "#555" }}>Цена: ${dish.price}</p>

      {user?.role === "Customer" && (
        <button
          onClick={handleOrder}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#3498db",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "0.5rem",
          }}
        >
          Оформить заказ
        </button>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default DishCard;
