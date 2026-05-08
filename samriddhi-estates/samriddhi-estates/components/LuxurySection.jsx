import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import LuxurySlider from './LuxurySlider';
import LuxuryDetailsPage from './LuxuryDetailsPage';

const LuxurySection = () => {
  const JSON_PROPERTIES_PATH = '/data/properties.json';
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
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }
      const allProperties = await response.json();
      const list = Array.isArray(allProperties) ? allProperties : [];
      if (!list.length) {
        throw new Error('Empty DB');
      }
      // Filter for luxury properties
      const luxury = list.filter((p) => p.isLuxury === true);
      setLuxuryProperties(luxury.slice(0, 10)); // Show top 10
      console.log('Loaded from Supabase');
    } catch (error) {
      console.error('Error fetching luxury properties:', error);
      try {
        const fallbackResponse = await fetch(JSON_PROPERTIES_PATH);
        if (!fallbackResponse.ok) {
          throw new Error(`JSON fallback request failed (${fallbackResponse.status})`);
        }
        const fallbackData = await fallbackResponse.json();
        const fallbackList = Array.isArray(fallbackData) ? fallbackData : [];
        const luxury = fallbackList.filter((p) => p.isLuxury === true || p.type === 'Luxury');
        setLuxuryProperties(luxury.slice(0, 10));
        console.log('Loaded from JSON fallback');
      } catch (fallbackError) {
        console.error('Error fetching JSON fallback properties:', fallbackError);
        setLuxuryProperties([]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 md:py-20 bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading luxury properties...</div>
      </div>
    );
  }

  if (luxuryProperties.length === 0) {
    return null;
  }

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="py-8 md:py-20 bg-gradient-to-b from-white to-gray-50 px-5 md:px-10"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center md:text-left">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-[42px] md:text-[52px] font-bold text-gray-900 mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Luxury Properties in Gurugram
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, delay: 0.1 }}
              whileInView={{ opacity: 1 }}
              className="text-[17px] text-gray-600 max-w-2xl"
            >
              Exclusive handpicked premium homes, villas, penthouses and signature residences.
            </motion.p>
          </div>

          {/* Cards Slider */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="px-5 md:px-10"
          >
            <LuxurySlider
              properties={luxuryProperties}
              onViewDetails={(prop) => setSelectedProperty(prop)}
              onCall={(prop) => {
                const phone = prop.contacts?.sales || '+91 9876543210';
                window.location.href = `tel:${phone}`;
              }}
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Details Modal */}
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
