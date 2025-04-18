import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderDetails, clearOrderDetails } from "../redux/slice/orderSlice";
import { logout } from "../redux/slice/authSlice";
import { toast } from "sonner";
import { FaCheckCircle, FaBox, FaTruck, FaCreditCard, FaMapMarkerAlt } from "react-icons/fa";
import PropTypes from 'prop-types';
import { handleAuthError, requireAuth } from '../utils/authErrorHandler';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orderDetails, loading, error } = useSelector((state) => state.orders);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is logged in
    if (!requireAuth(userInfo, toast, navigate)) return;

    const orderId = location.state?.orderId || new URLSearchParams(location.search).get("orderId");

    if (orderId) {
      const fetchData = async () => {
        try {
          await dispatch(fetchOrderDetails(orderId)).unwrap();
        } catch (err) {
          console.error('Error fetching order details:', err);

          // Use centralized auth error handling
          if (!handleAuthError(err, dispatch, navigate)) {
            // Only handle other errors if it's not an auth error
            const errorMessage = err && err.message ? err.message : 'Error loading order details';
            toast.error(errorMessage);
          }
        }
      };

      fetchData();
    }

    return () => {
      dispatch(clearOrderDetails());
    };
  }, [dispatch, location, navigate, userInfo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Order Not Found</h2>
          <p className="text-gray-600">The requested order could not be found.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const handleImageError = (e) => {
    e.target.src = "/placeholder-image.jpg"; // Make sure to add a placeholder image in your public folder
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="text-center mb-8">
            <FaCheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h1 className="mt-4 text-3xl font-bold text-gray-900">Order Confirmed!</h1>
            <p className="mt-2 text-gray-600">
              Thank you for your order. We'll send you a confirmation email shortly.
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Order Details</h2>
                <p className="text-gray-600">Order ID: {orderDetails._id || 'N/A'}</p>
                <p className="text-gray-600">Order Date: {formatDate(orderDetails.createdAt)}</p>
                <p className="text-gray-600">
                  Estimated Delivery: {formatDate(orderDetails.estimatedDelivery)}
                </p>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
                <p className="text-gray-600">Payment Method: {orderDetails.paymentMethod || 'N/A'}</p>
                <p className="text-gray-600">Status: {orderDetails.paymentStatus || 'N/A'}</p>
                <p className="text-gray-600">Total Amount: ${orderDetails.totalAmount?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Ordered Items</h2>
            <div className="space-y-4">
              {orderDetails.orderItems?.map((item) => (
                <div key={item._id} className="flex items-center border-b pb-4">
                  <img
                    src={item.product?.image}
                    alt={item.product?.name || 'Product image'}
                    className="h-20 w-20 object-cover rounded"
                    onError={handleImageError}
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{item.product?.name || 'Unnamed Product'}</h3>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity || 0}</p>
                    <p className="text-sm text-gray-500">Price: ${item.price?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
            <div className="bg-gray-50 p-4 rounded">
              {orderDetails.shippingAddress ? (
                <>
                  <p className="text-gray-600">{orderDetails.shippingAddress.street || 'N/A'}</p>
                  <p className="text-gray-600">
                    {orderDetails.shippingAddress.city || 'N/A'}, {orderDetails.shippingAddress.state || 'N/A'}{" "}
                    {orderDetails.shippingAddress.zipCode || 'N/A'}
                  </p>
                  <p className="text-gray-600">{orderDetails.shippingAddress.country || 'N/A'}</p>
                </>
              ) : (
                <p className="text-gray-600">No shipping address provided</p>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate("/orders")}
              className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              View All Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

OrderConfirmationPage.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      orderId: PropTypes.string
    }),
    search: PropTypes.string
  }).isRequired,
  navigate: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired
};

export default OrderConfirmationPage;
