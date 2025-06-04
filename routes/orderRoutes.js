const express = require("express");
const router = express.Router();

// ✅ Sample product route
router.get("/", (req, res) => {
    res.json({ message: "Products API is working!" });
});

module.exports = router; // ✅ Ensure router is exported