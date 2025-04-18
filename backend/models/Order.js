const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // ✅ Consistent reference
    required: true,
  }, // ✅ Added missing comma
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
    },
    color: String,
    quantity: {
        type: Number,
        required: true,
    },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
    }, 
    orderItems: [orderItemSchema],
    shippingAddress: {
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        postalCode: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
    },
    paymentmethod: {
        type: String,
        required: true,
    },
    totalPrice: {    
        type: Number,
        required: true,
    },
    isPaid: {
        type: Boolean,
        required: true,
    },
    paidAt: {
        type: Date,
    },
    isDelivered: {
        type: Boolean,
        required: true,
    },
    deliveredAt: {
        type: Date,
    },
    paymentStatus: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Processing', 'Cancelled', 'Shipped', 'Delivered'],
        required: true,
        default: 'Processing',
    },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);