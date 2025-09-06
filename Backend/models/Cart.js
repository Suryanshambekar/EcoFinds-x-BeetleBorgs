// models/Cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  quantity: { 
    type: Number, 
    default: 1, 
    min: 1 
  },
  addedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const cartSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalItems: { 
    type: Number, 
    default: 0 
  },
  totalPrice: { 
    type: Number, 
    default: 0 
  },
  totalCO2Saved: { 
    type: Number, 
    default: 0 
  }
}, { 
  timestamps: true 
});

// Update totals when items change
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalPrice = this.items.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);
  this.totalCO2Saved = this.items.reduce((sum, item) => {
    return sum + (item.product.co2Saved * item.quantity);
  }, 0);
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
