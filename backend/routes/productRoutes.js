const express = require("express");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route POST /api/products
// @desc Add new product to database
// @access Private/Admin
router.post("/", protect, admin, async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      user: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route GET /api/products
// @desc Get all products with filters
// @access Public
router.get("/", async (req, res) => {
  try {
    console.log("Incoming filters:", req.query);
    const filters = {};
    const {
      collection,
      size,
      color,
      age,
      gender,
      priceRange,
      sortBy,
      search,
      category,
      isFeatured,
      isPublished,
      rating,
      occasion,
    } = req.query;

    if (collection && collection !== "all")
      filters.collections = { $in: collection.split(",") };
    
    // Enhanced category handling
    if (category && category !== "all") {
      // Map short category names to full category names for compatibility
      const categoryMap = {
        'Tech': { $regex: 'Tech', $options: 'i' },
        'Travel': { $regex: 'Travel', $options: 'i' },
        'PetLove': { $regex: 'Pet', $options: 'i' },
      };
      
      if (categoryMap[category]) {
        // If it's one of our special categories, use regex match
        filters.category = categoryMap[category];
      } else {
        // For normal categories, use exact match
        filters.category = category;
      }
    }
    
    if (age && age !== "any") filters.age = age;
    if (size) filters.size = { $in: size.split(",") };
    if (color) filters.colors = { $in: color.split(",") };
    if (gender && gender !== "all") filters.gender = gender;
    
    // Handle price range filter
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split("-").map(Number);
      filters.price = {
        $gte: minPrice,
        $lte: maxPrice
      };
    }
    
    if (search) filters.name = { $regex: search, $options: "i" };
    if (isFeatured !== undefined) filters.isFeatured = isFeatured === "true";
    if (isPublished !== undefined) filters.isPublished = isPublished === "true";
    if (rating) filters.rating = { $gte: parseFloat(rating) };
    if (occasion) filters.occasion = occasion;

    // Apply occasion filter smartly with category
    const occasionCategories = {
      birthday: ["Gifts", "Kids", "Decor", "Accessories"],
      wedding: ["Kids", "Decor", "Accessories"],
      anniversary: ["Decor", "Accessories"],
    };
    if (occasion && occasionCategories[occasion]) {
      const occasionCats = occasionCategories[occasion];
      if (filters.category) {
        filters.category = {
          $in: occasionCats.filter(
            (cat) =>
              cat === filters.category ||
              (filters.category.$in && filters.category.$in.includes(cat))
          ),
        };
      } else {
        filters.category = { $in: occasionCats };
      }
    }

    // Sorting
    let sort = {};
    if (sortBy) {
      const sortOptions = {
        priceAsc: { price: 1 },
        priceDesc: { price: -1 },
        popular: { rating: -1 },
      };
      sort = sortOptions[sortBy] || {};
    }

    console.log("Applied filters:", filters);
    const products = await Product.find(filters).sort(sort);
    res.json({ success: true, data: products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route GET /api/products/best-seller
// @desc Get best-selling product
// @access Public
router.get("/best-seller", async (req, res) => {
  try {
    const bestSeller = await Product.findOne().sort({ rating: -1 }).limit(1);
    if (!bestSeller)
      return res.status(404).json({ message: "No best seller found" });

    res.json(bestSeller);
  } catch (error) {
    console.error("Error fetching best seller:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route GET /api/products/new-arrivals
// @desc Get new arrivals
// @access Public
router.get("/new-arrivals", async (req, res) => {
  try {
    const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(5);
    if (!newArrivals.length)
      return res.status(404).json({ message: "No new arrivals found" });

    res.json(newArrivals);
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route GET /api/products/featured
// @desc Get featured products for homepage
// @access Public
router.get("/featured", async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(5);
    res.json(products);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route GET /api/products/:id
// @desc Get product by ID
// @access Public
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    res.json(product);
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route POST /api/products/:id/reviews
// @desc Create a new review for a product
// @access Private
router.post("/:id/reviews", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: "Product already reviewed" });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    await product.save();

    res.status(201).json({
      success: true,
      message: "Review added",
      review: product.reviews[product.reviews.length - 1],
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route GET /api/products/:id/reviews
// @desc Get all reviews for a product
// @access Public
router.get("/:id/reviews", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, reviews: product.reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route DELETE /api/products/:id/reviews/:reviewId
// @desc Delete a review
// @access Private
router.delete("/:id/reviews/:reviewId", protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const review = product.reviews.id(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // Only allow the review author or an admin to delete the review
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this review" });
    }

    // Remove the review
    review.remove();
    await product.save();

    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
