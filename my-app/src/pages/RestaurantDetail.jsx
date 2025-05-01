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

const RestaurantDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { selected: restaurant, owner, loading, error } = useSelector(
    (state) => state.restaurants
  );
  const { reviews, loading: reviewsLoading, error: reviewsError } = useSelector(
    (state) => state.orders
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
    dispatch(fetchReviews({ restaurantId: id }));

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

  if (loading || reviewsLoading) return <p>Loading...</p>;

  if (error) {
    return (
      <p style={{ color: "red" }}>
        {error === "Failed to fetch restaurant"
          ? "Could not load the restaurant. It may not exist or the server is unavailable."
          : error === "Invalid restaurant ID"
          ? "The restaurant ID is invalid. Please check the URL."
          : `Error: ${typeof error === "string" ? error : JSON.stringify(error)}`}
      </p>
    );
  }

  if (reviewsError) {
    return <p style={{ color: "red" }}>Error loading reviews: {reviewsError}</p>;
  }

  if (!restaurant) return <p>Restaurant not found</p>;

  const isOwner = user?.id && restaurant.owner_id === user.id;
  const userRole = user?.role || "guest";
  const canViewRestaurant =
    userRole === "admin" ||
    userRole === "moderator" ||
    (userRole === "owner" && isOwner) ||
    restaurant.status === "active";

  if (!canViewRestaurant) {
    return <p>You do not have permission to view this restaurant.</p>;
  }

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.restaurantRating, 0) / reviews.length).toFixed(1)
      : 0;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{restaurant.name}</h1>

      <div>
        <h3>Description:</h3>
        <p>{restaurant.description}</p>
        {owner ? (
          <p>
            Managed by <span style={{ fontWeight: "bold" }}>{owner.name}</span> – a
            passionate food enthusiast dedicated to bringing you the best dining
            experience.
          </p>
        ) : (
          <p>Loading owner information...</p>
        )}
      </div>

      <div>
        <h3>Rating</h3>
        <p>
          Average Rating: {averageRating} / 5 ({reviews.length} reviews)
        </p>
        <h4>Reviews</h4>
        {reviews.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {reviews.map((review) => (
              <li
                key={review.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "4px",
                }}
              >
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

      <h2>Menu</h2>
      {restaurant.dishes && restaurant.dishes.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
          {restaurant.dishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} restaurantId={restaurant.id} />          ))}
        </div>
      ) : (
        <p>No dishes available yet in this restaurant.</p>
      )}

      {owner ? (
        <p>Contact: {owner.email}</p>
      ) : (
        <p>Contact: Loading...</p>
      )}
    </div>
  );
};

export default RestaurantDetail;