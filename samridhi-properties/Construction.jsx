import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Hammer,
  Building2,
  Home,
  Settings,
  FileText,
  Palette,
  Star,
  Phone,
  MapPin,
  Send,
  ChevronRight,
  Landmark,
  IndianRupee,
  Clock3,
  BadgeCheck,
  Layers3,
  Calculator,
} from "lucide-react";

const colors = {
  accent: "#E8956E",
  accentSoft: "#D4A574",
  cream: "#F5E6D3",
  dark: "#1a1a1a",
  body: "#666B63",
};

const constructionBg =
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1920&q=80";
const aboutBg =
  "https://images.unsplash.com/photo-1578896883415-139635c3d296?auto=format&fit=crop&w=1600&q=80";
const ctaBg =
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1920&q=80";

const projects = [
  {
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118a?auto=format&fit=crop&w=800&q=80",
    name: "Luxury Villa - Golf Course Road",
    location: "Golf Course Road",
    type: "Villa",
    size: "5000 sqft",
    status: "Completed",
  },
  {
    image:
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80",
    name: "Modern 4BHK Residence",
    location: "DLF Phase 2",
    type: "Residential",
    size: "3500 sqft",
    status: "Ongoing",
  },
  {
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    name: "Commercial Office",
    location: "MG Road",
    type: "Commercial",
    size: "10000 sqft",
    status: "Completed",
  },
  {
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    name: "Farmhouse Project",
    location: "Sohna Road",
    type: "Farmhouse",
    size: "2 Acres",
    status: "Ongoing",
  },
];

const testimonials = [
  {
    quote:
      "Samriddhi Properties built our dream villa in Gurgaon with exceptional quality and professionalism.",
    name: "Rajesh K.",
    rating: 5,
  },
  {
    quote:
      "Turnkey construction was seamless from design to handover. Highly recommended!",
    name: "Priya S.",
    rating: 5,
  },
  {
    quote:
      "Transparent pricing and on-time delivery. Best civil contractor in Gurgaon.",
    name: "Amit M.",
    rating: 4.9,
  },
];

const services = [
  {
    icon: Home,
    title: "Home Construction",
    desc: "Independent floors, villas, duplex homes and plotted residences built end-to-end.",
  },
  {
    icon: Building2,
    title: "Commercial Construction",
    desc: "Offices, retail spaces, clinics and mixed-use developments with modern execution.",
  },
  {
    icon: Settings,
    title: "Renovation & Remodeling",
    desc: "Structural upgrades, floor additions, facade refresh and full modernisation.",
  },
  {
    icon: FileText,
    title: "Turnkey Construction",
    desc: "Planning, approvals, procurement, execution and final handover from one team.",
  },
  {
    icon: Palette,
    title: "Architectural Planning",
    desc: "Floor plans, 3D views, space planning, vastu-led layouts and design coordination.",
  },
  {
    icon: Layers3,
    title: "Interior & Finishing",
    desc: "Modular kitchens, wardrobes, false ceiling, stone work, lighting and furnishing support.",
  },
];

const packageMultipliers = {
  standard: 1,
  premium: 1.18,
  luxury: 1.36,
};

const finishLabels = {
  standard: "Value Build",
  premium: "Premium Build",
  luxury: "Luxury Build",
};

const timelineBySize = (size) => {
  if (!size) return "Project timeline varies by plot and specification";
  if (size <= 1500) return "Approx. 6-8 months";
  if (size <= 3000) return "Approx. 8-11 months";
  if (size <= 5000) return "Approx. 11-14 months";
  return "Approx. 14-18 months";
};

