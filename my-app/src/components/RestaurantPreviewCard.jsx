import React from "react";
import { Link } from "react-router-dom";
import "../css/homepage.css";

const RestaurantPreviewCard = ({ restaurant }) => {
  // выбираем изображение в порядке приоритета
  const img =
    restaurant.avatar_url ||          // новое поле
    restaurant.photo ||               // старое поле (если вдруг сохранится)
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEMIbANrmSyaJulwOUgIC4Ewj294UUHZB5ZQ&s";               // запасная заглушка

  return (
    <Link to={`/restaurants/${restaurant.id}`} className="hp-card">
      <div
        className="hp-card-img"
        style={{ backgroundImage: `url(${img})` }}
        aria-label={restaurant.name}
      />
      <div className="hp-card-body">
        <h3 className="hp-card-name">{restaurant.name}</h3>
        <p className="hp-card-desc">
          {restaurant.description?.slice(0, 60) || " "}
        </p>
      </div>
    </Link>
  );
};

export default RestaurantPreviewCard;
