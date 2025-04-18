/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../redux/slice/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { mergeGuestCart } from "../redux/slice/cartSlice";

const Register = () => {
  const registerImg =
    "https://cdn.pixabay.com/photo/2020/12/08/17/08/gifts-5815004_1280.jpg";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [formError, setFormError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, loading, error } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);

  //get redirect parameter 
  const redirect = new URLSearchParams(location.search).get("redirect") || "/";
  const isCheckoutRedirect = redirect.includes("checkout");

  useEffect(() => {
    if (userInfo) {
      if (cart?.products?.length > 0) {
        dispatch(mergeGuestCart({ guestId: userInfo._id, user: userInfo }))
          .then(() => navigate(isCheckoutRedirect ? "/checkout" : "/"))
          .catch(() => navigate(isCheckoutRedirect ? "/checkout" : "/"));
      } else {
        navigate(isCheckoutRedirect ? "/checkout" : "/");
      }
    }
  }, [userInfo, cart, navigate, isCheckoutRedirect, dispatch]);

  const validatePassword = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(validatePassword(newPassword));
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-blue-500";
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
        return "Very Weak";
      case 1:
        return "Weak";
      case 2:
        return "Medium";
      case 3:
        return "Strong";
      case 4:
        return "Very Strong";
      default:
        return "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!name || !email || !password) {
      setFormError("Please fill in all fields");
      return;
    }

    if (passwordStrength < 3) {
      setFormError("Password is not strong enough. Please include uppercase, lowercase, numbers, and special characters.");
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setFormError("Please enter a valid email address");
      return;
    }

    dispatch(registerUser({ name, email, password }));
  };

  return (
    <div className="flex">
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
        <form
          className="w-full max-w-md bg-white p-8 rounded-lg border shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="flex justify-center mb-6">
            <h2 className="text-xl font-xl">Giftify</h2>
          </div>
          <h2 className="text-2xl font-bold text-center mb-6">
            Hey There! 🎁✨
          </h2>
          <p className="text-center mb-6">
            Create your Giftify Account today!
          </p>

          {(error || formError) && (
            <p className="text-red-500 text-center mb-4">
              {error?.message || formError || "Registration failed! Please try again."}
            </p>
          )}

          {/* Name Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your Name"
              required
            />
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email address"
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="h-1 w-full bg-gray-200 rounded-full">
                  <div
                    className={`h-1 rounded-full ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 4) * 100}%` }}
                  ></div>
                </div>
                <p className={`text-sm mt-1 ${getPasswordStrengthColor().replace('bg-', 'text-')}`}>
                  {getPasswordStrengthText()}
                </p>
              </div>
            )}

            {/* Password Requirements */}
            <div className="mt-2 text-sm text-gray-600">
              <p>Password must contain:</p>
              <ul className="list-disc list-inside">
                <li className={password.length >= 8 ? "text-green-500" : ""}>At least 8 characters</li>
                <li className={password.match(/[a-z]/) && password.match(/[A-Z]/) ? "text-green-500" : ""}>Uppercase and lowercase letters</li>
                <li className={password.match(/\d/) ? "text-green-500" : ""}>At least one number</li>
                <li className={password.match(/[^a-zA-Z\d]/) ? "text-green-500" : ""}>At least one special character</li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-black text-white p-2 rounded-lg font-semibold transition ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
              }`}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>

          <p className="mt-6 text-center text-sm">
            Already a user?
            <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-blue-500 ml-2 hover:text-blue-900">
              Login now!
            </Link>
          </p>
        </form>
      </div>

      {/* Image Section */}
      <div className="hidden md:block w-1/2 bg-gray-800">
        <div className="flex h-full flex-col justify-center items-center">
          <img
            src={registerImg}
            alt="Register"
            className="h-[750px] w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Register;
