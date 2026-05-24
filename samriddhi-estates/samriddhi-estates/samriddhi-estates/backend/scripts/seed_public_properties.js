const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const POSTGRES_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/samriddhi';
const pool = new Pool({ connectionString: POSTGRES_URL });

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS properties (
      id SERIAL PRIMARY KEY,
      data JSONB NOT NULL
    );
  `);
}

async function upsertProperty(p) {
  const copy = { ...p };
  const id = copy.id || null;
  if (id) delete copy.id;
  if (id) {
    await pool.query(
      `INSERT INTO properties(id, data) VALUES($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2`,
      [id, copy],
    );
    return id;
  }
  const { rows } = await pool.query(`INSERT INTO properties(data) VALUES($1) RETURNING id`, [copy]);
  return rows[0].id;
}

async function main() {
  try {
    await ensureSchema();
    const jsonPath = path.join(__dirname, '..', '..', 'public', 'data', 'properties.json');
    if (!fs.existsSync(jsonPath)) {
      console.error('properties.json not found at', jsonPath);
      process.exit(1);
    }
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const items = JSON.parse(raw || '[]');
    let count = 0;
    for (const it of items) {
      await upsertProperty(it);
      count++;
    }
    // fix sequence
    await pool.query(`SELECT setval(pg_get_serial_sequence('properties','id'), (SELECT COALESCE(MAX(id),1) FROM properties));`);
    console.log(`Imported ${count} properties into Postgres (${POSTGRES_URL})`);
  } catch (e) {
    console.error('Seed error', e);
    process.exit(2);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
