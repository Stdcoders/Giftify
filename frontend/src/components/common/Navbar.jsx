import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineUser, HiOutlineShoppingBag, HiBars3BottomRight } from "react-icons/hi2";
import { IoMdClose } from "react-icons/io";
import SearchBar from "./SearchBar";
import CartDrawer from "../layout/CartDrawer";
import { useSelector } from "react-redux";

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const { cart } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const cartItemCount = cart?.products?.reduce((total, product) =>
    total + product.quantity, 0) || 0;

  const toggleDrawer = () => {
    setNavDrawerOpen(!navDrawerOpen);
  };

  const toggleCart = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
      <nav className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <div>
          <Link to="/" className="text-2xl font-bold text-blue-950">
            <h1>Giftify</h1>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-10">
          <Link to="/collections/all?category=Decor" className="text-gray-700 hover:text-black text-l font-medium uppercase">
            Decor
          </Link>
          <Link to="/collections/all?category=Tech&Gadgets" className="text-gray-700 hover:text-black text-l font-medium uppercase">
            Tech & Gadgets
          </Link>
          <Link to="/collections/all?category=Kids" className="text-gray-700 hover:text-black text-l font-medium uppercase">
            Kids
          </Link>
          <Link to="/collections/all?category=Travel&Adventure" className="text-gray-700 hover:text-black text-l font-medium uppercase">
            Travel & Adventure
          </Link>
          <Link to="/collections/all?category=Sports" className="text-gray-700 hover:text-black text-l font-medium uppercase">
            Sports
          </Link>
          <Link to="/collections/all?category=PetLove" className="text-gray-700 hover:text-black text-l font-medium uppercase">
            Pet Love
          </Link>
          <Link to="/collections/all?category=Accessories" className="text-gray-700 hover:text-black text-l font-medium uppercase">
            Accessories
          </Link>
        </div>

        {/* Right Icons */}
        <div className="flex items-center space-x-5">
          {userInfo && userInfo.role === "Admin" && (
            <Link to="/admin" className="block bg-black px-2 rounded text-sm text-white">
              Admin
            </Link>
          )}

          {userInfo ? (
            <>
              <Link to="/profile" className="hover:text-black">
                <HiOutlineUser className="h-6 w-6 text-gray-700" />
              </Link>
            </>
          ) : (
            <Link to="/login" className="hover:text-black">
              <HiOutlineUser className="h-6 w-6 text-gray-700" />
            </Link>
          )}

          <button onClick={toggleCart} className="relative hover:text-black">
            <HiOutlineShoppingBag className="h-6 w-6 text-gray-700" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 bg-blue-950 text-white text-xs rounded-full px-2 py-0.5">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Search Bar */}
          <div className="overflow-hidden">
            <SearchBar />
          </div>

          {/* Mobile Menu Button */}
          <button onClick={toggleDrawer} className="md:hidden">
            <HiBars3BottomRight className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </nav>

      {/* Cart Drawer */}
      <CartDrawer drawerOpen={drawerOpen} toggleCart={toggleCart} />

      {/* Mobile Navigation Menu */}
      <div
        className={`fixed top-0 left-0 w-3/4 sm:w-1/2 md:w-1/3 h-full bg-white shadow-lg transform transition-transform duration-300 z-50 ${navDrawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex justify-end p-4">
          <button onClick={toggleDrawer}>
            <IoMdClose className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <div className="p-4">
          <h1 className="text-2xl font-semibold mb-4">Menu</h1>
          <nav className="space-y-5">
            <Link to="/collections/all?category=Decor" onClick={toggleDrawer} className="block text-gray-600 hover:text-black">
              Decor
            </Link>
            <Link to="/collections/all?category=Tech" onClick={toggleDrawer} className="block text-gray-600 hover:text-black">
              Tech & Gadgets
            </Link>
            <Link to="/collections/all?category=Kids" onClick={toggleDrawer} className="block text-gray-600 hover:text-black">
              Kids
            </Link>
            <Link to="/collections/all?category=PetLove" onClick={toggleDrawer} className="block text-gray-600 hover:text-black">
              Pet Love
            </Link>
            <Link to="/collections/all?category=Travel" onClick={toggleDrawer} className="block text-gray-600 hover:text-black">
              Travels & Adventure
            </Link>
            <Link to="/collections/all?category=Sports" onClick={toggleDrawer} className="block text-gray-600 hover:text-black">
              Sports
            </Link>
            <Link to="/collections/all?category=Accessories" onClick={toggleDrawer} className="block text-gray-600 hover:text-black">
              Accessories
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;
