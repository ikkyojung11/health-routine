'use client';

import React from 'react';
import { Check, Trash2, Plus, Minus, History } from 'lucide-react';
import { WorkoutSet } from '@/lib/types';

interface SetInputRowProps {
  set: WorkoutSet;
  previousRecordText?: string;
  onUpdate: (updatedSet: WorkoutSet) => void;
  onDelete: (setId: string) => void;
  onCompleteToggle: (setId: string) => void;
}

export default function SetInputRow({
  set,
  previousRecordText,
  onUpdate,
  onDelete,
  onCompleteToggle,
}: SetInputRowProps) {
  const handleWeightChange = (newVal: number) => {
    onUpdate({
      ...set,
      weight: Math.max(0, Math.round(newVal * 10) / 10),
    });
  };

  const handleRepsChange = (newVal: number) => {
    onUpdate({
      ...set,
      reps: Math.max(0, Math.round(newVal)),
    });
  };

  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all space-y-3 ${
        set.completed
          ? 'bg-emerald-950/25 border-emerald-500/50 shadow-sm shadow-emerald-500/10'
          : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
      }`}
    >
      {/* Upper Bar: Set Number + Previous Record + Checkbox & Trash */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div
            className={`flex items-center justify-center px-2.5 py-1 rounded-xl text-xs font-black tracking-wide ${
              set.completed
                ? 'bg-emerald-500 text-zinc-950'
                : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
            }`}
          >
            SET {set.setNumber}
          </div>

          {previousRecordText && (
            <div className="flex items-center space-x-1 text-[11px] text-zinc-400 bg-zinc-950/60 px-2.5 py-1 rounded-lg border border-zinc-800">
              <History className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>이전: <strong className="text-zinc-300 font-semibold">{previousRecordText}</strong></span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Large, touch-friendly Complete Button */}
          <button
            type="button"
            onClick={() => onCompleteToggle(set.id)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              set.completed
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/30'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
            }`}
          >
            <Check className={`w-4 h-4 stroke-[3] ${set.completed ? 'scale-110' : ''}`} />
            <span>{set.completed ? '완료됨' : '완료'}</span>
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(set.id)}
            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800/80 rounded-lg transition-colors"
            title="세트 삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Controls Grid: Weight Box & Reps Box */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* === Weight Section === */}
        <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
          <div className="text-[11px] font-bold text-zinc-400 flex items-center justify-between mb-1.5">
            <span>중량 (kg)</span>
            <span className="text-[10px] text-zinc-400 font-mono">WEIGHT</span>
          </div>

          {/* Stepper with prominent - / + buttons */}
          <div className="flex items-center justify-between gap-1 mb-2">
            <button
              type="button"
              onClick={() => handleWeightChange(set.weight - 2.5)}
              className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-200 flex items-center justify-center font-black transition-colors shrink-0 shadow-sm"
              title="-2.5kg"
            >
              <Minus className="w-4 h-4 stroke-[3]" />
            </button>

            <div className="flex-1 relative flex items-center justify-center">
              <input
                type="number"
                step="0.5"
                min="0"
                value={set.weight === 0 ? '' : set.weight}
                placeholder="0"
                onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 0)}
                className="w-full h-9 bg-zinc-900 border border-zinc-700 rounded-xl text-center font-black text-base text-white focus:outline-none focus:border-emerald-500 tabular-nums px-1"
              />
              <span className="absolute right-2 text-[10px] text-zinc-400 font-bold pointer-events-none">
                kg
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleWeightChange(set.weight + 2.5)}
              className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-200 flex items-center justify-center font-black transition-colors shrink-0 shadow-sm"
              title="+2.5kg"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Quick Weight Adjust Pills */}
          <div className="grid grid-cols-4 gap-1">
            <button
              type="button"
              onClick={() => handleWeightChange(set.weight - 5)}
              className="py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white transition-colors"
            >
              -5
            </button>
            <button
              type="button"
              onClick={() => handleWeightChange(set.weight - 2.5)}
              className="py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white transition-colors"
            >
              -2.5
            </button>
            <button
              type="button"
              onClick={() => handleWeightChange(set.weight + 2.5)}
              className="py-1 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 rounded-lg text-[10px] font-bold text-emerald-400 transition-colors"
            >
              +2.5
            </button>
            <button
              type="button"
              onClick={() => handleWeightChange(set.weight + 5)}
              className="py-1 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 rounded-lg text-[10px] font-bold text-emerald-400 transition-colors"
            >
              +5
            </button>
          </div>
        </div>

        {/* === Reps Section === */}
        <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
          <div className="text-[11px] font-bold text-zinc-400 flex items-center justify-between mb-1.5">
            <span>횟수 (회)</span>
            <span className="text-[10px] text-zinc-400 font-mono">REPS</span>
          </div>

          {/* Stepper with prominent - / + buttons */}
          <div className="flex items-center justify-between gap-1 mb-2">
            <button
              type="button"
              onClick={() => handleRepsChange(set.reps - 1)}
              className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-200 flex items-center justify-center font-black transition-colors shrink-0 shadow-sm"
              title="-1회"
            >
              <Minus className="w-4 h-4 stroke-[3]" />
            </button>

            <div className="flex-1 relative flex items-center justify-center">
              <input
                type="number"
                min="0"
                value={set.reps === 0 ? '' : set.reps}
                placeholder="0"
                onChange={(e) => handleRepsChange(parseInt(e.target.value) || 0)}
                className="w-full h-9 bg-zinc-900 border border-zinc-700 rounded-xl text-center font-black text-base text-white focus:outline-none focus:border-emerald-500 tabular-nums px-1"
              />
              <span className="absolute right-2 text-[10px] text-zinc-400 font-bold pointer-events-none">
                회
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleRepsChange(set.reps + 1)}
              className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-200 flex items-center justify-center font-black transition-colors shrink-0 shadow-sm"
              title="+1회"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Quick Reps Adjust Pills */}
          <div className="grid grid-cols-4 gap-1">
            <button
              type="button"
              onClick={() => handleRepsChange(set.reps - 2)}
              className="py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white transition-colors"
            >
              -2
            </button>
            <button
              type="button"
              onClick={() => handleRepsChange(set.reps - 1)}
              className="py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white transition-colors"
            >
              -1
            </button>
            <button
              type="button"
              onClick={() => handleRepsChange(set.reps + 1)}
              className="py-1 bg-teal-950/40 hover:bg-teal-900/50 border border-teal-800/40 rounded-lg text-[10px] font-bold text-teal-400 transition-colors"
            >
              +1
            </button>
            <button
              type="button"
              onClick={() => handleRepsChange(set.reps + 5)}
              className="py-1 bg-teal-950/40 hover:bg-teal-900/50 border border-teal-800/40 rounded-lg text-[10px] font-bold text-teal-400 transition-colors"
            >
              +5
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
