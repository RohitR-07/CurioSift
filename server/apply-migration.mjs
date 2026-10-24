/**
 * apply-migration.mjs
 * Runs the SQL migration against your Supabase project using the service-role key.
 * Usage: node server/apply-migration.mjs
 *
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── Read env ─────────────────────────────────────────────────────────────────
const lines = readFileSync(resolve('server/.env'), 'utf-8').split('\n');
const env = {};
for (const l of lines) {
  const eq = l.indexOf('=');
  if (eq > 0 && !l.trim().startsWith('#')) env[l.slice(0, eq).trim()] = l.slice(eq + 1).trim();
}

const SUPABASE_URL = env['SUPABASE_URL'];
const SERVICE_KEY  = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server/.env');
  process.exit(1);
}

// ── Read SQL migration ────────────────────────────────────────────────────────
const sql = readFileSync(resolve('server/db/migrations/001_initial_schema.sql'), 'utf-8');

// ── Execute via Supabase Management API ──────────────────────────────────────
// Extract project ref from URL: https://<ref>.supabase.co
const match = SUPABASE_URL.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
if (!match) {
  console.error('ERROR: Could not parse project ref from SUPABASE_URL:', SUPABASE_URL);
  process.exit(1);
}
const projectRef = match[1];
console.log('Project ref:', projectRef);

// Supabase Management API endpoint for running SQL
const managementUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

console.log('\nApplying migration via Supabase Management API...');
const response = await fetch(managementUrl, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
});

const body = await response.json().catch(() => response.text());
if (response.ok) {
  console.log('✅ Migration applied successfully!');
  console.log('Response:', JSON.stringify(body).slice(0, 200));
} else {
  console.log('❌ Management API failed (status', response.status + '):', JSON.stringify(body).slice(0, 500));
  console.log('\nThe service-role key cannot access the Management API (it requires a personal access token).');
  console.log('→ Please apply the migration manually via the Supabase SQL Editor:');
  console.log(`  ${SUPABASE_URL.replace('.supabase.co', '.supabase.co')}/sql`);
  console.log('  Copy & paste: server/db/migrations/001_initial_schema.sql');
  process.exit(1);
}

// ── Verify tables were created ────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';
const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

console.log('\nVerifying tables...');
const tables = ['profiles', 'quiz_attempts', 'flashcard_progress', 'user_preferences'];
let allOk = true;
for (const t of tables) {
  const { error } = await sb.from(t).select('*').limit(0);
  const ok = !error;
  console.log(` ${ok ? '✅' : '❌'} ${t}${!ok ? ' — ' + error.message : ''}`);
  if (!ok) allOk = false;
}

if (allOk) {
  console.log('\n✅ All tables exist. Quiz saves, flashcard progress, and analytics are now functional.');
} else {
  console.log('\n⚠️  Some tables are still missing. Re-check the SQL editor output for errors.');
}
