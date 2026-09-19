export type ExerciseCategory = '가슴' | '등' | '하체' | '팔' | '어깨' | '복근/코어' | '유산소';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  targetMuscle: string;
  tips: string;
  isCustom?: boolean;
  defaultWeightUnit?: 'kg';
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
  rpe?: number;
}

export interface WorkoutExerciseLog {
  id: string;
  exerciseId: string;
  exerciseName: string;
  category: ExerciseCategory;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  title?: string;
  durationMinutes?: number;
  logs: WorkoutExerciseLog[];
  totalVolume: number;
  totalSets: number;
  notes?: string;
  createdAt?: string;
}

export interface ExerciseHistoryPoint {
  date: string;
  sessionId: string;
  maxWeight: number;
  totalVolume: number;
  bestSet: {
    weight: number;
    reps: number;
  };
  estimated1RM: number; // Epley formula: weight * (1 + reps / 30)
  setsSummary: string; // e.g. "40kg x 10회 (3세트)"
}

export interface ExerciseGrowthStats {
  exerciseId: string;
  exerciseName: string;
  category: ExerciseCategory;
  history: ExerciseHistoryPoint[];
  firstRecord?: ExerciseHistoryPoint;
  latestRecord?: ExerciseHistoryPoint;
  allTimeMaxWeight: number;
  growthKg: number;
  growthPercentage: number;
  totalSessionsCount: number;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected?: boolean;
}
