import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { fetchProductDetails } from '../../redux/slice/productSlice';
import { addToCart } from '../../redux/slice/cartSlice';
import { FaShoppingCart } from 'react-icons/fa';
import ProductReviews from './ProductReviews';

const ProductDetails = ({ productId }) => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { loading, error, selectedProduct: Product } = useSelector((state) => state.products);
    const { userInfo, guestId } = useSelector((state) => state.auth);

    const [selectedImage, setSelectedImage] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [message, setMessage] = useState("");
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);

    const productfetchId = id || productId;

    useEffect(() => {
        if (productfetchId) {
            dispatch(fetchProductDetails(productfetchId));
        }
    }, [dispatch, productfetchId]);

    useEffect(() => {
        if (Product?.images?.length > 0) {
            setSelectedImage(Product.images[0].url);
        }
    }, [Product]);

    const handleAddToCart = async () => {
        setIsButtonDisabled(true);
        try {
            await dispatch(addToCart({
                productId: productfetchId,
                quantity: Number(quantity),
                customization: message,
                userId: userInfo?._id,
                guestId: !userInfo ? guestId : undefined
            })).unwrap();

            toast.success("Product added to cart successfully!", { duration: 2000 });
        } catch (error) {
            console.error("Error adding to cart:", error);
            toast.error(
                error?.message || "Failed to add product to cart",
                { duration: 3000 }
            );
        } finally {
            setIsButtonDisabled(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (error) return (
        <div className="container mx-auto px-4 py-8 text-center">
            <div className="bg-red-50 p-4 rounded-lg">
                <h2 className="text-2xl font-semibold text-red-600 mb-2">Error</h2>
                <p className="text-gray-700">{error.message || "Failed to load product details"}</p>
            </div>
        </div>
    );

    if (!Product) return (
        <div className="container mx-auto px-4 py-8 text-center">
            <div className="bg-yellow-50 p-4 rounded-lg">
                <h2 className="text-2xl font-semibold text-yellow-600 mb-2">Product Not Found</h2>
                <p className="text-gray-700">The requested product could not be found.</p>
            </div>
        </div>
    );

    // Calculate discount percentage if discount price exists
    const discountPercentage = Product.discountprice
        ? Math.round(((Product.price - Product.discountprice) / Product.price) * 100)
        : 0;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-lg">
                        <img
                            src={selectedImage}
                            alt={Product.name}
                            className="w-full h-96 object-cover"
                        />
                        {discountPercentage > 0 && (
                            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold">
                                {discountPercentage}% OFF
                            </div>
                        )}
                    </div>
                    {Product.images?.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                            {Product.images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image.url}
                                    alt={image.altText || Product.name}
                                    className={`w-full h-24 object-cover rounded cursor-pointer ${selectedImage === image.url ? 'ring-2 ring-indigo-600' : ''}`}
                                    onClick={() => setSelectedImage(image.url)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-gray-900">{Product.name}</h1>

                    <div className="flex items-center space-x-3">
                        {Product.discountprice ? (
                            <>
                                <p className="text-2xl font-semibold text-indigo-600">₹{Product.discountprice}</p>
                                <p className="text-lg text-gray-500 line-through">₹{Product.price}</p>
                            </>
                        ) : (
                            <p className="text-2xl font-semibold text-indigo-600">₹{Product.price}</p>
                        )}
                    </div>

                    <div className="prose max-w-none">
                        <p className="text-gray-600">{Product.description}</p>
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center">
                        {Product.countInStock > 0 ? (
                            <span className="text-green-600 flex items-center">
                                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                In Stock ({Product.countInStock} available)
                            </span>
                        ) : (
                            <span className="text-red-600 flex items-center">
                                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                                Out of Stock
                            </span>
                        )}
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-4">
                        <label className="text-gray-700 font-medium">Quantity:</label>
                        <select
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="border rounded p-2 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                            disabled={Product.countInStock === 0}
                        >
                            {[...Array(Math.min(5, Product.countInStock || 1))].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {i + 1}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Customization */}
                    <div className="space-y-2">
                        <label className="block text-gray-700 font-medium">Add a message (optional):</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full border rounded p-2 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                            rows="3"
                            placeholder="Add a personal message..."
                            maxLength={200}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4 pt-4">
                        <button
                            onClick={handleAddToCart}
                            disabled={isButtonDisabled || Product.countInStock === 0}
                            className="flex-1 bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center gap-2 transition-colors"
                        >
                            <FaShoppingCart className="h-5 w-5" />
                            <span>Add to Cart</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Product Reviews Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
                <ProductReviews productId={productfetchId} />
            </div>
        </div>
    );
};

export default ProductDetails;
