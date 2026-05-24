const { Pool } = require('pg');
const DEFAULT_CONN = process.env.POSTGRES_URL || process.env.DATABASE_URL || '';
const hasPostgres = Boolean(DEFAULT_CONN);

let pool;
if (hasPostgres) {
  pool = new Pool({ connectionString: DEFAULT_CONN });
}

async function ensureSchema() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS properties (
      id SERIAL PRIMARY KEY,
      data JSONB NOT NULL
    );
  `);
}

async function loadProperties() {
  if (!pool) return [];
  await ensureSchema();
  const { rows } = await pool.query('SELECT id, data FROM properties ORDER BY id');
  return rows.map((r) => ({ id: r.id, ...r.data }));
}

async function getPropertyById(id) {
  if (!pool) return null;
  const { rows } = await pool.query('SELECT id, data FROM properties WHERE id = $1 LIMIT 1', [id]);
  if (!rows[0]) return null;
  return { id: rows[0].id, ...rows[0].data };
}

function normalizePropertyForStorage(property) {
  const copy = { ...property };
  delete copy.id;
  return copy;
}

async function createProperty(property) {
  if (!pool) return null;
  await ensureSchema();
  const payload = normalizePropertyForStorage(property);
  const { rows } = await pool.query('INSERT INTO properties(data) VALUES($1) RETURNING id, data', [payload]);
  const r = rows[0];
  return { id: r.id, ...r.data };
}

async function updateProperty(id, patch) {
  if (!pool) return null;
  await ensureSchema();
  const current = await getPropertyById(id);
  if (!current) return null;
  const merged = { ...current, ...patch };
  const payload = normalizePropertyForStorage(merged);
  await pool.query('UPDATE properties SET data = $1 WHERE id = $2', [payload, id]);
  return { id: Number(id), ...payload };
}

async function deleteProperty(id) {
  if (!pool) return null;
  const cur = await getPropertyById(id);
  if (!cur) return null;
  await pool.query('DELETE FROM properties WHERE id = $1', [id]);
  return cur;
}

// Seed defaults if empty
async function seedDefaultsIfEmpty() {
  if (!pool) return;
  await ensureSchema();
  const { rows } = await pool.query('SELECT COUNT(*)::int AS c FROM properties');
  if (rows[0].c === 0) {
    const defaults = require('./data/properties');
    for (const p of defaults) {
      const payload = normalizePropertyForStorage(p);
      await pool.query('INSERT INTO properties(data) VALUES($1)', [payload]);
    }
  }
}

if (hasPostgres) {
  // initialize in background
  ensureSchema().then(() => seedDefaultsIfEmpty()).catch((e) => console.error('pgStorage init error', e));
}

module.exports = {
  hasSupabase: hasPostgres, // treat as durable storage available
  loadProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
};
