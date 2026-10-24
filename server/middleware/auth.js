// server/middleware/auth.js
// Verifies the Supabase JWT sent by the frontend in the Authorization header.
// Attaches req.user = { id, email } on success.

import { supabaseAdmin, isDbAvailable } from '../db/supabaseAdmin.js';

/**
 * Strict auth middleware — rejects the request if no valid JWT is present.
 */
export async function requireAuth(req, res, next) {
  if (!isDbAvailable()) {
    return res.status(503).json({
      error: 'Authentication service unavailable: database not configured.',
    });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
  }

  const token = authHeader.slice(7); // strip "Bearer "

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  req.user = { id: user.id, email: user.email };
  next();
}

/**
 * Optional auth middleware — attaches req.user when a valid JWT is present,
 * but continues without error when the header is absent.
 * Use for routes that work for both authenticated and anonymous users.
 */
export async function optionalAuth(req, res, next) {
  if (!isDbAvailable()) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.slice(7);
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (user) {
    req.user = { id: user.id, email: user.email };
  }
  next();
}
