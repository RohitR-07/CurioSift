// server/services/profileService.js
import { supabaseAdmin } from '../db/supabaseAdmin.js';

/**
 * Fetch a user's profile and preferences in one call.
 * If the profile does not exist yet (race between trigger and first request),
 * creates it on the fly.
 */
export async function getProfileWithPreferences(userId, email, displayName) {
  // Upsert profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert(
      { id: userId, email, display_name: displayName ?? email?.split('@')[0] },
      { onConflict: 'id', ignoreDuplicates: false }
    )
    .select()
    .single();

  if (profileError) throw new Error(`Profile upsert failed: ${profileError.message}`);

  // Upsert preferences (creates default row if missing)
  const { data: prefs, error: prefsError } = await supabaseAdmin
    .from('user_preferences')
    .upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true })
    .select()
    .single();

  if (prefsError) throw new Error(`Preferences upsert failed: ${prefsError.message}`);

  return { profile, preferences: prefs };
}

/**
 * Update only the fields provided in the patch object.
 */
export async function updateProfile(userId, patch) {
  const allowed = ['display_name', 'avatar_url'];
  const filtered = Object.fromEntries(
    Object.entries(patch).filter(([k]) => allowed.includes(k))
  );

  if (Object.keys(filtered).length === 0) return null;

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(filtered)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(`Profile update failed: ${error.message}`);
  return data;
}

/**
 * Update user preferences.
 */
export async function updatePreferences(userId, patch) {
  const allowed = ['theme', 'default_quiz_count', 'default_difficulty', 'show_explanations'];
  const filtered = Object.fromEntries(
    Object.entries(patch).filter(([k]) => allowed.includes(k))
  );

  if (Object.keys(filtered).length === 0) return null;

  const { data, error } = await supabaseAdmin
    .from('user_preferences')
    .update(filtered)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new Error(`Preferences update failed: ${error.message}`);
  return data;
}
