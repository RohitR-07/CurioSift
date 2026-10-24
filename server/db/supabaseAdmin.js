// server/db/supabaseAdmin.js
// Supabase admin client — SERVER ONLY, never imported by frontend.
// Uses the service-role key which bypasses Row Level Security.
// Keep SUPABASE_SERVICE_ROLE_KEY in server/.env only.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    '[supabaseAdmin] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment. ' +
    'Database features will be unavailable.'
  );
}

export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Returns true when the Supabase admin client is available.
 */
export function isDbAvailable() {
  return supabaseAdmin !== null;
}
