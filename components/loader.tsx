import React from 'react';

const CircleLoader = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></div>
    </div>
  );
};

export default CircleLoader;