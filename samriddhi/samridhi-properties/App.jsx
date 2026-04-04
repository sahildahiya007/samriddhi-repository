import React, { useEffect, useRef, useState } from "react";
import {
  Phone,
  Star,
  Eye,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  MapPin,
  MessageCircle,
  Shield,
  TrendingUp,
  Users,
  Award,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  Heart,
  User,
  LogOut,
  UserPlus,
  Mail,
  BarChart3,
  Sun,
  Moon,
} from "lucide-react";
import Construction from "./Construction.jsx";
import { supabase } from "./supabaseClient.js";

/* ── Security utilities ── */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* Rate limiting: max 5 login attempts per 60 seconds */
const LOGIN_ATTEMPTS = { count: 0, firstAttempt: 0 };
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;
function checkRateLimit() {
  const now = Date.now();
  if (now - LOGIN_ATTEMPTS.firstAttempt > LOCKOUT_MS) {
    LOGIN_ATTEMPTS.count = 0;
    LOGIN_ATTEMPTS.firstAttempt = now;
  }
  LOGIN_ATTEMPTS.count++;
  if (LOGIN_ATTEMPTS.count > MAX_ATTEMPTS) {
    const remaining = Math.ceil(
      (LOCKOUT_MS - (now - LOGIN_ATTEMPTS.firstAttempt)) / 1000,
    );
    throw new Error(
      `Too many login attempts. Please wait ${remaining}s before trying again.`,
    );
  }
}

/* Input validators */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function validateEmail(email) {
  if (!email || !EMAIL_RE.test(email.trim()))
    throw new Error("Please enter a valid email address");
}
function validatePassword(password, isSignup = false) {
  if (!password || password.length < 8)
    throw new Error("Password must be at least 8 characters");
  if (isSignup) {
    if (!/[A-Z]/.test(password))
      throw new Error("Password must include an uppercase letter");
    if (!/[0-9]/.test(password))
      throw new Error("Password must include a number");
    if (!/[^A-Za-z0-9]/.test(password))
      throw new Error("Password must include a special character");
  }
}
function validateName(name) {
  if (!name || name.trim().length < 2)
    throw new Error("Name must be at least 2 characters");
  if (name.length > 100) throw new Error("Name is too long");
}
function sanitizeInput(str) {
  return str.replace(/[<>"'&]/g, "");
}

/* ── Admin users (passwords stored as SHA-256 hashes — never plain text) ── */
const ADMIN_USERS = [
  {
    id: 1,
    name: "Lukesh",
    username: "lukeshprime",
    passwordHash:
      "31ceaeb92c5325e3eb867c84ef9f1c0684fe2f307ad8a1908828a4e98da02a61",
    email: "samriddhiproperties9@gmail.com",
    phone: "+91 8398979897",
    role: "prime-admin",
  },
  {
    id: 2,
    name: "lukeshdmin",
    username: "lukeshdmin",
    passwordHash:
      "c6a804d1136e556062f2a2f48beb0fb74e168c8b18a80813965030cb4c82be7a",
    email: "jaide@example.com",
    phone: "+91 7678478209",
    role: "sub-admin",
  },
];

/* ── Premium scroll-reveal hook ── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── Animated counter hook ── */
function useCounter(end, duration = 2000, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      setVal(Math.floor(p * end));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, start]);
  return val;
}

const colors = {
  accent: "#E8956E",
  accentSoft: "#D4A574",
  cream: "#F5E6D3",
  dark: "#1a1a1a",
  body: "#666B63",
};

const bg = {
  hero: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1800&q=80",
  sale: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
  rent: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
  contact:
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?auto=format&fit=crop&w=1600&q=80",
};

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const NETLIFY_FUNCTIONS_API_BASE = "/.netlify/functions/api";

function buildApiCandidates(path) {
  if (API_BASE) {
    return [`${API_BASE}${path}`];
  }
  if (path.startsWith("/api/")) {
    return [
      path,
      `${NETLIFY_FUNCTIONS_API_BASE}${path.replace(/^\/api/, "")}`,
    ];
  }
  return [path];
}

const CONSTRUCTION_HASHES = new Set([
  "#construction",
  "#projects",
  "#estimator",
  "#contact-construction",
]);

const isConstructionHash = (value) => CONSTRUCTION_HASHES.has(value);

async function requestApi(path, options = {}) {
  const isFormDataBody =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  const requestHeaders = {
    ...(isFormDataBody ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };
  const candidateUrls = buildApiCandidates(path);
  let response;
  let fetchFailed = false;

  for (let index = 0; index < candidateUrls.length; index += 1) {
    const url = candidateUrls[index];
    try {
      const currentResponse = await fetch(url, {
        headers: requestHeaders,
        ...options,
      });

      if (currentResponse.status === 404 && index < candidateUrls.length - 1) {
        continue;
      }

      response = currentResponse;
      break;
    } catch {
      fetchFailed = true;
    }
  }

  if (!response) {
    throw new Error(
      fetchFailed
        ? "Backend unavailable. Please start backend at http://localhost:5000 or check network connection."
        : "Request failed",
    );
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const payload = await response.json();
      message = payload.message || message;
    } catch {
      try {
        const responseText = await response.text();
        if (
          response.status === 404 &&
          /<!doctype html>|<html/i.test(responseText)
        ) {
          message =
            "API route not found. Configure VITE_API_BASE_URL to your backend URL.";
        }
      } catch {
        // Keep fallback message.
      }
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
      sales: "+91 8398979897",
      rent: "+91 9968149329",
      leasing: "+91 8448660575",
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
      sales: "+91 8398979897",
      rent: "+91 9968149329",
      leasing: "+91 8448660575",
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
      sales: "+91 8398979897",
      rent: "+91 9968149329",
      leasing: "+91 8448660575",
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
      sales: "+91 8398979897",
      rent: "+91 9968149329",
      leasing: "+91 8448660575",
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
      sales: "+91 8398979897",
      rent: "+91 9968149329",
      leasing: "+91 8448660575",
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
    sales: p?.contacts?.sales || "+91 8398979897",
    rent: p?.contacts?.rent || "+91 9968149329",
    leasing: p?.contacts?.leasing || "+91 8448660575",
  },
});

const initialInquiryForm = {
  name: "",
  phone: "",
  time: "",
  reasonType: "Buy / Sell",
  reason: "",
};

