const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Helper function to get or create cart
const getCart = async (userId, guestId) => {
  console.log("getCart called with:", { userId, guestId });
  
  try {
    // Find cart by either user ID or guest ID
    const query = {
      $or: [
        ...(userId ? [{ user: userId }] : []),
        ...(guestId ? [{ guestId: guestId }] : [])
      ]
    };
    
    console.log("Searching for cart with query:", query);
    let cart = await Cart.findOne(query);
    
    if (cart) {
      console.log("Found existing cart:", cart._id);
      return cart;
    }
    
    console.log("No cart found, creating new cart");
    cart = new Cart({
      ...(userId && { user: userId }),
      ...(guestId && { guestId: guestId }),
      products: [],
      totalPrice: 0
    });
    
    await cart.save();
    console.log("Created new cart:", cart._id);
    return cart;
  } catch (error) {
    console.error("Error in getCart:", error);
    throw new Error(`Failed to get/create cart: ${error.message}`);
  }
};

// @route POST /api/cart
// @desc add a product to cart
// @access public
router.post("/", async (req, res) => {
  console.log("POST /api/cart request received:", req.body);
  console.log("User from auth:", req.user);
  console.log("Cookies:", req.cookies);
  
  const { productId, quantity, customization, guestId, userId } = req.body;
  console.log("Adding product to cart:", { productId, quantity, customization, guestId, userId });

  try {
    // Get user ID from auth if available, otherwise use the one from request
    let user = null;
    if (req.user) {
      user = req.user._id;
      console.log('Using user ID from auth:', user);
    } else if (userId) {
      user = userId;
      console.log('Using user ID from request:', user);
    }
    
    // Get guest ID from cookies if available, otherwise use the one from request
    let guest = null;
    if (req.cookies && req.cookies.guestId) {
      guest = req.cookies.guestId;
      console.log('Using guest ID from cookies:', guest);
    } else if (guestId) {
      guest = guestId;
      console.log('Using guest ID from request:', guest);
    } else {
      // Generate a new guest ID if none exists
      guest = "guest_" + new Date().getTime();
      console.log('Generated new guest ID:', guest);
    }

    const product = await Product.findById(productId);
    if (!product) {
      console.log("Product not found:", productId);
      return res.status(404).json({ message: "Product not found" });
    }
    console.log("Product found:", product._id);

    let cart = await getCart(user, guest);
    console.log("Cart found:", cart ? "yes" : "no");

    if (cart) {
      const productIndex = cart.products.findIndex(
        (p) =>
          p.productId.toString() === productId &&
          JSON.stringify(p.customization) === JSON.stringify(customization)
      );
      console.log("Existing product index:", productIndex);

      if (productIndex > -1) {
        console.log("Updating quantity for existing product");
        cart.products[productIndex].quantity += quantity;
      } else {
        console.log("Adding new product to cart");
        cart.products.push({
          productId,
          name: product.name,
          image: product.images[0].url,
          price: product.price,
          customization,
          quantity,
        });
      }

      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      console.log("Updated total price:", cart.totalPrice);

      console.log("Saving cart...");
      await cart.save();
      console.log("Cart saved successfully");
    } else {
      console.log("Creating new cart");
      const newCart = await Cart.create({
        user: user || undefined,
        guestId: guest,
        products: [
          {
            productId,
            name: product.name,
            image: product.images[0].url,
            price: product.price,
            customization,
            quantity,
          },
        ],
        totalPrice: product.price * quantity,
      });
      console.log("New cart created:", newCart._id);
      cart = newCart;
    }
    
    // Set guest ID cookie if user is not authenticated
    if (!user && guest) {
      console.log('Setting guest ID cookie:', guest);
      res.cookie('guestId', guest, { 
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }
    
    console.log("Sending response:", cart);
    return res.status(200).json(cart);
  } catch (error) {
    console.error("Error in POST /api/cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route PUT /api/cart
// @desc update a product's quantity in cart
// @access public
router.put("/", async (req, res) => {
  const { productId, customization, quantity, userId, guestId } = req.body;
  console.log('Cart update request received:', { productId, customization, quantity, userId, guestId });

  try {
    let cart = await getCart(userId, guestId);
    console.log('Cart found:', cart ? 'yes' : 'no');
    
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Log current cart products to debug
    console.log('Current cart products:', cart.products.map(p => ({
      productId: p.productId.toString(),
      customization: p.customization,
      quantity: p.quantity
    })));

    // More reliable product lookup that handles customization edge cases
    const productIndex = cart.products.findIndex(p => {
      // First, check if productId matches
      if (p.productId.toString() !== productId) {
        return false;
      }
      
      // If both customizations are null/undefined/empty string, consider them equal
      if ((!p.customization || p.customization === '') && 
          (!customization || customization === '')) {
        return true;
      }
      
      // If one is empty and the other isn't, they don't match
      if ((!p.customization || p.customization === '') !== 
          (!customization || customization === '')) {
        return false;
      }
      
      // Simple case: string comparison
      if (typeof p.customization === 'string' && typeof customization === 'string') {
        return p.customization === customization;
      }
      
      // If customization is an object with text property (common case)
      if (typeof p.customization === 'object' && p.customization && 
          typeof customization === 'object' && customization) {
        if (p.customization.text && customization.text) {
          return p.customization.text === customization.text;
        }
      }
      
      // If we reach here, try string comparison as a fallback
      return JSON.stringify(p.customization) === JSON.stringify(customization);
    });
    
    console.log('Product index in cart:', productIndex);

    if (productIndex > -1) {
      if (quantity > 0) {
        console.log('Updating quantity from', cart.products[productIndex].quantity, 'to', quantity);
        cart.products[productIndex].quantity = quantity;
      } else {
        console.log('Removing product (quantity <= 0)');
        cart.products.splice(productIndex, 1);
      }
    } else {
      console.log('Product not found in cart with matching productId and customization');
      return res.status(404).json({ message: "Product not found in cart" });
    }

    cart.totalPrice = cart.products.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    console.log('Saving updated cart');
    await cart.save();
    console.log('Cart saved successfully');
    return res.status(200).json(cart);
  } catch (error) {
    console.error("Error in cart update:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route DELETE /api/cart
// @desc delete a product from cart
// @access public
router.delete("/", async (req, res) => {
  const { productId, customization, userId, guestId } = req.body;
  console.log('Cart delete request received:', { productId, customization, userId, guestId });

  try {
    let cart = await getCart(userId, guestId);
    console.log('Cart found for delete:', cart ? 'yes' : 'no');
    
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Log current cart products
    console.log('Current cart products for delete:', cart.products.map(p => ({
      productId: p.productId.toString(),
      customization: p.customization,
      quantity: p.quantity
    })));

    // Use the same improved product finding logic
    const productIndex = cart.products.findIndex(p => {
      // First, check if productId matches
      if (p.productId.toString() !== productId) {
        return false;
      }
      
      // If both customizations are null/undefined/empty string, consider them equal
      if ((!p.customization || p.customization === '') && 
          (!customization || customization === '')) {
        return true;
      }
      
      // If one is empty and the other isn't, they don't match
      if ((!p.customization || p.customization === '') !== 
          (!customization || customization === '')) {
        return false;
      }
      
      // Simple case: string comparison
      if (typeof p.customization === 'string' && typeof customization === 'string') {
        return p.customization === customization;
      }
      
      // If customization is an object with text property (common case)
      if (typeof p.customization === 'object' && p.customization && 
          typeof customization === 'object' && customization) {
        if (p.customization.text && customization.text) {
          return p.customization.text === customization.text;
        }
      }
      
      // If we reach here, try string comparison as a fallback
      return JSON.stringify(p.customization) === JSON.stringify(customization);
    });
    
    console.log('Product index in cart for delete:', productIndex);

    if (productIndex > -1) {
      console.log('Removing product at index:', productIndex);
      cart.products.splice(productIndex, 1);
    } else {
      console.log('Product not found in cart with matching productId and customization for delete');
      return res.status(404).json({ message: "Product not found in cart" });
    }

    cart.totalPrice = cart.products.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    console.log('Saving updated cart after delete');
    await cart.save();
    console.log('Cart saved successfully after delete');
    return res.status(200).json(cart);
  } catch (error) {
    console.error("Error in cart delete:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route GET /api/cart
// @desc get cart by user id or guest id
// @access public
router.get("/", async (req, res) => {
  const { userId, guestId } = req.query;

  try {
    const cart = await getCart(userId, guestId);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    return res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route POST /api/cart/merge
// @desc merge guest cart with user cart
// @access private
router.post("/merge", protect, async (req, res) => {
  const { guestId } = req.body;

  try {
    const guestCart = await Cart.findOne({ guestId });
    if (!guestCart)
      return res.status(404).json({ message: "Guest cart not found" });

    let userCart = await Cart.findOne({ user: req.user._id });

    if (!userCart) {
      guestCart.user = req.user._id;
      guestCart.guestId = null;
      await guestCart.save();
      return res.status(200).json(guestCart);
    } else {
      guestCart.products.forEach((guestProduct) => {
        const productIndex = userCart.products.findIndex(
          (p) =>
            p.productId.toString() === guestProduct.productId.toString() &&
            p.customization === guestProduct.customization
        );

        if (productIndex > -1) {
          userCart.products[productIndex].quantity += guestProduct.quantity;
        } else {
          userCart.products.push(guestProduct);
        }
      });

      userCart.totalPrice = userCart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      await userCart.save();
      await Cart.findOneAndDelete({ guestId });
      return res.status(200).json(userCart);
    }
  } catch (error) {
    console.error("Error merging cart:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add to cart
router.post('/add', async (req, res) => {
  console.log('Add to cart request received:', req.body);
  console.log('User from auth:', req.user);
  console.log('Cookies:', req.cookies);
  
  try {
    const { productId, quantity = 1, customization = null, userId, guestId } = req.body;
    
    // Get user ID from auth if available, otherwise use the one from request
    let user = null;
    if (req.user) {
      user = req.user._id;
      console.log('Using user ID from auth:', user);
    } else if (userId) {
      user = userId;
      console.log('Using user ID from request:', user);
    }
    
    // Get guest ID from cookies if available, otherwise use the one from request
    let guest = null;
    if (req.cookies.guestId) {
      guest = req.cookies.guestId;
      console.log('Using guest ID from cookies:', guest);
    } else if (guestId) {
      guest = guestId;
      console.log('Using guest ID from request:', guest);
    } else {
      // Generate a new guest ID if none exists
      guest = "guest_" + new Date().getTime();
      console.log('Generated new guest ID:', guest);
    }

    console.log('Getting cart for user:', user, 'guest:', guest);
    const cart = await getCart(user, guest);
    console.log('Cart found:', cart ? 'yes' : 'no');
    
    // Check if product already exists in cart with same customization
    const existingProductIndex = cart.products.findIndex(item => 
      item.productId.toString() === productId &&
      JSON.stringify(item.customization) === JSON.stringify(customization)
    );
    console.log('Existing product index:', existingProductIndex);

    if (existingProductIndex > -1) {
      // Update quantity if product exists
      console.log('Updating quantity for existing product');
      cart.products[existingProductIndex].quantity += quantity;
    } else {
      // Add new product
      console.log('Adding new product to cart');
      const product = await Product.findById(productId);
      if (!product) {
        console.log('Product not found:', productId);
        return res.status(404).json({ message: 'Product not found' });
      }
      console.log('Product found:', product.name);

      cart.products.push({
        productId,
        name: product.name,
        image: product.images[0],
        price: product.price,
        quantity,
        customization
      });
    }

    // Calculate total price
    cart.totalPrice = cart.products.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );
    console.log('Updated total price:', cart.totalPrice);

    console.log('Saving cart...');
    await cart.save();
    console.log('Cart saved successfully');
    
    // Set guest ID cookie if user is not authenticated
    if (!user && guest) {
      console.log('Setting guest ID cookie:', guest);
      res.cookie('guestId', guest, { 
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true
      });
    }
    
    res.json(cart);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
});

// Update cart item
router.put('/update/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, customization } = req.body;
    const userId = req.user._id;
    const guestId = req.cookies.guestId;

    const cart = await getCart(userId, guestId);
    
    const productIndex = cart.products.findIndex(item => 
      item.productId.toString() === productId &&
      JSON.stringify(item.customization) === JSON.stringify(customization)
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    if (quantity <= 0) {
      cart.products.splice(productIndex, 1);
    } else {
      cart.products[productIndex].quantity = quantity;
    }

    cart.totalPrice = cart.products.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Error updating cart' });
  }
});

// Remove from cart
router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const { customization } = req.body;
    const userId = req.user._id;
    const guestId = req.cookies.guestId;

    const cart = await getCart(userId, guestId);
    
    cart.products = cart.products.filter(item => 
      !(item.productId.toString() === productId &&
      JSON.stringify(item.customization) === JSON.stringify(customization))
    );

    cart.totalPrice = cart.products.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Error removing from cart' });
  }
});

// Get cart
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const guestId = req.cookies.guestId;

    const cart = await getCart(userId, guestId);
    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Error getting cart' });
  }
});

module.exports = router;
