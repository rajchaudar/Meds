const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Razorpay = require("razorpay");
const authMiddleware = require("../Middleware/authMiddleware");
require("dotenv").config({ path: "config.env" });
// ✅ Checkout with Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Verify JWT Token Middleware
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: No token provided." });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { userId: decoded.userId };
        next();
    } catch (err) {
        console.error("❌ Token Verification Error:", err);
        res.status(403).json({ error: "Invalid token." });
    }
}

// ✅ Get User's Cart
router.get("/", verifyToken, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.userId }).populate("items.productId");
        if (!cart) return res.json({ items: [], total: 0 });

        let total = cart.items.reduce((sum, item) => 
            item.productId ? sum + item.productId.price * item.quantity : sum, 0
        );

        res.json({ items: cart.items, total });
    } catch (err) {
        console.error("❌ Error fetching cart:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Clear Cart After Checkout
router.delete("/clear", verifyToken, async (req, res) => {
    try {
        await Cart.findOneAndDelete({ userId: req.user.userId }); // 🔴 FIXED
        res.json({ message: "Cart cleared successfully" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});
router.get("/count", verifyToken, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.userId });
        if (!cart) return res.json({ count: 0 });

        let itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        res.json({ count: itemCount });
    } catch (err) {
        console.error("❌ Error fetching cart count:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Add Item to Cart
router.post("/add", verifyToken, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        if (!productId || !quantity) {
            return res.status(400).json({ error: "Product ID and quantity are required." });
        }

        let cart = await Cart.findOne({ userId: req.user.userId });
        if (!cart) cart = new Cart({ userId: req.user.userId, items: [] });

        const product = await Product.findById(productId);
        if (!product) {
            console.error("❌ Product Not Found:", productId);
            return res.status(404).json({ error: "Product not found" });
        }

        let itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ productId, name: product.name, price: product.price, quantity });
        }

        await cart.save();
        res.json({ success: true, message: "Item added to cart", cart });

    } catch (err) {
        console.error("❌ Cart Add Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Update Item Quantity
router.put("/update", verifyToken, async (req, res) => {
    const { productId, quantity } = req.body;
    if (!productId || quantity === undefined) {
        return res.status(400).json({ error: "Product ID and quantity are required." });
    }

    try {
        let cart = await Cart.findOne({ userId: req.user.userId });
        if (!cart) return res.status(404).json({ error: "Cart not found" });

        let itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex === -1) return res.status(404).json({ error: "Item not found in cart" });

        cart.items[itemIndex].quantity = quantity;
        if (cart.items[itemIndex].quantity <= 0) cart.items.splice(itemIndex, 1);

        await cart.save();
        res.json(cart);
    } catch (err) {
        console.error("❌ Update Cart Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Remove Item from Cart
router.delete("/remove/:productId", verifyToken, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.userId });
        if (!cart) return res.status(404).json({ error: "Cart not found" });

        cart.items = cart.items.filter(item => item.productId.toString() !== req.params.productId);
        await cart.save();
        res.json(cart);
    } catch (err) {
        console.error("❌ Remove Cart Item Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});



router.post("/checkout", verifyToken, async (req, res) => {
    try {
        const { name, email, contact, address } = req.body;

        if (!name || !email || !contact || !address) {
            return res.status(400).json({ error: "All user details and address are required." });
        }

        const userCart = await Cart.findOne({ userId: req.user.userId }).populate("items.productId");
        if (!userCart || userCart.items.length === 0) {
            return res.status(400).json({ error: "Cart is empty." });
        }

        let totalAmount = userCart.items.reduce((sum, item) => 
            item.productId ? sum + item.productId.price * item.quantity : sum, 0
        );

        totalAmount = Math.round(totalAmount * 100);

        const options = {
            amount: totalAmount,
            currency: "INR",
            receipt: `order_${Date.now()}`,
            payment_capture: 1,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        const newOrder = await Order.create({
            userId: req.user.userId,
            name, email, contact, address,
            items: userCart.items,
            totalAmount: totalAmount / 100,
            status: "Pending",
            paymentIntentId: razorpayOrder.id, // ✅ Store in paymentIntentId
        });

        res.json({ orderId: razorpayOrder.id, amount: totalAmount, key: process.env.RAZORPAY_KEY_ID });
    } catch (error) {
        console.error("❌ Checkout Error:", error);
        res.status(500).json({ error: "Failed to create order." });
    }
});

// ✅ Update Order Status
router.put("/orderstatus/:orderId", async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, paymentId } = req.body;

        // console.log("🛒 Updating Order:", orderId, status, paymentId);

        if (!orderId || !status || !paymentId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // 🔹 Query using `paymentIntentId` instead of `razorpayOrderId`
        const updatedOrder = await Order.findOneAndUpdate(
            { paymentIntentId: orderId },  // ✅ Fixed here
            { status, paymentId },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ error: "Order not found" });
        }

        // console.log("✅ Order Updated:", updatedOrder);
        res.status(200).json({ message: "Order updated successfully", order: updatedOrder });

    } catch (error) {
        console.error("❌ Error updating order:", error);
        res.status(500).json({ error: "Failed to update order status." });
    }
});

// ✅ Fetch User Orders
router.get("/orders", verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        console.error("❌ Fetch Orders Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;