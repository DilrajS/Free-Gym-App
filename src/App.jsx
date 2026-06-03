import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowDownLeft,
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
  Info,
  ListFilter,
  MoveHorizontal,
  Footprints,
  Play,
  Plus,
  Save,
  Search,
  Shield,
  SquarePen,
  Timer,
  Trash2,
  TrendingUp,
  Users,
  Target,
  X,
} from 'lucide-react';

const STORAGE_KEY = 'gym-log-v2';
const ACTIVE_WORKOUT_KEY = `${STORAGE_KEY}-active-workout`;
const WORKOUT_TEMPLATES_KEY = `${STORAGE_KEY}-templates`;
const TABS = ['Workout', 'Templates', 'History', 'Charts', 'Backup'];
const CATEGORY_ORDER = ['Push', 'Pull', 'Upper', 'Legs', 'Full Body', 'Core', 'Cardio', 'Custom'];
const TEMPLATE_ORDER = ['Push', 'Pull', 'Upper', 'Legs', 'Full Body', 'Core', 'Cardio'];
const CHART_METRIC_DEFINITIONS = {
  sessions: { id: 'sessions', label: 'Sessions' },
  maxWeight: { id: 'maxWeight', label: 'Max weight' },
  estimated1rm: { id: 'estimated1rm', label: 'Estimated 1RM' },
  volume: { id: 'volume', label: 'Volume' },
  sets: { id: 'sets', label: 'Sets' },
  reps: { id: 'reps', label: 'Reps' },
  distance: { id: 'distance', label: 'Distance' },
  totalTime: { id: 'totalTime', label: 'Time' },
  bestTime: { id: 'bestTime', label: 'Best time' },
  pace: { id: 'pace', label: 'Pace' },
};
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
  Legs: ['Back Squat', 'Leg Press', 'Romanian Deadlift', 'Leg Extension', 'Standing Calf Raise'],
  'Full Body': ['Back Squat', 'Bench Press', 'Deadlift', 'Pull Up', 'Farmer Carry'],
  Core: ['Plank', 'Cable Crunch', 'Hanging Knee Raise', 'Dead Bug', 'Pallof Press'],
  Cardio: ['Treadmill Run', 'Stationary Bike', 'Rowing Machine', 'Stair Climber', 'Incline Walk'],
};
const DEFAULT_REST_SECONDS = 120;
const HISTORY_PAGE_SIZE = 12;

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
  { name: 'Back Squat', muscle: 'Quads', type: 'Legs', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Front Squat', muscle: 'Quads', type: 'Legs', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Leg Press', muscle: 'Quads', type: 'Legs', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Leg Extension', muscle: 'Quads', type: 'Legs', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Romanian Deadlift', muscle: 'Hamstrings', type: 'Legs', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Leg Curl', muscle: 'Hamstrings', type: 'Legs', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Hip Thrust', muscle: 'Glutes', type: 'Legs', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Cable Kickback', muscle: 'Glutes', type: 'Legs', equipment: 'Cable', tracking: 'weight/reps' },
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
  Push: Target,
  Pull: ArrowDownLeft,
  Upper: Users,
  Legs: Footprints,
  'Full Body': MoveHorizontal,
  Core: Shield,
  Cardio: Bike,
  Custom: SquarePen,
};

