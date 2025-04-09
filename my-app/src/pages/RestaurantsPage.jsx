// src/pages/RestaurantsPage.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRestaurants } from "../redux/restaurants";
import { Link } from "react-router-dom";

const RestaurantsPage = () => {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.restaurants);

  useEffect(() => {
    dispatch(fetchRestaurants());
  }, [dispatch]);

  return (
    <div>
      <h2>Restaurants</h2>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      <ul>
        {list.map((r) => (
          <li key={r.id}>
            <Link to={`/restaurants/${r.id}`}>{r.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RestaurantsPage;
