import React, { useEffect, useMemo, useState } from "react";
import api from "../api";

// Uses GET /orders to show purchase history + eco stats. 
export default function Purchases() {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    const res = await api.get("/orders");
    setOrders(res.data?.orders || []);
  };

  useEffect(() => { loadOrders(); }, []);

  const stats = useMemo(() => {
    let totalCO2 = 0, totalAmount = 0, totalItems = 0;
    for (const o of orders) {
      totalCO2 += Number(o.totalCO2Saved || 0);
      totalAmount += Number(o.totalAmount || 0);
      totalItems += o.items?.reduce((s, it) => s + Number(it.quantity || 0), 0) || 0;
    }
    return { totalCO2, totalAmount, totalItems };
  }, [orders]);

  return (
    <div id="purchases-page" className="page">
      <div className="container">
        <div className="page-header">
          <h1>Purchases</h1>
          <p>Your order history</p>
        </div>

        <div className="eco-stats">
          <div className="stat-card">
            <p className="stat-label">Total CO₂ Saved</p>
            <p className="stat-value">{stats.totalCO2.toFixed(1)} kg</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Items Bought</p>
            <p className="stat-value">{stats.totalItems}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Spent</p>
            <p className="stat-value">${stats.totalAmount.toFixed(2)}</p>
          </div>
        </div>

        <div id="purchases-content">
          {orders.length === 0 ? (
            <div className="empty-cart">No purchases yet.</div>
          ) : (
            orders.map(o => (
              <div className="cart-item" key={o._id}>
                <div className="cart-item-details" style={{ flex: 1 }}>
                  <h3 className="cart-item-title">Order {o.orderNumber || o._id}</h3>
                  <p className="cart-item-price">${Number(o.totalAmount).toFixed(2)}</p>
                  {typeof o.totalCO2Saved === "number" && (
                    <p style={{ color: "var(--primary)", fontSize: ".875rem" }}>
                      CO₂ saved: {o.totalCO2Saved.toFixed(1)} kg
                    </p>
                  )}
                  <div style={{ marginTop: ".5rem" }}>
                    {o.items?.map((it, idx) => (
                      <span key={idx} style={{ color: "var(--muted-foreground)", fontSize: ".875rem", marginRight: "1rem" }}>
                        {it.product?.title || "Item"} × {it.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
