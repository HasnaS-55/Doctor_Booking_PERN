import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../index.js';
import { requirePatient } from '../middleware/auth.js';

const router = Router();

const createSchema = z.object({
  doctor_id: z.string().uuid(),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/)
});

router.post('/appointments', requirePatient, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { doctor_id, description, date, time } = parsed.data;

  // enforce unique/availability at DB-level and logic-level
  try {
    const { rows } = await pool.query(
      `INSERT INTO appointments (doctor_id, patient_id, description, date, time, status)
       VALUES ($1,$2,$3,$4,$5,'pending')
       RETURNING *`,
      [doctor_id, req.user.id, description ?? null, date, time + ':00']
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Slot already taken' });
    return res.status(400).json({ error: 'Could not create appointment' });
  }
});

router.get('/appointments/mine', requirePatient, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT a.*, d.first_name, d.last_name, d.field, d.location
     FROM appointments a
     JOIN doctors d ON d.id = a.doctor_id
     WHERE a.patient_id=$1
     ORDER BY a.date DESC, a.time DESC`,
    [req.user.id]
  );
  res.json(rows);
});

export default router;
