'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  BookOpen,
  Plus,
  ChevronRight,
  TrendingUp,
  Dumbbell,
  Info,
  X,
  Check,
  Flame,
} from 'lucide-react';
import { getExercises, saveCustomExercise, getActiveSession, saveActiveSession } from '@/lib/storage';
import { Exercise, ExerciseCategory, WorkoutSession } from '@/lib/types';

function ExercisesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get('category') as ExerciseCategory) || '전체';

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedExerciseForTips, setSelectedExerciseForTips] = useState<Exercise | null>(null);

  // Custom exercise modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<ExerciseCategory>('가슴');
  const [newTargetMuscle, setNewTargetMuscle] = useState('');
  const [newTips, setNewTips] = useState('');

  useEffect(() => {
    setExercises(getExercises());
  }, []);

  const categories = ['전체', '가슴', '등', '하체', '팔', '어깨', '복근/코어'];

  const filteredExercises = exercises.filter((ex) => {
    const matchesCategory =
      selectedCategory === '전체' || ex.category === selectedCategory;
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.targetMuscle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created = saveCustomExercise({
      name: newName.trim(),
      category: newCategory,
      targetMuscle: newTargetMuscle.trim() || '전신/타겟',
      tips: newTips.trim() || '올바른 자세와 통제된 궤적으로 동작을 수행하세요.',
    });

    setExercises(getExercises());
    setIsModalOpen(false);
    setNewName('');
    setNewTargetMuscle('');
    setNewTips('');
    setSelectedCategory(newCategory);
  };

  // Start workout with this exercise
  const handleStartWorkoutWithExercise = (exercise: Exercise) => {
    const active = getActiveSession();
    const today = new Date().toISOString().split('T')[0];

    let sessionToUpdate: WorkoutSession;

    if (!active) {
      sessionToUpdate = {
        id: `session-${Date.now()}`,
        date: today,
        title: `${exercise.category} 중심 운동`,
        logs: [
          {
            id: `log-${Date.now()}`,
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            category: exercise.category,
            sets: [
              { id: `s-${Date.now()}-1`, setNumber: 1, weight: 0, reps: 0, completed: false },
              { id: `s-${Date.now()}-2`, setNumber: 2, weight: 0, reps: 0, completed: false },
              { id: `s-${Date.now()}-3`, setNumber: 3, weight: 0, reps: 0, completed: false },
            ],
          },
        ],
        totalVolume: 0,
        totalSets: 3,
      };
    } else {
      const alreadyHasExercise = active.logs.some((l) => l.exerciseId === exercise.id);
      if (alreadyHasExercise) {
        router.push('/workout');
        return;
      }

      sessionToUpdate = {
        ...active,
        logs: [
          ...active.logs,
          {
            id: `log-${Date.now()}`,
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            category: exercise.category,
            sets: [
              { id: `s-${Date.now()}-1`, setNumber: 1, weight: 0, reps: 0, completed: false },
              { id: `s-${Date.now()}-2`, setNumber: 2, weight: 0, reps: 0, completed: false },
              { id: `s-${Date.now()}-3`, setNumber: 3, weight: 0, reps: 0, completed: false },
            ],
          },
        ],
      };
    }

    saveActiveSession(sessionToUpdate);
    router.push('/workout');
  };

  const getCategoryBadgeClass = (category: ExerciseCategory) => {
    switch (category) {
      case '가슴':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case '등':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case '하체':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case '팔':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case '어깨':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            기구 & 운동 목차
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            헬스장 기구를 부위별로 찾고 운동법과 팁을 확인하세요.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 rounded-2xl text-xs font-bold transition-all border border-zinc-700"
        >
          <Plus className="w-4 h-4" />
          <span>기구 추가</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-2">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="기구 이름 또는 타겟 부위 검색 (예: 벤치, 랫풀, 스쿼트)"
          className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Tabs Section with comfortable separation and thumb-friendly buttons */}
      <div className="pt-2 pb-1">
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <span className="text-xs font-bold text-zinc-300">운동 부위 선택</span>
          <span className="text-[11px] text-zinc-500 font-medium">좌우 스크롤 가능</span>
        </div>
        <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all min-h-[42px] flex items-center justify-center ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/25 scale-[1.03]'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800/90 hover:border-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Cards List */}
      <div className="space-y-3">
        {filteredExercises.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-3xl text-zinc-400">
            <p className="text-sm font-bold text-zinc-300">검색 결과가 없습니다.</p>
            <p className="text-xs text-zinc-500 mt-1">원하는 기구가 없다면 직접 등록해보세요!</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 bg-emerald-500 text-zinc-950 rounded-xl text-xs font-bold"
            >
              새 기구 등록하기
            </button>
          </div>
        ) : (
          filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              className="p-4 bg-zinc-900/90 border border-zinc-800/80 rounded-2xl hover:border-zinc-700 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCategoryBadgeClass(
                        exercise.category
                      )}`}
                    >
                      {exercise.category}
                    </span>
                    {exercise.isCustom && (
                      <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                        커스텀
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mt-1.5">{exercise.name}</h3>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    주요 부위: <span className="text-zinc-300">{exercise.targetMuscle}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedExerciseForTips(exercise)}
                  className="p-2 text-zinc-400 hover:text-emerald-400 bg-zinc-800/60 hover:bg-zinc-800 rounded-xl transition-colors shrink-0"
                  title="초보자 꿀팁 보기"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/60">
                <button
                  onClick={() => handleStartWorkoutWithExercise(exercise)}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all"
                >
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>오늘 운동에 담기</span>
                </button>
                <button
                  onClick={() => router.push(`/analytics?exerciseId=${exercise.id}`)}
                  className="flex items-center space-x-1 py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>성장 추이</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Beginner Tips Modal */}
      {selectedExerciseForTips && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getCategoryBadgeClass(
                  selectedExerciseForTips.category
                )}`}
              >
                {selectedExerciseForTips.category}
              </span>
              <button
                onClick={() => setSelectedExerciseForTips(null)}
                className="p-1 text-zinc-400 hover:text-zinc-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg font-black text-white">{selectedExerciseForTips.name}</h3>
            <div className="text-xs text-zinc-400 mt-1 mb-4">
              타겟: {selectedExerciseForTips.targetMuscle}
            </div>

            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-2 mb-5">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
                <Flame className="w-4 h-4 fill-current" />
                <span>초보자 필수 세팅 & 자세 팁</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {selectedExerciseForTips.tips}
              </p>
            </div>

            <button
              onClick={() => {
                const ex = selectedExerciseForTips;
                setSelectedExerciseForTips(null);
                handleStartWorkoutWithExercise(ex);
              }}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-2xl text-sm transition-all"
            >
              이 기구로 바로 운동 시작하기
            </button>
          </div>
        </div>
      )}

      {/* Add Custom Exercise Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">새로운 기구 등록</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomExercise} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  기구 / 운동 이름 *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="예: 해머 스트렝스 인클라인 프레스"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  해당 부위 *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ExerciseCategory)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="가슴">가슴</option>
                  <option value="등">등</option>
                  <option value="하체">하체</option>
                  <option value="팔">팔</option>
                  <option value="어깨">어깨</option>
                  <option value="복근/코어">복근/코어</option>
                  <option value="유산소">유산소</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  자극 부위 (선택)
                </label>
                <input
                  type="text"
                  value={newTargetMuscle}
                  onChange={(e) => setNewTargetMuscle(e.target.value)}
                  placeholder="예: 윗가슴, 광배근"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  나만의 메모 / 세팅 팁 (선택)
                </label>
                <textarea
                  rows={2}
                  value={newTips}
                  onChange={(e) => setNewTips(e.target.value)}
                  placeholder="예: 의자 높이 4번에 맞추기"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-zinc-800 text-zinc-300 font-semibold rounded-xl text-sm"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-500 text-zinc-950 font-bold rounded-xl text-sm hover:bg-emerald-400"
                >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExercisesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">목차 로딩 중...</div>}>
      <ExercisesContent />
    </Suspense>
  );
}
