import { DEFAULT_EXERCISES } from '@/data/defaultExercises';
import {
  Exercise,
  WorkoutSession,
  ExerciseGrowthStats,
  ExerciseHistoryPoint,
  WorkoutExerciseLog,
} from './types';
import { syncSessionToSupabase } from './supabase';

const STORAGE_KEY_EXERCISES = 'health_routine_exercises';
const STORAGE_KEY_SESSIONS = 'health_routine_sessions';
const STORAGE_KEY_ACTIVE_SESSION = 'health_routine_active_session';
const STORAGE_KEY_CLEANED_DEMO = 'health_routine_cleaned_demo_v2';

// ==================== EXERCISES ====================

export function getExercises(): Exercise[] {
  if (typeof window === 'undefined') return DEFAULT_EXERCISES;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXERCISES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_EXERCISES, JSON.stringify(DEFAULT_EXERCISES));
      return DEFAULT_EXERCISES;
    }
    const parsed: Exercise[] = JSON.parse(raw);

    // Sync any updated default fields (e.g. englishName, alternatives) while preserving custom exercises
    let hasUpdates = false;
    const synced = parsed.map((p) => {
      const def = DEFAULT_EXERCISES.find((d) => d.id === p.id);
      if (def) {
        if (!p.englishName && def.englishName) hasUpdates = true;
        if (!p.alternatives && def.alternatives) hasUpdates = true;
        return {
          ...p,
          englishName: def.englishName || p.englishName,
          alternatives: def.alternatives || p.alternatives,
          tips: def.tips || p.tips,
          targetMuscle: def.targetMuscle || p.targetMuscle,
        };
      }
      return p;
    });

    const existingIds = new Set(synced.map((e) => e.id));
    const missingDefaults = DEFAULT_EXERCISES.filter((d) => !existingIds.has(d.id));
    if (missingDefaults.length > 0 || hasUpdates) {
      const merged = [...synced, ...missingDefaults];
      localStorage.setItem(STORAGE_KEY_EXERCISES, JSON.stringify(merged));
      return merged;
    }
    return synced;
  } catch (e) {
    console.error('Failed to get exercises from localStorage', e);
    return DEFAULT_EXERCISES;
  }
}

export function saveCustomExercise(exercise: Omit<Exercise, 'id'>): Exercise {
  const current = getExercises();
  const newExercise: Exercise = {
    ...exercise,
    id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    isCustom: true,
  };
  const updated = [newExercise, ...current];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_EXERCISES, JSON.stringify(updated));
  }
  return newExercise;
}

export function getExerciseById(id: string): Exercise | undefined {
  const exercises = getExercises();
  return exercises.find((e) => e.id === id);
}

// ==================== SESSIONS ====================

export function getWorkoutSessions(): WorkoutSession[] {
  if (typeof window === 'undefined') return [];

  try {
    // One-time automatic purge of legacy demo sessions
    const hasPurgedDemo = localStorage.getItem(STORAGE_KEY_CLEANED_DEMO);
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);

    if (!hasPurgedDemo) {
      localStorage.setItem(STORAGE_KEY_CLEANED_DEMO, 'true');
      if (raw) {
        try {
          const existing: WorkoutSession[] = JSON.parse(raw);
          const nonDemo = existing.filter((s) => !s.id.startsWith('demo-session-'));
          localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(nonDemo));
          return nonDemo.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } catch {
          localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify([]));
          return [];
        }
      }
    }

    if (!raw) {
      return [];
    }

    const parsed: WorkoutSession[] = JSON.parse(raw);
    // Filter out any lingering demo data
    const cleaned = parsed.filter((s) => !s.id.startsWith('demo-session-'));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(cleaned));
    }

    // Sort descending by date
    return cleaned.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (e) {
    console.error('Failed to get sessions from localStorage', e);
    return [];
  }
}

export function saveWorkoutSession(session: WorkoutSession): void {
  if (typeof window === 'undefined') return;

  const current = getWorkoutSessions();
  const existingIdx = current.findIndex((s) => s.id === session.id);

  let updated: WorkoutSession[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = session;
  } else {
    updated = [session, ...current];
  }

  localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updated));

  // Background sync to Supabase if configured
  syncSessionToSupabase(session).catch((err) => {
    console.warn('Background Supabase sync attempt failed:', err);
  });
}

