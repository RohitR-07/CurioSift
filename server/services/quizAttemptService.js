// server/services/quizAttemptService.js
import { supabaseAdmin } from '../db/supabaseAdmin.js';

/**
 * Persist a completed quiz attempt for a user.
 * Only saves attempts where source === 'gemini' unless explicitly allowed.
 */
export async function saveQuizAttempt(userId, data) {
  const {
    documentId,
    documentName,
    topic,
    questionType,
    difficulty,
    totalQuestions,
    correctAnswers,
    scorePercent,
    source = 'gemini',
  } = data;

  const { data: row, error } = await supabaseAdmin
    .from('quiz_attempts')
    .insert({
      user_id: userId,
      document_id: documentId ?? null,
      document_name: documentName ?? null,
      topic: topic ?? null,
      question_type: questionType ?? null,
      difficulty: difficulty ?? null,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      score_percent: scorePercent,
      source,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to save quiz attempt: ${error.message}`);
  return row;
}

/**
 * Retrieve recent quiz attempts for a user.
 */
export async function getQuizAttempts(userId, limit = 20) {
  const { data, error } = await supabaseAdmin
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch quiz attempts: ${error.message}`);
  return data ?? [];
}

/**
 * Return aggregate stats for a user's quiz history.
 */
export async function getQuizStats(userId) {
  const { data, error } = await supabaseAdmin
    .from('quiz_attempts')
    .select('total_questions, correct_answers, score_percent, source')
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to fetch quiz stats: ${error.message}`);

  const rows = data ?? [];
  const total = rows.length;
  const aiAttempts = rows.filter((r) => r.source === 'gemini').length;
  const avgScore = total > 0
    ? Math.round(rows.reduce((s, r) => s + Number(r.score_percent), 0) / total)
    : 0;

  return { totalAttempts: total, aiAttempts, avgScore };
}

/**
 * Return full analytics data for the Analytics page.
 */
export async function getAnalyticsStats(userId) {
  const { data, error } = await supabaseAdmin
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch analytics: ${error.message}`);

  const rows = data ?? [];
  if (rows.length === 0) {
    return {
      totalAttempts: 0, avgScore: 0, bestScore: 0, recentAttempts: [],
      byDifficulty: {}, byDocument: [], scoreDistribution: [],
    };
  }

  const scores = rows.map(r => Number(r.score_percent));
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const bestScore = Math.max(...scores);

  // Score distribution buckets: 0-20, 21-40, 41-60, 61-80, 81-100
  const buckets = [
    { label: '0–20%', min: 0, max: 20, count: 0 },
    { label: '21–40%', min: 21, max: 40, count: 0 },
    { label: '41–60%', min: 41, max: 60, count: 0 },
    { label: '61–80%', min: 61, max: 80, count: 0 },
    { label: '81–100%', min: 81, max: 100, count: 0 },
  ];
  scores.forEach(s => {
    const b = buckets.find(b => s >= b.min && s <= b.max);
    if (b) b.count++;
  });

  // By difficulty
  const byDifficulty = {};
  rows.forEach(r => {
    const d = r.difficulty || 'unknown';
    if (!byDifficulty[d]) byDifficulty[d] = { count: 0, totalScore: 0 };
    byDifficulty[d].count++;
    byDifficulty[d].totalScore += Number(r.score_percent);
  });
  Object.values(byDifficulty).forEach(d => {
    d.avgScore = Math.round(d.totalScore / d.count);
    delete d.totalScore;
  });

  // By document (top 5)
  const docMap = {};
  rows.forEach(r => {
    const name = r.document_name || 'Unknown';
    if (!docMap[name]) docMap[name] = { count: 0, totalScore: 0 };
    docMap[name].count++;
    docMap[name].totalScore += Number(r.score_percent);
  });
  const byDocument = Object.entries(docMap)
    .map(([name, d]) => ({ name, count: d.count, avgScore: Math.round(d.totalScore / d.count) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalAttempts: rows.length,
    avgScore,
    bestScore,
    recentAttempts: rows.slice(0, 10),
    byDifficulty,
    byDocument,
    scoreDistribution: buckets,
  };
}
