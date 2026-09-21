'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Calendar,
  Clock,
  Dumbbell,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  Play,
  ArrowRight,
  Flame,
  Award,
  Zap,
} from 'lucide-react';
import { RECOMMENDED_ROUTINES } from '@/data/recommendedRoutines';
import { getExercises, saveActiveSession } from '@/lib/storage';
import { WorkoutRoutine, WorkoutSession, WorkoutExerciseLog } from '@/lib/types';

export default function RoutinesPage() {
  const router = useRouter();
  const [selectedSplit, setSelectedSplit] = useState<string>('전체');

  const splitFilters = ['전체', '무분할 (전신)', '3분할', '2분할'];

  const filteredRoutines = RECOMMENDED_ROUTINES.filter(
    (r) => selectedSplit === '전체' || r.splitType === selectedSplit
  );

  const handleStartRoutine = (routine: WorkoutRoutine) => {
    const allExercises = getExercises();
    const today = new Date().toISOString().split('T')[0];

    // Build logs from routine exercises
    const logs: WorkoutExerciseLog[] = routine.exercises.map((re, exIdx) => {
      const foundEx = allExercises.find((e) => e.id === re.exerciseId);
      const sets = Array.from({ length: re.recommendedSets }, (_, setIdx) => ({
        id: `set-${Date.now()}-${exIdx}-${setIdx + 1}`,
        setNumber: setIdx + 1,
        weight: 0,
        reps: re.recommendedReps,
        completed: false,
      }));

      return {
        id: `log-${Date.now()}-${exIdx}`,
        exerciseId: re.exerciseId,
        exerciseName: foundEx ? foundEx.name : re.exerciseId,
        category: foundEx ? foundEx.category : '가슴',
        sets,
        notes: re.tips,
      };
    });

    const totalSets = logs.reduce((sum, l) => sum + l.sets.length, 0);

    const newSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      date: today,
      title: routine.title,
      durationMinutes: routine.estimatedMinutes,
      logs,
      totalVolume: 0,
      totalSets,
      notes: `${routine.subtitle} (추천 루틴)`,
    };

    saveActiveSession(newSession);
    router.push('/workout');
  };

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty.includes('입문')) {
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="pt-2">
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold mb-1">
          <Sparkles className="w-4 h-4" />
          <span>초보자 맞춤 가이드</span>
        </div>
        <h1 className="text-2xl font-black text-white">초보자 추천 루틴 플랜</h1>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          헬스장에 가서 어떤 기구를 어떤 순서로 해야 할지 고민하지 마세요.
          원하는 루틴을 선택하면 오늘의 운동일지에 기구와 세트가 자동으로 채워집니다!
        </p>
      </div>

      {/* Beginner FAQ / Guide Banners */}
      <div className="space-y-3">
        <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>초보자는 어떤 루틴을 골라야 할까요?</span>
          </div>
          <div className="text-[11px] text-zinc-300 leading-relaxed space-y-1">
            <p>
              • <strong className="text-emerald-400">헬스장 1~2주 차</strong>: <strong className="text-white">전신 머신 입문 루틴</strong>으로 머신 셋팅법과 자세를 먼저 익히세요 (주 2~3회).
            </p>
            <p>
              • <strong className="text-emerald-400">주 3~4회 운동 가능</strong>: <strong className="text-white">3분할 루틴 (Day 1 가슴 → Day 2 등 → Day 3 하체)</strong>을 순서대로 돌리는 것이 가장 효과적입니다!
            </p>
            <p>
              • <strong className="text-emerald-400">시간이 부족한 경우</strong>: <strong className="text-white">2분할 루틴 (상체 / 하체)</strong>으로 40분씩 짧고 굵게 진행하세요.
            </p>
          </div>
        </div>

        {/* Missing machine advice banner */}
        <div className="p-4 bg-emerald-950/30 border border-emerald-500/20 rounded-2xl space-y-1.5">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>헬스장에 이 기구가 없거나 다른 사람이 쓰고 있다면?</span>
          </div>
          <div className="text-[11px] text-zinc-300 leading-relaxed space-y-1">
            <p>
              • <strong className="text-white">대체 기구 활용</strong>: 헬스는 특정 기구에 얽매일 필요가 없습니다! 각 종목에 적혀 있는 <strong className="text-emerald-400">[대체 가능 기구]</strong>를 대신 하셔도 100% 동일한 근육이 자극됩니다.
            </p>
            <p>
              • <strong className="text-white">영문 명판 확인</strong>: 국내 헬스장 기구는 보통 영문 스티커(Chest Press, Lat Pulldown 등)로 표기되어 있습니다. 각 기구의 영문명을 확인해보세요.
            </p>
            <p>
              • <strong className="text-white">직접 기구 등록</strong>: 운동일지 작성 화면에서 언제든 <strong className="text-emerald-400">[+ 새 기구 직접 등록]</strong>으로 내 헬스장 기구를 추가할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* Split Tabs Filter */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {splitFilters.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedSplit(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all min-h-[38px] ${
              selectedSplit === tab
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 scale-[1.02]'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Routine Cards List */}
      <div className="space-y-4">
        {filteredRoutines.map((routine) => {
          const allExercises = getExercises();

          return (
            <div
              key={routine.id}
              className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-3xl hover:border-zinc-700 transition-all shadow-xl space-y-4"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {routine.splitType}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyColor(
                        routine.difficulty
                      )}`}
                    >
                      {routine.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 text-xs text-zinc-400 font-medium">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>약 {routine.estimatedMinutes}분</span>
                  </div>
                </div>

                <h3 className="text-lg font-black text-white">{routine.title}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{routine.subtitle}</p>
              </div>

              {/* Target Categories */}
              <div className="flex flex-wrap gap-1.5">
                {routine.targetCategories.map((cat) => (
                  <span
                    key={cat}
                    className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-zinc-950 text-emerald-400 border border-zinc-800"
                  >
                    #{cat}
                  </span>
                ))}
              </div>

              {/* Exercise Flow / Steps */}
              <div className="bg-zinc-950/70 p-3.5 rounded-2xl border border-zinc-800/80 space-y-2.5">
                <div className="text-[11px] font-bold text-zinc-400 flex items-center justify-between">
                  <span>추천 운동 기구 및 순서</span>
                  <span>총 {routine.exercises.length}개 종목</span>
                </div>

                <div className="space-y-2">
                  {routine.exercises.map((re, idx) => {
                    const ex = allExercises.find((e) => e.id === re.exerciseId);
                    const altList = ex?.alternatives || [];

                    return (
                      <div
                        key={re.exerciseId}
                        className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/60 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <span className="w-5 h-5 rounded-md bg-zinc-800 text-emerald-400 text-[10px] font-black flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <span className="font-bold text-zinc-100 truncate block">
                                {ex ? ex.name : re.exerciseId}
                              </span>
                              {ex?.englishName && (
                                <span className="text-[10px] text-zinc-500 font-mono block truncate">
                                  {ex.englishName.split('/')[0].trim()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-[11px] text-zinc-400 font-medium shrink-0 pl-2">
                            {re.recommendedSets}세트 × {re.recommendedReps}회
                          </div>
                        </div>

                        {altList.length > 0 && (
                          <div className="pl-7 text-[10px] text-amber-400/90 flex items-center gap-1">
                            <span className="text-zinc-500 shrink-0 font-medium">대체 가능:</span>
                            <span className="text-zinc-400 truncate">{altList.slice(0, 2).join(', ')}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Guide Tips */}
              <div className="text-[11px] text-zinc-400 space-y-1 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                <div className="font-bold text-zinc-300 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>루틴 실천 꿀팁</span>
                </div>
                {routine.guideTips.map((tip, i) => (
                  <div key={i} className="pl-4 relative">
                    <span className="absolute left-0 text-emerald-400">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>

              {/* Start Workout Action */}
              <button
                onClick={() => handleStartRoutine(routine)}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black rounded-2xl text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.99] flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>이 루틴으로 바로 오늘 운동 시작하기</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
