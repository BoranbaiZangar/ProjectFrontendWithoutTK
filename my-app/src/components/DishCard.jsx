import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "../toast";            // ← путь поправьте при необходимости

const DishCard = ({ dish }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleOrder = async () => {
    // not logged in
    if (!user) {
      toast.error("Please log in to your account", { autoClose: 3000 });
      return;
    }
    // wrong role
    if (user.role !== "Customer") {
      toast.error("Only customers can place orders", { autoClose: 3000 });
      return;
    }

    const order = {
      userId: user.id,
      items: [dish],
      status: "In progress",
    };

    try {
      const res = await fetch("http://localhost:5000/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      if (!res.ok) throw new Error();

      toast.success("Order successfully placed!", { autoClose: 1500 });
      setTimeout(() => navigate("/orders"), 1500);
    } catch {
      toast.error("Error while ordering", { autoClose: 3000 });
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
      <p style={{ fontSize: "14px", color: "#555" }}>Price: {dish.price} ₸</p>

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
          Place an order
        </button>
      )}
    </div>
  );
};

export default DishCard;
