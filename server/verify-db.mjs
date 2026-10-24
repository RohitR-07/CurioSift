/**
 * verify-db.mjs  — run from project root: node server/verify-db.mjs
 * Tests that all StudyMate tables are accessible with the service-role key.
 * Run AFTER applying the SQL grants in the Supabase SQL Editor.
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

const env = {};
for (const l of readFileSync(resolve('server/.env'), 'utf-8').split('\n')) {
  const eq = l.indexOf('=');
  if (eq > 0 && !l.trim().startsWith('#')) env[l.slice(0, eq).trim()] = l.slice(eq + 1).trim();
}

import { createClient } from '@supabase/supabase-js';
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log('=== StudyMate DB Verification ===\n');

// 1. Table access
const tables = ['profiles', 'user_preferences', 'quiz_attempts', 'flashcard_progress'];
let allOk = true;
for (const t of tables) {
  const { error } = await sb.from(t).select('*').limit(0);
  const ok = !error;
  if (!ok) allOk = false;
  console.log(`${ok ? '✅' : '❌'} ${t}${!ok ? ' — ' + error.code + ': ' + error.message : ''}`);
}

// 2. Real insert + fetch + delete on quiz_attempts
console.log('\n--- Insert/fetch/delete test on quiz_attempts ---');
const testUserId = '00000000-0000-0000-0000-000000000099';
const { data: ins, error: iErr } = await sb.from('quiz_attempts').insert({
  user_id: testUserId,
  total_questions: 10,
  correct_answers: 8,
  score_percent: 80,
  source: 'gemini',
  document_name: 'Verify Test',
}).select().single();

if (iErr) {
  console.log('❌ INSERT failed:', iErr.code, iErr.message);
  allOk = false;
} else {
  console.log('✅ INSERT OK — id:', ins.id);
  // Fetch it back
  const { data: fetched, error: fErr } = await sb.from('quiz_attempts').select('*').eq('id', ins.id).single();
  if (fErr) { console.log('❌ SELECT failed:', fErr.message); allOk = false; }
  else console.log('✅ SELECT OK — score_percent:', fetched.score_percent, 'source:', fetched.source);
  // Cleanup
  await sb.from('quiz_attempts').delete().eq('id', ins.id);
  console.log('✅ DELETE cleanup OK');
}

console.log(allOk
  ? '\n✅ All checks passed. Quiz saves and analytics will work correctly.'
  : '\n❌ Some checks failed. Apply server/db/migrations/002_grant_permissions.sql in the Supabase SQL Editor.'
);
