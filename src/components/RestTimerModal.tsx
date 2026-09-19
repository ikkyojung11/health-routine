'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Timer, X, Play, Pause, RotateCcw, Plus, Minus, Volume2 } from 'lucide-react';

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

  // 맑은 차임벨 단일 사운드 재생 (도-미-솔-도 4화음 맑은 벨 소리)
  const playAlertSound = useCallback(() => {
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      const audioCtx = new AudioCtxClass();
      const now = audioCtx.currentTime;

      // 맑고 청명한 4음 멜로디 차임 (C5 - E5 - G5 - C6)
      const notes = [
        { freq: 523.25, time: 0.00, dur: 0.4 }, // C5
        { freq: 659.25, time: 0.12, dur: 0.4 }, // E5
        { freq: 783.99, time: 0.24, dur: 0.4 }, // G5
        { freq: 1046.50, time: 0.36, dur: 0.8 }, // C6 (길고 풍성하게 울림)
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + time);

        // Percussive bell attack & smooth exponential decay
        gain.gain.setValueAtTime(0, now + time);
        gain.gain.linearRampToValueAtTime(0.35, now + time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur);
      });

      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 300]);
      }
    } catch (e) {
      console.error('Audio alert playback error', e);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
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
          <div className="w-full bg-zinc-800 h-2.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quick adjustment buttons */}
        <div className="flex items-center justify-center space-x-3 mb-5">
          <button
            onClick={() => adjustTime(-15)}
            className="flex items-center space-x-1 px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full text-xs font-bold transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>15초</span>
          </button>
          <button
            onClick={() => adjustTime(15)}
            className="flex items-center space-x-1 px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>15초</span>
          </button>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-4 gap-2 mb-5">
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

        {/* Single Chime Sound Indicator & Preview */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl mb-6">
          <div className="flex items-center space-x-2 text-xs text-zinc-300 font-semibold">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>알림 소리: 맑은 차임벨</span>
          </div>
          <button
            onClick={playAlertSound}
            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-[11px] font-bold rounded-lg transition-colors"
          >
            소리 듣기
          </button>
        </div>

        {/* Main Control Actions */}
        <div className="flex items-center justify-center space-x-3">
          <button
            onClick={() => {
              setTimeLeft(initialDuration);
              setIsRunning(false);
            }}
            className="p-3.5 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded-2xl transition-colors"
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
        </div>
      </div>
    </div>
  );
}
