import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Car,
  ChevronRight,
  Download,
  FileCheck2,
  Heart,
  Home,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Train,
} from 'lucide-react';
import { motion } from 'framer-motion';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80';

const cleanPhone = (value = '') => String(value).replace(/\D/g, '');

const getImages = (property) => {
  const fromGallery = Array.isArray(property.gallery) ? property.gallery : [];
  const fromImages = Array.isArray(property.images) ? property.images : [];
  return [property.image, ...fromImages, ...fromGallery].filter(Boolean).filter((src, index, arr) => arr.indexOf(src) === index);
};

const valueOrDash = (value) => value || 'Available on request';

const Section = ({ id, title, children, className = '' }) => (
  <section id={id} className={`border-t border-gray-200 py-7 md:py-10 ${className}`}>
    <h2 className="mb-4 text-[22px] font-semibold leading-tight text-gray-950 md:text-[26px]">{title}</h2>
    {children}
  </section>
);

const IconFact = ({ icon: Icon, label, value }) => (
  <div className="flex min-w-0 items-start gap-3">
    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-gray-800" />
    <div className="min-w-0">
      <div className="text-sm font-semibold text-gray-950">{valueOrDash(value)}</div>
      <div className="mt-0.5 text-xs text-gray-500">{label}</div>
    </div>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-3 text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="text-right font-medium text-gray-950">{valueOrDash(value)}</span>
  </div>
);

const ActionButton = ({ children, onClick, href, variant = 'dark' }) => {
  const classes =
    variant === 'dark'
      ? 'bg-gray-950 text-white hover:bg-gray-800'
      : 'border border-gray-300 bg-white text-gray-950 hover:border-gray-950';
  const common = `inline-flex h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition ${classes}`;

  if (href) {
    return (
      <a className={common} href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }

  return (
    <button className={common} type="button" onClick={onClick}>
      {children}
    </button>
  );
};

const Photo = ({ src, alt, className = '' }) => (
  <img
    src={src || FALLBACK_IMAGE}
    alt={alt}
    className={`h-full w-full object-cover ${className}`}
    onError={(event) => {
      event.currentTarget.src = FALLBACK_IMAGE;
    }}
  />
);

const MobilePhotoStrip = ({ images, title }) => (
  <div className="-mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    {images.map((src, index) => (
      <div key={`${src}-${index}`} className="h-[285px] w-[86vw] shrink-0 snap-center overflow-hidden bg-gray-100">
        <Photo src={src} alt={`${title} photo ${index + 1}`} />
      </div>
    ))}
  </div>
);

