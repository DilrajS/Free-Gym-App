import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChartColumn,
  ClipboardList,
  Dumbbell,
  FileArchive,
  FileUp,
  History,
  Plus,
  SquarePen,
  Trash2,
  X,
} from 'lucide-react';

const STORAGE_KEY = 'gym-log-v2';
const TABS = ['Workout', 'History', 'Charts', 'Backup'];
const TEMPLATE_ORDER = ['Push', 'Pull', 'Upper', 'Lower', 'Full Body'];
const TEMPLATES = {
  Upper: ['Bench Press', 'Barbell Row', 'Shoulder Press', 'Lat Pulldown', 'Bicep Curl'],
  Push: ['Bench Press', 'Incline DB Press', 'Shoulder Press', 'Lateral Raise', 'Tricep Pushdown'],
  Pull: ['Lat Pulldown', 'Barbell Row', 'Seated Cable Row', 'Hammer Curl', 'Face Pull'],
  Lower: ['Back Squat', 'Leg Press', 'Romanian Deadlift', 'Leg Curl', 'Calf Raise'],
  'Full Body': ['Back Squat', 'Bench Press', 'Deadlift', 'Pull Up', 'Farmer Carry'],
};
const DEFAULT_REST_SECONDS = 120;

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

function createExercise(name = '') {
  return { id: createId(), name, sets: [{ id: createId(), weight: '', reps: '' }] };
}

