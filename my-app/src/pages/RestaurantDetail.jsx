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

  // Get state from Redux
  const { selected: restaurant, loading, error } = useSelector(
    (state) => state.restaurants
  );

  // Fetch restaurant data on mount, clear on unmount
  useEffect(() => {
    dispatch(fetchRestaurantById(id));
    return () => {
      dispatch(clearSelectedRestaurant());
    };
  }, [dispatch, id]);

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

  // Mock owner data (based on provided JSON)
  const owner = {
    id: "2",
    name: "Owner One",
    email: "owner@example.com",
    role: "Owner",
  };

  return (
    
    <div className="restaurant-detail container">
      <h1 className="restaurant-title">{restaurant.name}</h1>
       
        
    
      <div className="restaurant-description">
        
      <h3>Description:</h3>
      
      <p >{restaurant.description}</p>
      <p>
          Managed by <span className="owner-name">{owner.name}</span> – a passionate food enthusiast dedicated to bringing you the best dining experience.
        </p>
      </div>
      

      <div className="rating-info">
        <h3>Rating</h3>
        <p>
          Coming soon! In our next update, you'll be able to rate this restaurant with a star system. Stay tuned!
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
      <p className="owner-contact">Contact: {owner.email}</p>
    </div>
    
  );
};

export default RestaurantDetail;