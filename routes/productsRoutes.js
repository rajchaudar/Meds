const express = require("express");
const router = express.Router();
const Product = require("../models/Product"); // Ensure you have a Product model

// ✅ Route: Get all marketed products with full details
router.get("/marketed", async (req, res) => {
    try {
        const defaultImage = "https://res.cloudinary.com/dc4dywdvb/image/upload/v1742337843/qrvr5jdqgwltyc9gpjik.png";

        const products = await Product.find({ marketed: true });

        res.json({
            success: true,
            products: products.map(product => ({
                _id: product._id,
                name: product.name,
                description: product.description || "...", // ✅ Ensure description is included
                price: product.price,
                image: product.image || defaultImage, // Use default image if not provided
                uses: product.uses, // ✅ Include product use
                content: product.content, // ✅ Include composition/ingredients
                manufacturer: product.manufacturer, // ✅ Include manufacturer name
                marketed: product.marketed,
                availableForSale: product.availableForSale,
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching products", error });
    }
});

// ✅ Route: Get all store products (available for purchase)
router.get("/store", async (req, res) => {
    try {
        const products = await Product.find({ availableForSale: true }); // Fetch products available in store
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error });
    }
});

// ✅ Route: Create a new product
router.post("/", async (req, res) => {
    try {
        const { name, price, marketed, availableForSale, image, uses, content, manufacturer, description } = req.body;

        // Create a new product with all fields
        const newProduct = new Product({
            name,
            price,
            marketed,
            availableForSale,
            image: image || "https://res.cloudinary.com/dc4dywdvb/image/upload/v1742337843/qrvr5jdqgwltyc9gpjik.png",
            uses,
            content,
            manufacturer,
            description: description || "..." // ✅ Auto-generate description if missing
        });

        await newProduct.save();

        res.json({ success: true, message: "Product added successfully", product: newProduct });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error });
    }
});

// ✅ Route: Update a product
router.put("/:id", async (req, res) => {
    try {
        const { name, price, marketed, availableForSale, image, uses, content, manufacturer, description } = req.body;

        // Get the existing product
        const existingProduct = await Product.findById(req.params.id);
        if (!existingProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Ensure the image and description fields are preserved if not provided
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name,
                price,
                marketed,
                availableForSale,
                uses,
                content,
                manufacturer,
                image: image || existingProduct.image || "",
                description: description ||  "..."
            },
            { new: true } // Return the updated product
        );

        res.json({ success: true, message: "Product updated successfully", product: updatedProduct });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error });
    }
});

// ✅ Route: Delete a product
router.delete("/:id", async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error });
    }
});

module.exports = router;