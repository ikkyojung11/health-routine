import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig, WorkoutSession, Exercise } from './types';

const STORAGE_KEY_CONFIG = 'health_routine_supabase_config';

export function getSupabaseConfig(): SupabaseConfig {
  if (typeof window === 'undefined') {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read supabase config from localStorage', e);
  }

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
}

let cachedClient: SupabaseClient | null = null;
let lastUsedConfig: string = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  const configSignature = `${config.url}_${config.anonKey}`;
  if (cachedClient && lastUsedConfig === configSignature) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey);
    lastUsedConfig = configSignature;
    return cachedClient;
  } catch (e) {
    console.error('Failed to initialize Supabase client', e);
    return null;
  }
}

// Test Supabase Connection
export async function testSupabaseConnection(config: SupabaseConfig): Promise<{ success: boolean; message: string }> {
  try {
    if (!config.url || !config.anonKey) {
      return { success: false, message: 'URL과 Anon Key를 모두 입력해주세요.' };
    }
    const testClient = createClient(config.url, config.anonKey);
    const { error } = await testClient.from('exercises').select('id').limit(1);
    if (error) {
      if (error.message.includes('relation "public.exercises" does not exist') || error.code === '42P01') {
        return {
          success: false,
          message: '연결은 되었으나 exercises 테이블이 없습니다. schema.sql을 Supabase SQL Editor에서 실행해주세요!',
        };
      }
      return { success: false, message: `연결 오류: ${error.message}` };
    }
    return { success: true, message: 'Supabase 데이터베이스에 성공적으로 연결되었습니다!' };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : '알 수 없는 연결 오류가 발생했습니다.' };
  }
}

// Cloud Sync Helpers
export async function syncSessionToSupabase(session: WorkoutSession): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    // Upsert session
    const { error: sessionError } = await client.from('workout_sessions').upsert({
      id: session.id,
      date: session.date,
      title: session.title || '헬스 세션',
      duration_minutes: session.durationMinutes || 0,
      total_volume: session.totalVolume,
      total_sets: session.totalSets,
      notes: session.notes || '',
    });

    if (sessionError) {
      console.error('Error syncing workout session:', sessionError);
      return false;
    }

    // Upsert logs and sets
    for (let i = 0; i < session.logs.length; i++) {
      const log = session.logs[i];
      await client.from('workout_logs').upsert({
        id: log.id,
        session_id: session.id,
        exercise_id: log.exerciseId,
        exercise_name: log.exerciseName,
        category: log.category,
        order_index: i,
        notes: log.notes || '',
      });

      for (const s of log.sets) {
        await client.from('workout_sets').upsert({
          id: s.id,
          log_id: log.id,
          set_number: s.setNumber,
          weight: s.weight,
          reps: s.reps,
          completed: s.completed,
          rpe: s.rpe || null,
        });
      }
    }

    return true;
  } catch (err) {
    console.error('Failed to sync to Supabase:', err);
    return false;
  }
}
