import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { Pool } from 'pg';
import dns from 'node:dns';
import { promises as dnsAsync } from 'node:dns';
import path from "path";


import authRoutes from './routes/auth.js';
import doctorAuthRoutes from './routes/doctorAuth.js';
import publicRoutes from './routes/public.js';
import appointmentsRoutes from './routes/appointments.js';
import doctorRoutes from './routes/doctor.js';
import patientsRoutes from './routes/patients.js';
import uploadsRouter from "./routes/uploads.js";

dns.setDefaultResultOrder?.('ipv4first'); 

const app = express();
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))

const rawUrl = (process.env.DATABASE_URL || '').trim(); 
if (!rawUrl) console.error('❌ DATABASE_URL is empty');

let parsedHost = '';
try { parsedHost = new URL(rawUrl).hostname; } catch {  }

const isLocal = /(^|@)(localhost|127\.0\.0\.1)(:|\/|$)/i.test(rawUrl);
const isNeon = /\.neon\.tech\b/i.test(rawUrl);
const forceSsl = String(process.env.PG_SSL || '').toLowerCase() === 'true';
const sslRequiredInUrl = /\bsslmode=require\b/i.test(rawUrl);

const ssl = (forceSsl || sslRequiredInUrl || isNeon) ? { rejectUnauthorized: false } : (isLocal ? false : false);

export const pool = new Pool({
  connectionString: rawUrl,
  ssl,
  keepAlive: true,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
});

pool.on('error', (err) => {
  console.error('🔥 PG pool idle client error:', err.message);
});

let DB_READY = false;


const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function checkDns(host) {
  try {
    await dnsAsync.lookup(host);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function testDb() {
  const { rows } = await pool.query('select current_database() db, current_user usr, now() now');
  return rows?.[0];
}

async function connectWithBackoff() {
  const attempts = 8;
  for (let i = 0; i < attempts; i++) {
    const dnsRes = parsedHost ? await checkDns(parsedHost) : { ok: true };
    if (!dnsRes.ok) {
      console.error(`❌ DNS resolve failed for ${parsedHost}: ${dnsRes.error}`);
    }
    try {
      const info = await testDb();
      console.log(`✅ DB connected: db="${info.db}", user="${info.usr}", ssl=${!!ssl}`);
      DB_READY = true;
      return;
    } catch (e) {
      console.error(`❌ DB connect attempt ${i + 1}/${attempts} failed: ${e.code || e.message}`);
    }
    await wait(Math.min(500 * 2 ** i, 5000)); 
  }
  console.error('🚫 DB not reachable after retries. Server stays up; /api/health will show details.');
}


app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());


app.get('/api/health', async (_req, res) => {
  let dns_ok = true, dns_error = null;
  if (parsedHost) {
    const r = await checkDns(parsedHost);
    dns_ok = r.ok;
    dns_error = r.error || null;
  }
  try {
    const info = await testDb();
    return res.json({ ok: true, dns: { ok: dns_ok, host: parsedHost, error: dns_error }, db: { connected: true, info } });
  } catch (err) {
    return res.json({ ok: true, dns: { ok: dns_ok, host: parsedHost, error: dns_error }, db: { connected: false, error: err.message } });
  }
});

app.get('/api/health/db', async (_req, res) => {
  try { await pool.query('select 1'); return res.json({ connected: true }); }
  catch (e) { return res.status(503).json({ connected: false, error: e.message }); }
});


app.use('/api/auth', authRoutes);
app.use('/api/doctors/auth', doctorAuthRoutes);
app.use('/api', publicRoutes);
app.use('/api', appointmentsRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api', patientsRoutes);
app.use("/api", uploadsRouter);


const port = process.env.PORT;

(async () => {
  await connectWithBackoff();
  app.listen(port, () => {
    console.log(`Server listening on :${port}`);
    console.log(`Health: http://localhost:${port}/api/health`);
  });
})();

