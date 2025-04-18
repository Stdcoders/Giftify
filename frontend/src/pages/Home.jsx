/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from 'react-router-dom';
import {
  fetchProducts,
  fetchBestSellerProduct,
} from "@/redux/slice/productSlice"; // ✅ Redux thunks
import NewArrivals from "../components/Products/NewArrivals";
import ProductDetails from "../components/Products/ProductDetails";
import Hero from "../components/layout/Hero";
import Collection1 from "../components/Products/Collection1";
import FeatureSection from "../components/Products/FeatureSection";

const Home = () => {
  const dispatch = useDispatch();

  // ✅ Pulling everything from Redux
  const {
    products,
    loadingProducts,
    loadingBestSeller,
    error,
    bestSellerProduct,
  } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts({ isFeatured: true, limit: 5 }));
    dispatch(fetchBestSellerProduct()); // ✅ Using thunk
  }, [dispatch]);

  return (
    <div>
      <Hero />
      <div className="text-center py-10 bg-gradient-to-r from-purple-50 to-indigo-50 my-8">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Need Gift Ideas?</h2>
        <p className="text-lg text-gray-600 mb-6">Let our Gift Finder game help you discover the perfect present!</p>
        <Link to="/gift-finder">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-200 ease-in-out transform hover:scale-105 shadow-md">
            Play Gift Finder Game
          </button>
        </Link>
      </div>
      <Collection1 />
      <NewArrivals />

      <h2 className="text-3xl text-center font-bold mb-4">Best Seller</h2>

      {loadingBestSeller ? (
        <p className="text-center">Loading best seller...</p>
      ) : bestSellerProduct && bestSellerProduct._id ? (
        <ProductDetails productId={bestSellerProduct._id} fetchSimilar={false} />
      ) : (
        <p className="text-center text-red-500">
          {error?.message || "No best seller found."}
        </p>
      )}

      <FeatureSection />
    </div>
  );
};

export default Home;
