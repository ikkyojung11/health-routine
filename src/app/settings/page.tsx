'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  RotateCcw,
  Copy,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
} from '@/lib/supabase';
import { getWorkoutSessions, getExercises } from '@/lib/storage';

export default function SettingsPage() {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  }>({
    tested: false,
    success: false,
    message: '',
  });

  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    const config = getSupabaseConfig();
    setSupabaseUrl(config.url || '');
    setAnonKey(config.anonKey || '');
  }, []);

  const handleSaveAndTestSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setConnectionStatus({ tested: false, success: false, message: '' });

    const newConfig = { url: supabaseUrl.trim(), anonKey: anonKey.trim() };
    saveSupabaseConfig(newConfig);

    const res = await testSupabaseConnection(newConfig);
    setIsTesting(false);
    setConnectionStatus({
      tested: true,
      success: res.success,
      message: res.message,
    });
  };

  const handleExportData = () => {
    const data = {
      sessions: getWorkoutSessions(),
      exercises: getExercises(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health_routine_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.sessions) {
          localStorage.setItem('health_routine_sessions', JSON.stringify(parsed.sessions));
        }
        if (parsed.exercises) {
          localStorage.setItem('health_routine_exercises', JSON.stringify(parsed.exercises));
        }
        alert('데이터가 성공적으로 복원되었습니다! 새로고침합니다.');
        window.location.reload();
      } catch (err) {
        alert('올바른 JSON 백업 파일이 아닙니다.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('정말로 모든 운동 기록과 설정을 초기화하시겠습니까? (이 작업은 되돌릴 수 없습니다)')) {
      localStorage.clear();
      alert('초기화되었습니다. 기본 데이터로 새로고침합니다.');
      window.location.reload();
    }
  };

  const sqlSchemaSnippet = `-- 1. Supabase SQL Editor에 복사하여 붙여넣고 Run을 누르세요!
create table if not exists public.exercises (
  id text primary key,
  name text not null,
  category text not null,
  target_muscle text,
  tips text,
  is_custom boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.workout_sessions (
  id text primary key,
  date text not null,
  title text,
  duration_minutes integer default 0,
  notes text,
  total_volume numeric default 0,
  total_sets integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.workout_logs (
  id text primary key,
  session_id text not null references public.workout_sessions(id) on delete cascade,
  exercise_id text not null,
  exercise_name text not null,
  category text not null,
  order_index integer default 0,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.workout_sets (
  id text primary key,
  log_id text not null references public.workout_logs(id) on delete cascade,
  set_number integer not null,
  weight numeric not null default 0,
  reps integer not null default 0,
  completed boolean default false,
  rpe numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          설정 및 데이터 관리
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Supabase 클라우드 데이터베이스 연동과 로컬 데이터 백업을 관리합니다.
        </p>
      </div>

      {/* Supabase Integration Card */}
      <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Supabase 연동</h3>
              <p className="text-[11px] text-zinc-400">클라우드 DB 실시간 동기화</p>
            </div>
          </div>
          <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full font-medium">
            선택 사항
          </span>
        </div>

        <form onSubmit={handleSaveAndTestSupabase} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Project URL
            </label>
            <input
              type="url"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Anon Key (Public API Key)
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsIn..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {connectionStatus.tested && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
                connectionStatus.success
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-rose-950/20 border-rose-500/40 text-rose-400'
              }`}
            >
              {connectionStatus.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{connectionStatus.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isTesting}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isTesting ? '연결 확인 중...' : '연결 테스트 및 저장'}</span>
          </button>
        </form>

        {/* Schema SQL copy helper */}
        <div className="pt-2 border-t border-zinc-800/80">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>Supabase 테이블 생성 SQL 스키마</span>
            <button
              onClick={copySqlToClipboard}
              className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedSql ? '복사 완료!' : 'SQL 복사'}</span>
            </button>
          </div>
          <div className="text-[11px] text-zinc-500 leading-relaxed">
            * 복사 후 Supabase 대시보드의 <strong className="text-zinc-300">SQL Editor</strong>에 붙여넣고
            실행(Run)하시면 바로 연동 준비가 끝납니다.
          </div>
        </div>
      </div>

      {/* Local Storage Notice */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex items-start space-x-3 text-xs text-zinc-400 leading-relaxed">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-zinc-200">100% 오프라인 & 로컬 저장 지원:</strong> Supabase를 연결하지
          않아도 모든 운동 기록, 기구 목록, 성장 추이는 브라우저의 안전한 로컬 저장소에 영구 보관됩니다.
          헬스장에서 데이터가 끊겨도 안심하고 사용하세요!
        </div>
      </div>

      {/* Data Backup & Restore */}
      <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-3xl shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-zinc-200">데이터 백업 및 복원</h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleExportData}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-2xl text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>JSON 백업 받기</span>
          </button>

          <label className="flex items-center justify-center space-x-2 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-2xl text-xs font-semibold transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-teal-400" />
            <span>백업 복원하기</span>
            <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
          </label>
        </div>

        <button
          onClick={handleResetData}
          className="w-full py-3 bg-zinc-950 hover:bg-rose-950/40 text-rose-400 border border-zinc-800 hover:border-rose-800/60 rounded-2xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>전체 데이터 초기화</span>
        </button>
      </div>
    </div>
  );
}
