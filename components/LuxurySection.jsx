import React, { useEffect, useState } from 'react';
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

  const normalizeSheetRow = (row, index) => {
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
    const callNumber = String(row.call_number || '').replace(/\D/g, '') || '918398979897';
    const whatsappNumber =
      String(row.whatsapp_number || '').replace(/\D/g, '') || callNumber || '918398979897';

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
      callNumber,
      whatsappNumber,
      contacts: {
        sales: `+${callNumber}`,
        whatsapp: `+${whatsappNumber}`,
      },
    };
  };

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
          .map(normalizeSheetRow)
          .filter((p) => p.isLuxury);

        if (luxuryFromSheet.length) {
          setLuxuryProperties(luxuryFromSheet.slice(0, 10));
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

      const luxury = list.filter((p) => p.isLuxury === true || String(p.type || '').toLowerCase() === 'luxury');
      setLuxuryProperties(luxury.slice(0, 10));
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
      <div className="flex items-center justify-center bg-gray-50 py-12 md:py-20">
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
        className="bg-gradient-to-b from-white to-gray-50 px-5 py-8 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center md:text-left">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="mb-3 text-[42px] font-bold text-gray-900 md:text-[52px]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Luxury Properties in Gurugram
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, delay: 0.1 }}
              whileInView={{ opacity: 1 }}
              className="max-w-2xl text-[17px] text-gray-600"
            >
              Exclusive handpicked premium homes, villas, penthouses and signature residences.
            </motion.p>
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }} className="px-5 md:px-10">
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
