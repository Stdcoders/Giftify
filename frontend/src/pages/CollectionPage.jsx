import { useState, useEffect, useRef } from "react";
import { FaFilter } from "react-icons/fa";
import FilterSidebar from "../components/Products/FilterSidebar";
import SortOptions from "../components/Products/SortOptions";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, setFilters } from "../redux/slice/productSlice";

const CollectionPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products, loadingProducts, error, filters } = useSelector((state) => state.products);

  const queryParams = Object.fromEntries([...searchParams]);
  const sidebarRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Update filters in Redux state
    dispatch(setFilters(queryParams));

    // Fetch products with updated filters
    dispatch(fetchProducts(queryParams));
  }, [dispatch, searchParams]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClickOutside = (e) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Mobile Filter button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden border p-2 flex justify-center items-center mb-4"
      >
        <FaFilter className="mr-2" /> Filters
      </button>

      {/* Filter sidebar */}
      <div
        ref={sidebarRef}
        className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed inset-y-0 z-50 left-0 w-64 bg-white overflow-y-auto transition-transform duration-300 lg:static lg:translate-x-0`}
      >
        <FilterSidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 p-4">
        <div className="mb-6">
          <h2 className="text-2xl uppercase mb-2">Product Collection</h2>
          <SortOptions />
        </div>

        {/* Loading */}
        {loadingProducts && <div className="text-center text-gray-500 p-10">Loading products...</div>}

        {/* Error */}
        {error && (
          <div className="text-center text-red-500 p-10">
            {error.message || "Something went wrong while fetching products"}
          </div>
        )}

        {/* Product grid */}
        {!loadingProducts && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                onClick={() => handleProductClick(product._id)}
                className="group cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.images[0].url}
                    alt={product.images[0].altText || product.name}
                    className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.discountprice && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {Math.round(((product.price - product.discountprice) / product.price) * 100)}% OFF
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {product.discountprice ? (
                        <>
                          <p className="text-lg font-semibold text-indigo-600">₹{product.discountprice}</p>
                          <p className="text-sm text-gray-500 line-through">₹{product.price}</p>
                        </>
                      ) : (
                        <p className="text-lg font-semibold text-gray-900">₹{product.price}</p>
                      )}
                    </div>
                    {product.countInStock > 0 ? (
                      <span className="text-xs text-green-600">In Stock</span>
                    ) : (
                      <span className="text-xs text-red-600">Out of Stock</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!loadingProducts && !error && products.length === 0 && (
          <div className="text-center text-gray-500 p-10">No products found.</div>
        )}
      </div>
    </div>
  );
};

export default CollectionPage;
