import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import LuxurySlider from './LuxurySlider';
import LuxuryDetailsPage from './LuxuryDetailsPage';

const fallbackProperty = {
  id: 1,
  title: 'Elan The Emperor',
  badge: 'New Launch',
  subtitle: 'Sector 106, Gurgaon',
  typeText: '4 & 5 BHK Luxury Apartments',
  tagline: 'Retail, Food Court, Restaurants, Hotel & Multiplex',
  location: 'Dwarka Expressway, Gurgaon',
  address: 'Sector 106, Dwarka Expressway, Gurugram, Haryana',
  price: '₹10 Cr*',
  startingPrice: '₹10 Cr*',
  priceRange: '4BHK ₹10 Cr – ₹23 Cr | 5BHK ₹13.4 Cr – ₹29 Cr',
  type: 'sale',
  rating: 4.9,
  isLuxury: true,
  image: '',
  images: [],
  amenities: ['Parking', 'Golf', 'Community Hall', 'Theatre', 'Gym', 'Club House'],
  details: 'Elan The Emperor is a sculpted ultra-luxury residence on Dwarka Expressway, conceived for discerning buyers seeking private lift lobbies, expansive living spaces and service-led hospitality.',
  unitConfigs: [
    { type: '4 BHK', size: '4,223 sq.ft' },
    { type: '4 BHK', size: '4,640 sq.ft' },
    { type: '5 BHK', size: '5,434 sq.ft' },
    { type: '5 BHK', size: '5,891 sq.ft' },
    { type: 'Penthouse', size: '7,225 sq.ft' },
    { type: 'Penthouse', size: '8,053 sq.ft' },
    { type: 'Penthouse', size: '9,470 sq.ft' },
    { type: 'Penthouse', size: '10,347 sq.ft' },
  ],
  contacts: { sales: '+91 8398979897', rent: '+91 9968149329', leasing: '+91 8448660575' },
};

const LuxurySection = () => {
  const [luxuryProperties, setLuxuryProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLuxuryProperties();
  }, []);

  const fetchLuxuryProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/properties');
      const allProperties = await response.json();
      const list = Array.isArray(allProperties) ? allProperties : [];
      const luxury = list.filter((p) => p.title === 'Elan The Emperor');
      setLuxuryProperties(luxury.length > 0 ? luxury : [fallbackProperty]);
    } catch (error) {
      console.error('Error fetching luxury properties:', error);
      setLuxuryProperties([fallbackProperty]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 md:py-20 bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading Elan The Emperor listing...</div>
      </div>
    );
  }

  if (luxuryProperties.length === 0) {
    return null;
  }

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="py-10 md:py-20 bg-white px-5 md:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center md:text-left">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[38px] md:text-[48px] font-semibold text-slate-950 mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Elan The Emperor
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, delay: 0.1 }}
              animate={{ opacity: 1 }}
              className="max-w-3xl text-lg text-slate-600"
            >
              A singular ultra-luxury residence on Dwarka Expressway, designed with grand proportions, elegant finishes and a curated lifestyle canvas for premium living.
            </motion.p>
          </div>

          <div className="px-2 md:px-4">
            <LuxurySlider
              properties={luxuryProperties}
              onViewDetails={(prop) => setSelectedProperty(prop)}
              onCall={(prop) => {
                const phone = prop.contacts?.sales || '+91 9876543210';
                window.location.href = `tel:${phone}`;
              }}
            />
          </div>
        </div>
      </motion.section>

      {selectedProperty && (
        <LuxuryDetailsPage
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onCall={(prop) => {
            const phone = prop.contacts?.sales || '+91 9876543210';
            window.location.href = `tel:${phone}`;
          }}
        />
      )}
    </>
  );
};

export default LuxurySection;
