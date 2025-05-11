import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchRestaurantById,
  clearSelectedRestaurant,
  fetchOwnerById,
  clearOwner,
} from "../redux/restaurants";
import { fetchReviews } from "../redux/orders";
import DishCard from "../components/DishCard";
import "../css/styles.css";

const DEFAULT_AVATAR_URL =
  "https://static.wixstatic.com/media/35cf67_26f8bcd18f81440a93d08a0ece05c806~mv2.jpg/v1/fit/w_502,h_282,q_90,enc_avif,quality_auto/35cf67_26f8bcd18f81440a93d08a0ece05c806~mv2.jpg";

const RestaurantDetail = () => {
  const { id: restaurantId } = useParams();
  const dispatch = useDispatch();
  const { selected: restaurant, owner, loading: loadingRestaurant, error: errorRestaurant } = useSelector(
    (state) => state.restaurants
  );
  const { reviews, loading: loadingReviews, error: errorReviews } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!restaurantId || restaurantId.trim() === "") {
      dispatch({ type: "FETCH_RESTAURANTS_FAILURE", payload: "Invalid restaurant ID" });
      return;
    }

    dispatch(fetchRestaurantById(restaurantId));
    dispatch(fetchReviews({ restaurantId }));

    return () => {
      dispatch(clearSelectedRestaurant());
      dispatch(clearOwner());
    };
  }, [dispatch, restaurantId]);

  useEffect(() => {
    if (restaurant && restaurant.owner_id) {
      dispatch(fetchOwnerById(restaurant.owner_id));
    }
  }, [dispatch, restaurant]);

  if (loadingRestaurant || loadingReviews) {
    return <p>Loading...</p>;
  }

  if (errorRestaurant) {
    return (
      <p style={{ color: "red" }}>
        {errorRestaurant === "Failed to fetch restaurant"
          ? "Could not load the restaurant. It may not exist or the server is unavailable."
          : errorRestaurant === "Invalid restaurant ID"
          ? "The restaurant ID is invalid. Please check the URL."
          : `Error: ${typeof errorRestaurant === "string" ? errorRestaurant : JSON.stringify(errorRestaurant)}`}
      </p>
    );
  }

  if (errorReviews) {
    return <p style={{ color: "red" }}>Error loading reviews: {errorReviews}</p>;
  }

  if (!restaurant) {
    return <p>Restaurant not found</p>;
  }

  const isOwner = user && restaurant.owner_id === user.id;
  const userRole = user?.role || "guest";
  const canView =
    userRole === "admin" ||
    userRole === "moderator" ||
    (userRole === "owner" && isOwner) ||
    restaurant.status === "active";

  if (!canView) {
    return <p>You do not have permission to view this restaurant.</p>;
  }

  const averageRating =
    reviews && reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.restaurantRating, 0) / reviews.length).toFixed(1)
      : 0;

  return (
    <div className="container">
      <h2>{restaurant.name}</h2>
      <div className="restaurant-section">
        <div className="avatar-wrapper">
          <img
            src={restaurant.avatar_url || DEFAULT_AVATAR_URL}
            alt={`${restaurant.name} Avatar`}
            className="restaurant-avatar"
          />
        </div>
      </div>
      <div className="restaurant-section">
        <h3>Description</h3>
        <p>{restaurant.description || "No description available."}</p>
        {owner ? (
          <p>
            Managed by <span style={{ fontWeight: "bold" }}>{owner.name}</span> – a passionate food
            enthusiast dedicated to bringing you the best dining experience.
          </p>
        ) : (
          <p>Loading owner information...</p>
        )}
      </div>
      <div className="restaurant-section">
        <h3>Rating</h3>
        <p>
          Average Rating: {averageRating} / 5 ({reviews?.length || 0} reviews)
        </p>
        <h4>Reviews</h4>
        {reviews && reviews.length > 0 ? (
          <ul className="reviews-list">
            {reviews.map((review) => (
              <li key={review.id} className="review-item">
                <p>Rating: {review.restaurantRating} / 5</p>
                <p>Comment: {review.restaurantComment}</p>
                <p>Posted on: {new Date(review.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>
      <div className="restaurant-section">
        <h3>Menu</h3>
        {restaurant.dishes && restaurant.dishes.length > 0 ? (
          <div className="dishes-grid">
            {restaurant.dishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} restaurantId={restaurant.id} />
            ))}
          </div>
        ) : (
          <p>No dishes available yet in this restaurant.</p>
        )}
      </div>
      <div className="restaurant-section">
        <p>Contact: {owner ? owner.email : "Loading..."}</p>
      </div>
    </div>
  );
};

export default RestaurantDetail;