import jwt from 'jsonwebtoken';

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(process.env.COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: isProd ? 'strict' : 'lax',
    secure: isProd,
    path: '/'
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(process.env.COOKIE_NAME, { path: '/' });
}
