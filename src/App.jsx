import { useEffect, useMemo, useRef, useState } from 'react';
import MuscleBody from 'react-muscle-highlighter';
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
  Star,
  Timer,
  Trophy,
  Trash2,
  TrendingUp,
  Users,
  Target,
  X,
} from 'lucide-react';

const STORAGE_KEY = 'gym-log-v2';
const ACTIVE_WORKOUT_KEY = `${STORAGE_KEY}-active-workout`;
const WORKOUT_TEMPLATES_KEY = `${STORAGE_KEY}-templates`;
const FAVORITE_EXERCISES_KEY = `${STORAGE_KEY}-favorite-exercises`;
const WGER_MEDIA_CACHE_KEY = `${STORAGE_KEY}-wger-media`;
const APPLE_WATCH_REMINDER_KEY = `${STORAGE_KEY}-apple-watch-reminder`;
const RECOVERY_DAYS_KEY = `${STORAGE_KEY}-recovery-days`;
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
const MEDIA_SOURCES = ['library', 'generated', 'custom', 'user_photo'];
const MACHINE_PHOTO_SIZE = 256;
const WGER_EXERCISE_INFO_URL = 'https://wger.de/api/v2/exerciseinfo/?language=2&limit=400';
const WGER_MEDIA_CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 14;

