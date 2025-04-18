const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountprice: {
      type: Number,
      min: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    sku: {
      type: String,
      unique: true,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    collections: {
      type: [String],
      required: true,
    },
    age: {
      type: String,
      enum: ["Below 18", "18-24", "24-35", "35+", "Any"], // ✅ Consistent age format
      required: true,
    },
    images: {
      type: [
        {
          url: { type: String, required: true },
          altText: { type: String },
        },
      ],
      default: [], // ✅ Prevents undefined images
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      // ✅ Fixed typo
      type: Number,
      default: 0,
    },
    occasion: {
      type: String,
      enum: ["Birthday", "Wedding", "New Year", "Valentine", "Anniversary", "Any"],
      default: "Any",
    },
    tags: [String],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    weight: Number,
    customizations: {
      image: {
        url: { type: String }, // Optional image customization
        altText: { type: String },
      },
      text: {
        message: { type: String }, // Optional text customization
        fontStyle: { type: String },
      },
    },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

// Calculate average rating when reviews are modified
productSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    this.rating = this.reviews.reduce((acc, review) => acc + review.rating, 0) / this.reviews.length;
    this.numReviews = this.reviews.length;
  } else {
    this.rating = 0;
    this.numReviews = 0;
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
