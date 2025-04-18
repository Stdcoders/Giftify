import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

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

// Fetch all reminders
export const fetchReminders = createAsyncThunk(
    'reminders/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const config = getTokenConfig();
            const response = await axios.get(`${API_URL}/api/reminders`, config);
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
                    message: error.response.data.message || 'Failed to fetch reminders'
                });
            }
            
            // Network or other errors
            return rejectWithValue({
                message: error.message || 'Network error. Please try again.'
            });
        }
    }
);

// Add new reminder
export const addReminder = createAsyncThunk(
    'reminders/add',
    async (reminderData, { rejectWithValue }) => {
        try {
            const config = getTokenConfig();
            const response = await axios.post(
                `${API_URL}/api/reminders`,
                reminderData,
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
                    message: error.response.data.message || 'Failed to add reminder'
                });
            }
            
            // Network or other errors
            return rejectWithValue({
                message: error.message || 'Network error. Please try again.'
            });
        }
    }
);

// Update reminder
export const updateReminder = createAsyncThunk(
    'reminders/update',
    async ({ id, reminderData }, { rejectWithValue }) => {
        try {
            const config = getTokenConfig();
            const response = await axios.put(
                `${API_URL}/api/reminders/${id}`,
                reminderData,
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
                    message: error.response.data.message || 'Failed to update reminder'
                });
            }
            
            // Network or other errors
            return rejectWithValue({
                message: error.message || 'Network error. Please try again.'
            });
        }
    }
);

// Delete reminder
export const deleteReminder = createAsyncThunk(
    'reminders/delete',
    async (id, { rejectWithValue }) => {
        try {
            const config = getTokenConfig();
            await axios.delete(`${API_URL}/api/reminders/${id}`, config);
            return id;
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
                    message: error.response.data.message || 'Failed to delete reminder'
                });
            }
            
            // Network or other errors
            return rejectWithValue({
                message: error.message || 'Network error. Please try again.'
            });
        }
    }
);

// Initial state
const initialState = {
    reminders: [],
    loading: false,
    error: null,
    success: false,
};

// Create slice
const reminderSlice = createSlice({
    name: 'reminders',
    initialState,
    reducers: {
        clearReminderState: (state) => {
            state.reminders = [];
            state.loading = false;
            state.error = null;
            state.success = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch reminders
            .addCase(fetchReminders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReminders.fulfilled, (state, action) => {
                state.loading = false;
                state.reminders = action.payload;
                state.success = true;
            })
            .addCase(fetchReminders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch reminders';
            })

            // Add reminder
            .addCase(addReminder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addReminder.fulfilled, (state, action) => {
                state.loading = false;
                state.reminders.push(action.payload);
                state.success = true;
            })
            .addCase(addReminder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to add reminder';
            })

            // Update reminder
            .addCase(updateReminder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateReminder.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.reminders.findIndex(
                    (reminder) => reminder._id === action.payload._id
                );
                if (index !== -1) {
                    state.reminders[index] = action.payload;
                }
                state.success = true;
            })
            .addCase(updateReminder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to update reminder';
            })

            // Delete reminder
            .addCase(deleteReminder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteReminder.fulfilled, (state, action) => {
                state.loading = false;
                state.reminders = state.reminders.filter(
                    (reminder) => reminder._id !== action.payload
                );
                state.success = true;
            })
            .addCase(deleteReminder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to delete reminder';
            });
    },
});

export const { clearReminderState } = reminderSlice.actions;
export default reminderSlice.reducer; 