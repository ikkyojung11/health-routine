'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import { ExerciseGrowthStats } from '@/lib/types';
import { TrendingUp, Flame, Trophy, Calendar, Sparkles, Award } from 'lucide-react';

interface GrowthChartProps {
  stats: ExerciseGrowthStats;
}

type MetricType = 'maxWeight' | 'estimated1RM' | 'totalVolume';

export default function GrowthChart({ stats }: GrowthChartProps) {
  const [metric, setMetric] = useState<MetricType>('maxWeight');

  if (!stats || stats.history.length === 0) {
    return (
      <div className="p-8 text-center bg-zinc-900/50 border border-zinc-800 rounded-3xl">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500">
          <TrendingUp className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-zinc-300 mb-1">아직 기록이 없습니다</h4>
        <p className="text-xs text-zinc-400 max-w-xs mx-auto">
          운동일지에서 &apos;{stats.exerciseName}&apos;을(를) 수행하고 기록하시면 날짜별 성장 그래프가 자동으로 그려집니다!
        </p>
      </div>
    );
  }

  // Format data for Recharts
  const chartData = stats.history.map((item) => {
    // Format date MM/DD
    const parts = item.date.split('-');
    const formattedDate = parts.length === 3 ? `${parseInt(parts[1])}/${parseInt(parts[2])}` : item.date;

    return {
      date: formattedDate,
      fullDate: item.date,
      maxWeight: item.maxWeight,
      estimated1RM: item.estimated1RM,
      totalVolume: item.totalVolume,
      bestSet: `${item.bestSet.weight}kg x ${item.bestSet.reps}회`,
      summary: item.setsSummary,
    };
  });

  const getMetricLabel = () => {
    switch (metric) {
      case 'maxWeight':
        return '최고 중량 (kg)';
      case 'estimated1RM':
        return '추정 1RM (kg)';
      case 'totalVolume':
        return '총 볼륨 (kg)';
    }
  };

  const isGrowthPositive = stats.growthKg > 0;

  return (
    <div className="space-y-6">
      {/* Growth Highlight Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 p-5 shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {stats.category}
            </span>
            <h3 className="text-xl font-extrabold text-white mt-1.5">{stats.exerciseName}</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        {/* Growth Stats Row */}
        <div className="grid grid-cols-3 gap-3 py-3 px-4 bg-zinc-950/60 rounded-2xl border border-zinc-800/60 mb-4">
          <div className="text-center">
            <div className="text-[11px] text-zinc-400">시작 중량</div>
            <div className="text-base font-black text-zinc-300 mt-0.5">
              {stats.firstRecord ? `${stats.firstRecord.maxWeight}kg` : '-'}
            </div>
          </div>
          <div className="text-center border-x border-zinc-800">
            <div className="text-[11px] text-zinc-400">현재 최고</div>
            <div className="text-base font-black text-emerald-400 mt-0.5">
              {stats.allTimeMaxWeight}kg
            </div>
          </div>
          <div className="text-center">
            <div className="text-[11px] text-zinc-400">성장 폭</div>
            <div
              className={`text-base font-black mt-0.5 flex items-center justify-center gap-0.5 ${
                isGrowthPositive ? 'text-emerald-400' : 'text-zinc-400'
              }`}
            >
              {isGrowthPositive ? `+${stats.growthKg}kg` : `${stats.growthKg}kg`}
            </div>
          </div>
        </div>

        {/* Motivational Feedback Banner */}
        <div className="flex items-center space-x-2.5 text-xs text-zinc-300 bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {stats.history.length === 1 ? (
              '첫 기록을 성공적으로 등록하셨습니다! 꾸준히 기록하며 성장을 지켜보세요.'
            ) : isGrowthPositive ? (
              `첫 시작 대비 ${stats.growthKg}kg (+${stats.growthPercentage}%) 증량 성공! 꾸준함이 정답입니다 🔥`
            ) : (
              '자세를 가다듬으며 기초를 다지고 계십니다. 포기하지 마세요! 💪'
            )}
          </span>
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="flex bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
        <button
          onClick={() => setMetric('maxWeight')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            metric === 'maxWeight'
              ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          최고 중량 (kg)
        </button>
        <button
          onClick={() => setMetric('estimated1RM')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            metric === 'estimated1RM'
              ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          추정 1RM
        </button>
        <button
          onClick={() => setMetric('totalVolume')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            metric === 'totalVolume'
              ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          총 볼륨
        </button>
      </div>

      {/* Chart Section */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            성장 추이 그래프
          </h4>
          <span className="text-xs text-zinc-400">{getMetricLabel()}</span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#3f3f46' }}
              />
              <YAxis
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#3f3f46' }}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <div className="font-bold text-zinc-300">{data.fullDate}</div>
                        <div className="text-emerald-400 font-extrabold text-sm">
                          {data[metric]} {metric === 'totalVolume' ? 'kg (볼륨)' : 'kg'}
                        </div>
                        <div className="text-zinc-400">최고 세트: {data.bestSet}</div>
                        <div className="text-zinc-500 text-[10px]">{data.summary}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey={metric}
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#growthGradient)"
                dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#09090b' }}
                activeDot={{ r: 7, stroke: '#34d399', strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Logs Timeline */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-lg">
        <h4 className="text-sm font-bold text-zinc-200 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          과거 수행 이력 타임라인
        </h4>

        <div className="space-y-3">
          {[...stats.history].reverse().map((point, index) => {
            const isLatest = index === 0;
            return (
              <div
                key={point.sessionId + point.date}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isLatest
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-zinc-300">{point.date}</span>
                    {isLatest && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                        최신
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-black text-emerald-400">
                    최고 {point.maxWeight}kg
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 text-xs text-zinc-400">
                  <span>최고 세트: {point.bestSet.weight}kg x {point.bestSet.reps}회</span>
                  <span>총 볼륨 {point.totalVolume.toLocaleString()}kg</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
