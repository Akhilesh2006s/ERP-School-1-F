import React from 'react';

const BrandingFooter = () => {
  return (
    <div className="mt-12 mb-6 text-center">
      <div className="inline-flex flex-col items-center bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-2xl px-8 py-4 border border-purple-500/30 shadow-lg">
        <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Amenity Forge
        </div>
        <div className="text-sm text-gray-700 font-medium mt-1">
          Emerging from The Times Group Initiative ecosystem
        </div>
      </div>
    </div>
  );
};

export default BrandingFooter;
