import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AddProduct from "./pages/AddProduct";
import MyListings from "./pages/MyListings";
import Cart from "./pages/Cart";
import Purchases from "./pages/Purchases";
import { getToken } from "./utils/storage";
import api from "./api";

// Centralizes auth guard + navbar cart badge sync.
// Uses the same pages & class names you had so your CSS "just works". 
export default function App() {
  const [token, setToken] = useState(getToken());
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  const needAuth = token != null;

  const fetchCartCount = async () => {
    try {
      const res = await api.get("/cart");
      setCartCount(res.data?.totalItems || 0);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => { if (needAuth) fetchCartCount(); }, [needAuth, location.pathname]);

  // Listen to "cart:count" custom events fired by pages
  useEffect(() => {
    const handler = (e) => setCartCount(e.detail || 0);
    window.addEventListener("cart:count", handler);
    return () => window.removeEventListener("cart:count", handler);
  }, []);

  // Reacts to login/logout automatically
  useEffect(() => {
    const id = setInterval(() => setToken(getToken()), 500);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {needAuth && <Navbar cartCount={cartCount} />}

      <main id="main-content">
        <Routes>
          <Route path="/login" element={needAuth ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/" element={needAuth ? <Home /> : <Navigate to="/login" replace />} />
          <Route path="/add-product" element={needAuth ? <AddProduct /> : <Navigate to="/login" replace />} />
          <Route path="/my-listings" element={needAuth ? <MyListings /> : <Navigate to="/login" replace />} />
          <Route path="/cart" element={needAuth ? <Cart /> : <Navigate to="/login" replace />} />
          <Route path="/purchases" element={needAuth ? <Purchases /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to={needAuth ? "/" : "/login"} replace />} />
        </Routes>
      </main>
    </>
  );
}
