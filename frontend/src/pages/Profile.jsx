import React, { useEffect, useState } from 'react'
import MyOrders from './MyOrders'
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../redux/slice/cartSlice';
import { logout } from '../redux/slice/authSlice';
import GiftReminder from '../components/reminders/GiftReminder';

const Profile = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'reminders'

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
  }, [userInfo, navigate]);

  const handleLogOut = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate('/login');
  };

  if (!userInfo) {
    return null;
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <div className='flex-grow container mx-auto p-4 md:p-6'>
        <div className='flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0'>
          {/*Left Section*/}
          <div className='w-full md:w-1/3 lg:w-1/4 shadow-md rounded-lg p-6'>
            <h1 className='text-2xl md:text-3xl font-bold mb-4'>{userInfo.name}</h1>
            <p className='text-lg text-gray-600 mb-4'>{userInfo.email}</p>
            <div className="flex flex-col space-y-3 mb-4">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full py-2 px-4 rounded ${activeTab === 'orders'
                  ? 'bg-black text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
              >
                My Orders
              </button>
              <button
                onClick={() => setActiveTab('reminders')}
                className={`w-full py-2 px-4 rounded ${activeTab === 'reminders'
                  ? 'bg-black text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
              >
                Gift Reminders
              </button>
            </div>
            <button
              onClick={handleLogOut}
              className='w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-600'
            >
              Log Out
            </button>
          </div>
          {/*Right Section*/}
          <div className='w-full md:w-2/3 lg:w-3/4'>
            {activeTab === 'orders' ? (
              <MyOrders />
            ) : (
              <GiftReminder />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
