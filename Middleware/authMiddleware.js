const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");
    // console.log("🛑 Token Received:", token); // Debug log

    if (!token) {
        return res.status(401).json({ error: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        // console.log("✅ Decoded Token:", decoded); // Debug log

        req.user = decoded; // Ensure `userId` is stored in `req.user`
        next();
    } catch (err) {
        console.error("❌ Token verification failed:", err.message);
        res.status(401).json({ error: "Invalid token" });
    }
};

module.exports = authMiddleware;