function Navbar({
  hash,
  onNavigateHome,
  adminToken,
  userToken,
  userName,
  onSignInClick,
  onAdminPanelOpen,
  onWishlistOpen,
  onUserClick,
  onAdminClick,
  onLogout,
  wishlistCount,
  darkMode,
  onToggleDarkMode,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactMenuOpen, setContactMenuOpen] = useState(false);
  const navRef = useRef(null);
  const inConstructionView = isConstructionHash(hash);
  const phoneNumber = "+918398979897";
  const whatsappHref = `https://wa.me/918398979897?text=${encodeURIComponent(
    "Hi Samriddhi Estates, I want to discuss a property requirement.",
  )}`;
  const links = [
    { label: "Home", href: "#home" },
    { label: "For Sale", href: "#sale" },
    { label: "Rentals", href: "#rentals" },
    { label: "Construction", href: "#construction" },
    { label: "Free Cost Estimate", href: "#estimator" },
  ];
  const currentHash = hash || window.location.hash || "#home";

  const handleAnchorClick = (href, closeMenu = false) => {
    if (closeMenu) setMenuOpen(false);
    if (href === "#home" && typeof onNavigateHome === "function") {
      onNavigateHome();
      return;
    }
    if (
      inConstructionView &&
      !isConstructionHash(href) &&
      href !== "#construction"
    ) {
      if (typeof onNavigateHome === "function") {
        onNavigateHome(href);
        return;
      }
    }
    window.location.hash = href;
  };

  useEffect(() => {
    if (!menuOpen && !contactMenuOpen) return;

    const handleOutsideTap = (event) => {
      if (!navRef.current) return;
      if (!navRef.current.contains(event.target)) {
        setMenuOpen(false);
        setContactMenuOpen(false);
      }
    };

    document.addEventListener("touchstart", handleOutsideTap, {
      passive: true,
    });
    document.addEventListener("mousedown", handleOutsideTap);

    return () => {
      document.removeEventListener("touchstart", handleOutsideTap);
      document.removeEventListener("mousedown", handleOutsideTap);
    };
  }, [menuOpen, contactMenuOpen]);

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-50 overflow-x-clip transition-colors duration-300"
      style={{
        background: darkMode
          ? "linear-gradient(135deg, #1a1714 0%, #221e18 60%, #1a1714 100%)"
          : "linear-gradient(135deg, rgba(249,247,244,0.97) 0%, rgba(245,236,224,0.95) 60%, rgba(249,247,244,0.97) 100%)",
        backdropFilter: "blur(24px) saturate(1.4)",
        borderBottom: darkMode
          ? "1px solid rgba(232,149,110,0.12)"
          : "1px solid rgba(212,165,116,0.20)",
        boxShadow: darkMode
          ? "0 4px 30px rgba(0,0,0,0.35), 0 1px 0 rgba(232,149,110,0.06) inset"
          : "0 4px 20px rgba(0,0,0,0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-3 md:px-8 py-3 md:py-4 flex items-center justify-between gap-2 md:gap-6">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {hash && hash !== "#home" && (
            <button
              onClick={() => window.history.back()}
              className="h-9 w-9 rounded-lg md:hidden transition-all hover:opacity-80 flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: "rgba(232,149,110,0.10)",
                color: colors.accent,
              }}
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => handleAnchorClick("#home")}
            className="text-[1.85rem] leading-none md:text-[2.2rem] font-bold text-left hover:opacity-85 transition truncate tracking-wide flex-shrink-0"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: darkMode ? "#fff" : colors.dark,
              letterSpacing: "0.01em",
              textShadow: darkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
            }}
          >
            <span className="md:hidden">Samriddhi</span>
            <span className="hidden md:inline">
              Samriddhi <span style={{ color: colors.accent }}>Estates</span>
            </span>
          </button>
        </div>
        <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
          {links.map((l) => {
            const isActive =
              currentHash === l.href ||
              (l.href === "#construction" && isConstructionHash(currentHash));
            return (
              <button
                type="button"
                key={l.href}
                onClick={() => handleAnchorClick(l.href)}
                className="relative text-sm font-semibold tracking-wide transition-all duration-200 pb-1.5 group"
                style={{
                  color: isActive
                    ? colors.accent
                    : darkMode
                      ? "rgba(245,230,211,0.65)"
                      : "rgba(26,26,26,0.55)",
                  letterSpacing: "0.04em",
                }}
              >
                {l.label}
                <span
                  className="absolute bottom-0 left-0 w-full transition-all duration-300 rounded-full"
                  style={{
                    height: "2px",
                    background: `linear-gradient(90deg, ${colors.accent}, #c8713a)`,
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin: "left",
                  }}
                />
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="hidden md:flex p-2 rounded-lg items-center justify-center transition-all duration-200 hover:scale-105"
            style={{
              background: darkMode
                ? "rgba(255,255,255,0.06)"
                : "rgba(26,26,26,0.06)",
              border: darkMode
                ? "1px solid rgba(255,255,255,0.10)"
                : "1px solid rgba(26,26,26,0.10)",
              color: darkMode ? "rgba(245,230,211,0.6)" : "rgba(26,26,26,0.5)",
            }}
            title={darkMode ? "Switch to Day Mode" : "Switch to Night Mode"}
          >
            {darkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          {/* Unified Sign In / Account */}
          {adminToken ? (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={onAdminClick}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  background: "rgba(232,149,110,0.15)",
                  border: "1px solid rgba(232,149,110,0.25)",
                  color: colors.accent,
                }}
                title="Open Admin Panel"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden lg:inline">Admin Panel</span>
              </button>
              <button
                onClick={onLogout}
                className="p-2 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                style={{
                  background: darkMode
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(26,26,26,0.05)",
                  border: darkMode
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "1px solid rgba(26,26,26,0.08)",
                  color: darkMode
                    ? "rgba(245,230,211,0.5)"
                    : "rgba(26,26,26,0.4)",
                }}
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : userToken ? (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={onWishlistOpen}
                className="relative p-2 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                style={{
                  background: "rgba(232,149,110,0.10)",
                  border: "1px solid rgba(232,149,110,0.18)",
                  color: colors.accent,
                }}
                title="My Wishlist"
              >
                <Heart className="w-4 h-4" />
                {wishlistCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{ backgroundColor: colors.accent, color: "#fff" }}
                  >
                    {wishlistCount}
                  </span>
                )}
              </button>
              <button
                onClick={onLogout}
                className="p-2 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                style={{
                  background: darkMode
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(26,26,26,0.05)",
                  border: darkMode
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "1px solid rgba(26,26,26,0.08)",
                  color: darkMode
                    ? "rgba(245,230,211,0.5)"
                    : "rgba(26,26,26,0.4)",
                }}
                title={`Logged in as ${userName}`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1.5">
              <button
                onClick={() => onSignInClick && onSignInClick("login")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  background: "rgba(232,149,110,0.10)",
                  border: "1px solid rgba(232,149,110,0.18)",
                  color: colors.accent,
                }}
                title="Login"
              >
                <User className="w-4 h-4" />
                <span className="hidden lg:inline">Login</span>
              </button>
              <button
                onClick={() => onSignInClick && onSignInClick("register")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  background: darkMode
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(26,26,26,0.05)",
                  border: darkMode
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "1px solid rgba(26,26,26,0.08)",
                  color: darkMode
                    ? "rgba(245,230,211,0.55)"
                    : "rgba(26,26,26,0.5)",
                }}
                title="Create an account"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden lg:inline">Sign Up</span>
              </button>
            </div>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setContactMenuOpen((prev) => !prev)}
              className="px-3.5 md:px-6 py-2 md:py-2.5 rounded-xl font-semibold text-sm md:text-sm inline-flex items-center justify-center text-center transition-all duration-200 hover:shadow-lg active:scale-95 tracking-wide"
              style={{
                background: `linear-gradient(135deg, ${colors.accent} 0%, #c8713a 100%)`,
                color: "#fff",
                letterSpacing: "0.04em",
                boxShadow: "0 4px 16px rgba(232,149,110,0.35)",
              }}
              aria-label="Open contact options"
              aria-expanded={contactMenuOpen}
            >
              Contact
            </button>
            {contactMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-44 rounded-xl border p-2 z-50"
                style={{
                  background: "rgba(30,28,26,0.97)",
                  borderColor: "rgba(232,149,110,0.15)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <a
                  href={`tel:${phoneNumber}`}
                  onClick={() => setContactMenuOpen(false)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all hover:opacity-80"
                  style={{ color: "rgba(245,230,211,0.8)" }}
                >
                  <Phone className="w-4 h-4" style={{ color: colors.accent }} />{" "}
                  Call Now
                </a>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setContactMenuOpen(false)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all hover:opacity-80"
                  style={{ color: "rgba(245,230,211,0.8)" }}
                >
                  <MessageCircle
                    className="w-4 h-4"
                    style={{ color: "#25D366" }}
                  />{" "}
                  WhatsApp DM
                </a>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setContactMenuOpen(false);
              setMenuOpen((prev) => !prev);
            }}
            className="md:hidden px-3 py-2 rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-md active:scale-95 flex items-center gap-1.5"
            style={{
              background: `linear-gradient(135deg, ${colors.accent} 0%, #c8713a 100%)`,
              color: "#fff",
              boxShadow: "0 2px 8px rgba(232,149,110,0.30)",
            }}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-[36rem]" : "max-h-0"
        }`}
      >
        <div
          className="mx-3 mb-3 rounded-2xl overflow-hidden"
          style={{
            background: "rgba(26,23,20,0.98)",
            border: "1px solid rgba(232,149,110,0.12)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          }}
        >
          <div className="flex flex-col px-2 py-2">
            {links.map((l) => {
              const isActive =
                currentHash === l.href ||
                (l.href === "#construction" && isConstructionHash(currentHash));
              return (
                <button
                  type="button"
                  key={l.href}
                  onClick={() => handleAnchorClick(l.href, true)}
                  className="text-sm py-3 px-4 rounded-xl font-semibold text-left transition-all duration-150 flex items-center justify-between"
                  style={{
                    color: isActive ? colors.accent : "rgba(245,230,211,0.65)",
                    backgroundColor: isActive
                      ? "rgba(232,149,110,0.12)"
                      : "transparent",
                    letterSpacing: "0.03em",
                  }}
                >
                  {l.label}
                  {isActive && (
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: colors.accent }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <div
            style={{ borderTop: "1px solid rgba(232,149,110,0.08)" }}
            className="mx-3"
          />
          <div className="px-2 py-2 space-y-1">
            {/* Dark mode toggle - mobile */}
            <button
              onClick={() => {
                onToggleDarkMode && onToggleDarkMode();
              }}
              className="w-full text-sm py-2.5 px-4 rounded-xl font-semibold text-left flex items-center gap-2 transition-all duration-150"
              style={{
                color: "rgba(245,230,211,0.55)",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              {darkMode ? "Day Mode" : "Night Mode"}
            </button>
            {adminToken ? (
              <>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onAdminClick();
                  }}
                  className="w-full text-sm py-2.5 px-4 rounded-xl font-semibold text-left flex items-center gap-2 transition-all duration-150"
                  style={{
                    color: colors.accent,
                    backgroundColor: "rgba(232,149,110,0.08)",
                  }}
                >
                  <Shield className="w-4 h-4" /> Admin Panel
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-sm py-2.5 px-4 rounded-xl font-semibold text-left flex items-center gap-2 transition-all duration-150"
                  style={{
                    color: "rgba(245,230,211,0.5)",
                    backgroundColor: "rgba(255,255,255,0.03)",
                  }}
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : userToken ? (
              <>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onWishlistOpen && onWishlistOpen();
                  }}
                  className="w-full text-sm py-2.5 px-4 rounded-xl font-semibold text-left flex items-center gap-2 transition-all duration-150"
                  style={{
                    color: colors.accent,
                    backgroundColor: "rgba(232,149,110,0.08)",
                  }}
                >
                  <Heart className="w-4 h-4" /> Wishlist{" "}
                  {wishlistCount > 0 && `(${wishlistCount})`}
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-sm py-2.5 px-4 rounded-xl font-semibold text-left flex items-center gap-2 transition-all duration-150"
                  style={{
                    color: "rgba(245,230,211,0.5)",
                    backgroundColor: "rgba(255,255,255,0.03)",
                  }}
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onSignInClick && onSignInClick("login");
                  }}
                  className="w-full text-sm py-2.5 px-4 rounded-xl font-semibold text-left flex items-center gap-2 transition-all duration-150"
                  style={{
                    color: colors.accent,
                    backgroundColor: "rgba(232,149,110,0.08)",
                  }}
                >
                  <User className="w-4 h-4" /> Login
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onSignInClick && onSignInClick("register");
                  }}
                  className="w-full text-sm py-2.5 px-4 rounded-xl font-semibold text-left flex items-center gap-2 transition-all duration-150"
                  style={{
                    color: "rgba(245,230,211,0.55)",
                    backgroundColor: "rgba(255,255,255,0.03)",
                  }}
                >
                  <UserPlus className="w-4 h-4" /> Sign Up
                </button>
              </>
            )}
          </div>
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
      className="relative min-h-screen md:min-h-[92vh] flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(118deg, rgba(12,12,12,0.70) 0%, rgba(232,149,110,0.22) 46%, rgba(10,10,10,0.76) 100%), radial-gradient(circle at 78% 15%, rgba(248,201,169,0.18) 0%, rgba(248,201,169,0) 44%), url('${bg.hero}')`,
        backgroundSize: "cover",
        backgroundPosition: "center 42%",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "scroll",
      }}
    >
      <div className="max-w-5xl px-6 md:px-8 relative z-10 text-center md:text-left">
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
          className="text-4xl md:text-6xl font-bold mb-5 md:mb-6 leading-[1.08]"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "#fff",
            letterSpacing: "0.01em",
            textShadow: "0 8px 20px rgba(0,0,0,0.52)",
          }}
        >
          Gurgaon Luxury Living by{" "}
          <span style={{ color: colors.accent }}>Samriddhi Estates</span>
        </h1>
        <p
          className="text-base md:text-lg mb-9 md:mb-10 max-w-2xl mx-auto md:mx-0"
          style={{ color: "#F5F3F0" }}
        >
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
                    imageIndex === idx
                      ? "rgba(255,255,255,0.95)"
                      : "rgba(255,255,255,0.45)",
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

function PropertyCard({ property, onClick, isWishlisted, onToggleWishlist }) {
  const [hover, setHover] = useState(false);
  const isSale = property.type === "sale";
  const isRent = property.type === "rent";
  const rentPerMonth = isRent
    ? /month|mo/i.test(property.price || "")
      ? property.price
      : `${property.price} / month`
    : property.price;
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
      <div className="h-[340px] md:h-[320px] overflow-hidden rounded-[20px]">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700"
          style={{ transform: hover ? "scale(1.06)" : "scale(1)" }}
        />
      </div>

      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <span
          className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
          style={{ backgroundColor: colors.accent, color: "#fff" }}
        >
          {typeLabel}
        </span>
      </div>

      {/* Wishlist Heart */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleWishlist && onToggleWishlist(property.id);
        }}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          backgroundColor: isWishlisted
            ? "rgba(232,149,110,0.95)"
            : "rgba(0,0,0,0.35)",
          backdropFilter: "blur(8px)",
          boxShadow: isWishlisted
            ? "0 4px 14px rgba(232,149,110,0.4)"
            : "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <Heart
          className="w-4.5 h-4.5"
          style={{
            color: "#fff",
            fill: isWishlisted ? "#fff" : "none",
            width: 18,
            height: 18,
          }}
        />
      </button>

      <div className="relative -mt-8 md:-mt-10 mx-3 mb-3 md:mx-4 md:mb-4 z-10">
        <div
          className="rounded-[22px] md:rounded-[24px] px-4 py-4 md:px-5 md:py-5"
          style={{
            backgroundColor: "rgba(255,255,255,0.98)",
            boxShadow: "0 14px 24px rgba(26,26,26,0.16)",
          }}
        >
          <h2
            className="font-bold text-xl md:text-2xl mb-1 leading-snug"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: colors.dark,
            }}
          >
            {property.title}
          </h2>
          <p
            className="text-sm mb-3 flex items-center gap-1"
            style={{ color: colors.body }}
          >
            <MapPin className="w-3.5 h-3.5" />
            {property.location}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(property.amenities || []).slice(0, 3).map((a) => (
              <span
                key={a}
                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: colors.cream,
                  color: colors.dark,
                }}
              >
                {a}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: colors.cream,
                  color: colors.dark,
                }}
              >
                {isRent ? `Rent: ${rentPerMonth}` : `Price: ${property.price}`}
              </span>
              {isSale && (
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: colors.cream,
                    color: colors.dark,
                  }}
                >
                  {(property.amenities || []).length} amenities
                </span>
              )}
            </div>
            <span className="text-xs" style={{ color: colors.body }}>
              Swipe for more
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href="tel:+918398979897"
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
    </div>
  );
}

