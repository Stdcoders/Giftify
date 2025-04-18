const express = require("express");
const Order = require("../models/Order");
const { protect, admin } = require("../middleware/authMiddleware");
const router = express.Router();

// @route GET /api/admin/orders
// @desc get all orders
// @access Private/Admin

router.get("/", protect, admin, async (req, res) => {
    try {
        const orders = await Order.find({}).populate("user", "name email");
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}
);

// @route PUT /api/admin/orders/:id
// @desc update order
// @access Private/Admin

router.put("/:id", protect, admin, async (req, res) => {
    try {
        let order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        order.status = req.body.status || order.status;
        order.isDelivered = req.body.status === "Delivered" ? true : order.isDelivered;
        order.deliveredAt = req.body.status === "Delivered" ? Date.now() : order.deliveredAt;

        await order.save();
        res.json(order);
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}
);

// @route DELETE /api/admin/orders/:id
// @desc delete order
// @access Private/Admin

router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        await order.deleteOne();
        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}
);

module.exports = router;    