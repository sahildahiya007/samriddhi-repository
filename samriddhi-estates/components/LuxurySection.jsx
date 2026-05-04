import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import LuxurySlider from './LuxurySlider';
import LuxuryDetailsPage from './LuxuryDetailsPage';

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
      // Filter for luxury properties
      const luxury = allProperties.filter((p) => p.isLuxury === true);
      setLuxuryProperties(luxury.slice(0, 10)); // Show top 10
    } catch (error) {
      console.error('Error fetching luxury properties:', error);
      // Fallback demo data
      setLuxuryProperties([
        {
          id: 101,
          title: 'Luxury Golf Course Penthouse',
          price: '₹8.5 Cr',
          type: 'sale',
          location: 'DLF Phase 5, Gurgaon',
          address: 'Tower A, DLF Phase 5, Sector 54, Gurgaon',
          image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
          images: [
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=1200&q=80',
          ],
          isLuxury: true,
          bedrooms: 4,
          bathrooms: 5,
          area: '4,500',
          floor: 'Penthouse',
          furnishing: 'Ultra Luxury',
          parking: '3 Covered',
          facing: 'North',
          rating: 4.9,
        },
        {
          id: 102,
          title: 'Premium Villa with Private Pool',
          price: '₹12 Cr',
          type: 'sale',
          location: 'Golf Course Extension, Gurgaon',
          address: 'Golf Course Extension Road, Sector 65, Gurgaon',
          image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80',
          images: [
            'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80',
          ],
          isLuxury: true,
          bedrooms: 5,
          bathrooms: 6,
          area: '6,000',
          floor: 'Ground + 2',
          furnishing: 'Ultra Luxury',
          parking: '4 Covered',
          rating: 4.8,
        },
      ]);
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
            className="overflow-x-auto -mx-5 md:-mx-10 px-5 md:px-10"
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