const EXERCISE_LIBRARY = [
  { name: 'Bench Press', muscle: 'Chest', type: 'Push', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Dumbbell Bench Press', muscle: 'Chest', type: 'Push', equipment: 'Dumbbells', tracking: 'weight/reps' },
  { name: 'Incline DB Press', muscle: 'Chest', type: 'Push', equipment: 'Dumbbells', tracking: 'weight/reps' },
  { name: 'Incline Bench Press', muscle: 'Chest', type: 'Push', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Decline Bench Press', muscle: 'Chest', type: 'Push', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Chest Press Machine', muscle: 'Chest', type: 'Push', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Smith Machine Bench Press', muscle: 'Chest', type: 'Push', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Cable Fly', muscle: 'Chest', type: 'Push', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Pec Deck Fly', muscle: 'Chest', type: 'Push', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Cable Crossover', muscle: 'Chest', type: 'Push', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Dumbbell Pullover', muscle: 'Chest', type: 'Push', equipment: 'Dumbbell', tracking: 'weight/reps' },
  { name: 'Push Up', muscle: 'Chest', type: 'Push', equipment: 'Bodyweight', tracking: 'bodyweight' },
  { name: 'Incline Push Up', muscle: 'Chest', type: 'Push', equipment: 'Bodyweight', tracking: 'bodyweight' },
  { name: 'Chest Dip', muscle: 'Chest', type: 'Push', equipment: 'Bodyweight', tracking: 'bodyweight' },
  { name: 'Pull Up', muscle: 'Back', type: 'Pull', equipment: 'Bodyweight', tracking: 'bodyweight' },
  { name: 'Chin Up', muscle: 'Back', type: 'Pull', equipment: 'Bodyweight', tracking: 'bodyweight' },
  { name: 'Assisted Pull Up', muscle: 'Back', type: 'Pull', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Lat Pulldown', muscle: 'Back', type: 'Pull', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Close Grip Lat Pulldown', muscle: 'Back', type: 'Pull', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Straight Arm Pulldown', muscle: 'Back', type: 'Pull', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Barbell Row', muscle: 'Back', type: 'Pull', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'T-Bar Row', muscle: 'Back', type: 'Pull', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Chest Supported Row', muscle: 'Back', type: 'Pull', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Seated Cable Row', muscle: 'Back', type: 'Pull', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Single Arm DB Row', muscle: 'Back', type: 'Pull', equipment: 'Dumbbell', tracking: 'weight/reps' },
  { name: 'Machine Row', muscle: 'Back', type: 'Pull', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Inverted Row', muscle: 'Back', type: 'Pull', equipment: 'Bodyweight', tracking: 'bodyweight' },
  { name: 'Deadlift', muscle: 'Back', type: 'Pull', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Trap Bar Deadlift', muscle: 'Back', type: 'Pull', equipment: 'Trap Bar', tracking: 'weight/reps' },
  { name: 'Back Extension', muscle: 'Back', type: 'Pull', equipment: 'Machine', tracking: 'bodyweight' },
  { name: 'Shrug', muscle: 'Back', type: 'Pull', equipment: 'Dumbbells', tracking: 'weight/reps' },
  { name: 'Face Pull', muscle: 'Shoulders', type: 'Pull', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Shoulder Press', muscle: 'Shoulders', type: 'Push', equipment: 'Dumbbells', tracking: 'weight/reps' },
  { name: 'Overhead Press', muscle: 'Shoulders', type: 'Push', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Arnold Press', muscle: 'Shoulders', type: 'Push', equipment: 'Dumbbells', tracking: 'weight/reps' },
  { name: 'Machine Shoulder Press', muscle: 'Shoulders', type: 'Push', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Lateral Raise', muscle: 'Shoulders', type: 'Push', equipment: 'Dumbbells', tracking: 'weight/reps' },
  { name: 'Cable Lateral Raise', muscle: 'Shoulders', type: 'Push', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Front Raise', muscle: 'Shoulders', type: 'Push', equipment: 'Dumbbells', tracking: 'weight/reps' },
  { name: 'Rear Delt Fly', muscle: 'Shoulders', type: 'Pull', equipment: 'Dumbbells', tracking: 'weight/reps' },
  { name: 'Reverse Pec Deck', muscle: 'Shoulders', type: 'Pull', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Upright Row', muscle: 'Shoulders', type: 'Pull', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Bicep Curl', muscle: 'Biceps', type: 'Pull', equipment: 'Dumbbells', tracking: 'weight/reps' },
  { name: 'Barbell Curl', muscle: 'Biceps', type: 'Pull', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'EZ Bar Curl', muscle: 'Biceps', type: 'Pull', equipment: 'EZ Bar', tracking: 'weight/reps' },
  { name: 'Hammer Curl', muscle: 'Biceps', type: 'Pull', equipment: 'Dumbbells', tracking: 'weight/reps' },
  { name: 'Preacher Curl', muscle: 'Biceps', type: 'Pull', equipment: 'EZ Bar', tracking: 'weight/reps' },
  { name: 'Incline Dumbbell Curl', muscle: 'Biceps', type: 'Pull', equipment: 'Dumbbells', tracking: 'weight/reps' },
  { name: 'Cable Curl', muscle: 'Biceps', type: 'Pull', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Concentration Curl', muscle: 'Biceps', type: 'Pull', equipment: 'Dumbbell', tracking: 'weight/reps' },
  { name: 'Reverse Curl', muscle: 'Forearms', type: 'Pull', equipment: 'EZ Bar', tracking: 'weight/reps' },
  { name: 'Tricep Pushdown', muscle: 'Triceps', type: 'Push', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Rope Pushdown', muscle: 'Triceps', type: 'Push', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Overhead Tricep Extension', muscle: 'Triceps', type: 'Push', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Skull Crusher', muscle: 'Triceps', type: 'Push', equipment: 'EZ Bar', tracking: 'weight/reps' },
  { name: 'Close Grip Bench Press', muscle: 'Triceps', type: 'Push', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Dips', muscle: 'Triceps', type: 'Push', equipment: 'Bodyweight', tracking: 'bodyweight' },
  { name: 'Tricep Dip Machine', muscle: 'Triceps', type: 'Push', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Wrist Curl', muscle: 'Forearms', type: 'Pull', equipment: 'Dumbbells', tracking: 'weight/reps' },
  { name: 'Farmer Carry', muscle: 'Forearms', type: 'Full Body', equipment: 'Dumbbells', tracking: 'distance/time' },
  { name: 'Back Squat', muscle: 'Quads', type: 'Legs', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Front Squat', muscle: 'Quads', type: 'Legs', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Goblet Squat', muscle: 'Quads', type: 'Legs', equipment: 'Dumbbell', tracking: 'weight/reps' },
  { name: 'Hack Squat', muscle: 'Quads', type: 'Legs', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Smith Machine Squat', muscle: 'Quads', type: 'Legs', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Leg Press', muscle: 'Quads', type: 'Legs', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Leg Extension', muscle: 'Quads', type: 'Legs', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Walking Lunge', muscle: 'Quads', type: 'Legs', equipment: 'Dumbbells', tracking: 'weight/reps' },
  { name: 'Bulgarian Split Squat', muscle: 'Quads', type: 'Legs', equipment: 'Dumbbells', tracking: 'weight/reps' },
  { name: 'Step Up', muscle: 'Quads', type: 'Legs', equipment: 'Dumbbells', tracking: 'weight/reps' },
  { name: 'Romanian Deadlift', muscle: 'Hamstrings', type: 'Legs', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Stiff Leg Deadlift', muscle: 'Hamstrings', type: 'Legs', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Leg Curl', muscle: 'Hamstrings', type: 'Legs', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Seated Leg Curl', muscle: 'Hamstrings', type: 'Legs', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Lying Leg Curl', muscle: 'Hamstrings', type: 'Legs', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Nordic Hamstring Curl', muscle: 'Hamstrings', type: 'Legs', equipment: 'Bodyweight', tracking: 'bodyweight' },
  { name: 'Hip Thrust', muscle: 'Glutes', type: 'Legs', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Glute Bridge', muscle: 'Glutes', type: 'Legs', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Cable Kickback', muscle: 'Glutes', type: 'Legs', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Hip Abduction Machine', muscle: 'Glutes', type: 'Legs', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Hip Adduction Machine', muscle: 'Glutes', type: 'Legs', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Standing Calf Raise', muscle: 'Calves', type: 'Legs', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Seated Calf Raise', muscle: 'Calves', type: 'Legs', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Leg Press Calf Raise', muscle: 'Calves', type: 'Legs', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Donkey Calf Raise', muscle: 'Calves', type: 'Legs', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Plank', muscle: 'Core', type: 'Core', equipment: 'Bodyweight', tracking: 'time' },
  { name: 'Side Plank', muscle: 'Core', type: 'Core', equipment: 'Bodyweight', tracking: 'time' },
  { name: 'Cable Crunch', muscle: 'Core', type: 'Core', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Hanging Knee Raise', muscle: 'Core', type: 'Core', equipment: 'Bodyweight', tracking: 'bodyweight' },
  { name: 'Hanging Leg Raise', muscle: 'Core', type: 'Core', equipment: 'Bodyweight', tracking: 'bodyweight' },
  { name: 'Ab Wheel Rollout', muscle: 'Core', type: 'Core', equipment: 'Ab Wheel', tracking: 'bodyweight' },
  { name: 'Decline Sit Up', muscle: 'Core', type: 'Core', equipment: 'Bench', tracking: 'bodyweight' },
  { name: 'Russian Twist', muscle: 'Core', type: 'Core', equipment: 'Medicine Ball', tracking: 'weight/reps' },
  { name: 'Machine Crunch', muscle: 'Core', type: 'Core', equipment: 'Machine', tracking: 'weight/reps' },
  { name: 'Reverse Crunch', muscle: 'Core', type: 'Core', equipment: 'Bodyweight', tracking: 'bodyweight' },
  { name: 'Bicycle Crunch', muscle: 'Core', type: 'Core', equipment: 'Bodyweight', tracking: 'bodyweight' },
  { name: 'Wood Chop', muscle: 'Core', type: 'Core', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Pallof Press', muscle: 'Core', type: 'Core', equipment: 'Cable', tracking: 'weight/reps' },
  { name: 'Treadmill Run', muscle: 'Cardio', type: 'Cardio', equipment: 'Treadmill', tracking: 'distance/time' },
  { name: 'Incline Walk', muscle: 'Cardio', type: 'Cardio', equipment: 'Treadmill', tracking: 'distance/time' },
  { name: 'Stationary Bike', muscle: 'Cardio', type: 'Cardio', equipment: 'Bike', tracking: 'distance/time' },
  { name: 'Elliptical', muscle: 'Cardio', type: 'Cardio', equipment: 'Elliptical', tracking: 'distance/time' },
  { name: 'Rowing Machine', muscle: 'Cardio', type: 'Cardio', equipment: 'Rower', tracking: 'distance/time' },
  { name: 'Stair Climber', muscle: 'Cardio', type: 'Cardio', equipment: 'Machine', tracking: 'time' },
  { name: 'SkiErg', muscle: 'Cardio', type: 'Cardio', equipment: 'SkiErg', tracking: 'distance/time' },
  { name: 'Battle Ropes', muscle: 'Cardio', type: 'Cardio', equipment: 'Ropes', tracking: 'time' },
  { name: 'Sled Push', muscle: 'Full Body', type: 'Full Body', equipment: 'Sled', tracking: 'distance/time' },
  { name: 'Kettlebell Swing', muscle: 'Full Body', type: 'Full Body', equipment: 'Kettlebell', tracking: 'weight/reps' },
  { name: 'Clean and Press', muscle: 'Full Body', type: 'Full Body', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Power Clean', muscle: 'Full Body', type: 'Full Body', equipment: 'Barbell', tracking: 'weight/reps' },
  { name: 'Medicine Ball Slam', muscle: 'Full Body', type: 'Full Body', equipment: 'Medicine Ball', tracking: 'weight/reps' },
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
  All: Activity,
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

function normalizeMediaSource(source, fallback = 'library') {
  return MEDIA_SOURCES.includes(source) ? source : fallback;
}

function normalizeExerciseMedia(exercise = {}, meta = null, libraryMedia = {}, includeFallback = false) {
  const source = exercise.media || {};
  const metaMedia = meta?.media || {};
  const machinePhotoThumbnailUrl = exercise.machinePhotoThumbnailUrl || source.machinePhotoThumbnailUrl || '';
  const machinePhotoUrl = exercise.machinePhotoUrl || source.machinePhotoUrl || machinePhotoThumbnailUrl;
  const imageUrl = exercise.imageUrl || source.imageUrl || meta?.imageUrl || metaMedia.imageUrl || libraryMedia.imageUrl || '';
  const thumbnailUrl = exercise.thumbnailUrl || source.thumbnailUrl || meta?.thumbnailUrl || metaMedia.thumbnailUrl || libraryMedia.thumbnailUrl || imageUrl;
  const videoUrl = exercise.videoUrl || source.videoUrl || meta?.videoUrl || metaMedia.videoUrl || libraryMedia.videoUrl || '';
  const animationUrl = exercise.animationUrl || source.animationUrl || meta?.animationUrl || metaMedia.animationUrl || libraryMedia.animationUrl || '';
  const mediaSource = normalizeMediaSource(
    exercise.mediaSource || source.mediaSource || meta?.mediaSource || metaMedia.mediaSource || libraryMedia.mediaSource,
    imageUrl || thumbnailUrl || videoUrl || animationUrl ? 'library' : 'custom',
  );

  return {
    imageUrl,
    thumbnailUrl,
    videoUrl,
    animationUrl,
    mediaSource,
    machinePhotoUrl,
    machinePhotoThumbnailUrl,
    machinePhotoUpdatedAt: exercise.machinePhotoUpdatedAt || source.machinePhotoUpdatedAt || '',
  };
}

function getExerciseMedia(exercise = {}, mediaLibrary = {}) {
  return normalizeExerciseMedia(exercise, getExerciseMeta(exercise.name), mediaLibrary[normalizeName(exercise.name)], true);
}

function getExerciseThumbnailUrl(exercise = {}, mediaLibrary = {}) {
  const media = getExerciseMedia(exercise, mediaLibrary);
  return media.machinePhotoThumbnailUrl || media.thumbnailUrl || media.imageUrl || '';
}

function getExerciseDemoUrl(exercise = {}, mediaLibrary = {}) {
  const media = getExerciseMedia(exercise, mediaLibrary);
  return media.videoUrl || media.animationUrl || media.imageUrl || media.thumbnailUrl || '';
}

function resizeMachinePhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith('image/')) {
      reject(new Error('Choose an image file.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that image.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Could not load that image.'));
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = MACHINE_PHOTO_SIZE;
        canvas.height = MACHINE_PHOTO_SIZE;
        const context = canvas.getContext('2d');
        const sourceSize = Math.min(image.width, image.height);
        const sourceX = Math.max((image.width - sourceSize) / 2, 0);
        const sourceY = Math.max((image.height - sourceSize) / 2, 0);
        context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, MACHINE_PHOTO_SIZE, MACHINE_PHOTO_SIZE);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
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
    return `${formatDistance(set.weight)} x ${formatNumber(parseNumericValue(set.reps))}`;
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
  const media = normalizeExerciseMedia(exercise, meta);

  return {
    id: exercise.id || createId(),
    name: exercise.name || '',
    muscle: exercise.muscle || meta?.muscle || '',
    type: normalizeWorkoutType(exercise.type || meta?.type || ''),
    equipment: exercise.equipment || meta?.equipment || '',
    tracking,
    media,
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
      ? populatedSets.map((set) => createSetForTracking(tracking, set))
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
    effortRating: workout.effortRating || '',
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
        media: normalizeExerciseMedia(exercise, getExerciseMeta(exercise.name)),
        muscle: exercise.muscle || '',
        type: exercise.type || '',
        equipment: exercise.equipment || '',
        tracking: exercise.tracking || getExerciseMeta(exercise.name)?.tracking || 'weight/reps',
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
    exercises: template.map((exercise) => {
      const nextExercise = createExercise(exercise.name, exercise.sets);
      return {
        ...nextExercise,
        muscle: exercise.muscle || nextExercise.muscle,
        type: normalizeWorkoutType(exercise.type || nextExercise.type),
        equipment: exercise.equipment || nextExercise.equipment,
        tracking: normalizeTracking(exercise.tracking || nextExercise.tracking),
        // Machine photos are copied into each workout. Updating one active exercise will not mutate past saved workouts.
        media: normalizeExerciseMedia({ ...nextExercise, media: exercise.media }, getExerciseMeta(exercise.name)),
      };
    }),
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

function readFavoriteExercises() {
  try {
    const parsed = JSON.parse(localStorage.getItem(FAVORITE_EXERCISES_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function saveFavoriteExercises(names) {
  localStorage.setItem(FAVORITE_EXERCISES_KEY, JSON.stringify(Array.isArray(names) ? names : []));
}

function readAppleWatchReminderEnabled() {
  return localStorage.getItem(APPLE_WATCH_REMINDER_KEY) !== 'off';
}

function saveAppleWatchReminderEnabled(enabled) {
  localStorage.setItem(APPLE_WATCH_REMINDER_KEY, enabled ? 'on' : 'off');
}

function readRecoveryDays() {
  const saved = Number(localStorage.getItem(RECOVERY_DAYS_KEY));
  return saved === 2 ? 2 : DEFAULT_RECOVERY_DAYS;
}

function saveRecoveryDays(days) {
  localStorage.setItem(RECOVERY_DAYS_KEY, Number(days) === 2 ? '2' : '1');
}

function readCachedWgerMedia() {
  try {
    const parsed = JSON.parse(localStorage.getItem(WGER_MEDIA_CACHE_KEY) || 'null');
    if (!parsed?.updatedAt || !parsed?.media) return {};
    if (Date.now() - new Date(parsed.updatedAt).getTime() > WGER_MEDIA_CACHE_MAX_AGE) return {};
    return parsed.media;
  } catch {
    return {};
  }
}

function saveCachedWgerMedia(media) {
  localStorage.setItem(WGER_MEDIA_CACHE_KEY, JSON.stringify({ updatedAt: nowValue(), media }));
}

function extractWgerImageUrl(image = {}) {
  const rawUrl = image.image || image.url || image.original || image.thumbnail || image.image_url || '';
  if (!rawUrl) return '';
  return rawUrl.startsWith('http') ? rawUrl : `https://wger.de${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
}

function mapWgerExerciseMedia(results = []) {
  return results.reduce((media, item) => {
    const translation = Array.isArray(item.exercises)
      ? item.exercises.find((entry) => entry.language === 2 || entry.language?.id === 2) || item.exercises[0]
      : null;
    const name = item.name || translation?.name || '';
    const image = Array.isArray(item.images) ? item.images.find((entry) => entry.is_main) || item.images[0] : null;
    const imageUrl = extractWgerImageUrl(image);
    if (!name || !imageUrl) return media;
    media[normalizeName(name)] = {
      imageUrl,
      thumbnailUrl: imageUrl,
      mediaSource: 'library',
    };
    return media;
  }, {});
}

async function fetchWgerExerciseMedia() {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 4500);
  try {
    const response = await fetch(WGER_EXERCISE_INFO_URL, { signal: controller.signal });
    if (!response.ok) throw new Error('Library media unavailable');
    const data = await response.json();
    return mapWgerExerciseMedia(Array.isArray(data.results) ? data.results : []);
  } finally {
    window.clearTimeout(timeoutId);
  }
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
        media: normalizeExerciseMedia(exercise, getExerciseMeta(exercise.name)),
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
      media: normalizeExerciseMedia(exercise, getExerciseMeta(exercise.name)),
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

function collectExerciseEntries(workouts, activeWorkout) {
  const byName = new Map(EXERCISE_LIBRARY.map((exercise) => [normalizeName(exercise.name), exercise]));
  workouts.forEach((workout) => {
    (workout.exercises || []).forEach((exercise) => {
      if (exercise.name) byName.set(normalizeName(exercise.name), normalizeExercise(exercise));
    });
  });
  (activeWorkout?.exercises || []).forEach((exercise) => {
    if (exercise.name) byName.set(normalizeName(exercise.name), normalizeExercise(exercise));
  });
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function getExerciseOptions(workouts, activeWorkout, category = 'All', mediaLibrary = {}, favoriteNames = []) {
  const normalizedCategory = normalizeWorkoutType(category);
  const categoryForSearch = normalizedCategory === 'Favorites' ? 'All' : normalizedCategory;
  const favorites = new Set(favoriteNames.map(normalizeName));
  const library = EXERCISE_LIBRARY.filter((exercise) => categoryForSearch === 'All' || normalizeWorkoutType(exercise.type) === categoryForSearch);
  const used = collectExerciseEntries(workouts, activeWorkout)
    .map((exercise) => ({ ...(getExerciseMeta(exercise.name) || { muscle: 'Custom', type: 'Custom', equipment: 'Custom', tracking: 'weight/reps' }), ...exercise }))
    .filter((exercise) => categoryForSearch === 'All' || normalizeWorkoutType(exercise.type) === categoryForSearch);
  const byName = new Map([...library, ...used].map((exercise) => [normalizeName(exercise.name), exercise]));
  return [...byName.values()]
    .map((exercise) => ({
      ...exercise,
      isFavorite: favorites.has(normalizeName(exercise.name)),
      media: normalizeExerciseMedia(exercise, getExerciseMeta(exercise.name), mediaLibrary[normalizeName(exercise.name)], true),
    }))
    .filter((exercise) => normalizedCategory !== 'Favorites' || exercise.isFavorite)
    .sort((a, b) => {
    const typeSort = CATEGORY_ORDER.indexOf(normalizeWorkoutType(a.type)) - CATEGORY_ORDER.indexOf(normalizeWorkoutType(b.type));
    return Number(b.isFavorite) - Number(a.isFavorite) || typeSort || a.muscle.localeCompare(b.muscle) || a.name.localeCompare(b.name);
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

function getExerciseSetPrMap(exercise, exerciseRecords) {
  const prMap = new Map();
  if (normalizeTracking(exercise.tracking) !== 'weight/reps' || !exerciseRecords) return prMap;

  const candidates = (exercise.sets || [])
    .map((set, index) => {
      const weight = parseNumericValue(set.weight);
      const reps = parseNumericValue(set.reps);
      const hasWeight = Number.isFinite(weight) && weight > 0;
      const hasReps = Number.isFinite(reps) && reps > 0;
      const estimated1rm = hasWeight && hasReps ? estimateOneRepMax(weight, reps) : 0;
      return {
        set,
        index,
        weight: hasWeight ? weight : 0,
        reps: hasReps ? reps : 0,
        volume: hasWeight && hasReps ? weight * reps : 0,
        estimated1rm,
      };
    })
    .filter((item) => item.weight || item.reps || item.volume || item.estimated1rm);

  const pickBest = (items, key, previousBest) =>
    items
      .filter((item) => item[key] > previousBest)
      .sort((a, b) => b[key] - a[key] || b.index - a.index)[0];

  const addAchievement = (item, achievement) => {
    if (!item?.set?.id) return;
    const current = prMap.get(item.set.id) || [];
    prMap.set(item.set.id, [...current, achievement]);
  };

  const bestOneRepMax = pickBest(candidates, 'estimated1rm', exerciseRecords.estimated1rm || 0);
  addAchievement(bestOneRepMax, {
    id: 'estimated1rm',
    label: `1RM PR - ${bestOneRepMax?.estimated1rm || 0} lb`,
    info: true,
  });

  const bestMaxWeight = pickBest(candidates, 'weight', exerciseRecords.maxWeight || 0);
  if (bestMaxWeight && bestMaxWeight.set.id !== bestOneRepMax?.set.id) {
    addAchievement(bestMaxWeight, {
      id: 'maxWeight',
      label: `Max weight PR - ${formatNumber(bestMaxWeight.weight, bestMaxWeight.weight % 1 === 0 ? 0 : 2)} lb`,
    });
  }

  const bestVolume = pickBest(candidates, 'volume', exerciseRecords.bestVolume || 0);
  if (bestVolume && !prMap.has(bestVolume.set.id)) {
    addAchievement(bestVolume, {
      id: 'volume',
      label: 'Volume PR',
    });
  }

  const bestReps = pickBest(candidates, 'reps', exerciseRecords.bestReps || 0);
  if (bestReps && !prMap.has(bestReps.set.id)) {
    addAchievement(bestReps, {
      id: 'reps',
      label: 'Rep PR',
    });
  }

  return prMap;
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

function getLocalDateFromKey(dateKey) {
  return new Date(`${dateKey}T12:00:00`);
}

function getDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getDayDifference(fromDateKey, toDateKey = todayValue()) {
  const from = getLocalDateFromKey(fromDateKey);
  const to = getLocalDateFromKey(toDateKey);
  return Math.max(0, Math.round((to - from) / 86400000));
}

function getCompletedSetCount(exercise = {}) {
  return (exercise.sets || []).filter((set) => isSetComplete(set, exercise.tracking)).length;
}

function getWorkoutDurationSeconds(workout = {}) {
  const start = workout.startedAt ? new Date(workout.startedAt).getTime() : null;
  const end = workout.completedAt ? new Date(workout.completedAt).getTime() : null;
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  return Math.round((end - start) / 1000);
}

function getWorkoutDaySummary(workouts = []) {
  return workouts.reduce((summary, workout) => {
    if (!workout.date) return summary;
    const exercises = (workout.exercises || []).filter((exercise) => getCompletedSetCount(exercise) > 0);
    const totalSets = exercises.reduce((total, exercise) => total + getCompletedSetCount(exercise), 0);
    const duration = getWorkoutDurationSeconds(workout);
    const current = summary.get(workout.date) || {
      date: workout.date,
      workoutNames: [],
      durations: [],
      exerciseCount: 0,
      totalSets: 0,
      workoutCount: 0,
    };

    summary.set(workout.date, {
      ...current,
      workoutNames: [...current.workoutNames, workout.label || workout.type || 'Workout'],
      durations: Number.isFinite(duration) ? [...current.durations, duration] : current.durations,
      exerciseCount: current.exerciseCount + exercises.length,
      totalSets: current.totalSets + totalSets,
      workoutCount: current.workoutCount + 1,
    });
    return summary;
  }, new Map());
}

function getWeekStart(date) {
  return addDays(date, -date.getDay());
}

function calculateWorkoutConsistency(workouts, minimumDays = 365) {
  const daySummary = getWorkoutDaySummary(workouts);
  const workoutDates = new Set([...daySummary.keys()]);
  const today = getLocalDateFromKey(todayValue());
  const oldestWorkoutDate = [...workoutDates].sort()[0];
  const minimumStart = addDays(today, -minimumDays + 1);
  const naturalStart = oldestWorkoutDate ? getLocalDateFromKey(oldestWorkoutDate) : minimumStart;
  const start = getWeekStart(naturalStart < minimumStart ? naturalStart : minimumStart);
  const dayCount = getDayDifference(getDateKey(start), todayValue()) + 1;
  const calendarDays = Array.from({ length: dayCount }, (_, index) => {
    const date = addDays(start, index);
    const dateKey = getDateKey(date);
    const summary = daySummary.get(dateKey) || null;
    return {
      date: dateKey,
      dayOfWeek: date.getDay(),
      weekIndex: Math.floor(index / 7) + 1,
      isToday: dateKey === todayValue(),
      workedOut: workoutDates.has(dateKey),
      summary,
    };
  });

  const weekCount = Math.max(...calendarDays.map((day) => day.weekIndex), 1);

  return { calendarDays, weekCount };
}

const RECOVERY_MUSCLES = [
  'Chest / pecs',
  'Front delts',
  'Side delts',
  'Biceps',
  'Forearms',
  'Abs / core',
  'Quads',
  'Calves',
  'Traps',
  'Rear delts',
  'Lats / upper back',
  'Triceps',
  'Glutes',
  'Hamstrings',
];

const DEFAULT_RECOVERY_DAYS = 1;
const RECOVERY_STATE_COLORS = {
  ready: '#5fe08d',
  recovering: '#ffb14a',
  fatigued: '#ff5257',
  inactive: '#37414d',
};
const RECOVERY_STATE_PRIORITY = {
  fatigued: 3,
  recovering: 2,
  ready: 1,
  inactive: 0,
};
const BODY_HIGHLIGHTER_SLUGS = [
  'abs',
  'adductors',
  'ankles',
  'biceps',
  'calves',
  'chest',
  'deltoids',
  'feet',
  'forearm',
  'gluteal',
  'hamstring',
  'hands',
  'hair',
  'head',
  'knees',
  'lower-back',
  'neck',
  'obliques',
  'quadriceps',
  'tibialis',
  'trapezius',
  'triceps',
  'upper-back',
];
const FRONT_BODY_SLUG_MUSCLES = {
  chest: ['Chest / pecs'],
  deltoids: ['Front delts', 'Side delts'],
  biceps: ['Biceps'],
  forearm: ['Forearms'],
  abs: ['Abs / core'],
  obliques: ['Abs / core'],
  quadriceps: ['Quads'],
  calves: ['Calves'],
};
const BACK_BODY_SLUG_MUSCLES = {
  trapezius: ['Traps'],
  deltoids: ['Rear delts'],
  'upper-back': ['Lats / upper back'],
  triceps: ['Triceps'],
  forearm: ['Forearms'],
  gluteal: ['Glutes'],
  hamstring: ['Hamstrings'],
  calves: ['Calves'],
};

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

function getExerciseRecoveryMuscles(exercise = {}) {
  const name = normalizeName(exercise.name);
  const muscle = exercise.muscle || getExerciseMeta(exercise.name)?.muscle || '';
  const groups = [];

  if (/bench|incline|decline|chest|fly|pec|crossover|push up|pullover|dip/.test(name) || muscle === 'Chest') groups.push('Chest / pecs');
  if (/shrug|upright row|face pull|deadlift|clean|farmer|carry/.test(name)) groups.push('Traps');
  if (/pull up|chin up|pulldown|row|deadlift|back extension|pullover|clean|sled|kettlebell/.test(name) || muscle === 'Back') groups.push('Lats / upper back');
  if (/shoulder press|overhead press|arnold|front raise|bench|incline|push up|clean and press/.test(name)) groups.push('Front delts');
  if (/lateral raise|upright row|shoulder press|arnold|machine shoulder/.test(name)) groups.push('Side delts');
  if (/rear delt|face pull|reverse pec|row/.test(name)) groups.push('Rear delts');
  if (/curl|chin up|pull up|pulldown|row/.test(name) || muscle === 'Biceps') groups.push('Biceps');
  if (/tricep|skull|dip|bench|press|push up|extension/.test(name) || muscle === 'Triceps') groups.push('Triceps');
  if (/hammer curl|reverse curl|wrist|farmer|carry|grip|forearm|deadlift|shrug/.test(name) || muscle === 'Forearms') groups.push('Forearms');
  if (/plank|crunch|knee raise|leg raise|dead bug|pallof|core|ab|sit up|twist|wood chop|rollout|slam/.test(name) || muscle === 'Core') groups.push('Abs / core');
  if (/hip thrust|glute|kickback|deadlift|squat|leg press|lunge|split squat|step up|abduction|swing|sled/.test(name) || muscle === 'Glutes') groups.push('Glutes');
  if (/squat|leg press|leg extension|lunge|split squat|step up|quad|sled/.test(name) || muscle === 'Quads') groups.push('Quads');
  if (/romanian|stiff leg|deadlift|leg curl|hamstring|nordic|swing/.test(name) || muscle === 'Hamstrings') groups.push('Hamstrings');
  if (/calf/.test(name) || muscle === 'Calves') groups.push('Calves');
  if (muscle === 'Shoulders' && !groups.some((group) => group.includes('delts'))) groups.push('Front delts');
  if (muscle === 'Full Body') groups.push('Traps', 'Lats / upper back', 'Abs / core', 'Glutes', 'Quads', 'Hamstrings');

  return uniqueValues(groups).filter((group) => RECOVERY_MUSCLES.includes(group));
}

function getRecoveryDaysToReady(recoveryDays) {
  return (Number(recoveryDays) === 2 ? 2 : 1) + 1;
}

function getRecoveryState(daysAgo, recoveryDays = DEFAULT_RECOVERY_DAYS) {
  const daysToReady = getRecoveryDaysToReady(recoveryDays);
  if (daysAgo === null || daysAgo === undefined) return 'inactive';
  if (daysAgo <= 0) return 'fatigued';
  if (daysAgo < daysToReady) return 'recovering';
  return 'ready';
}

function getRecoveryPercent(daysAgo, recoveryDays = DEFAULT_RECOVERY_DAYS) {
  const daysToReady = getRecoveryDaysToReady(recoveryDays);
  if (daysAgo === null || daysAgo === undefined) return null;
  return Math.min(100, Math.max(18, Math.round((daysAgo / daysToReady) * 100)));
}

function getEstimatedReadyDate(lastTrainedDate, recoveryDays = DEFAULT_RECOVERY_DAYS) {
  if (!lastTrainedDate) return '';
  return getDateKey(addDays(getLocalDateFromKey(lastTrainedDate), getRecoveryDaysToReady(recoveryDays)));
}

function getRecoveryStateLabel(state) {
  if (state === 'ready') return 'Ready';
  if (state === 'recovering') return 'Recovering';
  if (state === 'fatigued') return 'Trained today';
  return 'No data';
}

function getRecoveryStateHint(state) {
  if (state === 'ready') return 'Good to train';
  if (state === 'recovering') return 'Give it time';
  if (state === 'fatigued') return 'Rest this muscle';
  return 'Log history';
}

function getDominantRecoveryItem(items = []) {
  return [...items].sort((a, b) => (RECOVERY_STATE_PRIORITY[b?.state] || 0) - (RECOVERY_STATE_PRIORITY[a?.state] || 0))[0] || null;
}

function getBodySlugMuscleMap(side) {
  return side === 'back' ? BACK_BODY_SLUG_MUSCLES : FRONT_BODY_SLUG_MUSCLES;
}

function getBodyHiddenParts(side) {
  const visibleSlugs = new Set(Object.keys(getBodySlugMuscleMap(side)));
  return BODY_HIGHLIGHTER_SLUGS.filter((slug) => !visibleSlugs.has(slug));
}

function getRecoveryBodyData(recovery, side, selectedMuscle) {
  const recoveryByMuscle = new Map(recovery.map((item) => [item.muscle, item]));
  const slugMuscles = getBodySlugMuscleMap(side);

  return Object.entries(slugMuscles).map(([slug, muscles]) => {
    const items = muscles.map((muscle) => recoveryByMuscle.get(muscle)).filter(Boolean);
    const dominant = getDominantRecoveryItem(items);
    const state = dominant?.state || 'inactive';
    const isSelected = muscles.includes(selectedMuscle);
    return {
      slug,
      color: RECOVERY_STATE_COLORS[state],
      styles: {
        fill: RECOVERY_STATE_COLORS[state],
        stroke: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(4,8,13,0.58)',
        strokeWidth: isSelected ? 3 : 1.4,
      },
    };
  });
}

function getMuscleFromBodySlug(slug, side, recovery) {
  const muscles = getBodySlugMuscleMap(side)[slug] || [];
  const recoveryByMuscle = new Map(recovery.map((item) => [item.muscle, item]));
  return getDominantRecoveryItem(muscles.map((muscle) => recoveryByMuscle.get(muscle)).filter(Boolean))?.muscle || muscles[0] || '';
}

function calculateMuscleRecovery(workouts, recoveryDays = DEFAULT_RECOVERY_DAYS) {
  const recoveryByMuscle = new Map(
    RECOVERY_MUSCLES.map((muscle) => [
      muscle,
      {
        muscle,
        lastTrainedDate: '',
        exercises: [],
        allExercises: [],
        workoutIds: [],
      },
    ]),
  );

  [...workouts]
    .sort((a, b) => getWorkoutTime(b) - getWorkoutTime(a))
    .forEach((workout) => {
      (workout.exercises || []).forEach((exercise) => {
        const hasCompletedSet = (exercise.sets || []).some((set) => isSetComplete(set, exercise.tracking));
        if (!hasCompletedSet) return;
        getExerciseRecoveryMuscles(exercise).forEach((muscle) => {
          const current = recoveryByMuscle.get(muscle);
          if (!current) return;
          const isLatestDate = !current.lastTrainedDate || current.lastTrainedDate === workout.date;
          recoveryByMuscle.set(muscle, {
            ...current,
            lastTrainedDate: current.lastTrainedDate || workout.date,
            exercises: isLatestDate ? uniqueValues([...(current.exercises || []), exercise.name || muscle]) : current.exercises,
            allExercises: uniqueValues([...(current.allExercises || []), exercise.name || muscle]),
            workoutIds: uniqueValues([...(current.workoutIds || []), workout.id || workout.startedAt || workout.date]),
          });
        });
      });
    });

  return RECOVERY_MUSCLES.map((muscle) => {
    const recovery = recoveryByMuscle.get(muscle);
    const lastTrainedDate = recovery?.lastTrainedDate || '';
    const daysAgo = lastTrainedDate ? getDayDifference(lastTrainedDate) : null;
    const recoveryPercent = getRecoveryPercent(daysAgo, recoveryDays);
    return {
      muscle,
      lastTrainedDate,
      daysAgo,
      state: getRecoveryState(daysAgo, recoveryDays),
      recoveryPercent,
      readyDate: getEstimatedReadyDate(lastTrainedDate, recoveryDays),
      exercises: recovery?.exercises || [],
      allExercises: recovery?.allExercises || recovery?.exercises || [],
      workoutCount: recovery?.workoutIds?.length || 0,
    };
  });
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

function getSetFieldPlaceholder(set, field) {
  const previousValue = set?.[field.previousKey];
  return previousValue !== undefined && previousValue !== null && String(previousValue).trim() !== ''
    ? `Last: ${previousValue}`
    : field.placeholder;
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

function CategoryMediaBadge({ type, size = 'md' }) {
  const normalizedType = normalizeWorkoutType(type);
  const Icon = CATEGORY_ICONS[normalizedType] || Dumbbell;
  return (
    <span className={`category-badge ${size} ${CATEGORY_BADGES[normalizedType] || ''}`}>
      <Icon size={size === 'sm' ? 12 : 18} strokeWidth={2.4} />
    </span>
  );
}

function WorkoutConsistencyCalendar({ workouts }) {
  const scrollRef = useRef(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const { calendarDays, weekCount } = useMemo(
    () => calculateWorkoutConsistency(workouts),
    [workouts],
  );

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return undefined;
    const frame = window.requestAnimationFrame(() => {
      node.scrollLeft = node.scrollWidth;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [weekCount]);

  return (
    <section className="dashboard-card consistency-card">
      <div className="dashboard-card-head">
        <div>
          <strong>Consistency</strong>
        </div>
        <CalendarRange size={18} strokeWidth={2.2} />
      </div>
      <div className="consistency-scroll" ref={scrollRef} aria-label="Workout consistency heatmap" tabIndex={0}>
        <div className="consistency-grid" style={{ '--week-count': weekCount }}>
          {calendarDays.map((day) => (
            <button
              key={day.date}
              type="button"
              className={`consistency-day ${day.workedOut ? 'worked-out' : ''} ${day.isToday ? 'today' : ''} ${selectedDay?.date === day.date ? 'selected' : ''}`}
              style={{ gridColumn: day.weekIndex, gridRow: day.dayOfWeek + 1 }}
              title={formatShortDate(day.date)}
              aria-label={formatShortDate(day.date)}
              onClick={() => setSelectedDay(day)}
            />
          ))}
        </div>
      </div>
      {selectedDay ? (
        <div className="consistency-detail">
          <strong>{formatShortDate(selectedDay.date)}</strong>
        </div>
      ) : null}
    </section>
  );
}

function RecoveryInlineLegend() {
  const legendItems = [
    { state: 'ready', label: 'Ready' },
    { state: 'recovering', label: 'Recovering' },
    { state: 'fatigued', label: 'Trained today' },
  ];

  return (
    <div className="recovery-map-legend" aria-label="Recovery color legend">
      {legendItems.map((item) => (
        <span key={item.state} className="recovery-map-legend-item">
          <i className={item.state} />
          <span>
            <strong>{item.label}</strong>
          </span>
        </span>
      ))}
    </div>
  );
}

function MuscleAnatomyGraphic({ recovery, selectedMuscle, onSelect }) {
  const renderBody = (side) => (
    <div className="muscle-body-panel">
      <span className="anatomy-view-label">{side}</span>
      <div className="muscle-body-frame">
        <MuscleBody
          data={getRecoveryBodyData(recovery, side, selectedMuscle)}
          side={side}
          gender="male"
          scale={1}
          border="rgba(209, 218, 231, 0.18)"
          defaultFill="rgba(51, 61, 73, 0.74)"
          defaultStroke="rgba(8, 12, 18, 0.7)"
          defaultStrokeWidth={1.2}
          hiddenParts={getBodyHiddenParts(side)}
          onBodyPartPress={(part) => {
            const muscle = getMuscleFromBodySlug(part.slug, side, recovery);
            if (muscle) onSelect(muscle);
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="anatomy-stage muscle-highlighter-stage">
      <div className="muscle-body-grid" aria-label="Front and back muscle recovery anatomy">
        {renderBody('front')}
        {renderBody('back')}
      </div>
      <RecoveryInlineLegend />
    </div>
  );
}

function MuscleRecoveryCard({ workouts }) {
  const [showInfo, setShowInfo] = useState(false);
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [recoveryDays, setRecoveryDays] = useState(() => readRecoveryDays());
  const recovery = useMemo(() => calculateMuscleRecovery(workouts, recoveryDays), [workouts, recoveryDays]);
  const readyMuscles = recovery.filter((item) => item.state === 'ready');
  const readyText = readyMuscles.length ? readyMuscles.slice(0, 3).map((item) => item.muscle).join(' \u2022 ') : 'Log workouts to build recovery history';
  const updateRecoveryDays = (days) => {
    setRecoveryDays(days);
    saveRecoveryDays(days);
  };

  return (
    <section className="dashboard-card recovery-card">
      <div className="recovery-mockup-head">
        <div className="recovery-title-block">
          <span className="premium-eyebrow">Recovery status</span>
          <h2>Muscle Recovery</h2>
          <p>
            <CheckCircle2 size={18} strokeWidth={2.6} />
            <strong>Ready to train:</strong>
            <span>{readyText}</span>
          </p>
        </div>
        <div className="recovery-head-actions">
          <div className="recovery-days-toggle" aria-label="Recovery time">
            {[1, 2].map((days) => (
              <button
                key={days}
                type="button"
                className={recoveryDays === days ? 'active' : ''}
                onClick={() => updateRecoveryDays(days)}
              >
                {days} day
              </button>
            ))}
          </div>
          <button type="button" className="icon-button" onClick={() => setShowInfo(true)} aria-label="Recovery color info">
            <Info size={16} strokeWidth={2.4} />
          </button>
        </div>
      </div>
      <MuscleAnatomyGraphic
        recovery={recovery}
        selectedMuscle={selectedMuscle}
        onSelect={(muscle) => setSelectedMuscle(muscle)}
      />
      {showInfo ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setShowInfo(false)}>
          <div className="info-modal" role="dialog" aria-modal="true" aria-labelledby="recovery-info-title" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-header">
              <h3 id="recovery-info-title">Recovery timing</h3>
              <button type="button" className="sheet-close" aria-label="Close recovery info" onClick={() => setShowInfo(false)}>
                <X size={18} strokeWidth={2.4} />
              </button>
            </div>
            <p>Red means trained today. Orange means the muscle is still recovering. Green means it is ready based on your selected recovery setting.</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function DashboardPreview({ workouts }) {
  return (
    <div className="dashboard-preview">
      <WorkoutConsistencyCalendar workouts={workouts} />
      <MuscleRecoveryCard workouts={workouts} />
    </div>
  );
}

function AppleWatchReminderModal({ defaultRemind, onContinue, onClose }) {
  const [remind, setRemind] = useState(defaultRemind);

  const continueWithPreference = () => {
    onContinue(remind);
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="info-modal watch-reminder-modal" role="dialog" aria-modal="true" aria-labelledby="watch-reminder-title" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-header">
          <h3 id="watch-reminder-title">Start Apple Watch workout?</h3>
          <button type="button" className="sheet-close" aria-label="Close Apple Watch reminder" onClick={onClose}>
            <X size={18} strokeWidth={2.4} />
          </button>
        </div>
        <p>Tracking on your watch improves heart rate, calorie, and workout data.</p>
        <label className="checkbox-row">
          <input type="checkbox" checked={remind} onChange={(event) => setRemind(event.target.checked)} />
          <span>Remind me before workouts</span>
        </label>
        <div className="modal-action-row">
          <button type="button" className="secondary-button" onClick={continueWithPreference}>
            Skip
          </button>
          <button type="button" className="primary-button" onClick={continueWithPreference}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

function PhotoPreviewModal({ exercise, mediaLibrary = {}, onClose }) {
  const [failedUrl, setFailedUrl] = useState('');
  if (!exercise) return null;
  const media = getExerciseMedia(exercise, mediaLibrary);
  const url = media.machinePhotoUrl || media.machinePhotoThumbnailUrl || getExerciseDemoUrl(exercise, mediaLibrary);
  const visibleUrl = url && url !== failedUrl ? url : '';

  return (
    <div className="modal-backdrop photo-preview-backdrop" role="presentation" onClick={onClose}>
      <div className="photo-preview-modal" role="dialog" aria-modal="true" aria-label={`${exercise.name || 'Exercise'} photo preview`} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="sheet-close photo-preview-close" aria-label="Close photo preview" onClick={onClose}>
          <X size={18} strokeWidth={2.4} />
        </button>
        {visibleUrl ? (
          <img src={visibleUrl} alt="" onError={() => setFailedUrl(visibleUrl)} />
        ) : (
          <div className="photo-preview-empty">
            <Dumbbell size={42} strokeWidth={2.1} />
            <p>No photo saved for this exercise yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChooseWorkoutScreen({ onStart, draftWorkout, onResumeDraft, onDiscardDraft, workouts }) {
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

      <DashboardPreview workouts={workouts} />

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
            <CategoryMediaBadge type={item} />
            <span className="workout-choice-label">{item}</span>
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

function ExerciseMediaThumbnail({ exercise, size = 'md', mediaLibrary = {} }) {
  const [failedUrl, setFailedUrl] = useState('');
  const url = getExerciseThumbnailUrl(exercise, mediaLibrary);
  const visibleUrl = url && url !== failedUrl ? url : '';
  const media = getExerciseMedia(exercise, mediaLibrary);
  const label = media.machinePhotoThumbnailUrl ? 'Machine photo' : 'Exercise image';

  return (
    <div className={`exercise-thumbnail ${size} ${visibleUrl ? '' : 'placeholder'}`} aria-label={visibleUrl ? label : 'No exercise image'}>
      {visibleUrl ? (
        <img src={visibleUrl} alt="" loading="lazy" onError={() => setFailedUrl(visibleUrl)} />
      ) : (
        <Dumbbell size={size === 'sm' ? 15 : 20} strokeWidth={2.2} />
      )}
    </div>
  );
}

function ExerciseHeroMedia({ exercise, mediaLibrary = {} }) {
  const [failedUrl, setFailedUrl] = useState('');
  const media = getExerciseMedia(exercise, mediaLibrary);
  const demoUrl = getExerciseDemoUrl(exercise, mediaLibrary);
  const visibleUrl = demoUrl && demoUrl !== failedUrl ? demoUrl : '';
  const isVideo = Boolean(media.videoUrl || media.animationUrl);

  return (
    <div className={`exercise-hero-media ${visibleUrl ? '' : 'placeholder'}`}>
      {visibleUrl && isVideo ? (
        <video src={visibleUrl} controls preload="metadata" onError={() => setFailedUrl(visibleUrl)} />
      ) : visibleUrl ? (
        <img src={visibleUrl} alt="" loading="lazy" onError={() => setFailedUrl(visibleUrl)} />
      ) : (
        <Dumbbell size={36} strokeWidth={2.1} />
      )}
    </div>
  );
}

function MachinePhotoUploader({ exercise, mediaLibrary = {}, onChange }) {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const media = getExerciseMedia(exercise, mediaLibrary);
  const storedMedia = exercise.media || {};
  const inputId = `machine-photo-${exercise.id}`;

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setStatus('loading');
    setError('');
    try {
      const thumbnailUrl = await resizeMachinePhoto(file);
      onChange({
        ...storedMedia,
        mediaSource: 'user_photo',
        machinePhotoUrl: thumbnailUrl,
        machinePhotoThumbnailUrl: thumbnailUrl,
        machinePhotoUpdatedAt: nowValue(),
      });
      setStatus('saved');
    } catch (uploadError) {
      setError(uploadError.message || 'Could not use that photo.');
      setStatus('error');
    }
  };

  return (
    <section className="machine-photo-section">
      <div>
        <h4>Machine photo</h4>
        <p>Use this to remember which exact machine you used.</p>
      </div>
      <div className="machine-photo-row">
        <ExerciseMediaThumbnail exercise={exercise} size="lg" mediaLibrary={mediaLibrary} />
        <div className="machine-photo-actions">
          <input id={inputId} className="sr-only" type="file" accept="image/*" onChange={handleFileChange} />
          <label className="file-button" htmlFor={inputId}>
            <FileUp size={16} strokeWidth={2.3} />
            {media.machinePhotoThumbnailUrl ? 'Replace photo' : 'Add photo'}
          </label>
          {media.machinePhotoThumbnailUrl ? (
            <button
              type="button"
              className="text-link inline-link"
              onClick={() =>
                onChange({
                  ...storedMedia,
                  mediaSource: storedMedia.imageUrl || storedMedia.thumbnailUrl || storedMedia.videoUrl || storedMedia.animationUrl ? normalizeMediaSource(storedMedia.mediaSource, 'custom') : 'custom',
                  machinePhotoUrl: '',
                  machinePhotoThumbnailUrl: '',
                  machinePhotoUpdatedAt: '',
                })
              }
            >
              Remove
            </button>
          ) : null}
          {status === 'loading' ? <small>Processing photo...</small> : null}
          {status === 'saved' ? <small>Saved as a 256px thumbnail.</small> : null}
          {error ? <small className="upload-error">{error}</small> : null}
        </div>
      </div>
    </section>
  );
}

function PlateCalculator({ exercise }) {
  const [targetWeight, setTargetWeight] = useState('');
  const [barWeight, setBarWeight] = useState('45');
  if (normalizeTracking(exercise.tracking) !== 'weight/reps') return null;

  const target = parseNumericValue(targetWeight);
  const bar = parseNumericValue(barWeight) || 0;
  const perSide = Number.isFinite(target) ? Math.max((target - bar) / 2, 0) : 0;
  const plateSizes = [45, 35, 25, 10, 5, 2.5];
  let remaining = perSide;
  const plates = plateSizes
    .map((plate) => {
      const count = Math.floor((remaining + 0.001) / plate);
      remaining -= count * plate;
      return { plate, count };
    })
    .filter((item) => item.count > 0);

  return (
    <section className="plate-calculator">
      <div>
        <h4>Plate helper</h4>
        <p>Quick barbell math for this lift.</p>
      </div>
      <div className="plate-input-row">
        <label>
          <span>Target</span>
          <input inputMode="decimal" type="number" placeholder="135" value={targetWeight} onChange={(event) => setTargetWeight(event.target.value)} />
        </label>
        <label>
          <span>Bar</span>
          <input inputMode="decimal" type="number" value={barWeight} onChange={(event) => setBarWeight(event.target.value)} />
        </label>
      </div>
      <div className="plate-result">
        {Number.isFinite(target) && target > bar ? (
          plates.length ? (
            plates.map((item) => <span key={item.plate}>{item.count}x {item.plate}</span>)
          ) : (
            <span>Empty bar</span>
          )
        ) : (
          <span>Enter a working weight</span>
        )}
        {Number.isFinite(target) && target > bar && remaining > 0.01 ? <small>plus {formatNumber(remaining, 2)} lb per side</small> : null}
      </div>
    </section>
  );
}

function ExerciseDetailModal({ exercise, mediaLibrary = {}, onClose, onMediaChange }) {
  if (!exercise) return null;
  const meta = getExerciseMeta(exercise.name) || exercise;
  const media = getExerciseMedia(exercise, mediaLibrary);

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="info-modal exercise-detail-modal" role="dialog" aria-modal="true" aria-labelledby="exercise-detail-title" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-header">
          <div>
            <h3 id="exercise-detail-title">{exercise.name || 'Exercise details'}</h3>
            <p>{[meta.muscle, meta.equipment, formatTrackingLabel(exercise.tracking)].filter(Boolean).join(' - ')}</p>
          </div>
          <button type="button" className="sheet-close" aria-label="Close exercise details" onClick={onClose}>
            <X size={18} strokeWidth={2.4} />
          </button>
        </div>
        <ExerciseHeroMedia exercise={exercise} mediaLibrary={mediaLibrary} />
        <div className="media-source-row">
          <span className="tiny-label">Demo media: {media.mediaSource.replace('_', ' ')}</span>
        </div>
        <PlateCalculator exercise={exercise} />
        <MachinePhotoUploader exercise={exercise} mediaLibrary={mediaLibrary} onChange={onMediaChange} />
      </div>
    </div>
  );
}

function ActiveWorkoutScreen({
  workout,
  workouts,
  mediaLibrary,
  favoriteExercises,
  saveStatus,
  exerciseRecords,
  lastPerformanceMap,
  onUpdate,
  onToggleFavorite,
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
  const [detailExerciseId, setDetailExerciseId] = useState(null);
  const [photoPreviewExerciseId, setPhotoPreviewExerciseId] = useState(null);
  const exerciseOptions = useMemo(
    () => getExerciseOptions(workouts, workout, exerciseFilter, mediaLibrary, favoriteExercises),
    [workouts, workout, exerciseFilter, mediaLibrary, favoriteExercises],
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
          media: normalizeExerciseMedia({ ...exercise, name }, meta),
          sets: previousSets.length
            ? previousSets.map((set) => createSetForTracking(nextTracking, set))
            : exercise.sets.map((set) => normalizeSet(set, nextTracking)),
        };
      }),
    });
  };

  const updateExerciseMedia = (exerciseId, media) => {
    onUpdate({
      ...workout,
      exercises: workout.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              media: normalizeExerciseMedia({ ...exercise, media }, getExerciseMeta(exercise.name)),
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

  const addExercise = (name = '', sourceExercise = null) => {
    const finalName = String(name || '').trim();
    const previousSets = findLastExerciseSets(workouts, workout.id, finalName);
    const option = sourceExercise || exerciseOptions.find((exercise) => normalizeName(exercise.name) === normalizeName(finalName));
    const nextExercise = createExercise(finalName, previousSets);
    nextExercise.media = normalizeExerciseMedia(option || nextExercise, getExerciseMeta(finalName));
    onUpdate({
      ...workout,
      exercises: [...workout.exercises, nextExercise],
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

  const detailExercise = workout.exercises.find((exercise) => exercise.id === detailExerciseId);
  const photoPreviewExercise = workout.exercises.find((exercise) => exercise.id === photoPreviewExerciseId);

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
          const records = exerciseRecords.get(normalizeName(exercise.name));
          const prBySetId = getExerciseSetPrMap(exercise, records);
          const showAddedWeight = normalizeTracking(exercise.tracking) === 'bodyweight'
            && (bodyweightWeightVisible[exercise.id]
              || exercise.sets.some((set) => String(set.weight || set.previousWeight || '').trim()));
          const fields = getExerciseFieldConfig(exercise, showAddedWeight);
          const isFavorite = favoriteExercises.map(normalizeName).includes(normalizeName(exercise.name));
          return (
            <section key={exercise.id} className="exercise-card">
              <div className="exercise-card-top">
                <button
                  type="button"
                  className="exercise-thumbnail-button"
                  onClick={() => setPhotoPreviewExerciseId(exercise.id)}
                  aria-label={`Preview photo for ${exercise.name || 'exercise'}`}
                >
                  <ExerciseMediaThumbnail exercise={exercise} mediaLibrary={mediaLibrary} />
                </button>
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
                  <p className="last-time" title={lastTime ? `Previous: ${lastTime}` : 'Previous: no saved workout yet.'}>
                    {lastTime ? `Previous: ${lastTime}` : 'Previous: no saved workout yet.'}
                  </p>
                </div>
                <div className="exercise-actions">
                  <button
                    type="button"
                    className={`icon-button ${isFavorite ? 'favorite-active' : ''}`}
                    onClick={() => onToggleFavorite(exercise.name)}
                    aria-label={isFavorite ? 'Remove favorite' : 'Favorite exercise'}
                  >
                    <Star size={16} strokeWidth={2.4} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button type="button" className="icon-button" onClick={() => setDetailExerciseId(exercise.id)} aria-label="Exercise media">
                    <Info size={16} strokeWidth={2.4} />
                  </button>
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
                {exercise.sets.map((set, setIndex) => {
                  const setPrs = prBySetId.get(set.id) || [];
                  return (
                    <div key={set.id} className="set-row-wrap">
                      <div className="set-row" style={getSetGridStyle(fields.length)}>
                        <span className="set-number">{setIndex + 1}</span>
                        {fields.map((field) => (
                          <label key={field.key} className="set-field">
                            <span className="sr-only">{field.label}</span>
                            <input
                              inputMode={field.inputMode}
                              type={field.type}
                              placeholder={getSetFieldPlaceholder(set, field)}
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
                      {setPrs.length ? (
                        <div className="pr-row">
                          {setPrs.slice(0, 2).map((achievement) => (
                            achievement.info ? (
                              <button
                                key={achievement.id}
                                type="button"
                                className="pr-pill pr-info-button"
                                onClick={() => setShowOneRepMaxInfo(true)}
                              >
                                <Trophy size={12} strokeWidth={2.4} />
                                {achievement.label}
                                <Info size={12} strokeWidth={2.4} />
                              </button>
                            ) : (
                              <span key={achievement.id} className="pr-pill">
                                <Trophy size={12} strokeWidth={2.4} />
                                {achievement.label}
                              </span>
                            )
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
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
          {['All', 'Favorites', normalizeWorkoutType(workout.type), 'Push', 'Pull', 'Legs', 'Core', 'Cardio']
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
            <button key={exercise.name} type="button" className="chip rich-chip" onClick={() => addExercise(exercise.name, exercise)}>
              <ExerciseMediaThumbnail exercise={exercise} size="sm" mediaLibrary={mediaLibrary} />
              <span>
                <strong>{exercise.name}</strong>
                <small>{exercise.muscle} - {formatTrackingLabel(exercise.tracking)}</small>
              </span>
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
      <ExerciseDetailModal
        exercise={detailExercise}
        mediaLibrary={mediaLibrary}
        onClose={() => setDetailExerciseId(null)}
        onMediaChange={(media) => {
          if (detailExercise) updateExerciseMedia(detailExercise.id, media);
        }}
      />
      <PhotoPreviewModal
        exercise={photoPreviewExercise}
        mediaLibrary={mediaLibrary}
        onClose={() => setPhotoPreviewExerciseId(null)}
      />
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
        const completedExercises = workout.exercises.filter((exercise) => getCompletedSetCount(exercise) > 0);
        const totalSets = workout.exercises.reduce((total, exercise) => total + getCompletedSetCount(exercise), 0);
        const duration = getWorkoutDurationSeconds(workout);
        const exercisePreview = workout.exercises.map((exercise) => exercise.name || 'Untitled').slice(0, 3).join(' - ');
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
              <div className="history-summary">
                <button type="button" className="history-summary-main" onClick={() => setExpanded(isOpen ? null : workout.id)}>
                  <div className="history-summary-copy">
                    <div className="history-title-line">
                      <CategoryMediaBadge type={displayType} size="sm" />
                      <div>
                        <strong>{workout.label}</strong>
                        <p>{formatShortDate(workout.date)}</p>
                      </div>
                    </div>
                    <div className="history-chip-row" aria-label="Workout summary">
                      <span>{displayType}</span>
                      {formatTime(workout.startedAt) ? <span>{formatTime(workout.startedAt)}</span> : null}
                      {Number.isFinite(duration) ? <span>{formatDuration(duration)}</span> : null}
                      <span>{completedExercises.length} exercises</span>
                      <span>{totalSets} sets</span>
                      {workout.effortRating ? <span>Effort {workout.effortRating}/10</span> : null}
                    </div>
                    <p className="history-meta">{exercisePreview || 'No exercises logged'}</p>
                  </div>
                </button>
                <div className="history-actions">
                  <button
                    type="button"
                    className="icon-button danger history-delete-inline"
                    aria-label={`Delete ${workout.label || 'workout'}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (expanded === workout.id) setExpanded(null);
                      setSwipedId(null);
                      onDeleteWorkout(workout.id);
                    }}
                  >
                    <Trash2 size={15} strokeWidth={2.3} />
                  </button>
                  <span className={`history-chevron ${isOpen ? 'open' : ''}`} aria-hidden="true">
                    <ArrowDown size={18} strokeWidth={2.35} />
                  </span>
                </div>
              </div>
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
                {['All', ...CATEGORY_ORDER].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`segmented-chip ${category === item ? 'active' : ''}`}
                      onClick={() => {
                        setCategory(item);
                        setExerciseName('');
                      }}
                    >
                      <CategoryMediaBadge type={item} size="sm" />
                      {item}
                    </button>
                ))}
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

function BackupScreen({ workouts, templates, activeWorkout, favoriteExercises, appleWatchReminderEnabled, onAppleWatchReminderChange, onImport, onReset }) {
  const exportData = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            version: 2,
            exportedAt: nowValue(),
            workouts,
            templates,
            activeWorkout,
            favoriteExercises,
          },
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    );
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
          <p>Export creates a backup JSON file you can keep in Files or iCloud. Import restores workouts, templates, favorites, and your active draft.</p>
          <p>Machine photos are saved inside that backup as small compressed image data, so camera-added thumbnails can come back on import.</p>
          <p>Clearing Safari website data, removing browser app data, or switching phones without restoring that browser data can remove your saved workouts. Normal app updates and page refreshes should not delete them.</p>
        </div>
        <section className="preference-card">
          <div>
            <strong>Workout reminders</strong>
            <p>Show the Apple Watch reminder before starting workouts.</p>
          </div>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={appleWatchReminderEnabled}
              onChange={(event) => onAppleWatchReminderChange(event.target.checked)}
            />
            <span>Remind me before workouts</span>
          </label>
        </section>
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
  const [favoriteExercises, setFavoriteExercises] = useState(() => readFavoriteExercises());
  const [mediaLibrary, setMediaLibrary] = useState(() => readCachedWgerMedia());
  const [showResumePrompt, setShowResumePrompt] = useState(() => Boolean(readActiveWorkout()));
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_REST_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const [timerEndsAt, setTimerEndsAt] = useState(null);
  const [confettiBursts, setConfettiBursts] = useState([]);
  const [appleWatchReminderEnabled, setAppleWatchReminderEnabled] = useState(() => readAppleWatchReminderEnabled());
  const [pendingWorkoutStart, setPendingWorkoutStart] = useState(null);

  useEffect(() => {
    saveData({ workouts });
  }, [workouts]);

  useEffect(() => {
    saveTemplates(workoutTemplates);
  }, [workoutTemplates]);

  useEffect(() => {
    saveFavoriteExercises(favoriteExercises);
  }, [favoriteExercises]);

  useEffect(() => {
    if (Object.keys(mediaLibrary).length) return undefined;
    let cancelled = false;
    fetchWgerExerciseMedia()
      .then((media) => {
        if (cancelled || !Object.keys(media).length) return;
        saveCachedWgerMedia(media);
        setMediaLibrary(media);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const exerciseRecords = useMemo(() => calculateExerciseRecords(workouts), [workouts]);
  const lastPerformanceMap = useMemo(() => getLastPerformanceMap(workouts), [workouts]);

  useEffect(() => {
    if (!activeWorkout) {
      saveActiveWorkout(null);
      setSaveStatus('idle');
      return undefined;
    }

    setSaveStatus(navigator.onLine === false ? 'pending' : 'saving');
    const saveTimer = window.setTimeout(() => {
      saveActiveWorkout(activeWorkout);
      setSaveStatus(navigator.onLine === false ? 'pending' : 'saved');
    }, 220);
    return () => window.clearTimeout(saveTimer);
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

  const beginWorkout = (type, customName = '') => {
    if (hasWorkoutContent(activeWorkout) && !window.confirm('Start a new workout and replace your unfinished draft?')) return;
    setActiveWorkout(createWorkout(type, customName, workouts));
    setShowResumePrompt(false);
    setTab('Workout');
    setTimerActive(false);
    setTimerEndsAt(null);
    setSecondsLeft(DEFAULT_REST_SECONDS);
  };

  const startWorkout = (type, customName = '') => {
    if (appleWatchReminderEnabled) {
      setPendingWorkoutStart({ kind: 'workout', type, customName });
      return;
    }
    beginWorkout(type, customName);
  };

  const beginTemplateWorkout = (templateId) => {
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

  const startTemplateWorkout = (templateId) => {
    if (appleWatchReminderEnabled) {
      setPendingWorkoutStart({ kind: 'template', templateId });
      return;
    }
    beginTemplateWorkout(templateId);
  };

  const continuePendingWorkoutStart = (remindBeforeWorkouts) => {
    saveAppleWatchReminderEnabled(remindBeforeWorkouts);
    setAppleWatchReminderEnabled(remindBeforeWorkouts);
    const pending = pendingWorkoutStart;
    setPendingWorkoutStart(null);
    if (!pending) return;
    if (pending.kind === 'template') beginTemplateWorkout(pending.templateId);
    else beginWorkout(pending.type, pending.customName);
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
    const effortInput = window.prompt('Effort rating for this workout? 1-10, optional:', activeWorkout.effortRating || '');
    const effortRating = effortInput === null ? activeWorkout.effortRating || '' : String(effortInput || '').trim().slice(0, 2);
    const completedWorkout = { ...activeWorkout, effortRating, completedAt: nowValue() };
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
      const restoredActiveWorkout = parsed.activeWorkout && Array.isArray(parsed.activeWorkout.exercises)
        ? normalizeWorkout(parsed.activeWorkout)
        : null;
      setFavoriteExercises(Array.isArray(parsed.favoriteExercises) ? parsed.favoriteExercises.filter(Boolean) : []);
      setActiveWorkout(restoredActiveWorkout);
      saveActiveWorkout(restoredActiveWorkout);
      setShowResumePrompt(Boolean(restoredActiveWorkout));
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

  const toggleFavoriteExercise = (exerciseName) => {
    const name = String(exerciseName || '').trim();
    if (!name) return;
    setFavoriteExercises((current) => {
      const exists = current.some((item) => normalizeName(item) === normalizeName(name));
      return exists ? current.filter((item) => normalizeName(item) !== normalizeName(name)) : [...current, name].sort((a, b) => a.localeCompare(b));
    });
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
    setFavoriteExercises([]);
    setMediaLibrary({});
    setAppleWatchReminderEnabled(true);
    setActiveWorkout(null);
    saveActiveWorkout(null);
    setShowResumePrompt(false);
    setTimerActive(false);
    setTimerEndsAt(null);
    setSecondsLeft(DEFAULT_REST_SECONDS);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(WORKOUT_TEMPLATES_KEY);
    localStorage.removeItem(FAVORITE_EXERCISES_KEY);
    localStorage.removeItem(WGER_MEDIA_CACHE_KEY);
    localStorage.removeItem(APPLE_WATCH_REMINDER_KEY);
    localStorage.removeItem(RECOVERY_DAYS_KEY);
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
          mediaLibrary={mediaLibrary}
          favoriteExercises={favoriteExercises}
          saveStatus={saveStatus}
          exerciseRecords={exerciseRecords}
          lastPerformanceMap={lastPerformanceMap}
          onUpdate={(nextWorkout) => (nextWorkout === null ? changeWorkout() : setActiveWorkout(nextWorkout))}
          onToggleFavorite={toggleFavoriteExercise}
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
          workouts={workouts}
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
      <BackupScreen
        workouts={workouts}
        templates={workoutTemplates}
        activeWorkout={activeWorkout}
        favoriteExercises={favoriteExercises}
        appleWatchReminderEnabled={appleWatchReminderEnabled}
        onAppleWatchReminderChange={(enabled) => {
          saveAppleWatchReminderEnabled(enabled);
          setAppleWatchReminderEnabled(enabled);
        }}
        onImport={importText}
        onReset={resetData}
      />
    );

  return (
    <div className="app-shell">
      <ConfettiLayer bursts={confettiBursts} />
      {content}
      {pendingWorkoutStart ? (
        <AppleWatchReminderModal
          defaultRemind={appleWatchReminderEnabled}
          onContinue={continuePendingWorkoutStart}
          onClose={() => setPendingWorkoutStart(null)}
        />
      ) : null}
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
}