function getTemplateForType(type, workouts) {
  if (type === 'Custom') return ['Exercise 1'];

  const lastWorkoutOfType = [...workouts]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .find((workout) => workout.type === type);

  if (lastWorkoutOfType?.exercises?.length) {
    const savedNames = lastWorkoutOfType.exercises
      .map((exercise) => String(exercise.name || '').trim())
      .filter(Boolean);

    if (savedNames.length) return savedNames;
  }

  return TEMPLATES[type] || [];
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
    exercises: template.map((name) => createExercise(name)),
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
  const names = new Set();
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

function getExerciseSeries(workouts, exerciseName) {
  const normalized = normalizeName(exerciseName);
  if (!normalized) return [];

  return workouts
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .flatMap((workout) =>
      (workout.exercises || [])
        .filter((exercise) => normalizeName(exercise.name) === normalized)
        .map((exercise) => {
          const best = Math.max(
            ...exercise.sets
              .map((set) => Number(set.weight))
              .filter((value) => Number.isFinite(value)),
            0,
          );

          return best > 0 ? { date: workout.date, weight: best } : null;
        }),
    )
    .filter(Boolean);
}

function BottomNav({ tab, onChange }) {
  const tabIcons = {
    Workout: Dumbbell,
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
  onUpdate,
  onFinish,
  timerActive,
  secondsLeft,
  onResetTimer,
}) {
  const [exerciseInput, setExerciseInput] = useState('');
  const exerciseNames = useMemo(() => collectExerciseNames(workouts, workout), [workouts, workout]);
  const suggestions = useMemo(() => {
    const fromTemplate = TEMPLATES[workout.type] || [];
    return [...new Set([...fromTemplate, ...exerciseNames])];
  }, [exerciseNames, workout.type]);

  const updateExerciseName = (exerciseId, name) => {
    onUpdate({
      ...workout,
      exercises: workout.exercises.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, name } : exercise,
      ),
    });
  };

  const updateSet = (exerciseId, setId, field, value) => {
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
          sets: [...exercise.sets, { id: createId(), weight: previous?.weight || '', reps: '' }],
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
          ? [createExercise('')]
          : workout.exercises.filter((exercise) => exercise.id !== exerciseId),
    });
  };

  const handleRepsBlur = (exerciseId, setId) => {
    const exercise = workout.exercises.find((item) => item.id === exerciseId);
    const set = exercise?.sets.find((item) => item.id === setId);
    if (set && set.weight !== '' && set.reps !== '') onResetTimer();
  };

  return (
    <div className="screen">
      <header className="session-header">
        <div>
          <button type="button" className="back-link" onClick={() => onUpdate(null)}>
            <ArrowLeft size={16} strokeWidth={2.3} />
            Change workout
          </button>
          <h2>{workout.label}</h2>
          <p>{formatLongDate(workout.date)}</p>
        </div>
        <TimerPill secondsLeft={secondsLeft} active={timerActive} onReset={onResetTimer} />
      </header>

      <div className="exercise-stack">
        {workout.exercises.map((exercise, index) => {
          const lastTime = findLastExercise(workouts, workout.id, exercise.name);
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
                    {suggestions.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
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
                  <div key={set.id} className="set-row">
                    <span className="set-number">{setIndex + 1}</span>
                    <input
                      inputMode="decimal"
                      type="number"
                      placeholder="0"
                      value={set.weight}
                      onChange={(event) => updateSet(exercise.id, set.id, 'weight', event.target.value)}
                    />
                    <input
                      inputMode="numeric"
                      type="number"
                      placeholder="0"
                      value={set.reps}
                      onChange={(event) => updateSet(exercise.id, set.id, 'reps', event.target.value)}
                      onBlur={() => handleRepsBlur(exercise.id, set.id)}
                    />
                    <button type="button" className="mini-icon-button" onClick={() => removeSet(exercise.id, set.id)} aria-label="Remove set">
                      <X size={16} strokeWidth={2.4} />
                    </button>
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
        <div className="add-row">
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
            {suggestions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
        <div className="chip-row">
          {suggestions.slice(0, 8).map((name) => (
            <button key={name} type="button" className="chip" onClick={() => addExercise(name)}>
              {name}
            </button>
          ))}
        </div>
      </section>

      <button type="button" className="finish-button" onClick={onFinish}>
        Finish workout
      </button>
    </div>
  );
}

function HistoryScreen({ workouts, onOpenWorkout }) {
  const [expanded, setExpanded] = useState(null);
  const ordered = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="screen stack-md">
      <header className="panel-header history-header">
        <div className="panel-title-wrap">
          <History size={22} strokeWidth={2.2} />
          <div>
            <h2>History</h2>
            <p>Your saved workouts by day, time, and type.</p>
          </div>
        </div>
      </header>
      {!ordered.length ? (
        <div className="empty-panel">No workouts saved yet.</div>
      ) : null}
      {ordered.map((workout) => {
        const isOpen = expanded === workout.id;
        return (
          <section key={workout.id} className="history-card">
            <button type="button" className="history-summary" onClick={() => setExpanded(isOpen ? null : workout.id)}>
              <div>
                <strong>{formatShortDate(workout.date)} - {workout.label}</strong>
                <p className="history-time">
                  {workout.type}
                  {formatTime(workout.startedAt) ? ` • ${formatTime(workout.startedAt)}` : ''}
                </p>
                <p className="history-meta">
                  {workout.exercises.map((exercise) => exercise.name || 'Untitled').slice(0, 3).join(' • ')}
                </p>
              </div>
              <span>{isOpen ? '-' : '+'}</span>
            </button>
            {isOpen ? (
              <div className="history-details">
                {workout.exercises.map((exercise) => (
                  <div key={exercise.id} className="history-exercise">
                    <h3>{exercise.name || 'Untitled Exercise'}</h3>
                    <p>
                      {exercise.sets
                        .filter((set) => set.weight !== '' && set.reps !== '')
                        .map(formatSetSummary)
                        .join(', ') || 'No completed sets'}
                    </p>
                  </div>
                ))}
                <button type="button" className="text-link danger-link" onClick={() => onOpenWorkout(workout.id)}>
                  Copy into a new workout
                </button>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

function ChartsScreen({ workouts }) {
  const exerciseNames = collectExerciseNames(workouts, null);
  const [selected, setSelected] = useState(exerciseNames[0] || '');

  useEffect(() => {
    if (!selected && exerciseNames[0]) setSelected(exerciseNames[0]);
  }, [exerciseNames, selected]);

  const points = useMemo(() => getExerciseSeries([...workouts], selected), [workouts, selected]);

  return (
    <div className="screen stack-md">
      <header className="panel-header">
        <h2>Charts</h2>
      </header>
      {!exerciseNames.length ? (
        <div className="empty-panel">Save a workout first to unlock charts.</div>
      ) : (
        <>
          <select value={selected} onChange={(event) => setSelected(event.target.value)} className="select-input">
            {exerciseNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <section className="chart-card">
            {points.length < 2 ? (
              <div className="empty-panel chart-empty">Need at least two logged days for a trend line.</div>
            ) : (
              <MiniChart points={points} />
            )}
          </section>
        </>
      )}
    </div>
  );
}

function MiniChart({ points }) {
  const width = 320;
  const height = 220;
  const pad = 24;
  const max = Math.max(...points.map((point) => point.weight));
  const min = Math.min(...points.map((point) => point.weight));
  const range = Math.max(max - min, 1);
  const stepX = (width - pad * 2) / Math.max(points.length - 1, 1);

  const coords = points.map((point, index) => {
    const x = pad + index * stepX;
    const y = height - pad - ((point.weight - min) / range) * (height - pad * 2);
    return { ...point, x, y };
  });

  const path = coords.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label="Progress chart">
        <path d={path} fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round" />
        {coords.map((point) => (
          <g key={`${point.date}-${point.weight}`}>
            <circle cx={point.x} cy={point.y} r="4.5" fill="#e5484d" />
            <text x={point.x} y={point.y - 10} textAnchor="middle" className="chart-point-label">
              {point.weight}
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

function BackupScreen({ workouts, onImport, onReset }) {
  const exportData = () => {
    const blob = new Blob([JSON.stringify({ workouts }, null, 2)], { type: 'application/json' });
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
        <h2>Backup</h2>
      </header>
      <section className="backup-card">
        <div className="backup-copy">
          <p>Your workouts stay on this device unless you export a backup file.</p>
          <p>Export saves all workouts into one JSON file. Import replaces the workouts currently on this phone with the file you choose.</p>
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
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_REST_SECONDS);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    saveData({ workouts });
  }, [workouts]);

  useEffect(() => {
    if (!timerActive) return undefined;
    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setTimerActive(false);
          return DEFAULT_REST_SECONDS;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerActive]);

  const startWorkout = (type, customName = '') => {
    setActiveWorkout(createWorkout(type, customName, workouts));
    setTab('Workout');
    setTimerActive(false);
    setSecondsLeft(DEFAULT_REST_SECONDS);
  };

  const finishWorkout = () => {
    if (!activeWorkout) return;
    setWorkouts((current) => [activeWorkout, ...current]);
    setActiveWorkout(null);
    setTimerActive(false);
    setSecondsLeft(DEFAULT_REST_SECONDS);
    setTab('History');
  };

  const importText = (text) => {
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed.workouts)) throw new Error('Invalid backup file');
      setWorkouts(parsed.workouts);
      setActiveWorkout(null);
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
    });
    setTab('Workout');
  };

  const resetData = () => {
    if (!window.confirm('Delete all saved workouts from this device? This cannot be undone unless you exported a backup first.')) return;
    setWorkouts([]);
    setActiveWorkout(null);
    localStorage.removeItem(STORAGE_KEY);
    setTab('Workout');
  };

  const content =
    tab === 'Workout' ? (
      activeWorkout ? (
        <ActiveWorkoutScreen
          workout={activeWorkout}
          workouts={workouts}
          onUpdate={setActiveWorkout}
          onFinish={finishWorkout}
          timerActive={timerActive}
          secondsLeft={secondsLeft}
          onResetTimer={() => {
            setSecondsLeft(DEFAULT_REST_SECONDS);
            setTimerActive(true);
          }}
        />
      ) : (
        <ChooseWorkoutScreen onStart={startWorkout} />
      )
    ) : tab === 'History' ? (
      <HistoryScreen workouts={workouts} onOpenWorkout={copyWorkoutToActive} />
    ) : tab === 'Charts' ? (
      <ChartsScreen workouts={workouts} />
    ) : (
      <BackupScreen workouts={workouts} onImport={importText} onReset={resetData} />
    );

  return (
    <div className="app-shell">
      {content}
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
}
