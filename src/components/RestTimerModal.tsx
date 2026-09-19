'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Timer, X, Play, Pause, RotateCcw, Plus, Minus, BellRing } from 'lucide-react';

interface RestTimerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSeconds?: number;
}

export default function RestTimerModal({ isOpen, onClose, defaultSeconds = 60 }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(defaultSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [initialDuration, setInitialDuration] = useState<number>(defaultSeconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound alert using Web Audio API (no external file dependency)
  const playAlertSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);

      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch (e) {
      console.error('Audio playback error', e);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(defaultSeconds);
      setInitialDuration(defaultSeconds);
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  }, [isOpen, defaultSeconds]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playAlertSound();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, timeLeft, playAlertSound]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = initialDuration > 0 ? ((initialDuration - timeLeft) / initialDuration) * 100 : 0;

  const setPreset = (sec: number) => {
    setInitialDuration(sec);
    setTimeLeft(sec);
    setIsRunning(true);
  };

  const adjustTime = (sec: number) => {
    setTimeLeft((prev) => Math.max(0, prev + sec));
    setInitialDuration((prev) => Math.max(0, prev + sec));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-center">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Timer className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-bold tracking-wide uppercase">세트 간 휴식 타이머</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Circular / Large Clock Display */}
        <div className="my-6">
          <div className="relative inline-flex items-center justify-center">
            <div className="text-6xl font-black tracking-tight tabular-nums text-white font-mono">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-zinc-800 h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quick adjustment buttons */}
        <div className="flex items-center justify-center space-x-3 mb-6">
          <button
            onClick={() => adjustTime(-15)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full text-xs font-medium"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>15초</span>
          </button>
          <button
            onClick={() => adjustTime(15)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>15초</span>
          </button>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[30, 60, 90, 120].map((sec) => (
            <button
              key={sec}
              onClick={() => setPreset(sec)}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                initialDuration === sec
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                  : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {sec < 60 ? `${sec}초` : `${sec / 60}분`}
            </button>
          ))}
        </div>

        {/* Main Control Actions */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => {
              setTimeLeft(initialDuration);
              setIsRunning(false);
            }}
            className="p-3 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded-2xl transition-colors"
            title="초기화"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl font-bold text-base shadow-lg transition-all ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>일시정지</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current ml-0.5" />
                <span>시작</span>
              </>
            )}
          </button>

          <button
            onClick={playAlertSound}
            className="p-3 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded-2xl transition-colors"
            title="알림음 테스트"
          >
            <BellRing className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
