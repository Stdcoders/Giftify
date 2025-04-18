const products = [
  {
    name: "Personalized Star Map",
    description:
      "A custom star map showing the night sky from a special date and location.",
    price: 49.99,
    discountprice: 39.99,
    countInStock: 10,
    sku: "GIFT001",
    category: "Decor",
    collections: ["Personalized Gifts", "Home Decor"],
    age: "Any",
    images: [
      { url: "https://example.com/star-map.jpg", altText: "Custom Star Map" },
    ],
    occasion: "Birthday",
    customizations: {
      text: { message: "Date & Location", fontStyle: "Elegant Script" },
    },
    user: "6610ab123456789abcdef123", // Replace with a valid User ObjectId
  },
  {
    name: "Engraved Wooden Music Box",
    description: "A handcrafted wooden music box with customizable engravings.",
    price: 29.99,
    countInStock: 15,
    sku: "GIFT002",
    category: "Decor",
    collections: ["Music Lovers", "Handmade"],
    age: "Any",
    images: [
      {
        url: "https://example.com/music-box.jpg",
        altText: "Engraved Music Box",
      },
    ],
    occasion: "Wedding",
    customizations: {
      text: { message: "Custom Name Engraving", fontStyle: "Classic Serif" },
    },
    user: "6610ab123456789abcdef123",
  },
  {
    name: "3D Moon Lamp",
    description:
      "A realistic moon-shaped lamp with touch control and color-changing options.",
    price: 35.99,
    countInStock: 20,
    sku: "GIFT003",
    category: "Tech & Gadgets",
    collections: ["Home Decor", "Innovative Gifts"],
    age: "Any",
    images: [
      { url: "https://example.com/moon-lamp.jpg", altText: "3D Moon Lamp" },
    ],
    occasion: "Festival",
    user: "6610ab123456789abcdef123",
  },
  {
    name: "DIY Miniature House Kit",
    description:
      "A do-it-yourself miniature house kit with LED lights and intricate details.",
    price: 59.99,
    discountprice: 49.99,
    countInStock: 8,
    sku: "GIFT004",
    category: "Kids",
    collections: ["Creative Gifts", "DIY Kits"],
    age: "18-24",
    images: [
      {
        url: "https://example.com/miniature-house.jpg",
        altText: "DIY Miniature House",
      },
    ],
    occasion: "Casual",
    user: "6610ab123456789abcdef123",
  },
  {
    name: "Custom Soundwave Art",
    description:
      "A framed print of a personalized soundwave from a favorite song or message.",
    price: 45.99,
    countInStock: 12,
    sku: "GIFT005",
    category: "Decor",
    collections: ["Personalized Gifts", "Art & Prints"],
    age: "24-35",
    images: [
      {
        url: "https://example.com/soundwave-art.jpg",
        altText: "Custom Soundwave Art",
      },
    ],
    occasion: "Any",
    customizations: {
      text: { message: "Your favorite song waveform", fontStyle: "Minimalist" },
    },
    user: "6610ab123456789abcdef123",
  },
  {
    name: "Augmented Reality Globe",
    description:
      "An interactive AR globe that works with a mobile app to explore geography.",
    price: 99.99,
    countInStock: 5,
    sku: "GIFT006",
    category: "Tech & Gadgets",
    collections: ["Educational Gifts", "Travel & Adventure"],
    age: "Below 18",
    images: [{ url: "https://example.com/ar-globe.jpg", altText: "AR Globe" }],
    occasion: "Festival",
    user: "6610ab123456789abcdef123",
  },
  {
    name: "Handmade Leather Journal",
    description:
      "A vintage leather journal with customizable initials on the cover.",
    price: 39.99,
    countInStock: 14,
    sku: "GIFT007",
    category: "Travel & Adventure",
    collections: ["Handmade", "Stationery"],
    age: "18-24",
    images: [
      {
        url: "https://example.com/leather-journal.jpg",
        altText: "Handmade Leather Journal",
      },
    ],
    occasion: "Any",
    customizations: {
      text: { message: "Personalized Initials", fontStyle: "Bold Serif" },
    },
    user: "6610ab123456789abcdef123",
  },
  {
    name: "Personalized Name Necklace",
    description: "A stylish, customizable name necklace in gold or silver.",
    price: 79.99,
    countInStock: 18,
    sku: "GIFT008",
    category: "Fashion & Jewelry",
    collections: ["Luxury Gifts", "Personalized Gifts"],
    age: "Any",
    images: [
      {
        url: "https://example.com/name-necklace.jpg",
        altText: "Custom Name Necklace",
      },
    ],
    occasion: "Birthday",
    customizations: {
      text: { message: "Your Name", fontStyle: "Cursive" },
    },
    user: "6610ab123456789abcdef123",
  },
  {
    name: "Smart Plant Pot",
    description:
      "A self-watering plant pot with built-in sensors to monitor moisture levels.",
    price: 54.99,
    countInStock: 10,
    sku: "GIFT009",
    category: "Tech & Gadgets",
    collections: ["Eco-Friendly Gifts", "Home & Living"],
    age: "Any",
    images: [
      {
        url: "https://example.com/smart-plant.jpg",
        altText: "Smart Plant Pot",
      },
    ],
    occasion: "Festival",
    user: "6610ab123456789abcdef123",
  },
  {
    name: "Memory Film Roll Keychain",
    description:
      "A mini film roll keychain with printed photos from special memories.",
    price: 24.99,
    countInStock: 25,
    sku: "GIFT010",
    category: "Personalized Gifts",
    collections: ["Creative Gifts", "Photography"],
    age: "Any",
    images: [
      {
        url: "https://example.com/film-roll.jpg",
        altText: "Memory Film Roll Keychain",
      },
    ],
    occasion: "Casual",
    customizations: {
      image: {
        url: "https://example.com/custom-photo.jpg",
        altText: "Custom Photos",
      },
    },
    user: "6610ab123456789abcdef123",
  },
];
module.exports = products;