const CATEGORY_BADGES = {
  Push: 'push',
  Pull: 'pull',
  Upper: 'upper',
  Legs: 'legs',
  'Full Body': 'full-body',
  Core: 'core',
  Cardio: 'cardio',
  Custom: 'custom',
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

function normalizeWorkoutType(type) {
  const value = String(type || '').trim();
  if (!value) return 'Custom';
  return value === 'Lower' ? 'Legs' : value;
}

function normalizeTracking(tracking) {
  const value = String(tracking || '').trim();
  return ['weight/reps', 'bodyweight', 'time', 'distance/time'].includes(value) ? value : 'weight/reps';
}

function formatNumber(value, fractionDigits = 0) {
  if (!Number.isFinite(value)) return '';
  return value.toLocaleString(undefined, { maximumFractionDigits: fractionDigits });
}

function parseNumericValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDurationSeconds(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  if (/^\d+:\d{1,2}(:\d{1,2})?$/.test(text)) {
    const parts = text.split(':').map(Number);
    return parts.reduce((total, part) => total * 60 + part, 0);
  }
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '';
  const wholeSeconds = Math.round(seconds);
  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const secs = wholeSeconds % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function formatDistance(value) {
  const numeric = parseNumericValue(value);
  if (!Number.isFinite(numeric)) return '';
  return formatNumber(numeric, numeric % 1 === 0 ? 0 : 2);
}

function getTrackingConfig(tracking) {
  const normalizedTracking = normalizeTracking(tracking);
  if (normalizedTracking === 'bodyweight') {
    return {
      tracking: normalizedTracking,
      metricIds: ['sessions', 'sets', 'reps'],
      fields: [{ key: 'reps', label: 'Reps', placeholder: '8', inputMode: 'numeric', type: 'number', previousKey: 'previousReps' }],
    };
  }
  if (normalizedTracking === 'time') {
    return {
      tracking: normalizedTracking,
      metricIds: ['sessions', 'bestTime', 'totalTime'],
      fields: [{ key: 'duration', label: 'Time', placeholder: '0:45', inputMode: 'text', type: 'text', previousKey: 'previousDuration' }],
    };
  }
  if (normalizedTracking === 'distance/time') {
    return {
      tracking: normalizedTracking,
      metricIds: ['sessions', 'distance', 'totalTime', 'pace'],
      fields: [
        { key: 'distance', label: 'Distance', placeholder: '1.5', inputMode: 'decimal', type: 'number', previousKey: 'previousDistance' },
        { key: 'duration', label: 'Time', placeholder: '15:00', inputMode: 'text', type: 'text', previousKey: 'previousDuration' },
      ],
    };
  }
  return {
    tracking: 'weight/reps',
    metricIds: ['sessions', 'maxWeight', 'estimated1rm', 'volume', 'reps', 'sets'],
    fields: [
      { key: 'weight', label: 'Weight (lb)', placeholder: '135', inputMode: 'decimal', type: 'number', previousKey: 'previousWeight' },
      { key: 'reps', label: 'Reps', placeholder: '8', inputMode: 'numeric', type: 'number', previousKey: 'previousReps' },
    ],
  };
}

function formatTrackingLabel(tracking) {
  const normalizedTracking = normalizeTracking(tracking);
  if (normalizedTracking === 'distance/time') return 'Distance + time';
  if (normalizedTracking === 'weight/reps') return 'Weight + reps';
  if (normalizedTracking === 'bodyweight') return 'Bodyweight';
  return 'Time';
}

function createSetForTracking(tracking, previousSet = {}) {
  return {
    id: createId(),
    weight: '',
    reps: '',
    distance: '',
    duration: '',
    previousWeight: previousSet.weight ?? '',
    previousReps: previousSet.reps ?? '',
    previousDistance: previousSet.distance ?? '',
    previousDuration: previousSet.duration ?? '',
  };
}

function createPrefilledSetForTracking(tracking, previousSet = {}) {
  const normalizedSet = normalizeSet(previousSet, tracking);
  return {
    ...createSetForTracking(tracking, normalizedSet),
    weight: normalizedSet.weight ?? '',
    reps: normalizedSet.reps ?? '',
    distance: normalizedSet.distance ?? '',
    duration: normalizedSet.duration ?? '',
  };
}

function normalizeSet(set = {}, tracking = 'weight/reps') {
  const normalizedTracking = normalizeTracking(tracking);
  const nextSet = {
    id: set.id || createId(),
    weight: set.weight ?? '',
    reps: set.reps ?? '',
    distance: set.distance ?? '',
    duration: set.duration ?? '',
    previousWeight: set.previousWeight ?? '',
    previousReps: set.previousReps ?? '',
    previousDistance: set.previousDistance ?? '',
    previousDuration: set.previousDuration ?? '',
  };

  if (normalizedTracking === 'time' && !nextSet.duration && nextSet.reps !== '') nextSet.duration = String(nextSet.reps);
  if (normalizedTracking === 'distance/time' && !nextSet.distance && nextSet.weight !== '') nextSet.distance = String(nextSet.weight);
  if (normalizedTracking === 'distance/time' && !nextSet.duration && nextSet.reps !== '') nextSet.duration = String(nextSet.reps);
  return nextSet;
}

function isSetComplete(set, tracking) {
  const normalizedTracking = normalizeTracking(tracking);
  if (normalizedTracking === 'bodyweight') return Number.isFinite(parseNumericValue(set.reps)) && parseNumericValue(set.reps) > 0;
  if (normalizedTracking === 'time') return Number.isFinite(parseDurationSeconds(set.duration)) && parseDurationSeconds(set.duration) > 0;
  if (normalizedTracking === 'distance/time') {
    return Number.isFinite(parseNumericValue(set.distance)) && parseNumericValue(set.distance) > 0
      && Number.isFinite(parseDurationSeconds(set.duration)) && parseDurationSeconds(set.duration) > 0;
  }
  return Number.isFinite(parseNumericValue(set.weight)) && parseNumericValue(set.weight) > 0
    && Number.isFinite(parseNumericValue(set.reps)) && parseNumericValue(set.reps) > 0;
}

function formatPace(distanceValue, durationValue) {
  const distance = parseNumericValue(distanceValue);
  const duration = parseDurationSeconds(durationValue);
  if (!Number.isFinite(distance) || distance <= 0 || !Number.isFinite(duration) || duration <= 0) return '';
  return `${formatDuration(duration / distance)}/mi`;
}

function formatSetSummary(set, tracking = 'weight/reps') {
  const normalizedTracking = normalizeTracking(tracking);
  if (!isSetComplete(set, normalizedTracking)) return '';
  if (normalizedTracking === 'bodyweight') {
    const addedWeight = parseNumericValue(set.weight);
    return addedWeight && addedWeight > 0
      ? `${formatNumber(parseNumericValue(set.reps))} reps (+${formatNumber(addedWeight, addedWeight % 1 === 0 ? 0 : 2)} lb)`
      : `${formatNumber(parseNumericValue(set.reps))} reps`;
  }
  if (normalizedTracking === 'time') return formatDuration(parseDurationSeconds(set.duration));
  if (normalizedTracking === 'distance/time') {
    const distanceText = formatDistance(set.distance);
    const durationText = formatDuration(parseDurationSeconds(set.duration));
    const paceText = formatPace(set.distance, set.duration);
    return paceText ? `${distanceText} mi / ${durationText}, Pace ${paceText}` : `${distanceText} mi / ${durationText}`;
  }
  return `${formatDistance(set.weight)} lb x ${formatNumber(parseNumericValue(set.reps))}`;
}

function formatPreviousSetSummary(set, tracking = 'weight/reps') {
  const normalizedTracking = normalizeTracking(tracking);
  if (!isSetComplete(set, normalizedTracking)) return '';
  if (normalizedTracking === 'weight/reps') {
    return `${formatDistance(set.weight)}×${formatNumber(parseNumericValue(set.reps))}`;
  }
  if (normalizedTracking === 'bodyweight') {
    const addedWeight = parseNumericValue(set.weight);
    return addedWeight && addedWeight > 0
      ? `${formatNumber(parseNumericValue(set.reps))} reps +${formatNumber(addedWeight, addedWeight % 1 === 0 ? 0 : 2)}`
      : `${formatNumber(parseNumericValue(set.reps))} reps`;
  }
  return formatSetSummary(set, normalizedTracking);
}

function getExerciseMeta(name) {
  const normalized = normalizeName(name);
  return EXERCISE_LIBRARY.find((exercise) => normalizeName(exercise.name) === normalized) || null;
}

function normalizeExercise(exercise = {}) {
  const meta = getExerciseMeta(exercise.name);
  const tracking = normalizeTracking(exercise.tracking || meta?.tracking || 'weight/reps');
  const normalizedSets = Array.isArray(exercise.sets)
    ? exercise.sets.map((set) => normalizeSet(set, tracking))
    : [];

  return {
    id: exercise.id || createId(),
    name: exercise.name || '',
    muscle: exercise.muscle || meta?.muscle || '',
    type: normalizeWorkoutType(exercise.type || meta?.type || ''),
    equipment: exercise.equipment || meta?.equipment || '',
    tracking,
    sets: normalizedSets.length ? normalizedSets : [createSetForTracking(tracking)],
  };
}

function createExercise(name = '', previousSets = []) {
  const populatedSets = previousSets
    .map((set) => normalizeSet(set, getExerciseMeta(name)?.tracking || 'weight/reps'))
    .filter((set) => isSetComplete(set, getExerciseMeta(name)?.tracking || 'weight/reps'));

  const meta = getExerciseMeta(name);
  const tracking = normalizeTracking(meta?.tracking || 'weight/reps');
  return normalizeExercise({
    name,
    muscle: meta?.muscle || '',
    type: normalizeWorkoutType(meta?.type || ''),
    equipment: meta?.equipment || '',
    tracking,
    sets: populatedSets.length
      ? populatedSets.map((set) => createPrefilledSetForTracking(tracking, set))
      : [createSetForTracking(tracking)],
  });
}

function normalizeWorkout(workout = {}) {
  const normalizedType = normalizeWorkoutType(workout.type);
  const normalizedLabel = workout.label === 'Lower' ? 'Legs' : workout.label || normalizedType;
  return {
    ...workout,
    id: workout.id || createId(),
    date: workout.date || todayValue(),
    startedAt: workout.startedAt || nowValue(),
    type: normalizedType,
    label: normalizedLabel,
    notes: workout.notes || '',
    exercises: Array.isArray(workout.exercises) ? workout.exercises.map((exercise) => normalizeExercise(exercise)) : [createExercise()],
  };
}

function normalizeTemplate(template = {}) {
  return {
    ...template,
    id: template.id || createId(),
    name: String(template.name || '').trim() || 'Workout Template',
    type: normalizeWorkoutType(template.type),
    label: template.label === 'Lower' ? 'Legs' : template.label || template.name || 'Workout Template',
    notes: template.notes || '',
    createdAt: template.createdAt || nowValue(),
    lastUsedAt: template.lastUsedAt || null,
    exercises: Array.isArray(template.exercises)
      ? template.exercises.map((exercise) => {
          const normalizedExercise = normalizeExercise(exercise);
          return {
            ...normalizedExercise,
            setCount: Math.max(exercise.setCount || normalizedExercise.sets.length || 1, 1),
          };
        })
      : [],
  };
}

function getTemplateForType(type, workouts) {
  const normalizedType = normalizeWorkoutType(type);
  if (normalizedType === 'Custom') return [{ name: 'Exercise 1', sets: [] }];

  const lastWorkoutOfType = [...workouts]
    .sort((a, b) => new Date(b.startedAt || b.date) - new Date(a.startedAt || a.date))
    .find((workout) => normalizeWorkoutType(workout.type) === normalizedType);

  if (lastWorkoutOfType?.exercises?.length) {
    const savedExercises = lastWorkoutOfType.exercises
      .map((exercise) => ({
        name: String(exercise.name || '').trim(),
        sets: Array.isArray(exercise.sets) ? exercise.sets : [],
      }))
      .filter((exercise) => exercise.name);

    if (savedExercises.length) return savedExercises;
  }

  return (TEMPLATES[normalizedType] || []).map((name) => ({ name, sets: [] }));
}

function createWorkout(type, customTitle = '', workouts = []) {
  const normalizedType = normalizeWorkoutType(type);
  const label = normalizedType === 'Custom' ? (customTitle.trim() || 'Custom Workout') : normalizedType;
  const template = getTemplateForType(normalizedType, workouts);
  return normalizeWorkout({
    id: createId(),
    date: todayValue(),
    startedAt: nowValue(),
    type: normalizedType,
    label,
    notes: '',
    exercises: template.map((exercise) => createExercise(exercise.name, exercise.sets)),
  });
}

function readData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { workouts: [] };
    const parsed = JSON.parse(raw);
    return { workouts: Array.isArray(parsed.workouts) ? parsed.workouts.map((workout) => normalizeWorkout(workout)) : [] };
  } catch {
    return { workouts: [] };
  }
}

