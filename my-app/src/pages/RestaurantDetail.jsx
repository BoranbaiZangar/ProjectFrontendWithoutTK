// src/pages/RestaurantDetail.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchRestaurantById,
  clearSelectedRestaurant,
  fetchOwnerById, // Новое действие
  clearOwner, // Новое действие
} from "../redux/restaurants";
import DishCard from "../components/DishCard";

const RestaurantDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  // Get state from Redux
  const { selected: restaurant, owner, loading, error } = useSelector(
    (state) => state.restaurants
  );

  // Fetch restaurant and owner data on mount, clear on unmount
  useEffect(() => {
    // Загружаем данные ресторана
    dispatch(fetchRestaurantById(id));

    return () => {
      dispatch(clearSelectedRestaurant());
      dispatch(clearOwner()); // Очищаем данные владельца при размонтировании
    };
  }, [dispatch, id]);

  // Загружаем данные владельца, если ресторан уже загружен
  useEffect(() => {
    if (restaurant && restaurant.ownerId) {
      dispatch(fetchOwnerById(restaurant.ownerId)); // Загружаем владельца по ownerId ресторана
    }
  }, [dispatch, restaurant]);

  // Loading state
  if (loading) return <p className="loading">Loading restaurant...</p>;

  // Error state
  if (error) {
    return (
      <p className="error">
        Error: {typeof error === "string" ? error : JSON.stringify(error)}
      </p>
    );
  }

  // No restaurant found
  if (!restaurant) return <p className="not-found">Restaurant not found</p>;

  return (
    <div className="restaurant-detail container">
      <h1 className="restaurant-title">{restaurant.name}</h1>

      <div className="restaurant-description">
        <h3>Description:</h3>
        <p>{restaurant.description}</p>
        {owner ? (
          <p>
            Managed by <span className="owner-name">{owner.name}</span> – a
            passionate food enthusiast dedicated to bringing you the best dining
            experience.
          </p>
        ) : (
          <p>Loading owner information...</p>
        )}
      </div>

      <div className="rating-info">
        <h3>Rating</h3>
        <p>
          Coming soon! In our next update, you'll be able to rate this
          restaurant with a star system. Stay tuned!
        </p>
      </div>

      <h2 className="menu-title">Menu</h2>
      {restaurant.dishes && restaurant.dishes.length > 0 ? (
        <div className="dishes-list">
          {restaurant.dishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      ) : (
        <p className="no-dishes">No dishes available yet in this restaurant.</p>
      )}

      {owner ? (
        <p className="owner-contact">Contact: {owner.email}</p>
      ) : (
        <p className="owner-contact">Contact: Loading...</p>
      )}
    </div>
  );
};

export default RestaurantDetail;