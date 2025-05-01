
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchRestaurantById,
  clearSelectedRestaurant,
  fetchOwnerById,
  clearOwner
} from "../redux/restaurants";
import { fetchReviews } from "../redux/orders";
import DishCard from "../components/DishCard";

function RestaurantDetail() {
  var params = useParams();
  var restaurantId = params.id;
  var dispatch = useDispatch();
  var restaurantsState = useSelector(function(state) {
    return state.restaurants;
  });
  var ordersState = useSelector(function(state) {
    return state.orders;
  });
  var authState = useSelector(function(state) {
    return state.auth;
  });

  var restaurant = restaurantsState.selected;
  var owner = restaurantsState.owner;
  var loadingRestaurant = restaurantsState.loading;
  var errorRestaurant = restaurantsState.error;

  var reviews = ordersState.reviews;
  var loadingReviews = ordersState.loading;
  var errorReviews = ordersState.error;

  var user = authState.user;

  useEffect(function() {
    if (restaurantId === undefined || restaurantId.trim() === "") {
      dispatch({
        type: "FETCH_RESTAURANTS_FAILURE",
        payload: "Invalid restaurant ID"
      });
      return;
    }

    dispatch(fetchRestaurantById(restaurantId));
    dispatch(fetchReviews({ restaurantId: restaurantId }));

    return function() {
      dispatch(clearSelectedRestaurant());
      dispatch(clearOwner());
    };
  }, [dispatch, restaurantId]);

  useEffect(function() {
    if (restaurant && restaurant.owner_id) {
      dispatch(fetchOwnerById(restaurant.owner_id));
    }
  }, [dispatch, restaurant]);

  if (loadingRestaurant || loadingReviews) {
    return React.createElement("p", null, "Loading...");
  }

  if (errorRestaurant) {
    return React.createElement(
      "p",
      { style: { color: "red" } },
      errorRestaurant === "Failed to fetch restaurant"
        ? "Could not load the restaurant. It may not exist or the server is unavailable."
        : errorRestaurant === "Invalid restaurant ID"
        ? "The restaurant ID is invalid. Please check the URL."
        : "Error: " + (typeof errorRestaurant === "string" ? errorRestaurant : JSON.stringify(errorRestaurant))
    );
  }

  if (errorReviews) {
    return React.createElement(
      "p",
      { style: { color: "red" } },
      "Error loading reviews: " + errorReviews
    );
  }

  if (restaurant === null || restaurant === undefined) {
    return React.createElement("p", null, "Restaurant not found");
  }

  var isOwner = false;
  if (user !== null && user !== undefined && restaurant.owner_id === user.id) {
    isOwner = true;
  }

  var userRole = "guest";
  if (user !== null && user !== undefined && user.role) {
    userRole = user.role;
  }

  var canView = false;
  if (userRole === "admin" || userRole === "moderator") {
    canView = true;
  } else if (userRole === "owner" && isOwner) {
    canView = true;
  } else if (restaurant.status === "active") {
    canView = true;
  }

  if (!canView) {
    return React.createElement("p", null, "You do not have permission to view this restaurant.");
  }

  var averageRating = 0;
  if (reviews && reviews.length > 0) {
    var sum = 0;
    for (var i = 0; i < reviews.length; i++) {
      sum += reviews[i].restaurantRating;
    }
    averageRating = (sum / reviews.length).toFixed(1);
  }

  return React.createElement(
    "div",
    { style: { padding: "20px" } },
    React.createElement("h1", null, restaurant.name),

    React.createElement(
      "div",
      null,
      React.createElement("h3", null, "Description:"),
      React.createElement("p", null, restaurant.description),
      owner
        ? React.createElement(
            "p",
            null,
            "Managed by ",
            React.createElement(
              "span",
              { style: { fontWeight: "bold" } },
              owner.name
            ),
            " – a passionate food enthusiast dedicated to bringing you the best dining experience."
          )
        : React.createElement("p", null, "Loading owner information...")
    ),

    React.createElement(
      "div",
      null,
      React.createElement("h3", null, "Rating"),
      React.createElement(
        "p",
        null,
        "Average Rating: ",
        averageRating,
        " / 5 (",
        reviews ? reviews.length : 0,
        " reviews)"
      ),
      React.createElement("h4", null, "Reviews"),
      reviews && reviews.length > 0
        ? React.createElement(
            "ul",
            { style: { listStyle: "none", padding: 0 } },
            reviews.map(function(review) {
              return React.createElement(
                "li",
                {
                  key: review.id,
                  style: {
                    border: "1px solid #ddd",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "4px"
                  }
                },
                React.createElement("p", null, "Rating: ", review.restaurantRating, " / 5"),
                React.createElement("p", null, "Comment: ", review.restaurantComment),
                React.createElement(
                  "p",
                  null,
                  "Posted on: ",
                  new Date(review.createdAt).toLocaleString()
                )
              );
            })
          )
        : React.createElement("p", null, "No reviews yet.")
    ),

    React.createElement("h2", null, "Menu"),
    restaurant.dishes && restaurant.dishes.length > 0
      ? React.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: "20px" } },
          restaurant.dishes.map(function(dish) {
            return React.createElement(DishCard, {
              key: dish.id,
              dish: dish,
              restaurantId: restaurant.id
            });
          })
        )
      : React.createElement("p", null, "No dishes available yet in this restaurant."),

    owner
      ? React.createElement("p", null, "Contact: ", owner.email)
      : React.createElement("p", null, "Contact: Loading...")
  );
}

export default RestaurantDetail;
