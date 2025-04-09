// src/pages/RestaurantDetail.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchRestaurantById,
  clearSelectedRestaurant,
} from "../redux/restaurants";
import DishCard from "../components/DishCard";

const RestaurantDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  // получаем состояние из Redux
  const { selected: restaurant, loading, error } = useSelector(
    (state) => state.restaurants
  );

  // при загрузке компонента
  useEffect(() => {
    dispatch(fetchRestaurantById(id));
    return () => {
      dispatch(clearSelectedRestaurant());
    };
  }, [dispatch, id]);

  // состояния
  if (loading) return <p>Загрузка ресторана...</p>;

  if (error) {
    return (
      <p style={{ color: "red" }}>
        Ошибка: {typeof error === "string" ? error : JSON.stringify(error)}
      </p>
    );
  }

  if (!restaurant) return <p>Ресторан не найден</p>;

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <h2>{restaurant.name}</h2>
      <p style={{ marginBottom: "1rem" }}>{restaurant.description}</p>

      <h3>Меню</h3>
      {restaurant.dishes && restaurant.dishes.length > 0 ? (
        <div style={{ marginTop: "1rem" }}>
          {restaurant.dishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      ) : (
        <p>В этом ресторане пока нет блюд.</p>
      )}
    </div>
  );
};

export default RestaurantDetail;
