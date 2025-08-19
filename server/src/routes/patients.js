import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../index.js';

const router = Router();

// Minimal auth middleware for patients via HTTP-only cookie
function requirePatient(req, res, next) {
  const token = req.cookies?.[process.env.COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'patient') return res.status(403).json({ error: 'Forbidden' });
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// GET /api/patients/:id?pick=user_name,email
router.get('/patients/:id', requirePatient, async (req, res) => {
  try {
    const { id } = req.params;

    // Only allow the patient to read their own record (simple privacy guard)
    if (req.user.id !== id) return res.status(403).json({ error: 'Forbidden' });

    const allow = new Set(['id', 'user_name', 'email', 'created_at', 'updated_at']);
    const pick = String(req.query.pick || '')
      .split(',')
      .map(s => s.trim())
      .filter(s => allow.has(s));

    const cols = pick.length ? pick.join(', ') : 'id, user_name, email';
    const { rows } = await pool.query(`SELECT ${cols} FROM patients WHERE id=$1`, [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/patients/:id failed:', err.message);
    res.status(500).json({ error: 'DB query failed' });
  }
});

export default router;
