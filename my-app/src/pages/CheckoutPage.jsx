
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const items = useSelector((state) => state.cart.items || []);

  useEffect(() => {
    // If cart becomes empty, redirect
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Checkout</h2>
      <p>Your order is being processed...</p>
    </div>
  );
}
