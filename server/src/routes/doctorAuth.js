import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { pool } from '../index.js';
import { setAuthCookie, clearAuthCookie, signToken } from '../utils/jwt.js';
import { requireDoctor } from '../middleware/auth.js';

const router = Router();

const regSchema = z.object({
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  field: z.string().min(2),
  location: z.string().optional(),
  phone_number: z.string().optional(),
  about: z.string().optional(),
  image: z.string().optional(),
  skills: z.array(z.string()).optional()
});

router.post('/register', async (req, res) => {
  const parsed = regSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { password, ...rest } = parsed.data;
  const hash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await pool.query(
      `INSERT INTO doctors (first_name,last_name,email,password_hash,field,location,phone_number,about,image,skills)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id,first_name,last_name,email,field,location,phone_number,about,image,skills,created_at`,
      [
        rest.first_name, rest.last_name, rest.email, hash, rest.field,
        rest.location ?? null, rest.phone_number ?? null, rest.about ?? null,
        rest.image ?? null, rest.skills ?? null
      ]
    );
    const token = signToken({ id: rows[0].id, role: 'doctor' });
    setAuthCookie(res, token);
    return res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    return res.status(500).json({ error: 'Server error' });
  }
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password } = parsed.data;
  const { rows } = await pool.query('SELECT * FROM doctors WHERE email=$1', [email]);
  const doc = rows[0];
  if (!doc) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, doc.password_hash);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

  const token = signToken({ id: doc.id, role: 'doctor' });
  setAuthCookie(res, token);
  return res.json({
    id: doc.id, first_name: doc.first_name, last_name: doc.last_name,
    email: doc.email, field: doc.field, location: doc.location,
    phone_number: doc.phone_number, about: doc.about, image: doc.image, skills: doc.skills
  });
});

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get('/me', requireDoctor, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, first_name, last_name, email, field, location, phone_number, about, image, skills FROM doctors WHERE id=$1',
    [req.user.id]
  );
  return res.json(rows[0]);
});

export default router;
