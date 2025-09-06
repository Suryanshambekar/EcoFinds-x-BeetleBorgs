import React, { useEffect, useState } from "react";
import api from "../api";
import ProductCard from "../components/ProductCard";

// Shows the user's own products from /products/user/my-listings. 
export default function MyListings() {
  const [items, setItems] = useState([]);

  const fetchMine = async () => {
    const res = await api.get("/products/user/my-listings");
    setItems(res.data || []);
  };

  useEffect(() => { fetchMine(); }, []);

  return (
    <div id="my-listings-page" className="page">
      <div className="container">
        <div className="page-header">
          <h1>My Items</h1>
          <p>Your listed items</p>
        </div>

        <div id="my-listings-grid" className="products-grid">
          {items.length === 0
            ? <p className="empty-cart">You haven't listed any items yet.</p>
            : items.map(p => <ProductCard key={p._id} product={p} />)
          }
        </div>
      </div>
    </div>
  );
}
