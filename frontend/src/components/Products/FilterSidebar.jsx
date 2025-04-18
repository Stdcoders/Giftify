import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const FilterSidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    category: "",
    minPrice: 0,
    maxPrice: 100,
    age: [],
    occasion: []
  });

  const [priceRange, setPriceRange] = useState([0, 100]);

  const categories = [
    "Decor",
    "Tech & Gadgets",
    "Kids",
    "Pet Love",
    "Travel & Adventure",
    "Sports",
    "Accessories",
  ];

  const ageGroups = ["Below 18", "18-24", "24-35", "35+"];
  const occasions = ["Birthday", "Anniversary", "Wedding", "Valentine", "New Year"];

  useEffect(() => {
    const params = Object.fromEntries([...searchParams]);

    // Parse arrays from URL parameters
    const ageArray = params.age ? params.age.split(',') : [];
    const occasionArray = params.occasion ? params.occasion.split(',') : [];

    setFilters({
      category: params.category || "",
      minPrice: params.minPrice || 0,
      maxPrice: params.maxPrice || 100,
      age: ageArray,
      occasion: occasionArray
    });

    setPriceRange([0, params.maxPrice || 100]);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      // Handle multiple selections for age and occasion
      const currentValues = [...filters[name]];
      if (checked) {
        currentValues.push(value);
      } else {
        const index = currentValues.indexOf(value);
        if (index > -1) {
          currentValues.splice(index, 1);
        }
      }
      const newFilters = { ...filters, [name]: currentValues };
      setFilters(newFilters);
      updateURLParams(newFilters);
    } else {
      // Handle single selection for category
      const newFilters = { ...filters, [name]: value };
      setFilters(newFilters);
      updateURLParams(newFilters);
    }
  };

  const updateURLParams = (newFilters) => {
    const params = new URLSearchParams();

    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key]) {
        if (Array.isArray(newFilters[key])) {
          // Handle array parameters
          if (newFilters[key].length > 0) {
            params.append(key, newFilters[key].join(','));
          }
        } else {
          // Handle single value parameters
          params.append(key, newFilters[key]);
        }
      }
    });
    setSearchParams(params);
    navigate(`?${params.toString()}`);
  };

  const handlePriceChange = (e) => {
    const newPrice = e.target.value;
    setPriceRange([0, newPrice]);
    const newFilters = { ...filters, minPrice: 0, maxPrice: newPrice };
    setFilters(newFilters);
    updateURLParams(newFilters);
  };

  return (
    <div className="p-4">
      <h3 className="text-xl font-medium text-gray-800 mb-4">Filter</h3>

      {/* Category Filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Category</label>
        {categories.map((category) => (
          <div key={category} className="flex items-center mb-1">
            <input
              type="radio"
              name="category"
              value={category}
              onChange={handleFilterChange}
              checked={filters.category === category}
              className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300"
            />
            <span className="text-gray-700">{category}</span>
          </div>
        ))}
      </div>

      {/* Age Filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Age Group</label>
        {ageGroups.map((age) => (
          <div key={age} className="flex items-center mb-1">
            <input
              type="checkbox"
              name="age"
              value={age}
              onChange={handleFilterChange}
              checked={filters.age.includes(age)}
              className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300"
            />
            <span className="text-gray-700">{age}</span>
          </div>
        ))}
      </div>

      {/* Occasion Filter */}
      <div className="mb-6">
        <label className="block text-gray-600 font-medium mb-2">Occasion</label>
        {occasions.map((occasion) => (
          <div key={occasion} className="flex items-center mb-1">
            <input
              type="checkbox"
              name="occasion"
              value={occasion}
              onChange={handleFilterChange}
              checked={filters.occasion.includes(occasion)}
              className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300"
            />
            <span className="text-gray-700">{occasion}</span>
          </div>
        ))}
      </div>

      {/* Price Range Filter */}
      <div className="mb-8">
        <label className="block text-gray-600 font-medium mb-2">Price Range</label>
        <input
          type="range"
          name="priceRange"
          min={0}
          max={10000}
          value={priceRange[1]}
          onChange={handlePriceChange}
          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-gray-600 mt-2">
          <span>0</span>
          <span>{priceRange[1]}</span>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
