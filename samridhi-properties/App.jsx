import React, { useEffect, useRef, useState } from "react";
import {
  Phone,
  Star,
  Eye,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
  Lock,
  MapPin,
} from "lucide-react";
import Construction from "./Construction.jsx";

const colors = {
  accent: "#E8956E",
  accentSoft: "#D4A574",
  cream: "#F5E6D3",
  dark: "#1a1a1a",
  body: "#666B63",
};

const bg = {
  hero: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80",
  sale: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
  rent: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
  contact:
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?auto=format&fit=crop&w=1600&q=80",
};

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function requestApi(path, options = {}) {
  let response;
  try {
    const url = API_BASE ? `${API_BASE}${path}` : path;
    response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (err) {
    throw new Error(
      "Backend unavailable. Please start backend at http://localhost:5000 or check network connection.",
    );
  }

  if (!response.ok) {
    let message = "Request failed";
    try {
      const payload = await response.json();
      message = payload.message || message;
    } catch {
      // Keep generic fallback if response has no JSON body.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

const defaultProperties = [
  {
    id: 1,
    title: "Skyline 3BHK Residence",
    price: "Rs 1.95 Cr",
    rating: 4.9,
    type: "sale",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607688066-890987f18a86?auto=format&fit=crop&w=1200&q=80",
    ],
    location: "Golf Course Extension Road, Gurgaon",
    address: "Tower 7, Sector 65, Gurgaon, Haryana",
    amenities: ["Clubhouse", "Infinity Pool", "Gym", "3-Tier Security"],
    details: "Luxury high-floor home with skyline views and premium finishes.",
    contacts: {
      sales: "+91 9876543210",
      rent: "+91 9876543211",
      leasing: "+91 9876543212",
    },
  },
  {
    id: 2,
    title: "Urban Luxe 2BHK",
    price: "Rs 1.25 Cr",
    rating: 4.7,
    type: "sale",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1617098474202-0d0d7f60d8fd?auto=format&fit=crop&w=1200&q=80",
    ],
    location: "MG Road, Gurgaon",
    address: "Skyline Heights, Sector 28, Gurgaon, Haryana",
    amenities: ["EV Parking", "Co-working Lounge", "Kids Play Deck"],
    details: "Modern 2BHK designed for urban families and professionals.",
    contacts: {
      sales: "+91 9876543220",
      rent: "+91 9876543221",
      leasing: "+91 9876543222",
    },
  },
  {
    id: 3,
    title: "Executive 3BHK Lease",
    price: "Rs 1.6 Lakh/month",
    rating: 4.8,
    type: "rent",
    image:
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=1200&q=80",
    ],
    location: "Cyber Hub, Gurgaon",
    address: "Sector 43, Gurgaon, Haryana",
    amenities: ["Furnished", "Housekeeping", "Power Backup", "Metro Access"],
    details: "Premium lease apartment for executive living.",
    contacts: {
      sales: "+91 9876543250",
      rent: "+91 9876543251",
      leasing: "+91 9876543252",
    },
  },
  {
    id: 4,
    title: "Designer 2BHK Rental",
    price: "Rs 78,000/month",
    rating: 4.6,
    type: "rent",
    image:
      "https://images.unsplash.com/photo-1616594039964-3d0dd0b4f184?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1616594039964-3d0dd0b4f184?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80",
    ],
    location: "Sushant Lok, Gurgaon",
    address: "Sector 57, Gurgaon, Haryana",
    amenities: ["Pool", "Yoga Lawn", "Basement Parking"],
    details: "Sunlit apartment with urban Gurgaon aesthetics.",
    contacts: {
      sales: "+91 9876543260",
      rent: "+91 9876543261",
      leasing: "+91 9876543262",
    },
  },
  {
    id: 5,
    title: "Custom Villa Construction Package",
    price: "Starting at Rs 3,000/sq ft",
    rating: 4.8,
    type: "construction",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80",
    ],
    location: "New Gurgaon & Golf Course Extension",
    address: "Custom build support across Gurgaon",
    amenities: [
      "Turnkey Execution",
      "Architect Support",
      "BOQ Planning",
      "Premium Finishes",
    ],
    details:
      "End-to-end villa and custom home construction packages with planning, approvals, civil work and finishing support.",
    contacts: {
      sales: "+91 9876543290",
      rent: "+91 9876543291",
      leasing: "+91 9876543292",
    },
  },
];

const normalize = (p) => ({
  ...p,
  type: p.type || "sale",
  location: p.location || "Gurgaon",
  address: p.address || p.location || "Gurgaon",
  amenities: Array.isArray(p.amenities) ? p.amenities : [],
  images:
    Array.isArray(p.images) && p.images.length
      ? p.images
      : [p.image].filter(Boolean),
  contacts: {
    sales: p?.contacts?.sales || "+91 9876543210",
    rent: p?.contacts?.rent || "+91 9876543211",
    leasing: p?.contacts?.leasing || "+91 9876543212",
  },
});

const initialInquiryForm = {
  name: "",
  phone: "",
  time: "",
  reasonType: "Buy / Sell",
  reason: "",
};

