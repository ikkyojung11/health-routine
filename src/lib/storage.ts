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

// ==================== EXERCISES ====================

export function getExercises(): Exercise[] {
  if (typeof window === 'undefined') return DEFAULT_EXERCISES;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXERCISES);
    if (!raw) {
      // First time initialization with defaults
      localStorage.setItem(STORAGE_KEY_EXERCISES, JSON.stringify(DEFAULT_EXERCISES));
      return DEFAULT_EXERCISES;
    }
    const parsed: Exercise[] = JSON.parse(raw);
    
    // Merge any missing default exercises in case new ones were added
    const existingIds = new Set(parsed.map((e) => e.id));
    const missingDefaults = DEFAULT_EXERCISES.filter((d) => !existingIds.has(d.id));
    if (missingDefaults.length > 0) {
      const merged = [...parsed, ...missingDefaults];
      localStorage.setItem(STORAGE_KEY_EXERCISES, JSON.stringify(merged));
      return merged;
    }
    return parsed;
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
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (!raw) {
      // Initialize with realistic beginner starter history so analytics looks great right away!
      const starterSessions = generateStarterSessions();
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(starterSessions));
      return starterSessions;
    }
    const parsed: WorkoutSession[] = JSON.parse(raw);
    // Sort descending by date
    return parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
  // Sessions sorted ascending by date for chronological trend
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

// ==================== STARTER DEMO DATA ====================

