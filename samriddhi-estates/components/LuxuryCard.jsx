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
