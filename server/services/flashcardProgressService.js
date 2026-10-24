// server/services/flashcardProgressService.js
import { supabaseAdmin } from '../db/supabaseAdmin.js';

/**
 * Upsert a single card's status (known / needs_review) for a user's deck.
 */
export async function saveCardStatus(userId, deckId, cardIndex, status) {
  if (!['known', 'needs_review'].includes(status)) {
    throw new Error(`Invalid status: ${status}. Must be 'known' or 'needs_review'.`);
  }

  const { data, error } = await supabaseAdmin
    .from('flashcard_progress')
    .upsert(
      { user_id: userId, deck_id: deckId, card_index: cardIndex, status },
      { onConflict: 'user_id,deck_id,card_index' }
    )
    .select()
    .single();

  if (error) throw new Error(`Failed to save card status: ${error.message}`);
  return data;
}

/**
 * Bulk upsert multiple card statuses for a deck.
 * cards: Array<{ cardIndex: number, status: 'known' | 'needs_review' }>
 */
export async function saveMultipleCardStatuses(userId, deckId, cards) {
  if (!cards || cards.length === 0) return [];

  const rows = cards.map(({ cardIndex, status }) => ({
    user_id: userId,
    deck_id: deckId,
    card_index: cardIndex,
    status,
  }));

  const { data, error } = await supabaseAdmin
    .from('flashcard_progress')
    .upsert(rows, { onConflict: 'user_id,deck_id,card_index' })
    .select();

  if (error) throw new Error(`Failed to bulk-save card statuses: ${error.message}`);
  return data ?? [];
}

/**
 * Retrieve all card progress for a specific deck.
 * Returns an object keyed by card_index: { cardIndex, status }
 */
export async function getDeckProgress(userId, deckId) {
  const { data, error } = await supabaseAdmin
    .from('flashcard_progress')
    .select('card_index, status')
    .eq('user_id', userId)
    .eq('deck_id', deckId);

  if (error) throw new Error(`Failed to fetch deck progress: ${error.message}`);

  // Convert to a map of cardIndex → status for easy frontend consumption
  const progress = {};
  for (const row of data ?? []) {
    progress[row.card_index] = row.status;
  }
  return progress;
}