const DesktopGallery = ({ images, title }) => {
  const gallery = images.length ? images : [FALLBACK_IMAGE];
  const tiles = [gallery[0], gallery[1] || gallery[0], gallery[2] || gallery[0], gallery[3] || gallery[1] || gallery[0], gallery[4] || gallery[2] || gallery[0]];

  return (
    <div className="grid h-[430px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl bg-gray-100">
      <div className="col-span-2 row-span-2">
        <Photo src={tiles[0]} alt={`${title} primary photo`} />
      </div>
      {tiles.slice(1).map((src, index) => (
        <div key={`${src}-${index}`} className="relative">
          <Photo src={src} alt={`${title} photo ${index + 2}`} />
          {index === 3 && (
            <button type="button" className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg border border-gray-900 bg-white px-4 py-2 text-sm font-semibold text-gray-950 shadow">
              <ImageIcon size={16} />
              Show all photos
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

const ApprovalList = ({ property }) => {
  const approvals =
    property.reraApprovals ||
    property.approvals || [
      { label: 'RERA registration', value: property.reraNumber || property.rera || 'GGM/2026/999/01' },
      { label: 'License status', value: property.licenseStatus || 'Developer license verified' },
      { label: 'Approving authority', value: property.approvingAuthority || 'HRERA Gurugram' },
    ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {approvals.map((item) => (
        <div key={item.label} className="rounded-lg border border-gray-200 p-4">
          <FileCheck2 className="h-5 w-5 text-emerald-600" />
          <div className="mt-3 text-sm font-semibold text-gray-950">{item.label}</div>
          <div className="mt-1 text-sm text-gray-600">{item.value}</div>
        </div>
      ))}
    </div>
  );
};

const FloorPlanList = ({ floorPlans = [] }) => {
  if (!floorPlans.length) {
    return <p className="text-sm text-gray-600">Floor plans will be shared by the sales team.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {floorPlans.map((plan, index) => {
        const item = typeof plan === 'string' ? { label: `Plan ${index + 1}`, fullImage: plan } : plan;
        return (
          <div key={`${item.label}-${index}`} className="overflow-hidden rounded-lg border border-gray-200">
            <div className="aspect-[4/3] bg-gray-50">
              <Photo src={item.thumbnail || item.fullImage || item.image} alt={item.label || 'Floor plan'} className="object-contain p-3" />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-gray-200 p-4">
              <div>
                <div className="text-sm font-semibold text-gray-950">{item.label || `Floor plan ${index + 1}`}</div>
                <div className="mt-1 text-sm text-gray-500">{item.size || item.carpetArea || 'Sizes on request'}</div>
              </div>
              {item.pdf && (
                <a href={item.pdf} target="_blank" rel="noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300" aria-label="Download floor plan">
                  <Download size={16} />
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Amenities = ({ amenities = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? amenities : amenities.slice(0, 10);

  return (
    <>
      <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {visible.map((amenity) => (
          <div key={amenity} className="flex items-center gap-4 text-sm text-gray-800">
            <Sparkles className="h-5 w-5 shrink-0 text-gray-900" />
            <span>{amenity}</span>
          </div>
        ))}
      </div>
      {amenities.length > 10 && (
        <button type="button" onClick={() => setExpanded(!expanded)} className="mt-6 h-11 rounded-lg border border-gray-950 px-5 text-sm font-semibold text-gray-950">
          {expanded ? 'Show fewer amenities' : `Show all ${amenities.length} amenities`}
        </button>
      )}
    </>
  );
};

const LocationMap = ({ property }) => {
  const query = encodeURIComponent(property.mapQuery || property.address || property.location || 'Gurugram');
  const nearby = property.nearbyPlaces || property.locationAdvantages || [];

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
        <iframe
          title={`${property.title || 'Property'} map`}
          src={`https://www.google.com/maps?q=${query}&output=embed`}
          className="h-[260px] w-full md:h-[360px]"
          loading="lazy"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {nearby.map((place) => (
          <div key={`${place.name}-${place.distance}`} className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4 text-sm">
            <span className="font-medium text-gray-950">{place.name}</span>
            <span className="text-gray-500">{place.distance}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const HostCard = ({ property }) => {
  const builder = typeof property.builder === 'object' ? property.builder : { name: property.developer || property.builder || 'Samriddhi Estates' };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 p-5">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-100">
        {builder.logo ? <Photo src={builder.logo} alt={builder.name} /> : <Building2 className="h-7 w-7 text-gray-700" />}
      </div>
      <div>
        <div className="text-sm text-gray-500">Listed by</div>
        <div className="text-lg font-semibold text-gray-950">{builder.name}</div>
        <div className="mt-1 text-sm text-gray-600">{builder.description || `${property.developer || 'Developer'} project advisory and site visit support.`}</div>
      </div>
    </div>
  );
};

const ContentSections = ({ property, facts, configs, floorPlans }) => (
  <>
    <Section id="overview" title={`About ${property.title || 'this property'}`} className="border-t-0">
      <p className="max-w-3xl text-[15px] leading-7 text-gray-700">{property.details || property.description}</p>
      {property.detailsSections?.length > 0 && (
        <div className="mt-6 space-y-5">
          {property.detailsSections.map((section) => (
            <div key={section.heading}>
              <h3 className="text-base font-semibold text-gray-950">{section.heading}</h3>
              <p className="mt-2 whitespace-pre-line text-[15px] leading-7 text-gray-700">{section.text}</p>
            </div>
          ))}
        </div>
      )}
    </Section>

    <Section id="facts" title="Property highlights">
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
        {facts.map((fact) => (
          <IconFact key={fact.label} {...fact} />
        ))}
      </div>
    </Section>

    <Section id="plans" title="Configurations and floor plans">
      {configs.length > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {configs.map((config, index) => (
            <div key={`${config.label || config.type}-${index}`} className="rounded-lg border border-gray-200 p-4">
              <div className="text-sm font-semibold text-gray-950">{config.label || config.type}</div>
              <div className="mt-1 text-sm text-gray-600">{config.size}</div>
              <div className="mt-2 text-sm font-semibold text-gray-950">{config.price}</div>
            </div>
          ))}
        </div>
      )}
      <FloorPlanList floorPlans={floorPlans} />
    </Section>

    <Section id="approvals" title="RERA and approvals">
      <ApprovalList property={property} />
    </Section>

    <Section id="amenities" title="What this place offers">
      <Amenities amenities={property.amenities || []} />
    </Section>

    <Section id="location" title="Where you will be">
      <p className="mb-4 text-sm text-gray-600">{property.address || property.location}</p>
      <LocationMap property={property} />
    </Section>

    <Section id="builder" title="Builder and advisory">
      <HostCard property={property} />
    </Section>

    <Section id="details" title="Things to know">
      <div className="grid gap-x-10 md:grid-cols-2">
        <div>
          <DetailRow label="RERA number" value={property.reraNumber || property.rera} />
          <DetailRow label="Possession" value={property.possession} />
          <DetailRow label="Status" value={property.status} />
          <DetailRow label="Furnishing" value={property.furnishing} />
        </div>
        <div>
          <DetailRow label="Parking" value={property.parking} />
          <DetailRow label="Facing" value={property.facing} />
          <DetailRow label="Maintenance" value={property.maintenance} />
          <DetailRow label="Booking amount" value={property.bookingAmount} />
        </div>
      </div>
    </Section>
  </>
);

const EnquiryPanel = ({ property, onCall }) => {
  const whatsapp = cleanPhone(property.whatsappNumber || property.contacts?.whatsapp || property.contacts?.sales);
  const whatsappUrl = whatsapp ? `https://wa.me/${whatsapp}` : undefined;

  return (
    <aside className="sticky top-6 rounded-xl border border-gray-200 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="text-[22px] font-semibold text-gray-950">{property.startingPrice || property.price}</div>
          <div className="mt-1 text-sm text-gray-500">starting price</div>
        </div>
        {property.rating && (
          <div className="flex items-center gap-1 text-sm font-semibold">
            <Star className="h-4 w-4 fill-gray-950 text-gray-950" />
            {property.rating}
          </div>
        )}
      </div>

      <div className="mt-5 rounded-lg border border-gray-300">
        <DetailRow label="Project" value={property.title} />
        <DetailRow label="Configuration" value={property.typeText || property.configurationSummary} />
        <DetailRow label="Location" value={property.subtitle || property.location} />
      </div>

      <div className="mt-5 grid gap-3">
        <ActionButton onClick={() => onCall(property)}>
          <Phone size={18} />
          Call now
        </ActionButton>
        <ActionButton href={whatsappUrl} variant="outline">
          <MessageCircle size={18} />
          WhatsApp
        </ActionButton>
        {property.brochureUrl && (
          <ActionButton href={property.brochureUrl} variant="outline">
            <Download size={18} />
            Brochure
          </ActionButton>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-gray-500">Site visit, price sheet, payment plan and inventory can be shared by the advisor.</p>
    </aside>
  );
};

const LuxuryDetailsPage = ({ property = {}, onClose = () => { }, onCall = () => { } }) => {
  const [wishlisted, setWishlisted] = useState(false);
  const images = useMemo(() => {
    const list = getImages(property);
    return list.length ? list : [FALLBACK_IMAGE];
  }, [property]);
  const floorPlans = property.floorPlans || [];
  const configs = property.configurations || property.availableConfigurations || property.unitConfigs || [];
  const facts = [
    { icon: Home, label: 'Configuration', value: property.typeText || property.configurationSummary || `${property.bedrooms || ''} BHK`.trim() },
    { icon: Ruler, label: 'Area', value: property.sizeRange || property.area },
    { icon: BedDouble, label: 'Bedrooms', value: property.bedrooms ? `${property.bedrooms} BHK` : property.typeText },
    { icon: Bath, label: 'Bathrooms', value: property.bathrooms },
    { icon: Car, label: 'Parking', value: property.parking },
    { icon: ShieldCheck, label: 'RERA', value: property.reraNumber || property.rera },
    { icon: CalendarDays, label: 'Possession', value: property.possession },
    { icon: Train, label: 'Connectivity', value: property.connectivitySummary || property.location },
  ];
  const navItems = [
    ['overview', 'Overview'],
    ['facts', 'Highlights'],
    ['plans', 'Floor plans'],
    ['approvals', 'RERA'],
    ['amenities', 'Amenities'],
    ['location', 'Map'],
  ];
  const whatsapp = cleanPhone(property.whatsappNumber || property.contacts?.whatsapp || property.contacts?.sales);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 overflow-y-auto bg-white text-gray-950">
      <div className="md:hidden">
        <div className="sticky top-0 z-30 flex h-14 items-center justify-between bg-white/95 px-4 backdrop-blur">
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full">
            <ArrowLeft size={22} />
          </button>
          <div className="flex items-center gap-1">
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full">
              <Share2 size={20} />
            </button>
            <button type="button" onClick={() => setWishlisted(!wishlisted)} className="flex h-10 w-10 items-center justify-center rounded-full">
              <Heart size={20} className={wishlisted ? 'fill-rose-500 text-rose-500' : ''} />
            </button>
          </div>
        </div>

        <MobilePhotoStrip images={images} title={property.title} />

        <main className="px-5 pb-28">
          <div className="border-b border-gray-200 pb-6 pt-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[24px] font-semibold leading-tight text-gray-950">{property.title}</h1>
                <p className="mt-2 text-sm text-gray-600">{property.subtitle || property.location}</p>
              </div>
              {property.rating && (
                <div className="flex shrink-0 items-center gap-1 text-sm font-semibold">
                  <Star className="h-4 w-4 fill-gray-950 text-gray-950" />
                  {property.rating}
                </div>
              )}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-4 text-center">
              <IconFact icon={Ruler} label="Area" value={property.area || property.sizeRange} />
              <IconFact icon={Home} label="Type" value={property.typeText || property.configurationSummary} />
              <IconFact icon={ShieldCheck} label="RERA" value={property.reraNumber || property.rera} />
            </div>
          </div>

          <div className="sticky top-14 z-20 -mx-5 flex gap-5 overflow-x-auto border-b border-gray-200 bg-white px-5 py-3 text-sm font-semibold [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navItems.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="shrink-0 text-gray-800">
                {label}
              </a>
            ))}
          </div>

          <ContentSections property={property} facts={facts} configs={configs} floorPlans={floorPlans} />
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white px-5 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.10)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-gray-500">Starting price</div>
              <div className="text-lg font-semibold text-gray-950">{property.startingPrice || property.price}</div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => onCall(property)} className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-950 text-white">
                <Phone size={19} />
              </button>
              <a href={whatsapp ? `https://wa.me/${whatsapp}` : undefined} target="_blank" rel="noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-full bg-rose-600 px-5 text-sm font-semibold text-white">
                Enquire
                <ChevronRight size={17} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
            <button type="button" onClick={onClose} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-950">
              <ArrowLeft size={20} />
              Back
            </button>
            <div className="flex items-center gap-4">
              <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold underline">
                <Share2 size={18} />
                Share
              </button>
              <button type="button" onClick={() => setWishlisted(!wishlisted)} className="inline-flex items-center gap-2 text-sm font-semibold underline">
                <Heart size={18} className={wishlisted ? 'fill-rose-500 text-rose-500' : ''} />
                Save
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-8 py-8">
          <div className="mb-6">
            <h1 className="text-[32px] font-semibold leading-tight text-gray-950">{property.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-700">
              {property.rating && (
                <span className="inline-flex items-center gap-1 font-semibold">
                  <Star className="h-4 w-4 fill-gray-950 text-gray-950" />
                  {property.rating}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <MapPin size={16} />
                {property.address || property.location}
              </span>
              {property.status && <span>{property.status}</span>}
            </div>
          </div>

          <DesktopGallery images={images} title={property.title} />

          <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div>
              <div className="border-b border-gray-200 pb-7">
                <h2 className="text-[24px] font-semibold leading-tight">{property.typeText || property.configurationSummary || 'Luxury residence in Gurugram'}</h2>
                <p className="mt-2 text-gray-600">{property.subtitle || property.location}</p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {facts.slice(0, 4).map((fact) => (
                    <IconFact key={fact.label} {...fact} />
                  ))}
                </div>
              </div>

              <nav className="sticky top-20 z-20 -mx-1 flex gap-6 overflow-x-auto border-b border-gray-200 bg-white px-1 py-4 text-sm font-semibold [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {navItems.map(([id, label]) => (
                  <a key={id} href={`#${id}`} className="shrink-0 text-gray-800">
                    {label}
                  </a>
                ))}
              </nav>

              <ContentSections property={property} facts={facts} configs={configs} floorPlans={floorPlans} />
            </div>

            <EnquiryPanel property={property} onCall={onCall} />
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default LuxuryDetailsPage;
