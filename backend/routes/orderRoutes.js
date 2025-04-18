const express = require("express");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// @route GET /api/orders
// @desc get all orders for logged in user 
// @access Private/Admin

router.get("/my-orders", protect, async (req, res) => {
    try {
        //find all orders for current logged in user
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}
);

// @route GET /api/orders/:id
// @desc get order by id
// @access Private/Admin

router.get("/:id", protect, async (req, res) => {
    try {
        //find order by id
        const order = await Order.findById(req.params.id).populate(
            "user",
            "name email"
        );

        if (!order) {
            return res.status(404).json({message: "Order not found"})
        }
        res.json(order);

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}
);

module.exports = router;