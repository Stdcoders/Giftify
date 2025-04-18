import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [formError, setFormError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();
    const { token } = useParams();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setIsLoading(true);

        if (!password || !confirmPassword) {
            setFormError("Please fill in all fields");
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setFormError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setFormError("Password must be at least 6 characters long");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/users/reset-password/${token}`,
                { password }
            );
            setIsSuccess(true);
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (error) {
            setFormError(
                error.response?.data?.message || "Failed to reset password. Please try again."
            );
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

                    {isSuccess ? (
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
                            <h3 className="text-lg font-semibold mb-2">Password Reset Successful!</h3>
                            <p className="text-gray-600 mb-6">
                                Your password has been reset successfully. Redirecting to login...
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
                            {formError && (
                                <p className="text-red-500 text-center mb-4">{formError}</p>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your new password"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-2">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Confirm your new password"
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
                                {isLoading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword; 