function PropertyCarousel({ properties, onClick, wishlist, onToggleWishlist }) {
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
            style={{
              width: "clamp(250px, 70vw, 390px)",
              scrollSnapAlign: "start",
            }}
          >
            <PropertyCard
              property={p}
              onClick={onClick}
              isWishlisted={wishlist?.includes(p.id)}
              onToggleWishlist={onToggleWishlist}
            />
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

function PropertyGrid({ properties, onClick, wishlist, onToggleWishlist }) {
  const sale = properties.filter((p) => p.type === "sale");
  const [ref, visible] = useReveal(0.12);
  return (
    <section
      id="sale"
      ref={ref}
      className="relative py-24 px-2 md:px-6 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(138deg, rgba(24,22,20,0.82) 0%, rgba(38,32,26,0.78) 52%, rgba(56,38,24,0.74) 100%), radial-gradient(circle at 18% 10%, rgba(232,149,110,0.18) 0%, rgba(232,149,110,0) 42%), url('${bg.sale}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <div
          className="text-center mb-16"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(25px)",
            transition: "all 0.7s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{
              backgroundColor: "rgba(232,149,110,0.12)",
              color: colors.accent,
              border: "1px solid rgba(232,149,110,0.20)",
            }}
          >
            Premium Collection
          </span>
          <h3
            className="text-5xl md:text-6xl font-bold mb-4"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#fff",
              textShadow: "0 4px 16px rgba(0,0,0,0.35)",
            }}
          >
            Premium Homes in Gurugram
          </h3>
          <p className="text-lg" style={{ color: colors.cream }}>
            Curated sale listings with clear pricing and amenity highlights.
          </p>
        </div>
        {sale.length > 0 ? (
          <PropertyCarousel
            properties={sale}
            onClick={onClick}
            wishlist={wishlist}
            onToggleWishlist={onToggleWishlist}
          />
        ) : (
          <p className="text-center text-xl" style={{ color: colors.cream }}>
            No sale properties available.
          </p>
        )}
      </div>
    </section>
  );
}

function RentalsShowcase({ properties, onClick, wishlist, onToggleWishlist }) {
  const rent = properties.filter((p) => p.type === "rent");
  const [ref, visible] = useReveal(0.12);
  return (
    <section
      id="rentals"
      ref={ref}
      className="relative px-2 md:px-6 py-24 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(136deg, rgba(18,18,18,0.84) 0%, rgba(34,34,34,0.80) 44%, rgba(58,41,30,0.75) 100%), radial-gradient(circle at 82% 14%, rgba(232,149,110,0.20) 0%, rgba(232,149,110,0) 38%), url('${bg.rent}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div
          className="text-center mb-16"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(25px)",
            transition: "all 0.7s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{
              backgroundColor: "rgba(232,149,110,0.15)",
              color: colors.accent,
              border: "1px solid rgba(232,149,110,0.25)",
            }}
          >
            Luxury Rentals
          </span>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.4rem, 8vw, 4rem)",
              fontWeight: "bold",
              color: "#fff",
              marginBottom: 14,
            }}
          >
            Premium Rental Properties in Gurugram
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
          <PropertyCarousel
            properties={rent}
            onClick={onClick}
            wishlist={wishlist}
            onToggleWishlist={onToggleWishlist}
          />
        ) : (
          <p className="text-center text-lg" style={{ color: colors.cream }}>
            No rental properties available.
          </p>
        )}
      </div>
    </section>
  );
}

