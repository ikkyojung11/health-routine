'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  TrendingUp,
  Award,
  Dumbbell,
  Flame,
  ChevronDown,
  Calendar,
  Sparkles,
} from 'lucide-react';
import GrowthChart from '@/components/GrowthChart';
import {
  getExercises,
  getWorkoutSessions,
  getExerciseGrowthStats,
} from '@/lib/storage';
import { Exercise, ExerciseCategory, ExerciseGrowthStats } from '@/lib/types';

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const initialExerciseId = searchParams.get('exerciseId');

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | '전체'>('전체');
  const [currentStats, setCurrentStats] = useState<ExerciseGrowthStats | null>(null);

  // Overall stats
  const [totalSessionsCount, setTotalSessionsCount] = useState<number>(0);
  const [totalAccumulatedVolume, setTotalAccumulatedVolume] = useState<number>(0);

  useEffect(() => {
    const exList = getExercises();
    setExercises(exList);

    const sessions = getWorkoutSessions();
    setTotalSessionsCount(sessions.length);

    const totalVol = sessions.reduce((sum, s) => sum + (s.totalVolume || 0), 0);
    setTotalAccumulatedVolume(totalVol);

    // If query param provided, select that exercise
    if (initialExerciseId && exList.some((e) => e.id === initialExerciseId)) {
      setSelectedExerciseId(initialExerciseId);
    } else if (exList.length > 0) {
      // Default to bench press or first exercise
      const defaultEx = exList.find((e) => e.id === 'chest-bench-press') || exList[0];
      setSelectedExerciseId(defaultEx.id);
    }
  }, [initialExerciseId]);

  useEffect(() => {
    if (selectedExerciseId) {
      const stats = getExerciseGrowthStats(selectedExerciseId);
      setCurrentStats(stats);
    }
  }, [selectedExerciseId]);

  const categories = ['전체', '가슴', '등', '하체', '팔', '어깨', '복근/코어'];

  const filteredExercises = exercises.filter(
    (e) => selectedCategory === '전체' || e.category === selectedCategory
  );

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          기구별 성장 분석
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          내가 과거에 비해 중량과 볼륨이 얼마나 늘었는지 확인하세요!
        </p>
      </div>

      {/* Overall Gym Stats Banner */}
      <div className="grid grid-cols-2 gap-3 p-4 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 font-medium">총 운동 일수</div>
            <div className="text-lg font-black text-white">{totalSessionsCount} 회</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 border-l border-zinc-800 pl-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 font-medium">누적 든 무게 (볼륨)</div>
            <div className="text-lg font-black text-emerald-400">
              {Math.round(totalAccumulatedVolume / 1000).toLocaleString()} 톤
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-zinc-300">
          부위 선택 후 기구를 골라보세요
        </label>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as ExerciseCategory | '전체')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all min-h-[40px] flex items-center justify-center ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 scale-[1.02]'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Dropdown Selector */}
      <div className="relative">
        <label className="block text-xs font-bold text-zinc-400 mb-1">분석할 기구</label>
        <div className="relative">
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3.5 text-sm font-bold text-white appearance-none focus:outline-none focus:border-emerald-500 pr-10"
          >
            {filteredExercises.map((ex) => (
              <option key={ex.id} value={ex.id} className="bg-zinc-950 text-white">
                [{ex.category}] {ex.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-5 h-5 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Growth Chart & Historical Log List */}
      {currentStats ? (
        <GrowthChart stats={currentStats} />
      ) : (
        <div className="p-8 text-center text-zinc-500">기구를 선택해주세요.</div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">성장 분석 로딩 중...</div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
