const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: "" }, // ✅ Ensure it always exists
    price: { type: Number, required: true },
    marketer: { type: String }, // Who markets the product
    marketed: { type: Boolean, default: false },
    availableForSale: { type: Boolean, default: false },
    image: { type: String, default: "" },
    uses: { type: String, required: true }, // ✅ Product use (e.g., "Pain relief")
    content: { type: String, required: true }, // ✅ Ingredients (e.g., "Paracetamol 500mg")
    manufacturer: { type: String, required: true } // ✅ Manufacturer details
});

// ✅ Ensure a meaningful description is added before saving
productSchema.pre("save", function (next) {
    if (!this.description || this.description.trim() === "") {
        // If no description, use first 50 characters of 'uses' or 'content'
        this.description = this.uses || this.content.substring(0, 50) + "...";
    }
    next();
});

module.exports = mongoose.model("Product", productSchema);