// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 100
  },
  description: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 1000
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Electronics', 'Clothing', 'Home', 'Books', 'Sports']
  },
  condition: { 
    type: String, 
    required: true,
    enum: ['Like New', 'Very Good', 'Good', 'Fair']
  },
  images: [{
    type: String, // URLs to uploaded images
    default: []
  }],
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  co2Saved: { 
    type: Number, 
    default: 0,
    min: 0
  },
  location: {
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'US' }
  },
  tags: [{
    type: String,
    trim: true
  }]
}, { 
  timestamps: true 
});

// Index for better search performance
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ seller: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