export function deleteWorkoutSession(sessionId: string): void {
  if (typeof window === 'undefined') return;
  const current = getWorkoutSessions();
  const updated = current.filter((s) => s.id !== sessionId);
  localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updated));
}

// ==================== ACTIVE IN-PROGRESS WORKOUT ====================

export function getActiveSession(): WorkoutSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse active session', e);
    return null;
  }
}

export function saveActiveSession(session: WorkoutSession | null): void {
  if (typeof window === 'undefined') return;
  if (!session) {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_SESSION);
  } else {
    localStorage.setItem(STORAGE_KEY_ACTIVE_SESSION, JSON.stringify(session));
  }
}

// ==================== PREVIOUS RECORD LOOKUP ====================

/**
 * 특정 기구의 가장 최근 운동 기록을 찾아옵니다.
 * 운동할 때 "지난번엔 몇 kg으로 몇 개 했지?" 바로 확인용
 */
export function getLastWorkoutLogForExercise(exerciseId: string): WorkoutExerciseLog | null {
  const sessions = getWorkoutSessions();
  for (const session of sessions) {
    const foundLog = session.logs.find((log) => log.exerciseId === exerciseId);
    if (foundLog && foundLog.sets.some((s) => s.completed || s.weight > 0)) {
      return foundLog;
    }
  }
  return null;
}

// ==================== GROWTH ANALYTICS ====================

/**
 * 특정 기구의 과거 성장 추이(날짜별 최고 중량, 총 볼륨, 1RM, 증감량 등)를 계산합니다.
 */
export function getExerciseGrowthStats(exerciseId: string): ExerciseGrowthStats | null {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) return null;

  const sessions = getWorkoutSessions();
  const chronologicalSessions = [...sessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const history: ExerciseHistoryPoint[] = [];

  for (const session of chronologicalSessions) {
    const log = session.logs.find((l) => l.exerciseId === exerciseId);
    if (!log) continue;

    // Filter sets that have non-zero weight/reps
    const validSets = log.sets.filter((s) => s.weight > 0 && s.reps > 0);
    if (validSets.length === 0) continue;

    let maxWeight = 0;
    let totalVolume = 0;
    let bestSet = validSets[0];
    let max1RM = 0;

    for (const set of validSets) {
      if (set.weight > maxWeight) {
        maxWeight = set.weight;
      }
      totalVolume += set.weight * set.reps;

      // Epley formula: 1RM = Weight * (1 + Reps / 30)
      const est1RM = Math.round(set.weight * (1 + set.reps / 30) * 10) / 10;
      if (est1RM > max1RM) {
        max1RM = est1RM;
        bestSet = set;
      }
    }

    const setsSummary = `${bestSet.weight}kg x ${bestSet.reps}회 (${validSets.length}세트)`;

    history.push({
      date: session.date,
      sessionId: session.id,
      maxWeight,
      totalVolume,
      bestSet: {
        weight: bestSet.weight,
        reps: bestSet.reps,
      },
      estimated1RM: max1RM,
      setsSummary,
    });
  }

  if (history.length === 0) {
    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      category: exercise.category,
      history: [],
      allTimeMaxWeight: 0,
      growthKg: 0,
      growthPercentage: 0,
      totalSessionsCount: 0,
    };
  }

  const firstRecord = history[0];
  const latestRecord = history[history.length - 1];
  const allTimeMaxWeight = Math.max(...history.map((h) => h.maxWeight));
  const growthKg = Math.round((latestRecord.maxWeight - firstRecord.maxWeight) * 10) / 10;
  const growthPercentage =
    firstRecord.maxWeight > 0
      ? Math.round(((latestRecord.maxWeight - firstRecord.maxWeight) / firstRecord.maxWeight) * 100)
      : 0;

  return {
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    category: exercise.category,
    history,
    firstRecord,
    latestRecord,
    allTimeMaxWeight,
    growthKg,
    growthPercentage,
    totalSessionsCount: history.length,
  };
}
