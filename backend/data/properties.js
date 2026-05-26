const fs = require("fs"); 
const path = require("path");

const publicDataDir = path.resolve(__dirname, "..", "..", "public", "data");
const propertiesDir = path.join(publicDataDir, "properties");
const propertiesIndexPath = path.join(propertiesDir, "index.json");
const legacyPropertiesPath = path.join(publicDataDir, "properties.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

function loadPropertyFiles() {
  const index = readJson(propertiesIndexPath);
  if (!Array.isArray(index)) return [];

  return index
    .filter((entry) => entry && entry.file)
    .map((entry) => readJson(path.join(propertiesDir, entry.file)))
    .filter(Boolean)
    .sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
}

function loadProperties() {
  try {
    const legacyProperties = readJson(legacyPropertiesPath);
    if (Array.isArray(legacyProperties) && legacyProperties.length) {
      return legacyProperties.sort(
        (a, b) => Number(a.id || 0) - Number(b.id || 0),
      );
    }
  } catch (error) {
    console.warn("Could not load properties.json:", error.message);
  }

  try {
    const properties = loadPropertyFiles();
    if (properties.length) return properties;
  } catch (error) {
    console.warn("Could not load individual property JSON files:", error.message);
  }
  return [];
}

module.exports = loadProperties();