function saveData(data) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      workouts: Array.isArray(data?.workouts) ? data.workouts.map((workout) => normalizeWorkout(workout)) : [],
    }),
  );
}

function readActiveWorkout() {
  try {
    const raw = localStorage.getItem(ACTIVE_WORKOUT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.id && Array.isArray(parsed.exercises) ? normalizeWorkout(parsed) : null;
  } catch {
    return null;
  }
}

function saveActiveWorkout(workout) {
  if (!workout) {
    localStorage.removeItem(ACTIVE_WORKOUT_KEY);
    return;
  }
  localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify({ ...normalizeWorkout(workout), updatedAt: nowValue() }));
}

function readTemplates() {
  try {
    const raw = localStorage.getItem(WORKOUT_TEMPLATES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((template) => template?.id && template?.name).map((template) => normalizeTemplate(template)) : [];
  } catch {
    return [];
  }
}

function saveTemplates(templates) {
  localStorage.setItem(
    WORKOUT_TEMPLATES_KEY,
    JSON.stringify(Array.isArray(templates) ? templates.map((template) => normalizeTemplate(template)) : []),
  );
}

function hasWorkoutContent(workout) {
  if (!workout) return false;
  if (String(workout.notes || '').trim()) return true;
  return (workout.exercises || []).some(
    (exercise) =>
      String(exercise.name || '').trim() ||
      (exercise.sets || []).some((set) => ['weight', 'reps', 'distance', 'duration'].some((key) => String(set?.[key] ?? '').trim())),
  );
}

function hasTemplateExercises(workout) {
  return (workout?.exercises || []).some((exercise) => String(exercise.name || '').trim());
}

function createTemplateFromWorkout(workout, name) {
  return normalizeTemplate({
    id: createId(),
    name: name.trim(),
    type: normalizeWorkoutType(workout.type || 'Custom'),
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
        type: normalizeWorkoutType(exercise.type || getExerciseMeta(exercise.name)?.type || ''),
        equipment: exercise.equipment || getExerciseMeta(exercise.name)?.equipment || '',
        tracking: normalizeTracking(exercise.tracking || getExerciseMeta(exercise.name)?.tracking || 'weight/reps'),
        setCount: Math.max((exercise.sets || []).length, 1),
        sets: (exercise.sets || []).map((set) => normalizeSet(set, exercise.tracking)),
      })),
  });
}