function Navbar({ onAdminClick, hash, onNavigateHome }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { label: "Home", href: "#home" },
    { label: "For Sale", href: "#sale" },
    { label: "Rentals", href: "#rentals" },
    { label: "Construction", href: "#construction" },
    { label: "Contact", href: "#contact" },
  ];
  const currentHash = hash || window.location.hash || "#home";

  const handleAnchorClick = (href, closeMenu = false) => {
    if (closeMenu) setMenuOpen(false);
    if (href === "#home" && typeof onNavigateHome === "function") {
      onNavigateHome();
      return;
    }
    if (hash === "#construction" && href !== "#construction") {
      if (typeof onNavigateHome === "function") {
        onNavigateHome(href);
        return;
      }
    }
    window.location.hash = href;
  };

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(18px)",
        borderColor: colors.cream,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-6">
        <button
          type="button"
          onClick={() => handleAnchorClick("#home")}
          className="text-2xl md:text-3xl font-bold text-left flex-shrink-0 hover:opacity-80 transition"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: colors.dark,
          }}
        >
          Samridhi
        </button>
        <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
          {links.map((l) => {
            const isActive = currentHash === l.href;
            return (
              <button
                type="button"
                key={l.href}
                onClick={() => handleAnchorClick(l.href)}
                className="text-sm font-semibold transition-all pb-1 hover:opacity-70"
                style={{
                  color: isActive ? colors.accent : colors.body,
                  borderBottom: isActive ? `2px solid ${colors.accent}` : "2px solid transparent",
                }}
              >
                {l.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {hash && hash !== "#home" && (
            <button
              onClick={() => window.history.back()}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 md:hidden transition-all hover:bg-gray-100"
              style={{ backgroundColor: "rgba(232,149,110,0.08)" }}
              aria-label="Back"
            >
              ← Back
            </button>
          )}
          <a
            href="tel:+919876543210"
            className="px-5 md:px-7 py-2.5 rounded-xl font-semibold text-sm md:text-base inline-block text-center transition-all hover:shadow-md"
            style={{ backgroundColor: colors.accent, color: "#fff" }}
          >
            Contact
          </a>
          <button
            onClick={onAdminClick}
            className="p-2.5 rounded-lg hidden md:block transition-all hover:bg-gray-100"
            style={{
              backgroundColor: "rgba(232,149,110,0.1)",
              color: colors.accent,
            }}
            title="Admin Login"
          >
            <Lock className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden px-4 py-2 rounded-xl font-semibold transition-all hover:shadow-md"
            style={{
              backgroundColor: colors.accent,
              color: "#fff",
            }}
            aria-label="Toggle menu"
          >
            Menu
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="flex flex-col gap-2 px-4 pb-4">
          {links.map((l) => {
            const isActive = currentHash === l.href;
            return (
              <button
                type="button"
                key={l.href}
                onClick={() => handleAnchorClick(l.href, true)}
                className="text-base py-2 px-3 rounded-lg font-semibold text-left"
                style={{
                  color: isActive ? colors.accent : colors.dark,
                  backgroundColor: isActive
                    ? "rgba(232,149,110,0.1)"
                    : "transparent",
                }}
              >
                {l.label}
              </button>
            );
          })}
          <button
            onClick={onAdminClick}
            className="text-base py-2 px-3 rounded-lg font-semibold text-left flex items-center gap-2"
            style={{
              color: colors.accent,
              backgroundColor: "rgba(232,149,110,0.07)",
            }}
          >
            <Lock className="w-5 h-5" /> Admin
          </button>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  const heroRef = useRef(null);
  const [activePanel, setActivePanel] = useState(() => {
    const hash =
      typeof window !== "undefined" && window.location.hash
        ? window.location.hash
        : "#sale";
    return hash === "#rentals" || hash === "#construction" ? hash : "#sale";
  });
  const [isHeroInView, setIsHeroInView] = useState(true);
  const [panelVisible, setPanelVisible] = useState(true);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    const heroElement = heroRef.current;
    if (!heroElement || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroInView(entry.isIntersecting);
        if (!entry.isIntersecting) {
          setPanelVisible(false);
        }
      },
      { threshold: 0.18 },
    );

    observer.observe(heroElement);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!isHeroInView) return;
      setPanelVisible(false);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        if (isHeroInView) {
          setPanelVisible(true);
        }
      }, 220);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isHeroInView]);

  const panelLinks = [
    { label: "Rental", href: "#rentals" },
    { label: "Buy / Sell", href: "#sale" },
    { label: "Construction", href: "#construction" },
  ];

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(120deg, rgba(26,26,26,0.66) 0%, rgba(232,149,110,0.22) 48%, rgba(26,26,26,0.66) 100%), url('${bg.hero}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-4xl px-6 relative z-10 text-center md:text-left">
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full p-1.5 transition-all duration-300 md:bottom-8 ${
            panelVisible && isHeroInView
              ? "opacity-100 translate-y-0"
              : "pointer-events-none opacity-0 translate-y-3"
          }`}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.35)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <div className="flex items-center gap-0.5">
            {panelLinks.map((link) => {
              const isActive = activePanel === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setActivePanel(link.href)}
                  className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 md:px-7 md:py-3 md:text-base ${
                    isActive
                      ? "text-white shadow-md"
                      : "text-white/70 hover:text-white"
                  }`}
                  style={{
                    backgroundColor: isActive ? colors.accent : "transparent",
                    transform: isActive ? "scale(1.02)" : "scale(1)",
                  }}
                >
                  {link.label}
                </a>
              );
            })}
          </div>
        </div>
        <h1
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "#fff",
            textShadow: "0 10px 25px rgba(0,0,0,0.55)",
          }}
        >
          Gurgaon Luxury Living by{" "}
          <span style={{ color: colors.accent }}>Samridhi Properties</span>
        </h1>
        <p className="text-lg md:text-xl mb-10" style={{ color: "#F5F3F0" }}>
          Urban, premium, and thoughtfully curated apartments.
        </p>
      </div>
    </section>
  );
}

function ContactCard({ label, number, color }) {
  return (
    <div
      className="p-5 rounded-xl border-2"
      style={{
        borderColor: colors.cream,
        backgroundColor: "rgba(232,149,110,0.03)",
      }}
    >
      <p
        className="text-sm font-semibold mb-2 uppercase tracking-wide"
        style={{ color: colors.body }}
      >
        {label}
      </p>
      <a
        href={`tel:${number}`}
        className="flex items-center gap-2 text-lg font-bold"
        style={{ color }}
      >
        <Phone className="w-5 h-5" />
        {number}
      </a>
    </div>
  );
}

