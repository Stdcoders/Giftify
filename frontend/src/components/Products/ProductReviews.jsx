import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductReviews, createProductReview } from '../../redux/slice/productSlice';
import { toast } from 'sonner';
import { FaStar, FaRegStar, FaUserCircle } from 'react-icons/fa';
import { handleAuthError } from '../../utils/authErrorHandler';
import { useNavigate } from 'react-router-dom';

const ProductReviews = ({ productId }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);
    const {
        productReviews,
        loadingReviews,
        submittingReview,
        reviewError,
        selectedProduct
    } = useSelector((state) => state.products);

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);
    const [showForm, setShowForm] = useState(false);

    // Get reviews either from productReviews array or from selectedProduct
    const reviews = productReviews.length > 0
        ? productReviews
        : (selectedProduct?.reviews || []);

    useEffect(() => {
        // Only fetch reviews if we don't already have them
        if (!selectedProduct?.reviews && productReviews.length === 0) {
            dispatch(fetchProductReviews(productId));
        }
    }, [dispatch, productId, selectedProduct, productReviews]);

    useEffect(() => {
        if (reviewError) {
            // Try to handle auth error, otherwise show generic error
            if (!handleAuthError({ message: reviewError }, dispatch, navigate)) {
                toast.error(reviewError);
            }
        }
    }, [reviewError, dispatch, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userInfo) {
            toast.error('Please sign in to leave a review');
            navigate('/login');
            return;
        }

        if (!comment.trim()) {
            toast.error('Please enter a comment');
            return;
        }

        try {
            await dispatch(createProductReview({
                productId,
                reviewData: { rating, comment }
            })).unwrap();

            toast.success('Review submitted successfully!');
            setComment('');
            setRating(5);
            setShowForm(false);
        } catch (err) {
            // Error is already handled in the useEffect above
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

            {/* Review stats */}
            <div className="mb-6">
                <div className="flex items-center mb-2">
                    <div className="flex mr-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className="text-yellow-400">
                                {selectedProduct?.rating >= star ? (
                                    <FaStar />
                                ) : (
                                    <FaRegStar />
                                )}
                            </span>
                        ))}
                    </div>
                    <span className="text-gray-600">
                        Based on {selectedProduct?.numReviews || reviews.length} reviews
                    </span>
                </div>
            </div>

            {/* Add review button */}
            {userInfo && !showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className="mb-6 bg-blue-950 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                    Write a Review
                </button>
            )}

            {/* Review form */}
            {showForm && (
                <div className="bg-gray-50 p-4 rounded-lg mb-8">
                    <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Rating</label>
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="text-2xl focus:outline-none"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                    >
                                        <span className={`${(hoveredRating || rating) >= star
                                                ? "text-yellow-400"
                                                : "text-gray-300"
                                            }`}>
                                            <FaStar />
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="comment" className="block text-gray-700 mb-2">
                                Your Review
                            </label>
                            <textarea
                                id="comment"
                                rows="4"
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                required
                            ></textarea>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submittingReview}
                                className="px-4 py-2 bg-blue-950 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                            >
                                {submittingReview ? "Submitting..." : "Submit Review"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Loading indicator */}
            {loadingReviews && (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                    <p className="mt-2 text-gray-600">Loading reviews...</p>
                </div>
            )}

            {/* Reviews list */}
            {!loadingReviews && reviews.length === 0 && (
                <p className="text-gray-500 italic py-4">
                    No reviews yet. Be the first to leave a review!
                </p>
            )}

            <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review._id} className="border-b border-gray-200 pb-6">
                        <div className="flex items-center mb-2">
                            <FaUserCircle className="text-gray-400 text-xl mr-2" />
                            <span className="font-semibold">{review.name}</span>
                        </div>
                        <div className="flex items-center mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className="text-yellow-400">
                                    {review.rating >= star ? <FaStar /> : <FaRegStar />}
                                </span>
                            ))}
                            <span className="ml-2 text-gray-500 text-sm">
                                {review.createdAt && formatDate(review.createdAt)}
                            </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductReviews; 