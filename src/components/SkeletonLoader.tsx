// components/SkeletonLoader.tsx
import React from 'react';
import { motion } from 'framer-motion';

export const SkeletonLoader: React.FC<{ 
  type?: 'card' | 'list' | 'chart' | 'text' | 'image';
  count?: number;
  className?: string;
}> = ({ type = 'card', count = 1, className = '' }) => {
  const items = Array.from({ length: count }, (_, i) => i);
  
  const SkeletonItem = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-gray-700 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-600 rounded w-1/2 mb-4"></div>
            <div className="h-2 bg-gray-600 rounded w-full mb-1"></div>
            <div className="h-2 bg-gray-600 rounded w-5/6"></div>
          </div>
        );
      
      case 'chart':
        return (
          <div className="bg-gray-700 rounded-lg p-4 h-64 flex items-center justify-center animate-pulse">
            <div className="text-gray-400">Loading chart...</div>
          </div>
        );
      
      case 'text':
        return (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-600 rounded w-full"></div>
            <div className="h-4 bg-gray-600 rounded w-5/6"></div>
            <div className="h-4 bg-gray-600 rounded w-4/6"></div>
          </div>
        );
      
      case 'image':
        return (
          <div className="bg-gray-600 rounded-lg w-full h-32 animate-pulse"></div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {items.map((item) => (
        <motion.div
          key={item}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: item * 0.1 }}
        >
          <SkeletonItem />
        </motion.div>
      ))}
    </div>
  );
};