function PropertyModal({ property, isOpen, onClose }) {
  const [idx, setIdx] = useState(0);
  const swipeStartX = useRef(null);
  useEffect(() => setIdx(0), [property?.id]);
  if (!isOpen || !property) return null;

  const showPrev = () => {
    setIdx((p) => (p - 1 + property.images.length) % property.images.length);
  };

  const showNext = () => {
    setIdx((p) => (p + 1) % property.images.length);
  };

  const handleTouchStart = (event) => {
    swipeStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    const startX = swipeStartX.current;
    if (startX === null) return;
    const endX = event.changedTouches[0]?.clientX ?? startX;
    const deltaX = endX - startX;
    if (Math.abs(deltaX) > 45) {
      if (deltaX > 0) showPrev();
      else showNext();
    }
    swipeStartX.current = null;
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-none md:rounded-2xl max-w-4xl w-full h-[100dvh] md:h-auto md:max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "0 25px 50px rgba(26, 26, 26, 0.3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-10 p-2 rounded-full"
          style={{
            backgroundColor: "rgba(232,149,110,0.12)",
            color: colors.accent,
          }}
        >
          <X className="w-6 h-6" />
        </button>
        <div
          className="relative w-full h-[38vh] md:h-96 bg-gray-100 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={property.images[idx]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={showPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full hidden md:block"
            style={{ backgroundColor: "rgba(26,26,26,0.75)", color: "#fff" }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={showNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full hidden md:block"
            style={{ backgroundColor: "rgba(26,26,26,0.75)", color: "#fff" }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {property.images.map((_, imageIndex) => (
              <span
                key={imageIndex}
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    imageIndex === idx ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)",
                }}
              />
            ))}
          </div>
        </div>
        <div className="p-4 md:p-8">
          <h2
            className="text-2xl md:text-4xl font-bold mb-2"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: colors.dark,
            }}
          >
            {property.title}
          </h2>
          <p
            className="text-base md:text-lg mb-2 flex items-start gap-2"
            style={{ color: colors.body }}
          >
            <MapPin className="w-5 h-5 mt-0.5" />
            {property.location}
          </p>
          <p className="text-sm mb-4 md:mb-6" style={{ color: colors.body }}>
            {property.address}
          </p>
          <div className="flex gap-3 md:gap-4 items-center mb-4 md:mb-6">
            <span
              className="text-xl md:text-3xl font-bold px-4 md:px-6 py-2.5 md:py-3 rounded-xl"
              style={{ backgroundColor: colors.cream, color: colors.dark }}
            >
              {property.price}
            </span>
            <span
              className="flex items-center gap-2 text-base md:text-xl"
              style={{ color: colors.accent }}
            >
              <Star className="w-6 h-6 fill-current" />
              <span className="font-semibold">{property.rating}</span>
            </span>
          </div>
          <p
            className="text-lg mb-6 leading-relaxed"
            style={{ color: colors.body }}
          >
            {property.details}
          </p>
          <div className="mb-8">
            <h3
              className="text-lg font-semibold mb-3"
              style={{ color: colors.dark }}
            >
              Amenities
            </h3>
            <div className="flex flex-wrap gap-2">
              {(property.amenities || []).map((a) => (
                <span
                  key={a}
                  className="px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{ backgroundColor: colors.cream, color: colors.dark }}
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
          <div
            className="border-t-2 pt-8 mb-6"
            style={{ borderColor: colors.cream }}
          >
            <h3
              className="text-2xl font-bold mb-4"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: colors.dark,
              }}
            >
              {property.type === "sale"
                ? "Limited Availability - Contact Now"
                : "Interested? Contact Us Today"}
            </h3>
            <div
              className={`grid grid-cols-1 ${property.type === "sale" ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4`}
            >
              {property.type === "sale" && (
                <>
                  <ContactCard
                    label="For Buying"
                    number={property.contacts.sales}
                    color={colors.dark}
                  />
                  <ContactCard
                    label="For Rental"
                    number={property.contacts.rent}
                    color={colors.accent}
                  />
                  <ContactCard
                    label="For Leasing"
                    number={property.contacts.leasing}
                    color={colors.accentSoft}
                  />
                </>
              )}
              {property.type === "rent" && (
                <>
                  <ContactCard
                    label="For Renting"
                    number={property.contacts.rent}
                    color={colors.dark}
                  />
                  <ContactCard
                    label="For Leasing"
                    number={property.contacts.leasing}
                    color={colors.accent}
                  />
                </>
              )}
            </div>
          </div>
          <a
            href="#contact"
            onClick={onClose}
            className="w-full py-4 rounded-xl font-bold text-lg block text-center"
            style={{ backgroundColor: colors.accent, color: "#fff" }}
          >
            Send Inquiry
          </a>
        </div>
      </div>
    </div>
  );
}