const budgetFormat = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function Construction({
  projects: incomingProjects,
  listedProperties = [],
  inquiryForm,
  onInquiryChange,
  onInquirySubmit,
  submitting = false,
  canEditRates = false,
  adminToken = "",
}) {
  // --- Rate management state/hooks ---
  const [packageRates, setPackageRates] = useState({
    standard: 2200,
    premium: 3000,
    luxury: 4500,
  });
  const [showRateEditor, setShowRateEditor] = useState(false);
  const [rateEdit, setRateEdit] = useState({
    standard: 2200,
    premium: 3000,
    luxury: 4500,
  });
  const [rateMsg, setRateMsg] = useState("");

  useEffect(() => {
    fetch("/api/construction-rates")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.standard && data.premium && data.luxury) {
          setPackageRates(data);
          setRateEdit(data);
        }
      });
  }, []);

  const handleRateEditChange = (e) => {
    setRateEdit({ ...rateEdit, [e.target.name]: Number(e.target.value) });
  };

  const handleRateUpdate = async () => {
    setRateMsg("");
    try {
      if (!adminToken) {
        setRateMsg("Please login as admin to update rates.");
        return;
      }
      const res = await fetch("/api/construction-rates", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(rateEdit),
      });
      if (res.ok) {
        const data = await res.json();
        setPackageRates(data);
        setRateMsg("Rates updated successfully.");
      } else {
        setRateMsg("Failed to update rates.");
      }
    } catch {
      setRateMsg("Error updating rates.");
    }
  };

  const [estimator, setEstimator] = useState({
    size: "",
    floors: 1,
    type: "premium",
  });
  const [submitted, setSubmitted] = useState(false);
  const sectionRefs = useRef([]);

  const projectList = (
    incomingProjects && incomingProjects.length ? incomingProjects : projects
  ).slice(0, 12);

  const constructionListings = (listedProperties || []).filter(
    (property) => property.type === "construction",
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.15 },
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const handleCalcChange = (e) => {
    setEstimator((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.name === "floors" ? Number(e.target.value) : e.target.value,
    }));
  };

  const budget = useMemo(() => {
    const size = Number(estimator.size || 0);
    const floors = Number(estimator.floors || 1);
    const rate = packageRates[estimator.type];
    if (!size || !rate) return null;

    const builtUpArea = size * floors;
    const baseCost = builtUpArea * rate;
    const designFees = Math.round(baseCost * 0.05);
    const approvals = Math.round(Math.max(75000, size * 35));
    const contingency = Math.round(baseCost * 0.07);
    const total = baseCost + designFees + approvals + contingency;

    return {
      builtUpArea,
      baseCost,
      designFees,
      approvals,
      contingency,
      total,
      timeline: timelineBySize(size * floors),
    };
  }, [estimator]);

  const submitForm = async (e) => {
    e.preventDefault();
    if (!onInquirySubmit) return;
    try {
      await onInquirySubmit(e);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3500);
    } catch {
      // Parent handler already manages user-facing error state.
    }
  };

  const goToProjects = (e) => {
    e.preventDefault();
    const target = document.getElementById("projects");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.hash = "#projects";
    }
  };

  return (
    <section id="construction" className="min-h-screen">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reveal { opacity: 0; transform: translateY(18px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .reveal.show { opacity: 1; transform: translateY(0); }
      `}</style>

      <section
        ref={(el) => (sectionRefs.current[0] = el)}
        className="relative min-h-[78vh] md:min-h-[92vh] flex items-center justify-center overflow-hidden reveal"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(10,10,10,0.78) 0%, rgba(26,26,26,0.76) 40%, rgba(232,149,110,0.42) 80%), url(${constructionBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div
          className="max-w-6xl px-4 md:px-6 text-center relative z-10 select-none"
          style={{ WebkitUserSelect: "none", userSelect: "none" }}
        >
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white/90 text-xs md:text-sm font-semibold mb-5 md:mb-6">
            <BadgeCheck className="w-4 h-4" />
            Gurgaon construction specialists for residential and commercial
            builds
          </div>
          <h1
            className="text-3xl md:text-6xl font-extrabold mb-3 md:mb-4 leading-tight"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#fff",
              textShadow: "0 14px 28px rgba(0,0,0,0.45)",
            }}
          >
            Civil Contractor & Construction Services in Gurgaon
          </h1>
          <h2
            className="text-base md:text-2xl font-medium mb-7 md:mb-10 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.93)" }}
          >
            Design, approvals, execution and finishing under one roof. Build
            villas, floors, commercial spaces and renovations with transparent
            pricing and milestone-based project tracking.
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <a
              href="#contact-construction"
              className="px-6 md:px-10 py-3 md:py-4 rounded-full font-bold text-base md:text-lg bg-orange-500 text-white shadow-lg shadow-orange-300/50 hover:bg-orange-600 transition-all"
            >
              Get free consultation
            </a>
            <a
              href="#projects"
              onClick={goToProjects}
              className="px-6 md:px-10 py-3 md:py-4 rounded-full font-bold text-base md:text-lg border-2 border-white text-white hover:bg-white hover:text-black transition-all"
            >
              Our recent projects
            </a>
          </div>
        </div>
      </section>

      <section
        ref={(el) => (sectionRefs.current[1] = el)}
        className="py-14 md:py-24 px-4 md:px-6 max-w-7xl mx-auto reveal"
        style={{ backgroundColor: "#f8f8f8" }}
      >
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h2
              className="text-3xl md:text-5xl font-bold mb-4 md:mb-6"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: colors.dark,
              }}
            >
              Trusted Civil Contractor in Gurgaon
            </h2>
            <p
              className="text-base md:text-lg mb-5 md:mb-6 leading-relaxed"
              style={{ color: colors.body, lineHeight: 1.7 }}
            >
              Samriddhi Properties delivers construction with one-point
              accountability. From plot review and concept planning to finishing
              and handover, you get practical design guidance, local execution
              expertise and disciplined cost control.
            </p>
            <ul className="space-y-3 text-base md:text-lg">
              <li className="flex items-start gap-3">
                <Hammer className="w-6 h-6 mt-1 flex-shrink-0 text-accent" />
                Residential construction for floors, villas and duplex homes
              </li>
              <li className="flex items-start gap-3">
                <Building2 className="w-6 h-6 mt-1 flex-shrink-0 text-accent" />
                Commercial and mixed-use projects with turnkey delivery
              </li>
              <li className="flex items-start gap-3">
                <Landmark className="w-6 h-6 mt-1 flex-shrink-0 text-accent" />
                Structural upgrades, approval support and project planning
              </li>
              <li className="flex items-start gap-3">
                <Home className="w-6 h-6 mt-1 flex-shrink-0 text-accent" />
                Farmhouse, plotted and custom home construction
              </li>
              <li className="flex items-start gap-3">
                <Settings className="w-6 h-6 mt-1 flex-shrink-0 text-accent" />
                Renovation, extension, facade and interior execution
              </li>
              <li className="flex items-start gap-3">
                <FileText className="w-6 h-6 mt-1 flex-shrink-0 text-accent" />
                BOQ, stage-wise timeline and milestone-based budgeting
              </li>
            </ul>
          </div>
          <div className="relative">
            <img
              src={aboutBg}
              alt="Construction project"
              className="rounded-3xl shadow-2xl w-full h-[320px] md:h-[500px] object-cover"
            />
          </div>
        </div>
      </section>

      <section
        ref={(el) => (sectionRefs.current[2] = el)}
        className="py-14 md:py-24 px-4 md:px-6 reveal"
        style={{ backgroundColor: "#f8f8f8" }}
      >
        <div className="max-w-7xl mx-auto text-center mb-12 md:mb-20">
          <h2
            className="text-3xl md:text-6xl font-bold mb-4 md:mb-6"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: colors.dark,
            }}
          >
            Our Construction Services
          </h2>
          <p
            className="text-base md:text-lg max-w-3xl mx-auto"
            style={{ color: colors.body }}
          >
            Full-service execution tailored for homeowners, investors and plot
            owners who want clarity on planning, budget, quality and delivery.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8 max-w-7xl mx-auto px-1 md:px-6">
          {services.map((service, i) => (
            <div
              key={i}
              className="group p-5 md:p-8 rounded-3xl hover:-translate-y-2 md:hover:-translate-y-4 transition-all duration-500 hover:shadow-2xl border border-gray-100 hover:border-accent/30 bg-white"
              style={{ borderColor: "rgba(232,149,110,0.1)" }}
            >
              <service.icon className="w-12 h-12 md:w-16 md:h-16 text-accent mb-4 md:mb-6 group-hover:scale-110 transition-transform" />
              <h3
                className="text-xl md:text-2xl font-bold mb-3 md:mb-4 group-hover:text-accent transition-colors"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {service.title}
              </h3>
              <p
                className="text-sm md:text-lg leading-relaxed"
                style={{ color: colors.body }}
              >
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        ref={(el) => (sectionRefs.current[3] = el)}
        id="projects"
        className="py-14 md:py-24 px-4 md:px-6 reveal"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="max-w-7xl mx-auto text-center mb-12 md:mb-20">
          <h2
            className="text-3xl md:text-6xl font-bold mb-4 md:mb-6"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: colors.dark,
            }}
          >
            Our Recent Construction Projects
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8 max-w-7xl mx-auto">
          {projectList.map((project, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-3xl bg-white shadow-xl transition-all duration-700 cursor-pointer hover:-translate-y-3"
              style={{ borderTop: `5px solid ${colors.accent}` }}
            >
              <div className="relative overflow-hidden h-52 md:h-64">
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="inline-block px-4 py-2 rounded-full bg-black/75 text-white text-sm font-bold mb-2">
                    {project.status}
                  </span>
                </div>
              </div>
              <div className="p-5 md:p-8">
                <h3
                  className="text-xl md:text-2xl font-bold mb-2"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: colors.dark,
                  }}
                >
                  {project.name}
                </h3>
                <p
                  className="flex items-center gap-2 mb-2 text-lg font-semibold"
                  style={{ color: colors.accent }}
                >
                  <MapPin className="w-5 h-5" />
                  {project.location}
                </p>
                <p className="text-sm mb-1" style={{ color: colors.body }}>
                  {project.type} • {project.size}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {constructionListings.length > 0 && (
        <section className="py-14 md:py-24 px-4 md:px-6" style={{ backgroundColor: "#fff7f2" }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 md:mb-14">
              <h2
                className="text-3xl md:text-5xl font-bold mb-4"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: colors.dark,
                }}
              >
                Listed Construction Opportunities
              </h2>
              <p
                className="text-base md:text-lg max-w-3xl mx-auto"
                style={{ color: colors.body }}
              >
                Admin-added construction listings are shown here automatically,
                so your construction team can highlight active custom-build
                opportunities and featured projects.
              </p>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-8">
              {constructionListings.map((property) => (
                <div
                  key={property.id}
                  className="rounded-3xl overflow-hidden bg-white border border-orange-100 shadow-lg"
                >
                  <div className="h-48 md:h-60 overflow-hidden">
                    <img
                      src={property.images?.[0] || property.image}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 md:p-7">
                    <div className="inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-orange-100 text-orange-700 mb-4">
                      Construction Listing
                    </div>
                    <h3
                      className="text-xl md:text-2xl font-bold mb-2"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: colors.dark,
                      }}
                    >
                      {property.title}
                    </h3>
                    <p
                      className="flex items-center gap-2 text-sm mb-3"
                      style={{ color: colors.accent }}
                    >
                      <MapPin className="w-4 h-4" />
                      {property.location}
                    </p>
                    <p className="text-sm mb-4" style={{ color: colors.body }}>
                      {property.details || property.address}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {(property.amenities || []).slice(0, 4).map((item) => (
                        <span
                          key={item}
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: colors.cream,
                            color: colors.dark,
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className="text-base md:text-lg font-bold"
                        style={{ color: colors.dark }}
                      >
                        {property.price}
                      </span>
                      <a
                        href="#contact-construction"
                        className="px-4 py-2 rounded-full text-sm font-semibold text-white"
                        style={{ backgroundColor: colors.accent }}
                      >
                        Enquire Now
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        ref={(el) => (sectionRefs.current[4] = el)}
        className="py-14 md:py-24 px-4 md:px-6 reveal"
        style={{ backgroundColor: "#F3F4F6" }}
      >
        <div className="max-w-6xl mx-auto text-center mb-12 md:mb-20">
          <h2
            className="text-3xl md:text-6xl font-bold mb-4 md:mb-6"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: colors.dark,
            }}
          >
            Our Construction Process
          </h2>
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-5">
            {[
              {
                num: "01",
                title: "Consultation",
                desc: "Requirement discussion, plot review and project goals.",
              },
              {
                num: "02",
                title: "Planning & Design",
                desc: "Drawings, structure planning, BOQ and approvals support.",
              },
              {
                num: "03",
                title: "Cost & Timeline",
                desc: "Stage-wise estimate, milestone mapping and material strategy.",
              },
              {
                num: "04",
                title: "Execution",
                desc: "Foundation, structure, MEP, finishes and quality checks.",
              },
              {
                num: "05",
                title: "Handover",
                desc: "Final inspection, snag closure and project delivery.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="rounded-3xl p-5 md:p-8 bg-white border border-gray-200 shadow-sm text-center"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto mb-5"
                  style={{
                    backgroundColor: colors.accent,
                    color: "#fff",
                  }}
                >
                  {step.num}
                </div>
                <h3
                  className="text-xl md:text-2xl font-bold mb-3"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: colors.dark,
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ color: colors.body }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-24 px-4 md:px-6 relative">
        <div className="max-w-4xl mx-auto text-center mb-12 md:mb-20">
          <h2
            className="text-3xl md:text-6xl font-bold mb-4 md:mb-6"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: colors.dark,
            }}
          >
            Why Choose Samriddhi Properties
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: Star,
              title: "Experienced Contractors",
              desc: "Execution expertise across villas, floors, commercial shells and upgrades.",
            },
            {
              icon: FileText,
              title: "Transparent Pricing",
              desc: "Detailed estimate structure with package comparison and budget clarity.",
            },
            {
              icon: Hammer,
              title: "High Quality Materials",
              desc: "Reliable sourcing and specification-led procurement for long-term performance.",
            },
            {
              icon: Clock3,
              title: "Dedicated Management",
              desc: "One project point-of-contact and regular progress coordination.",
            },
            {
              icon: ChevronRight,
              title: "On-Time Delivery",
              desc: "Milestone planning that keeps site progress aligned with target handover.",
            },
            {
              icon: Palette,
              title: "Modern Architecture",
              desc: "Functional layouts, premium finishes and design-forward execution.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-5 md:p-8 rounded-2xl hover:bg-accent/5 transition-all group"
            >
              <item.icon className="w-12 h-12 md:w-16 md:h-16 text-accent mb-4 md:mb-6 group-hover:scale-110 transition-transform mx-auto" />
              <h3
                className="text-xl md:text-2xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {item.title}
              </h3>
              <p style={{ color: colors.body }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="estimator"
        className="py-12 md:py-24 px-3 md:px-6 luxury-gradient relative overflow-x-hidden"
        style={{
          background: `linear-gradient(135deg, #FAF8F5 0%, #F5E6D3 25%, #F0E8E0 50%, #E8DED5 75%, #FAF8F5 100%)`,
          overflow: "hidden",
        }}
      >
        {/* Floating shapes for 3D effect */}
        <div className="float-shape float-shape-1" />
        <div className="float-shape float-shape-2" />
        <div className="float-shape float-shape-3" />
        <div className="max-w-4xl mx-auto text-center mb-10 md:mb-16">
          <h2
            className="text-3xl md:text-6xl font-bold mb-4 md:mb-6 text-accent"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Estimate Your Construction Cost
          </h2>
          <p className="text-base md:text-2xl text-accent/80 px-2">
            Better visibility into budget, built-up area and delivery timeline
          </p>
        </div>
        <div className="bg-white/90 luxury-gradient rounded-2xl md:rounded-3xl p-3 md:p-12 max-w-5xl w-full mx-auto border border-accent/20 shadow-2xl relative overflow-hidden">
          {/* Transparent button (like 'Our recent projects') */}

          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 md:gap-10 items-start">
            <div className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-sm md:text-xl font-bold text-slate-900 mb-2 md:mb-3">
                  Plot Size (sq ft)
                </label>
                <input
                  name="size"
                  type="number"
                  min="0"
                  value={estimator.size}
                  onChange={handleCalcChange}
                  className="w-full p-2.5 md:p-5 rounded-2xl text-base md:text-2xl font-bold text-center border-2 border-orange-200 focus:border-orange-400 bg-white text-slate-900 placeholder-slate-400"
                  placeholder="Enter plot area"
                />
              </div>
              <div>
                <label className="block text-sm md:text-xl font-bold text-slate-900 mb-2 md:mb-3">
                  Number of Floors
                </label>
                <select
                  name="floors"
                  value={estimator.floors}
                  onChange={handleCalcChange}
                  className="w-full p-2.5 md:p-5 rounded-2xl text-sm md:text-xl font-bold text-center border-2 border-orange-200 focus:border-orange-400 bg-white text-slate-900"
                >
                  <option value={1}>Ground Floor</option>
                  <option value={2}>G + 1 Floors</option>
                  <option value={3}>G + 2 Floors</option>
                  <option value={4}>G + 3 Floors</option>
                </select>
              </div>
              {/* Admin Rate Editor (toggle for demo) */}
              {canEditRates && (
                <div className="flex justify-end mb-2">
                  <button
                    className="text-xs px-3 py-1 rounded bg-purple-100 text-purple-700 hover:bg-purple-200"
                    onClick={() => setShowRateEditor((v) => !v)}
                    type="button"
                  >
                    {showRateEditor
                      ? "Hide Rate Editor"
                      : "Edit Construction Rates (Admin)"}
                  </button>
                </div>
              )}
              {canEditRates && showRateEditor && (
                <div className="p-4 mb-6 rounded-2xl bg-white border-2 border-purple-200">
                  <div className="flex gap-3 mb-2 overflow-x-auto pb-1">
                    {Object.keys(packageRates).map((key) => (
                      <div key={key} className="flex flex-col items-center">
                        <label className="text-xs font-semibold mb-1 capitalize">
                          {finishLabels[key]}
                        </label>
                        <input
                          type="number"
                          name={key}
                          value={rateEdit[key]}
                          onChange={handleRateEditChange}
                          className="w-24 p-2 border rounded text-center"
                          min={100}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    className="px-4 py-2 rounded bg-purple-600 text-white font-bold hover:bg-purple-700"
                    onClick={handleRateUpdate}
                    type="button"
                  >
                    Update Rates
                  </button>
                  {rateMsg && (
                    <div className="mt-2 text-sm text-purple-700">
                      {rateMsg}
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                {Object.entries(packageRates).map(([key, rate]) => (
                  <div
                    key={key}
                    onClick={() =>
                      setEstimator((prev) => ({ ...prev, type: key }))
                    }
                    className={`cursor-pointer rounded-xl md:rounded-2xl px-2 py-3 md:px-7 md:py-5 border-2 transition-all duration-300 text-center shadow-md select-none
                      ${
                        estimator.type === key
                          ? "border-accent bg-white md:scale-105"
                          : "border-accent/30 bg-accent/5 hover:bg-accent/10"
                      }`}
                  >
                    <p className="text-[10px] md:text-xs font-semibold text-accent mb-1 uppercase tracking-wide">
                      {finishLabels[key]}
                    </p>
                    <p className="text-lg md:text-3xl font-extrabold text-accent leading-none">
                      ₹{rate}
                    </p>
                    <p className="text-[10px] md:text-xs text-accent/70">per sq ft</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 md:space-y-5">
              {budget ? (
                <>
                  <div className="p-4 md:p-6 rounded-3xl bg-white border-2 border-orange-300">
                    <div className="flex items-center gap-3 mb-2 text-slate-700">
                      <Calculator className="w-5 h-5" />
                      <span className="font-semibold text-sm md:text-base">
                        Estimated Project Budget
                      </span>
                    </div>
                    <p className="text-xl md:text-4xl font-bold text-orange-600 drop-shadow-lg break-words">
                      {budgetFormat(budget.total)}
                    </p>
                    <p className="text-sm md:text-base mt-2 text-slate-600">
                      Approximate all-in estimate for{" "}
                      {budget.builtUpArea.toLocaleString()} sqft built-up area
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {[
                      {
                        label: "Civil construction",
                        value: budgetFormat(budget.baseCost),
                        icon: IndianRupee,
                      },
                      {
                        label: "Design & coordination",
                        value: budgetFormat(budget.designFees),
                        icon: Palette,
                      },
                      {
                        label: "Approvals & statutory buffer",
                        value: budgetFormat(budget.approvals),
                        icon: FileText,
                      },
                      {
                        label: "Contingency reserve",
                        value: budgetFormat(budget.contingency),
                        icon: BadgeCheck,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white px-4 md:px-5 py-3 md:py-4 border border-orange-100 gap-2"
                      >
                        <div className="flex items-center gap-2 md:gap-3 text-slate-700 min-w-0">
                          <item.icon className="w-5 h-5 text-orange-500" />
                          <span className="font-semibold text-sm md:text-base break-words">{item.label}</span>
                        </div>
                        <span className="font-bold text-sm md:text-base text-slate-900 break-all text-left sm:text-right">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl bg-slate-900 text-white p-4 md:p-6">
                    <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                      <span className="text-white/80">Recommended package</span>
                      <span className="font-bold">
                        {finishLabels[estimator.type]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                      <span className="text-white/80">Complexity factor</span>
                      <span className="font-bold">
                        x{packageMultipliers[estimator.type].toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <span className="text-white/80">Expected timeline</span>
                      <span className="font-bold">{budget.timeline}</span>
                    </div>
                  </div>
                </>
              ) : (
                  <div className="rounded-3xl bg-white border border-orange-200 p-5 md:p-8 text-center">
                    <Calculator className="w-10 h-10 md:w-12 md:h-12 text-orange-500 mx-auto mb-3 md:mb-4" />
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
                    Start with your plot size
                  </h3>
                    <p className="text-sm md:text-base text-slate-600">
                    Enter plot area, floors and package to generate a realistic
                    working estimate.
                  </p>
                </div>
              )}
              <a
                href="#contact-construction"
                className="block w-full p-3 md:p-6 rounded-2xl font-extrabold text-base md:text-2xl text-center bg-accent text-white shadow-2xl hover:scale-105 transition-all border-2 md:border-4 border-accent/30 ring-2 ring-accent/20"
                style={{
                  boxShadow:
                    "0 8px 32px 0 rgba(232,149,110,0.25), 0 1.5px 8px 0 #E8956E",
                  backgroundColor: "#E8956E",
                }}
              >
                Get Free Quote
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-24 px-4 md:px-6 bg-cream">
        <div className="max-w-4xl mx-auto text-center mb-12 md:mb-20">
          <h2
            className="text-3xl md:text-6xl font-bold mb-4 md:mb-6"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: colors.dark,
            }}
          >
            What Our Clients Say
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5 md:gap-8 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="p-6 md:p-10 rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all border border-gray-100"
            >
              <div className="flex items-center justify-center gap-1 mb-6">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    className={`w-6 h-6 ${
                      j < Math.floor(t.rating)
                        ? "text-accent fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p
                className="text-base md:text-xl italic mb-6 md:mb-8 leading-relaxed"
                style={{ color: colors.body }}
              >
                "{t.quote}"
              </p>
              <h4
                className="text-xl md:text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: colors.dark,
                }}
              >
                {t.name}
              </h4>
            </div>
          ))}
        </div>
      </section>

      <section
        className="relative py-20 md:py-32 px-4 md:px-6 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(26,26,26,0.8) 0%, rgba(232,149,110,0.4) 50%, rgba(26,26,26,0.8) 100%), url(${ctaBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2
            className="text-3xl md:text-7xl font-bold mb-4 md:mb-6 text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Planning to Build Your Dream Home?
          </h2>
          <p className="text-base md:text-2xl mb-8 md:mb-12 text-white/90">
            Get a detailed quote, material roadmap and build timeline from our
            construction team.
          </p>
          <a
            href="#contact-construction"
            className="inline-block px-8 md:px-12 py-4 md:py-6 rounded-2xl font-bold text-lg md:text-2xl bg-accent text-white shadow-2xl hover:scale-105 transition-all"
          >
            Request Construction Quote
          </a>
        </div>
      </section>

      <section
        id="contact-construction"
        className="py-14 md:py-24 px-4 md:px-6 max-w-4xl mx-auto"
      >
        <div className="text-center mb-10 md:mb-16">
          <h2
            className="text-3xl md:text-6xl font-bold mb-4 md:mb-6"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: colors.dark,
            }}
          >
            Submit Construction Inquiry
          </h2>
          <p className="text-base md:text-xl" style={{ color: colors.body }}>
            Use the common inquiry form below and select{" "}
            <span className="font-semibold">Construction</span> as the reason.
          </p>
        </div>
        <form
          onSubmit={submitForm}
          className="grid gap-5 md:gap-6 p-5 md:p-10 rounded-3xl bg-white shadow-2xl border border-gray-100"
          style={{ boxShadow: "0 30px 60px rgba(0,0,0,0.1)" }}
        >
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block font-bold text-base md:text-lg mb-2 md:mb-3">Full Name</label>
              <input
                name="name"
                value={inquiryForm?.name || ""}
                onChange={onInquiryChange}
                required
                className="w-full p-3 md:p-4 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none text-base md:text-lg"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block font-bold text-base md:text-lg mb-2 md:mb-3">
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
                value={inquiryForm?.phone || ""}
                onChange={onInquiryChange}
                required
                className="w-full p-3 md:p-4 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none text-base md:text-lg"
                placeholder="Your phone number (10 digits)"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-base md:text-lg mb-2 md:mb-3">
              Preferred Callback Time
            </label>
            <select
              name="time"
              value={inquiryForm?.time || ""}
              onChange={onInquiryChange}
              required
              className="w-full p-3 md:p-4 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none text-base md:text-lg"
            >
              <option value="">Select time</option>
              <option>Morning (9am-12pm)</option>
              <option>Afternoon (12pm-4pm)</option>
              <option>Evening (4pm-8pm)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-lg mb-3">
              Reason for contact
            </label>
            <div className="grid sm:grid-cols-3 gap-3">
              {["Rent", "Buy / Sell", "Construction"].map((option) => (
                <label
                  key={option}
                  className={`border-2 rounded-2xl px-4 py-4 flex items-center gap-3 cursor-pointer transition ${
                    inquiryForm?.reasonType === option
                      ? "border-orange-400 bg-orange-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="reasonType"
                    value={option}
                    checked={inquiryForm?.reasonType === option}
                    onChange={onInquiryChange}
                    className="accent-orange-500"
                  />
                  <span className="font-semibold text-slate-800">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-lg mb-3">
              Requirement Details
            </label>
            <textarea
              name="reason"
              value={inquiryForm?.reason || ""}
              onChange={onInquiryChange}
              rows="5"
              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none text-lg resize-y"
              placeholder="Share your plot size, location, budget or construction requirements"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full p-6 rounded-3xl font-bold text-xl bg-gradient-to-r from-[#E8956E] to-[#D4A574] text-white transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ border: "1px solid rgba(232,149,110,0.65)" }}
          >
            <Send className="w-6 h-6" />
            {submitting ? "Submitting..." : "Submit Inquiry"}
          </button>

          {submitted && (
            <div
              className="text-center font-medium mt-2 p-4 rounded-lg"
              style={{
                backgroundColor: colors.cream,
                color: colors.accentSoft,
                border: `1px solid ${colors.accent}`,
              }}
            >
              Inquiry submitted successfully. Our construction team will contact
              you shortly.
            </div>
          )}
        </form>
      </section>
    </section>
  );
}
