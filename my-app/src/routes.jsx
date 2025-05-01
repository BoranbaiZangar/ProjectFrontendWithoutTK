import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RestaurantsPage from "./pages/RestaurantsPage";
import RestaurantDetail from "./pages/RestaurantDetail";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import AdminPanel from "./pages/AdminPanel";
import AdminStatsPage from "./pages/AdminStatsPage";
import OwnerDashboard from "./pages/OwnerDashboard";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import ConsoleRoleChanger from "./components/ConsoleRoleChanger";
import CheckoutPage from "./pages/CheckoutPage";

export default function AppRoutes() {
  return (
    <>  
      <ConsoleRoleChanger />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/restaurants" element={<RestaurantsPage />} />
        <Route path="/restaurants/:id" element={<RestaurantDetail />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute roles={["user", "admin", "moderator", "owner", "courier"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute roles={["user"]}>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
  path="/checkout"
  element={
    <ProtectedRoute roles={["user"]}>
      <CheckoutPage />
    </ProtectedRoute>
  }
/>

        <Route
          path="/orders"
          element={
            <ProtectedRoute roles={["user", "admin", "moderator", "courier"]}>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner"
          element={
            <ProtectedRoute roles={["owner"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-stats"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminStatsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
