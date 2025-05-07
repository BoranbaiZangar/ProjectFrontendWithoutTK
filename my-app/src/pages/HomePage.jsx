import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRestaurants } from "../redux/restaurants";
import { Link } from "react-router-dom";
import RestaurantPreviewCard from "../components/RestaurantPreviewCard";
import "../css/homepage.css";      // styles in step 3

const HomePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { list, loading, error } = useSelector((s) => s.restaurants);

  // ▸ fetch once
  useEffect(() => {
    if (!list.length) dispatch(fetchRestaurants());
  }, [dispatch, list.length]);

  const previews = list.slice(0, 8);     // first 6 restaurants

  return (
    <div className="hp-wrapper">
      {/* headline */}
      <header className="hp-header">
        <h1 className="hp-title">All Restaurants</h1>
        <Link to="/restaurants" className="hp-link-all">
          See all&nbsp;→
        </Link>
      </header>

      {/* grid */}
      {loading && <p className="hp-info">Loading…</p>}
      {error   && <p className="hp-error">{error}</p>}

      {!loading && !error && (
        <div className="hp-grid">
          {previews.map((r) => (
            <RestaurantPreviewCard key={r.id} restaurant={r} />
          ))}
        </div>
      )}

      {/* greeting / auth shortcuts */}
      {!user ? (
        <div className="hp-auth">
          
        </div>
      ) : (
        <p className="hp-hello">Hello, <strong>{user.name}</strong>!</p>
      )}
    </div>
  );
};

export default HomePage;