function createWorkoutFromTemplate(template) {
  const normalizedTemplate = normalizeTemplate(template);
  return normalizeWorkout({
    id: createId(),
    date: todayValue(),
    startedAt: nowValue(),
    type: normalizedTemplate.type || 'Custom',
    label: normalizedTemplate.name || normalizedTemplate.label || 'Template Workout',
    notes: normalizedTemplate.notes || '',
    templateId: normalizedTemplate.id,
    exercises: (normalizedTemplate.exercises || []).map((exercise) => ({
      id: createId(),
      name: exercise.name || '',
      muscle: exercise.muscle || getExerciseMeta(exercise.name)?.muscle || '',
      type: normalizeWorkoutType(exercise.type || getExerciseMeta(exercise.name)?.type || ''),
      equipment: exercise.equipment || getExerciseMeta(exercise.name)?.equipment || '',
      tracking: normalizeTracking(exercise.tracking || getExerciseMeta(exercise.name)?.tracking || 'weight/reps'),
      sets: Array.from(
        { length: Math.max((exercise.sets || []).length || exercise.setCount || 1, 1) },
        (_, index) => createSetForTracking(exercise.tracking, exercise.sets?.[index]),
      ),
    })),
  });
}

function findLastExerciseSets(workouts, currentWorkoutId, exerciseName) {
  const normalized = normalizeName(exerciseName);
  if (!normalized) return [];

  const prior = workouts
    .filter((workout) => workout.id !== currentWorkoutId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  for (const workout of prior) {
    for (const exercise of workout.exercises || []) {
      if (normalizeName(exercise.name) === normalized) {
        const completeSets = (exercise.sets || []).filter((set) => isSetComplete(set, exercise.tracking));
        if (!completeSets.length) return [];
        return completeSets;
      }
    }
  }

  return [];
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
  const normalizedCategory = normalizeWorkoutType(category);
  const library = EXERCISE_LIBRARY.filter((exercise) => normalizedCategory === 'All' || normalizeWorkoutType(exercise.type) === normalizedCategory);
  const used = collectExerciseNames(workouts, activeWorkout)
    .map((name) => getExerciseMeta(name) || { name, muscle: 'Custom', type: 'Custom', equipment: 'Custom', tracking: 'weight/reps' })
    .filter((exercise) => normalizedCategory === 'All' || normalizeWorkoutType(exercise.type) === normalizedCategory);
  const byName = new Map([...library, ...used].map((exercise) => [normalizeName(exercise.name), exercise]));
  return [...byName.values()].sort((a, b) => {
    const typeSort = CATEGORY_ORDER.indexOf(normalizeWorkoutType(a.type)) - CATEGORY_ORDER.indexOf(normalizeWorkoutType(b.type));
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
  const tracking = normalizeTracking(exercise.tracking);
  return (exercise.sets || []).reduce(
    (summary, set) => {
      if (!isSetComplete(set, tracking)) return summary;
      const weight = parseNumericValue(set.weight);
      const reps = parseNumericValue(set.reps);
      const distance = parseNumericValue(set.distance);
      const duration = parseDurationSeconds(set.duration);
      summary.sets += 1;
      if (tracking === 'weight/reps') {
        summary.reps += reps || 0;
        summary.volume += weight && reps ? weight * reps : 0;
        summary.maxWeight = Math.max(summary.maxWeight, weight || 0);
        summary.estimated1rm = Math.max(summary.estimated1rm, weight && reps ? estimateOneRepMax(weight, reps) : 0);
      }
      if (tracking === 'bodyweight') summary.reps += reps || 0;
      if (tracking === 'time') {
        summary.totalTime += duration || 0;
        summary.bestTime = Math.max(summary.bestTime, duration || 0);
      }
      if (tracking === 'distance/time') {
        summary.distance += distance || 0;
        summary.totalTime += duration || 0;
      }
      return summary;
    },
    { maxWeight: 0, estimated1rm: 0, volume: 0, sets: 0, reps: 0, distance: 0, totalTime: 0, bestTime: 0 },
  );
}

function getMetricValueFromSummary(summary, metric) {
  if (metric === 'pace') {
    return summary.distance > 0 && summary.totalTime > 0 ? summary.totalTime / summary.distance : 0;
  }
  if (metric === 'sessions') return summary.sets > 0 || summary.distance > 0 || summary.totalTime > 0 ? 1 : 0;
  return summary[metric] || 0;
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

function getCurrentSetPrs(set, exerciseRecords, tracking = 'weight/reps') {
  if (normalizeTracking(tracking) !== 'weight/reps') return [];
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
  if (estimated1rm && estimated1rm > exerciseRecords.estimated1rm) prs.push(`1RM: ${estimated1rm} lb`);
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
        const completeSets = (exercise.sets || []).filter((set) => isSetComplete(set, exercise.tracking));
        if (completeSets.length) map.set(normalized, completeSets.map((set) => formatPreviousSetSummary(set, exercise.tracking)).join(' • '));
      });
    });
  return map;
}

