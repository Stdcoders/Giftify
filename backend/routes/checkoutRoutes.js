const express = require("express")
const Checkout = require("../models/checkOut");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const { protect } = require("../middleware/authMiddleware")

const router = express.Router();

// @ route POST /api/checkout
// @desc new checkout in database
// @access Private
router.post("/", protect, async (req, res) => {
    const { checkoutItems, shippingAddress, paymentMethod, totalPrice, quantity } = req.body;

    if(!checkoutItems || !shippingAddress || !paymentMethod || !totalPrice || !quantity) {
        console.log("Missing required fields:", { checkoutItems, shippingAddress, paymentMethod, totalPrice, quantity });
        return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Log the checkout items to debug
    console.log("Checkout items received:", JSON.stringify(checkoutItems, null, 2));
    
    try {
        // Validate that each checkout item has a productId
        for (const item of checkoutItems) {
            if (!item.productId) {
                console.error("Missing productId in checkout item:", item);
                return res.status(400).json({ 
                    message: "Checkout validation failed: checkoutItems.0.productId: Path `productId` is required.",
                    details: "One or more items in the cart are missing a productId"
                });
            }
        }
        
        console.log("Creating checkout with data:", {
            user: req.user._id,
            checkoutItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            quantity
        });
        
        const checkout = await Checkout.create({
            checkoutItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            quantity,
            user: req.user._id,
            paymentStatus: "Pending",
            isPaid: false,  
        });
        console.log(`Checkout for user: ${req.user._id} created successfully`);
        res.status(201).json(checkout);
        
    } catch (error) {
        console.error("Checkout creation error:", error);
        res.status(500).json({ 
            message: "Server Error",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// @ route PUT /api/checkout/:id/pay
// @desc update checkout payment status
// @access Private
router.put("/:id/pay", protect, async (req, res) => {
  const { paymentStatus, paymentdetails, isPaid } = req.body;

  try {
    const checkout = await Checkout.findById(req.params.id);

    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }

    // Update fields only if new values are provided
    if (paymentStatus) checkout.paymentStatus = paymentStatus;
    if (paymentdetails) checkout.paymentdetails = paymentdetails;
    if (typeof isPaid !== "undefined") checkout.isPaid = isPaid;
    if (isPaid) checkout.paidAt = new Date();

    const updatedCheckout = await checkout.save();

    return res.status(200).json(updatedCheckout);
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @ route POST /api/checkout/:id/finalize
// @desc finalize checkout and create order
// @access Private
router.post("/:id/finalize", protect, async (req, res) => {
    try {
        const checkout = await Checkout.findById(req.params.id);

        if (!checkout) {
            return res.status(404).json({ message: "Checkout not found" });
        }

        if (checkout.isPaid && !checkout.isFinalized) {
            const order = await Order.create({
                user: req.user._id,
                orderItems: checkout.checkoutItems,
                shippingAddress: checkout.shippingAddress,
                paymentmethod: checkout.paymentMethod,
                totalPrice: checkout.totalPrice,
                isPaid: true,
                paymentStatus: checkout.paymentStatus,
                isDelivered: false,
                paymentdetails: checkout.paymentdetails,
                paidAt: checkout.paidAt,
            });

            checkout.isFinalized = true;
            checkout.finalizedAt = new Date();
            await checkout.save();

            // delete user cart 
            await Cart.findOneAndDelete({ user: req.user._id });
            
            res.status(201).json(order);
        } else if(checkout.isFinalized) {
            return res.status(400).json({ message: "Checkout already finalized" });
        } else {
            return res.status(400).json({ message: "Checkout not paid" });
        }
    }
    catch (error) {
        console.error("Error finalizing checkout:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;