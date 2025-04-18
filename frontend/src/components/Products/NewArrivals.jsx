/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";

const NewArrivals = () => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  const [newArrivals, setnewArrivals] = useState([]);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/products/new-arrivals`);
        setnewArrivals(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchNewArrivals();
  }, []);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmt = direction === "left" ? -300 : 300;
    scrollRef.current.scrollBy({ left: scrollAmt, behavior: "smooth" });
  };

  const updateScrollButtons = () => {
    const container = scrollRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollWidth > container.scrollLeft + container.clientWidth);
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollButtons);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", updateScrollButtons);
      }
    };
  }, [newArrivals]);

  return (
    <section className="relative py-16 px-4 lg:px-0">
      <div className="container mx-auto text-center mb-10">
        <h2 className="text-3xl font-bold mb-4">New Arrivals!</h2>
        <p className="text-lg text-gray-600 mb-8">Fresh Collection of unique gifts!</p>
      </div>

      {/* Scroll Buttons Positioned at the Top */}
      <div className="relative flex justify-between items-center mb-4 px-4">
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className={`p-2 rounded-full border shadow-md 
          ${canScrollLeft ? "bg-white text-black" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
        >
          <FiChevronLeft className="text-2xl" />
        </button>
        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className={`p-2 rounded-full border shadow-md 
          ${canScrollRight ? "bg-white text-black" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
        >
          <FiChevronRight className="text-2xl" />
        </button>
      </div>

      {/* Scrollable Product Container */}
      <div ref={scrollRef} className="container mx-auto overflow-x-auto flex space-x-6 relative scrollbar-hide">
        {newArrivals.map((product) => (
          <div key={product._id} className="min-w-[100%] sm:min-w-[50%] lg:min-w-[30%] relative">
            <img
              src={product.images[0]?.url}
              alt={product.images[0]?.altText || product.name}
              className="w-full h-[500px] object-cover rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-opacity-0 backdrop-blur-md text-white p-4 rounded-b-lg">
              <Link to={`/product/${product._id}`} className="block">
                <h4 className="font-medium text-white text-bold">{product.name}</h4>
                <p className="mt-1 text-white text-bold">{product.price}</p>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewArrivals;
