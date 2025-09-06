// routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// GET /products - Get all products with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20, sort = 'createdAt' } = req.query;
    
    // Build filter object
    const filter = { isActive: true };
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sortObj = {};
    if (sort === 'price_asc') sortObj.price = 1;
    else if (sort === 'price_desc') sortObj.price = -1;
    else if (sort === 'newest') sortObj.createdAt = -1;
    else sortObj.createdAt = -1;

    const products = await Product.find(filter)
      .populate('seller', 'username email')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'username email')
      .lean();

    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /products - Create new product (protected)
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      condition,
      images = [],
      co2Saved = 0,
      location = {},
      tags = []
    } = req.body;

    // Validate required fields
    if (!title || !description || !price || !category || !condition) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const product = new Product({
      title,
      description,
      price: parseFloat(price),
      category,
      condition,
      images,
      co2Saved: parseFloat(co2Saved),
      location,
      tags,
      seller: req.user._id
    });

    await product.save();
    await product.populate('seller', 'username email');

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /products/:id - Update product (protected, owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }

    const updates = req.body;
    delete updates.seller; // Prevent changing seller
    delete updates._id; // Prevent changing ID

    Object.assign(product, updates);
    await product.save();
    await product.populate('seller', 'username email');

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /products/:id - Delete product (protected, owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }

    // Soft delete by setting isActive to false
    product.isActive = false;
    await product.save();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /products/user/my-listings - Get user's own products (protected)
router.get('/user/my-listings', auth, async (req, res) => {
  try {
    const products = await Product.find({ 
      seller: req.user._id,
      isActive: true 
    })
    .populate('seller', 'username email')
    .sort({ createdAt: -1 })
    .lean();

    res.json(products);
  } catch (error) {
    console.error('Get user listings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
