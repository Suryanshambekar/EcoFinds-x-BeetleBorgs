import React, { useState } from "react";
import api from "../api";

// Creates a product via /upload/image then /products. Mirrors your original form fields. 
export default function AddProduct() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let images = [];
      if (imageFile) {
        const fd = new FormData();
        fd.append("image", imageFile);
        const up = await api.post("/upload/image", fd, { headers: { "Content-Type": "multipart/form-data" } });
        images = [up.data.filePath];
      }
      const payload = { title, description, price: Number(price), category, condition, images };
      await api.post("/products", payload);
      alert("Your item has been listed successfully! 🎉");
      setTitle(""); setPrice(""); setCategory(""); setCondition(""); setDescription(""); setImageFile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="add-product-page" className="page">
      <div className="container">
        <div className="page-header">
          <h1>List Your Item</h1>
          <p>Give your item a new life and help the environment</p>
        </div>

        <form className="add-product-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="What are you selling?" required />
          </div>

          <div className="form-group">
            <label>Price ($)</label>
            <input type="number" step="0.01" min="0" value={price} onChange={(e)=>setPrice(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={(e)=>setCategory(e.target.value)} required>
              <option value="">Select a category</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Home">Home & Garden</option>
              <option value="Books">Books</option>
              <option value="Sports">Sports</option>
            </select>
          </div>

          <div className="form-group">
            <label>Condition</label>
            <select value={condition} onChange={(e)=>setCondition(e.target.value)} required>
              <option value="">Select condition</option>
              <option value="Like New">Like New</option>
              <option value="Very Good">Very Good</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea rows="4" value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Describe your item..." required />
          </div>

          <div className="form-group">
            <label>Image</label>
            <input type="file" accept="image/*" onChange={(e)=>setImageFile(e.target.files?.[0] || null)} />
          </div>

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Listing..." : "List Item"}
          </button>
        </form>
      </div>
    </div>
  );
}
