import fs from 'fs';
import { Pool } from 'pg';
import 'dotenv/config';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/run-sql.js path/to/file.sql');
  process.exit(1);
}

const sql = fs.readFileSync(file, 'utf8');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    await pool.query(sql);
    console.log(`Executed: ${file}`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
