const express = require("express");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");
const router = express.Router();

// @route GET /api/products
// @desc get all products
// @access Public

router.get("/", protect, admin, async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}
);

module.exports = router;