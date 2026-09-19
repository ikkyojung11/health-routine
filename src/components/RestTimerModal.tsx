'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Timer, X, Play, Pause, RotateCcw, Plus, Minus, Volume2, Music } from 'lucide-react';

interface RestTimerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSeconds?: number;
}

type SoundType = 'chime' | 'boxing' | 'digital';

export default function RestTimerModal({ isOpen, onClose, defaultSeconds = 60 }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(defaultSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [initialDuration, setInitialDuration] = useState<number>(defaultSeconds);
  const [selectedSound, setSelectedSound] = useState<SoundType>('chime');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Play pleasant, crisp gym chime sound
  const playAlertSound = useCallback((soundType: SoundType = selectedSound) => {
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      const audioCtx = new AudioCtxClass();
      const now = audioCtx.currentTime;

      if (soundType === 'chime') {
        // 맑고 경쾌한 4음 멜로디 차임 (도-미-솔-도)
        const notes = [
          { freq: 523.25, time: 0.00, dur: 0.4 }, // C5
          { freq: 659.25, time: 0.12, dur: 0.4 }, // E5
          { freq: 783.99, time: 0.24, dur: 0.4 }, // G5
          { freq: 1046.50, time: 0.36, dur: 0.8 }, // C6 (길게 울림)
        ];

        notes.forEach(({ freq, time, dur }) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + time);

          // Percussive bell attack & decay
          gain.gain.setValueAtTime(0, now + time);
          gain.gain.linearRampToValueAtTime(0.35, now + time + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

          osc.connect(gain);
          gain.connect(audioCtx.destination);

          osc.start(now + time);
          osc.stop(now + time + dur);
        });
      } else if (soundType === 'boxing') {
        // 복싱 라운드 벨 (딩~! 묵직하고 울리는 벨)
        const partials = [587.33, 880, 1174.66, 1760];
        partials.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          const volume = 0.35 / (idx + 1);
          gain.gain.setValueAtTime(volume, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

          osc.connect(gain);
          gain.connect(audioCtx.destination);

          osc.start(now);
          osc.stop(now + 1.2);
        });
      } else {
        // 경쾌한 3단 전자 비프음
        [0, 0.15, 0.3].forEach((offset) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(987.77, now + offset); // B5

          gain.gain.setValueAtTime(0.3, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);

          osc.connect(gain);
          gain.connect(audioCtx.destination);

          osc.start(now + offset);
          osc.stop(now + offset + 0.1);
        });
      }

      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 300]);
      }
    } catch (e) {
      console.error('Audio alert playback error', e);
    }
  }, [selectedSound]);

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
            className="flex items-center space-x-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full text-xs font-bold"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>15초</span>
          </button>
          <button
            onClick={() => adjustTime(15)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full text-xs font-bold"
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

        {/* Sound Selection & Preview */}
        <div className="bg-zinc-950/70 p-3 rounded-2xl border border-zinc-800/80 mb-5">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-bold mb-2">
            <span className="flex items-center gap-1">
              <Music className="w-3.5 h-3.5 text-emerald-400" />
              알림 소리 선택
            </span>
            <button
              onClick={() => playAlertSound()}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-[10px] font-semibold"
            >
              <Volume2 className="w-3 h-3" />
              <span>소리 들어보기</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'chime', label: '맑은 차임벨' },
              { id: 'boxing', label: '복싱 라운드' },
              { id: 'digital', label: '전자 비프' },
            ].map((snd) => (
              <button
                key={snd.id}
                onClick={() => {
                  setSelectedSound(snd.id as SoundType);
                  playAlertSound(snd.id as SoundType);
                }}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
                  selectedSound === snd.id
                    ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {snd.label}
              </button>
            ))}
          </div>
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
