import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Fetch all orders
export const fetchorders = createAsyncThunk(
  "adminOrders/fetchorders",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("userToken");
      
      if (!token) {
        return rejectWithValue({ message: "Authentication token not found. Please log in again." });
      }
      
      const response = await axios.get(`${API_URL}/api/admin/orders`,
        {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error.response?.data || error.message);
      
      // Handle token expiration or authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Consider clearing the token if it's expired
        return rejectWithValue({ 
          message: "Authentication failed. Please log in again.",
          status: error.response.status
        });
      }
      
      return rejectWithValue(error.response?.data || { message: "Failed to fetch orders" });
    }
  }
);

// Update order delivery status
export const updateOrderStatus = createAsyncThunk(
  "adminOrders/updateOrderStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("userToken");
      
      if (!token) {
        return rejectWithValue({ message: "Authentication token not found. Please log in again." });
      }
      
      const response = await axios.put(
        `${API_URL}/api/admin/orders/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating order status:", error.response?.data || error.message);
      
      // Handle token expiration or authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        return rejectWithValue({ 
          message: "Authentication failed. Please log in again.",
          status: error.response.status
        });
      }
      
      return rejectWithValue(error.response?.data || { message: "Failed to update order status" });
    }
  }
);

// Delete an order
export const deleteOrder = createAsyncThunk(
  "adminOrders/deleteOrder",
  async ({ id }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("userToken");
      
      if (!token) {
        return rejectWithValue({ message: "Authentication token not found. Please log in again." });
      }
      
      const response = await axios.delete(`${API_URL}/api/admin/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting order:", error.response?.data || error.message);
      
      // Handle token expiration or authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        return rejectWithValue({ 
          message: "Authentication failed. Please log in again.",
          status: error.response.status
        });
      }
      
      return rejectWithValue(error.response?.data || { message: "Failed to delete order" });
    }
  }
);

// Admin order slice
const adminOrderSlice = createSlice({
  name: "adminOrders",
  initialState: {
    orders: [],
    totalOrders: 0,
    totalSales: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all orders
      .addCase(fetchorders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchorders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.totalOrders = action.payload.length;

        // Calculate total sales
        const total = action.payload.reduce((acc, order) => {
          return acc + (order.totalPrice || 0);
        }, 0);
        state.totalSales = total;
      })
      .addCase(fetchorders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch orders";
      })
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        const orderIndex = state.orders.findIndex(
          (order) => order._id === updatedOrder._id
        );

        if (orderIndex !== -1) {
          state.orders[orderIndex] = updatedOrder;
        }
        state.loading = false;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to update order status";
      })
      // Delete order
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(
          (order) => order._id !== action.payload._id
        );
        state.loading = false;
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete order";
      });
  },
});

export default adminOrderSlice.reducer;
