import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchorders, updateOrderStatus } from '../../redux/slice/adminOrderSlice';
import { toast } from 'sonner';

const OrderManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isAuthError, setIsAuthError] = useState(false);
  const { orders, loading, error } = useSelector((state) => state.adminOrder);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is admin
    if (!userInfo || userInfo.role !== 'Admin') {
      toast.error('Only administrators can access this page');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const result = await dispatch(fetchorders()).unwrap();
        console.log('Orders fetched successfully:', result);
      } catch (err) {
        console.error('Error fetching orders:', err);

        // Handle authentication errors
        if (err.status === 401 || err.status === 403 ||
          err.message?.includes('Authentication failed') ||
          err.message?.includes('Not authorized')) {
          setIsAuthError(true);
          toast.error('Authentication failed. Please log in again.');

          // Clear invalid token and redirect to login
          localStorage.removeItem('userToken');
          setTimeout(() => navigate('/login'), 2000);
        }
      }
    };

    fetchData();
  }, [dispatch, navigate, userInfo]);

  const handleStatusChange = async (orderId, status) => {
    try {
      const result = await dispatch(updateOrderStatus({ id: orderId, status })).unwrap();
      toast.success('Order status updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update order status');

      // Handle authentication errors
      if (err.status === 401 || err.status === 403) {
        navigate('/login');
      }
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;

  if (isAuthError) {
    return (
      <div className="text-center text-red-500 p-8">
        <h2 className="text-xl font-bold">Authentication Error</h2>
        <p className="mt-2">Your session has expired or you don't have permission to view this page.</p>
        <p className="mt-1">Redirecting to login...</p>
      </div>
    );
  }

  if (error) return (
    <div className="text-center text-red-500 p-4">
      <p>Error: {typeof error === 'object' ? JSON.stringify(error) : error}</p>
      <p className="mt-2 text-sm">Please make sure you are logged in as an admin user.</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Order Management</h2>

      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="min-w-full text-left text-gray-500">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700">
            <tr>
              <th className="py-3 px-4">Order Id</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Total Price</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                >
                  <td className="py-4 px-4 font-medium text-gray-900 whitespace-nowrap">
                    {order._id ? `#${order._id}` : 'Unknown ID'}
                  </td>
                  <td className="p-4">{order.user?.name || 'Unknown User'}</td>
                  <td className="p-4">{order.totalPrice ? `$${order.totalPrice.toFixed(2)}` : 'N/A'}</td>
                  <td className="p-4">
                    <select
                      value={order.status || 'Processing'}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleStatusChange(order._id, "Delivered")}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Mark as Delivered
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No Orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;
