// src/pages/RestaurantDetail.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchRestaurantById,
  clearSelectedRestaurant,
  fetchOwnerById, 
  clearOwner, 
} from "../redux/restaurants";
import DishCard from "../components/DishCard";

const RestaurantDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { selected: restaurant, owner, loading, error } = useSelector(
    (state) => state.restaurants
  );

  useEffect(() => {
    dispatch(fetchRestaurantById(id));

    return () => {
      dispatch(clearSelectedRestaurant());
      dispatch(clearOwner()); 
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (restaurant && restaurant.ownerId) {
      dispatch(fetchOwnerById(restaurant.ownerId));
    }
  }, [dispatch, restaurant]);

  if (loading) return <p className="loading">Loading restaurant...</p>;

  if (error) {
    return (
      <p className="error">
        Error: {typeof error === "string" ? error : JSON.stringify(error)}
      </p>
    );
  }

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