import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bike,
  CalendarRange,
  ChartColumn,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  CopyPlus,
  Dumbbell,
  FileArchive,
  FileUp,
  Flame,
  History,
  Layers,
  ListFilter,
  Play,
  Plus,
  Save,
  Search,
  Shield,
  SquarePen,
  Trash2,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react';

const STORAGE_KEY = 'gym-log-v2';
const ACTIVE_WORKOUT_KEY = `${STORAGE_KEY}-active-workout`;
const WORKOUT_TEMPLATES_KEY = `${STORAGE_KEY}-templates`;
const TABS = ['Workout', 'Templates', 'History', 'Charts', 'Backup'];
const CATEGORY_ORDER = ['Push', 'Pull', 'Upper', 'Lower', 'Legs', 'Full Body', 'Core', 'Cardio', 'Custom'];
const TEMPLATE_ORDER = ['Push', 'Pull', 'Upper', 'Lower', 'Legs', 'Full Body', 'Core', 'Cardio'];
const CHART_METRICS = [
  { id: 'maxWeight', label: 'Max weight' },
  { id: 'estimated1rm', label: 'Est. 1RM' },
  { id: 'volume', label: 'Volume' },
  { id: 'sets', label: 'Sets' },
  { id: 'reps', label: 'Reps' },
];
const DATE_RANGES = [
  { id: '7', label: '7D', days: 7 },
  { id: '30', label: '30D', days: 30 },
  { id: '90', label: '90D', days: 90 },
  { id: 'all', label: 'All', days: null },
];
const TEMPLATES = {
  Upper: ['Bench Press', 'Barbell Row', 'Shoulder Press', 'Lat Pulldown', 'Bicep Curl'],
  Push: ['Bench Press', 'Incline DB Press', 'Shoulder Press', 'Lateral Raise', 'Tricep Pushdown'],
  Pull: ['Lat Pulldown', 'Barbell Row', 'Seated Cable Row', 'Hammer Curl', 'Face Pull'],
  Lower: ['Back Squat', 'Leg Press', 'Romanian Deadlift', 'Leg Curl', 'Calf Raise'],
  Legs: ['Back Squat', 'Leg Press', 'Romanian Deadlift', 'Leg Extension', 'Standing Calf Raise'],
  'Full Body': ['Back Squat', 'Bench Press', 'Deadlift', 'Pull Up', 'Farmer Carry'],
  Core: ['Plank', 'Cable Crunch', 'Hanging Knee Raise', 'Dead Bug', 'Pallof Press'],
  Cardio: ['Treadmill Run', 'Stationary Bike', 'Rowing Machine', 'Stair Climber', 'Incline Walk'],
};
const DEFAULT_REST_SECONDS = 120;
const HISTORY_PAGE_SIZE = 12;
const AUTOSAVE_DELAY_MS = 450;

