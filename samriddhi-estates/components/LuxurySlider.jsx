import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import LuxuryCard from './LuxuryCard';

const LuxurySlider = ({ properties, onViewDetails, onCall }) => {
  const scrollContainer = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainer.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainer.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, [properties]);

  const scroll = (direction) => {
    if (scrollContainer.current) {
      const scrollAmount = 380;
      scrollContainer.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative w-full">
      {/* Scroll Container */}
      <div
        ref={scrollContainer}
        className="flex gap-[18px] overflow-x-auto scroll-smooth pb-4"
        style={{ scrollBehavior: 'smooth', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {properties.map((property, idx) => (
          <LuxuryCard
            key={property.id || idx}
            property={property}
            onViewDetails={onViewDetails}
            onCall={onCall}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      {canScrollLeft && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition"
        >
          <ChevronLeft size={24} className="text-gray-800" />
        </motion.button>
      )}

      {canScrollRight && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition"
        >
          <ChevronRight size={24} className="text-gray-800" />
        </motion.button>
      )}
    </div>
  );
};

export default LuxurySlider;
