import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { pool } from '../index.js';
import { setAuthCookie, clearAuthCookie, signToken } from '../utils/jwt.js';
import { requirePatient } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  user_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { user_name, email, password } = parsed.data;
  const hash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await pool.query(
      'INSERT INTO patients (user_name, email, password_hash) VALUES ($1,$2,$3) RETURNING id,user_name,email,created_at',
      [user_name, email, hash]
    );
    const token = signToken({ id: rows[0].id, role: 'patient' });
    setAuthCookie(res, token);
    return res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    return res.status(500).json({ error: 'Server error' });
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password } = parsed.data;
  const { rows } = await pool.query('SELECT * FROM patients WHERE email=$1', [email]);
  const user = rows[0];
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

  const token = signToken({ id: user.id, role: 'patient' });
  setAuthCookie(res, token);
  return res.json({ id: user.id, user_name: user.user_name, email: user.email, created_at: user.created_at });
});

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get('/me', requirePatient, async (req, res) => {
  const { rows } = await pool.query('SELECT id, user_name, email, created_at FROM patients WHERE id=$1', [req.user.id]);
  return res.json(rows[0]);
});

export default router;
