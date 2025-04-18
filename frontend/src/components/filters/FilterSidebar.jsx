import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFilters, clearFilters } from "../../redux/slice/productSlice";

const FilterSidebar = () => {
    const dispatch = useDispatch();
    const filters = useSelector((state) => state.products.filters);

    const handleFilterChange = (filterType, value) => {
        dispatch(setFilters({ [filterType]: value }));
    };

    const handleClearFilters = () => {
        dispatch(clearFilters());
    };

    return (
        <div className="w-64 bg-white p-4 shadow-md rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Filters</h2>
                <button
                    onClick={handleClearFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                    Clear All
                </button>
            </div>

            {/* Category */}
            <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Category</h3>
                <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="category"
                            value="all"
                            checked={filters.category === "all"}
                            onChange={(e) => handleFilterChange("category", e.target.value)}
                            className="form-radio text-indigo-600"
                        />
                        <span>All Categories</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="category"
                            value="Decor"
                            checked={filters.category === "Decor"}
                            onChange={(e) => handleFilterChange("category", e.target.value)}
                            className="form-radio text-indigo-600"
                        />
                        <span>Decor</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="category"
                            value="Tech"
                            checked={filters.category === "Tech"}
                            onChange={(e) => handleFilterChange("category", e.target.value)}
                            className="form-radio text-indigo-600"
                        />
                        <span>Tech & Gadgets</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="category"
                            value="Kids"
                            checked={filters.category === "Kids"}
                            onChange={(e) => handleFilterChange("category", e.target.value)}
                            className="form-radio text-indigo-600"
                        />
                        <span>Kids</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="category"
                            value="Travel"
                            checked={filters.category === "Travel"}
                            onChange={(e) => handleFilterChange("category", e.target.value)}
                            className="form-radio text-indigo-600"
                        />
                        <span>Travel & Adventure</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="category"
                            value="Sports"
                            checked={filters.category === "Sports"}
                            onChange={(e) => handleFilterChange("category", e.target.value)}
                            className="form-radio text-indigo-600"
                        />
                        <span>Sports</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="category"
                            value="PetLove"
                            checked={filters.category === "PetLove"}
                            onChange={(e) => handleFilterChange("category", e.target.value)}
                            className="form-radio text-indigo-600"
                        />
                        <span>Pet Love</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="category"
                            value="Accessories"
                            checked={filters.category === "Accessories"}
                            onChange={(e) => handleFilterChange("category", e.target.value)}
                            className="form-radio text-indigo-600"
                        />
                        <span>Accessories</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="category"
                            value="Gifts"
                            checked={filters.category === "Gifts"}
                            onChange={(e) => handleFilterChange("category", e.target.value)}
                            className="form-radio text-indigo-600"
                        />
                        <span>Gifts</span>
                    </label>
                </div>
            </div>

            {/* Price Range */}
            <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Price Range</h3>
                <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="radio"
                            name="price"
                            value="100-500"
                            checked={filters.priceRange === "100-500"}
                            onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-gray-700">₹100 - ₹500</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="radio"
                            name="price"
                            value="500-1000"
                            checked={filters.priceRange === "500-1000"}
                            onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-gray-700">₹500 - ₹1000</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="radio"
                            name="price"
                            value="1000-2000"
                            checked={filters.priceRange === "1000-2000"}
                            onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-gray-700">₹1000 - ₹2000</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="radio"
                            name="price"
                            value="2000-3000"
                            checked={filters.priceRange === "2000-3000"}
                            onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-gray-700">₹2000 - ₹3000</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="radio"
                            name="price"
                            value="3000-4000"
                            checked={filters.priceRange === "3000-4000"}
                            onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-gray-700">₹3000 - ₹4000</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="radio"
                            name="price"
                            value="4000-5000"
                            checked={filters.priceRange === "4000-5000"}
                            onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-gray-700">₹4000 - ₹5000</span>
                    </label>
                    <button
                        onClick={() => handleFilterChange("priceRange", "")}
                        className="text-sm text-indigo-600 hover:text-indigo-500 mt-2"
                    >
                        Clear price filter
                    </button>
                </div>
            </div>

            {/* Age */}
            <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Age</h3>
                <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="age"
                            value="any"
                            checked={filters.age === "any"}
                            onChange={(e) => handleFilterChange("age", e.target.value)}
                            className="form-radio text-indigo-600"
                        />
                        <span>Any Age</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="age"
                            value="Below 18"
                            checked={filters.age === "Below 18"}
                            onChange={(e) => handleFilterChange("age", e.target.value)}
                            className="form-radio text-indigo-600"
                        />
                        <span>Below 18</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="age"
                            value="18-24"
                            checked={filters.age === "18-24"}
                            onChange={(e) => handleFilterChange("age", e.target.value)}
                            className="form-radio text-indigo-600"
                        />
                        <span>18-24</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="age"
                            value="24-35"
                            checked={filters.age === "24-35"}
                            onChange={(e) => handleFilterChange("age", e.target.value)}
                            className="form-radio text-indigo-600"
                        />
                        <span>24-35</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="age"
                            value="35+"
                            checked={filters.age === "35+"}
                            onChange={(e) => handleFilterChange("age", e.target.value)}
                            className="form-radio text-indigo-600"
                        />
                        <span>35+</span>
                    </label>
                </div>
            </div>

            {/* Occasion */}
            <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Occasion</h3>
                <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="occasion"
                            value="any"
                            checked={filters.occasion === "any"}
                            onChange={(e) => handleFilterChange("occasion", e.target.value)}
                            className="form-radio text-indigo-600"
                        />
                        <span>Any Occasion</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="occasion"
                            value="Birthday"
                            checked={filters.occasion === "Birthday"}
                            onChange={(e) => handleFilterChange("occasion", e.target.value)}
                            className="form-radio text-indigo-600"
                        />
                        <span>Birthday</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="occasion"
                            value="Wedding"
                            checked={filters.occasion === "Wedding"}
                            onChange={(e) => handleFilterChange("occasion", e.target.value)}
                            className="form-radio text-indigo-600"
                        />
                        <span>Wedding</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="occasion"
                            value="Anniversary"
                            checked={filters.occasion === "Anniversary"}
                            onChange={(e) => handleFilterChange("occasion", e.target.value)}
                            className="form-radio text-indigo-600"
                        />
                        <span>Anniversary</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="occasion"
                            value="New Year"
                            checked={filters.occasion === "New Year"}
                            onChange={(e) => handleFilterChange("occasion", e.target.value)}
                            className="form-radio text-indigo-600"
                        />
                        <span>New Year</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="occasion"
                            value="Valentine"
                            checked={filters.occasion === "Valentine"}
                            onChange={(e) => handleFilterChange("occasion", e.target.value)}
                            className="form-radio text-indigo-600"
                        />
                        <span>Valentine</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default FilterSidebar; 