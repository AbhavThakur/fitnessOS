import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeStreakDays,
  computeRecoveryModel,
  computeMuscleBreakdown,
  computeHrZoneBreakdown,
  computePersonalRecords,
} from "../src/lib/metrics.js";

const DAY = 86400000;
const now = Date.now();

test("computeStreakDays: empty activity returns 0", () => {
  assert.equal(computeStreakDays([]), 0);
});

test("computeStreakDays: counts consecutive days including today", () => {
  const activities = [
    { date: now },
    { date: now - DAY },
    { date: now - 2 * DAY },
  ];
  assert.equal(computeStreakDays(activities), 3);
});

test("computeStreakDays: stops at a gap", () => {
  const activities = [{ date: now }, { date: now - 3 * DAY }];
  assert.equal(computeStreakDays(activities), 1);
});

test("computeStreakDays: streak continues even if today has no session yet", () => {
  const activities = [{ date: now - DAY }, { date: now - 2 * DAY }];
  assert.equal(computeStreakDays(activities), 2);
});

test("computeRecoveryModel: no activity yields honest empty state, not a fake score", () => {
  const result = computeRecoveryModel([], 0, 45000);
  assert.equal(result.hasData, false);
  assert.equal(result.score, null);
});

test("computeRecoveryModel: recent heavy session yields lower score than a well-rested one", () => {
  const justTrained = computeRecoveryModel(
    [{ date: now - 1 * 3600000 }],
    40000,
    45000,
  );
  const wellRested = computeRecoveryModel(
    [{ date: now - 48 * 3600000 }],
    5000,
    45000,
  );
  assert.ok(justTrained.hasData && wellRested.hasData);
  assert.ok(
    wellRested.score > justTrained.score,
    `expected well-rested score (${wellRested.score}) > just-trained score (${justTrained.score})`,
  );
});

test("computeRecoveryModel: score stays within 0-100 bounds", () => {
  const r1 = computeRecoveryModel([{ date: now }], 100000, 45000);
  const r2 = computeRecoveryModel([{ date: now - 1000 * 3600000 }], 0, 45000);
  assert.ok(r1.score >= 0 && r1.score <= 100);
  assert.ok(r2.score >= 0 && r2.score <= 100);
});

const lookup = (id) => {
  const table = {
    bench_press: { name: "Bench Press", category: "Chest" },
    squat: { name: "Back Squat", category: "Legs" },
  };
  return table[id];
};

test("computeMuscleBreakdown: returns null when no set has real data", () => {
  const logs = [{ completedSets: [] }, { completedSets: undefined }];
  assert.equal(computeMuscleBreakdown(logs, lookup), null);
});

test("computeMuscleBreakdown: weights by volume and normalizes to 100%", () => {
  const logs = [
    {
      completedSets: [
        { exerciseId: "bench_press", weight: 80, reps: 10 }, // 800 vol
        { exerciseId: "squat", weight: 100, reps: 8 }, // 800 vol
      ],
    },
  ];
  const result = computeMuscleBreakdown(logs, lookup);
  const total = result.reduce((sum, r) => sum + r.pct, 0);
  assert.ok(total >= 99 && total <= 101);
  assert.equal(result.find((r) => r.name === "Chest").pct, 50);
  assert.equal(result.find((r) => r.name === "Legs").pct, 50);
});

test("computeHrZoneBreakdown: returns null with no cardio sessions", () => {
  assert.equal(computeHrZoneBreakdown([]), null);
});

test("computeHrZoneBreakdown: buckets full session duration into the matching zone", () => {
  const sessions = [
    { avgHr: 100, durationSec: 600 }, // Z1
    { avgHr: 160, durationSec: 1800 }, // Z4
  ];
  const result = computeHrZoneBreakdown(sessions);
  const z1 = result.find((z) => z.key === "z1");
  const z4 = result.find((z) => z.key === "z4");
  assert.equal(z1.pct, 25);
  assert.equal(z4.pct, 75);
});

test("computePersonalRecords: keeps the highest estimated 1RM per exercise", () => {
  const logs = [
    {
      date: now - DAY,
      completedSets: [{ exerciseId: "bench_press", weight: 80, reps: 10 }],
    },
    {
      date: now,
      completedSets: [{ exerciseId: "bench_press", weight: 85, reps: 8 }],
    },
  ];
  const prs = computePersonalRecords(logs, lookup);
  assert.equal(prs.length, 1);
  assert.equal(prs[0].weight, 85);
});

test("computePersonalRecords: ignores zero/invalid sets", () => {
  const logs = [
    { completedSets: [{ exerciseId: "bench_press", weight: 0, reps: 10 }] },
  ];
  assert.equal(computePersonalRecords(logs, lookup).length, 0);
});
