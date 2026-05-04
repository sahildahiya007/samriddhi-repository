const fs = require("fs");
const path = require("path");

/* ── File-based persistent storage ── 
   Maintains a database.json file that persists across server restarts.
   This ensures properties, users, inquiries stay permanent. */

const dataDir = process.env.DATA_DIR || path.join(__dirname, "persistent-data");

// Ensure directory exists
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch (e) {
  console.warn("Could not create data directory:", e.message);
}

const dbPath = path.join(dataDir, "database.json");

// Initialize with default data structure
const defaultDb = {
  properties: require("./data/properties"),
  users: require("./data/users"),
  inquiries: require("./data/inquiries"),
  constructionRates: require("./data/constructionRates"),
  constructionProjects: require("./data/constructionProjects"),
  registeredUsers: [],
  nextUserId: 1,
};

// Load database from file or use defaults
function loadDatabase() {
  try {
    if (fs.existsSync(dbPath)) {
      const content = fs.readFileSync(dbPath, "utf-8");
      const db = JSON.parse(content);
      // Merge with defaults to handle missing new fields
      return {
        ...defaultDb,
        ...db,
      };
    }
  } catch (e) {
    console.warn("Could not load database:", e.message);
  }
  return { ...defaultDb };
}

// Save database to file
function saveDatabase(db) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save database:", e.message);
  }
}

// Load on module initialization
const db = loadDatabase();

// Export the database and utility functions
module.exports = {
  getDb: () => db,
  saveDb: () => saveDatabase(db),
  loadDb: () => {
    const newDb = loadDatabase();
    Object.assign(db, newDb);
    return db;
  },
  dbPath,
};
