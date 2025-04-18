import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

//helper function to load cart from local storage
const loadCart = () => {
  try {
    const cart = localStorage.getItem("cart");
    if (!cart) {
      return { products: [], totalPrice: 0 };
    }
    const parsedCart = JSON.parse(cart);
    return parsedCart || { products: [], totalPrice: 0 };
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return { products: [], totalPrice: 0 };
  }
};

//helper function to save cart to localstorage
const saveCart = (cart) => {
  try {
    if (!cart) {
      localStorage.removeItem("cart");
      return;
    }
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

// Helper to get auth headers if a token exists
const getAuthHeader = () => {
  const token = localStorage.getItem('userToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async ({userId, guestId}, { rejectWithValue }) => {
    try {
      const headers = getAuthHeader();
      const res = await axios.get(`${BASE_URL}/api/cart`, {
        params: {
          guestId, userId
        },
        headers
      });
      
      return res.data;
    } catch (error) {
      console.error('Fetch cart error:', error.response || error);
      
      // Handle auth errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        return rejectWithValue({
          status: error.response.status,
          message: error.response.data?.message || 'Authentication failed. Please log in again.'
        });
      }
      
      return rejectWithValue(error.response?.data?.message || 'Error fetching cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity, customization, userId, guestId}, { rejectWithValue}) => {
    try {
      const headers = getAuthHeader();
      const response = await axios.post(`${BASE_URL}/api/cart`, 
        {
          productId, 
          quantity, 
          customization,
          guestId, 
          userId, 
        },
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Add to cart error:', error);
      
      // Handle auth errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        return rejectWithValue({
          status: error.response.status,
          message: error.response.data?.message || 'Authentication failed. Please log in again.'
        });
      }
      
      return rejectWithValue(error.response?.data?.message || 'Error adding to cart');
    }
  }
);

// Alias for backward compatibility
export const addItemToCart = addToCart;

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity, customization, userId, guestId}, { rejectWithValue }) => {
    try {
      const headers = {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      };
      
      const response = await axios.put(
        `${BASE_URL}/api/cart`,
        {
          productId,
          quantity,
          customization,
          guestId,
          userId,
        },
        { headers }
      );

      if (response.data) {
        // Save to localStorage
        saveCart(response.data);
      }

      return response.data;
    } catch (error) {
      console.error('Update cart error:', error);
      
      // Handle auth errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        return rejectWithValue({
          status: error.response.status,
          message: error.response.data?.message || 'Authentication failed. Please log in again.'
        });
      }
      
      return rejectWithValue(error.response?.data?.message || 'Error updating cart');
    }
  }
);

// Alias for backward compatibility
export const updateItemInCart = updateCartItem;

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ productId, customization, guestId, userId}, { rejectWithValue}) => {
    try {
      const headers = {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      };
      
      const response = await axios.delete(
        `${BASE_URL}/api/cart`,
        {
          data: {
            productId,
            customization,
            guestId,
            userId,
          },
          headers
        }
      );

      if (response.data) {
        // Save to localStorage
        saveCart(response.data);
      }

      return response.data;
    } catch (error) {
      console.error('Remove cart error:', error);
      
      // Handle auth errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        return rejectWithValue({
          status: error.response.status,
          message: error.response.data?.message || 'Authentication failed. Please log in again.'
        });
      }
      
      return rejectWithValue(error.response?.data?.message || 'Error removing from cart');
    }
  }
);

// Alias for backward compatibility
export const removeItemFromCart = removeFromCart;

// Merge guest cart into user cart
export const mergeGuestCart = createAsyncThunk(
  "cart/mergeGuestCart",
  async ({ guestId, user }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        return rejectWithValue({
          status: 401,
          message: 'Authentication token not found. Please log in again.'
        });
      }
      
      const response = await axios.post(
        `${BASE_URL}/api/cart/merge`,
        { guestId, user },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Merge guest cart error:', error);
      
      // Handle auth errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        return rejectWithValue({
          status: error.response.status,
          message: error.response.data?.message || 'Authentication failed. Please log in again.'
        });
      }
      
      return rejectWithValue(error.response?.data?.message || 'Error merging cart');
    }
  }
);

const initialState = {
  cart: loadCart(),
  loading: false,
  error: null,
  success: false
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.cart = action.payload;
      saveCart(action.payload);
      state.error = null;
      state.success = true;
    },
    clearCart: (state) => {
      state.cart = {products: []};
      localStorage.removeItem('cart');
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    resetCartStatus: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Add case for auth/logout
      .addCase('auth/logout', (state) => {
        state.cart = { products: [] };
        state.loading = false;
        state.error = null;
        state.success = false;
        // Clear cart from localStorage if exists
        localStorage.removeItem('cart');
      })
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        saveCart(action.payload);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch cart!";
      })
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        saveCart(action.payload);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to add to cart!";
      })
      // Update Cart Item
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        saveCart(action.payload);
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update quantity";
      })
      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        saveCart(action.payload);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to remove from Cart!";
      })
      // Merge Guest Cart
      .addCase(mergeGuestCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(mergeGuestCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        saveCart(action.payload);
      })
      .addCase(mergeGuestCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to merge cart";
      });
  }
});

export const { setCart, clearCart, resetCartStatus } = cartSlice.actions;
export default cartSlice.reducer;
