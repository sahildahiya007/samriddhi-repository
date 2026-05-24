import React from 'react';
import LuxuryCard from './LuxuryCard';

const LuxurySlider = ({ properties, onViewDetails, onCall }) => {
  return (
    <div className="relative w-full">
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 auto-rows-fr">
        {properties.map((property, idx) => (
          <LuxuryCard
            key={property.id || idx}
            property={property}
            onViewDetails={onViewDetails}
            onCall={onCall}
          />
        ))}
      </div>
    </div>
  );
};

export default LuxurySlider;
