import { toast } from 'sonner';
import { logout } from '../redux/slice/authSlice';

/**
 * Centralized function to handle authentication errors consistently across the application
 * 
 * @param {Object} error - The error object from a failed API request
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} navigate - React Router navigate function
 * @param {number} [delay=1500] - Optional delay in ms before redirecting
 * @returns {boolean} - Returns true if it was an auth error and handled, false otherwise
 */
export const handleAuthError = (error, dispatch, navigate, delay = 1500) => {
    // Detect various forms of authentication errors
    const isAuthError = 
        (error && error.status === 401) || 
        (error && error.status === 403) ||
        (error && error.message && (
            error.message.includes('Authentication failed') ||
            error.message.includes('Not authorized') ||
            error.message.includes('token') ||
            error.message.includes('Session expired')
        )) ||
        (error && error.response && (
            error.response.status === 401 || 
            error.response.status === 403 ||
            (error.response.data && error.response.data.message && (
                error.response.data.message.includes('Authentication') ||
                error.response.data.message.includes('authorized') ||
                error.response.data.message.includes('token') ||
                error.response.data.message.includes('Session')
            ))
        ));

    if (isAuthError) {
        // Show error message to user
        toast.error('Authentication failed. Please log in again.');
        
        // Use the Redux logout action to properly clear all state
        dispatch(logout());
        
        // Redirect with a slight delay to allow the toast to be seen
        setTimeout(() => navigate('/login'), delay);
        return true;
    }
    
    return false;
};

/**
 * Helper to check if user is logged in and redirect if not
 * 
 * @param {Object|null} userInfo - The user info from Redux state
 * @param {Function} toast - Toast notification function
 * @param {Function} navigate - React Router navigate function
 * @returns {boolean} - Returns true if user is logged in, false otherwise
 */
export const requireAuth = (userInfo, toast, navigate) => {
    if (!userInfo) {
        toast.error('Please log in to continue');
        navigate('/login');
        return false;
    }
    return true;
};

export default {
    handleAuthError,
    requireAuth
}; 