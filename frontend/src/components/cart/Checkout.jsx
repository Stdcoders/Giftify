import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PayPalButton from "./PayPalButton";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

//import { createCheckoutSession } from "../../redux/actions/checkoutActions";


const Checkout = () => {
  const navigate = useNavigate();
  const [checkoutId, setCheckoutId] = useState(null);
  const dispatch = useDispatch();
  const { cart, loading, error } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  // ensure cart is not loaded before proceeding 
  useEffect(() => {
    if (!cart || !cart.products || cart.products.length === 0) {
      navigate("/")
    }
  }, [cart, navigate]);

  const handleCreateCheckout = async (e) => {
    e.preventDefault();

    // Check if user is logged in
    const token = localStorage.getItem("userToken");
    if (!token) {
      alert("Please log in to continue with checkout");
      navigate("/login");
      return;
    }

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'address', 'city', 'postalCode', 'country', 'phone'];
    const missingFields = requiredFields.filter(field => !shippingAddress[field]);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (cart && cart.products.length > 0) {
      try {
        // Log the cart products to debug
        console.log("Cart products:", JSON.stringify(cart.products, null, 2));

        // Create checkout items with proper productId
        const checkoutItems = cart.products.map(product => {
          // The productId should be in product.productId
          // If it's not there, we need to fetch it from the backend
          const productId = product.productId;

          if (!productId) {
            console.error("Product ID is missing for product:", product);
            throw new Error("Product ID is missing");
          }

          return {
            productId: productId,
            name: product.name,
            image: product.image,
            price: product.price,
            quantity: product.quantity
          };
        });

        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/checkout`,
          {
            checkoutItems,
            shippingAddress: {
              firstName: shippingAddress.firstName,
              lastName: shippingAddress.lastName,
              address: shippingAddress.address,
              city: shippingAddress.city,
              postalCode: shippingAddress.postalCode,
              country: shippingAddress.country,
              phone: shippingAddress.phone
            },
            paymentMethod: "Paypal",
            totalPrice: cart.totalPrice,
            quantity: cart.products.reduce((acc, item) => acc + item.quantity, 0)
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`
            }
          }
        );

        if (res.data && res.data._id) {
          setCheckoutId(res.data._id);
        }
      } catch (error) {
        console.error("Checkout creation failed:", error.response?.data || error.message);
        // Show error to user
        alert(error.response?.data?.message || "Failed to create checkout. Please try again.");
      }
    }
  };

  const handlePaymentSuccess = async (details) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/checkout/${checkoutId}/pay`,
        {
          paymentStatus: "paid",
          paymentdetails: details,
          isPaid: true,
          paidAt: new Date()
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`
          }
        }
      );
        await handleFinalCheckout(checkoutId);
    } catch (error) {
      console.error("Payment failed", error);
    }
  };

  const handleFinalCheckout = async (checkoutId) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/checkout/${checkoutId}/finalize`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`
          }
        }
      );
      navigate("/order-confirmation");
    } catch (error) {
      console.error("Final checkout failed", error);
    }
  }

  if (loading) {
    return <div>Loading cart...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }
  if (!cart || cart.products.length === 0) {
    return <p>No items in cart</p>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6 tracking-tighter">
      {/* Left section */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-2xl uppercase mb-6">Checkout</h2>
        <form onSubmit={handleCreateCheckout}>
          <h3 className="text-lg mb-4">Contact Details</h3>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={userInfo?.email || ""}
              className="w-full p-2 border rounded"
              disabled
            />
          </div>

          <h3 className="text-lg mb-4">Delivery</h3>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">First Name</label>
              <input
                type="text"
                value={shippingAddress.firstName}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    firstName: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700">Last Name</label>
              <input
                type="text"
                value={shippingAddress.lastName}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    lastName: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Address</label>
            <input
              type="text"
              value={shippingAddress.address}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  address: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">City</label>
              <input
                type="text"
                value={shippingAddress.city}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    city: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700">Postal Code</label>
              <input
                type="text"
                value={shippingAddress.postalCode}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    postalCode: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Country</label>
            <input
              type="text"
              value={shippingAddress.country}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  country: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Phone</label>
            <input
              type="tel"
              value={shippingAddress.phone}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  phone: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mt-6">
            {!checkoutId ? (
              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded"
              >
                Continue to Payment
              </button>
            ) : (
              <div>
                <h3 className="text-lg mb-4">Pay with Paypal</h3>
                <PayPalButton
                  amount={cart.totalPrice}
                  onSuccess={handlePaymentSuccess}
                  onError={(err) => alert("Payment failed. Try again.")}
                />
              </div>
            )}
          </div>
        </form>
      </div>
      {/* Right Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg mb-4">Order Summary</h3>
        <div className="border-t py-4 mb-4">
          {cart.products.map((product, index) => (
            <div
              key={index}
              className="flex items-start justify-between py-2 border-b"
            >
              <div className="flex items-start">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-24 object-cover mr-4"
                />
                <div>
                  <h3 className="text-md">{product.name}</h3>
                  <p className="text-gray-500">Quantity: {product.quantity}</p>
                </div>
              </div>
              <p className="text-xl">{product.price?.toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center text-lg mb-4">
          <p>Subtotal</p>
          <p>{cart.totalPrice?.toLocaleString()}</p>
        </div>
        <div className="flex justify-between items-center text-lg">
          <p>Shipping</p>
          <p>Free</p>
        </div>
        <div className="flex justify-between items-center text-lg mt-4 border-t pt-4">
          <p>Total</p>
          <p>{cart.totalPrice?.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
