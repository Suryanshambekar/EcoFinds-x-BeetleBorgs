import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import ProductCard from "../components/ProductCard";
import Modal from "../components/Modal";

// Category filter + product grid, like your original Home page. 
export default function Home() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState(null);
  const [cartCount, setCartCount] = useState(0); // local to show feedback

  const categories = useMemo(() => ([
    { key: "all", label: "All Items" },
    { key: "Electronics", label: "Electronics" },
    { key: "Clothing", label: "Clothing" },
    { key: "Home", label: "Home & Garden" },
    { key: "Books", label: "Books" },
    { key: "Sports", label: "Sports" },
  ]), []);

  const fetchProducts = async () => {
    const params = {};
    if (category !== "all") params.category = category;
    const res = await api.get("/products", { params });
    setProducts(res.data.products || []);
  };

  const fetchCartCount = async () => {
    try {
      const res = await api.get("/cart");
      setCartCount(res.data?.totalItems || 0);
      // also reflect badge in Navbar via App state (App handles this)
      const evt = new CustomEvent("cart:count", { detail: res.data?.totalItems || 0 });
      window.dispatchEvent(evt);
    } catch { /* ignore if not logged in */ }
  };

  useEffect(() => { fetchProducts(); }, [category]);
  useEffect(() => { fetchCartCount(); }, []);

  const addToCart = async (product) => {
    await api.post("/cart/add", { productId: product._id || product.id, quantity: 1 });
    await fetchCartCount();
    alert(`${product.title} added to cart!`);
  };

  return (
    <div id="home-page" className="page active">
      <div className="container">
        <div className="home-header">
          <h1>Discover Sustainable Treasures</h1>
          <p>Find pre-loved items and reduce your environmental impact</p>
        </div>

        <div className="category-filter">
          {categories.map(c => (
            <button
              key={c.key}
              className={`category-pill ${category === c.key ? "active" : ""}`}
              onClick={() => setCategory(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div id="products-grid" className="products-grid">
          {products.length === 0 ? (
            <p className="empty-cart">No products found in this category.</p>
          ) : products.map(p => (
            <ProductCard
              key={p._id}
              product={p}
              onAddToCart={addToCart}
              onView={setSelected}
            />
          ))}
        </div>
      </div>

      <Modal open={!!selected} onClose={()=>setSelected(null)}>
        {selected && (
          <div style={{ padding: "2rem" }}>
            <img
              src={selected.images?.[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=300&fit=crop"}
              alt={selected.title}
              style={{ width: "100%", height: 300, objectFit: "cover", borderRadius: "var(--radius)", marginBottom: "1.5rem" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
              <h2 style={{ margin: 0 }}>{selected.title}</h2>
              <span style={{ fontSize: "2rem", fontWeight: 700, color: "var(--primary)" }}>
                ${Number(selected.price).toFixed(2)}
              </span>
            </div>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
              {selected.category && <span className="product-category">{selected.category}</span>}
              {selected.condition && <span className="product-condition">{selected.condition}</span>}
            </div>
            {selected.description && (
              <p style={{ color: "var(--muted-foreground)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                {selected.description}
              </p>
            )}
            {typeof selected.co2Saved === "number" && (
              <div style={{ background: "rgba(46, 125, 50, 0.1)", padding: "1rem", borderRadius: "var(--radius)", marginBottom: "1.5rem" }}>
                <p style={{ color: "var(--primary)", fontWeight: 500, margin: 0 }}>
                  🌱 By buying this item, you'll save {selected.co2Saved.toFixed(1)} kg of CO₂ from being produced!
                </p>
              </div>
            )}
            <div style={{ display: "flex", gap: "1rem" }}>
              <button className="add-to-cart-button" onClick={()=>{ addToCart(selected); }}>
                Add to Cart
              </button>
              <button className="view-button" onClick={()=>setSelected(null)}>Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
