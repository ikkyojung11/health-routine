'use client';

import React from 'react';
import { Check, Trash2, Plus, Minus } from 'lucide-react';
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
      className={`p-3 rounded-2xl border transition-all ${
        set.completed
          ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
          : 'bg-zinc-900/90 border-zinc-800/80 hover:border-zinc-700'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Set number badge */}
        <div className="flex flex-col items-center justify-center w-9 h-9 rounded-xl bg-zinc-800 text-zinc-300 font-black text-sm shrink-0">
          <span>{set.setNumber}</span>
          <span className="text-[8px] font-normal text-zinc-400">SET</span>
        </div>

        {/* Previous performance reference (if any) */}
        {previousRecordText && (
          <div className="hidden sm:block text-[11px] text-zinc-400 shrink-0">
            <span className="text-zinc-400 font-medium">이전:</span> {previousRecordText}
          </div>
        )}

        {/* Weight controls */}
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="text-[10px] text-zinc-400 font-medium mb-1">중량 (kg)</div>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => handleWeightChange(set.weight - 2.5)}
              className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-xs font-bold shrink-0"
              title="-2.5kg"
            >
              <Minus className="w-3 h-3" />
            </button>
            <input
              type="number"
              step="0.5"
              min="0"
              value={set.weight === 0 ? '' : set.weight}
              placeholder="0"
              onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 0)}
              className="w-14 h-8 bg-zinc-950 border border-zinc-700 rounded-lg text-center font-bold text-sm text-white focus:outline-none focus:border-emerald-500 tabular-nums"
            />
            <button
              type="button"
              onClick={() => handleWeightChange(set.weight + 2.5)}
              className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-xs font-bold shrink-0"
              title="+2.5kg"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Reps controls */}
        <div className="flex-1 min-w-0 flex flex-col items-center">
          <div className="text-[10px] text-zinc-400 font-medium mb-1">횟수 (회)</div>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => handleRepsChange(set.reps - 1)}
              className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-xs font-bold shrink-0"
            >
              <Minus className="w-3 h-3" />
            </button>
            <input
              type="number"
              min="0"
              value={set.reps === 0 ? '' : set.reps}
              placeholder="0"
              onChange={(e) => handleRepsChange(parseInt(e.target.value) || 0)}
              className="w-12 h-8 bg-zinc-950 border border-zinc-700 rounded-lg text-center font-bold text-sm text-white focus:outline-none focus:border-emerald-500 tabular-nums"
            />
            <button
              type="button"
              onClick={() => handleRepsChange(set.reps + 1)}
              className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-xs font-bold shrink-0"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Complete Checkbox button */}
        <button
          type="button"
          onClick={() => onCompleteToggle(set.id)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all shrink-0 ${
            set.completed
              ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/30'
              : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white'
          }`}
          title={set.completed ? '완료 취소' : '세트 완료'}
        >
          <Check className={`w-5 h-5 stroke-[3] ${set.completed ? 'scale-110' : ''}`} />
        </button>

        {/* Delete set */}
        <button
          type="button"
          onClick={() => onDelete(set.id)}
          className="p-2 text-zinc-400 hover:text-rose-400 transition-colors shrink-0"
          title="세트 삭제"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile-only previous indicator */}
      {previousRecordText && (
        <div className="sm:hidden text-[10px] text-zinc-400 mt-2 text-right">
          <span className="text-zinc-400 font-medium">이전:</span> {previousRecordText}
        </div>
      )}
    </div>
  );
}
