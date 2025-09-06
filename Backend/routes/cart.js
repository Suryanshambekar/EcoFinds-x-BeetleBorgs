const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const auth = require("../middleware/auth");

// GET /cart - Get user's cart
router.get("/", auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product", "title price images co2Saved isActive")
      .lean();

    if (!cart) {
      cart = {
        user: req.user._id,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        totalCO2Saved: 0,
      };
    }

    // filter out inactive products
    cart.items = cart.items.filter(
      (item) => item.product && item.product.isActive
    );

    res.json(cart);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /cart/add - Add item
router.post("/add", auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ error: "Product not found or unavailable" });
    }

    if (product.seller.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "Cannot add your own product to cart" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (existingItem) {
      existingItem.quantity += parseInt(quantity);
    } else {
      cart.items.push({ product: productId, quantity: parseInt(quantity) });
    }

    await cart.save();
    await cart.populate(
      "items.product",
      "title price images co2Saved isActive"
    );

    res.json(cart);
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /cart/update/:itemId
router.put("/update/:itemId", auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "Valid quantity is required" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: "Item not found in cart" });

    item.quantity = parseInt(quantity);
    await cart.save();
    await cart.populate(
      "items.product",
      "title price images co2Saved isActive"
    );

    res.json(cart);
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /cart/remove/:itemId
router.delete("/remove/:itemId", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    cart.items.pull(req.params.itemId); // ✅ fixed
    await cart.save();
    await cart.populate(
      "items.product",
      "title price images co2Saved isActive"
    );

    res.json(cart);
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /cart/clear
router.delete("/clear", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    cart.items = [];
    await cart.save();

    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /cart/checkout
router.post("/checkout", auth, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = "credit_card", notes = "" } =
      req.body;
    if (!shippingAddress) {
      return res.status(400).json({ error: "Shipping address is required" });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // validate products still active
    const inactive = cart.items.filter((it) => !it.product.isActive);
    if (inactive.length > 0) {
      return res.status(400).json({
        error: "Some items are no longer available",
        inactiveItems: inactive.map((it) => it.product.title),
      });
    }

    // build order
    const orderItems = cart.items.map((it) => ({
      product: it.product._id,
      quantity: it.quantity,
      price: it.product.price,
      co2Saved: it.product.co2Saved,
    }));

    const order = new Order({
      buyer: req.user._id,
      items: orderItems,
      totalAmount: orderItems.reduce(
        (s, it) => s + it.price * it.quantity,
        0
      ),
      totalCO2Saved: orderItems.reduce(
        (s, it) => s + (it.co2Saved || 0) * it.quantity,
        0
      ),
      shippingAddress,
      paymentMethod,
      notes,
      status: "pending",
    });

    if (!order.orderNumber) {
      const count = await Order.countDocuments();
      order.orderNumber = `ECO-${Date.now()}-${(count + 1)
        .toString()
        .padStart(4, "0")}`;
    }

    await order.save();

    // clear cart
    cart.items = [];
    await cart.save();

    res.json({ message: "Checkout successful", order });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
