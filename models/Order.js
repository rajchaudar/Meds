const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    contact: { type: String, required: true },
    address: {
        line1: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postal_code: { type: String, required: true },
        country: { type: String, required: true, default: "US" }
    },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            name: String,
            price: Number,
            quantity: Number,
        }
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Paid", "Shipped", "Delivered"], default: "Pending" },
    paymentIntentId: { type: String }, // ✅ Make it optional initially
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);