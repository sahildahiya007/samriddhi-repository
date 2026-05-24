import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const FloorplanSlider = ({ images = [] }) => {
  const [index, setIndex] = useState(0);
  if (!images || images.length === 0) return null;

  const prev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="space-y-3">
      <div className="relative bg-gray-100 rounded-2xl overflow-hidden">
        <img
          src={images[index]}
          alt={`floorplan-${index}`}
          className="w-full h-[360px] object-contain bg-white p-6"
          onError={(e) => { e.target.src = images[0] || ''; }}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow"
              aria-label="previous floorplan"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow"
              aria-label="next floorplan"
            >
              <ChevronRight />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto py-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`flex-none w-20 h-20 rounded-lg overflow-hidden border-2 ${
                i === index ? 'border-orange-500' : 'border-gray-200'
              }`}
            >
              <img src={src} alt={`thumb-${i}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FloorplanSlider;
