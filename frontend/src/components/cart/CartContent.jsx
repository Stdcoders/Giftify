/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { RiDeleteBin3Line } from 'react-icons/ri'
import { useDispatch, useSelector } from 'react-redux'
import { setCart, updateCartItem, removeFromCart, fetchCart } from '../../redux/slice/cartSlice'
import { handleAuthError } from '../../utils/authErrorHandler'
import { useNavigate } from 'react-router-dom'

const CartContent = ({ userId, guestId }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { userInfo } = useSelector((state) => state.auth);
    const { cart, error } = useSelector((state) => state.cart);

    // Fetch cart data when component mounts or auth state changes
    useEffect(() => {
        const fetchCartData = async () => {
            if (!userId && !guestId) return;

            setLoading(true);
            try {
                await dispatch(fetchCart({
                    userId,
                    guestId: !userInfo ? guestId : undefined
                })).unwrap();
            } catch (err) {
                console.error('Error fetching cart:', err);

                // Check if it's an auth error and handle it appropriately
                if (!handleAuthError(err, dispatch, navigate)) {
                    // Only show this error if it's not an auth error
                    toast.error(err?.message || 'Failed to load cart');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchCartData();
    }, [dispatch, navigate, userInfo, userId, guestId]);

    // Show error toast when cart operations fail
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const calculateTotal = () => {
        if (!cart?.products) {
            return 0;
        }
        return cart.products.reduce((total, product) => {
            const itemPrice = product.price || 0;
            return total + itemPrice * (parseInt(product.quantity, 10) || 0);
        }, 0);
    };

    // Handle quantity update
    const handleUpdateQuantity = async (productId, newQuantity, customization) => {
        if (newQuantity < 1) return;
        setLoading(true);

        try {
            const result = await dispatch(updateCartItem({
                productId,
                quantity: newQuantity,
                customization: customization || '',
                userId,
                guestId: !userInfo ? guestId : undefined,
            })).unwrap();

            if (result) {
                dispatch(setCart(result));
            }
        } catch (error) {
            console.error('Error updating quantity:', error);

            // Check if it's an auth error and handle it appropriately
            if (!handleAuthError(error, dispatch, navigate)) {
                // Only show this error if it's not an auth error
                toast.error(error?.message || 'Failed to update cart');
            }

            // Refresh cart to ensure consistent state
            try {
                await dispatch(fetchCart({
                    userId,
                    guestId: !userInfo ? guestId : undefined
                })).unwrap();
            } catch (fetchError) {
                console.error('Error fetching cart after failed update:', fetchError);
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle item removal
    const handleRemoveFromCart = async (productId, customization) => {
        setLoading(true);

        try {
            const result = await dispatch(removeFromCart({
                productId,
                customization: customization || '',
                userId,
                guestId: !userInfo ? guestId : undefined
            })).unwrap();

            if (result) {
                dispatch(setCart(result));
            }
        } catch (error) {
            console.error('Error removing item:', error);

            // Check if it's an auth error and handle it appropriately
            if (!handleAuthError(error, dispatch, navigate)) {
                // Only show this error if it's not an auth error
                toast.error(error?.message || 'Failed to remove item from cart');
            }

            // Refresh cart to ensure consistent state
            try {
                await dispatch(fetchCart({
                    userId,
                    guestId: !userInfo ? guestId : undefined
                })).unwrap();
            } catch (fetchError) {
                console.error('Error fetching cart after failed removal:', fetchError);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!cart?.products?.length) {
        return <p>Your cart is empty!</p>;
    }

    return (
        <div>
            {loading && <div className="text-center py-2">Updating cart...</div>}

            {cart.products.map((product, index) => (
                <div key={`${product.productId}-${index}`} className='flex items-center justify-between py-4 border-b'>
                    <div className='flex items-start'>
                        <img
                            src={product.image}
                            alt={product.name}
                            className='w-20 h-24 object-cover mr-4 rounded'
                        />
                        <div>
                            <h3 className='font-medium'>{product.name}</h3>
                            <p className='text-sm text-gray-500'>
                                Price: ₹{product.price != null ? Number(product.price).toFixed(2) : 'N/A'}
                                {product.customization && (
                                    <span className='block text-xs'>Customization: {product.customization}</span>
                                )}
                            </p>
                            <div className='flex items-center mt-2'>
                                <button
                                    onClick={() => handleUpdateQuantity(
                                        product.productId,
                                        parseInt(product.quantity, 10) - 1,
                                        product.customization
                                    )}
                                    className='border rounded-l px-2 py-1 text-xl font-medium hover:bg-gray-100'
                                    disabled={parseInt(product.quantity, 10) <= 1 || loading}
                                >
                                    -
                                </button>
                                <span className='border-t border-b px-4 py-1'>{parseInt(product.quantity, 10)}</span>
                                <button
                                    onClick={() => handleUpdateQuantity(
                                        product.productId,
                                        parseInt(product.quantity, 10) + 1,
                                        product.customization
                                    )}
                                    className='border rounded-r px-2 py-1 text-xl font-medium hover:bg-gray-100'
                                    disabled={loading}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col items-end'>
                        <p className='font-medium'>₹{(Number(product.price || 0) * parseInt(product.quantity, 10)).toFixed(2)}</p>
                        <button
                            onClick={() => handleRemoveFromCart(product.productId, product.customization)}
                            disabled={loading}
                            className='text-red-600 hover:text-red-800 mt-2'
                        >
                            <RiDeleteBin3Line className='h-6 w-6' />
                        </button>
                    </div>
                </div>
            ))}

            <div className="mt-4 text-right font-bold">
                Total: ₹{calculateTotal().toFixed(2)}
            </div>
        </div>
    );
};

export default CartContent;
