import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#1e2a30] p-4 relative">
      {/* Logo absolutely positioned relative to the full screen container */}
      <div className="absolute top-4 left-4 z-10">
        <img 
          src="/images/logo.png" 
          alt="Logo" 
          className="h-8 sm:h-10"
        />
      </div>
      
      <div className="flex items-center justify-center h-full">
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden mt-16 sm:mt-24">
          <div className="p-4 sm:p-6 pt-8 sm:pt-10 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-3 sm:mb-4 flex justify-center">
              <span className="text-[#8bc34a]">4</span>
              <span className="text-white" style={{color: 'white'}}>0</span>
              <span className="text-[#8bc34a]">4</span>
            </h1>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#36474f] mb-4 sm:mb-6">Page Not Found</h2>
            <p className="text-sm sm:text-base text-[#36474f] mb-6 sm:mb-8">
              The page you are looking for doesn't exist or has been moved.
            </p>
            <div className="w-12 sm:w-16 h-1 bg-[#36474f] mx-auto mb-6 sm:mb-8"></div>
            <p className="text-xs sm:text-sm text-[#36474f]">
              If you believe this is a mistake, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;