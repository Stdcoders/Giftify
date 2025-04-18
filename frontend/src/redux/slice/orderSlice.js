import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Helper to check token availability
const getTokenConfig = () => {
    const token = localStorage.getItem('userToken');
    
    if (!token) {
        throw {
            message: 'Authentication token not found. Please log in again.',
            status: 401
        };
    }
    
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// Fetch user orders
export const fetchOrders = createAsyncThunk(
  "order/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const config = getTokenConfig();
      const response = await axios.get(
        `${API_URL}/api/orders/my-orders`,
        config
      );
      return response.data;
    } catch (error) {
      // If error is from our token check
      if (error.status === 401 && error.message) {
          return rejectWithValue(error);
      }
      
      // Handle API errors
      if (error.response) {
          // Auth errors
          if (error.response.status === 401 || error.response.status === 403) {
              return rejectWithValue({
                  status: error.response.status,
                  message: error.response.data.message || 'Authentication failed. Please log in again.'
              });
          }
          
          // Other API errors
          return rejectWithValue({
              status: error.response.status,
              message: error.response.data.message || 'Failed to fetch orders'
          });
      }
      
      // Network or other errors
      return rejectWithValue({
          message: error.message || 'Network error. Please try again.'
      });
    }
  }
);

// Async thunk for fetching order details
export const fetchOrderDetails = createAsyncThunk(
  "orders/fetchOrderDetails",
  async (orderId, { rejectWithValue }) => {
    try {
      const config = getTokenConfig();
      const response = await axios.get(
        `${API_URL}/api/orders/${orderId}`,
        config
      );
      return response.data;
    } catch (error) {
      // If error is from our token check
      if (error.status === 401 && error.message) {
          return rejectWithValue(error);
      }
      
      // Handle API errors
      if (error.response) {
          // Auth errors
          if (error.response.status === 401 || error.response.status === 403) {
              return rejectWithValue({
                  status: error.response.status,
                  message: error.response.data.message || 'Authentication failed. Please log in again.'
              });
          }
          
          // Other API errors
          return rejectWithValue({
              status: error.response.status,
              message: error.response.data.message || 'Failed to fetch order details'
          });
      }
      
      // Network or other errors
      return rejectWithValue({
          message: error.message || 'Network error. Please try again.'
      });
    }
  }
);

// Slice for orders
const orderSlice = createSlice({
  name: "orders",
  initialState: {
      orders: [],
      totalorders: 0,
      orderDetails: null, 
      loading: false,
      error: null,
      success: false,
  },
  reducers: {
    clearOrderDetails: (state) => {
      state.orderDetails = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.success = true;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch orders';
      })
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetails = action.payload;
        state.success = true;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch order details";
      });
  },
});

export const { clearOrderDetails } = orderSlice.actions;
export default orderSlice.reducer;
