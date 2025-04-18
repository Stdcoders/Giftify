const express = require('express');
const Product = require('../models/Product'); // Assuming Product model path

const router = express.Router();

// POST /api/recommendations/interactive
router.post('/interactive', async (req, res) => {
  const preferences = req.body;
  console.log('Received preferences:', preferences);

  try {
    const query = {};

    // --- Build Query Logic ---

    // 1. Price Range Filter
    if (preferences.priceRange && preferences.priceRange !== 'Any') {
      query.price = {}; // Initialize price query object
      switch (preferences.priceRange) {
        case 'Under $25':
          query.price.$lte = 25;
          break;
        case '$25 - $50':
          query.price.$gte = 25;
          query.price.$lte = 50;
          break;
        case '$50 - $100':
          query.price.$gte = 50;
          query.price.$lte = 100;
          break;
        case '$100 + ': // Note the space in the option from frontend
          query.price.$gte = 100;
          break;
        // No default needed as 'Any' skips this block
      }
       // Clean up empty price query if only one boundary was set (less likely with switch but safe)
       if (Object.keys(query.price).length === 0) {
           delete query.price;
       }
    }

    // 2. Occasion Filter (Example: Using 'tags' field)
    // Assumes 'occasion' value from frontend maps to a tag in the Product model
    if (preferences.occasion) {
       // If tags isn't an array yet, initialize it
      if (!query.tags) query.tags = {};
      // Use $in to match if the occasion is one of the tags
      query.tags.$in = [preferences.occasion]; // Modify if multiple tags can match occasion
    }

    // 3. Interests Filter (Example: Using 'tags' or 'category' field)
    // Assumes 'interests' value maps to a tag or category
    if (preferences.interests) {
      if (!query.tags) query.tags = { $in: [] }; // Initialize if needed
      else if (!query.tags.$in) query.tags.$in = []; // Ensure $in exists

      // Add interest to the list of required tags
      // Simple mapping - adjust based on your actual product data structure
      let interestTag = preferences.interests; 
      if (interestTag === 'Fashion & Style') interestTag = 'Fashion'; // Example mapping
       if (!query.tags.$in.includes(interestTag)) {
          query.tags.$in.push(interestTag);
       }
    }

     // 4. Recipient Filter (Example: Add another tag?)
     // This is highly dependent on how you structure recipient suitability in your Product model
     if (preferences.recipient && preferences.recipient !== 'Myself') {
        if (!query.tags) query.tags = { $in: [] };
        else if (!query.tags.$in) query.tags.$in = [];

        let recipientTag = `For ${preferences.recipient}`; // Example tag
        if (!query.tags.$in.includes(recipientTag)) {
            query.tags.$in.push(recipientTag);
        }
     }
     
    // Add other filters based on preferences (age, style etc.)
    // Ensure field names (e.g., 'tags', 'price', 'category', 'occasion') match your Product schema

    console.log('Constructed MongoDB Query:', JSON.stringify(query, null, 2));

    // Execute Query
    const products = await Product.find(query).limit(9); // Limit results

    res.json(products);

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: 'Failed to fetch recommendations' });
  }
});

module.exports = router; 