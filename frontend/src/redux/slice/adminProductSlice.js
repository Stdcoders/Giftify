import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

//fetch all products (admin only)
export const fetchProducts = createAsyncThunk(
    'adminProducts/fetchProducts',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('userToken');
            
            if (!token) {
                return rejectWithValue({ message: "Authentication token not found. Please log in again." });
            }
            
            const response = await axios.get(`${API_URL}/api/admin/products`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching products:", error.response?.data || error.message);
            
            // Handle token expiration or authentication errors
            if (error.response?.status === 401 || error.response?.status === 403) {
                return rejectWithValue({ 
                    message: "Authentication failed. Please log in again.",
                    status: error.response.status
                });
            }
            
            return rejectWithValue(error.response?.data || { message: "Failed to fetch products" });
        }
    }
);

//create a product 
export const createProduct = createAsyncThunk(
    'adminProducts/createProduct',
    async (productData, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('userToken');
            
            if (!token) {
                return rejectWithValue({ message: "Authentication token not found. Please log in again." });
            }
            
            const response = await axios.post(`${API_URL}/api/admin/products`, productData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error creating product:", error.response?.data || error.message);
            
            if (error.response?.status === 401 || error.response?.status === 403) {
                return rejectWithValue({ 
                    message: "Authentication failed. Please log in again.",
                    status: error.response.status
                });
            }
            
            return rejectWithValue(error.response?.data || { message: "Failed to create product" });
        }
    }
);

//update existing product
export const updateProduct = createAsyncThunk(
    'adminProducts/updateProduct',
    async ({ id, productData }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('userToken');
            
            if (!token) {
                return rejectWithValue({ message: "Authentication token not found. Please log in again." });
            }
            
            const response = await axios.put(`${API_URL}/api/admin/products/${id}`, productData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error updating product:", error.response?.data || error.message);
            
            if (error.response?.status === 401 || error.response?.status === 403) {
                return rejectWithValue({ 
                    message: "Authentication failed. Please log in again.",
                    status: error.response.status
                });
            }
            
            return rejectWithValue(error.response?.data || { message: "Failed to update product" });
        }
    }
);

//async thunk to delete product
export const deleteProduct = createAsyncThunk(
    'adminProducts/deleteProduct',
    async (id, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('userToken');
            
            if (!token) {
                return rejectWithValue({ message: "Authentication token not found. Please log in again." });
            }
            
            const response = await axios.delete(`${API_URL}/api/admin/products/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error deleting product:", error.response?.data || error.message);
            
            if (error.response?.status === 401 || error.response?.status === 403) {
                return rejectWithValue({ 
                    message: "Authentication failed. Please log in again.",
                    status: error.response.status
                });
            }
            
            return rejectWithValue(error.response?.data || { message: "Failed to delete product" });
        }
    }
); 

const adminProductSlice = createSlice({
    name: 'adminProducts',
    initialState: {
        products: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.products = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.products.push(action.payload);
                state.loading = false;
                state.error = null;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                const index = state.products.findIndex(
                    (product) => product._id === action.payload._id
                );
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.products = state.products.filter(
                    (product) => product._id === action.payload._id
                );
            });
    },
});

export default adminProductSlice.reducer;