// src/components/Tile.jsx
import React from 'react';

const getTileClass = (value) => {
  switch (value) {
    case 2:
      return 'bg-yellow-200 text-yellow-900';
    case 4:
      return 'bg-yellow-400 text-yellow-900';
    case 8:
      return 'bg-yellow-600 text-white';
    case 16:
      return 'bg-yellow-800 text-white';
    case 32:
      return 'bg-yellow-900 text-white';
    case 64:
      return 'bg-yellow-700 text-white';
    case 128:
      return 'bg-yellow-500 text-white';
    case 256:
      return 'bg-yellow-300 text-yellow-900';
    case 512:
      return 'bg-yellow-200 text-yellow-900';
    case 1024:
      return 'bg-yellow-100 text-yellow-900';
    case 2048:
      return 'bg-yellow-50 text-yellow-900';
    default:
      return 'bg-gray-300 text-gray-700';
  }
};

const Tile = ({ value }) => {
  return (
    <div className={`flex items-center justify-center w-16 h-16 text-2xl font-bold rounded-lg border border-gray-800 ${getTileClass(value)}`}>
      {value !== 0 ? value : ''}
    </div>
  );
};

export default Tile;
