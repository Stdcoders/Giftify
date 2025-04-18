import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/slice/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { mergeGuestCart } from "../redux/slice/cartSlice";

const Login = () => {
  const loginImg = "https://cdn.pixabay.com/photo/2020/12/08/17/08/gifts-5815004_1280.jpg";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, loading, error } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);

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

  useEffect(() => {
    // Check for lockout
    const storedLockout = localStorage.getItem('loginLockout');
    if (storedLockout) {
      const lockoutEnd = new Date(storedLockout);
      if (lockoutEnd > new Date()) {
        setIsLocked(true);
        setLockoutTime(lockoutEnd);
      } else {
        localStorage.removeItem('loginLockout');
      }
    }
  }, []);

  useEffect(() => {
    let timer;
    if (isLocked && lockoutTime) {
      timer = setInterval(() => {
        const now = new Date();
        if (now >= lockoutTime) {
          setIsLocked(false);
          setLockoutTime(null);
          localStorage.removeItem('loginLockout');
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLocked, lockoutTime]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!email || !password) {
      setFormError("Please fill in all fields");
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setFormError("Please enter a valid email address");
      return;
    }

    if (isLocked) {
      const remainingTime = Math.ceil((lockoutTime - new Date()) / 1000);
      setFormError(`Account is temporarily locked. Please try again in ${remainingTime} seconds.`);
      return;
    }

    dispatch(loginUser({ email, password }))
      .unwrap()
      .catch((err) => {
        setAttempts(prev => {
          const newAttempts = prev + 1;
          if (newAttempts >= 5) {
            const lockoutEnd = new Date();
            lockoutEnd.setMinutes(lockoutEnd.getMinutes() + 15);
            localStorage.setItem('loginLockout', lockoutEnd.toISOString());
            setIsLocked(true);
            setLockoutTime(lockoutEnd);
            setFormError("Too many failed attempts. Please try again in 15 minutes.");
          }
          return newAttempts;
        });
      });
  };

  const getRemainingLockoutTime = () => {
    if (!lockoutTime) return 0;
    return Math.ceil((lockoutTime - new Date()) / 1000);
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
            Welcome Back! 🎁✨
          </h2>
          <p className="text-center mb-6">
            Sign in to your Giftify Account
          </p>

          {(error || formError) && (
            <p className="text-red-500 text-center mb-4">
              {error?.message || formError || "Login failed! Please try again."}
            </p>
          )}

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
              disabled={isLocked}
            />
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your Password"
                required
                disabled={isLocked}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || isLocked}
            className={`w-full bg-black text-white p-2 rounded-lg font-semibold transition ${(loading || isLocked) ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
              }`}
          >
            {loading ? "Signing In..." : isLocked ? `Try Again in ${getRemainingLockoutTime()}s` : "Sign In"}
          </button>

          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-sm text-blue-500 hover:text-blue-900">
              Forgot Password?
            </Link>
          </div>

          <p className="mt-6 text-center text-sm">
            Don't have an account?
            <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-blue-500 ml-2 hover:text-blue-900">
              Sign up now!
            </Link>
          </p>
        </form>
      </div>

      {/* Image Section */}
      <div className="hidden md:block w-1/2 bg-gray-800">
        <div className="flex h-full flex-col justify-center items-center">
          <img
            src={loginImg}
            alt="Login"
            className="h-[750px] w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
