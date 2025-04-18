import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../redux/slice/authSlice";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [formError, setFormError] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch();
    const { error } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setIsLoading(true);

        if (!email) {
            setFormError("Please enter your email address");
            setIsLoading(false);
            return;
        }

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setFormError("Please enter a valid email address");
            setIsLoading(false);
            return;
        }

        try {
            await dispatch(forgotPassword({ email })).unwrap();
            setIsSubmitted(true);
        } catch (err) {
            setFormError(err.message || "Failed to send reset email. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="w-full max-w-md mx-auto flex flex-col justify-center items-center p-8">
                <div className="w-full bg-white p-8 rounded-lg shadow-sm">
                    <div className="flex justify-center mb-6">
                        <h2 className="text-xl font-xl">Giftify</h2>
                    </div>

                    <h2 className="text-2xl font-bold text-center mb-6">
                        Reset Your Password
                    </h2>

                    <p className="text-center text-gray-600 mb-6">
                        Enter your email address and we'll send you instructions to reset your password.
                    </p>

                    {isSubmitted ? (
                        <div className="text-center">
                            <div className="mb-4">
                                <svg
                                    className="mx-auto h-12 w-12 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Check Your Email</h3>
                            <p className="text-gray-600 mb-6">
                                We've sent password reset instructions to {email}
                            </p>
                            <Link
                                to="/login"
                                className="text-blue-500 hover:text-blue-900 font-medium"
                            >
                                Return to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {(error || formError) && (
                                <p className="text-red-500 text-center mb-4">
                                    {error?.message || formError}
                                </p>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your email address"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full bg-black text-white p-2 rounded-lg font-semibold transition ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
                                    }`}
                            >
                                {isLoading ? "Sending..." : "Send Reset Instructions"}
                            </button>

                            <div className="mt-6 text-center">
                                <Link
                                    to="/login"
                                    className="text-sm text-blue-500 hover:text-blue-900"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword; 