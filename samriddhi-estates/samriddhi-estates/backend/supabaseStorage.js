const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  "";

const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
const supabase = hasSupabase
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

const STATE_TABLE = "app_state";
const PROPERTIES_KEY = "properties";

async function loadProperties() {
  if (!hasSupabase) return null;

  const { data, error } = await supabase
    .from(STATE_TABLE)
    .select("value")
    .eq("key", PROPERTIES_KEY)
    .maybeSingle();

  if (error) throw error;

  if (data) {
    return Array.isArray(data.value) ? data.value : [];
  }

  const defaults = require("./data/properties");
  await saveProperties(defaults);
  return defaults;
}

async function saveProperties(nextProperties) {
  if (!hasSupabase) return null;

  const { error } = await supabase.from(STATE_TABLE).upsert(
    {
      key: PROPERTIES_KEY,
      value: nextProperties,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  if (error) throw error;
  return nextProperties;
}

async function getPropertyById(id) {
  if (!hasSupabase) return null;
  const properties = await loadProperties();
  return properties.find((property) => Number(property.id) === Number(id)) || null;
}

async function createProperty(property) {
  if (!hasSupabase) return null;
  const properties = await loadProperties();
  const nextProperty = {
    ...normalizeProperty(property),
    id: nextId(properties),
  };
  const nextProperties = [...properties, nextProperty];
  await saveProperties(nextProperties);
  return nextProperty;
}

async function updateProperty(id, patch) {
  if (!hasSupabase) return null;
  const properties = await loadProperties();
  const propertyId = Number(id);
  let updatedProperty = null;
  const nextProperties = properties.map((property) => {
    if (Number(property.id) !== propertyId) return property;
    updatedProperty = normalizeProperty({
      ...property,
      ...patch,
      id: property.id,
    });
    return updatedProperty;
  });

  if (!updatedProperty) return null;
  await saveProperties(nextProperties);
  return updatedProperty;
}

async function deleteProperty(id) {
  if (!hasSupabase) return null;
  const properties = await loadProperties();
  const propertyId = Number(id);
  const deletedProperty =
    properties.find((property) => Number(property.id) === propertyId) || null;
  if (!deletedProperty) return null;

  await saveProperties(
    properties.filter((property) => Number(property.id) !== propertyId),
  );
  return deletedProperty;
}

function normalizeProperty(property) {
  const images =
    Array.isArray(property.images) && property.images.length
      ? property.images
      : [property.image].filter(Boolean);

  return {
    ...property,
    type: property.type || "sale",
    location: property.location || "Gurgaon",
    address: property.address || property.location || "Gurgaon",
    images,
    amenities: Array.isArray(property.amenities) ? property.amenities : [],
    highlights: Array.isArray(property.highlights) ? property.highlights : [],
    nearbyPlaces: Array.isArray(property.nearbyPlaces)
      ? property.nearbyPlaces
      : [],
    contacts: property.contacts || {},
    showOnHomepage: property.showOnHomepage ?? true,
    isFeatured: property.isFeatured ?? false,
    isPublished: property.isPublished ?? true,
    isLuxury: property.isLuxury ?? false,
  };
}

function nextId(properties) {
  return Math.max(0, ...properties.map((property) => Number(property.id) || 0)) + 1;
}

module.exports = {
  hasSupabase,
  loadProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
};