function PropertyCard({ property, onClick }) {
  const [hover, setHover] = useState(false);
  const typeLabel =
    property.type === "sale"
      ? "For Sale"
      : property.type === "rent"
        ? "For Rent"
        : "Construction";
  return (
    <div
      className="relative overflow-hidden cursor-pointer transition-all duration-500 group rounded-[20px]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onClick(property)}
      style={{
        transform: hover ? "scale(1.015)" : "scale(1)",
        border: "1.5px solid rgba(255,255,255,0.38)",
        boxShadow: hover
          ? "0 20px 36px rgba(26,26,26,0.22)"
          : "0 6px 18px rgba(26,26,26,0.12)",
      }}
    >
      {/* Full-bleed image */}
      <div className="h-[460px] md:h-[390px] overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700"
          style={{ transform: hover ? "scale(1.06)" : "scale(1)" }}
        />
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.72) 100%)",
        }}
      />

      {/* Type badge — top left */}
      <div className="absolute top-4 left-4">
        <span
          className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
          style={{ backgroundColor: colors.accent, color: "#fff" }}
        >
          {typeLabel}
        </span>
      </div>

      {/* Bottom content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
        <h2
          className="font-bold text-3xl md:text-2xl mb-1 leading-snug"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "#fff",
            textShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          {property.title}
        </h2>
        <p
          className="text-sm mb-3 flex items-center gap-1"
          style={{ color: "rgba(255,255,255,0.82)" }}
        >
          <MapPin className="w-3.5 h-3.5" />
          {property.location}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(property.amenities || []).slice(0, 3).map((a) => (
            <span
              key={a}
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: "rgba(255,255,255,0.18)", color: "#fff", backdropFilter: "blur(6px)" }}
            >
              {a}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-current" style={{ color: colors.accent }} />
            <span className="font-semibold text-sm text-white">{property.rating}</span>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold ml-1"
              style={{ backgroundColor: "rgba(255,255,255,0.18)", color: "#fff", backdropFilter: "blur(6px)" }}
            >
              {property.price}
            </span>
          </div>
          <span className="text-xs text-white/75">Swipe for more</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <a
            href="tel:+919876543210"
            className="flex min-h-[50px] items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-center whitespace-nowrap"
            style={{ backgroundColor: colors.accent, color: "#fff" }}
            onClick={(e) => e.stopPropagation()}
          >
            Contact
          </a>
          <button
            className="flex min-h-[50px] items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold whitespace-nowrap transition-all"
            style={{
              backgroundColor: "rgba(255,255,255,0.92)",
              color: colors.dark,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onClick(property);
            }}
          >
            <Eye className="w-4 h-4" />
            Quick View
          </button>
        </div>
      </div>
    </div>
  );
}

function PropertyCarousel({ properties, onClick }) {
  const ref = useRef(null);
  const [left, setLeft] = useState(false);
  const [right, setRight] = useState(true);
  const check = () => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    setLeft(scrollLeft > 0);
    setRight(scrollLeft < scrollWidth - clientWidth - 10);
  };
  useEffect(() => {
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [properties]);
  const scroll = (direction) => {
    if (!ref.current) return;
    const firstCard = ref.current.firstElementChild;
    const cardWidth = firstCard?.getBoundingClientRect().width || 320;
    const gap = window.innerWidth < 768 ? 12 : 24;
    const amount = cardWidth + gap;
    ref.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };
  return (
    <div className="relative px-0 md:px-14">
      {left && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full hidden md:block"
          style={{ backgroundColor: "white", color: colors.accent }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      <div
        ref={ref}
        className="flex gap-3 md:gap-6 overflow-x-auto pl-3 pr-3 md:pl-0 md:pr-0"
        style={{
          scrollBehavior: "smooth",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
        }}
        onScroll={check}
      >
        {properties.map((p) => (
          <div
            key={p.id}
            className="flex-shrink-0"
            style={{ width: "clamp(250px, 70vw, 390px)", scrollSnapAlign: "start" }}
          >
            <PropertyCard property={p} onClick={onClick} />
          </div>
        ))}
      </div>
      {right && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full hidden md:block"
          style={{ backgroundColor: "white", color: colors.accent }}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

function PropertyGrid({ properties, onClick }) {
  const sale = properties.filter((p) => p.type === "sale");
  return (
    <section
      id="sale"
      className="relative py-24 px-2 md:px-6 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(249,247,244,0.93) 0%, rgba(245,243,240,0.92) 100%), url('${bg.sale}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h3
            className="text-5xl md:text-6xl font-bold mb-4"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: colors.dark,
            }}
          >
            Featured Properties
          </h3>
          <p className="text-lg" style={{ color: colors.body }}>
            Handpicked luxury apartments with Gurgaon urban vibes.
          </p>
        </div>
        {sale.length > 0 ? (
          <PropertyCarousel properties={sale} onClick={onClick} />
        ) : (
          <p className="text-center text-xl" style={{ color: colors.body }}>
            No sale properties available.
          </p>
        )}
      </div>
    </section>
  );
}

function RentalsShowcase({ properties, onClick }) {
  const rent = properties.filter((p) => p.type === "rent");
  return (
    <section
      id="rentals"
      className="relative px-2 md:px-6 py-24 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(140deg, rgba(39,39,39,0.78) 0%, rgba(53,53,53,0.8) 100%), url('${bg.rent}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-16">
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.4rem, 8vw, 4rem)",
              fontWeight: "bold",
              color: "#fff",
              marginBottom: 14,
            }}
          >
            Luxury Rental Properties
          </h2>
          <p
            style={{
              fontSize: 18,
              color: colors.cream,
              maxWidth: 640,
              margin: "0 auto",
            }}
          >
            Premium apartments for flexible, elegant city living.
          </p>
        </div>
        {rent.length > 0 ? (
          <PropertyCarousel properties={rent} onClick={onClick} />
        ) : (
          <p className="text-center text-lg" style={{ color: colors.cream }}>
            No rental properties available.
          </p>
        )}
      </div>
    </section>
  );
}

function InquiryForm({ form, onChange, onSubmit, submitting }) {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!ok) return undefined;
    const timeout = setTimeout(() => setOk(false), 3000);
    return () => clearTimeout(timeout);
  }, [ok]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(e);
      setOk(true);
    } catch (error) {
      alert(error.message || "Failed to submit inquiry");
    }
  };

  return (
    <section
      id="contact"
      className="relative py-24 px-6 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(140deg, rgba(249,247,244,0.93) 0%, rgba(245,243,240,0.92) 100%), url('${bg.contact}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h3
            className="text-5xl md:text-6xl font-bold mb-4"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: colors.dark,
            }}
          >
            Get in Touch
          </h3>
          <p className="text-lg" style={{ color: colors.body }}>
            Tell us your requirement and our brokers will respond quickly.
          </p>
        </div>
        <form
          onSubmit={submit}
          className="rounded-2xl p-10"
          style={{
            backgroundColor: "rgba(255,255,255,0.88)",
            border: "1px solid rgba(232,149,110,0.25)",
            boxShadow: "0 20px 50px rgba(26,26,26,0.1)",
          }}
        >
          <div className="mb-6">
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              required
              placeholder="Full Name"
              className="w-full border-b-2 px-4 py-4 focus:outline-none"
              style={{
                borderColor: colors.cream,
                backgroundColor: "transparent",
                color: colors.dark,
              }}
            />
          </div>
          <div className="mb-6">
            <input
              name="phone"
              value={form.phone}
              onChange={onChange}
              required
              placeholder="Phone Number"
              className="w-full border-b-2 px-4 py-4 focus:outline-none"
              style={{
                borderColor: colors.cream,
                backgroundColor: "transparent",
                color: colors.dark,
              }}
            />
          </div>
          <div className="mb-6">
            <select
              name="time"
              value={form.time}
              onChange={onChange}
              required
              className="w-full border-b-2 px-4 py-4 focus:outline-none"
              style={{
                borderColor: colors.cream,
                backgroundColor: "transparent",
                color: colors.dark,
              }}
            >
              <option value="" disabled>
                Preferred Callback Time
              </option>
              <option>Morning (9am-12pm)</option>
              <option>Afternoon (12pm-4pm)</option>
              <option>Evening (4pm-8pm)</option>
            </select>
          </div>
          <div className="mb-6">
            <p
              className="text-sm font-semibold mb-3 uppercase tracking-wide"
              style={{ color: colors.body }}
            >
              Reason for contact
            </p>
            <div
              className="p-1 rounded-2xl"
              style={{
                backgroundColor: "rgba(255,255,255,0.28)",
                border: "1px solid rgba(255,255,255,0.42)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
              {["Rent", "Buy / Sell", "Construction"].map((option) => (
                <label
                  key={option}
                  className={`rounded-xl px-4 py-3 flex items-center justify-center cursor-pointer transition ${
                    form.reasonType === option
                      ? "bg-white/70"
                      : "bg-transparent"
                  }`}
                  style={{
                    border: form.reasonType === option
                      ? "1px solid rgba(232,149,110,0.7)"
                      : "1px solid transparent",
                  }}
                >
                  <input
                    type="radio"
                    name="reasonType"
                    value={option}
                    checked={form.reasonType === option}
                    onChange={onChange}
                    className="sr-only"
                  />
                  <span
                    className="font-semibold"
                    style={{
                      color:
                        form.reasonType === option ? colors.dark : colors.body,
                    }}
                  >
                    {option}
                  </span>
                </label>
              ))}
              </div>
            </div>
          </div>
          <div className="mb-8">
            <textarea
              name="reason"
              value={form.reason}
              onChange={onChange}
              placeholder="Tell us what you need"
              className="w-full border-b-2 px-4 py-4 focus:outline-none resize-none"
              style={{
                borderColor: colors.cream,
                backgroundColor: "transparent",
                color: colors.dark,
                minHeight: 90,
              }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-4 rounded-lg font-semibold text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: colors.accent, color: "#fff" }}
          >
            {submitting ? "Submitting..." : "Submit Inquiry"}
          </button>
          {ok && (
            <div
              className="text-center font-medium mt-6 p-4 rounded-lg"
              style={{
                backgroundColor: colors.cream,
                color: colors.accentSoft,
                border: `1px solid ${colors.accent}`,
              }}
            >
              Success! We will contact you shortly.
            </div>
          )}
          <div
            className="mt-8 pt-6 border-t"
            style={{ borderColor: "rgba(232,149,110,0.25)" }}
          >
            <p className="text-sm mb-4" style={{ color: colors.body }}>
              Quick actions
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <a
                href="tel:+919876543210"
                className="text-center py-3 rounded-lg font-semibold"
                style={{ backgroundColor: colors.cream, color: colors.dark }}
              >
                Call Broker
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="text-center py-3 rounded-lg font-semibold"
                style={{ backgroundColor: "#e6f7ec", color: "#176b36" }}
              >
                WhatsApp
              </a>
              <a
                href={
                  form.reasonType === "Construction" ? "#construction" : "#sale"
                }
                className="text-center py-3 rounded-lg font-semibold"
                style={{
                  backgroundColor: "rgba(232,149,110,0.15)",
                  color: colors.accent,
                }}
              >
                {form.reasonType === "Construction"
                  ? "Open Construction"
                  : "Schedule Site Visit"}
              </a>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

function GlassPanel({ children, className = "", style = {} }) {
  return (
    <div
      className={className}
      style={{
        background: "rgba(35,35,35,0.78)",
        border: "1px solid rgba(255,255,255,0.14)",
        backdropFilter: "blur(18px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function AdminPanel({
  isOpen,
  onClose,
  properties,
  onAdd,
  onEdit,
  onDelete,
  inquiries,
  onDeleteInquiry,
}) {
  const base = {
    title: "",
    price: "",
    type: "sale",
    location: "",
    address: "",
    amenitiesText: "",
    details: "",
    images: [""],
  };
  const [tab, setTab] = useState("properties");
  const [editingId, setEditingId] = useState(null);
  const [f, setF] = useState(base);
  if (!isOpen) return null;

  const visibleProperties =
    tab === "construction"
      ? properties.filter((p) => p.type === "construction")
      : properties.filter((p) => p.type !== "construction");

  const save = async () => {
    if (!f.title || !f.price || !f.location || !f.address)
      return alert("Please fill in all required fields");
    const amenities = f.amenitiesText
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const images = f.images.filter((x) => x.trim() !== "");
    const payload = normalize({
      ...f,
      amenities,
      images,
      image: images[0],
      rating: 4.6,
      contacts: {
        sales: "+91 9876543210",
        rent: "+91 9876543211",
        leasing: "+91 9876543212",
      },
    });
    try {
      if (editingId) {
        await onEdit(editingId, payload);
        setEditingId(null);
      } else {
        await onAdd(payload);
      }
      setF(base);
    } catch (error) {
      alert(error.message || "Failed to save property");
    }
  };
  const edit = (p) =>
    setF({
      ...p,
      amenitiesText: (p.amenities || []).join(", "),
      images:
        Array.isArray(p.images) && p.images.length ? p.images : [p.image || ""],
    }) || setEditingId(p.id);
  return (
    <div className="fixed inset-0 bg-black/70 z-50 p-4 flex items-center justify-center">
      <div
        className="w-full max-w-6xl h-[90vh] rounded-2xl flex overflow-hidden"
        style={{ boxShadow: "0 30px 60px rgba(10,10,10,0.45)" }}
      >
        <GlassPanel
          className="hidden md:flex flex-col"
          style={{ width: 260, padding: 20 }}
        >
          <h4
            className="text-lg font-semibold"
            style={{ fontFamily: "'Playfair Display', serif", color: "#fff" }}
          >
            Admin
          </h4>
          <p className="text-sm mb-4" style={{ color: "#E4DED5" }}>
            Property Management
          </p>
          <button
            onClick={() => setTab("properties")}
            className="text-left px-4 py-3 rounded-lg font-semibold mb-2"
            style={{
              color: tab === "properties" ? "#fff" : "#E4DED5",
              backgroundColor:
                tab === "properties" ? "rgba(232,149,110,0.35)" : "transparent",
            }}
          >
            Properties
          </button>
          <button
            onClick={() => setTab("construction")}
            className="text-left px-4 py-3 rounded-lg font-semibold mb-2"
            style={{
              color: tab === "construction" ? "#fff" : "#E4DED5",
              backgroundColor:
                tab === "construction"
                  ? "rgba(232,149,110,0.35)"
                  : "transparent",
            }}
          >
            Construction Properties
          </button>
          <button
            onClick={() => setTab("inquiries")}
            className="text-left px-4 py-3 rounded-lg font-semibold"
            style={{
              color: tab === "inquiries" ? "#fff" : "#E4DED5",
              backgroundColor:
                tab === "inquiries" ? "rgba(232,149,110,0.35)" : "transparent",
            }}
          >
            Inquiries ({inquiries.length})
          </button>
        </GlassPanel>
        <div
          className="flex-1 overflow-hidden flex flex-col"
          style={{ backgroundColor: "rgba(24,24,24,0.85)", color: "#fff" }}
        >
          <div
            className="flex items-center justify-between p-6 border-b"
            style={{ borderColor: "rgba(255,255,255,0.15)" }}
          >
            <h2
              className="text-2xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif", color: "#fff" }}
            >
              Property Management
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full"
              style={{ backgroundColor: colors.accent, color: "#fff" }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {(tab === "properties" || tab === "construction") && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassPanel className="p-6 rounded-2xl">
                  <h3
                    className="text-xl font-bold mb-4"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: "#fff",
                    }}
                  >
                    {editingId ? "Edit Property" : "Add New Property"} (
                    {tab === "construction" ? "Construction" : "Sale/Rent"})
                  </h3>
                  <div className="space-y-3">
                    <input
                      value={f.title}
                      onChange={(e) => setF({ ...f, title: e.target.value })}
                      placeholder="Property Title"
                      className="w-full border-b-2 px-3 py-2 bg-transparent text-white focus:outline-none"
                      style={{ borderColor: "rgba(255,255,255,0.22)" }}
                    />
                    <select
                      value={f.type}
                      onChange={(e) => setF({ ...f, type: e.target.value })}
                      className="w-full border-b-2 px-3 py-2 bg-transparent text-white focus:outline-none"
                      style={{ borderColor: "rgba(255,255,255,0.22)" }}
                    >
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                      <option value="construction">Construction</option>
                    </select>
                    <input
                      value={f.price}
                      onChange={(e) => setF({ ...f, price: e.target.value })}
                      placeholder="Price"
                      className="w-full border-b-2 px-3 py-2 bg-transparent text-white focus:outline-none"
                      style={{ borderColor: "rgba(255,255,255,0.22)" }}
                    />
                    <input
                      value={f.location}
                      onChange={(e) => setF({ ...f, location: e.target.value })}
                      placeholder="Location"
                      className="w-full border-b-2 px-3 py-2 bg-transparent text-white focus:outline-none"
                      style={{ borderColor: "rgba(255,255,255,0.22)" }}
                    />
                    <input
                      value={f.address}
                      onChange={(e) => setF({ ...f, address: e.target.value })}
                      placeholder="Full Address"
                      className="w-full border-b-2 px-3 py-2 bg-transparent text-white focus:outline-none"
                      style={{ borderColor: "rgba(255,255,255,0.22)" }}
                    />
                    <input
                      value={f.amenitiesText}
                      onChange={(e) =>
                        setF({ ...f, amenitiesText: e.target.value })
                      }
                      placeholder="Amenities (comma separated)"
                      className="w-full border-b-2 px-3 py-2 bg-transparent text-white focus:outline-none"
                      style={{ borderColor: "rgba(255,255,255,0.22)" }}
                    />
                    <textarea
                      value={f.details}
                      onChange={(e) => setF({ ...f, details: e.target.value })}
                      placeholder="Description"
                      className="w-full border-b-2 px-3 py-2 bg-transparent text-white focus:outline-none"
                      style={{
                        borderColor: "rgba(255,255,255,0.22)",
                        minHeight: 80,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setF({ ...f, images: [...f.images, ""] })}
                      className="px-3 py-1 text-xs font-semibold rounded"
                      style={{ backgroundColor: colors.accent, color: "#fff" }}
                    >
                      + Add Photo
                    </button>
                    {f.images.map((img, i) => (
                      <input
                        key={i}
                        value={img}
                        onChange={(e) =>
                          setF({
                            ...f,
                            images: f.images.map((x, idx) =>
                              idx === i ? e.target.value : x,
                            ),
                          })
                        }
                        placeholder={`Photo URL ${i + 1}`}
                        className="w-full border-b-2 px-3 py-2 bg-transparent text-white focus:outline-none"
                        style={{ borderColor: "rgba(255,255,255,0.22)" }}
                      />
                    ))}
                    <div className="pt-3 flex gap-3">
                      <button
                        onClick={save}
                        className="flex-1 py-3 rounded-lg font-semibold"
                        style={{
                          backgroundColor: colors.accent,
                          color: "#fff",
                        }}
                      >
                        {editingId ? "Update" : "Add"} Property
                      </button>
                      {editingId && (
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setF(base);
                          }}
                          className="flex-1 py-3 rounded-lg font-semibold"
                          style={{
                            backgroundColor: colors.cream,
                            color: colors.dark,
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </GlassPanel>
                <div>
                  {visibleProperties.length === 0 && (
                    <GlassPanel className="p-4 mb-3 rounded-xl">
                      <p style={{ color: "#E4DED5" }}>
                        No properties available in this section yet.
                      </p>
                    </GlassPanel>
                  )}
                  {visibleProperties.map((p) => (
                    <GlassPanel key={p.id} className="p-4 mb-3 rounded-xl">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-white">
                            {p.title}
                          </h4>
                          <p className="text-sm" style={{ color: "#E4DED5" }}>
                            {p.price}
                          </p>
                          <p
                            className="text-xs mt-1 uppercase tracking-wide"
                            style={{ color: colors.cream }}
                          >
                            {p.type}
                          </p>
                        </div>
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: "rgba(232,149,110,0.16)",
                            color: "#fff",
                          }}
                        >
                          {p.location}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => edit(p)}
                          className="flex-1 py-2 text-sm rounded font-semibold"
                          style={{
                            backgroundColor: colors.accent,
                            color: "#fff",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm("Delete this property?")) {
                              try {
                                await onDelete(p.id);
                              } catch (error) {
                                alert(
                                  error.message || "Failed to delete property",
                                );
                              }
                            }
                          }}
                          className="flex-1 py-2 text-sm rounded font-semibold"
                          style={{
                            backgroundColor: "#FFE5E5",
                            color: "#C94242",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </GlassPanel>
                  ))}
                </div>
              </div>
            )}
            {tab === "inquiries" && (
              <div>
                {inquiries.length === 0 ? (
                  <p style={{ color: "#E4DED5" }}>No inquiries yet.</p>
                ) : (
                  inquiries.map((inq) => (
                    <GlassPanel key={inq.id} className="p-4 rounded-xl mb-3">
                      <h4 className="font-semibold text-lg text-white">
                        {inq.name}
                      </h4>
                      <p className="text-sm" style={{ color: colors.cream }}>
                        {inq.submittedAt}
                      </p>
                      <p className="text-sm" style={{ color: "#E4DED5" }}>
                        Phone: {inq.phone}
                      </p>
                      <p className="text-sm" style={{ color: "#E4DED5" }}>
                        Preferred Time: {inq.time}
                      </p>
                      {inq.reasonType && (
                        <p className="text-sm" style={{ color: "#E4DED5" }}>
                          Category: {inq.reasonType}
                        </p>
                      )}
                      {inq.reason && (
                        <p
                          className="text-sm p-3 rounded mt-2"
                          style={{
                            backgroundColor: "rgba(255,255,255,0.08)",
                            color: "#F5F3F0",
                          }}
                        >
                          Message: {inq.reason}
                        </p>
                      )}
                      <button
                        onClick={async () => {
                          if (confirm("Delete this inquiry?")) {
                            try {
                              await onDeleteInquiry(inq.id);
                            } catch (error) {
                              alert(
                                error.message || "Failed to delete inquiry",
                              );
                            }
                          }
                        }}
                        className="px-3 py-1 text-sm rounded font-semibold mt-2"
                        style={{ backgroundColor: "#FFE5E5", color: "#C94242" }}
                      >
                        Delete
                      </button>
                    </GlassPanel>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginSidePane({ isOpen, onClose, onLoginSuccess, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>
      <div className="fixed top-0 right-0 h-screen w-full sm:w-96 bg-white z-50 shadow-2xl overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 left-6 p-2 rounded-full"
          style={{
            backgroundColor: "rgba(232,149,110,0.1)",
            color: colors.accent,
          }}
        >
          <X className="w-6 h-6" />
        </button>
        <div className="p-8 sm:p-10 max-w-sm mx-auto pt-20">
          <h2
            className="text-4xl font-bold mb-8 text-center"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: colors.dark,
            }}
          >
            SIGN-IN
          </h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                setLoading(true);
                setError("");
                await onLogin(username, password);
                onLoginSuccess();
                setUsername("");
                setPassword("");
              } catch (err) {
                setError(
                  err.message ||
                    "Incorrect username or password. Please try again.",
                );
                setPassword("");
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-6"
          >
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-b-2 px-4 py-3 focus:outline-none"
              style={{ borderColor: colors.cream, color: colors.dark }}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b-2 px-4 py-3 focus:outline-none"
              style={{ borderColor: colors.cream, color: colors.dark }}
              required
            />
            {error && (
              <div
                className="p-3 rounded text-center text-sm font-semibold"
                style={{ backgroundColor: "#FFE5E5", color: "#C94242" }}
              >
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-semibold text-lg rounded disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: colors.accent, color: "#fff" }}
            >
              {loading ? "SIGNING IN..." : "SIGN-IN"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default function App() {
  const [properties, setProperties] = useState(
    defaultProperties.map(normalize),
  );
  const [inquiries, setInquiries] = useState([]);
  const [adminToken, setAdminToken] = useState(
    () => window.localStorage.getItem("adminToken") || "",
  );
  const [selected, setSelected] = useState(null);
  const [hash, setHash] = useState(window.location.hash || "#home");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [error, setError] = useState("");
  const [inquiryForm, setInquiryForm] = useState(initialInquiryForm);
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

  const closePropertyState = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "auto";
    setTimeout(() => setSelected(null), 200);
  };

  const requestWithAuth = (path, options = {}) => {
    if (!adminToken) {
      throw new Error("Please login as admin");
    }
    return requestApi(path, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${adminToken}`,
      },
    });
  };

  useEffect(() => {
    const load = async () => {
      try {
        const propertyData = await requestApi("/api/properties");
        setProperties(propertyData.map(normalize));
        setError("");
      } catch (err) {
        setError(err.message || "Failed to connect to backend");
      }
    };
    load();
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const nextHash = window.location.hash || "#home";
      setHash(nextHash);
      if (nextHash === "#construction") {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const openProperty = (p) => {
    setSelected(p);
    setIsModalOpen(true);
    window.history.pushState({ quickView: true }, "");
    document.body.style.overflow = "hidden";
  };

  const closeProperty = () => {
    if (window.history.state?.quickView) {
      window.history.back();
      return;
    }
    closePropertyState();
  };

  useEffect(() => {
    const onPopState = () => {
      if (isModalOpen) {
        closePropertyState();
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isModalOpen]);

  const handleInquiryChange = (e) => {
    const { name, value } = e.target;
    setInquiryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitInquiry = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    try {
      setIsSubmittingInquiry(true);
      const created = await requestApi("/api/inquiries", {
        method: "POST",
        body: JSON.stringify(inquiryForm),
      });
      setInquiries((prev) => [...prev, created]);
      setInquiryForm(initialInquiryForm);
      return created;
    } catch (submitError) {
      throw submitError;
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const navigateHome = (targetHash = "#home") => {
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    } else {
      setHash(targetHash);
    }
    requestAnimationFrame(() => {
      const id = targetHash.replace("#", "");
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  const constructionProjects = properties.map((p) => ({
    image: p.images?.[0] || p.image,
    name: p.title,
    location: p.location || p.address || "Gurgaon",
    type:
      p.type === "rent"
        ? "Residential"
        : p.type === "sale"
          ? "Residential"
          : "Construction",
    size:
      p.type === "construction"
        ? p.price || "Custom quote"
        : p.details || "Custom build support",
    status: p.type === "construction" ? "Construction" : "Featured",
  }));

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F9F7F4" }}>
      <Navbar
        onAdminClick={() => setIsLoginOpen(true)}
        hash={hash}
        onNavigateHome={navigateHome}
      />
      {hash === "#construction" ? (
        <Construction
          projects={constructionProjects}
          listedProperties={properties}
          inquiryForm={inquiryForm}
          onInquiryChange={handleInquiryChange}
          onInquirySubmit={submitInquiry}
          submitting={isSubmittingInquiry}
        />
      ) : (
        <>
          <Hero />
          <PropertyGrid properties={properties} onClick={openProperty} />
          <RentalsShowcase properties={properties} onClick={openProperty} />
          <InquiryForm
            form={inquiryForm}
            onChange={handleInquiryChange}
            onSubmit={submitInquiry}
            submitting={isSubmittingInquiry}
          />
        </>
      )}
      <PropertyModal
        property={selected}
        isOpen={isModalOpen}
        onClose={closeProperty}
      />
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        properties={properties}
        onAdd={async (p) => {
          const created = await requestWithAuth("/api/properties", {
            method: "POST",
            body: JSON.stringify(p),
          });
          setProperties((prev) => [...prev, normalize(created)]);
        }}
        onEdit={async (id, p) => {
          const updated = await requestWithAuth(`/api/properties/${id}`, {
            method: "PUT",
            body: JSON.stringify(p),
          });
          setProperties((prev) =>
            prev.map((x) => (x.id === id ? normalize(updated) : x)),
          );
        }}
        onDelete={async (id) => {
          await requestWithAuth(`/api/properties/${id}`, { method: "DELETE" });
          setProperties((prev) => prev.filter((x) => x.id !== id));
        }}
        inquiries={inquiries}
        onDeleteInquiry={async (id) => {
          await requestWithAuth(`/api/inquiries/${id}`, { method: "DELETE" });
          setInquiries((prev) => prev.filter((x) => x.id !== id));
        }}
      />
      <LoginSidePane
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={async (username, password) => {
          const response = await requestApi("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ username, password }),
          });
          const token = response?.token;
          if (!token) {
            throw new Error("Login failed. Token not received.");
          }
          window.localStorage.setItem("adminToken", token);
          setAdminToken(token);
          const adminInquiries = await requestApi("/api/inquiries", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setInquiries(adminInquiries);
        }}
        onLoginSuccess={() => {
          setIsAdminOpen(true);
          setIsLoginOpen(false);
        }}
      />
      <footer className="bg-white py-12 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto text-center">
          <p
            style={{ color: colors.body, fontSize: 14, letterSpacing: "0.5px" }}
          >
            (c) 2026 Samridhi Properties. Crafted for Gurgaon luxury living.
          </p>
        </div>
      </footer>
    </div>
  );
}
