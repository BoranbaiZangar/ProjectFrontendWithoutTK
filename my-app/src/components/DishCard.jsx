import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../redux/cart";
import { addToast } from "../redux/toast";

export default function DishCard(props) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { id, name, price } = props.dish;
  const restaurantId = props.restaurantId;

  function handleAddToCart() {
    if (!user) {
      alert("Please log in to add items to cart.");
      return;
    }
    if (user.role !== "user") {
      alert("Only users can add items to cart.");
      return;
    }

    dispatch(
      addToCart({ id, name, price, restaurantId })
    );
    dispatch(
      addToast({ message: `${name} successfully added to cart`, type: "success" })
    );
  }

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 16, marginBottom: 16, background: "#fff" }}>
      <h4>{name}</h4>
      <p>Price: ₸{price}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
}
