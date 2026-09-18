/**
 * Preset Workout Splits & Exercise Library (1:1 Mirrored with Amazfit Watch App)
 */

export const EXERCISE_LIBRARY = [
  // Chest
  { id: 'bench_press', name: 'Barbell Bench Press', category: 'Chest', defaultRestSec: 120, defaultSets: 4, defaultReps: 8 },
  { id: 'incline_db_press', name: 'Incline DB Press', category: 'Chest', defaultRestSec: 90, defaultSets: 3, defaultReps: 10 },
  { id: 'cable_crossover', name: 'Cable Crossover', category: 'Chest', defaultRestSec: 60, defaultSets: 3, defaultReps: 12 },
  { id: 'dips', name: 'Chest Dips', category: 'Chest', defaultRestSec: 90, defaultSets: 3, defaultReps: 10 },

  // Shoulders
  { id: 'overhead_press', name: 'Overhead Press (OHP)', category: 'Shoulders', defaultRestSec: 120, defaultSets: 4, defaultReps: 8 },
  { id: 'lateral_raise', name: 'DB Lateral Raise', category: 'Shoulders', defaultRestSec: 60, defaultSets: 4, defaultReps: 15 },
  { id: 'rear_delt_fly', name: 'Rear Delt Reverse Fly', category: 'Shoulders', defaultRestSec: 60, defaultSets: 3, defaultReps: 15 },

  // Back
  { id: 'deadlift', name: 'Conventional Deadlift', category: 'Back', defaultRestSec: 180, defaultSets: 3, defaultReps: 5 },
  { id: 'barbell_row', name: 'Barbell Bent-Over Row', category: 'Back', defaultRestSec: 90, defaultSets: 4, defaultReps: 8 },
  { id: 'lat_pulldown', name: 'Lat Pulldown', category: 'Back', defaultRestSec: 90, defaultSets: 3, defaultReps: 10 },
  { id: 'cable_row', name: 'Seated Cable Row', category: 'Back', defaultRestSec: 90, defaultSets: 3, defaultReps: 10 },
  { id: 'face_pull', name: 'Cable Face Pull', category: 'Back', defaultRestSec: 60, defaultSets: 3, defaultReps: 15 },

  // Legs
  { id: 'barbell_squat', name: 'Barbell Back Squat', category: 'Legs', defaultRestSec: 180, defaultSets: 4, defaultReps: 6 },
  { id: 'rdl', name: 'Romanian Deadlift (RDL)', category: 'Legs', defaultRestSec: 120, defaultSets: 3, defaultReps: 8 },
  { id: 'leg_press', name: 'Leg Press', category: 'Legs', defaultRestSec: 90, defaultSets: 3, defaultReps: 10 },
  { id: 'leg_extension', name: 'Leg Extension', category: 'Legs', defaultRestSec: 60, defaultSets: 3, defaultReps: 12 },
  { id: 'hamstring_curl', name: 'Lying Hamstring Curl', category: 'Legs', defaultRestSec: 60, defaultSets: 3, defaultReps: 12 },
  { id: 'calf_raise', name: 'Standing Calf Raise', category: 'Legs', defaultRestSec: 60, defaultSets: 4, defaultReps: 15 },

  // Arms
  { id: 'barbell_curl', name: 'Barbell Bicep Curl', category: 'Arms', defaultRestSec: 60, defaultSets: 3, defaultReps: 10 },
  { id: 'hammer_curl', name: 'Dumbbell Hammer Curl', category: 'Arms', defaultRestSec: 60, defaultSets: 3, defaultReps: 12 },
  { id: 'tricep_pushdown', name: 'Tricep Rope Pushdown', category: 'Arms', defaultRestSec: 60, defaultSets: 3, defaultReps: 12 },
  { id: 'skullcrushers', name: 'EZ-Bar Skullcrushers', category: 'Arms', defaultRestSec: 90, defaultSets: 3, defaultReps: 10 },

  // Core
  { id: 'plank', name: 'Weighted Plank', category: 'Core', defaultRestSec: 60, defaultSets: 3, defaultReps: 60 },
  { id: 'hanging_leg_raise', name: 'Hanging Leg Raise', category: 'Core', defaultRestSec: 60, defaultSets: 3, defaultReps: 12 },
]

export const DEFAULT_WATCH_SPLITS = [
  {
    id: 'push',
    title: 'Push Day',
    subtitle: 'Chest • Shoulders • Triceps',
    exercises: ['bench_press', 'incline_db_press', 'overhead_press', 'lateral_raise', 'tricep_pushdown'],
  },
  {
    id: 'pull',
    title: 'Pull Day',
    subtitle: 'Back • Biceps • Rear Delts',
    exercises: ['deadlift', 'lat_pulldown', 'barbell_row', 'face_pull', 'barbell_curl'],
  },
  {
    id: 'legs',
    title: 'Leg Day',
    subtitle: 'Quads • Hamstrings • Calves',
    exercises: ['barbell_squat', 'rdl', 'leg_press', 'hamstring_curl', 'calf_raise'],
  },
  {
    id: 'upper',
    title: 'Upper Body',
    subtitle: 'Chest • Back • Arms',
    exercises: ['bench_press', 'barbell_row', 'overhead_press', 'lat_pulldown', 'hammer_curl'],
  },
  {
    id: 'lower',
    title: 'Lower Body',
    subtitle: 'Squat • RDL • Core',
    exercises: ['barbell_squat', 'rdl', 'leg_extension', 'hanging_leg_raise'],
  },
  {
    id: 'freestyle',
    title: 'Freestyle Workout',
    subtitle: 'Custom / Pick on the fly',
    exercises: [],
  },
]

export function getExerciseDetails(id) {
  const ex = EXERCISE_LIBRARY.find((e) => e.id === id)
  if (ex) return ex
  return {
    id,
    name: id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    category: 'General',
    defaultRestSec: 90,
    defaultSets: 3,
    defaultReps: 10,
  }
}
