import React, { useState } from 'react';
import { MapPin, PhoneCall } from 'lucide-react';
import { motion } from 'framer-motion';

const LuxuryCard = ({ property, onViewDetails, onCall }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const images = property.images?.length ? property.images : [property.image];
  const coverImage = images?.[0];

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.35 }} className="w-full">
      <div className="relative overflow-hidden rounded-[28px] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.08)] hover:shadow-[0_35px_110px_rgba(15,23,42,0.12)] transition">
        <div className="relative w-full aspect-[4/3] bg-slate-900">
          {coverImage ? (
            <motion.img
              src={coverImage}
              alt={property.title}
              className="h-full w-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.35 }}
              onError={(e) => {
                e.target.src = '';
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 text-center">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-amber-200 mb-3">Photos coming soon</p>
                <h3 className="text-xl font-semibold text-white">Image space reserved</h3>
                <p className="mt-2 text-sm text-slate-300">You can add property visuals later via URL.</p>
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent px-6 pb-6 pt-10 text-white">
            {property.badge && (
              <span className="inline-flex rounded-full bg-amber-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-950">
                {property.badge}
              </span>
            )}
            <div className="mt-3 space-y-2">
              <p className="text-[11px] uppercase tracking-[0.28em] text-amber-200">{property.subtitle}</p>
              <h3 className="text-[26px] font-semibold leading-tight">{property.title}</h3>
              {property.tagline && <p className="text-sm text-amber-100">{property.tagline}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[14px] text-slate-200">
                <MapPin size={16} />
                <span>{property.location}</span>
              </div>
              <p className="mt-4 text-[22px] font-semibold text-white">{property.price}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-5 sm:flex-row">
          <button
            onClick={() => onCall && onCall(property)}
            className="flex-1 rounded-[18px] bg-gradient-to-r from-amber-500 to-yellow-400 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-950 shadow-lg shadow-amber-200/30 transition hover:shadow-xl"
          >
            <PhoneCall size={18} /> Call
          </button>

          <button
            onClick={() => onViewDetails && onViewDetails(property)}
            className="flex-1 rounded-[18px] border border-slate-200 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-900 transition hover:bg-slate-50"
          >
            Know More
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default LuxuryCard;
import React, { useState } from 'react';
import { Heart, MapPin, PhoneCall } from 'lucide-react';
import { motion } from 'framer-motion';

const LuxuryCard = ({ property, onViewDetails, onCall }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = property.images || [property.image];

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.35 }}
      className="w-full"
    >
      <div className="relative bg-white rounded-[26px] overflow-hidden shadow-lg h-full">
        {/* Image Container */}
        <div className="relative w-full aspect-[4/3]">
          {/* Image with hover zoom */}
          <motion.img
            src={images[currentImageIndex]}
            alt={property.title}
            className="w-full h-full object-cover rounded-t-[26px]"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.35 }}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1480074568153-71f5dcb01d5c?auto=format&fit=crop&w=800&q=80';
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-[120px] bg-gradient-to-t from-black/70 to-transparent"></div>

          {/* Wishlist Button */}
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="absolute top-[18px] left-[18px] w-[46px] h-[46px] rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition"
          >
            <Heart
              size={24}
              className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}
            />
          </button>

          {/* Top Dots */}
          <div className="absolute top-[18px] right-[18px] flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-white/80" />
            <span className="w-3 h-3 rounded-full bg-white/70" />
            <span className="w-3 h-3 rounded-full bg-white/50" />
          </div>

          {/* Type Badge */}
          <div
            className={`absolute top-[70px] left-[18px] h-[34px] px-4 rounded-full text-white font-bold text-[13px] flex items-center ${
              property.type === 'sale' ? 'bg-orange-500' : 'bg-green-600'
            }`}
          >
            {property.type === 'sale' ? 'FOR SALE' : 'FOR RENT'}
          </div>

          {/* Carousel Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-[18px] left-1/2 transform -translate-x-1/2 flex gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition ${
                    idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Text Overlay on Image Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-[22px] text-white">
            {property.badge && (
              <div className="inline-flex items-center rounded-full bg-orange-500/95 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.14em] mb-3">
                {property.badge}
              </div>
            )}
            <h3 className="text-[28px] md:text-[34px] font-bold mb-3 leading-tight line-clamp-2">
              {property.title}
            </h3>
            <p className="text-[14px] text-orange-100 mb-2">
              {property.subtitle || property.location}
            </p>
            {property.typeText && <p className="text-[15px] text-white/90 mb-4">{property.typeText}</p>}
            <p className="text-[24px] font-bold">{property.price}</p>
          </div>
        </div>

        {/* Button Section */}
        <div className="p-[18px] flex gap-[14px] h-[72px]">
          <button
            onClick={() => onCall && onCall(property)}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-[16px] font-semibold text-[20px] flex items-center justify-center gap-2 hover:shadow-lg transition shadow-md"
            style={{
              boxShadow: '0 10px 20px rgba(216,122,67,0.22)',
            }}
          >
            <PhoneCall size={20} />
            Call
          </button>
          <button
            onClick={() => onViewDetails && onViewDetails(property)}
            className="flex-1 bg-white text-gray-900 rounded-[16px] font-semibold text-[20px] flex items-center justify-center gap-2 hover:bg-gray-100 transition border border-gray-200"
          >
            👁 Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default LuxuryCard; 