function generateStarterSessions(): WorkoutSession[] {
  // Generates 4 realistic beginner workout logs over the past month so users can explore immediately!
  const today = new Date();
  
  const formatDate = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'demo-session-1',
      date: formatDate(21),
      title: '첫 가슴 & 팔 헬스 시작!',
      durationMinutes: 45,
      notes: '처음으로 헬스장 등록하고 기구 사용법 익힘. 무리하지 않고 가볍게 시작함!',
      totalVolume: 3200,
      totalSets: 9,
      logs: [
        {
          id: 'log-1-1',
          exerciseId: 'chest-press-machine',
          exerciseName: '체스트 프레스 머신',
          category: '가슴',
          sets: [
            { id: 's1', setNumber: 1, weight: 20, reps: 12, completed: true },
            { id: 's2', setNumber: 2, weight: 25, reps: 10, completed: true },
            { id: 's3', setNumber: 3, weight: 25, reps: 10, completed: true },
          ],
        },
        {
          id: 'log-1-2',
          exerciseId: 'chest-bench-press',
          exerciseName: '바벨 벤치프레스',
          category: '가슴',
          sets: [
            { id: 's4', setNumber: 1, weight: 30, reps: 10, completed: true },
            { id: 's5', setNumber: 2, weight: 30, reps: 10, completed: true },
            { id: 's6', setNumber: 3, weight: 35, reps: 8, completed: true },
          ],
        },
        {
          id: 'log-1-3',
          exerciseId: 'arm-cable-pushdown',
          exerciseName: '케이블 트라이셉스 푸시다운 (로프/바)',
          category: '팔',
          sets: [
            { id: 's7', setNumber: 1, weight: 15, reps: 15, completed: true },
            { id: 's8', setNumber: 2, weight: 15, reps: 12, completed: true },
            { id: 's9', setNumber: 3, weight: 20, reps: 10, completed: true },
          ],
        },
      ],
    },
    {
      id: 'demo-session-2',
      date: formatDate(14),
      title: '등 & 하체 루틴',
      durationMinutes: 50,
      notes: '랫풀다운 자세가 조금씩 잡히는 것 같음. 하체 레그프레스 굿!',
      totalVolume: 5100,
      totalSets: 9,
      logs: [
        {
          id: 'log-2-1',
          exerciseId: 'back-lat-pulldown',
          exerciseName: '랫 풀 다운 머신',
          category: '등',
          sets: [
            { id: 's10', setNumber: 1, weight: 25, reps: 12, completed: true },
            { id: 's11', setNumber: 2, weight: 30, reps: 10, completed: true },
            { id: 's12', setNumber: 3, weight: 30, reps: 10, completed: true },
          ],
        },
        {
          id: 'log-2-2',
          exerciseId: 'leg-press-machine',
          exerciseName: '레그 프레스 머신',
          category: '하체',
          sets: [
            { id: 's13', setNumber: 1, weight: 50, reps: 15, completed: true },
            { id: 's14', setNumber: 2, weight: 60, reps: 12, completed: true },
            { id: 's15', setNumber: 3, weight: 70, reps: 10, completed: true },
          ],
        },
        {
          id: 'log-2-3',
          exerciseId: 'arm-barbell-curl',
          exerciseName: '이지바 / 바벨 바이셉스 컬',
          category: '팔',
          sets: [
            { id: 's16', setNumber: 1, weight: 15, reps: 12, completed: true },
            { id: 's17', setNumber: 2, weight: 15, reps: 10, completed: true },
            { id: 's18', setNumber: 3, weight: 20, reps: 8, completed: true },
          ],
        },
      ],
    },
    {
      id: 'demo-session-3',
      date: formatDate(7),
      title: '가슴 증량 성공!',
      durationMinutes: 55,
      notes: '벤치프레스 40kg 8회 성공! 무게가 점점 가볍게 느껴진다.',
      totalVolume: 4200,
      totalSets: 9,
      logs: [
        {
          id: 'log-3-1',
          exerciseId: 'chest-press-machine',
          exerciseName: '체스트 프레스 머신',
          category: '가슴',
          sets: [
            { id: 's19', setNumber: 1, weight: 30, reps: 12, completed: true },
            { id: 's20', setNumber: 2, weight: 35, reps: 10, completed: true },
            { id: 's21', setNumber: 3, weight: 35, reps: 10, completed: true },
          ],
        },
        {
          id: 'log-3-2',
          exerciseId: 'chest-bench-press',
          exerciseName: '바벨 벤치프레스',
          category: '가슴',
          sets: [
            { id: 's22', setNumber: 1, weight: 35, reps: 10, completed: true },
            { id: 's23', setNumber: 2, weight: 40, reps: 8, completed: true },
            { id: 's24', setNumber: 3, weight: 40, reps: 8, completed: true },
          ],
        },
        {
          id: 'log-3-3',
          exerciseId: 'arm-cable-pushdown',
          exerciseName: '케이블 트라이셉스 푸시다운 (로프/바)',
          category: '팔',
          sets: [
            { id: 's25', setNumber: 1, weight: 20, reps: 12, completed: true },
            { id: 's26', setNumber: 2, weight: 25, reps: 10, completed: true },
            { id: 's27', setNumber: 3, weight: 25, reps: 10, completed: true },
          ],
        },
      ],
    },
    {
      id: 'demo-session-4',
      date: formatDate(2),
      title: '등 & 하체 볼륨 업',
      durationMinutes: 55,
      notes: '랫풀다운 40kg 달성! 레그프레스 90kg까지 올림.',
      totalVolume: 6700,
      totalSets: 9,
      logs: [
        {
          id: 'log-4-1',
          exerciseId: 'back-lat-pulldown',
          exerciseName: '랫 풀 다운 머신',
          category: '등',
          sets: [
            { id: 's28', setNumber: 1, weight: 30, reps: 12, completed: true },
            { id: 's29', setNumber: 2, weight: 35, reps: 10, completed: true },
            { id: 's30', setNumber: 3, weight: 40, reps: 8, completed: true },
          ],
        },
        {
          id: 'log-4-2',
          exerciseId: 'leg-press-machine',
          exerciseName: '레그 프레스 머신',
          category: '하체',
          sets: [
            { id: 's31', setNumber: 1, weight: 70, reps: 12, completed: true },
            { id: 's32', setNumber: 2, weight: 80, reps: 10, completed: true },
            { id: 's33', setNumber: 3, weight: 90, reps: 10, completed: true },
          ],
        },
        {
          id: 'log-4-3',
          exerciseId: 'arm-barbell-curl',
          exerciseName: '이지바 / 바벨 바이셉스 컬',
          category: '팔',
          sets: [
            { id: 's34', setNumber: 1, weight: 17.5, reps: 10, completed: true },
            { id: 's35', setNumber: 2, weight: 20, reps: 10, completed: true },
            { id: 's36', setNumber: 3, weight: 22.5, reps: 8, completed: true },
          ],
        },
      ],
    },
  ];
}
