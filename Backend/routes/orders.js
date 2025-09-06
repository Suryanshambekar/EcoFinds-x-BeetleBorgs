// routes/orders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// GET /orders/stats - Get order statistics (protected)
router.get('/stats', auth, async (req, res) => {
  try {
    const buyerStats = await Order.aggregate([
      { $match: { buyer: req.user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          totalCO2Saved: { $sum: '$totalCO2Saved' },
          totalItems: { $sum: { $sum: '$items.quantity' } }
        }
      }
    ]);

    const sellerStats = await Order.aggregate([
      { $match: { 'items.product': { $in: await Product.find({ seller: req.user._id }).distinct('_id') } } },
      {
        $unwind: '$items'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $match: { 'product.seller': req.user._id }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          totalCO2Saved: { $sum: { $multiply: ['$items.co2Saved', '$items.quantity'] } }
        }
      }
    ]);

    res.json({
      buyer: buyerStats[0] || { totalOrders: 0, totalSpent: 0, totalCO2Saved: 0, totalItems: 0 },
      seller: sellerStats[0] || { totalSales: 0, totalRevenue: 0, totalCO2Saved: 0 }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /orders/seller/orders - Get orders for user's products (protected)
router.get('/seller/orders', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    // Find all products by this user
    const userProducts = await Product.find({ 
      seller: req.user._id 
    }).select('_id');

    const productIds = userProducts.map(p => p._id);

    // Find orders containing these products
    const filter = { 
      'items.product': { $in: productIds } 
    };
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('items.product', 'title images category condition seller')
      .populate('buyer', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /orders - Get user's order history (protected)
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { buyer: req.user._id };
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('items.product', 'title images category condition')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /orders/:id - Get single order (protected)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'title images category condition seller')
      .populate('buyer', 'username email')
      .lean();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user is the buyer
    if (order.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /orders - Create new order (protected)
router.post('/', auth, async (req, res) => {
  try {
    const {
      items,
      totalAmount,
      totalCO2Saved,
      shippingAddress,
      paymentMethod = 'credit_card',
      notes = ''
    } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required' });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ error: 'Valid total amount is required' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    // Validate all products exist and are active
    const productIds = items.map(item => item.product);
    const products = await Product.find({ 
      _id: { $in: productIds }, 
      isActive: true 
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: 'Some products are no longer available' });
    }

    // Create order
    const order = new Order({
      buyer: req.user._id,
      items,
      totalAmount,
      totalCO2Saved: totalCO2Saved || 0,
      shippingAddress,
      paymentMethod,
      notes,
      status: 'pending'
    });

    // Generate order number if not set
    if (!order.orderNumber) {
      const count = await Order.countDocuments();
      order.orderNumber = `ECO-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
    }

    await order.save();
    await order.populate('items.product', 'title images category condition');
    await order.populate('buyer', 'username email');

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /orders/:id/status - Update order status (protected, for sellers)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    if (!status || !['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const order = await Order.findById(orderId)
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user is a seller of any item in the order
    const userIsSeller = order.items.some(item => 
      item.product.seller.toString() === req.user._id.toString()
    );

    if (!userIsSeller) {
      return res.status(403).json({ error: 'Not authorized to update this order' });
    }

    order.status = status;
    await order.save();
    await order.populate('items.product', 'title images category condition');
    await order.populate('buyer', 'username email');

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;
