import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearAuth } from "../utils/storage";
import logoUrl from "../assets/environmental_logo.svg";


export default function Navbar({ cartCount }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const logout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <nav id="navigation" className="navigation">
      <div className="nav-container">
        <div className="nav-content">
          <div className="logo">
            <div className="logo-icon">
              <img 
  src={logoUrl} 
  alt="EcoFinds logo" 
  className="logo-img" 
  style={{ width: "32px", height: "32px" }} 
/>
            </div>
            <span className="logo-text">EcoFinds</span>
          </div>

          <div className="nav-items">
            <NavLink className="nav-button" to="/">Home</NavLink>
            <NavLink className="nav-button" to="/add-product">Sell</NavLink>
            <NavLink className="nav-button" to="/my-listings">My Items</NavLink>
            <NavLink className="nav-button" to="/cart">
              Cart
              {cartCount > 0 && <span id="cart-badge" className="cart-badge">{cartCount}</span>}
            </NavLink>
            <NavLink className="nav-button" to="/purchases">Purchases</NavLink>

            <div className="account-dropdown">
              <button 
                className="nav-button account-button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                Account
              </button>
              <div className={`dropdown-menu ${dropdownOpen ? "show" : ""}`}>
                <button className="dropdown-item logout-btn" onClick={logout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
