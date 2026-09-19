'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Dumbbell,
  TrendingUp,
  BookOpen,
  Calendar,
  Flame,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Clock,
  Plus,
} from 'lucide-react';
import { getWorkoutSessions, getExerciseGrowthStats, getExercises } from '@/lib/storage';
import { WorkoutSession, ExerciseCategory, ExerciseGrowthStats } from '@/lib/types';

export default function HomePage() {
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [topGrowingExercises, setTopGrowingExercises] = useState<ExerciseGrowthStats[]>([]);

  useEffect(() => {
    const sessions = getWorkoutSessions();
    setRecentSessions(sessions.slice(0, 3));

    // Calculate actual real growth from recorded exercises
    const allEx = getExercises();
    const growingList: ExerciseGrowthStats[] = [];

    for (const ex of allEx) {
      const stats = getExerciseGrowthStats(ex.id);
      if (stats && stats.history.length >= 1) {
        growingList.push(stats);
      }
    }

    // Sort by growthKg descending
    growingList.sort((a, b) => b.growthKg - a.growthKg);
    setTopGrowingExercises(growingList.slice(0, 3));
  }, []);

  const categories: { name: ExerciseCategory; color: string; desc: string; icon: string }[] = [
    { name: '가슴', color: 'from-amber-500/20 to-orange-500/10 border-orange-500/30 text-orange-400', desc: '벤치프레스, 체스트머신', icon: '🛡️' },
    { name: '등', color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400', desc: '랫풀다운, 시티드로우', icon: '🦅' },
    { name: '하체', color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400', desc: '레그프레스, 스쿼트', icon: '🦵' },
    { name: '팔', color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400', desc: '바벨컬, 푸시다운', icon: '💪' },
  ];

  const todayStr = new Date().toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <div className="space-y-6 pb-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="flex items-center space-x-2 text-zinc-400 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{todayStr}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            오늘도 득근하세요! 🔥
          </h1>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
          <Flame className="w-5 h-5 fill-current" />
        </div>
      </div>

      {/* Hero CTA Button */}
      <Link
        href="/workout"
        className="relative overflow-hidden group block p-6 rounded-3xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-[0.99]"
      >
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-zinc-950/20 text-zinc-950 mb-2">
              Workout Tracker
            </span>
            <h2 className="text-2xl font-black text-zinc-950">오늘의 운동 일지 작성</h2>
            <p className="text-xs text-zinc-950/80 font-medium mt-1">
              기구를 선택하고 몇 kg 몇 회 했는지 바로 기록해보세요!
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-zinc-950/20 flex items-center justify-center text-zinc-950 group-hover:translate-x-1 transition-transform">
            <ChevronRight className="w-6 h-6 stroke-[3]" />
          </div>
        </div>
      </Link>

      {/* Quick Category Directory */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            부위별 기구 목차
          </h3>
          <Link
            href="/exercises"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5"
          >
            전체보기 <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/exercises?category=${cat.name}`}
              className={`p-4 rounded-2xl border bg-gradient-to-br ${cat.color} hover:scale-[1.02] transition-all`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xl">{cat.icon}</span>
                <ArrowUpRight className="w-4 h-4 opacity-60" />
              </div>
              <div className="text-base font-black text-white">{cat.name} 운동</div>
              <div className="text-[11px] text-zinc-400 truncate mt-0.5">{cat.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Growth Highlights */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            나의 성장 현황
          </h3>
          <Link
            href="/analytics"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5"
          >
            상세분석 <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {topGrowingExercises.length === 0 ? (
          <div className="py-6 px-4 text-center bg-zinc-950/60 rounded-2xl border border-zinc-800/80">
            <TrendingUp className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
            <div className="text-xs font-bold text-zinc-300">아직 등록된 운동 기록이 없습니다</div>
            <div className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto leading-relaxed">
              운동을 기록하시면 기구별 중량 성장률과 최고 기록이 이곳에 자동으로 요약됩니다!
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 text-center">
            {topGrowingExercises.map((stats) => (
              <div key={stats.exerciseId} className="p-3 bg-zinc-950/60 rounded-2xl border border-zinc-800/80">
                <div className="text-[10px] text-zinc-400 truncate">{stats.exerciseName}</div>
                <div className="text-sm font-black text-emerald-400 mt-1">
                  {stats.growthKg > 0 ? `+${stats.growthKg}kg` : `${stats.allTimeMaxWeight}kg`}
                </div>
                <div className="text-[9px] text-emerald-500/80 font-semibold mt-0.5">
                  {stats.growthKg > 0 ? '성장 중 🔥' : '기록 완료'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Beginner Gym Tip Card */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-start space-x-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="text-xs">
          <div className="font-bold text-zinc-200">초보자를 위한 헬스 꿀팁</div>
          <div className="text-zinc-400 mt-0.5 leading-relaxed">
            처음 헬스장에 가셨을 땐 무거운 무게 욕심보다 기구 의자 높이 맞추기, 날개뼈 고정(견갑 패킹) 등
            올바른 자세 익히기가 가장 빠른 성장의 지름길입니다!
          </div>
        </div>
      </div>

      {/* Recent Workout Logs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            최근 헬스 일지
          </h3>
        </div>

        {recentSessions.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-3xl space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-zinc-300">작성된 운동 일지가 없습니다</div>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto leading-relaxed">
                오늘 헬스장에 가셔서 첫 번째 운동 일지를 작성해보세요!
              </p>
            </div>
            <Link
              href="/workout"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>첫 운동일지 작성하기</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="p-4 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-emerald-400">{session.date}</span>
                    <span className="text-sm font-bold text-zinc-200">{session.title}</span>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">
                    {session.totalSets}세트
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {session.logs.map((log) => (
                    <span
                      key={log.id}
                      className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-lg text-[11px]"
                    >
                      {log.exerciseName}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800/60 pt-2">
                  <span>총 볼륨: {session.totalVolume.toLocaleString()} kg</span>
                  {session.durationMinutes && <span>운동 시간: {session.durationMinutes}분</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
