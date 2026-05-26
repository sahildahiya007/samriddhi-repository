import React, { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, Download, FileText, MapPin, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const LuxuryDetailsPage = ({ property, onClose, onCall }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const galleryImages = (property.gallery || []).filter(Boolean);
  const heroImage = galleryImages[0] || property.image || '';
  const floorPlans = property.floorPlans || [];
  const priceList = property.priceList || [];
  const highlights = property.highlights || [];
  const amenities = property.amenities || [];
  const locationPoints = property.nearbyPlaces || [];
  const heroHeight = windowWidth < 768 ? 46 : 52;

  const handleSubmit = (event) => {
    event.preventDefault();
    setShowConfirmation(true);
  };

  const imageCount = galleryImages.length || 3;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full min-h-[46vh] md:min-h-[60vh] bg-slate-950">
        {heroImage ? (
          <img
            src={heroImage}
            alt={property.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.src = '';
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 text-center">
            <div>
              <p className="text-sm uppercase tracking-[0.26em] text-amber-200 mb-3">Photography coming soon</p>
              <h1 className="text-3xl font-semibold text-white">Elan The Emperor</h1>
              <p className="mt-3 text-sm text-slate-300 max-w-xl">
                A premium visual space has been reserved here; image URLs can be added later to complete the experience.
              </p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />

        <button
          onClick={onClose}
          className="absolute left-5 top-5 z-20 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg transition hover:scale-105"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 pt-8">
          <div className="mx-auto max-w-7xl rounded-[30px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-4 text-white">
                <div className="flex flex-wrap items-center gap-3">
                  {property.badge && <span className="rounded-full bg-amber-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-950">{property.badge}</span>}
                  {property.status && <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-200">{property.status}</span>}
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-amber-200">{property.subtitle}</p>
                  <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">{property.title}</h1>
                  <p className="mt-2 max-w-2xl text-sm text-slate-300">{property.tagline}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-slate-200">
                  <span className="inline-flex items-center gap-2 text-sm">
                    <MapPin size={16} /> {property.location}
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm">
                    <Star size={16} className="text-amber-300" /> {property.rating || 4.9} Premium
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setCurrentImageIndex(0)}
                  className="rounded-[18px] bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-950 transition hover:bg-slate-100"
                >
                  <FileText size={16} /> Get Floor Plan
                </button>
                <button
                  onClick={() => setShowConfirmation(true)}
                  className="rounded-[18px] bg-gradient-to-r from-amber-500 to-yellow-400 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-950 shadow-lg shadow-amber-300/30 transition hover:shadow-xl"
                >
                  Request Price
                </button>
                <button
                  onClick={() => onCall && onCall(property)}
                  className="rounded-[18px] border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white/15"
                >
                  <CalendarDays size={16} /> Book Site Visit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative -mt-[44px] bg-white pt-10"
        style={{ maxHeight: `calc(100vh - ${heroHeight}vh)`, overflowY: 'auto' }}
      >
        <div className="mx-auto max-w-7xl px-5 pb-28 md:px-8">
          <div className="grid gap-10 xl:grid-cols-[1.65fr_0.95fr]">
            <div className="space-y-10">
              <section className="grid gap-6 rounded-[32px] border border-slate-200/70 bg-slate-50 p-8 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.26em] text-amber-600">Overview</p>
                    <h2 className="mt-3 text-3xl font-semibold text-slate-950">A premium luxury residence crafted for executive living.</h2>
                  </div>
                  <div className="rounded-[24px] bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
                    Starting at {property.startingPrice}
                  </div>
                </div>
                <p className="text-base leading-relaxed text-slate-700">{property.details}</p>
              </section>

              <section className="grid gap-8">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[28px] border border-slate-200 p-6">
                    <h3 className="text-xl font-semibold text-slate-950">About Project</h3>
                    <p className="mt-4 text-slate-700">{property.detailsSections?.[0]?.text}</p>
                  </div>
                  <div className="rounded-[28px] border border-slate-200 p-6">
                    <h3 className="text-xl font-semibold text-slate-950">Location Overview</h3>
                    <p className="mt-4 text-slate-700">{property.detailsSections?.[1]?.text}</p>
                  </div>
                </div>

                <div className="rounded-[32px] border border-slate-200 bg-white p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-amber-600">Amenities</p>
                      <h3 className="mt-3 text-2xl font-semibold text-slate-950">Curated lifestyle facilities</h3>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">6 features</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {amenities.map((amenity) => (
                      <div key={amenity} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-slate-800 shadow-sm transition hover:border-amber-300 hover:bg-white">
                        <p className="font-semibold">{amenity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[32px] border border-slate-200 bg-white p-6">
                  <h3 className="text-xl font-semibold text-slate-950">Project Highlights</h3>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {highlights.map((item) => (
                      <div key={item} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-slate-700 shadow-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[32px] border border-slate-200 bg-white p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-amber-600">Image Gallery</p>
                      <h3 className="mt-3 text-2xl font-semibold text-slate-950">Visual story</h3>
                    </div>
                    <span className="text-sm text-slate-500">Photos reserved for later</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {[...Array(imageCount)].map((_, idx) => {
                      const src = galleryImages[idx] || '';
                      return (
                        <div key={idx} className="min-h-[180px] overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 text-white shadow-sm">
                          {src ? (
                            <img src={src} alt={`${property.title} gallery ${idx + 1}`} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center px-4 py-8 text-center text-sm text-slate-300">
                              <div>
                                <p className="font-semibold">Photo slot reserved</p>
                                <p className="mt-2">Upload the image URL here later to complete the gallery.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-amber-600">Floor Plans</p>
                      <h3 className="mt-3 text-2xl font-semibold text-slate-950">Spacious configurations</h3>
                    </div>
                    <button className="rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-50">
                      Get Floor Plan
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {floorPlans.map((plan) => (
                      <div key={`${plan.label}-${plan.size}`} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{plan.label}</p>
                        <p className="mt-3 text-lg font-semibold text-slate-900">{plan.size}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[32px] border border-slate-200 bg-white p-6">
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-amber-600">Price List</p>
                      <h3 className="mt-3 text-2xl font-semibold text-slate-950">Fine-tuned pricing</h3>
                    </div>
                    <button className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-5 py-2 text-sm font-semibold uppercase text-slate-950 shadow-lg shadow-amber-200/50 transition hover:shadow-xl">
                      Request Price
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-[28px] border border-slate-200">
                    <table className="min-w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-100 text-slate-600">
                        <tr>
                          <th className="px-5 py-4 font-semibold">Unit</th>
                          <th className="px-5 py-4 font-semibold">Size</th>
                          <th className="px-5 py-4 font-semibold">Indicative Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {priceList.map((item) => (
                          <tr key={`${item.unit}-${item.size}`} className="border-t border-slate-200/70 hover:bg-slate-50">
                            <td className="px-5 py-4 font-medium text-slate-900">{item.unit}</td>
                            <td className="px-5 py-4">{item.size}</td>
                            <td className="px-5 py-4 font-semibold text-slate-950">{item.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-8 text-white">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Brochure</p>
                      <h3 className="mt-2 text-2xl font-semibold">Download the project brochure</h3>
                    </div>
                    <button className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 uppercase tracking-[0.12em] transition hover:bg-slate-100">
                      <Download size={18} /> Download Brochure
                    </button>
                  </div>
                  <p className="mt-4 max-w-2xl text-sm text-slate-300">The brochure offers a premium property overview, configuration matrix and concierge-level purchase guidance.</p>
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.3em] text-amber-600">Enquiry Form</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Book your private consultation</h2>
                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-700">Email</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="example@mail.com"
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-700">Phone</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91 9XXXXXXXXX"
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">Message</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us your preferred visit slot or property query"
                      className="min-h-[120px] w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-[22px] bg-gradient-to-r from-amber-500 to-yellow-400 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-950 shadow-lg shadow-amber-300/30 transition hover:shadow-xl"
                  >
                    Request Price
                  </button>
                </form>
                {showConfirmation && (
                  <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                    Thank you for your request. Our luxury team will contact you to schedule the next step.
                  </div>
                )}
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-amber-600">Location strengths</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">Connectivity & context</h3>
                <div className="mt-6 space-y-3">
                  {locationPoints.map((point) => (
                    <div key={point.name} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-3">
                      <span className="text-sm font-medium text-slate-900">{point.name}</span>
                      <span className="text-sm text-slate-500">{point.distance}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LuxuryDetailsPage;
import React, { useState } from 'react';
import { ArrowLeft, Heart, Phone, MessageCircle, ChevronLeft, ChevronRight, MapPin, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LuxuryDetailsPage = ({ property, onClose, onCall }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentFloorPlanIndex, setCurrentFloorPlanIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  );

  React.useEffect(() => {
    const handler = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const images = property.images || [property.image];
  const floorPlans = property.floorPlans || [];
  const heroHeight = windowWidth < 768 ? 46 : 52;

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
      className="fixed inset-0 bg-black/50 z-50 overflow-hidden"
    >
      {/* Hero Image Section */}
      <div className="relative w-full min-h-[46vh] md:min-h-[60vh] bg-gray-900">
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
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {property.badge && (
              <div className="inline-flex items-center rounded-full bg-orange-500 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-white">
                {property.badge}
              </div>
            )}
            {property.status && (
              <div className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold text-white">
                {property.status}
              </div>
            )}
          </div>
          <h1 className="text-white text-4xl font-bold mb-2">{property.title}</h1>
          <p className="text-gray-200 text-sm mb-2">{property.subtitle || property.location}</p>
          {property.typeText && <p className="text-orange-100 text-sm mb-3">{property.typeText}</p>}
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
        className="relative bg-white rounded-t-[32px] -mt-[40px]"
        style={{
          maxHeight: `calc(100vh - ${heroHeight}vh)`,
          overflowY: 'auto',
        }}
      >
        <div className="mx-auto mt-4 mb-6 h-1.5 w-16 rounded-full bg-gray-300" />
        <div className="px-[22px] pb-[120px]">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.3fr_0.85fr]">
            <div className="space-y-8">
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
                {property.detailsSections ? (
                  <div className="space-y-6 text-gray-700 text-[15px] leading-relaxed">
                    {property.detailsSections.map((section, idx) => (
                      <div key={idx}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.heading}</h3>
                        <p className="whitespace-pre-wrap">{section.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed text-[15px]">
                    {property.details ||
                      'Premium luxury apartment with world-class amenities, located in the heart of the city. Experience sophisticated living with premium finishes and exclusive facilities.'}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-8">
              {/* Property Details Grid */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Property Details</h2>
                <div className="grid grid-cols-1 gap-0 md:grid-cols-2 lg:grid-cols-3">
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
                      className="py-[14px] border-b border-gray-200 px-2 lg:border-r lg:last:border-r-0 lg:last:border-b-0"
                    >
                      <p className="text-gray-500 text-[13px] font-semibold mb-1">{detail.label}</p>
                      <p className="text-gray-900 font-bold text-[16px]">{detail.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unit Configurations */}
              {property.unitConfigs && property.unitConfigs.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4 text-gray-900">Unit Configurations</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {property.unitConfigs.map((config, idx) => (
                      <div key={idx} className="rounded-2xl border border-gray-200 p-4 bg-gray-50">
                        <p className="text-gray-500 text-sm font-semibold">{config.type}</p>
                        <p className="text-gray-900 font-bold mt-2">{config.size}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nearby Section */}
              <div className="mb-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
            </div>
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
