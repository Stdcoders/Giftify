import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Retrieve user info from localStorage
const userfromStorage = localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

// Generate guestId if not present
const initialGuestId =
  localStorage.getItem("guestId") || `guest_${new Date().getTime()}`;
localStorage.setItem("guestId", initialGuestId);

// Initial state (no token)
const initialState = {
  userInfo: userfromStorage,
  guestId: initialGuestId,
  loading: false,
  error: null,
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/login`,
        userData
      );
      const userInfo = response.data.user;
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      localStorage.setItem("userToken", response.data.token);
      return userInfo;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Login failed!" }
      );
    }
  }
);

// Async thunk for register
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/register`,
        userData
      );
      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      localStorage.setItem("userToken", response.data.token); // keep it for API use
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Registration failed!" }
      );
    }
  }
);

// Async thunk for forgot password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/forgot-password`,
        { email }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to send reset email. Please try again." }
      );
    }
  }
);

// Create auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.userInfo = null;
      // Generate a new guest ID
      const newGuestId = `guest_${new Date().getTime()}`;
      state.guestId = newGuestId;
      // Clear user data from localStorage
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userToken");
      localStorage.removeItem("cart");
      // Set new guest ID
      localStorage.setItem("guestId", newGuestId);
    },
    generatenewGuestid: (state) => {
      const newGuestId = `guest_${new Date().getTime()}`;
      state.guestId = newGuestId;
      localStorage.setItem("guestId", newGuestId);
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || JSON.stringify(action.payload);
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || JSON.stringify(action.payload);
      })

      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Exports
export const { logout, generatenewGuestid } = authSlice.actions;
export default authSlice.reducer;
export const selectAuth = (state) => state.auth;
export const selectUserInfo = (state) => state.auth.userInfo;
