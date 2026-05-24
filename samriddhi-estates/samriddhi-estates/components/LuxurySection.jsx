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
import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import LuxurySlider from './LuxurySlider';
import LuxuryDetailsPage from './LuxuryDetailsPage';

const LuxurySection = () => {
  const JSON_PROPERTIES_PATH = '/data/properties.json';
  const SHEET_API_URL =
    (import.meta.env.VITE_SHEET_API_URL || import.meta.env.NEXT_PUBLIC_SHEET_API_URL || '').trim();
  const FALLBACK_IMAGE_URL =
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80';
  const [luxuryProperties, setLuxuryProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLuxuryProperties();
  }, []);

  const fetchLuxuryProperties = async () => {
    try {
      setLoading(true);
      if (SHEET_API_URL) {
        const sheetRes = await fetch(SHEET_API_URL);
        if (!sheetRes.ok) {
          throw new Error(`Sheet request failed (${sheetRes.status})`);
        }
        const rows = await sheetRes.json();
        const luxuryFromSheet = (Array.isArray(rows) ? rows : [])
          .filter((row) => String(row?.is_active || '').toLowerCase() === 'true')
          .map((row, index) => {
            const gallery = String(row.gallery_images || '')
              .split('|')
              .map((img) => img.trim())
              .filter(Boolean);
            const cover = String(row.cover_image || '').trim() || FALLBACK_IMAGE_URL;
            const mappedType = /rent/i.test(String(row.type || '')) ? 'rent' : 'sale';
            const features = String(row.features || '')
              .split(/[|,]/)
              .map((item) => item.trim())
              .filter(Boolean);
            return {
              id: String(row.id || `sheet-${index + 1}`),
              slug: row.slug || `property-${index + 1}`,
              title: row.title || 'Untitled Property',
              price: row.price || '',
              type: mappedType,
              listingType: row.type || '',
              location: row.location || 'Gurgaon',
              address: row.location || 'Gurgaon',
              image: cover,
              images: [cover, ...gallery].filter(Boolean),
              details: row.description || '',
              amenities: features,
              highlights: features,
              bedrooms: Number(row.bhk) || null,
              area: row.area_sqft || '',
              status: row.status || '',
              builder: row.builder || '',
              isLuxury: /luxury/i.test(String(row.type || '')),
              callNumber: String(row.call_number || '').replace(/\D/g, '') || '918398979897',
              whatsappNumber:
                String(row.whatsapp_number || '').replace(/\D/g, '') ||
                String(row.call_number || '').replace(/\D/g, '') ||
                '918398979897',
              contacts: {
                sales: `+${String(row.call_number || '').replace(/\D/g, '') || '918398979897'}`,
              },
            };
          })
          .filter((p) => p.isLuxury);
        if (luxuryFromSheet.length) {
          setLuxuryProperties(luxuryFromSheet.slice(0, 10));
          console.log('Loaded from Google Sheet');
          return;
        }
      }
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
      const luxury = list.filter((p) => p.isLuxury === true || String(p.type || '').toLowerCase() === 'luxury');
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
