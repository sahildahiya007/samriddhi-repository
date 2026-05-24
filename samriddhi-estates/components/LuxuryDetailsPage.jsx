import React, { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, Download, FileText, MapPin, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const LuxuryDetailsPage = ({ property, onClose, onCall }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
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
