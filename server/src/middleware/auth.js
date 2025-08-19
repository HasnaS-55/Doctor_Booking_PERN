import { verifyToken } from '../utils/jwt.js';

export function requirePatient(req, res, next) {
  const raw = req.cookies?.[process.env.COOKIE_NAME];
  if (!raw) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = verifyToken(raw);
    if (payload.role !== 'patient') return res.status(403).json({ error: 'Forbidden' });
    req.user = payload; // { id, role }
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export function requireDoctor(req, res, next) {
  const raw = req.cookies?.[process.env.COOKIE_NAME];
  if (!raw) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = verifyToken(raw);
    if (payload.role !== 'doctor') return res.status(403).json({ error: 'Forbidden' });
    req.user = payload; // { id, role }
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