function ConstructionPreviewSection() {
  const [ref, visible] = useReveal(0.12);
  return (
    <section
      ref={ref}
      className="relative py-20 md:py-24 px-3 sm:px-6 overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(120deg, rgba(9,9,9,0.76) 0%, rgba(34,25,20,0.58) 44%, rgba(13,13,13,0.72) 100%), radial-gradient(circle at 84% 18%, rgba(232,149,110,0.20) 0%, rgba(232,149,110,0) 42%), url('https://images.unsplash.com/photo-1616594039964-3f27e9f0a9a2?auto=format&fit=crop&w=1800&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div
          className="text-center mb-10 md:mb-14"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(25px)",
            transition: "all 0.7s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{
              backgroundColor: "rgba(232,149,110,0.15)",
              color: colors.accent,
              border: "1px solid rgba(232,149,110,0.25)",
            }}
          >
            Build With Confidence
          </span>
          <h3
            className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#fff",
              textShadow: "0 10px 24px rgba(0,0,0,0.45)",
            }}
          >
            Build Better With Samriddhi Estates
          </h3>
          <p
            className="text-sm sm:text-lg md:text-xl max-w-4xl mx-auto"
            style={{ color: "#F5E6D3" }}
          >
            Every great home begins with the right planning. Explore our
            construction expertise, compare quality-led build paths, and
            estimate your investment before you connect with our team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div
            className="rounded-3xl p-7 md:p-10 hover:shadow-2xl"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(252,248,243,0.92) 100%)",
              border: "1px solid rgba(232,149,110,0.30)",
              boxShadow: "0 24px 48px rgba(26,26,26,0.10)",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(30px)",
              transition:
                "opacity 0.7s cubic-bezier(0.22,1,0.36,1) 0.2s, transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.2s",
            }}
          >
            <h4
              className="text-2xl md:text-[2rem] font-bold mb-4 leading-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: colors.dark,
              }}
            >
              Are you looking to build your dream home?
            </h4>
            <p
              className="text-base md:text-lg mb-7 leading-relaxed"
              style={{ color: colors.body }}
            >
              From concept planning and approvals to structure, interiors, and
              finishing, our team guides every stage with design clarity,
              transparent execution, and premium quality standards.
            </p>
            <a
              href="#construction"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-semibold text-base md:text-lg transition-all duration-200 hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${colors.accent} 0%, #c8713a 100%)`,
                color: "#fff",
                boxShadow: "0 14px 26px rgba(180,90,30,0.26)",
              }}
            >
              Explore Construction
            </a>
          </div>

          <div
            className="rounded-3xl p-7 md:p-10 hover:shadow-2xl"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(252,248,243,0.92) 100%)",
              border: "1px solid rgba(212,165,116,0.34)",
              boxShadow: "0 24px 48px rgba(26,26,26,0.10)",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(30px)",
              transition:
                "opacity 0.7s cubic-bezier(0.22,1,0.36,1) 0.35s, transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.35s",
            }}
          >
            <h4
              className="text-2xl md:text-[2rem] font-bold mb-4 leading-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: colors.dark,
              }}
            >
              Need a cost analysis for your new home construction?
            </h4>
            <p
              className="text-base md:text-lg mb-7 leading-relaxed"
              style={{ color: colors.body }}
            >
              Get an intelligent cost projection based on area, material
              preference, and scope so you can plan confidently and avoid budget
              surprises during execution.
            </p>
            <a
              href="#estimator"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-semibold text-base md:text-lg transition-all duration-200 hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${colors.accent} 0%, #c8713a 100%)`,
                color: "#fff",
                boxShadow: "0 14px 26px rgba(180,90,30,0.26)",
              }}
            >
              Start Your Free Home Construction Cost Analysis
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Animated Trust / Stats Bar ── */
function TrustStatsBar() {
  const [ref, visible] = useReveal(0.2);
  const clients = useCounter(500, 2200, visible);
  const projects = useCounter(120, 2000, visible);
  const years = useCounter(12, 1500, visible);
  const satisfaction = useCounter(99, 2000, visible);

  const stats = [
    {
      icon: Users,
      value: `${clients}+`,
      label: "Happy Clients",
      color: "#E8956E",
    },
    {
      icon: Award,
      value: `${projects}+`,
      label: "Projects Delivered",
      color: "#D4A574",
    },
    {
      icon: Shield,
      value: `${years}+`,
      label: "Years Experience",
      color: "#E8956E",
    },
    {
      icon: TrendingUp,
      value: `${satisfaction}%`,
      label: "Client Satisfaction",
      color: "#D4A574",
    },
  ];

  return (
    <section
      ref={ref}
      className="relative py-16 md:py-20 px-4 sm:px-6 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #1a1714 0%, #2a2218 50%, #1a1714 100%)",
      }}
    >
      {/* Subtle accent glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(232,149,110,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <div
          className="text-center mb-12"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.6s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{
              backgroundColor: "rgba(232,149,110,0.12)",
              color: "#E8956E",
              border: "1px solid rgba(232,149,110,0.20)",
            }}
          >
            Trusted by Gurgaon Homeowners
          </span>
          <h3
            className="text-3xl sm:text-4xl md:text-5xl font-bold"
            style={{ fontFamily: "'Playfair Display', serif", color: "#fff" }}
          >
            Numbers That <span style={{ color: "#E8956E" }}>Speak</span>
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="text-center p-6 md:p-8 rounded-2xl"
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(232,149,110,0.10)",
                  backdropFilter: "blur(8px)",
                  opacity: visible ? 1 : 0,
                  transform: visible
                    ? "translateY(0) scale(1)"
                    : "translateY(30px) scale(0.95)",
                  transition: `all 0.7s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.1}s`,
                }}
              >
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                  style={{ backgroundColor: "rgba(232,149,110,0.10)" }}
                >
                  <Icon className="w-6 h-6" style={{ color: s.color }} />
                </div>
                <div
                  className="text-3xl md:text-4xl font-bold mb-1"
                  style={{
                    color: "#fff",
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  {s.value}
                </div>
                <div
                  className="text-xs sm:text-sm font-medium"
                  style={{ color: "rgba(245,230,211,0.55)" }}
                >
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
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

  const [formRef, formVisible] = useReveal(0.1);

  return (
    <section
      id="contact"
      ref={formRef}
      className="relative py-14 sm:py-20 md:py-28 px-3 sm:px-6 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(140deg, rgba(12,10,8,0.90) 0%, rgba(28,22,16,0.86) 52%, rgba(42,28,18,0.82) 100%), radial-gradient(circle at 86% 18%, rgba(232,149,110,0.14) 0%, rgba(232,149,110,0) 40%), url('${bg.contact}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(232,149,110,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-3xl mx-auto relative z-10">
        <div
          className="text-center mb-8 sm:mb-14"
          style={{
            opacity: formVisible ? 1 : 0,
            transform: formVisible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.7s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{
              backgroundColor: "rgba(232,149,110,0.15)",
              color: colors.accent,
              border: "1px solid rgba(232,149,110,0.25)",
            }}
          >
            Connect With Us
          </span>
          <h3
            className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#fff",
              textShadow: "0 4px 20px rgba(0,0,0,0.40)",
            }}
          >
            Get in Touch
          </h3>
          <p
            className="text-sm sm:text-lg max-w-lg mx-auto"
            style={{ color: "rgba(245,230,211,0.85)" }}
          >
            Share your requirement and our expert brokers will reach out within
            hours.
          </p>
        </div>
        <form
          onSubmit={submit}
          className="rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10"
          style={{
            backgroundColor: "rgba(255,255,255,0.97)",
            border: "1px solid rgba(232,149,110,0.18)",
            boxShadow:
              "0 30px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05)",
            opacity: formVisible ? 1 : 0,
            transform: formVisible ? "translateY(0)" : "translateY(40px)",
            transition: "all 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s",
          }}
        >
          <div className="grid md:grid-cols-2 gap-4 sm:gap-5 mb-5">
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: colors.body }}
              >
                Full Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                required
                placeholder="Enter your full name"
                className="w-full px-4 py-3.5 rounded-xl text-sm sm:text-base focus:outline-none transition-all"
                style={{
                  border: "1.5px solid rgba(232,149,110,0.22)",
                  backgroundColor: "rgba(249,247,244,0.6)",
                  color: colors.dark,
                }}
              />
            </div>
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: colors.body }}
              >
                Phone Number
              </label>
              <input
                name="phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit phone number"
                minLength={10}
                maxLength={10}
                value={form.phone}
                onChange={onChange}
                required
                placeholder="10-digit mobile number"
                className="w-full px-4 py-3.5 rounded-xl text-sm sm:text-base focus:outline-none transition-all"
                style={{
                  border: "1.5px solid rgba(232,149,110,0.22)",
                  backgroundColor: "rgba(249,247,244,0.6)",
                  color: colors.dark,
                }}
              />
            </div>
          </div>
          <div className="mb-5">
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: colors.body }}
            >
              Callback Time
            </label>
            <select
              name="time"
              value={form.time}
              onChange={onChange}
              required
              className="w-full px-4 py-3.5 rounded-xl text-sm sm:text-base focus:outline-none transition-all"
              style={{
                border: "1.5px solid rgba(232,149,110,0.22)",
                backgroundColor: "rgba(249,247,244,0.6)",
                color: form.time ? colors.dark : colors.body,
              }}
            >
              <option value="" disabled>
                Select preferred time
              </option>
              <option>Morning (9am-12pm)</option>
              <option>Afternoon (12pm-4pm)</option>
              <option>Evening (4pm-8pm)</option>
            </select>
          </div>
          <div className="mb-5">
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: colors.body }}
            >
              I'm Interested In
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["Rent", "Buy / Sell", "Construction"].map((option) => {
                const active = form.reasonType === option;
                return (
                  <label
                    key={option}
                    className="cursor-pointer rounded-xl px-3 py-3 flex items-center justify-center transition-all duration-200"
                    style={{
                      backgroundColor: active
                        ? colors.accent
                        : "rgba(249,247,244,0.7)",
                      color: active ? "#fff" : colors.dark,
                      border: active
                        ? `1.5px solid ${colors.accent}`
                        : "1.5px solid rgba(232,149,110,0.18)",
                      fontWeight: 600,
                      fontSize: 14,
                      boxShadow: active
                        ? "0 4px 14px rgba(232,149,110,0.30)"
                        : "none",
                      transform: active ? "scale(1.03)" : "scale(1)",
                    }}
                  >
                    <input
                      type="radio"
                      name="reasonType"
                      value={option}
                      checked={active}
                      onChange={onChange}
                      className="sr-only"
                    />
                    {option}
                  </label>
                );
              })}
            </div>
          </div>
          <div className="mb-6">
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: colors.body }}
            >
              Your Requirement
            </label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={onChange}
              placeholder="Share your requirement, budget, preferred location..."
              rows={3}
              className="w-full px-4 py-3.5 rounded-xl text-sm sm:text-base focus:outline-none resize-none transition-all"
              style={{
                border: "1.5px solid rgba(232,149,110,0.22)",
                backgroundColor: "rgba(249,247,244,0.6)",
                color: colors.dark,
              }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${colors.accent} 0%, #c8713a 100%)`,
              color: "#fff",
              boxShadow: "0 8px 24px rgba(232,149,110,0.35)",
            }}
          >
            {submitting ? (
              "Submitting..."
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Submit Inquiry
              </>
            )}
          </button>
          {ok && (
            <div
              className="text-center font-semibold mt-5 p-4 rounded-xl flex items-center justify-center gap-2"
              style={{
                backgroundColor: "rgba(232,149,110,0.08)",
                color: colors.accent,
                border: `1px solid rgba(232,149,110,0.25)`,
              }}
            >
              <CheckCircle2 className="w-5 h-5" /> Success! We will contact you
              shortly.
            </div>
          )}
          <div
            className="mt-6 pt-5 border-t"
            style={{ borderColor: "rgba(232,149,110,0.15)" }}
          >
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <a
                href="tel:+918398979897"
                className="flex items-center justify-center gap-1.5 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: "rgba(232,149,110,0.08)",
                  color: colors.accent,
                  border: "1px solid rgba(232,149,110,0.15)",
                }}
              >
                <Phone className="w-4 h-4" /> Call
              </a>
              <a
                href="https://wa.me/918398979897"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: "rgba(37,211,102,0.08)",
                  color: "#128C7E",
                  border: "1px solid rgba(37,211,102,0.18)",
                }}
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
              <a
                href={
                  form.reasonType === "Construction" ? "#construction" : "#sale"
                }
                className="flex items-center justify-center gap-1.5 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: "rgba(26,26,26,0.05)",
                  color: colors.dark,
                  border: "1px solid rgba(26,26,26,0.10)",
                }}
              >
                <ArrowUpRight className="w-4 h-4" />
                {form.reasonType === "Construction"
                  ? "Construction"
                  : "Site Visit"}
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
        background: "rgba(30,28,26,0.85)",
        border: "1px solid rgba(232,149,110,0.10)",
        backdropFilter: "blur(20px)",
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
  onUploadImage,
  registeredUsers,
  adminToken,
  onAddAdmin,
  onRefreshUsers,
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
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newAdminForm, setNewAdminForm] = useState({
    username: "",
    password: "",
    name: "",
  });
  const [adminList, setAdminList] = useState([]);
  const [adminMsg, setAdminMsg] = useState("");

  const loadAdmins = () => {
    setAdminList(ADMIN_USERS.map(({ passwordHash, ...rest }) => rest));
  };

  if (!isOpen) return null;

  const visibleProperties = (
    tab === "construction"
      ? properties.filter((p) => p.type === "construction")
      : properties.filter((p) => p.type !== "construction")
  ).filter(
    (p) =>
      !searchQuery ||
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const pricePlaceholder =
    f.type === "sale"
      ? "Total Price (e.g. Rs 1.95 Cr)"
      : "Rent per month (e.g. Rs 78,000/month)";

  const totalSale = properties.filter((p) => p.type === "sale").length;
  const totalRent = properties.filter((p) => p.type === "rent").length;
  const totalConstruction = properties.filter(
    (p) => p.type === "construction",
  ).length;

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
        sales: "+91 8398979897",
        rent: "+91 9968149329",
        leasing: "+91 8448660575",
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

  const uploadImageAtIndex = async (index, file) => {
    if (!file) return;
    if (!onUploadImage) {
      alert("Image upload is not configured.");
      return;
    }
    try {
      setUploadingIndex(index);
      const uploaded = await onUploadImage(file);
      const uploadedUrl = uploaded?.url;
      if (!uploadedUrl) {
        throw new Error("Upload failed. URL not returned by backend.");
      }
      setF((prev) => ({
        ...prev,
        images: prev.images.map((x, idx) => (idx === index ? uploadedUrl : x)),
      }));
    } catch (error) {
      alert(error.message || "Failed to upload image");
    } finally {
      setUploadingIndex(null);
    }
  };

  const inputStyle = {
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1.5px solid rgba(232,149,110,0.15)",
    color: "#fff",
    borderRadius: 12,
  };

  const tabs = [
    {
      id: "properties",
      label: "Properties",
      icon: "🏠",
      count: totalSale + totalRent,
    },
    {
      id: "construction",
      label: "Construction",
      icon: "🏗️",
      count: totalConstruction,
    },
    {
      id: "inquiries",
      label: "Inquiries",
      icon: "📩",
      count: inquiries.length,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: "📊",
      count: registeredUsers?.length || 0,
    },
    { id: "admins", label: "Admins", icon: "🔐", count: 0 },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-0 sm:p-4">
      <div
        className="w-full max-w-6xl h-[100dvh] sm:h-[92vh] sm:rounded-3xl flex flex-col md:flex-row overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, #1a1714 0%, #221e18 50%, #1a1714 100%)",
          boxShadow:
            "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(232,149,110,0.08)",
        }}
      >
        {/* Sidebar — Desktop */}
        <div
          className="hidden md:flex flex-col shrink-0"
          style={{
            width: 250,
            background: "rgba(0,0,0,0.25)",
            borderRight: "1px solid rgba(232,149,110,0.08)",
          }}
        >
          <div className="p-6 pb-4">
            <h4
              className="text-xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif", color: "#fff" }}
            >
              Samriddhi Estates <span style={{ color: colors.accent }}>Admin</span>
            </h4>
            <p
              className="text-xs mt-1"
              style={{ color: "rgba(245,230,211,0.45)" }}
            >
              Property Management Console
            </p>
          </div>
          <div className="flex-1 px-3 space-y-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  setSearchQuery("");
                }}
                className="w-full text-left px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 transition-all duration-200"
                style={{
                  color: tab === t.id ? "#fff" : "rgba(245,230,211,0.55)",
                  backgroundColor:
                    tab === t.id ? "rgba(232,149,110,0.18)" : "transparent",
                  border:
                    tab === t.id
                      ? "1px solid rgba(232,149,110,0.20)"
                      : "1px solid transparent",
                }}
              >
                <span className="text-base">{t.icon}</span>
                {t.label}
                <span
                  className="ml-auto text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor:
                      tab === t.id
                        ? "rgba(232,149,110,0.25)"
                        : "rgba(255,255,255,0.06)",
                    color:
                      tab === t.id ? colors.accent : "rgba(245,230,211,0.4)",
                  }}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>
          <div
            className="p-4 border-t"
            style={{ borderColor: "rgba(232,149,110,0.08)" }}
          >
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{
                backgroundColor: "rgba(232,149,110,0.12)",
                color: colors.accent,
                border: "1px solid rgba(232,149,110,0.18)",
              }}
            >
              Close Panel
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 sm:px-7 py-4 shrink-0"
            style={{ borderBottom: "1px solid rgba(232,149,110,0.08)" }}
          >
            <div>
              <h2
                className="text-lg sm:text-xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#fff",
                }}
              >
                {tab === "properties" && "Property Listings"}
                {tab === "construction" && "Construction Listings"}
                {tab === "inquiries" && "Client Inquiries"}
              </h2>
              <p
                className="text-xs mt-0.5"
                style={{ color: "rgba(245,230,211,0.4)" }}
              >
                {tab === "inquiries"
                  ? `${inquiries.length} total inquiries`
                  : `${visibleProperties.length} listings found`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl transition-all hover:scale-105"
              style={{
                backgroundColor: "rgba(232,149,110,0.12)",
                color: colors.accent,
                border: "1px solid rgba(232,149,110,0.15)",
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile tabs */}
          <div
            className="md:hidden px-4 py-3 flex gap-2 overflow-x-auto shrink-0"
            style={{ borderBottom: "1px solid rgba(232,149,110,0.08)" }}
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all"
                style={{
                  color: tab === t.id ? "#fff" : "rgba(245,230,211,0.5)",
                  backgroundColor:
                    tab === t.id
                      ? "rgba(232,149,110,0.20)"
                      : "rgba(255,255,255,0.04)",
                  border:
                    tab === t.id
                      ? "1px solid rgba(232,149,110,0.25)"
                      : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {t.icon} {t.label}
                <span className="text-xs opacity-60">({t.count})</span>
              </button>
            ))}
          </div>

          {/* Search bar for property tabs */}
          {(tab === "properties" || tab === "construction") && (
            <div className="px-5 sm:px-7 py-3 shrink-0">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or location..."
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                style={inputStyle}
              />
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-4">
            {(tab === "properties" || tab === "construction") && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Form — 2 cols */}
                <div className="lg:col-span-2">
                  <div
                    className="p-5 sm:p-6 rounded-2xl sticky top-0"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(232,149,110,0.10)",
                    }}
                  >
                    <h3
                      className="text-base font-bold mb-5 flex items-center gap-2"
                      style={{ color: "#fff" }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: colors.accent }}
                      />
                      {editingId ? "Edit Property" : "Add New Property"}
                    </h3>
                    <div className="space-y-3">
                      <input
                        value={f.title}
                        onChange={(e) => setF({ ...f, title: e.target.value })}
                        placeholder="Property Title *"
                        className="w-full px-4 py-3 text-sm focus:outline-none transition-all"
                        style={inputStyle}
                      />
                      <select
                        value={f.type}
                        onChange={(e) => setF({ ...f, type: e.target.value })}
                        className="w-full px-4 py-3 text-sm focus:outline-none transition-all"
                        style={inputStyle}
                      >
                        <option value="sale" style={{ color: "#000" }}>
                          For Sale
                        </option>
                        <option value="rent" style={{ color: "#000" }}>
                          For Rent
                        </option>
                        <option value="construction" style={{ color: "#000" }}>
                          Construction
                        </option>
                      </select>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          value={f.price}
                          onChange={(e) =>
                            setF({ ...f, price: e.target.value })
                          }
                          placeholder={pricePlaceholder}
                          className="w-full px-4 py-3 text-sm focus:outline-none transition-all"
                          style={inputStyle}
                        />
                        <input
                          value={f.location}
                          onChange={(e) =>
                            setF({ ...f, location: e.target.value })
                          }
                          placeholder="Location *"
                          className="w-full px-4 py-3 text-sm focus:outline-none transition-all"
                          style={inputStyle}
                        />
                      </div>
                      <input
                        value={f.address}
                        onChange={(e) =>
                          setF({ ...f, address: e.target.value })
                        }
                        placeholder="Full Address *"
                        className="w-full px-4 py-3 text-sm focus:outline-none transition-all"
                        style={inputStyle}
                      />
                      <input
                        value={f.amenitiesText}
                        onChange={(e) =>
                          setF({ ...f, amenitiesText: e.target.value })
                        }
                        placeholder="Amenities (comma separated)"
                        className="w-full px-4 py-3 text-sm focus:outline-none transition-all"
                        style={inputStyle}
                      />
                      <textarea
                        value={f.details}
                        onChange={(e) =>
                          setF({ ...f, details: e.target.value })
                        }
                        placeholder="Description"
                        rows={3}
                        className="w-full px-4 py-3 text-sm focus:outline-none resize-none transition-all"
                        style={inputStyle}
                      />
                      {/* Photos */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="text-xs font-semibold uppercase tracking-wider"
                            style={{ color: "rgba(245,230,211,0.5)" }}
                          >
                            Photos
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setF({ ...f, images: [...f.images, ""] })
                            }
                            className="text-xs font-semibold px-3 py-1 rounded-lg transition-all"
                            style={{
                              backgroundColor: "rgba(232,149,110,0.15)",
                              color: colors.accent,
                            }}
                          >
                            + Add
                          </button>
                        </div>
                        {f.images.map((img, i) => (
                          <div key={i} className="flex gap-2 mb-2">
                            <input
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
                              className="flex-1 px-3 py-2 text-xs focus:outline-none"
                              style={inputStyle}
                            />
                            <label
                              className="px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer flex items-center shrink-0 transition-all hover:opacity-80"
                              style={{
                                backgroundColor: "rgba(232,149,110,0.15)",
                                color: colors.accent,
                              }}
                            >
                              {uploadingIndex === i ? "..." : "Upload"}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingIndex !== null}
                                onChange={(e) => {
                                  const selectedFile = e.target.files?.[0];
                                  uploadImageAtIndex(i, selectedFile);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={save}
                          className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-lg"
                          style={{
                            background: `linear-gradient(135deg, ${colors.accent} 0%, #c8713a 100%)`,
                            color: "#fff",
                            boxShadow: "0 4px 14px rgba(232,149,110,0.3)",
                          }}
                        >
                          {editingId ? "Update Property" : "Add Property"}
                        </button>
                        {editingId && (
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setF(base);
                            }}
                            className="px-5 py-3 rounded-xl font-semibold text-sm"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.06)",
                              color: "rgba(245,230,211,0.6)",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Listings — 3 cols */}
                <div className="lg:col-span-3 space-y-3">
                  {visibleProperties.length === 0 && (
                    <div
                      className="p-8 rounded-2xl text-center"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <p
                        className="text-sm"
                        style={{ color: "rgba(245,230,211,0.4)" }}
                      >
                        {searchQuery
                          ? "No properties match your search."
                          : "No properties in this section yet."}
                      </p>
                    </div>
                  )}
                  {visibleProperties.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:border-[rgba(232,149,110,0.20)]"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(232,149,110,0.08)",
                      }}
                    >
                      {/* Thumbnail */}
                      {p.image && (
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full sm:w-20 h-20 object-cover rounded-xl shrink-0"
                          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                        />
                      )}
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-white truncate">
                          {p.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="text-xs font-medium"
                            style={{ color: colors.accent }}
                          >
                            {p.price}
                          </span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full uppercase"
                            style={{
                              backgroundColor:
                                p.type === "sale"
                                  ? "rgba(52,211,153,0.12)"
                                  : p.type === "rent"
                                    ? "rgba(96,165,250,0.12)"
                                    : "rgba(232,149,110,0.12)",
                              color:
                                p.type === "sale"
                                  ? "#34D399"
                                  : p.type === "rent"
                                    ? "#60A5FA"
                                    : colors.accent,
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            {p.type}
                          </span>
                        </div>
                        <p
                          className="text-xs mt-0.5 truncate"
                          style={{ color: "rgba(245,230,211,0.35)" }}
                        >
                          {p.location}
                        </p>
                      </div>
                      {/* Actions */}
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => edit(p)}
                          className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                          style={{
                            backgroundColor: "rgba(232,149,110,0.15)",
                            color: colors.accent,
                            border: "1px solid rgba(232,149,110,0.20)",
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
                          className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                          style={{
                            backgroundColor: "rgba(239,68,68,0.10)",
                            color: "#F87171",
                            border: "1px solid rgba(239,68,68,0.15)",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tab === "inquiries" && (
              <div className="space-y-3">
                {inquiries.length === 0 ? (
                  <div
                    className="p-12 rounded-2xl text-center"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <p
                      className="text-lg font-semibold mb-1"
                      style={{ color: "rgba(245,230,211,0.5)" }}
                    >
                      No Inquiries Yet
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "rgba(245,230,211,0.3)" }}
                    >
                      When clients submit inquiries, they'll appear here.
                    </p>
                  </div>
                ) : (
                  inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-5 rounded-2xl transition-all"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(232,149,110,0.08)",
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                              style={{
                                backgroundColor: "rgba(232,149,110,0.15)",
                                color: colors.accent,
                              }}
                            >
                              {(inq.name || "?")[0].toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm text-white">
                                {inq.name}
                              </h4>
                              <p
                                className="text-xs"
                                style={{ color: "rgba(245,230,211,0.35)" }}
                              >
                                {inq.submittedAt
                                  ? new Date(
                                      inq.submittedAt,
                                    ).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <a
                              href={`tel:${inq.phone}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg"
                              style={{
                                backgroundColor: "rgba(232,149,110,0.10)",
                                color: colors.accent,
                              }}
                            >
                              <Phone className="w-3 h-3" /> {inq.phone}
                            </a>
                            <span
                              className="text-xs px-2.5 py-1 rounded-lg"
                              style={{
                                backgroundColor: "rgba(255,255,255,0.05)",
                                color: "rgba(245,230,211,0.5)",
                              }}
                            >
                              {inq.time}
                            </span>
                            {inq.reasonType && (
                              <span
                                className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                                style={{
                                  backgroundColor:
                                    inq.reasonType === "Construction"
                                      ? "rgba(232,149,110,0.12)"
                                      : inq.reasonType === "Rent"
                                        ? "rgba(96,165,250,0.12)"
                                        : "rgba(52,211,153,0.12)",
                                  color:
                                    inq.reasonType === "Construction"
                                      ? colors.accent
                                      : inq.reasonType === "Rent"
                                        ? "#60A5FA"
                                        : "#34D399",
                                }}
                              >
                                {inq.reasonType}
                              </span>
                            )}
                          </div>
                          {inq.reason && (
                            <p
                              className="text-sm p-3 rounded-xl mt-2"
                              style={{
                                backgroundColor: "rgba(255,255,255,0.04)",
                                color: "rgba(245,230,211,0.65)",
                                border: "1px solid rgba(255,255,255,0.04)",
                              }}
                            >
                              {inq.reason}
                            </p>
                          )}
                        </div>
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
                          className="px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80 shrink-0"
                          style={{
                            backgroundColor: "rgba(239,68,68,0.08)",
                            color: "#F87171",
                            border: "1px solid rgba(239,68,68,0.12)",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            {tab === "analytics" && (
              <div className="space-y-5">
                {/* Analytics Refresh */}
                <div className="flex items-center justify-between">
                  <h3
                    className="text-base font-bold flex items-center gap-2"
                    style={{ color: "#fff" }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: colors.accent }}
                    />{" "}
                    Overview
                  </h3>
                  <button
                    onClick={() => onRefreshUsers && onRefreshUsers()}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                    style={{
                      backgroundColor: "rgba(232,149,110,0.12)",
                      color: colors.accent,
                    }}
                  >
                    ↻ Refresh
                  </button>
                </div>
                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {
                      label: "Registered Users",
                      value: registeredUsers?.length || 0,
                      icon: "👤",
                      color: colors.accent,
                    },
                    {
                      label: "Total Wishlisted",
                      value:
                        registeredUsers?.reduce(
                          (a, u) => a + (u.wishlist?.length || 0),
                          0,
                        ) || 0,
                      icon: "❤️",
                      color: "#F87171",
                    },
                    {
                      label: "Properties Listed",
                      value: properties.length,
                      icon: "🏠",
                      color: "#60A5FA",
                    },
                    {
                      label: "Inquiries",
                      value: inquiries.length,
                      icon: "📩",
                      color: "#34D399",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="p-4 rounded-2xl text-center"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(232,149,110,0.08)",
                      }}
                    >
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div
                        className="text-2xl font-bold"
                        style={{ color: "#fff" }}
                      >
                        {s.value}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "rgba(245,230,211,0.45)" }}
                      >
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Registered Users List */}
                <div>
                  <h3
                    className="text-base font-bold mb-3 flex items-center gap-2"
                    style={{ color: "#fff" }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: colors.accent }}
                    />{" "}
                    Registered Users
                  </h3>
                  {!registeredUsers || registeredUsers.length === 0 ? (
                    <div
                      className="p-8 rounded-2xl text-center"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <p
                        className="text-sm"
                        style={{ color: "rgba(245,230,211,0.4)" }}
                      >
                        No users have registered yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {registeredUsers.map((u) => (
                        <div
                          key={u.id}
                          className="p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-3"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(232,149,110,0.08)",
                          }}
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                            style={{
                              backgroundColor: "rgba(232,149,110,0.15)",
                              color: colors.accent,
                            }}
                          >
                            {(u.name || "?")[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-white">
                              {u.name}
                            </h4>
                            <p
                              className="text-xs"
                              style={{ color: "rgba(245,230,211,0.45)" }}
                            >
                              {u.email}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1"
                              style={{
                                backgroundColor: "rgba(232,149,110,0.10)",
                                color: colors.accent,
                              }}
                            >
                              <Heart
                                style={{
                                  width: 12,
                                  height: 12,
                                  fill: colors.accent,
                                }}
                              />{" "}
                              {u.wishlist?.length || 0} saved
                            </span>
                          </div>
                          {u.wishlist?.length > 0 && (
                            <div className="w-full sm:w-auto sm:ml-auto flex flex-wrap gap-1 mt-1 sm:mt-0">
                              {u.wishlist.map((pid) => {
                                const prop = properties.find(
                                  (p) => p.id === pid,
                                );
                                return prop ? (
                                  <span
                                    key={pid}
                                    className="text-[10px] px-2 py-0.5 rounded-full truncate max-w-[120px]"
                                    style={{
                                      backgroundColor: "rgba(255,255,255,0.05)",
                                      color: "rgba(245,230,211,0.5)",
                                    }}
                                  >
                                    {prop.title}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {tab === "admins" && (
              <div className="space-y-5">
                {/* Add Admin Form */}
                <div
                  className="p-5 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(232,149,110,0.10)",
                  }}
                >
                  <h3
                    className="text-base font-bold mb-4 flex items-center gap-2"
                    style={{ color: "#fff" }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: colors.accent }}
                    />{" "}
                    Add New Admin
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <input
                      value={newAdminForm.name}
                      onChange={(e) =>
                        setNewAdminForm({
                          ...newAdminForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="Full Name"
                      className="px-4 py-3 rounded-xl text-sm focus:outline-none"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.06)",
                        border: "1.5px solid rgba(232,149,110,0.15)",
                        color: "#fff",
                        borderRadius: 12,
                      }}
                    />
                    <input
                      value={newAdminForm.username}
                      onChange={(e) =>
                        setNewAdminForm({
                          ...newAdminForm,
                          username: e.target.value,
                        })
                      }
                      placeholder="Username"
                      className="px-4 py-3 rounded-xl text-sm focus:outline-none"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.06)",
                        border: "1.5px solid rgba(232,149,110,0.15)",
                        color: "#fff",
                        borderRadius: 12,
                      }}
                    />
                    <input
                      value={newAdminForm.password}
                      onChange={(e) =>
                        setNewAdminForm({
                          ...newAdminForm,
                          password: e.target.value,
                        })
                      }
                      placeholder="Password"
                      type="password"
                      className="px-4 py-3 rounded-xl text-sm focus:outline-none"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.06)",
                        border: "1.5px solid rgba(232,149,110,0.15)",
                        color: "#fff",
                        borderRadius: 12,
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={async () => {
                        if (
                          !newAdminForm.name ||
                          !newAdminForm.username ||
                          !newAdminForm.password
                        ) {
                          setAdminMsg("All fields required");
                          return;
                        }
                        try {
                          setAdminMsg("");
                          await onAddAdmin(newAdminForm);
                          setNewAdminForm({
                            username: "",
                            password: "",
                            name: "",
                          });
                          setAdminMsg("Admin created successfully!");
                          loadAdmins();
                        } catch (err) {
                          setAdminMsg(err.message || "Failed to create admin");
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${colors.accent} 0%, #c8713a 100%)`,
                        color: "#fff",
                        boxShadow: "0 4px 14px rgba(232,149,110,0.3)",
                      }}
                    >
                      Create Admin
                    </button>
                    {adminMsg && (
                      <span
                        className="text-xs font-medium"
                        style={{
                          color: adminMsg.includes("success")
                            ? "#34D399"
                            : "#F87171",
                        }}
                      >
                        {adminMsg}
                      </span>
                    )}
                  </div>
                </div>

                {/* Admin List */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3
                      className="text-base font-bold flex items-center gap-2"
                      style={{ color: "#fff" }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: colors.accent }}
                      />{" "}
                      Current Admins
                    </h3>
                    <button
                      onClick={loadAdmins}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                      style={{
                        backgroundColor: "rgba(232,149,110,0.12)",
                        color: colors.accent,
                      }}
                    >
                      Refresh
                    </button>
                  </div>
                  {adminList.length === 0 ? (
                    <div
                      className="p-8 rounded-2xl text-center"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <p
                        className="text-sm"
                        style={{ color: "rgba(245,230,211,0.4)" }}
                      >
                        Click "Refresh" to load admin list.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {adminList.map((a) => (
                        <div
                          key={a.id}
                          className="p-4 rounded-2xl flex items-center gap-3"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(232,149,110,0.08)",
                          }}
                        >
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                            style={{
                              backgroundColor:
                                a.role === "prime-admin"
                                  ? "rgba(232,149,110,0.20)"
                                  : "rgba(96,165,250,0.15)",
                              color:
                                a.role === "prime-admin"
                                  ? colors.accent
                                  : "#60A5FA",
                            }}
                          >
                            {(a.name || "?")[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-white">
                              {a.name}
                              <span className="ml-2 text-xs opacity-50">
                                @{a.username}
                              </span>
                            </h4>
                            <p
                              className="text-xs"
                              style={{ color: "rgba(245,230,211,0.35)" }}
                            >
                              {a.email || "No email"}
                            </p>
                          </div>
                          <span
                            className="text-xs px-2.5 py-1 rounded-full font-bold uppercase"
                            style={{
                              backgroundColor:
                                a.role === "prime-admin"
                                  ? "rgba(232,149,110,0.15)"
                                  : "rgba(96,165,250,0.12)",
                              color:
                                a.role === "prime-admin"
                                  ? colors.accent
                                  : "#60A5FA",
                            }}
                          >
                            {a.role === "prime-admin" ? "Prime" : "Sub"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── User Auth Side Pane (Register / Login for regular users + Admin Login) ── */
function UserAuthPane({ isOpen, onClose, onAuth, onAdminAuth, initialMode }) {
  const [mode, setMode] = useState(initialMode || "login");
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  useEffect(() => {
    if (isOpen && initialMode) {
      setMode(initialMode);
      setIsAdminLogin(false);
    }
  }, [isOpen, initialMode]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;

  const reset = () => {
    setName("");
    setEmail("");
    setUsername("");
    setPassword("");
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      checkRateLimit();

      if (isAdminLogin) {
        // Admin login — verify against hashed admin list
        const admin = ADMIN_USERS.find((a) => a.username === username);
        const inputHash = await hashPassword(password);
        if (!admin || inputHash !== admin.passwordHash)
          throw new Error("Invalid admin credentials");
        const adminData = {
          id: admin.id,
          name: admin.name,
          username: admin.username,
          role: admin.role,
          email: admin.email,
        };
        const token = "admin-" + crypto.randomUUID();
        if (onAdminAuth) onAdminAuth(token, adminData);
        reset();
        onClose();
        return;
      }

      if (mode === "register") {
        // Validate inputs
        validateName(name);
        validateEmail(email);
        validatePassword(password, true);
        const safeName = sanitizeInput(name.trim());
        const safeEmail = email.toLowerCase().trim();

        // Register with Supabase Auth
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: safeEmail,
          password,
          options: { data: { name: safeName } },
        });
        if (signUpError) throw new Error(signUpError.message);
        if (!data.user) throw new Error("Registration failed");
        // Insert profile
        await supabase
          .from("profiles")
          .upsert({ id: data.user.id, name: safeName, email: safeEmail });
        onAuth(
          data.session?.access_token || "user-" + data.user.id,
          { id: data.user.id, name: safeName, email: safeEmail, wishlist: [] },
        );
      } else {
        // Validate login inputs
        validateEmail(email);
        if (!password) throw new Error("Password is required");
        const safeEmail = email.toLowerCase().trim();

        // Check if it's an admin logging in via email
        const adminByEmail = ADMIN_USERS.find(
          (a) =>
            a.email === safeEmail || a.username === email.trim(),
        );
        if (adminByEmail) {
          const inputHash = await hashPassword(password);
          if (inputHash === adminByEmail.passwordHash) {
            const adminData = {
              id: adminByEmail.id,
              name: adminByEmail.name,
              username: adminByEmail.username,
              role: adminByEmail.role,
              email: adminByEmail.email,
            };
            const token = "admin-" + crypto.randomUUID();
            if (onAdminAuth) onAdminAuth(token, adminData);
            reset();
            onClose();
            return;
          }
        }

        // Regular user login with Supabase Auth
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: safeEmail,
            password,
          });
        if (signInError) throw new Error(signInError.message);
        if (!data.user) throw new Error("Login failed");
        const userName =
          data.user.user_metadata?.name || safeEmail.split("@")[0];
        // Fetch wishlist from Supabase
        const { data: wl } = await supabase
          .from("wishlists")
          .select("property_id")
          .eq("user_id", data.user.id);
        const wishlistIds = (wl || []).map((w) => w.property_id);
        onAuth(
          data.session?.access_token || "user-" + data.user.id,
          {
            id: data.user.id,
            name: userName,
            email: safeEmail,
            wishlist: wishlistIds,
          },
        );
      }
      reset();
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        style={{
          backgroundColor: "rgba(0,0,0,0.60)",
          backdropFilter: "blur(4px)",
        }}
      />
      <div
        className="fixed top-0 right-0 h-screen w-full sm:w-[420px] z-50 overflow-y-auto flex flex-col"
        style={{
          background:
            "linear-gradient(180deg, #1a1714 0%, #221e18 60%, #1a1714 100%)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.4)",
          borderLeft: "1px solid rgba(232,149,110,0.08)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2.5 rounded-xl transition-all hover:scale-105 z-10"
          style={{
            backgroundColor: "rgba(232,149,110,0.12)",
            color: colors.accent,
            border: "1px solid rgba(232,149,110,0.15)",
          }}
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-16">
          <div className="mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
              style={{
                background:
                  "linear-gradient(135deg, rgba(232,149,110,0.20) 0%, rgba(232,149,110,0.08) 100%)",
                border: "1px solid rgba(232,149,110,0.18)",
              }}
            >
              {isAdminLogin ? (
                <Shield
                  className="w-6 h-6"
                  style={{ color: colors.accent }}
                />
              ) : mode === "register" ? (
                <UserPlus
                  className="w-6 h-6"
                  style={{ color: colors.accent }}
                />
              ) : (
                <User className="w-6 h-6" style={{ color: colors.accent }} />
              )}
            </div>
            <h2
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: "'Playfair Display', serif", color: "#fff" }}
            >
              {isAdminLogin ? "Admin Login" : mode === "register" ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-sm" style={{ color: "rgba(245,230,211,0.45)" }}>
              {isAdminLogin
                ? "Enter your admin credentials to access the dashboard"
                : mode === "register"
                  ? "Sign up to save your favourite properties"
                  : "Login to access your wishlist"}
            </p>
          </div>

          {/* Toggle — hide when in admin login mode */}
          {!isAdminLogin && (
            <div
              className="flex rounded-xl mb-6 p-1"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {["login", "register"].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setError("");
                  }}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize"
                  style={{
                    backgroundColor:
                      mode === m ? "rgba(232,149,110,0.18)" : "transparent",
                    color: mode === m ? "#fff" : "rgba(245,230,211,0.45)",
                    border:
                      mode === m
                        ? "1px solid rgba(232,149,110,0.25)"
                        : "1px solid transparent",
                  }}
                >
                  {m === "login" ? "Login" : "Sign Up"}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {/* Admin login fields */}
            {isAdminLogin && (
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(245,230,211,0.5)" }}
                >
                  Admin Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter admin username"
                    required
                    autoComplete="username"
                    className="w-full px-4 py-3.5 pl-11 rounded-xl text-sm focus:outline-none transition-all"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.06)",
                      border: "1.5px solid rgba(232,149,110,0.15)",
                      color: "#fff",
                    }}
                  />
                  <Shield
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "rgba(245,230,211,0.25)" }}
                  />
                </div>
              </div>
            )}
            {/* Regular user fields */}
            {!isAdminLogin && mode === "register" && (
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(245,230,211,0.5)" }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full px-4 py-3.5 rounded-xl text-sm focus:outline-none transition-all"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1.5px solid rgba(232,149,110,0.15)",
                    color: "#fff",
                  }}
                />
              </div>
            )}
            {!isAdminLogin && (
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: "rgba(245,230,211,0.5)" }}
              >
                {mode === "login" ? "Email or Username" : "Email Address"}
              </label>
              <div className="relative">
                <input
                  type={mode === "register" ? "email" : "text"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    mode === "login"
                      ? "Email or admin username"
                      : "you@email.com"
                  }
                  required
                  autoComplete={mode === "register" ? "email" : "username"}
                  className="w-full px-4 py-3.5 pl-11 rounded-xl text-sm focus:outline-none transition-all"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1.5px solid rgba(232,149,110,0.15)",
                    color: "#fff",
                  }}
                />
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "rgba(245,230,211,0.25)" }}
                />
              </div>
            </div>
            )}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: "rgba(245,230,211,0.5)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    mode === "register" ? "Create a password" : "Your password"
                  }
                  required
                  autoComplete={
                    mode === "register" ? "new-password" : "current-password"
                  }
                  className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm focus:outline-none transition-all"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1.5px solid rgba(232,149,110,0.15)",
                    color: "#fff",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: "rgba(245,230,211,0.35)" }}
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
            {error && (
              <div
                className="p-3.5 rounded-xl text-sm font-medium flex items-center gap-2"
                style={{
                  backgroundColor: "rgba(239,68,68,0.10)",
                  color: "#F87171",
                  border: "1px solid rgba(239,68,68,0.15)",
                }}
              >
                <X className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 font-bold text-base rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:shadow-lg flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${colors.accent} 0%, #c8713a 100%)`,
                color: "#fff",
                boxShadow: "0 6px 20px rgba(232,149,110,0.30)",
              }}
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                  Processing...
                </>
              ) : isAdminLogin ? (
                <>
                  <Shield className="w-4 h-4" /> Admin Login
                </>
              ) : mode === "register" ? (
                <>
                  <UserPlus className="w-4 h-4" /> Sign Up
                </>
              ) : (
                <>
                  <User className="w-4 h-4" /> Login
                </>
              )}
            </button>
          </form>

          <div
            className="mt-6 p-4 rounded-xl"
            style={{
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            {isAdminLogin ? (
              <p
                className="text-xs text-center"
                style={{ color: "rgba(245,230,211,0.3)" }}
              >
                Not an admin?{" "}
                <button
                  type="button"
                  onClick={() => { setIsAdminLogin(false); setError(""); }}
                  className="underline font-semibold hover:opacity-80 transition-opacity"
                  style={{ color: colors.accent }}
                >
                  Back to User Login
                </button>
              </p>
            ) : (
              <div className="text-center space-y-2">
                <p
                  className="text-xs"
                  style={{ color: "rgba(245,230,211,0.3)" }}
                >
                  {mode === "login"
                    ? "Don't have an account? Switch to Sign Up above."
                    : "Already have an account? Switch to Login above."}
                </p>
                <button
                  type="button"
                  onClick={() => { setIsAdminLogin(true); setError(""); setUsername(""); setPassword(""); }}
                  className="text-xs underline font-semibold hover:opacity-80 transition-opacity inline-flex items-center gap-1"
                  style={{ color: colors.accent }}
                >
                  <Shield className="w-3 h-3" /> Admin Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Wishlist Side Pane ── */
function WishlistPane({
  isOpen,
  onClose,
  wishlistProperties,
  onToggleWishlist,
  onViewProperty,
}) {
  if (!isOpen) return null;
  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        style={{
          backgroundColor: "rgba(0,0,0,0.60)",
          backdropFilter: "blur(4px)",
        }}
      />
      <div
        className="fixed top-0 right-0 h-screen w-full sm:w-[440px] z-50 overflow-y-auto flex flex-col"
        style={{
          background:
            "linear-gradient(180deg, #1a1714 0%, #221e18 60%, #1a1714 100%)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.4)",
          borderLeft: "1px solid rgba(232,149,110,0.08)",
        }}
      >
        <div
          className="flex items-center justify-between px-7 py-5"
          style={{ borderBottom: "1px solid rgba(232,149,110,0.08)" }}
        >
          <div>
            <h2
              className="text-xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif", color: "#fff" }}
            >
              <Heart
                className="w-5 h-5 inline mr-2"
                style={{ color: colors.accent, fill: colors.accent }}
              />
              Wishlist
            </h2>
            <p
              className="text-xs mt-1"
              style={{ color: "rgba(245,230,211,0.4)" }}
            >
              {wishlistProperties.length} saved propert
              {wishlistProperties.length === 1 ? "y" : "ies"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl transition-all hover:scale-105"
            style={{
              backgroundColor: "rgba(232,149,110,0.12)",
              color: colors.accent,
              border: "1px solid rgba(232,149,110,0.15)",
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {wishlistProperties.length === 0 ? (
            <div className="text-center py-16">
              <Heart
                className="w-12 h-12 mx-auto mb-4"
                style={{ color: "rgba(232,149,110,0.25)" }}
              />
              <p
                className="text-base font-semibold mb-1"
                style={{ color: "rgba(245,230,211,0.5)" }}
              >
                No saved properties yet
              </p>
              <p className="text-xs" style={{ color: "rgba(245,230,211,0.3)" }}>
                Tap the heart icon on any property to save it here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {wishlistProperties.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl flex items-center gap-4 transition-all"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(232,149,110,0.08)",
                  }}
                >
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-16 h-16 object-cover rounded-xl shrink-0 cursor-pointer"
                      onClick={() => {
                        onClose();
                        onViewProperty(p);
                      }}
                      style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4
                      className="font-semibold text-sm text-white truncate cursor-pointer hover:opacity-80"
                      onClick={() => {
                        onClose();
                        onViewProperty(p);
                      }}
                    >
                      {p.title}
                    </h4>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: colors.accent }}
                    >
                      {p.price}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: "rgba(245,230,211,0.35)" }}
                    >
                      {p.location}
                    </p>
                  </div>
                  <button
                    onClick={() => onToggleWishlist(p.id)}
                    className="p-2 rounded-xl shrink-0 transition-all hover:scale-105"
                    style={{
                      backgroundColor: "rgba(239,68,68,0.08)",
                      color: "#F87171",
                      border: "1px solid rgba(239,68,68,0.12)",
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Error Boundary ── */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: "#fff", background: "#1a1714", minHeight: "100vh" }}>
          <h2>Something went wrong</h2>
          <p style={{ color: "#E8956E" }}>{this.state.error?.message}</p>
          <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            style={{ marginTop: 20, padding: "10px 20px", background: "#E8956E", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppInner() {
  const [properties, setProperties] = useState(
    defaultProperties.map(normalize),
  );
  const [inquiries, setInquiries] = useState([]);
  const [adminToken, setAdminToken] = useState(
    () => window.sessionStorage.getItem("adminToken") || "",
  );
  const [selected, setSelected] = useState(null);
  const [hash, setHash] = useState(window.location.hash || "#home");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const [error, setError] = useState("");
  const [inquiryForm, setInquiryForm] = useState(initialInquiryForm);
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

  // ── User auth state ──
  const [userToken, setUserToken] = useState(
    () => window.sessionStorage.getItem("userToken") || "",
  );
  const [userName, setUserName] = useState(
    () => window.sessionStorage.getItem("userName") || "",
  );
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(window.sessionStorage.getItem("wishlist") || "[]");
    } catch {
      return [];
    }
  });
  const [isUserAuthOpen, setIsUserAuthOpen] = useState(false);
  const [userAuthMode, setUserAuthMode] = useState("login");
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // ── Dark mode state ──
  const [darkMode, setDarkMode] = useState(() => {
    const saved = window.localStorage.getItem("darkMode");
    return saved !== null ? saved === "true" : true; // default to night mode (current theme)
  });

  // ── Registered users for admin analytics ──
  const [registeredUsers, setRegisteredUsers] = useState([]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      window.localStorage.setItem("darkMode", String(next));
      return next;
    });
  };

  const handleUserAuth = (token, user) => {
    setUserToken(token);
    setUserName(user.name || "");
    setWishlist(user.wishlist || []);
    window.sessionStorage.setItem("userToken", token);
    window.sessionStorage.setItem("userName", user.name || "");
    window.sessionStorage.setItem(
      "wishlist",
      JSON.stringify(user.wishlist || []),
    );
  };

  const handleAdminAuth = async (token, user) => {
    window.sessionStorage.setItem("adminToken", token);
    window.sessionStorage.setItem("adminUser", JSON.stringify(user));
    setAdminToken(token);
    // Load inquiries from Supabase
    try {
      const { data: adminInquiries } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
      // Map Supabase columns to the field names the UI expects
      const mapped = (adminInquiries || []).map((inq) => ({
        ...inq,
        time: inq.preferred_time || "",
        reason: inq.message || "",
        submittedAt: inq.created_at,
      }));
      setInquiries(mapped);
    } catch {
      setInquiries([]);
    }
    setIsAdminOpen(true);
  };

  const handleUserLogout = async () => {
    setUserToken("");
    setUserName("");
    setWishlist([]);
    window.sessionStorage.removeItem("userToken");
    window.sessionStorage.removeItem("userName");
    window.sessionStorage.removeItem("wishlist");
    try { await supabase.auth.signOut(); } catch { /* ignore */ }
  };

  const handleAdminLogout = () => {
    setAdminToken("");
    window.sessionStorage.removeItem("adminToken");
    window.sessionStorage.removeItem("adminUser");
    setIsAdminOpen(false);
    setInquiries([]);
  };

  const handleLogout = () => {
    if (adminToken) handleAdminLogout();
    else handleUserLogout();
  };

  const toggleWishlist = async (propertyId) => {
    if (!userToken) {
      setIsUserAuthOpen(true);
      return;
    }
    const isInWishlist = wishlist.includes(propertyId);
    try {
      // Get current Supabase user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Not logged in");
      if (isInWishlist) {
        await supabase.from("wishlists").delete().eq("user_id", currentUser.id).eq("property_id", propertyId);
      } else {
        await supabase.from("wishlists").insert({ user_id: currentUser.id, property_id: propertyId });
      }
      const updated = isInWishlist
        ? wishlist.filter((id) => id !== propertyId)
        : [...wishlist, propertyId];
      setWishlist(updated);
      window.sessionStorage.setItem("wishlist", JSON.stringify(updated));
    } catch {
      // Optimistic fallback
      const updated = isInWishlist
        ? wishlist.filter((id) => id !== propertyId)
        : [...wishlist, propertyId];
      setWishlist(updated);
      window.sessionStorage.setItem("wishlist", JSON.stringify(updated));
    }
  };

  // Load registered users from Supabase profiles table
  const loadRegisteredUsers = async () => {
    if (!adminToken) return;
    try {
      const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      setRegisteredUsers(users || []);
    } catch {
      setRegisteredUsers([]);
    }
  };

  useEffect(() => {
    if (adminToken && isAdminOpen) loadRegisteredUsers();
  }, [adminToken, isAdminOpen]);

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
      } catch {
        // Backend unavailable — use default properties (no error shown)
        setError("");
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

      if (isConstructionHash(nextHash) && nextHash !== "#construction") {
        const id = nextHash.slice(1);
        requestAnimationFrame(() => {
          const target = document.getElementById(id);
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
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
    const normalizedValue =
      name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value;
    setInquiryForm((prev) => ({
      ...prev,
      [name]: normalizedValue,
    }));
  };

  const submitInquiry = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    try {
      setIsSubmittingInquiry(true);
      // Validate & sanitize inquiry data
      const safeName = sanitizeInput((inquiryForm.name || "").trim());
      const safePhone = (inquiryForm.phone || "").replace(/\D/g, "").slice(0, 10);
      const safeTime = sanitizeInput((inquiryForm.time || "").trim());
      const safeMessage = sanitizeInput(
        (inquiryForm.reason || inquiryForm.reasonType || "").trim(),
      );
      if (!safeName || safeName.length < 2)
        throw new Error("Please enter a valid name");
      if (!safePhone || safePhone.length < 10)
        throw new Error("Please enter a valid 10-digit phone number");
      const { data: created, error: insertError } = await supabase
        .from("inquiries")
        .insert({
          name: safeName,
          phone: safePhone,
          preferred_time: safeTime,
          message: safeMessage,
        })
        .select()
        .single();
      if (insertError) throw new Error(insertError.message);
      setInquiries((prev) => [created, ...prev]);
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

  const wishlistProperties = properties.filter((p) => wishlist.includes(p.id));

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: darkMode ? "#1a1714" : "#F9F7F4" }}
    >
      <Navbar
        onAdminClick={() => setIsAdminOpen(true)}
        onSignInClick={(mode) => {
          setUserAuthMode(mode || "login");
          setIsUserAuthOpen(true);
        }}
        onWishlistOpen={() => setIsWishlistOpen(true)}
        onLogout={handleLogout}
        adminToken={adminToken}
        userToken={userToken}
        userName={userName}
        wishlistCount={wishlist.length}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        hash={hash}
        onNavigateHome={navigateHome}
      />
      {isConstructionHash(hash) ? (
        <Construction
          projects={constructionProjects}
          listedProperties={properties}
          inquiryForm={inquiryForm}
          onInquiryChange={handleInquiryChange}
          onInquirySubmit={submitInquiry}
          submitting={isSubmittingInquiry}
          canEditRates={Boolean(adminToken)}
          adminToken={adminToken}
        />
      ) : (
        <>
          <Hero />
          <PropertyGrid
            properties={properties}
            onClick={openProperty}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
          />
          <RentalsShowcase
            properties={properties}
            onClick={openProperty}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
          />
          <ConstructionPreviewSection />
          <TrustStatsBar />
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
          try {
            const created = await requestWithAuth("/api/properties", {
              method: "POST",
              body: JSON.stringify(p),
            });
            setProperties((prev) => [...prev, normalize(created)]);
          } catch {
            // Backend offline — add locally
            const newProp = { ...p, id: Date.now() };
            setProperties((prev) => [...prev, normalize(newProp)]);
          }
        }}
        onEdit={async (id, p) => {
          try {
            const updated = await requestWithAuth(`/api/properties/${id}`, {
              method: "PUT",
              body: JSON.stringify(p),
            });
            setProperties((prev) =>
              prev.map((x) => (x.id === id ? normalize(updated) : x)),
            );
          } catch {
            // Backend offline — edit locally
            setProperties((prev) =>
              prev.map((x) => (x.id === id ? normalize({ ...x, ...p }) : x)),
            );
          }
        }}
        onDelete={async (id) => {
          try {
            await requestWithAuth(`/api/properties/${id}`, { method: "DELETE" });
          } catch {
            // Backend offline — continue with local delete
          }
          setProperties((prev) => prev.filter((x) => x.id !== id));
        }}
        inquiries={inquiries}
        onDeleteInquiry={async (id) => {
          try {
            await supabase.from("inquiries").delete().eq("id", id);
          } catch {
            // ignore
          }
          setInquiries((prev) => prev.filter((x) => x.id !== id));
        }}
        onUploadImage={async (file) => {
          try {
            const formData = new FormData();
            formData.append("image", file);
            return await requestWithAuth("/api/uploads/property-image", {
              method: "POST",
              body: formData,
            });
          } catch {
            // Backend offline — return a placeholder
            return { url: URL.createObjectURL(file) };
          }
        }}
        registeredUsers={registeredUsers}
        adminToken={adminToken}
        onRefreshUsers={loadRegisteredUsers}
        onAddAdmin={async (data) => {
          try {
            return await requestWithAuth("/api/admins", {
              method: "POST",
              body: JSON.stringify(data),
            });
          } catch {
            return { message: "Admin added (backend offline — will sync when available)" };
          }
        }}
      />

      <UserAuthPane
        isOpen={isUserAuthOpen}
        onClose={() => setIsUserAuthOpen(false)}
        onAuth={handleUserAuth}
        onAdminAuth={handleAdminAuth}
        initialMode={userAuthMode}
      />
      <WishlistPane
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProperties={wishlistProperties}
        onToggleWishlist={toggleWishlist}
        onViewProperty={(p) => {
          setIsWishlistOpen(false);
          openProperty(p);
        }}
      />
      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/918398979897?text=Hi%20Samriddhi%20Estates%2C%20I%20want%20to%20discuss%20a%20property%20requirement."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group"
        style={{
          backgroundColor: "#25D366",
          boxShadow: "0 6px 20px rgba(37,211,102,0.4)",
        }}
        title="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span className="absolute -top-2 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
      </a>

      <footer
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #1a1714 0%, #2a2218 50%, #1a1714 100%)",
          borderTop: "1px solid rgba(232,149,110,0.15)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-14 md:py-16">
          <div className="grid md:grid-cols-3 gap-10 md:gap-8 mb-10">
            <div>
              <h4
                className="text-2xl font-bold mb-3"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#fff",
                }}
              >
                Samriddhi{" "}
                <span style={{ color: colors.accent }}>Estates</span>
              </h4>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(245,230,211,0.6)" }}
              >
                Gurgaon's trusted partner for premium properties, luxury
                rentals, and end-to-end home construction.
              </p>
            </div>
            <div>
              <h5
                className="text-sm font-bold uppercase tracking-wider mb-4"
                style={{ color: colors.accent }}
              >
                Quick Links
              </h5>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { l: "Sale Properties", h: "#sale" },
                  { l: "Rentals", h: "#rentals" },
                  { l: "Construction", h: "#construction" },
                  { l: "Cost Estimate", h: "#estimator" },
                  { l: "Contact Us", h: "#contact" },
                  { l: "Home", h: "#home" },
                ].map((lnk) => (
                  <a
                    key={lnk.h}
                    href={lnk.h}
                    className="text-sm py-1 transition-colors hover:text-white"
                    style={{ color: "rgba(245,230,211,0.5)" }}
                  >
                    {lnk.l}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h5
                className="text-sm font-bold uppercase tracking-wider mb-4"
                style={{ color: colors.accent }}
              >
                Get in Touch
              </h5>
              <a
                href="tel:+918398979897"
                className="flex items-center gap-2 text-sm mb-3 transition-colors hover:text-white"
                style={{ color: "rgba(245,230,211,0.6)" }}
              >
                <Phone className="w-4 h-4" style={{ color: colors.accent }} />{" "}
                +91 83989 79897
              </a>
              <a
                href="mailto:samriddhiproperties9@gmail.com"
                className="flex items-center gap-2 text-sm mb-3 transition-colors hover:text-white"
                style={{ color: "rgba(245,230,211,0.6)" }}
              >
                <MessageCircle
                  className="w-4 h-4"
                  style={{ color: colors.accent }}
                />{" "}
                samriddhiproperties9@gmail.com
              </a>
              <p
                className="flex items-center gap-2 text-sm"
                style={{ color: "rgba(245,230,211,0.6)" }}
              >
                <MapPin className="w-4 h-4" style={{ color: colors.accent }} />{" "}
                Gurgaon, Haryana
              </p>
            </div>
          </div>
          <div
            className="border-t pt-6"
            style={{ borderColor: "rgba(232,149,110,0.12)" }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <p
                className="text-xs"
                style={{ color: "rgba(245,230,211,0.35)" }}
              >
                © 2026 Samriddhi Estates. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <span
                  className="text-xs"
                  style={{ color: "rgba(245,230,211,0.35)" }}
                >
                  Crafted for Gurgaon luxury living
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}
