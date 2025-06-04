const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: "config.env" });
const authRoutes = require('./routes/authRoutes');
const productsRoutes = require('./routes/productsRoutes');
const cartRoutes = require("./routes/cartRoutes");
const Contact = require("./models/Contact");
const path = require('path');
const bodyParser = require("body-parser");

const app = express();

// Use correct BASE URL dynamically
const BASE_URL = process.env.NODE_ENV === 'production' ? process.env.PROD_BASE_URL : process.env.LOCAL_BASE_URL;
console.log(`🔗 Running on: ${BASE_URL}`);

// ✅ Public Routes
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Thank You</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                    margin-top: 50px;
                }
                h1 {
                    color: #4CAF50;
                }
            </style>
        </head>
        <body>
            <h1>Thank You for Your Request!</h1>
            <p>We appreciate your interest. Have a great day!</p>
        </body>
        </html>
    `);
});

app.get('/reset-password', (req, res) => {
    try {
        const token = req.query.token;
        const FRONTEND_URL = process.env.FRONTEND_URL;

        if (!token) {
            return res.status(400).json({ success: false, message: "Token is missing." });
        }

        res.redirect(`${FRONTEND_URL}/Meds/pages/reset-password.html?token=${token}`);
    } catch (error) {
        console.error("❌ Error in reset-password route:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
});

// ✅ Stripe Webhook (raw body required)
app.use("/api/cart/stripe-webhook", express.raw({ type: "application/json" }));

// Body parser for all other routes
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

// ✅ Whitelist only / and /reset-password, show HTML for browser
app.use((req, res, next) => {
    const allowedOrigins = [process.env.FRONTEND_URL];
    const origin = req.headers.origin;
    const publicRoutes = ['/', '/reset-password'];

    const isBrowser = req.headers.accept && req.headers.accept.includes('text/html');

    if (publicRoutes.includes(req.path) || allowedOrigins.includes(origin)) {
        return next();
    }

    if (isBrowser) {
        return res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Access Restricted</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f9f9f9;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                    }
                    .box {
                        text-align: center;
                        padding: 30px;
                        background-color: white;
                        border-radius: 8px;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                    }
                    h1 {
                        color: #e74c3c;
                    }
                    a {
                        color: #3498db;
                        text-decoration: none;
                    }
                </style>
            </head>
            <body>
                <div class="box">
                    <h1>🚫 Access Restricted</h1>
                    <p>This page is not publicly accessible.</p>
                    <p><a href="/">Return to Home</a></p>
                </div>
            </body>
            </html>
        `);
    }

    return res.status(403).json({ success: false, message: "⛔ Access denied: Invalid origin or route." });
});

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Protected API Routes
app.use('/api', authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);

// ✅ Contact Form Route (protected)
app.post("/api/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        const newContact = new Contact({ name, email, message });
        await newContact.save();

        res.json({ success: true, message: "Message received successfully!" });
    } catch (error) {
        console.error("❌ Error saving message:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));