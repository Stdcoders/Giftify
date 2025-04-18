import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';

const GiftFinderGame = () => {
    const [step, setStep] = useState(1);
    const [preferences, setPreferences] = useState({});
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Simple question structure with realistic options
    const questions = [
        {
            id: 'recipient',
            text: 'Who is the gift for?',
            options: [
                { value: 'Partner' },
                { value: 'Friend' },
                { value: 'Parent' },
                { value: 'Child' },
                { value: 'Colleague' },
                { value: 'Myself' }
            ]
        },
        {
            id: 'occasion',
            text: "What's the occasion?",
            options: [
                { value: 'Birthday' },
                { value: 'Anniversary' },
                { value: 'Holiday' },
                { value: 'Graduation' },
                { value: 'Just Because' },
                { value: 'Thank You' }
            ]
        },
        {
            id: 'interests',
            text: 'What are they interested in?',
            options: [
                { value: 'Tech Gadgets' },
                { value: 'Fashion & Style' },
                { value: 'Home Decor' },
                { value: 'Relaxation' },
                { value: 'Books & Hobbies' },
                { value: 'Food & Drink' }
            ]
        },
        {
            id: 'priceRange',
            text: "What's your budget?",
            options: [
                { value: 'Under ₹1000' },
                { value: '₹1000 - ₹2500' },
                { value: '₹2500 - ₹5000' },
                { value: '₹5000+' },
                { value: 'Any' }
            ]
        }
    ];

    const handleAnswer = (questionId, answer) => {
        setPreferences(prev => ({ ...prev, [questionId]: answer }));
        if (step < questions.length) {
            setStep(prev => prev + 1);
        } else {
            // Last question answered, fetch recommendations
            fetchRecommendations({ ...preferences, [questionId]: answer });
        }
    };

    const fetchRecommendations = async (finalPreferences) => {
        setLoading(true);
        setRecommendations([]);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/recommendations/interactive`,
                finalPreferences
            );
            setRecommendations(response.data);
            setStep(prev => prev + 1);
        } catch (error) {
            console.error("Failed to fetch recommendations:", error);
            toast.error("Sorry, couldn't find recommendations. Please try again.");
            // Show empty recommendations screen
            setStep(prev => prev + 1);
        } finally {
            setLoading(false);
        }
    };

    const handleRestart = () => {
        setStep(1);
        setPreferences({});
        setRecommendations([]);
    };

    const renderQuestion = () => {
        const currentQuestion = questions[step - 1];
        if (!currentQuestion) return null;

        return (
            <div className="text-center py-8 px-4">
                <h2 className="text-2xl font-bold mb-4 text-white">{currentQuestion.text}</h2>

                {/* Simple progress indicator */}
                <div className="flex justify-center mb-8 gap-1.5">
                    {questions.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1.5 rounded-full w-6 ${index < step ? 'bg-blue-950' : 'bg-black'
                                }`}
                        ></div>
                    ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8 max-w-2xl mx-auto">
                    {currentQuestion.options.map(option => (
                        <button
                            key={option.value}
                            onClick={() => handleAnswer(currentQuestion.id, option.value)}
                            className="p-4 border border-gray-700 rounded-lg shadow-sm bg-blue-950 backdrop-blur-sm hover:bg-black hover:border-black transition-colors"
                        >
                            <div className="flex flex-col items-center">
                                <span className="font-medium text-white">{option.value}</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Navigation buttons */}
                <div className="flex justify-between max-w-xs mx-auto">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(prev => prev - 1)}
                            className="text-white hover:text-gray-300"
                        >
                            Back
                        </button>
                    )}
                    {step === 1 && <div></div>} {/* Spacer */}

                    <button
                        onClick={handleRestart}
                        className="text-gray-400 hover:text-gray-200"
                    >
                        Reset
                    </button>
                </div>
            </div>
        );
    };

    const renderRecommendations = () => (
        <div className="p-4 md:p-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2 text-blue-950">Perfect Gift Suggestions</h2>
                <p className="text-blue-950 max-w-md mx-auto text-sm">Based on your preferences, we've found these gifts that might interest you</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <p className="ml-3 text-gray-300">Searching...</p>
                </div>
            ) : recommendations.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {recommendations.map((product) => (
                            <div
                                key={product._id}
                                className="bg-black/80 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={product.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-base text-white">{product.name}</h3>
                                        <p className="text-white font-medium">₹{Number(product.price).toFixed(2)}</p>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description || "Perfect gift based on your preferences"}</p>
                                    <button
                                        onClick={() => navigate(`/product/${product._id}`)}
                                        className="w-full bg-white hover:bg-gray-200 text-black font-medium py-2 px-4 rounded transition-colors"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <button
                            onClick={handleRestart}
                            className="border border-white text-white hover:bg-black/50 font-medium py-2 px-6 rounded transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </>
            ) : (
                <div className="text-center py-8 bg-blue-950 backdrop-blur-sm rounded-lg border border-blue-950">
                    <h3 className="text-lg font-semibold text-white mb-2">No matches found</h3>
                    <p className="text-white mb-4 max-w-md mx-auto">Try adjusting your preferences for better results</p>
                    <button
                        onClick={handleRestart}
                        className="bg-white hover:bg-gray-200 text-black font-medium py-2 px-4 rounded transition-colors"
                    >
                        Try Different Options
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="py-6 min-h-screen" >
            <div className="container mx-auto">
                <div className="max-w-4xl mx-auto bg-white backdrop-blur-sm rounded-lg shadow overflow-hidden border border-gray-800">
                    <div className="bg-blue-950 py-4 px-6 text-white border-b border-blue-950">
                        <h1 className="text-xl font-bold">Gift Finder</h1>
                        <p className="text-sm text-white">Find the perfect gift in just a few steps</p>
                    </div>

                    <div className="min-h-[450px]">
                        {step <= questions.length ? renderQuestion() : renderRecommendations()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GiftFinderGame; 