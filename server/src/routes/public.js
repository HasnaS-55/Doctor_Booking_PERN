import { Router } from "express";
import { z } from "zod";
import { pool } from "../index.js";

const router = Router();

router.get("/fields", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT DISTINCT field FROM doctors ORDER BY field ASC"
  );
  res.json(rows.map((r) => r.field));
});

router.get("/doctors", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit ?? "12", 10), 1),
      50
    );
    const offset = (page - 1) * limit;
    const field = req.query.field;
    const q = req.query.q;

    const where = [];
    const params = [];
    if (field) {
      params.push(field);
      where.push(`field = $${params.length}`);
    }
    if (q) {
      params.push(`%${q}%`);
      where.push(
        `(first_name || ' ' || last_name ILIKE $${params.length} OR location ILIKE $${params.length})`
      );
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const sql = `
      SELECT id, image, first_name, last_name, field, location
      FROM doctors
      ${whereSql}
      ORDER BY last_name, first_name
      LIMIT ${limit} OFFSET ${offset}
    `;
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("GET /api/doctors failed:", err.message);
    res.status(500).json({ error: "DB query failed" });
  }
});

router.get("/doctors/:id", async (req, res) => {
  try {
    const allow = new Set([
      "id",
      "first_name",
      "last_name",
      "email",
      "field",
      "location",
      "phone_number",
      "about",
      "image",
      "skills",
    ]);
    const pick = String(req.query.pick || "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => allow.has(s));

    if (pick.length > 0) {
      const cols = pick.join(", ");
      const { rows } = await pool.query(
        `SELECT ${cols} FROM doctors WHERE id=$1`,
        [req.params.id]
      );
      if (!rows[0]) return res.status(404).json({ error: "Not found" });
      return res.json(rows[0]);
    }

    const { rows } = await pool.query(
      "SELECT id, first_name, last_name, email, field, location, phone_number, about, image, skills FROM doctors WHERE id=$1",
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    return res.json(rows[0]);
  } catch (err) {
    console.error("GET /api/doctors/:id failed:", err.message);
    res.status(500).json({ error: "DB query failed" });
  }
});

const availSchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });

router.get("/doctors/:id/availability", async (req, res) => {
  const parsed = availSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid date" });

  const doctorId = req.params.id;
  const dateStr = parsed.data.date;
  const date = new Date(`${dateStr}T00:00:00`);
  const weekday = date.getUTCDay();

 
  const { rows: avs } = await pool.query(
    "SELECT * FROM doctor_availability WHERE doctor_id=$1 AND weekday=$2 AND is_active=true",
    [doctorId, weekday]
  );

  if (avs.length === 0) return res.json([]);

 
  const slots = [];
  for (const av of avs) {
    const [sh, sm] = av.start_time.split(":").map(Number);
    const [eh, em] = av.end_time.split(":").map(Number);
    let cur = new Date(
      `${dateStr}T${String(sh).padStart(2, "0")}:${String(sm).padStart(
        2,
        "0"
      )}:00`
    );
    const end = new Date(
      `${dateStr}T${String(eh).padStart(2, "0")}:${String(em).padStart(
        2,
        "0"
      )}:00`
    );
    while (cur < end) {
      slots.push(cur.toTimeString().slice(0, 5));
      cur = new Date(cur.getTime() + av.slot_minutes * 60_000);
    }
  }

  // remove taken slots (pending + confirmed)
  const { rows: taken } = await pool.query(
    `SELECT time FROM appointments WHERE doctor_id=$1 AND date=$2::date AND status IN ('pending','confirmed')`,
    [doctorId, dateStr]
  );
  const takenSet = new Set(taken.map((r) => r.time.slice(0, 5)));

  // if date is today in server's local time: filter past times + 30min buffer
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  let filtered = slots;
  if (dateStr === todayStr) {
    const cutoff = new Date(now.getTime() + 30 * 60_000);
    filtered = slots.filter((t) => {
      const [h, m] = t.split(":").map(Number);
      const dt = new Date(
        `${dateStr}T${String(h).padStart(2, "0")}:${String(m).padStart(
          2,
          "0"
        )}:00`
      );
      return dt >= cutoff;
    });
  }

  const free = filtered.filter((t) => !takenSet.has(t));
  res.json(free);
});

export default router;
