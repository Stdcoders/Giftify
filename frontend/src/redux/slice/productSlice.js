import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Async thunk to fetch products by collection and filters
export const fetchProducts = createAsyncThunk(
  "products/fetchByFilters",
  async ({
    collection,
    age,
    occasion,
    priceRange,
    sortBy,
    search,
    category,
    limit,
  }) => {
    const query = new URLSearchParams();
    if (collection) query.append("collection", collection);
    
    // Handle multiple values for age and occasion
    if (age) {
      if (Array.isArray(age)) {
        age.forEach(value => query.append("age", value));
      } else {
        query.append("age", age);
      }
    }
    
    if (occasion) {
      if (Array.isArray(occasion)) {
        occasion.forEach(value => query.append("occasion", value));
      } else {
        query.append("occasion", occasion);
      }
    }
    
    if (priceRange) query.append("priceRange", priceRange);
    if (sortBy) query.append("sortBy", sortBy);
    if (search) query.append("search", search);
    
    // Ensure consistent category parameter handling
    if (category && category !== "all") {
      // Handle category directly without complex transformation
      query.append("category", category);
    }
    
    if (limit) query.append("limit", limit);

    console.log("Fetching products with query:", query.toString());
    const response = await axios.get(`${API_URL}/api/products?${query.toString()}`);
    return response.data;
  }
);

// Async thunk to fetch details of a product by ID
export const fetchProductDetails = createAsyncThunk(
  "products/fetchProductDetails",
  async (id) => {
    const response = await axios.get(`${API_URL}/api/products/${id}`);
    return response.data;
  }
);

// Async thunk to update a product
export const updateProducts = createAsyncThunk(
  "products/updateProduct",
  async ({ id, productData }) => {
    const response = await axios.put(
      `${API_URL}/api/products/${id}`,
      productData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      }
    );
    return response.data;
  }
);

// Async thunk to fetch similar products
export const fetchSimilarProducts = createAsyncThunk(
  "products/fetchSimilarProducts",
  async ({ id }) => {
    const response = await axios.get(`${API_URL}/api/products/similar/${id}`);
    return response.data;
  }
);

// Async thunk to fetch best seller product
export const fetchBestSellerProduct = createAsyncThunk(
  "products/best-seller",
  async () => {
    const response = await axios.get(`${API_URL}/api/products/best-seller`);
    return response.data;
  }
);

// Add async thunks for reviews
export const fetchProductReviews = createAsyncThunk(
  "products/fetchProductReviews",
  async (productId) => {
    const response = await axios.get(`${API_URL}/api/products/${productId}/reviews`);
    return response.data.reviews;
  }
);

export const createProductReview = createAsyncThunk(
  "products/createProductReview",
  async ({ productId, reviewData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        return rejectWithValue("Authentication required. Please log in.");
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${API_URL}/api/products/${productId}/reviews`,
        reviewData,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit review"
      );
    }
  }
);

// Initial state
const initialState = {
  products: [],
  selectedProduct: null,
  bestSellerProduct: null,
  similarProducts: [],
  productReviews: [],
  totalProducts: 0,
  loadingProducts: false,
  loadingProductDetails: false,
  loadingBestSeller: false,
  loadingSimilarProducts: false,
  loadingReviews: false,
  submittingReview: false,
  updatingProduct: false,
  error: null,
  reviewError: null,
  filters: {
    collection: "",
    age: [],
    occasion: [],
    priceRange: "",
    sortBy: "",
    search: "",
    category: "",
    limit: "",
  },
};

// Product slice
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      // Handle array parameters
      const newFilters = { ...state.filters };
      Object.keys(action.payload).forEach(key => {
        if (key === 'age' || key === 'occasion') {
          newFilters[key] = action.payload[key] ? action.payload[key].split(',') : [];
        } else {
          newFilters[key] = action.payload[key] || "";
        }
      });
      state.filters = newFilters;
    },
    clearFilters: (state) => {
      state.filters = {
        collection: "",
        age: [],
        occasion: [],
        priceRange: "",
        sortBy: "",
        search: "",
        category: "",
        limit: "",
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loadingProducts = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loadingProducts = false;
        state.products = Array.isArray(action.payload.data)
          ? action.payload.data
          : [];
        state.totalProducts = action.payload.total || 0;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loadingProducts = false;
        state.error = action.error.message;
      })
      .addCase(fetchProductDetails.pending, (state) => {
        state.loadingProductDetails = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loadingProductDetails = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loadingProductDetails = false;
        state.error = action.error;
      })
      .addCase(updateProducts.pending, (state) => {
        state.updatingProduct = true;
      })
      .addCase(updateProducts.fulfilled, (state, action) => {
        state.updatingProduct = false;
        state.selectedProduct = action.payload;
        const index = state.products.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) state.products[index] = action.payload;
      })
      .addCase(updateProducts.rejected, (state, action) => {
        state.updatingProduct = false;
        state.error = action.error;
      })
      .addCase(fetchSimilarProducts.pending, (state) => {
        state.loadingSimilarProducts = true;
      })
      .addCase(fetchSimilarProducts.fulfilled, (state, action) => {
        state.loadingSimilarProducts = false;
        state.similarProducts = action.payload;
      })
      .addCase(fetchSimilarProducts.rejected, (state, action) => {
        state.loadingSimilarProducts = false;
        state.error = action.error;
      })
      .addCase(fetchBestSellerProduct.pending, (state) => {
        state.loadingBestSeller = true;
      })
      .addCase(fetchBestSellerProduct.fulfilled, (state, action) => {
        state.loadingBestSeller = false;
        state.bestSellerProduct = action.payload;
      })
      .addCase(fetchBestSellerProduct.rejected, (state, action) => {
        state.loadingBestSeller = false;
        state.error = action.error;
      })
      // Fetch product reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loadingReviews = true;
        state.reviewError = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loadingReviews = false;
        state.productReviews = action.payload;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loadingReviews = false;
        state.reviewError = action.error.message;
      })
      // Create product review
      .addCase(createProductReview.pending, (state) => {
        state.submittingReview = true;
        state.reviewError = null;
      })
      .addCase(createProductReview.fulfilled, (state, action) => {
        state.submittingReview = false;
        // If we have product details, update the reviews
        if (state.selectedProduct) {
          state.selectedProduct.reviews = state.selectedProduct.reviews 
            ? [...state.selectedProduct.reviews, action.payload.review]
            : [action.payload.review];
          
          // Update rating and numReviews
          if (state.selectedProduct.reviews.length > 0) {
            state.selectedProduct.rating = 
              state.selectedProduct.reviews.reduce((acc, item) => acc + item.rating, 0) / 
              state.selectedProduct.reviews.length;
            state.selectedProduct.numReviews = state.selectedProduct.reviews.length;
          }
        }
        // Also update the productReviews array if we have it
        if (state.productReviews.length > 0) {
          state.productReviews.push(action.payload.review);
        }
      })
      .addCase(createProductReview.rejected, (state, action) => {
        state.submittingReview = false;
        state.reviewError = action.payload;
      });
  },
});

export const { setFilters, clearFilters } = productSlice.actions;
export default productSlice.reducer;
