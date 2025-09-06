import React, { useEffect, useState } from "react";
import api from "../api";

// Cart is fully backed by /cart endpoints per docs.
export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load cart from backend
  const loadCart = async () => {
    setLoading(true);
    try {
      const res = await api.get("/cart");
      setCart(res.data);
      const evt = new CustomEvent("cart:count", {
        detail: res.data?.totalItems || 0,
      });
      window.dispatchEvent(evt);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // Remove single item
  const removeItem = async (itemId) => {
    try {
      const res = await api.delete(`/cart/remove/${itemId}`);
      setCart(res.data);
      const evt = new CustomEvent("cart:count", {
        detail: res.data?.totalItems || 0,
      });
      window.dispatchEvent(evt);
    } catch (err) {
      console.error("Remove from cart error:", err.response?.data || err);
      alert("Failed to remove item from cart.");
    }
  };

  // Update item quantity
  const updateQty = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      const res = await api.put(`/cart/update/${itemId}`, { quantity });
      setCart(res.data);
      const evt = new CustomEvent("cart:count", {
        detail: res.data?.totalItems || 0,
      });
      window.dispatchEvent(evt);
    } catch (err) {
      console.error("Update quantity error:", err.response?.data || err);
      alert("Failed to update quantity.");
    }
  };

  // Complete checkout
  const checkout = async () => {
    if (!cart || !cart.items || cart.items.length === 0) return;

    const shippingAddress = {
      street: "123 Green St",
      city: "Eco City",
      state: "CA",
      zipCode: "90000",
      country: "US",
    };

    // Build items payload (backend expects product + quantity)
    const items = cart.items.map((i) => ({
      product: i.product._id,
      quantity: i.quantity,
    }));

    try {
      const res = await api.post("/orders", {
        items,
        totalAmount: cart.totalPrice || 0,
        totalCO2Saved: cart.totalCO2Saved || 0,
        shippingAddress,
        paymentMethod: "credit_card",
      });

      alert(`Order placed successfully! Order #${res.data.orderNumber}`);

      // Try to clear cart on backend
      try {
        await api.delete("/cart/clear");
      } catch (err) {
        console.warn("Cart clear endpoint missing, falling back to local reset");
        setCart({ items: [], totalItems: 0, totalPrice: 0, totalCO2Saved: 0 });
      }

      const evt = new CustomEvent("cart:count", { detail: 0 });
      window.dispatchEvent(evt);
    } catch (err) {
      console.error("Checkout error:", err.response?.data || err);
      alert(err.response?.data?.error || "Checkout failed. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="container">
        <p>Loading cart...</p>
      </div>
    );

  if (!cart || cart.totalItems === 0) {
    return (
      <div id="cart-page" className="page">
        <div className="container">
          <div id="cart-content">
            <div className="empty-cart">Your cart is empty.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="cart-page" className="page">
      <div className="container">
        <div id="cart-content">
          {cart.items.map((i) => (
            <div className="cart-item" key={i._id}>
              <img
                src={i.product?.images?.[0]}
                alt={i.product?.title}
                className="cart-item-image"
                onError={(e) =>
                  (e.currentTarget.src =
                    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop")
                }
              />
              <div className="cart-item-details">
                <h3 className="cart-item-title">{i.product?.title}</h3>
                <p className="cart-item-price">
                  ${Number(i.product?.price || 0).toFixed(2)}
                </p>
                {typeof i.product?.co2Saved === "number" && (
                  <p
                    style={{
                      color: "var(--muted-foreground)",
                      fontSize: ".875rem",
                    }}
                  >
                    CO₂ saved: {i.product.co2Saved.toFixed(1)} kg
                  </p>
                )}
                <div style={{ marginTop: ".5rem" }}>
                  <button
                    className="view-button"
                    onClick={() => updateQty(i._id, i.quantity - 1)}
                  >
                    -
                  </button>
                  <span style={{ margin: "0 .75rem" }}>{i.quantity}</span>
                  <button
                    className="view-button"
                    onClick={() => updateQty(i._id, i.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="cart-item-actions">
                <button
                  className="remove-button"
                  onClick={() => removeItem(i._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="cart-summary">
            <div className="cart-total">
              <span>Total: ${Number(cart.totalPrice || 0).toFixed(2)}</span>
            </div>
            {typeof cart.totalCO2Saved === "number" && (
              <p
                style={{
                  color: "var(--primary)",
                  fontWeight: 500,
                  marginBottom: "1rem",
                  textAlign: "center",
                }}
              >
                🌱 You'll save {cart.totalCO2Saved.toFixed(1)} kg of CO₂ with
                this purchase!
              </p>
            )}
            <button className="checkout-button" onClick={checkout}>
              Complete Purchase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