const EXERCISE_LIBRARY = [
  { name: 'Bench Press', muscle: 'Chest', type: 'Push', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Incline DB Press', muscle: 'Chest', type: 'Push', equipment: 'Dumbbells', tracking: 'weight/reps' },
  { name: 'Chest Press Machine', muscle: 'Chest', type: 'Push', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Cable Fly', muscle: 'Chest', type: 'Push', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Push Up', muscle: 'Chest', type: 'Push', equipment: 'Bodyweight', tracking: 'bodyweight' },
  { name: 'Pull Up', muscle: 'Back', type: 'Pull', equipment: 'Bodyweight', tracking: 'bodyweight' },
  { name: 'Lat Pulldown', muscle: 'Back', type: 'Pull', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Barbell Row', muscle: 'Back', type: 'Pull', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Seated Cable Row', muscle: 'Back', type: 'Pull', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Single Arm DB Row', muscle: 'Back', type: 'Pull', equipment: 'Dumbbell', tracking: 'weight/reps' },
  { name: 'Face Pull', muscle: 'Shoulders', type: 'Pull', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Shoulder Press', muscle: 'Shoulders', type: 'Push', equipment: 'Dumbbells', tracking: 'weight/reps' },
  { name: 'Overhead Press', muscle: 'Shoulders', type: 'Push', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Lateral Raise', muscle: 'Shoulders', type: 'Push', equipment: 'Dumbbells', tracking: 'weight/reps' },
  { name: 'Rear Delt Fly', muscle: 'Shoulders', type: 'Pull', equipment: 'Dumbbells', tracking: 'weight/reps' },
  { name: 'Bicep Curl', muscle: 'Biceps', type: 'Pull', equipment: 'Dumbbells', tracking: 'weight/reps' },
  { name: 'Hammer Curl', muscle: 'Biceps', type: 'Pull', equipment: 'Dumbbells', tracking: 'weight/reps' },
  { name: 'Preacher Curl', muscle: 'Biceps', type: 'Pull', equipment: 'EZ Bar', tracking: 'weight/reps' },
  { name: 'Tricep Pushdown', muscle: 'Triceps', type: 'Push', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Overhead Tricep Extension', muscle: 'Triceps', type: 'Push', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Dips', muscle: 'Triceps', type: 'Push', equipment: 'Bodyweight', tracking: 'bodyweight' },
  { name: 'Back Squat', muscle: 'Quads', type: 'Lower', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Front Squat', muscle: 'Quads', type: 'Lower', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Leg Press', muscle: 'Quads', type: 'Legs', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Leg Extension', muscle: 'Quads', type: 'Legs', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Romanian Deadlift', muscle: 'Hamstrings', type: 'Lower', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Leg Curl', muscle: 'Hamstrings', type: 'Legs', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Hip Thrust', muscle: 'Glutes', type: 'Lower', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Cable Kickback', muscle: 'Glutes', type: 'Lower', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Standing Calf Raise', muscle: 'Calves', type: 'Legs', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Seated Calf Raise', muscle: 'Calves', type: 'Legs', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Plank', muscle: 'Core', type: 'Core', equipment: 'Bodyweight', tracking: 'time' },
  { name: 'Cable Crunch', muscle: 'Core', type: 'Core', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Hanging Knee Raise', muscle: 'Core', type: 'Core', equipment: 'Bodyweight', tracking: 'bodyweight' },
  { name: 'Pallof Press', muscle: 'Core', type: 'Core', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Treadmill Run', muscle: 'Cardio', type: 'Cardio', equipment: 'Treadmill', tracking: 'distance/time' },
  { name: 'Incline Walk', muscle: 'Cardio', type: 'Cardio', equipment: 'Treadmill', tracking: 'distance/time' },
  { name: 'Stationary Bike', muscle: 'Cardio', type: 'Cardio', equipment: 'Bike', tracking: 'distance/time' },
  { name: 'Rowing Machine', muscle: 'Cardio', type: 'Cardio', equipment: 'Rower', tracking: 'distance/time' },
  { name: 'Stair Climber', muscle: 'Cardio', type: 'Cardio', equipment: 'Machine', tracking: 'time' },
];

const CATEGORY_ICONS = {
  Push: ArrowUp,
  Pull: ArrowDown,
  Upper: Users,
  Lower: Layers,
  Legs: Zap,
  Core: Shield,
  Cardio: Bike,
  'Full Body': Dumbbell,
  Custom: SquarePen,
};

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

function nowValue() {
  return new Date().toISOString();
}

function formatLongDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function formatShortDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function normalizeName(name) {
  return String(name || '').trim().toLowerCase();
}

function createSet(previousSet = {}) {
  return {
    id: createId(),
    weight: '',
    reps: '',
    previousWeight: previousSet.weight ?? '',
    previousReps: previousSet.reps ?? '',
  };
}

function getExerciseMeta(name) {
  const normalized = normalizeName(name);
  return EXERCISE_LIBRARY.find((exercise) => normalizeName(exercise.name) === normalized) || null;
}

function createExercise(name = '', previousSets = []) {
  const populatedSets = previousSets
    .filter((set) => set.weight !== '' || set.reps !== '')
    .map((set) => createSet(set));

  const meta = getExerciseMeta(name);
  return {
    id: createId(),
    name,
    muscle: meta?.muscle || '',
    type: meta?.type || '',
    equipment: meta?.equipment || '',
    tracking: meta?.tracking || 'weight/reps',
    sets: populatedSets.length ? populatedSets : [createSet()],
  };
}

function getTemplateForType(type, workouts) {
  if (type === 'Custom') return [{ name: 'Exercise 1', sets: [] }];

  const lastWorkoutOfType = [...workouts]
    .sort((a, b) => new Date(b.startedAt || b.date) - new Date(a.startedAt || a.date))
    .find((workout) => workout.type === type);

  if (lastWorkoutOfType?.exercises?.length) {
    const savedExercises = lastWorkoutOfType.exercises
      .map((exercise) => ({
        name: String(exercise.name || '').trim(),
        sets: Array.isArray(exercise.sets) ? exercise.sets : [],
      }))
      .filter((exercise) => exercise.name);

    if (savedExercises.length) return savedExercises;
  }

  return (TEMPLATES[type] || []).map((name) => ({ name, sets: [] }));
}

function createWorkout(type, customTitle = '', workouts = []) {
  const label = type === 'Custom' ? (customTitle.trim() || 'Custom Workout') : type;
  const template = getTemplateForType(type, workouts);

  return {
    id: createId(),
    date: todayValue(),
    startedAt: nowValue(),
    type,
    label,
    notes: '',
    exercises: template.map((exercise) => createExercise(exercise.name, exercise.sets)),
  };
}

function readData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { workouts: [] };
    const parsed = JSON.parse(raw);
    return { workouts: Array.isArray(parsed.workouts) ? parsed.workouts : [] };
  } catch {
    return { workouts: [] };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function readActiveWorkout() {
  try {
    const raw = localStorage.getItem(ACTIVE_WORKOUT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.id && Array.isArray(parsed.exercises) ? parsed : null;
  } catch {
    return null;
  }
}

function saveActiveWorkout(workout) {
  if (!workout) {
    localStorage.removeItem(ACTIVE_WORKOUT_KEY);
    return;
  }
  localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify({ ...workout, updatedAt: nowValue() }));
}

function readTemplates() {
  try {
    const raw = localStorage.getItem(WORKOUT_TEMPLATES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((template) => template?.id && template?.name) : [];
  } catch {
    return [];
  }
}

function saveTemplates(templates) {
  localStorage.setItem(WORKOUT_TEMPLATES_KEY, JSON.stringify(Array.isArray(templates) ? templates : []));
}

function hasWorkoutContent(workout) {
  if (!workout) return false;
  if (String(workout.notes || '').trim()) return true;
  return (workout.exercises || []).some(
    (exercise) =>
      String(exercise.name || '').trim() ||
      (exercise.sets || []).some((set) => set.weight !== '' || set.reps !== ''),
  );
}

function hasTemplateExercises(workout) {
  return (workout?.exercises || []).some((exercise) => String(exercise.name || '').trim());
}

function createTemplateFromWorkout(workout, name) {
  return {
    id: createId(),
    name: name.trim(),
    type: workout.type || 'Custom',
    label: workout.label || name.trim(),
    notes: workout.notes || '',
    createdAt: nowValue(),
    lastUsedAt: null,
    exercises: (workout.exercises || [])
      .filter((exercise) => String(exercise.name || '').trim())
      .map((exercise) => ({
        id: createId(),
        name: exercise.name,
        muscle: exercise.muscle || getExerciseMeta(exercise.name)?.muscle || '',
        type: exercise.type || getExerciseMeta(exercise.name)?.type || '',
        equipment: exercise.equipment || getExerciseMeta(exercise.name)?.equipment || '',
        tracking: exercise.tracking || getExerciseMeta(exercise.name)?.tracking || 'weight/reps',
        setCount: Math.max((exercise.sets || []).length, 1),
        sets: Array.from({ length: Math.max((exercise.sets || []).length, 1) }, () => ({ weight: '', reps: '' })),
      })),
  };
}

function createWorkoutFromTemplate(template) {
  return {
    id: createId(),
    date: todayValue(),
    startedAt: nowValue(),
    type: template.type || 'Custom',
    label: template.name || template.label || 'Template Workout',
    notes: template.notes || '',
    templateId: template.id,
    exercises: (template.exercises || []).map((exercise) => ({
      id: createId(),
      name: exercise.name || '',
      muscle: exercise.muscle || getExerciseMeta(exercise.name)?.muscle || '',
      type: exercise.type || getExerciseMeta(exercise.name)?.type || '',
      equipment: exercise.equipment || getExerciseMeta(exercise.name)?.equipment || '',
      tracking: exercise.tracking || getExerciseMeta(exercise.name)?.tracking || 'weight/reps',
      sets: Array.from({ length: Math.max((exercise.sets || []).length || exercise.setCount || 1, 1) }, () => createSet()),
    })),
  };
}

function formatSetSummary(set) {
  return `${set.weight}x${set.reps}`;
}

function findLastExercise(workouts, currentWorkoutId, exerciseName) {
  const normalized = normalizeName(exerciseName);
  if (!normalized) return null;

  const prior = workouts
    .filter((workout) => workout.id !== currentWorkoutId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  for (const workout of prior) {
    for (const exercise of workout.exercises || []) {
      if (normalizeName(exercise.name) === normalized) {
        const completeSets = (exercise.sets || []).filter((set) => set.weight !== '' && set.reps !== '');
        if (!completeSets.length) return null;
        return completeSets.map(formatSetSummary).join(', ');
      }
    }
  }

  return null;
}

function collectExerciseNames(workouts, activeWorkout) {
  const names = new Set(EXERCISE_LIBRARY.map((exercise) => exercise.name));
  workouts.forEach((workout) => {
    (workout.exercises || []).forEach((exercise) => {
      if (exercise.name) names.add(exercise.name);
    });
  });
  (activeWorkout?.exercises || []).forEach((exercise) => {
    if (exercise.name) names.add(exercise.name);
  });
  return [...names].sort((a, b) => a.localeCompare(b));
}

function getExerciseOptions(workouts, activeWorkout, category = 'All') {
  const library = EXERCISE_LIBRARY.filter((exercise) => category === 'All' || exercise.type === category);
  const used = collectExerciseNames(workouts, activeWorkout)
    .map((name) => getExerciseMeta(name) || { name, muscle: 'Custom', type: 'Custom', equipment: 'Custom', tracking: 'weight/reps' })
    .filter((exercise) => category === 'All' || exercise.type === category);
  const byName = new Map([...library, ...used].map((exercise) => [normalizeName(exercise.name), exercise]));
  return [...byName.values()].sort((a, b) => {
    const typeSort = CATEGORY_ORDER.indexOf(a.type) - CATEGORY_ORDER.indexOf(b.type);
    return typeSort || a.muscle.localeCompare(b.muscle) || a.name.localeCompare(b.name);
  });
}

function getWorkoutTime(workout) {
  return new Date(workout.startedAt || `${workout.date}T12:00:00`).getTime();
}

function getRangeStart(rangeId) {
  const range = DATE_RANGES.find((item) => item.id === rangeId);
  if (!range?.days) return null;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - range.days + 1);
  return start.getTime();
}

function estimateOneRepMax(weight, reps) {
  if (!weight || !reps) return 0;
  return Math.round(weight * (1 + reps / 30));
}

function summarizeExercise(exercise) {
  return (exercise.sets || []).reduce(
    (summary, set) => {
      const weight = Number(set.weight);
      const reps = Number(set.reps);
      const hasWeight = Number.isFinite(weight) && weight > 0;
      const hasReps = Number.isFinite(reps) && reps > 0;
      if (!hasWeight && !hasReps) return summary;
      summary.sets += 1;
      summary.reps += hasReps ? reps : 0;
      summary.volume += hasWeight && hasReps ? weight * reps : 0;
      summary.maxWeight = Math.max(summary.maxWeight, hasWeight ? weight : 0);
      summary.estimated1rm = Math.max(summary.estimated1rm, hasWeight && hasReps ? estimateOneRepMax(weight, reps) : 0);
      return summary;
    },
    { maxWeight: 0, estimated1rm: 0, volume: 0, sets: 0, reps: 0 },
  );
}

function calculateExerciseRecords(workouts) {
  const records = new Map();
  workouts.forEach((workout) => {
    (workout.exercises || []).forEach((exercise) => {
      const normalized = normalizeName(exercise.name);
      if (!normalized) return;
      const current = records.get(normalized) || { maxWeight: 0, estimated1rm: 0, bestVolume: 0, bestReps: 0 };
      const summary = summarizeExercise(exercise);
      records.set(normalized, {
        maxWeight: Math.max(current.maxWeight, summary.maxWeight),
        estimated1rm: Math.max(current.estimated1rm, summary.estimated1rm),
        bestVolume: Math.max(current.bestVolume, summary.volume),
        bestReps: Math.max(current.bestReps, summary.reps),
      });
    });
  });
  return records;
}

function getCurrentSetPrs(set, exerciseRecords) {
  const weight = Number(set.weight);
  const reps = Number(set.reps);
  const hasWeight = Number.isFinite(weight) && weight > 0;
  const hasReps = Number.isFinite(reps) && reps > 0;
  if (!exerciseRecords || (!hasWeight && !hasReps)) return [];

  const prs = [];
  const volume = hasWeight && hasReps ? weight * reps : 0;
  // Epley estimate: weight * (1 + reps / 30). Good enough for lightweight PR hints.
  const estimated1rm = hasWeight && hasReps ? estimateOneRepMax(weight, reps) : 0;
  if (hasWeight && weight > exerciseRecords.maxWeight) prs.push('Max weight PR');
  if (estimated1rm && estimated1rm > exerciseRecords.estimated1rm) prs.push('Est. 1RM PR');
  if (volume && volume > exerciseRecords.bestVolume) prs.push('Volume PR');
  if (hasReps && reps > exerciseRecords.bestReps) prs.push('Rep PR');
  return prs;
}

function getLastPerformanceMap(workouts) {
  const map = new Map();
  [...workouts]
    .sort((a, b) => getWorkoutTime(b) - getWorkoutTime(a))
    .forEach((workout) => {
      (workout.exercises || []).forEach((exercise) => {
        const normalized = normalizeName(exercise.name);
        if (!normalized || map.has(normalized)) return;
        const completeSets = (exercise.sets || []).filter((set) => set.weight !== '' && set.reps !== '');
        if (completeSets.length) map.set(normalized, completeSets.map(formatSetSummary).join(', '));
      });
    });
  return map;
}

function getChartSeries(workouts, { category, exerciseName, rangeId, metric }) {
  const startTime = getRangeStart(rangeId);
  const normalized = normalizeName(exerciseName);
  const grouped = new Map();

  workouts
    .filter((workout) => {
      if (startTime && getWorkoutTime(workout) < startTime) return false;
      if (category !== 'All' && workout.type !== category) return false;
      return true;
    })
    .forEach((workout) => {
      const daily = grouped.get(workout.date) || { date: workout.date, value: 0 };
      (workout.exercises || [])
        .filter((exercise) => !normalized || normalizeName(exercise.name) === normalized)
        .forEach((exercise) => {
          const summary = summarizeExercise(exercise);
          daily.value += summary[metric] || 0;
        });
      grouped.set(workout.date, daily);
    });

  const points = [...grouped.values()]
    .filter((point) => point.value > 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (points.length === 1) {
    const priorDate = new Date(`${points[0].date}T12:00:00`);
    priorDate.setDate(priorDate.getDate() - 7);
    return [{ date: priorDate.toISOString().slice(0, 10), value: 0 }, points[0]];
  }

  return points;
}

function ConfettiLayer({ bursts }) {
  return (
    <div className="confetti-layer" aria-hidden="true">
      {bursts.map((burst) =>
        Array.from({ length: 14 }, (_, index) => {
          const angle = (360 / 14) * index;
          const distance = 44 + ((index * 9) % 42);
          const style = {
            left: `${burst.x}px`,
            top: `${burst.y}px`,
            '--dx': `${Math.cos((angle * Math.PI) / 180) * distance}px`,
            '--dy': `${Math.sin((angle * Math.PI) / 180) * distance}px`,
            '--delay': `${index * 16}ms`,
            '--rotation': `${angle + 90}deg`,
            '--color': ['#5cd68d', '#ffd166', '#ff6b6b', '#8ec5ff'][index % 4],
          };

          return <span key={`${burst.id}-${index}`} className="confetti-piece" style={style} />;
        }),
      )}
    </div>
  );
}

function BottomNav({ tab, onChange }) {
  const tabIcons = {
    Workout: Dumbbell,
    Templates: ClipboardList,
    History,
    Charts: ChartColumn,
    Backup: FileArchive,
  };

  return (
    <nav className="bottom-nav">
      {TABS.map((item) => {
        const Icon = tabIcons[item];
        return (
          <button
            key={item}
            type="button"
            className={`tab-button ${tab === item ? 'active' : ''}`}
            onClick={() => onChange(item)}
          >
            <Icon size={18} strokeWidth={2.2} />
            {item}
          </button>
        );
      })}
    </nav>
  );
}

function ChooseWorkoutScreen({ onStart }) {
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const customSheetRef = useRef(null);

  useEffect(() => {
    if (!showCustom) return;
    customSheetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [showCustom]);

  return (
    <div className="screen screen-home">
      <div className="brand-lockup">
        <div className="brand-icon" aria-hidden="true">
          <span className="brand-mark">
            <span className="brand-rack-upright left" />
            <span className="brand-rack-upright right" />
            <span className="brand-rack-base" />
            <span className="brand-rack-bench" />
            <span className="brand-rack-post" />
            <span className="brand-rack-barbell" />
            <span className="brand-rack-weight left outer" />
            <span className="brand-rack-weight left inner" />
            <span className="brand-rack-weight right inner" />
            <span className="brand-rack-weight right outer" />
          </span>
        </div>
        <div>
          <p className="eyebrow">Gym Log</p>
          <h1>What are you training today?</h1>
        </div>
      </div>

      <div className="stack-lg">
        {TEMPLATE_ORDER.map((item) => (
          <button key={item} type="button" className="workout-choice" onClick={() => onStart(item)}>
            {(() => {
              const Icon = CATEGORY_ICONS[item] || Dumbbell;
              return <Icon size={24} strokeWidth={2.2} />;
            })()}
            <span>{item}</span>
            <strong>
              <ArrowRight size={24} strokeWidth={2.4} />
            </strong>
          </button>
        ))}
      </div>

      {!showCustom ? (
        <button type="button" className="text-link" onClick={() => setShowCustom(true)}>
          <SquarePen size={16} strokeWidth={2.2} />
          Custom workout
        </button>
      ) : (
        <div className="custom-sheet" ref={customSheetRef}>
          <div className="sheet-header">
            <label className="field-label" htmlFor="custom-workout-name">
              Workout name
            </label>
            <button
              type="button"
              className="sheet-close"
              aria-label="Close custom workout"
              onClick={() => {
                setShowCustom(false);
                setCustomName('');
              }}
            >
              <X size={18} strokeWidth={2.4} />
            </button>
          </div>
          <input
            id="custom-workout-name"
            type="text"
            placeholder="Chest, Arms, Conditioning..."
            value={customName}
            onChange={(event) => setCustomName(event.target.value)}
          />
          <button type="button" className="primary-button" onClick={() => onStart('Custom', customName)}>
            <ClipboardList size={18} strokeWidth={2.2} />
            Start workout
          </button>
        </div>
      )}
    </div>
  );
}

function TimerPill({ secondsLeft, active, onReset }) {
  if (!active) return null;
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(1, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  return (
    <button type="button" className="timer-pill timer-pill-active" onClick={onReset}>
      {minutes}:{seconds}
    </button>
  );
}

function ActiveWorkoutScreen({
  workout,
  workouts,
  saveStatus,
  exerciseRecords,
  lastPerformanceMap,
  onUpdate,
  onFinish,
  onSaveTemplate,
  timerActive,
  secondsLeft,
  onResetTimer,
  onCelebrate,
}) {
  const [exerciseInput, setExerciseInput] = useState('');
  const [lastEditedFieldId, setLastEditedFieldId] = useState('');
  const [exerciseFilter, setExerciseFilter] = useState(workout.type === 'Custom' ? 'All' : workout.type);
  const exerciseOptions = useMemo(
    () => getExerciseOptions(workouts, workout, exerciseFilter),
    [workouts, workout, exerciseFilter],
  );
  const suggestions = useMemo(() => {
    const query = normalizeName(exerciseInput);
    const ordered = exerciseOptions.filter((exercise) => !query || normalizeName(exercise.name).includes(query));
    return ordered.slice(0, 10);
  }, [exerciseInput, exerciseOptions]);

  const updateWorkoutNotes = (notes) => {
    onUpdate({ ...workout, notes });
  };

  const updateExerciseName = (exerciseId, name) => {
    const meta = getExerciseMeta(name);
    onUpdate({
      ...workout,
      exercises: workout.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              name,
              muscle: meta?.muscle || exercise.muscle || '',
              type: meta?.type || exercise.type || '',
              equipment: meta?.equipment || exercise.equipment || '',
              tracking: meta?.tracking || exercise.tracking || 'weight/reps',
            }
          : exercise,
      ),
    });
  };

  const updateSet = (exerciseId, setId, field, value) => {
    setLastEditedFieldId(`${exerciseId}-${setId}-${field}`);
    onUpdate({
      ...workout,
      exercises: workout.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) => (set.id === setId ? { ...set, [field]: value } : set)),
            }
          : exercise,
      ),
    });
  };

  const addSet = (exerciseId) => {
    onUpdate({
      ...workout,
      exercises: workout.exercises.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        const previous = exercise.sets[exercise.sets.length - 1];
        return {
          ...exercise,
          sets: [...exercise.sets, createSet(previous)],
        };
      }),
    });
  };

  const removeSet = (exerciseId, setId) => {
    onUpdate({
      ...workout,
      exercises: workout.exercises.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        const nextSets = exercise.sets.filter((set) => set.id !== setId);
        return { ...exercise, sets: nextSets.length ? nextSets : [{ id: createId(), weight: '', reps: '' }] };
      }),
    });
  };

  const addExercise = (name = '') => {
    const finalName = name.trim();
    onUpdate({
      ...workout,
      exercises: [...workout.exercises, createExercise(finalName)],
    });
    setExerciseInput('');
  };

  const moveExercise = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= workout.exercises.length) return;
    const next = [...workout.exercises];
    const [item] = next.splice(index, 1);
    next.splice(targetIndex, 0, item);
    onUpdate({ ...workout, exercises: next });
  };

  const removeExercise = (exerciseId) => {
    onUpdate({
      ...workout,
      exercises:
        workout.exercises.length === 1
          ? [createExercise('', workout.exercises[0]?.sets)]
          : workout.exercises.filter((exercise) => exercise.id !== exerciseId),
    });
  };

  const handleRepsBlur = (exerciseId, setId, event) => {
    const exercise = workout.exercises.find((item) => item.id === exerciseId);
    const set = exercise?.sets.find((item) => item.id === setId);
    if (set && set.weight !== '' && set.reps !== '') {
      onResetTimer();
      onCelebrate?.(event?.target);
    }
  };

  return (
    <div className="screen">
      <div className="timer-sticky-wrap">
        <TimerPill secondsLeft={secondsLeft} active={timerActive} onReset={onResetTimer} />
      </div>
      <header className="session-header">
        <div>
          <button type="button" className="back-link" onClick={() => onUpdate(null)}>
            <ArrowLeft size={16} strokeWidth={2.3} />
            Change workout
          </button>
          <h2>{workout.label}</h2>
          <p>{formatLongDate(workout.date)}</p>
        </div>
        <SaveStatusPill status={saveStatus} />
      </header>

      <div className="exercise-stack">
        {workout.exercises.map((exercise, index) => {
          const lastTime = lastPerformanceMap.get(normalizeName(exercise.name));
          const meta = getExerciseMeta(exercise.name) || exercise;
          const records = exerciseRecords.get(normalizeName(exercise.name));
          return (
            <section key={exercise.id} className="exercise-card">
              <div className="exercise-card-top">
                <div className="exercise-title-wrap">
                  <input
                    className="exercise-title-input"
                    type="text"
                    value={exercise.name}
                    placeholder="Exercise name"
                    list={`exercise-options-${exercise.id}`}
                    onChange={(event) => updateExerciseName(exercise.id, event.target.value)}
                  />
                  <datalist id={`exercise-options-${exercise.id}`}>
                    {exerciseOptions.map((option) => (
                      <option key={option.name} value={option.name} />
                    ))}
                  </datalist>
                  <div className="exercise-meta-row">
                    {[meta.muscle, meta.equipment, meta.tracking].filter(Boolean).map((item) => (
                      <span key={item} className="tiny-label">{item}</span>
                    ))}
                  </div>
                  <p className="last-time">{lastTime ? `Last time: ${lastTime}` : 'No saved history yet.'}</p>
                </div>
                <div className="exercise-actions">
                  <button type="button" className="icon-button" onClick={() => moveExercise(index, -1)} aria-label="Move up">
                    <ArrowUp size={16} strokeWidth={2.4} />
                  </button>
                  <button type="button" className="icon-button" onClick={() => moveExercise(index, 1)} aria-label="Move down">
                    <ArrowDown size={16} strokeWidth={2.4} />
                  </button>
                  <button type="button" className="icon-button danger" onClick={() => removeExercise(exercise.id)} aria-label="Remove exercise">
                    <Trash2 size={16} strokeWidth={2.2} />
                  </button>
                </div>
              </div>

              <div className="set-table-header">
                <span>Set</span>
                <span>Weight</span>
                <span>Reps</span>
                <span />
              </div>

              <div className="set-stack">
                {exercise.sets.map((set, setIndex) => (
                  <div key={set.id} className="set-row-wrap">
                    <div className="set-row">
                      <span className="set-number">{setIndex + 1}</span>
                      <input
                        inputMode="decimal"
                        type="number"
                        placeholder={set.previousWeight || '0'}
                        value={set.weight}
                        onChange={(event) => updateSet(exercise.id, set.id, 'weight', event.target.value)}
                        className={[
                          set.previousWeight !== '' ? 'input-with-history' : '',
                          lastEditedFieldId === `${exercise.id}-${set.id}-weight` ? 'last-edited-input' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      />
                      <input
                        inputMode="numeric"
                        type="number"
                        placeholder={set.previousReps || '0'}
                        value={set.reps}
                        onChange={(event) => updateSet(exercise.id, set.id, 'reps', event.target.value)}
                        onBlur={(event) => handleRepsBlur(exercise.id, set.id, event)}
                        className={[
                          set.previousReps !== '' ? 'input-with-history' : '',
                          lastEditedFieldId === `${exercise.id}-${set.id}-reps` ? 'last-edited-input' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      />
                      <button type="button" className="mini-icon-button" onClick={() => removeSet(exercise.id, set.id)} aria-label="Remove set">
                        <X size={16} strokeWidth={2.4} />
                      </button>
                    </div>
                    {getCurrentSetPrs(set, records).length ? (
                      <div className="pr-row">
                        {getCurrentSetPrs(set, records).slice(0, 2).map((label) => (
                          <span key={label} className="pr-pill">{label}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              <button type="button" className="secondary-button" onClick={() => addSet(exercise.id)}>
                <Plus size={16} strokeWidth={2.4} />
                Add set
              </button>
            </section>
          );
        })}
      </div>

      <section className="add-exercise-card">
        <div className="filter-row" aria-label="Exercise category filter">
          {['All', workout.type, 'Push', 'Pull', 'Lower', 'Core', 'Cardio']
            .filter((item, index, items) => item && items.indexOf(item) === index)
            .map((item) => (
              <button
                key={item}
                type="button"
                className={`segmented-chip ${exerciseFilter === item ? 'active' : ''}`}
                onClick={() => setExerciseFilter(item)}
              >
                {item}
              </button>
            ))}
        </div>
        <div className="add-row">
          <Search className="input-icon" size={17} strokeWidth={2.2} />
          <input
            type="text"
            placeholder="Add exercise"
            value={exerciseInput}
            list="all-exercise-options"
            onChange={(event) => setExerciseInput(event.target.value)}
          />
          <button type="button" className="primary-button small" onClick={() => addExercise(exerciseInput)}>
            <Plus size={16} strokeWidth={2.4} />
            Add
          </button>
          <datalist id="all-exercise-options">
            {exerciseOptions.map((option) => (
              <option key={option.name} value={option.name} />
            ))}
          </datalist>
        </div>
        <div className="chip-row">
          {suggestions.map((exercise) => (
            <button key={exercise.name} type="button" className="chip rich-chip" onClick={() => addExercise(exercise.name)}>
              <span>{exercise.name}</span>
              <small>{exercise.muscle}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="notes-card">
        <label className="field-label" htmlFor="workout-notes">Workout notes</label>
        <textarea
          id="workout-notes"
          placeholder="Energy, injuries, PRs, form cues..."
          value={workout.notes || ''}
          onChange={(event) => updateWorkoutNotes(event.target.value)}
        />
      </section>

      <button type="button" className="secondary-button" onClick={onSaveTemplate}>
        <CopyPlus size={16} strokeWidth={2.4} />
        Save as Template
      </button>
      <button type="button" className="finish-button" onClick={onFinish}>
        Finish workout
      </button>
    </div>
  );
}

function SaveStatusPill({ status }) {
  const statusConfig = {
    saving: { label: 'Saving', Icon: Save },
    saved: { label: 'Saved', Icon: CheckCircle2 },
    pending: { label: 'Offline changes pending', Icon: CircleAlert },
    idle: { label: 'Draft ready', Icon: ClipboardList },
  };
  const { label, Icon } = statusConfig[status] || statusConfig.idle;
  return (
    <div className={`save-status ${status || 'idle'}`}>
      <Icon size={15} strokeWidth={2.3} />
      <span>{label}</span>
    </div>
  );
}

function HistoryScreen({ workouts, onOpenWorkout, onDeleteWorkout, onRenameExercise }) {
  const [expanded, setExpanded] = useState(null);
  const [swipedId, setSwipedId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(HISTORY_PAGE_SIZE);
  const touchStartX = useRef(0);
  const ordered = [...workouts].sort((a, b) => getWorkoutTime(b) - getWorkoutTime(a));
  const visibleWorkouts = ordered.slice(0, visibleCount);

  const handleTouchStart = (event, workoutId) => {
    touchStartX.current = event.changedTouches[0]?.clientX || 0;
    if (swipedId && swipedId !== workoutId) setSwipedId(null);
  };

  const handleTouchEnd = (event, workoutId) => {
    const endX = event.changedTouches[0]?.clientX || 0;
    const delta = endX - touchStartX.current;
    if (delta < -50) setSwipedId(workoutId);
    if (delta > 40) setSwipedId(null);
  };

  return (
    <div className="screen stack-md">
      <header className="panel-header">
        <div className="panel-copy">
          <h2>History</h2>
          <p>Your saved workouts by day, time, and type.</p>
        </div>
      </header>
      {!ordered.length ? (
        <div className="empty-panel">
          <Dumbbell size={28} strokeWidth={2.2} />
          <strong>No workouts saved yet.</strong>
          <p>Finish your first workout and it will show up here with sets, notes, and copy actions.</p>
        </div>
      ) : null}
      {visibleWorkouts.map((workout) => {
        const isOpen = expanded === workout.id;
        const TypeIcon = CATEGORY_ICONS[workout.type] || Dumbbell;
        return (
          <div key={workout.id} className={`history-row ${swipedId === workout.id ? 'swiped' : ''}`}>
            <button
              type="button"
              className="history-delete"
              onClick={() => {
                if (expanded === workout.id) setExpanded(null);
                setSwipedId(null);
                onDeleteWorkout(workout.id);
              }}
            >
              <Trash2 size={18} strokeWidth={2.4} />
              <span>Delete</span>
            </button>
            <section
              className="history-card"
              onTouchStart={(event) => handleTouchStart(event, workout.id)}
              onTouchEnd={(event) => handleTouchEnd(event, workout.id)}
            >
              <button type="button" className="history-summary" onClick={() => setExpanded(isOpen ? null : workout.id)}>
                <div>
                  <strong>
                    <TypeIcon size={17} strokeWidth={2.2} />
                    {formatShortDate(workout.date)} - {workout.label}
                  </strong>
                  <p className="history-time">
                    {workout.type}
                    {formatTime(workout.startedAt) ? ` - ${formatTime(workout.startedAt)}` : ''}
                  </p>
                  <p className="history-meta">
                    {workout.exercises.map((exercise) => exercise.name || 'Untitled').slice(0, 3).join(' - ')}
                  </p>
                </div>
                <span>{isOpen ? '-' : '+'}</span>
              </button>
              {isOpen ? (
                <div className="history-details">
                  {workout.exercises.map((exercise) => (
                    <div key={exercise.id} className="history-exercise">
                      <div className="history-exercise-head">
                        <h3>{exercise.name || 'Untitled Exercise'}</h3>
                        <button
                          type="button"
                          className="mini-icon-button"
                          aria-label={`Rename ${exercise.name || 'exercise'}`}
                          onClick={() => onRenameExercise(exercise.name)}
                        >
                          <SquarePen size={15} strokeWidth={2.2} />
                        </button>
                      </div>
                      <p>
                        {exercise.sets
                          .filter((set) => set.weight !== '' && set.reps !== '')
                          .map(formatSetSummary)
                          .join(', ') || 'No completed sets'}
                      </p>
                    </div>
                  ))}
                  {workout.notes ? <p className="history-notes">{workout.notes}</p> : null}
                  <button type="button" className="text-link danger-link" onClick={() => onOpenWorkout(workout.id)}>
                    Copy into a new workout
                  </button>
                </div>
              ) : null}
            </section>
          </div>
        );
      })}
      {visibleCount < ordered.length ? (
        <button type="button" className="secondary-button" onClick={() => setVisibleCount((count) => count + HISTORY_PAGE_SIZE)}>
          Load more history
        </button>
      ) : null}
    </div>
  );
}

function TemplatesScreen({ templates, onStartTemplate, onDeleteTemplate }) {
  const ordered = [...templates].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  return (
    <div className="screen stack-md">
      <header className="panel-header">
        <div className="panel-copy">
          <h2>Templates</h2>
          <p>Start repeat workouts with the same exercise order and set layout.</p>
        </div>
      </header>
      {!ordered.length ? (
        <div className="empty-panel">
          <ClipboardList size={28} strokeWidth={2.2} />
          <strong>No templates saved yet.</strong>
          <p>Open an active workout and save it as a template once the exercise list looks right.</p>
        </div>
      ) : null}
      {ordered.map((template) => (
        <section key={template.id} className="template-card">
          <div className="template-copy">
            <strong>{template.name}</strong>
            <p>
              {(template.exercises || []).length} exercises
              {template.lastUsedAt ? ` - Last used ${formatShortDate(template.lastUsedAt.slice(0, 10))}` : ''}
            </p>
            <p className="history-meta">
              {(template.exercises || []).map((exercise) => exercise.name || 'Untitled').slice(0, 4).join(' - ')}
            </p>
          </div>
          <div className="template-actions">
            <button type="button" className="primary-button small" onClick={() => onStartTemplate(template.id)}>
              <Play size={16} strokeWidth={2.4} />
              Start
            </button>
            <button type="button" className="icon-button danger" onClick={() => onDeleteTemplate(template.id)} aria-label={`Delete ${template.name}`}>
              <Trash2 size={16} strokeWidth={2.2} />
            </button>
          </div>
        </section>
      ))}
    </div>
  );
}

function ChartsScreen({ workouts }) {
  const [category, setCategory] = useState('All');
  const [exerciseName, setExerciseName] = useState('');
  const [rangeId, setRangeId] = useState('90');
  const [metric, setMetric] = useState('maxWeight');
  const exerciseOptions = useMemo(() => getExerciseOptions(workouts, null, category), [workouts, category]);
  const points = useMemo(
    () => getChartSeries(workouts, { category, exerciseName, rangeId, metric }),
    [workouts, category, exerciseName, rangeId, metric],
  );
  const selectedMetric = CHART_METRICS.find((item) => item.id === metric) || CHART_METRICS[0];

  return (
    <div className="screen stack-md">
      <header className="panel-header">
        <div className="panel-copy">
          <h2>Charts</h2>
          <p>Graph workout categories, specific exercises, and the metrics that matter.</p>
        </div>
      </header>
      {!workouts.length ? (
        <div className="empty-panel">
          <TrendingUp size={28} strokeWidth={2.2} />
          <strong>No chart data yet.</strong>
          <p>Save a workout first to unlock progress graphs.</p>
        </div>
      ) : (
        <>
          <section className="chart-controls">
            <div className="control-block">
              <span><ListFilter size={15} strokeWidth={2.2} /> Category</span>
              <div className="filter-row">
                {['All', ...CATEGORY_ORDER].map((item) => {
                  const Icon = CATEGORY_ICONS[item] || Activity;
                  return (
                    <button
                      key={item}
                      type="button"
                      className={`segmented-chip ${category === item ? 'active' : ''}`}
                      onClick={() => {
                        setCategory(item);
                        setExerciseName('');
                      }}
                    >
                      <Icon size={14} strokeWidth={2.3} />
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="control-grid">
              <label>
                <span><Dumbbell size={15} strokeWidth={2.2} /> Exercise</span>
                <select value={exerciseName} onChange={(event) => setExerciseName(event.target.value)} className="select-input">
                  <option value="">All matching workouts</option>
                  {exerciseOptions.map((exercise) => (
                    <option key={exercise.name} value={exercise.name}>
                      {exercise.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span><Flame size={15} strokeWidth={2.2} /> Metric</span>
                <select value={metric} onChange={(event) => setMetric(event.target.value)} className="select-input">
                  {CHART_METRICS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="control-block">
              <span><CalendarRange size={15} strokeWidth={2.2} /> Range</span>
              <div className="filter-row">
                {DATE_RANGES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`segmented-chip ${rangeId === item.id ? 'active' : ''}`}
                    onClick={() => setRangeId(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
          <section className="chart-card">
            <div className="chart-title-row">
              <div>
                <strong>{selectedMetric.label}</strong>
                <p>{exerciseName || `${category} workouts`}</p>
              </div>
              <span>{points.length} points</span>
            </div>
            {points.length ? (
              <MiniChart points={points} metricLabel={selectedMetric.label} />
            ) : (
              <div className="empty-panel compact">
                <Activity size={24} strokeWidth={2.2} />
                <strong>No matching data.</strong>
                <p>Try a wider date range, another category, or all exercises.</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function MiniChart({ points, metricLabel }) {
  const width = 360;
  const height = 230;
  const pad = 28;
  const max = Math.max(...points.map((point) => point.value));
  const min = Math.min(...points.map((point) => point.value));
  const range = Math.max(max - min, 1);
  const stepX = (width - pad * 2) / Math.max(points.length - 1, 1);

  const coords = points.map((point, index) => {
    const x = pad + index * stepX;
    const y = height - pad - ((point.value - min) / range) * (height - pad * 2);
    return { ...point, x, y };
  });

  const path = coords.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label={`${metricLabel} progress chart`}>
        <path d={path} fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round" />
        {coords.map((point) => (
          <g key={`${point.date}-${point.value}`}>
            <circle cx={point.x} cy={point.y} r="4.5" fill="#e5484d" />
            <text x={point.x} y={point.y - 10} textAnchor="middle" className="chart-point-label">
              {Math.round(point.value)}
            </text>
            <text x={point.x} y={height - 6} textAnchor="middle" className="chart-axis-label">
              {formatShortDate(point.date).replace(/, \d{4}/, '')}
            </text>
          </g>
        ))}
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff6b6b" />
            <stop offset="100%" stopColor="#e5484d" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function BackupScreen({ workouts, templates, onImport, onReset }) {
  const exportData = () => {
    const blob = new Blob([JSON.stringify({ workouts, templates }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gym-log-backup-${todayValue()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    onImport(text);
    event.target.value = '';
  };

  return (
    <div className="screen stack-md">
      <header className="panel-header">
        <div className="panel-copy">
          <h2>Backup</h2>
          <p>Keep a copy of your workouts in case this phone or browser data ever gets reset.</p>
        </div>
      </header>
      <section className="backup-card">
        <div className="backup-copy">
          <p>Your workouts are saved in this browser on this device, so they should stay here as long as you keep using the same iPhone and browser and do not clear website data.</p>
          <p>Export creates a backup JSON file you can keep in Files or iCloud. Import restores workouts from that file if you ever lose local browser data or move to another device.</p>
          <p>Clearing Safari website data, removing browser app data, or switching phones without restoring that browser data can remove your saved workouts. Normal app updates and page refreshes should not delete them.</p>
        </div>
        <div className="backup-actions">
          <button type="button" className="primary-button" onClick={exportData}>
            <FileArchive size={18} strokeWidth={2.2} />
            Export data
          </button>
          <label className="file-button">
            <FileUp size={18} strokeWidth={2.2} />
            Import data
            <input type="file" accept="application/json" onChange={handleImport} />
          </label>
        </div>
        <div className="warning-card">
          <strong>Warning</strong>
          <p>Reset deletes every saved workouts on this device. Export a backup first if you may need your history later.</p>
        </div>
        <button type="button" className="text-link danger-link reset-link" onClick={onReset}>
          Reset all local data
        </button>
      </section>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('Workout');
  const [workouts, setWorkouts] = useState(() => readData().workouts);
  const [workoutTemplates, setWorkoutTemplates] = useState(() => readTemplates());
  const [activeWorkout, setActiveWorkout] = useState(() => readActiveWorkout());
  const [saveStatus, setSaveStatus] = useState(() => (readActiveWorkout() ? 'saved' : 'idle'));
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_REST_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const [timerEndsAt, setTimerEndsAt] = useState(null);
  const [confettiBursts, setConfettiBursts] = useState([]);
  const autosaveTimerRef = useRef(null);

  useEffect(() => {
    saveData({ workouts });
  }, [workouts]);

  useEffect(() => {
    saveTemplates(workoutTemplates);
  }, [workoutTemplates]);

  const exerciseRecords = useMemo(() => calculateExerciseRecords(workouts), [workouts]);
  const lastPerformanceMap = useMemo(() => getLastPerformanceMap(workouts), [workouts]);

  useEffect(() => {
    if (!activeWorkout) {
      if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current);
      saveActiveWorkout(null);
      setSaveStatus('idle');
      return undefined;
    }

    setSaveStatus(navigator.onLine === false ? 'pending' : 'saving');
    if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = window.setTimeout(() => {
      saveActiveWorkout(activeWorkout);
      setSaveStatus(navigator.onLine === false ? 'pending' : 'saved');
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current);
    };
  }, [activeWorkout]);

  useEffect(() => {
    const syncOnlineStatus = () => {
      if (!activeWorkout) return;
      setSaveStatus(navigator.onLine === false ? 'pending' : 'saved');
    };
    window.addEventListener('online', syncOnlineStatus);
    window.addEventListener('offline', syncOnlineStatus);
    return () => {
      window.removeEventListener('online', syncOnlineStatus);
      window.removeEventListener('offline', syncOnlineStatus);
    };
  }, [activeWorkout]);

  useEffect(() => {
    const flushDraft = () => {
      if (activeWorkout) saveActiveWorkout(activeWorkout);
    };
    const flushWhenHidden = () => {
      if (document.visibilityState === 'hidden') flushDraft();
    };
    window.addEventListener('pagehide', flushDraft);
    window.addEventListener('beforeunload', flushDraft);
    document.addEventListener('visibilitychange', flushWhenHidden);
    return () => {
      window.removeEventListener('pagehide', flushDraft);
      window.removeEventListener('beforeunload', flushDraft);
      document.removeEventListener('visibilitychange', flushWhenHidden);
    };
  }, [activeWorkout]);

  useEffect(() => {
    if (!timerActive || !timerEndsAt) return undefined;

    const syncTimer = () => {
      const remainingSeconds = Math.max(0, Math.ceil((timerEndsAt - Date.now()) / 1000));
      if (remainingSeconds <= 0) {
        setTimerActive(false);
        setTimerEndsAt(null);
        setSecondsLeft(DEFAULT_REST_SECONDS);
        return;
      }
      setSecondsLeft(remainingSeconds);
    };

    syncTimer();
    const interval = window.setInterval(() => {
      syncTimer();
    }, 1000);

    document.addEventListener('visibilitychange', syncTimer);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', syncTimer);
    };
  }, [timerActive, timerEndsAt]);

  const startWorkout = (type, customName = '') => {
    setActiveWorkout(createWorkout(type, customName, workouts));
    setTab('Workout');
    setTimerActive(false);
    setTimerEndsAt(null);
    setSecondsLeft(DEFAULT_REST_SECONDS);
  };

  const startTemplateWorkout = (templateId) => {
    const template = workoutTemplates.find((item) => item.id === templateId);
    if (!template) return;
    if (hasWorkoutContent(activeWorkout) && !window.confirm('Start this template and replace your unfinished workout draft?')) return;
    setActiveWorkout(createWorkoutFromTemplate(template));
    setWorkoutTemplates((current) =>
      current.map((item) => (item.id === templateId ? { ...item, lastUsedAt: nowValue() } : item)),
    );
    setTab('Workout');
    setTimerActive(false);
    setTimerEndsAt(null);
    setSecondsLeft(DEFAULT_REST_SECONDS);
  };

  const saveActiveWorkoutAsTemplate = () => {
    if (!activeWorkout) return;
    if (!hasTemplateExercises(activeWorkout)) {
      window.alert('Add at least one named exercise before saving a template.');
      return;
    }
    const defaultName = `${activeWorkout.label || activeWorkout.type || 'Workout'} Template`;
    const templateName = window.prompt('Template name:', defaultName)?.trim();
    if (!templateName) return;
    const nextTemplate = createTemplateFromWorkout(activeWorkout, templateName);
    setWorkoutTemplates((current) => [nextTemplate, ...current]);
    setTab('Templates');
  };

  const deleteTemplate = (templateId) => {
    const template = workoutTemplates.find((item) => item.id === templateId);
    if (!window.confirm(`Delete ${template?.name || 'this template'}?`)) return;
    setWorkoutTemplates((current) => current.filter((item) => item.id !== templateId));
  };

  const finishWorkout = () => {
    if (!activeWorkout) return;
    if (!hasWorkoutContent(activeWorkout)) {
      setActiveWorkout(null);
      saveActiveWorkout(null);
      return;
    }
    const completedWorkout = { ...activeWorkout, completedAt: nowValue() };
    setWorkouts((current) => {
      const withoutDraftDuplicate = current.filter((workout) => workout.id !== completedWorkout.id);
      return [completedWorkout, ...withoutDraftDuplicate];
    });
    setActiveWorkout(null);
    saveActiveWorkout(null);
    setTimerActive(false);
    setTimerEndsAt(null);
    setSecondsLeft(DEFAULT_REST_SECONDS);
    setTab('History');
  };

  const importText = (text) => {
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed.workouts)) throw new Error('Invalid backup file');
      setWorkouts(parsed.workouts);
      if (Array.isArray(parsed.templates)) setWorkoutTemplates(parsed.templates);
      setActiveWorkout(null);
      saveActiveWorkout(null);
      setTab('History');
    } catch {
      window.alert('Could not import that backup file.');
    }
  };

  const copyWorkoutToActive = (workoutId) => {
    const source = workouts.find((item) => item.id === workoutId);
    if (!source) return;
    setActiveWorkout({
      ...source,
      id: createId(),
      date: todayValue(),
      startedAt: nowValue(),
      exercises: source.exercises.map((exercise) => ({
        ...exercise,
        id: createId(),
        sets: exercise.sets.map((set) => ({ ...set, id: createId() })),
      })),
      notes: source.notes || '',
    });
    setTab('Workout');
    setTimerActive(false);
    setTimerEndsAt(null);
    setSecondsLeft(DEFAULT_REST_SECONDS);
  };

  const deleteWorkout = (workoutId) => {
    const target = workouts.find((workout) => workout.id === workoutId);
    if (!window.confirm(`Delete ${target?.label || 'this workout'} from history?`)) return;
    setWorkouts((current) => current.filter((workout) => workout.id !== workoutId));
  };

  const renameExerciseEverywhere = (previousName) => {
    const oldName = String(previousName || '').trim();
    if (!oldName) return;

    const nextName = window.prompt(`Rename "${oldName}" to:`, oldName)?.trim();
    if (!nextName || nextName === oldName) return;

    const applyRename = (exercise) =>
      normalizeName(exercise.name) === normalizeName(oldName) ? { ...exercise, name: nextName } : exercise;

    setWorkouts((current) =>
      current.map((workout) => ({
        ...workout,
        exercises: workout.exercises.map(applyRename),
      })),
    );

    setActiveWorkout((current) =>
      current
        ? {
            ...current,
            exercises: current.exercises.map(applyRename),
          }
        : current,
    );
  };

  const celebrateSet = (target) => {
    const rect = target?.getBoundingClientRect?.();
    const burst = {
      id: createId(),
      x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
      y: rect ? rect.top + rect.height / 2 : 180,
    };

    setConfettiBursts((current) => [...current, burst]);
    window.setTimeout(() => {
      setConfettiBursts((current) => current.filter((item) => item.id !== burst.id));
    }, 1100);
  };

  const resetData = () => {
    if (!window.confirm('Delete all saved workouts from this device? This cannot be undone unless you exported a backup first.')) return;
    setWorkouts([]);
    setWorkoutTemplates([]);
    setActiveWorkout(null);
    saveActiveWorkout(null);
    setTimerActive(false);
    setTimerEndsAt(null);
    setSecondsLeft(DEFAULT_REST_SECONDS);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(WORKOUT_TEMPLATES_KEY);
    setTab('Workout');
  };

  const changeWorkout = () => {
    if (hasWorkoutContent(activeWorkout) && !window.confirm('Discard this unfinished workout and choose another?')) return;
    setActiveWorkout(null);
    saveActiveWorkout(null);
  };

  const content =
    tab === 'Workout' ? (
      activeWorkout ? (
        <ActiveWorkoutScreen
          workout={activeWorkout}
          workouts={workouts}
          saveStatus={saveStatus}
          exerciseRecords={exerciseRecords}
          lastPerformanceMap={lastPerformanceMap}
          onUpdate={(nextWorkout) => (nextWorkout === null ? changeWorkout() : setActiveWorkout(nextWorkout))}
          onFinish={finishWorkout}
          onSaveTemplate={saveActiveWorkoutAsTemplate}
          timerActive={timerActive}
          secondsLeft={secondsLeft}
          onCelebrate={celebrateSet}
          onResetTimer={() => {
            const nextEnd = Date.now() + DEFAULT_REST_SECONDS * 1000;
            setSecondsLeft(DEFAULT_REST_SECONDS);
            setTimerEndsAt(nextEnd);
            setTimerActive(true);
          }}
        />
      ) : (
        <ChooseWorkoutScreen onStart={startWorkout} />
      )
    ) : tab === 'History' ? (
      <HistoryScreen
        workouts={workouts}
        onOpenWorkout={copyWorkoutToActive}
        onDeleteWorkout={deleteWorkout}
        onRenameExercise={renameExerciseEverywhere}
      />
    ) : tab === 'Templates' ? (
      <TemplatesScreen
        templates={workoutTemplates}
        onStartTemplate={startTemplateWorkout}
        onDeleteTemplate={deleteTemplate}
      />
    ) : tab === 'Charts' ? (
      <ChartsScreen workouts={workouts} />
    ) : (
      <BackupScreen workouts={workouts} templates={workoutTemplates} onImport={importText} onReset={resetData} />
    );

  return (
    <div className="app-shell">
      <ConfettiLayer bursts={confettiBursts} />
      {content}
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
}

