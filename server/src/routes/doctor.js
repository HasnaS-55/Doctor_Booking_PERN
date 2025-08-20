import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../index.js';
import { requireDoctor } from '../middleware/auth.js';

const router = Router();


router.get('/appointments', requireDoctor, async (req, res) => {
  const { status, from, to } = req.query;
  const where = ['a.doctor_id = $1'];
  const params = [req.user.id];

  if (status) { params.push(status); where.push(`a.status = $${params.length}`); }
  if (from) { params.push(from); where.push(`a.date >= $${params.length}::date`); }
  if (to) { params.push(to); where.push(`a.date <= $${params.length}::date`); }

  const { rows } = await pool.query(
    `SELECT a.*, p.user_name, p.email AS patient_email
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     WHERE ${where.join(' AND ')}
     ORDER BY a.date ASC, a.time ASC`,
    params
  );
  res.json(rows);
});


router.patch('/appointments/:id', requireDoctor, async (req, res) => {
  const body = z.object({ status: z.enum(['confirmed','rejected']) }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'Invalid status' });

  const { id } = req.params;
  const { status } = body.data;

  // ensure appointment belongs to this doctor
  const { rows: got } = await pool.query('SELECT * FROM appointments WHERE id=$1 AND doctor_id=$2', [id, req.user.id]);
  if (!got[0]) return res.status(404).json({ error: 'Not found' });

  const { rows } = await pool.query(
    'UPDATE appointments SET status=$1, updated_at=now() WHERE id=$2 RETURNING *',
    [status, id]
  );
  res.json(rows[0]);
});


router.get('/availability', requireDoctor, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM doctor_availability WHERE doctor_id=$1 ORDER BY weekday ASC', [req.user.id]);
  res.json(rows);
});

// Upsert weekly availability (array of rows)
router.post('/availability', requireDoctor, async (req, res) => {
  const schema = z.array(z.object({
    weekday: z.number().int().min(0).max(6),
    start_time: z.string().regex(/^\d{2}:\d{2}$/),
    end_time: z.string().regex(/^\d{2}:\d{2}$/),
    slot_minutes: z.number().int().min(5).max(240).default(30),
    is_active: z.boolean().default(true)
  }));
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const row of parsed.data) {
      await client.query(
        `INSERT INTO doctor_availability (doctor_id, weekday, start_time, end_time, slot_minutes, is_active)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO NOTHING`, 
      [req.user.id, row.weekday, row.start_time + ':00', row.end_time + ':00', row.slot_minutes, row.is_active]);
      // delete then insert for that weekday to keep a single row
      await client.query('DELETE FROM doctor_availability WHERE doctor_id=$1 AND weekday=$2', [req.user.id, row.weekday]);
      await client.query(
        `INSERT INTO doctor_availability (doctor_id, weekday, start_time, end_time, slot_minutes, is_active)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [req.user.id, row.weekday, row.start_time + ':00', row.end_time + ':00', row.slot_minutes, row.is_active]
      );
    }
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: 'Failed to save availability' });
  } finally {
    client.release();
  }
});

export default router;
