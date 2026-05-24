import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const sourceModulePath = path.resolve(projectRoot, "backend/data/properties.js");
const sourceProperties = (await import(`file:///${sourceModulePath.replace(/\\/g, "/")}`)).default;

const dedupedById = new Map();
for (const property of Array.isArray(sourceProperties) ? sourceProperties : []) {
  const idKey = String(property?.id ?? "").trim();
  if (!idKey) continue;
  dedupedById.set(idKey, property);
}

const properties = Array.from(dedupedById.values());
const outputDir = path.resolve(projectRoot, "public/data/properties");
fs.mkdirSync(outputDir, { recursive: true });

const toSlug = (value) =>
  String(value || "property")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "property";

// We only emit a single consolidated JSON file now. Individual per-property
// JSON files are archived to keep the site routes hidden while preserving
// original data and formats.
fs.writeFileSync(
  path.resolve(projectRoot, "public/data/properties.json"),
  `${JSON.stringify(properties, null, 2)}\n`,
  "utf8",
);

console.log(`Exported ${properties.length} properties to public/data/properties.json`);
