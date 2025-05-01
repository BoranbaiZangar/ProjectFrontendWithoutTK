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
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!id || id.trim() === "") {
      dispatch({
        type: "FETCH_RESTAURANTS_FAILURE",
        payload: "Invalid restaurant ID",
      });
      return;
    }

    dispatch(fetchRestaurantById(id));

    return () => {
      dispatch(clearSelectedRestaurant());
      dispatch(clearOwner());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (restaurant && restaurant.owner_id) {
      dispatch(fetchOwnerById(restaurant.owner_id));
    }
  }, [dispatch, restaurant]);

  if (loading) return <p className="loading">Loading restaurant...</p>;

  if (error) {
    return (
      <p className="error">
        {error === "Failed to fetch restaurant"
          ? "Could not load the restaurant. It may not exist or the server is unavailable."
          : error === "Invalid restaurant ID"
          ? "The restaurant ID is invalid. Please check the URL."
          : `Error: ${typeof error === "string" ? error : JSON.stringify(error)}`}
      </p>
    );
  }

  if (!restaurant) return <p className="not-found">Restaurant not found</p>;

  const isOwner = user?.id && restaurant.owner_id === user.id;
  const userRole = user?.role || "guest"; // Если user или role отсутствует, считаем "guest"
  const canViewRestaurant =
    userRole === "admin" ||
    userRole === "moderator" ||
    (userRole === "owner" && isOwner) ||
    restaurant.status === "active";

  if (!canViewRestaurant) {
    return <p className="not-found">You do not have permission to view this restaurant.</p>;
  }

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