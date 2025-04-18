import React from "react";

const Topbar = () => {
  return (
    <div className="bg-blue-950 text-white">
      <div className="container mx-auto flex justify-between items-center py-3 px-4">

        {/* Center - Tagline */}
        <div className="text-sm text-center flex-grow">
          <span>All kinds of unique gifts for your loved ones!</span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
