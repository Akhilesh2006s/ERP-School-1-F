import React from 'react';

const BrandingFooter = () => {
  return (
    <div className="mt-12 mb-6 text-center bg-red-100 border-2 border-red-500 p-4 rounded-lg">
      <div className="text-lg font-bold text-red-900">
        <a 
          href="https://amenityforge.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-red-700 hover:underline transition-colors cursor-pointer"
        >
          Amenity Forge
        </a>
        {' – Emerging from The Times Group Initiative ecosystem'}
      </div>
      <div className="text-sm text-red-700 mt-2">DEBUG: BrandingFooter is rendering</div>
    </div>
  );
};

export default BrandingFooter;
