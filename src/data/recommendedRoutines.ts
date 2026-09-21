import { WorkoutRoutine } from '@/lib/types';

export const RECOMMENDED_ROUTINES: WorkoutRoutine[] = [
  // 1. 헬스 완전 초보자 1~2주차 전신 적응 루틴
  {
    id: 'beginner-fullbody-intro',
    title: '헬린이 1~2주차 전신 머신 입문',
    subtitle: '부상 없이 전신 근육을 깨우는 가장 안전한 머신 위주 스타터',
    splitType: '무분할 (전신)',
    dayLabel: '전신 적응',
    targetCategories: ['가슴', '등', '하체', '팔', '복근/코어'],
    difficulty: '초보자 입문 (1~4주)',
    estimatedMinutes: 40,
    description: '헬스장에 처음 가셨을 때 부상 위험이 있는 프리웨이트 대신 궤적이 고정된 머신들로 전신 근육에 힘주는 법을 익히는 루틴입니다. 주 2~3회(월-수-금) 하루씩 건너뛰며 수행하세요.',
    guideTips: [
      '무거운 무게보다는 12회를 바른 자세로 컨트롤할 수 있는 가벼운 무게로 시작하세요.',
      '각 세트 사이 60초~90초씩 규칙적으로 쉬어주세요.',
      '운동 전 5분 가벼운 스트레칭과 워밍업 러닝을 추천합니다.',
    ],
    exercises: [
      {
        exerciseId: 'chest-press-machine',
        recommendedSets: 3,
        recommendedReps: 12,
        recommendedRestSec: 60,
        tips: '의자 높이는 손잡이가 가슴 중앙에 오게 맞추고, 어깨가 으쓱하지 않게 주의하세요.',
      },
      {
        exerciseId: 'back-lat-pulldown',
        recommendedSets: 3,
        recommendedReps: 12,
        recommendedRestSec: 60,
        tips: '허벅지 패드를 고정하고 가슴을 펴며 쇄골 쪽으로 바를 당겨줍니다.',
      },
      {
        exerciseId: 'leg-press-machine',
        recommendedSets: 3,
        recommendedReps: 12,
        recommendedRestSec: 90,
        tips: '발판 중앙에 발을 두고, 밀 때 무릎 관절을 완전히 쫙 펴지 말고 살짝 구부림을 남기세요.',
      },
      {
        exerciseId: 'arm-cable-pushdown',
        recommendedSets: 3,
        recommendedReps: 12,
        recommendedRestSec: 60,
        tips: '팔꿈치를 옆구리에 고정하고 아래로 찍어 누르듯 팔을 폅니다.',
      },
      {
        exerciseId: 'core-abdominal-machine',
        recommendedSets: 3,
        recommendedReps: 15,
        recommendedRestSec: 45,
        tips: '배꼽을 바라보며 등을 둥글게 말아 복근을 수축하세요.',
      },
    ],
  },

  // 2. 3분할 루틴 Day 1: 가슴 & 삼두
  {
    id: 'split3-day1-chest-triceps',
    title: '[3분할 Day 1] 가슴 & 삼두(팔) 볼륨업',
    subtitle: '탄탄한 앞판 가슴과 팔 뒤쪽 삼두근을 키우는 정석 루틴',
    splitType: '3분할',
    dayLabel: 'Day 1: 가슴 & 삼두',
    targetCategories: ['가슴', '팔'],
    difficulty: '초보자 입문 (1~4주)',
    estimatedMinutes: 45,
    description: '가슴을 밀어내는 복합 운동 후 삼두근을 함께 단련하는 가장 대중적인 푸시(Push) 루틴입니다.',
    guideTips: [
      '가슴 운동 시 항상 어깨를 뒤로 모아 아래로 고정(견갑 패킹)해야 어깨 부상을 막을 수 있습니다.',
      '1세트 진행 후 힘이 남으면 2~3세트에서 중량을 2.5kg씩 올려보세요.',
    ],
    exercises: [
      {
        exerciseId: 'chest-press-machine',
        recommendedSets: 4,
        recommendedReps: 10,
        recommendedRestSec: 90,
        tips: '메인 가슴 종목! 1세트는 가볍게, 2~4세트는 적정 중량으로 집중 수축합니다.',
      },
      {
        exerciseId: 'chest-incline-dumbbell',
        recommendedSets: 3,
        recommendedReps: 12,
        recommendedRestSec: 60,
        tips: '윗가슴을 채워주는 운동! 벤치 각도를 30도 정도로 맞추고 쇄골 아래로 내립니다.',
      },
      {
        exerciseId: 'chest-pec-deck-fly',
        recommendedSets: 3,
        recommendedReps: 15,
        recommendedRestSec: 60,
        tips: '큰 나무를 껴안듯 가슴 중앙을 모아줍니다. 팔꿈치 각도를 고정하세요.',
      },
      {
        exerciseId: 'arm-cable-pushdown',
        recommendedSets: 3,
        recommendedReps: 12,
        recommendedRestSec: 60,
        tips: '팔 뒤쪽 삼두근을 고립하여 수축합니다. 반동을 쓰지 마세요.',
      },
      {
        exerciseId: 'chest-dips-machine',
        recommendedSets: 3,
        recommendedReps: 10,
        recommendedRestSec: 60,
        tips: '핀을 충분히 무겁게 꽂아 체중을 보조받고 상체를 살짝 숙여 가슴 하부를 자극합니다.',
      },
    ],
  },

  // 3. 3분할 루틴 Day 2: 등 & 이두
  {
    id: 'split3-day2-back-biceps',
    title: '[3분할 Day 2] 등 & 이두(팔) 역삼각형 루틴',
    subtitle: '굽은 등과 라운드숄더를 펴고 넓은 프레임을 만드는 당기기 루틴',
    splitType: '3분할',
    dayLabel: 'Day 2: 등 & 이두',
    targetCategories: ['등', '팔'],
    difficulty: '초보자 입문 (1~4주)',
    estimatedMinutes: 45,
    description: '등의 너비(광배근)와 두께(승모/능형근)를 골고루 자극하고 당길 때 함께 쓰이는 이두근을 마무리해 줍니다.',
    guideTips: [
      '손이나 팔 힘으로만 당기지 말고, 팔꿈치를 뒤로 보낸다는 느낌으로 등을 접으세요.',
      '허리가 말리지 않도록 항상 가슴을 활짝 열고 아치를 유지하세요.',
    ],
    exercises: [
      {
        exerciseId: 'back-lat-pulldown',
        recommendedSets: 4,
        recommendedReps: 12,
        recommendedRestSec: 90,
        tips: '대표적인 등 너비 운동! 바를 쇄골 쪽으로 당기며 날개뼈를 아래로 꾹 누르세요.',
      },
      {
        exerciseId: 'back-seated-cable-row',
        recommendedSets: 3,
        recommendedReps: 12,
        recommendedRestSec: 60,
        tips: '등 두께감을 채워줍니다. 배꼽 쪽으로 당기며 등을 쥐어짜세요.',
      },
      {
        exerciseId: 'back-chest-supported-row',
        recommendedSets: 3,
        recommendedReps: 12,
        recommendedRestSec: 60,
        tips: '가슴을 패드에 대고 하므로 허리 부담 없이 안전하게 등에만 집중할 수 있습니다.',
      },
      {
        exerciseId: 'arm-barbell-curl',
        recommendedSets: 3,
        recommendedReps: 12,
        recommendedRestSec: 60,
        tips: '팔꿈치를 옆구리에 붙이고 팔 앞쪽 알통을 쥐어짜듯 들어 올립니다.',
      },
      {
        exerciseId: 'arm-hammer-curl',
        recommendedSets: 3,
        recommendedReps: 12,
        recommendedRestSec: 60,
        tips: '덤벨을 세로로 잡고 올려 팔의 측면 두께감과 전완근을 키웁니다.',
      },
    ],
  },

  // 4. 3분할 루틴 Day 3: 하체 & 어깨
  {
    id: 'split3-day3-legs-shoulders',
    title: '[3분할 Day 3] 하체 탄탄 & 어깨 깡패 루틴',
    subtitle: '몸의 엔진인 하체 대근육과 프레임을 넓히는 어깨 집중 루틴',
    splitType: '3분할',
    dayLabel: 'Day 3: 하체 & 어깨',
    targetCategories: ['하체', '어깨'],
    difficulty: '초보자 입문 (1~4주)',
    estimatedMinutes: 50,
    description: '칼로리 소모가 가장 큰 하체 머신 운동과 입체적인 어깨를 만드는 머신/레이즈 루틴입니다.',
    guideTips: [
      '하체 운동은 무게를 무겁게 꽂을 수 있으므로 무릎 관절을 잠그지(lock) 않도록 항상 유의하세요.',
      '어깨 운동은 가벼운 무게로 정확한 자극을 느끼는 것이 훨씬 중요합니다.',
    ],
    exercises: [
      {
        exerciseId: 'leg-press-machine',
        recommendedSets: 4,
        recommendedReps: 12,
        recommendedRestSec: 90,
        tips: '발판 중심에 발을 어깨너비로 대고 천천히 내렸다가 지면을 밀듯 힘차게 밀어 올립니다.',
      },
      {
        exerciseId: 'leg-extension-machine',
        recommendedSets: 3,
        recommendedReps: 12,
        recommendedRestSec: 60,
        tips: '허벅지 앞쪽을 타이트하게 쥐어짜는 종목. 올린 상태에서 1초 멈춰보세요.',
      },
      {
        exerciseId: 'leg-curl-machine',
        recommendedSets: 3,
        recommendedReps: 12,
        recommendedRestSec: 60,
        tips: '허벅지 뒷면(햄스트링)을 접어주어 앞뒤 균형을 맞춥니다.',
      },
      {
        exerciseId: 'shoulder-press-machine',
        recommendedSets: 3,
        recommendedReps: 12,
        recommendedRestSec: 60,
        tips: '손잡이가 귀 높이에 오게 맞추고 수직으로 어깨 힘으로 밀어 올립니다.',
      },
      {
        exerciseId: 'shoulder-lateral-raise',
        recommendedSets: 3,
        recommendedReps: 15,
        recommendedRestSec: 45,
        tips: '2~3kg 가벼운 덤벨로 물을 따르듯 팔을 옆으로 들어 올려 어깨 뽕을 만듭니다.',
      },
    ],
  },

  // 5. 2분할 상체 올인원 루틴
  {
    id: 'split2-upper-allinone',
    title: '[2분할 A] 상체 머신 올인원 (가슴+등+팔)',
    subtitle: '주 2~3회 짧고 굵게 상체 전반을 단련하는 고효율 루틴',
    splitType: '2분할',
    dayLabel: '상체 올인원',
    targetCategories: ['가슴', '등', '팔'],
    difficulty: '초보자 중급 (2~6개월)',
    estimatedMinutes: 45,
    description: '시간이 부족할 때 가슴과 등을 번갈아 자극하여 상체 근육을 빈틈없이 채우는 루틴입니다.',
    guideTips: [
      '가슴과 등을 번갈아 수행하면 한쪽이 쉴 때 반대쪽을 할 수 있어 효율적입니다.',
    ],
    exercises: [
      {
        exerciseId: 'chest-press-machine',
        recommendedSets: 3,
        recommendedReps: 12,
        recommendedRestSec: 60,
        tips: '가슴 근육 전체를 펌핑합니다.',
      },
      {
        exerciseId: 'back-lat-pulldown',
        recommendedSets: 3,
        recommendedReps: 12,
        recommendedRestSec: 60,
        tips: '등을 넓게 펴주는 광배근 운동입니다.',
      },
      {
        exerciseId: 'chest-pec-deck-fly',
        recommendedSets: 3,
        recommendedReps: 12,
        recommendedRestSec: 60,
        tips: '가슴 안쪽 라인을 선명하게 모아줍니다.',
      },
      {
        exerciseId: 'back-seated-cable-row',
        recommendedSets: 3,
        recommendedReps: 12,
        recommendedRestSec: 60,
        tips: '등 안쪽 견갑 사이를 단단하게 만들어줍니다.',
      },
      {
        exerciseId: 'arm-cable-pushdown',
        recommendedSets: 3,
        recommendedReps: 12,
        recommendedRestSec: 45,
        tips: '팔 뒤쪽 삼두 마무리!',
      },
    ],
  },

  // 6. 2분할 하체 & 힙업 & 복근 루틴
  {
    id: 'split2-lower-abs',
    title: '[2분할 B] 하체 힙업 & 복근/코어 루틴',
    subtitle: '하체 라인과 힙업, 복부 코어 근육을 탄탄하게 잡아주는 루틴',
    splitType: '2분할',
    dayLabel: '하체 & 코어',
    targetCategories: ['하체', '복근/코어'],
    difficulty: '초보자 중급 (2~6개월)',
    estimatedMinutes: 40,
    description: '레그프레스와 힙 어브덕션(아웃타이), 레그컬로 엉덩이와 허벅지를 완성하고 복근 머신으로 코어를 다집니다.',
    guideTips: [
      '힙 어브덕션(아웃타이) 시 상체를 살짝 앞으로 숙이면 엉덩이 위쪽에 강한 자극이 옵니다.',
    ],
    exercises: [
      {
        exerciseId: 'leg-press-machine',
        recommendedSets: 4,
        recommendedReps: 12,
        recommendedRestSec: 90,
        tips: '허벅지와 둔근 전체를 강력하게 밀어 올립니다.',
      },
      {
        exerciseId: 'leg-hip-abduction',
        recommendedSets: 3,
        recommendedReps: 15,
        recommendedRestSec: 60,
        tips: '다리를 바깥으로 최대한 넓게 벌리며 엉덩이 바깥쪽을 자극합니다.',
      },
      {
        exerciseId: 'leg-extension-machine',
        recommendedSets: 3,
        recommendedReps: 12,
        recommendedRestSec: 60,
        tips: '허벅지 전면 분리 운동입니다.',
      },
      {
        exerciseId: 'leg-curl-machine',
        recommendedSets: 3,
        recommendedReps: 12,
        recommendedRestSec: 60,
        tips: '허벅지 뒷면 탄력을 완성합니다.',
      },
      {
        exerciseId: 'core-abdominal-machine',
        recommendedSets: 3,
        recommendedReps: 15,
        recommendedRestSec: 45,
        tips: '복근을 동그랗게 말아 수축합니다.',
      },
    ],
  },
];

export function getRoutineById(id: string): WorkoutRoutine | undefined {
  return RECOMMENDED_ROUTINES.find((r) => r.id === id);
}
