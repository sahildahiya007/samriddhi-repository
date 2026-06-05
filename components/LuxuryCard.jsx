import React, { useState } from 'react';
import { Heart, MapPin, PhoneCall } from 'lucide-react';
import { motion } from 'framer-motion';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1480074568153-71f5dcb01d5c?auto=format&fit=crop&w=800&q=80';

const LuxuryCard = ({ property, onViewDetails, onCall }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = property.images?.length ? property.images : [property.image || FALLBACK_IMAGE];

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.35 }} className="w-full">
      <div className="relative h-full overflow-hidden rounded-[26px] bg-white shadow-lg">
        <div className="relative aspect-[4/3] w-full">
          <motion.img
            src={images[currentImageIndex]}
            alt={property.title}
            className="h-full w-full rounded-t-[26px] object-cover"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.35 }}
            onError={(event) => {
              event.currentTarget.src = FALLBACK_IMAGE;
            }}
          />

          <div className="absolute inset-x-0 bottom-0 h-[150px] bg-gradient-to-t from-black/75 to-transparent" />

          <button
            type="button"
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="absolute left-[18px] top-[18px] flex h-[46px] w-[46px] items-center justify-center rounded-full bg-white shadow-md transition hover:scale-105"
            aria-label="Save property"
          >
            <Heart size={23} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'} />
          </button>

          <div className="absolute right-[18px] top-[18px] flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-white/80" />
            <span className="h-3 w-3 rounded-full bg-white/65" />
            <span className="h-3 w-3 rounded-full bg-white/45" />
          </div>

          <div className={`absolute left-[18px] top-[70px] flex h-[34px] items-center rounded-full px-4 text-[13px] font-bold text-white ${property.type === 'rent' ? 'bg-green-600' : 'bg-orange-500'}`}>
            {property.type === 'rent' ? 'FOR RENT' : 'FOR SALE'}
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-[18px] left-1/2 flex -translate-x-1/2 gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`h-2 w-2 rounded-full transition ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                  aria-label={`Show image ${idx + 1}`}
                />
              ))}
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 p-[22px] text-white">
            {property.badge && (
              <div className="mb-3 inline-flex items-center rounded-full bg-orange-500/95 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.14em]">
                {property.badge}
              </div>
            )}
            <h3 className="line-clamp-2 text-[28px] font-bold leading-tight md:text-[34px]">{property.title}</h3>
            <p className="mb-2 mt-3 text-[14px] text-orange-100">{property.subtitle || property.location}</p>
            {property.typeText && <p className="mb-4 text-[15px] text-white/90">{property.typeText}</p>}
            <p className="text-[24px] font-bold">{property.price || property.startingPrice}</p>
          </div>
        </div>

        <div className="flex h-[72px] gap-[14px] p-[18px]">
          <button
            type="button"
            onClick={() => onCall && onCall(property)}
            className="flex flex-1 items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-orange-500 to-orange-600 text-[18px] font-semibold text-white shadow-md transition hover:shadow-lg"
          >
            <PhoneCall size={20} />
            Call
          </button>
          <button
            type="button"
            onClick={() => onViewDetails && onViewDetails(property)}
            className="flex flex-1 items-center justify-center gap-2 rounded-[16px] border border-gray-200 bg-white text-[18px] font-semibold text-gray-900 transition hover:bg-gray-100"
          >
            <MapPin size={19} />
            Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default LuxuryCard;
