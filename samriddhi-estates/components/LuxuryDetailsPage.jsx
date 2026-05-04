import React, { useState } from 'react';
import { ArrowLeft, Heart, Phone, MessageCircle, ChevronLeft, ChevronRight, MapPin, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LuxuryDetailsPage = ({ property, onClose, onCall }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);

  const images = property.images || [property.image];

  const highlights = property.highlights || [
    'Clubhouse',
    'Private Lift',
    'Infinity Pool',
    'Sky Deck',
    'Servant Room',
    'Smart Home',
  ];

  const nearbyPlaces = property.nearbyPlaces || [
    { name: 'Metro', distance: '0.5 km' },
    { name: 'Mall', distance: '1.2 km' },
    { name: 'School', distance: '0.8 km' },
    { name: 'Hospital', distance: '1.5 km' },
    { name: 'Highway', distance: '2.4 km' },
  ];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 overflow-y-auto"
    >
      {/* Hero Image Section */}
      <div className="relative w-full bg-gray-900" style={{ height: window.innerWidth < 768 ? '46vh' : '60vh' }}>
        <img
          src={images[currentImageIndex]}
          alt={property.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80';
          }}
        />

        {/* Image Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-[18px] top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full transition"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-[18px] top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full transition"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Back Button */}
        <button
          onClick={onClose}
          className="absolute top-[18px] left-[18px] w-[52px] h-[52px] bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition z-20"
        >
          <ArrowLeft size={24} className="text-gray-800" />
        </button>

        {/* Wishlist Button */}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-[18px] right-[18px] w-[52px] h-[52px] bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition z-20"
        >
          <Heart
            size={24}
            className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}
          />
        </button>

        {/* Image Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition ${
                  idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Luxury Badge & Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-20 pb-8 px-6">
          <div className="inline-block bg-yellow-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
            LUXURY PROPERTY
          </div>
          <h1 className="text-white text-4xl font-bold mb-2">{property.title}</h1>
          <p className="text-gray-200 flex items-center gap-2">
            <MapPin size={18} />
            {property.address}
          </p>
          {property.rating && (
            <div className="flex items-center gap-2 mt-2 text-yellow-400">
              <Star size={18} className="fill-yellow-400" />
              <span className="text-white font-semibold">{property.rating} Rating</span>
            </div>
          )}
        </div>
      </div>

      {/* White Details Container */}
      <motion.div
        initial={{ y: 26 }}
        animate={{ y: -26 }}
        className="relative bg-white rounded-t-[32px] -mt-[26px] pt-[22px] px-[22px] pb-[120px]"
      >
        {/* Highlights Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Highlights</h2>
          <div className="flex flex-wrap gap-[10px]">
            {highlights.map((highlight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="h-[42px] rounded-full bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 px-4 flex items-center text-orange-700 font-semibold text-[14px]"
              >
                {highlight}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Overview Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3 text-gray-900">Overview</h2>
          <p className="text-gray-700 leading-relaxed text-[15px]">
            {property.details ||
              'Premium luxury apartment with world-class amenities, located in the heart of the city. Experience sophisticated living with premium finishes and exclusive facilities.'}
          </p>
        </div>

        {/* Property Details Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Property Details</h2>
          <div
            className="grid gap-0"
            style={{
              gridTemplateColumns: window.innerWidth < 768 ? '1fr' : window.innerWidth < 1024 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            }}
          >
            {[
              { label: 'Type', value: property.type === 'sale' ? 'Apartment' : 'Flat' },
              { label: 'Bedrooms', value: `${property.bedrooms || 3} BHK` },
              { label: 'Bathrooms', value: `${property.bathrooms || 2}` },
              { label: 'Built-up Area', value: `${property.area || '1,850'} sq ft` },
              { label: 'Floor', value: property.floor || '8 of 20' },
              { label: 'Furnishing', value: property.furnishing || 'Furnished' },
              { label: 'Parking', value: property.parking || '1 Covered' },
              { label: 'RERA Number', value: property.reraNumber || 'HRERA-1234-5678' },
              { label: 'Facing', value: property.facing || 'East' },
            ].map((detail, idx) => (
              <div
                key={idx}
                className="py-[14px] border-b border-gray-200 px-2"
                style={{
                  borderRight: window.innerWidth < 1024 && idx % 2 === 0 ? '1px solid #e5e7eb' : 'none',
                }}
              >
                <p className="text-gray-500 text-[13px] font-semibold mb-1">{detail.label}</p>
                <p className="text-gray-900 font-bold text-[16px]">{detail.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Nearby Locations</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {nearbyPlaces.map((place, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg text-center hover:shadow-md transition"
              >
                <p className="text-gray-700 font-semibold text-[14px]">{place.name}</p>
                <p className="text-orange-600 font-bold text-[13px] mt-1">{place.distance}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Sticky Bottom Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center justify-between z-40"
        style={{
          height: '88px',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.1)',
        }}
      >
        <div>
          <p className="text-gray-500 text-sm">Price</p>
          <p className="text-[28px] font-bold text-gray-900">{property.price}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onCall && onCall(property)}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-[16px] font-semibold px-6 py-3.5 flex items-center justify-center gap-2 hover:shadow-lg transition"
            style={{ boxShadow: '0 10px 20px rgba(216,122,67,0.22)' }}
          >
            <Phone size={20} />
            Call
          </button>
          <button
            onClick={() => setShowContactPopup(true)}
            className="flex-1 bg-green-500 text-white rounded-[16px] font-semibold px-6 py-3.5 flex items-center justify-center gap-2 hover:shadow-lg transition"
          >
            <MessageCircle size={20} />
            WhatsApp
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LuxuryDetailsPage;
