/**
 * Pure data-derivation helpers for IronPulse metrics.
 *
 * These replace values that were previously hardcoded (recovery score, HRV,
 * streak, muscle split, HR zones) with real numbers computed from synced
 * watch data. Every function returns `null`/an empty result when there isn't
 * enough real data yet, rather than fabricating a plausible-looking number.
 */

const DAY_MS = 86400000;

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Consecutive days (including today) with at least one logged activity.
 * Stops at the first gap when walking backward from today.
 */
export function computeStreakDays(activities) {
  if (!activities || activities.length === 0) return 0;

  const activeDays = new Set(activities.map((a) => startOfDay(a.date)));
  let streak = 0;
  let cursor = startOfDay(Date.now());

  // Today may not have an activity yet; only break the streak on a truly
  // missed prior day, not on "haven't trained yet today".
  if (!activeDays.has(cursor)) {
    cursor -= DAY_MS;
  }

  while (activeDays.has(cursor)) {
    streak += 1;
    cursor -= DAY_MS;
  }

  return streak;
}

/**
 * Real, honestly-labeled recovery model derived from time since the last
 * session and how close the athlete is to their weekly volume target.
 * Not a substitute for an HRV sensor reading — no such data is synced.
 */
export function computeRecoveryModel(
  activities,
  totalVolumeKg,
  weeklyTargetKg,
) {
  if (!activities || activities.length === 0) {
    return {
      hasData: false,
      score: null,
      statusLabel: "No Sessions Yet",
      hoursSinceLastSession: null,
      readinessNote: "Ready",
    };
  }

  const mostRecent = activities.reduce((a, b) => (a.date > b.date ? a : b));
  const hoursSince = Math.max(0, (Date.now() - mostRecent.date) / 3600000);

  // Recovery climbs toward 100 over ~48h of rest, capped, then trimmed by
  // how close the athlete already is to their weekly target (more volume
  // logged this week => slightly less headroom before the next hard session).
  const restComponent = Math.min(100, (hoursSince / 48) * 100);
  const loadRatio =
    weeklyTargetKg > 0 ? Math.min(1.2, totalVolumeKg / weeklyTargetKg) : 0;
  const loadPenalty = loadRatio * 15;
  const score = Math.max(
    15,
    Math.min(100, Math.round(restComponent - loadPenalty + 40)),
  );

  let statusLabel = "Recovering";
  let readinessNote = "Prioritize Rest";
  if (score >= 85) {
    statusLabel = "Optimal";
    readinessNote = "High Readiness";
  } else if (score >= 70) {
    statusLabel = "Good";
    readinessNote = "Steady Capacity";
  }

  return {
    hasData: true,
    score,
    statusLabel,
    hoursSinceLastSession: Math.round(hoursSince),
    readinessNote,
  };
}

/**
 * Real muscle-group volume split derived from completed_sets synced from the
 * watch. Returns null when no workout has any recorded set-level data yet
 * (rather than a fabricated default split).
 */
export function computeMuscleBreakdown(workoutLogs, getExerciseDetails) {
  const tally = {};
  let totalVolume = 0;

  for (const workout of workoutLogs || []) {
    for (const set of workout.completedSets || []) {
      const volume = Number(set.weight || 0) * Number(set.reps || 0);
      if (volume <= 0) continue;
      const category = getExerciseDetails(set.exerciseId)?.category || "Other";
      tally[category] = (tally[category] || 0) + volume;
      totalVolume += volume;
    }
  }

  if (totalVolume === 0) return null;

  return Object.entries(tally)
    .map(([name, volume]) => ({
      name,
      pct: Math.round((volume / totalVolume) * 100),
    }))
    .sort((a, b) => b.pct - a.pct);
}

const HR_ZONES = [
  {
    key: "z1",
    label: "Z1 Warmup / Active Recovery",
    range: "90-115 BPM",
    color: "#00e5ff",
    max: 115,
  },
  {
    key: "z2",
    label: "Z2 Aerobic Base & Fat Burn",
    range: "116-135 BPM",
    color: "#00e676",
    max: 135,
  },
  {
    key: "z3",
    label: "Z3 Cardio Endurance",
    range: "136-155 BPM",
    color: "#ffb800",
    max: 155,
  },
  {
    key: "z4",
    label: "Z4 Hard / Threshold",
    range: "156-172 BPM",
    color: "#ff9100",
    max: 172,
  },
  {
    key: "z5",
    label: "Z5 Peak / VO2 Max",
    range: "173+ BPM",
    color: "#ff1744",
    max: Infinity,
  },
];

function zoneForHr(avgHr) {
  return HR_ZONES.find((z) => avgHr <= z.max) || HR_ZONES[HR_ZONES.length - 1];
}

/**
 * Real time-in-zone approximation: each cardio session's full duration is
 * bucketed into the zone matching its recorded average heart rate. Coarser
 * than a per-second HR stream (which watch doesn't sync), but every number
 * here traces back to a real synced session instead of a static mock split.
 */
export function computeHrZoneBreakdown(cardioSessions) {
  const totals = {};
  let totalSec = 0;

  for (const session of cardioSessions || []) {
    const avgHr = Number(session.avgHr || session.avg_hr || 0);
    const durationSec = Number(
      session.durationSec || session.duration_sec || 0,
    );
    if (avgHr <= 0 || durationSec <= 0) continue;
    const zone = zoneForHr(avgHr);
    totals[zone.key] = (totals[zone.key] || 0) + durationSec;
    totalSec += durationSec;
  }

  if (totalSec === 0) return null;

  return HR_ZONES.map((zone) => ({
    ...zone,
    pct: Math.round(((totals[zone.key] || 0) / totalSec) * 100),
  }));
}

/**
 * Client-derived personal records (estimated 1RM via Epley formula) computed
 * from completed_sets, since the watch does not currently write to the `prs`
 * table. Returns the best set per exercise across all synced workouts.
 */
export function computePersonalRecords(workoutLogs, getExerciseDetails) {
  const best = {};

  for (const workout of workoutLogs || []) {
    for (const set of workout.completedSets || []) {
      const weight = Number(set.weight || 0);
      const reps = Number(set.reps || 0);
      if (weight <= 0 || reps <= 0) continue;
      const est1RM =
        reps <= 1 ? weight : Math.round(weight * (1 + reps / 30) * 10) / 10;

      const existing = best[set.exerciseId];
      if (!existing || est1RM > existing.est1RM) {
        best[set.exerciseId] = {
          exerciseId: set.exerciseId,
          exercise: getExerciseDetails(set.exerciseId)?.name || set.exerciseId,
          weight,
          reps,
          est1RM,
          date: workout.date,
        };
      }
    }
  }

  return Object.values(best).sort((a, b) => b.est1RM - a.est1RM);
}
