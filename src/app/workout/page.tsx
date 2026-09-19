'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  Dumbbell,
  Plus,
  Timer,
  Save,
  Trash2,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Calendar,
  X,
  Search,
  History,
  TrendingUp,
} from 'lucide-react';
import SetInputRow from '@/components/SetInputRow';
import RestTimerModal from '@/components/RestTimerModal';
import {
  getActiveSession,
  saveActiveSession,
  saveWorkoutSession,
  getExercises,
  getLastWorkoutLogForExercise,
} from '@/lib/storage';
import {
  WorkoutSession,
  WorkoutExerciseLog,
  WorkoutSet,
  Exercise,
  ExerciseCategory,
} from '@/lib/types';

export default function WorkoutPage() {
  const router = useRouter();

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<string>('전체');
  const [modalSearch, setModalSearch] = useState<string>('');

  // Rest Timer State
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [timerDuration, setTimerDuration] = useState(60);
  const [autoTimerEnabled, setAutoTimerEnabled] = useState(true);

  // Success celebration state
  const [isFinishedModalOpen, setIsFinishedModalOpen] = useState(false);

  useEffect(() => {
    setAllExercises(getExercises());

    // Load active session or create new one for today
    const existing = getActiveSession();
    if (existing) {
      setSession(existing);
    } else {
      const today = new Date().toISOString().split('T')[0];
      const newSession: WorkoutSession = {
        id: `session-${Date.now()}`,
        date: today,
        title: '오늘의 헬스 일지',
        logs: [],
        totalVolume: 0,
        totalSets: 0,
      };
      setSession(newSession);
      saveActiveSession(newSession);
    }
  }, []);

  // Recalculate totals whenever session changes
  const updateSessionState = (updated: WorkoutSession) => {
    let volume = 0;
    let totalSetsCount = 0;

    for (const log of updated.logs) {
      for (const s of log.sets) {
        totalSetsCount++;
        if (s.completed && s.weight > 0 && s.reps > 0) {
          volume += s.weight * s.reps;
        }
      }
    }

    const finalSession = {
      ...updated,
      totalVolume: volume,
      totalSets: totalSetsCount,
    };

    setSession(finalSession);
    saveActiveSession(finalSession);
  };

  // Add Exercise to current session
  const handleAddExerciseToWorkout = (exercise: Exercise) => {
    if (!session) return;

    // Check if already in workout
    if (session.logs.some((l) => l.exerciseId === exercise.id)) {
      setIsAddExerciseModalOpen(false);
      return;
    }

    // Check previous performance
    const prevLog = getLastWorkoutLogForExercise(exercise.id);

    const initialSets: WorkoutSet[] = prevLog && prevLog.sets.length > 0
      ? prevLog.sets.map((ps, idx) => ({
          id: `set-${Date.now()}-${idx + 1}`,
          setNumber: idx + 1,
          weight: ps.weight,
          reps: ps.reps,
          completed: false,
        }))
      : [
          { id: `set-${Date.now()}-1`, setNumber: 1, weight: 0, reps: 0, completed: false },
          { id: `set-${Date.now()}-2`, setNumber: 2, weight: 0, reps: 0, completed: false },
          { id: `set-${Date.now()}-3`, setNumber: 3, weight: 0, reps: 0, completed: false },
        ];

    const newLog: WorkoutExerciseLog = {
      id: `log-${Date.now()}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      category: exercise.category,
      sets: initialSets,
    };

    const updatedSession = {
      ...session,
      logs: [...session.logs, newLog],
    };

    updateSessionState(updatedSession);
    setIsAddExerciseModalOpen(false);
    setModalSearch('');
  };

  // Remove Exercise
  const handleRemoveExercise = (logId: string) => {
    if (!session) return;
    const updatedLogs = session.logs.filter((l) => l.id !== logId);
    updateSessionState({ ...session, logs: updatedLogs });
  };

  // Add Set to Exercise
  const handleAddSet = (logId: string) => {
    if (!session) return;
    const updatedLogs = session.logs.map((log) => {
      if (log.id !== logId) return log;

      const lastSet = log.sets[log.sets.length - 1];
      const newSetNumber = log.sets.length + 1;
      const newSet: WorkoutSet = {
        id: `set-${Date.now()}-${newSetNumber}`,
        setNumber: newSetNumber,
        weight: lastSet ? lastSet.weight : 0,
        reps: lastSet ? lastSet.reps : 0,
        completed: false,
      };

      return {
        ...log,
        sets: [...log.sets, newSet],
      };
    });

    updateSessionState({ ...session, logs: updatedLogs });
  };

  // Update a single set
  const handleUpdateSet = (logId: string, updatedSet: WorkoutSet) => {
    if (!session) return;
    const updatedLogs = session.logs.map((log) => {
      if (log.id !== logId) return log;
      return {
        ...log,
        sets: log.sets.map((s) => (s.id === updatedSet.id ? updatedSet : s)),
      };
    });

    updateSessionState({ ...session, logs: updatedLogs });
  };

  // Delete a set
  const handleDeleteSet = (logId: string, setId: string) => {
    if (!session) return;
    const updatedLogs = session.logs.map((log) => {
      if (log.id !== logId) return log;
      const filtered = log.sets.filter((s) => s.id !== setId);
      // Renumber
      const renumbered = filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      return { ...log, sets: renumbered };
    });

    updateSessionState({ ...session, logs: updatedLogs });
  };

  // Toggle set completion
  const handleToggleComplete = (logId: string, setId: string) => {
    if (!session) return;

    let willBeCompleted = false;

    const updatedLogs = session.logs.map((log) => {
      if (log.id !== logId) return log;
      return {
        ...log,
        sets: log.sets.map((s) => {
          if (s.id === setId) {
            willBeCompleted = !s.completed;
            return { ...s, completed: willBeCompleted };
          }
          return s;
        }),
      };
    });

    updateSessionState({ ...session, logs: updatedLogs });

    // If completed and auto-timer is enabled, launch rest timer!
    if (willBeCompleted && autoTimerEnabled) {
      setIsTimerOpen(true);
    }
  };

  // Load Previous Records for an exercise
  const handleLoadPreviousRecord = (log: WorkoutExerciseLog) => {
    const prev = getLastWorkoutLogForExercise(log.exerciseId);
    if (!prev || prev.sets.length === 0) return;

    const clonedSets: WorkoutSet[] = prev.sets.map((ps, idx) => ({
      id: `set-${Date.now()}-${idx + 1}`,
      setNumber: idx + 1,
      weight: ps.weight,
      reps: ps.reps,
      completed: false,
    }));

    const updatedLogs = session!.logs.map((l) => (l.id === log.id ? { ...l, sets: clonedSets } : l));
    updateSessionState({ ...session!, logs: updatedLogs });
  };

  // Finish Workout
  const handleFinishWorkout = () => {
    if (!session) return;

    // Filter out exercises with no sets or zero weight
    const completedSession: WorkoutSession = {
      ...session,
      createdAt: new Date().toISOString(),
    };

    saveWorkoutSession(completedSession);
    saveActiveSession(null); // Clear active draft

    // Fire Confetti!
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.error(e);
    }

    setIsFinishedModalOpen(true);
  };

  // Reset current session draft
  const handleResetDraft = () => {
    if (confirm('현재 작성 중인 일지를 초기화하시겠습니까?')) {
      const today = new Date().toISOString().split('T')[0];
      const newSession: WorkoutSession = {
        id: `session-${Date.now()}`,
        date: today,
        title: '오늘의 헬스 일지',
        logs: [],
        totalVolume: 0,
        totalSets: 0,
      };
      setSession(newSession);
      saveActiveSession(newSession);
    }
  };

  const categories = ['전체', '가슴', '등', '하체', '팔', '어깨', '복근/코어'];

  const filteredExercisesForModal = allExercises.filter((ex) => {
    const matchesCat = modalCategory === '전체' || ex.category === modalCategory;
    const matchesSearch =
      ex.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
      ex.targetMuscle.toLowerCase().includes(modalSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (!session) {
    return <div className="p-8 text-center text-zinc-500">일지 로딩 중...</div>;
  }

  const completedSetsCount = session.logs.reduce(
    (acc, log) => acc + log.sets.filter((s) => s.completed).length,
    0
  );

  return (
    <div className="space-y-5 pb-10">
      {/* Rest Timer Modal */}
      <RestTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        defaultSeconds={timerDuration}
      />

      {/* Top Bar / Controls */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={session.date}
            onChange={(e) => updateSessionState({ ...session, date: e.target.value })}
            className="bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-200 px-3 py-1.5 rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick Timer Button */}
          <button
            onClick={() => setIsTimerOpen(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-emerald-400 rounded-xl text-xs font-bold transition-all"
            title="휴식 타이머 열기"
          >
            <Timer className="w-3.5 h-3.5" />
            <span>타이머</span>
          </button>

          {/* Reset button */}
          <button
            onClick={handleResetDraft}
            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl"
            title="초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Workout Title Input */}
      <div>
        <input
          type="text"
          value={session.title || ''}
          onChange={(e) => updateSessionState({ ...session, title: e.target.value })}
          placeholder="오늘의 운동 제목 (예: 가슴 & 삼두 파괴)"
          className="w-full bg-transparent text-xl font-black text-white placeholder-zinc-600 focus:outline-none"
        />
      </div>

      {/* Real-time Summary Card */}
      <div className="grid grid-cols-2 gap-3 p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 font-medium">완료 세트</div>
            <div className="text-base font-black text-white tabular-nums">
              {completedSetsCount} / {session.totalSets} 세트
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 border-l border-zinc-800 pl-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 font-medium">총 볼륨 (중량×회)</div>
            <div className="text-base font-black text-emerald-400 tabular-nums">
              {session.totalVolume.toLocaleString()} kg
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Logs */}
      <div className="space-y-4">
        {session.logs.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800/80 rounded-3xl space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500">
              <Dumbbell className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-200">운동 기구를 추가해주세요</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                가슴, 등, 하체, 팔 등 오늘 헬스장에서 할 기구를 선택하여 일지를 시작하세요.
              </p>
            </div>
            <button
              onClick={() => setIsAddExerciseModalOpen(true)}
              className="inline-flex items-center space-x-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>기구 찾아 추가하기</span>
            </button>
          </div>
        ) : (
          session.logs.map((log) => {
            const prevLog = getLastWorkoutLogForExercise(log.exerciseId);
            const prevText = prevLog
              ? `${prevLog.sets[0]?.weight || 0}kg x ${prevLog.sets[0]?.reps || 0}회`
              : undefined;

            return (
              <div
                key={log.id}
                className="bg-zinc-900/80 border border-zinc-800/80 rounded-3xl p-4 shadow-xl space-y-3"
              >
                {/* Exercise Header */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-emerald-400 border border-zinc-700">
                      {log.category}
                    </span>
                    <h3 className="text-base font-bold text-white">{log.exerciseName}</h3>
                  </div>

                  <div className="flex items-center space-x-1">
                    {/* Previous record quick-load button */}
                    {prevLog && (
                      <button
                        onClick={() => handleLoadPreviousRecord(log)}
                        className="flex items-center space-x-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[11px] font-medium transition-colors"
                        title="지난 기록 세트 불러오기"
                      >
                        <History className="w-3 h-3 text-emerald-400" />
                        <span>이전 기록 불러오기</span>
                      </button>
                    )}

                    {/* Remove exercise */}
                    <button
                      onClick={() => handleRemoveExercise(log.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                      title="운동 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sets List */}
                <div className="space-y-2">
                  {log.sets.map((set) => (
                    <SetInputRow
                      key={set.id}
                      set={set}
                      previousRecordText={prevText}
                      onUpdate={(updatedSet) => handleUpdateSet(log.id, updatedSet)}
                      onDelete={(setId) => handleDeleteSet(log.id, setId)}
                      onCompleteToggle={(setId) => handleToggleComplete(log.id, setId)}
                    />
                  ))}
                </div>

                {/* Add Set Button */}
                <button
                  onClick={() => handleAddSet(log.id)}
                  className="w-full py-2.5 bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1 border border-zinc-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>세트 추가</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Action Bar */}
      {session.logs.length > 0 && (
        <div className="space-y-3 pt-2">
          <button
            onClick={() => setIsAddExerciseModalOpen(true)}
            className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 border-dashed text-emerald-400 font-bold rounded-2xl text-sm flex items-center justify-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>다른 기구 추가하기</span>
          </button>

          {/* Auto-timer toggle */}
          <div className="flex items-center justify-between px-2 text-xs text-zinc-400">
            <span>세트 완료 시 휴식 타이머 자동 실행</span>
            <button
              onClick={() => setAutoTimerEnabled(!autoTimerEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                autoTimerEnabled ? 'bg-emerald-500' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-zinc-950 absolute top-1 transition-transform ${
                  autoTimerEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          <button
            onClick={handleFinishWorkout}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black rounded-2xl text-base shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.99] flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>운동 완료 & 저장하기</span>
          </button>
        </div>
      )}

      {/* Add Exercise Modal */}
      {isAddExerciseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg max-h-[85vh] bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-emerald-400" />
                기구 선택
              </h3>
              <button
                onClick={() => setIsAddExerciseModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-3.5">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                placeholder="기구 이름 검색 (벤치, 랫풀, 스쿼트 등)"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 shadow-sm"
              />
              {modalSearch && (
                <button
                  onClick={() => setModalSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category tabs with comfortable spacing & touch target */}
            <div className="mb-3.5">
              <div className="text-[11px] font-bold text-zinc-400 mb-2 px-0.5">
                운동 부위 선택
              </div>
              <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setModalCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all min-h-[38px] flex items-center justify-center ${
                      modalCategory === cat
                        ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/25 scale-[1.02]'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/60'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredExercisesForModal.map((ex) => {
                const isAlreadyAdded = session.logs.some((l) => l.exerciseId === ex.id);
                return (
                  <button
                    key={ex.id}
                    disabled={isAlreadyAdded}
                    onClick={() => handleAddExerciseToWorkout(ex)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      isAlreadyAdded
                        ? 'bg-zinc-950/40 border-zinc-800/40 opacity-50 cursor-not-allowed'
                        : 'bg-zinc-950 border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-emerald-400">
                          {ex.category}
                        </span>
                        <span className="text-sm font-bold text-white">{ex.name}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-1">{ex.targetMuscle}</div>
                    </div>

                    <div className="shrink-0 text-xs font-bold text-emerald-400">
                      {isAlreadyAdded ? '추가됨' : '+ 추가'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Finished Celebration Modal */}
      {isFinishedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-8 h-8 animate-bounce" />
            </div>

            <h3 className="text-xl font-black text-white">오늘도 완주하셨습니다! 🔥</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              총 {session.totalSets}세트, {session.totalVolume.toLocaleString()}kg 볼륨을 달성하셨습니다.
              근육이 쑥쑥 자라고 있어요!
            </p>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  setIsFinishedModalOpen(false);
                  router.push('/analytics');
                }}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl text-sm transition-all"
              >
                성장 추이 확인하러 가기
              </button>
              <button
                onClick={() => {
                  setIsFinishedModalOpen(false);
                  router.push('/');
                }}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-2xl text-sm transition-colors"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
