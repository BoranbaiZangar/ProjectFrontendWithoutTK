import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateCartItem, removeFromCart, clearCart } from "../redux/cart";
import { createOrder } from "../redux/orders";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const items = useSelector((state) => state.cart.items || []);
  const [showClearModal, setShowClearModal] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function handleQuantityChange(id, e) {
    const qty = parseInt(e.target.value, 10);
    if (qty > 0) {
      dispatch(updateCartItem(id, qty));
    }
  }

  function handleRemove(id) {
    dispatch(removeFromCart(id));
  }

  function handleClearAll() {
    setShowClearModal(true);
  }

  function confirmClearCart() {
    dispatch(clearCart());
    setShowClearModal(false);
  }

  function handleCheckout() {
    if (!user) {
      alert("Please log in to place an order.");
      return;
    }
    if (items.length === 0) {
      alert("Cart is empty.");
      return;
    }

    const orderData = {
      userId: user.id,
      restaurant_id: items[0].restaurantId,
      items: items.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
      status: "In progress",
      created_at: new Date().toISOString(),
    };

    dispatch(createOrder(orderData))
      .then(() => {
        dispatch(clearCart());
        navigate("/orders");
      })
      .catch((err) => {
        alert("Failed to create order: " + err.message);
      });
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Cart</h2>
      {items.length === 0 ? (
        <p>Cart is empty.</p>
      ) : (
        <>
          <ul>
            {items.map((item) => (
              <li key={item.id} style={{ marginBottom: 8 }}>
                {item.name} — ₸{item.price} × {item.quantity}
                <input
                  type="number"
                  value={item.quantity}
                  min="1"
                  onChange={(e) => handleQuantityChange(item.id, e)}
                  style={{ width: 60, marginLeft: 8 }}
                />
                <button onClick={() => handleRemove(item.id)} style={{ marginLeft: 8 }}>
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <p>
            <strong>Total:</strong> ₸{total.toFixed(2)}
          </p>

          <div style={{ marginTop: 16 }}>
            <button onClick={handleCheckout}>Place Order</button>
            <button onClick={handleClearAll} style={{ marginLeft: 8 }}>
              Clear Cart
            </button>
          </div>
        </>
      )}

      {showClearModal && (
        <ConfirmModal
          message="Are you sure you want to clear the cart?"
          onConfirm={confirmClearCart}
          onCancel={() => setShowClearModal(false)}
        />
      )}
    </div>
  );
}