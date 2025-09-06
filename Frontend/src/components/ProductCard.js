import React from "react";

const fallbackImg = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop";

export default function ProductCard({ product, onAddToCart, onView }) {
  const img = product.images?.[0] || product.image || fallbackImg;
  return (
    <div className="product-card">
      <img
        src={img}
        alt={product.title}
        className="product-image"
        onError={(e) => (e.currentTarget.src = fallbackImg)}
      />
      <div className="product-content">
        <div className="product-header">
          <h3 className="product-title">{product.title}</h3>
          <span className="product-price">${Number(product.price).toFixed(2)}</span>
        </div>
        <div className="product-meta">
          {product.category && <span className="product-category">{product.category}</span>}
          {product.condition && <span className="product-condition">{product.condition}</span>}
        </div>
        {product.description && <p className="product-description">{product.description}</p>}
        <div className="product-actions">
          {onAddToCart && (
            <button className="add-to-cart-button" onClick={() => onAddToCart(product)}>
              Add to Cart
            </button>
          )}
          {onView && (
            <button className="view-button" onClick={() => onView(product)}>
              View
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