function getAvailableChartMetrics(workouts, category, exerciseName) {
  if (exerciseName) {
    const exercise = getExerciseOptions(workouts, null, category === 'All' ? 'All' : normalizeWorkoutType(category))
      .find((item) => normalizeName(item.name) === normalizeName(exerciseName));
    const metricIds = getTrackingConfig(exercise?.tracking || 'weight/reps').metricIds;
    return metricIds.map((metricId) => CHART_METRIC_DEFINITIONS[metricId]);
  }
  if (normalizeWorkoutType(category) === 'Cardio') {
    return ['sessions', 'distance', 'totalTime', 'pace'].map((metricId) => CHART_METRIC_DEFINITIONS[metricId]);
  }
  if (normalizeWorkoutType(category) === 'Core') {
    return ['sessions', 'sets', 'reps', 'totalTime'].map((metricId) => CHART_METRIC_DEFINITIONS[metricId]);
  }
  return ['sessions', 'sets', 'reps', 'volume', 'distance', 'totalTime'].map((metricId) => CHART_METRIC_DEFINITIONS[metricId]);
}

function getChartSeries(workouts, { category, exerciseName, rangeId, metric }) {
  const startTime = getRangeStart(rangeId);
  const normalized = normalizeName(exerciseName);
  const grouped = new Map();
  const normalizedCategory = normalizeWorkoutType(category);

  workouts
    .filter((workout) => {
      if (startTime && getWorkoutTime(workout) < startTime) return false;
      if (normalizedCategory !== 'All' && normalizeWorkoutType(workout.type) !== normalizedCategory) return false;
      return true;
    })
    .forEach((workout) => {
      const daily = grouped.get(workout.date) || { date: workout.date, value: 0, totalDistance: 0, totalTime: 0, sessions: 0 };
      const matchingExercises = (workout.exercises || []).filter((exercise) => !normalized || normalizeName(exercise.name) === normalized);

      if (metric === 'sessions') {
        if (matchingExercises.some((exercise) => summarizeExercise(exercise).sets > 0 || summarizeExercise(exercise).distance > 0 || summarizeExercise(exercise).totalTime > 0)) {
          daily.value += 1;
        }
        grouped.set(workout.date, daily);
        return;
      }

      matchingExercises.forEach((exercise) => {
        const summary = summarizeExercise(exercise);
        const metricValue = getMetricValueFromSummary(summary, metric);
        if (metric === 'maxWeight' || metric === 'estimated1rm' || metric === 'bestTime') {
          daily.value = Math.max(daily.value, metricValue);
        } else if (metric === 'pace') {
          daily.totalDistance += summary.distance;
          daily.totalTime += summary.totalTime;
          daily.value = daily.totalDistance > 0 ? daily.totalTime / daily.totalDistance : 0;
        } else {
          daily.value += metricValue;
        }
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

function getExerciseFieldConfig(exercise, showAddedWeight = false) {
  const tracking = normalizeTracking(exercise.tracking);
  const baseConfig = getTrackingConfig(tracking);
  if (tracking !== 'bodyweight') return baseConfig.fields;
  if (!showAddedWeight) return baseConfig.fields;
  return [
    ...baseConfig.fields,
    { key: 'weight', label: 'Added wt', placeholder: '25', inputMode: 'decimal', type: 'number', previousKey: 'previousWeight' },
  ];
}

function getSetGridStyle(fieldCount) {
  return { gridTemplateColumns: `40px repeat(${fieldCount}, minmax(0, 1fr)) 34px` };
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
  const tabLabels = {
    Charts: 'Progress',
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
            {tabLabels[item] || item}
          </button>
        );
      })}
    </nav>
  );
}

function ChooseWorkoutScreen({ onStart, draftWorkout, onResumeDraft, onDiscardDraft }) {
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
        {draftWorkout ? (
          <section className="template-card resume-card">
            <div className="template-copy">
              <strong>Resume workout</strong>
              <p>{draftWorkout.label || 'Unfinished workout'}</p>
              <p className="history-meta">{formatLongDate(draftWorkout.date)}</p>
            </div>
            <div className="template-actions">
              <button type="button" className="primary-button small" onClick={onResumeDraft}>
                <Play size={16} strokeWidth={2.4} />
                Resume
              </button>
              <button type="button" className="icon-button danger" onClick={onDiscardDraft} aria-label="Discard workout draft">
                <Trash2 size={16} strokeWidth={2.2} />
              </button>
            </div>
          </section>
        ) : null}
        {TEMPLATE_ORDER.map((item) => (
          <button key={item} type="button" className="workout-choice" onClick={() => onStart(item)}>
            <span className={`category-badge ${CATEGORY_BADGES[item] || ''}`}>
              {(() => {
                const Icon = CATEGORY_ICONS[item] || Dumbbell;
                return <Icon size={18} strokeWidth={2.4} />;
              })()}
            </span>
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
    <button type="button" className="timer-pill timer-pill-active" onClick={onReset} aria-label="Reset rest timer">
      <Timer size={15} strokeWidth={2.4} />
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
  const [bodyweightWeightVisible, setBodyweightWeightVisible] = useState({});
  const [exerciseFilter, setExerciseFilter] = useState(normalizeWorkoutType(workout.type) === 'Custom' ? 'All' : normalizeWorkoutType(workout.type));
  const [showOneRepMaxInfo, setShowOneRepMaxInfo] = useState(false);
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
    const nextTracking = normalizeTracking(meta?.tracking || 'weight/reps');
    onUpdate({
      ...workout,
      exercises: workout.exercises.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        const hasTypedSetValues = exercise.sets.some((set) =>
          ['weight', 'reps', 'distance', 'duration'].some((key) => String(set?.[key] ?? '').trim()),
        );
        const previousSets = !hasTypedSetValues ? findLastExerciseSets(workouts, workout.id, name) : [];
        return {
          ...exercise,
          name,
          muscle: meta?.muscle || exercise.muscle || '',
          type: normalizeWorkoutType(meta?.type || exercise.type || ''),
          equipment: meta?.equipment || exercise.equipment || '',
          tracking: nextTracking,
          sets: previousSets.length
            ? previousSets.map((set) => createPrefilledSetForTracking(nextTracking, set))
            : exercise.sets.map((set) => normalizeSet(set, nextTracking)),
        };
      }),
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
          sets: [...exercise.sets, createSetForTracking(exercise.tracking, previous)],
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
        return { ...exercise, sets: nextSets.length ? nextSets : [createSetForTracking(exercise.tracking)] };
      }),
    });
  };

  const addExercise = (name = '') => {
    const finalName = name.trim();
    const previousSets = findLastExerciseSets(workouts, workout.id, finalName);
    onUpdate({
      ...workout,
      exercises: [...workout.exercises, createExercise(finalName, previousSets)],
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

  const handleSetBlur = (exerciseId, setId, event) => {
    const exercise = workout.exercises.find((item) => item.id === exerciseId);
    const set = exercise?.sets.find((item) => item.id === setId);
    if (exercise && set && isSetComplete(set, exercise.tracking)) {
      onResetTimer();
      onCelebrate?.(event?.target);
    }
  };

  return (
    <div className="screen">
      <header className="session-header">
        <div className="session-title">
          <button type="button" className="back-link" onClick={() => onUpdate(null)}>
            <ArrowLeft size={16} strokeWidth={2.3} />
            Change workout
          </button>
          <h2>{workout.label}</h2>
          <p>{formatLongDate(workout.date)}</p>
        </div>
        <div className="session-pills">
          <TimerPill secondsLeft={secondsLeft} active={timerActive} onReset={onResetTimer} />
          <SaveStatusPill status={saveStatus} />
        </div>
      </header>

      <div className="exercise-stack">
        {workout.exercises.map((exercise, index) => {
          const lastTime = lastPerformanceMap.get(normalizeName(exercise.name));
          const meta = getExerciseMeta(exercise.name) || exercise;
          const records = exerciseRecords.get(normalizeName(exercise.name));
          const showAddedWeight = normalizeTracking(exercise.tracking) === 'bodyweight'
            && (bodyweightWeightVisible[exercise.id]
              || exercise.sets.some((set) => String(set.weight || set.previousWeight || '').trim()));
          const fields = getExerciseFieldConfig(exercise, showAddedWeight);
          const trackingLabel = formatTrackingLabel(exercise.tracking);
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
                    {[meta.muscle, meta.equipment, trackingLabel].filter(Boolean).map((item) => (
                      <span key={item} className="tiny-label">{item}</span>
                    ))}
                  </div>
                  <p className="last-time" title={lastTime ? `Previous: ${lastTime}` : 'Previous: no saved workout yet.'}>
                    {lastTime ? `Previous: ${lastTime}` : 'Previous: no saved workout yet.'}
                  </p>
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

              <div className="set-table-header" style={getSetGridStyle(fields.length)}>
                <span>Set</span>
                {fields.map((field) => (
                  <span key={field.key}>{field.label}</span>
                ))}
                <span />
              </div>

              {normalizeTracking(exercise.tracking) === 'bodyweight' && !showAddedWeight ? (
                <button
                  type="button"
                  className="text-link inline-link"
                  onClick={() => setBodyweightWeightVisible((current) => ({ ...current, [exercise.id]: true }))}
                >
                  Track added weight
                </button>
              ) : null}

              <div className="set-stack">
                {exercise.sets.map((set, setIndex) => (
                  <div key={set.id} className="set-row-wrap">
                    <div className="set-row" style={getSetGridStyle(fields.length)}>
                      <span className="set-number">{setIndex + 1}</span>
                      {fields.map((field) => (
                        <label key={field.key} className="set-field">
                          <span className="sr-only">{field.label}</span>
                          <input
                            inputMode={field.inputMode}
                            type={field.type}
                            placeholder={set[field.previousKey] || field.placeholder}
                            value={set[field.key] || ''}
                            onChange={(event) => updateSet(exercise.id, set.id, field.key, event.target.value)}
                            onBlur={(event) => handleSetBlur(exercise.id, set.id, event)}
                            className={[
                              set[field.previousKey] !== '' ? 'input-with-history' : '',
                              lastEditedFieldId === `${exercise.id}-${set.id}-${field.key}` ? 'last-edited-input' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          />
                        </label>
                      ))}
                      <button type="button" className="mini-icon-button" onClick={() => removeSet(exercise.id, set.id)} aria-label="Remove set">
                        <X size={16} strokeWidth={2.4} />
                      </button>
                    </div>
                    {normalizeTracking(exercise.tracking) === 'distance/time' && isSetComplete(set, exercise.tracking) ? (
                      <div className="set-subtext">Pace {formatPace(set.distance, set.duration)}</div>
                    ) : null}
                    {getCurrentSetPrs(set, records, exercise.tracking).length ? (
                      <div className="pr-row">
                        {getCurrentSetPrs(set, records, exercise.tracking).slice(0, 2).map((label) => (
                          label.startsWith('1RM:') ? (
                            <button
                              key={label}
                              type="button"
                              className="pr-pill pr-info-button"
                              onClick={() => setShowOneRepMaxInfo(true)}
                            >
                              {label}
                              <Info size={12} strokeWidth={2.4} />
                            </button>
                          ) : (
                            <span key={label} className="pr-pill">{label}</span>
                          )
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
        <label className="field-label" htmlFor="exercise-search">Add exercise</label>
        <div className="filter-row" aria-label="Exercise category filter">
          {['All', normalizeWorkoutType(workout.type), 'Push', 'Pull', 'Legs', 'Core', 'Cardio']
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
            id="exercise-search"
            type="text"
            placeholder="Search exercise"
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
              <small>{exercise.muscle} - {formatTrackingLabel(exercise.tracking)}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="notes-card">
        <label className="field-label" htmlFor="workout-notes">Notes</label>
        <textarea
          id="workout-notes"
          placeholder="How did this workout feel?"
          value={workout.notes || ''}
          onChange={(event) => updateWorkoutNotes(event.target.value)}
        />
      </section>

      <button type="button" className="secondary-button" onClick={onSaveTemplate}>
        <CopyPlus size={16} strokeWidth={2.4} />
        Save as template
      </button>
      <button type="button" className="finish-button" onClick={onFinish}>
        Finish workout
      </button>
      {showOneRepMaxInfo ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setShowOneRepMaxInfo(false)}>
          <div className="info-modal" role="dialog" aria-modal="true" aria-labelledby="one-rep-max-title" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-header">
              <h3 id="one-rep-max-title">Estimated 1RM</h3>
              <button type="button" className="sheet-close" aria-label="Close 1RM explanation" onClick={() => setShowOneRepMaxInfo(false)}>
                <X size={18} strokeWidth={2.4} />
              </button>
            </div>
            <p>Estimated 1RM means estimated one-rep max. It predicts the maximum weight you could lift for one repetition based on this set.</p>
          </div>
        </div>
      ) : null}
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
          <p>Saved workouts with sets and notes.</p>
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
        const displayType = normalizeWorkoutType(workout.type);
        const TypeIcon = CATEGORY_ICONS[displayType] || Dumbbell;
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
                    <span className={`category-badge small ${CATEGORY_BADGES[displayType] || ''}`}>
                      <TypeIcon size={12} strokeWidth={2.5} />
                    </span>
                    {formatShortDate(workout.date)} - {workout.label}
                  </strong>
                  <p className="history-time">
                    {displayType}
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
                          .filter((set) => isSetComplete(set, exercise.tracking))
                          .map((set) => formatSetSummary(set, exercise.tracking))
                          .filter(Boolean)
                          .join(', ') || 'No completed sets.'}
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
          <p>Start repeat workouts with the same exercise order.</p>
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
  const [metric, setMetric] = useState('sessions');
  const exerciseOptions = useMemo(() => getExerciseOptions(workouts, null, category), [workouts, category]);
  const availableMetrics = useMemo(
    () => getAvailableChartMetrics(workouts, category, exerciseName),
    [workouts, category, exerciseName],
  );
  const points = useMemo(
    () => getChartSeries(workouts, { category, exerciseName, rangeId, metric }),
    [workouts, category, exerciseName, rangeId, metric],
  );
  const selectedMetric = availableMetrics.find((item) => item.id === metric) || availableMetrics[0] || CHART_METRIC_DEFINITIONS.sessions;

  useEffect(() => {
    if (availableMetrics.some((item) => item.id === metric)) return;
    setMetric(availableMetrics[0]?.id || 'sessions');
  }, [availableMetrics, metric]);

  return (
    <div className="screen stack-md">
      <header className="panel-header">
        <div className="panel-copy">
          <h2>Charts</h2>
          <p>See progress with metrics that match each workout style.</p>
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
                      <span className={`category-badge small ${CATEGORY_BADGES[item] || ''}`}>
                        <Icon size={12} strokeWidth={2.4} />
                      </span>
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
                  {availableMetrics.map((item) => (
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
                <p>{exerciseName || `${normalizeWorkoutType(category)} workouts`}</p>
              </div>
              <span>{points.length} points</span>
            </div>
            {points.length ? (
              <MiniChart points={points} metricLabel={selectedMetric.label} metricId={selectedMetric.id} />
            ) : (
              <div className="empty-panel compact">
                <Activity size={24} strokeWidth={2.2} />
                <strong>No matching data.</strong>
                <p>Try another metric, more time, or a different exercise.</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function MiniChart({ points, metricLabel, metricId }) {
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

  const formatChartPoint = (value) => {
    if (metricId === 'pace' || metricId === 'totalTime' || metricId === 'bestTime') return formatDuration(value);
    if (metricId === 'distance') return `${formatNumber(value, value % 1 === 0 ? 0 : 2)} mi`;
    return Math.round(value);
  };

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label={`${metricLabel} progress chart`}>
        <path d={path} fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round" />
        {coords.map((point) => (
          <g key={`${point.date}-${point.value}`}>
            <circle cx={point.x} cy={point.y} r="4.5" fill="#e5484d" />
            <text x={point.x} y={point.y - 10} textAnchor="middle" className="chart-point-label">
              {formatChartPoint(point.value)}
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
          <p>Keep a copy of your workouts in case this browser data ever gets reset.</p>
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
          <p>Reset deletes every saved workout on this device. Export a backup first if you may need your history later.</p>
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
  const [showResumePrompt, setShowResumePrompt] = useState(() => Boolean(readActiveWorkout()));
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_REST_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const [timerEndsAt, setTimerEndsAt] = useState(null);
  const [confettiBursts, setConfettiBursts] = useState([]);

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
      saveActiveWorkout(null);
      setSaveStatus('idle');
      return undefined;
    }

    setSaveStatus(navigator.onLine === false ? 'pending' : 'saving');
    saveActiveWorkout(activeWorkout);
    setSaveStatus(navigator.onLine === false ? 'pending' : 'saved');
    return undefined;
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
    if (hasWorkoutContent(activeWorkout) && !window.confirm('Start a new workout and replace your unfinished draft?')) return;
    setActiveWorkout(createWorkout(type, customName, workouts));
    setShowResumePrompt(false);
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
    setShowResumePrompt(false);
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
      setShowResumePrompt(false);
      return;
    }
    const completedWorkout = { ...activeWorkout, completedAt: nowValue() };
    const nextWorkouts = [completedWorkout, ...workouts.filter((workout) => workout.id !== completedWorkout.id)];
    saveData({ workouts: nextWorkouts });
    setWorkouts(nextWorkouts);
    setActiveWorkout(null);
    saveActiveWorkout(null);
    setShowResumePrompt(false);
    setTimerActive(false);
    setTimerEndsAt(null);
    setSecondsLeft(DEFAULT_REST_SECONDS);
    setTab('History');
  };

  const importText = (text) => {
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed.workouts)) throw new Error('Invalid backup file');
      setWorkouts(parsed.workouts.map((workout) => normalizeWorkout(workout)));
      setWorkoutTemplates(Array.isArray(parsed.templates) ? parsed.templates.map((template) => normalizeTemplate(template)) : []);
      setActiveWorkout(null);
      saveActiveWorkout(null);
      setShowResumePrompt(false);
      setTab('History');
    } catch {
      window.alert('Could not import that backup file.');
    }
  };

  const copyWorkoutToActive = (workoutId) => {
    const source = workouts.find((item) => item.id === workoutId);
    if (!source) return;
    setActiveWorkout({
      ...normalizeWorkout(source),
      id: createId(),
      date: todayValue(),
      startedAt: nowValue(),
      exercises: source.exercises.map((exercise) => ({
        ...normalizeExercise(exercise),
        id: createId(),
        sets: exercise.sets.map((set) => ({ ...normalizeSet(set, exercise.tracking), id: createId() })),
      })),
      notes: source.notes || '',
    });
    setShowResumePrompt(false);
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
    setShowResumePrompt(false);
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
    setShowResumePrompt(false);
  };

  const content =
    tab === 'Workout' ? (
      activeWorkout && !showResumePrompt ? (
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
        <ChooseWorkoutScreen
          onStart={startWorkout}
          draftWorkout={activeWorkout}
          onResumeDraft={() => setShowResumePrompt(false)}
          onDiscardDraft={changeWorkout}
        />
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

