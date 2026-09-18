/**
 * Supabase Client & Local Persistence Bridge
 * Multi-Athlete Cloud Sync (Husband & Wife Amazfit Wearables) with Offline Resilience
 */

import { createClient } from "@supabase/supabase-js";
import { DEFAULT_WATCH_SPLITS } from "../data/exerciseLibrary.js";

const STORAGE_KEY_CONFIG = "ironpulse_cloud_config";
const STORAGE_KEY_LOCAL_DATA = "ironpulse_web_data";
const STORAGE_KEY_ACTIVE_PROFILE = "ironpulse_active_profile";
let supabaseInstance = null;

export function getCloudConfig() {
  const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore parse error
    }
  }
  const defaultUrl = import.meta.env.VITE_SUPABASE_URL || "";
  const defaultKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
  return {
    supabaseUrl: defaultUrl,
    supabaseAnonKey: defaultKey,
    connected: Boolean(defaultUrl && defaultKey),
  };
}

export function saveCloudConfig(config) {
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  supabaseInstance = null;
}

export function getActiveProfileId() {
  return localStorage.getItem(STORAGE_KEY_ACTIVE_PROFILE) || "primary";
}

export function saveActiveProfileId(profileId) {
  localStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE, profileId);
}

// Clean Athlete Store with Default Amazfit Watch Splits
const INITIAL_MOCK_DATA = {
  profiles: {
    primary: {
      id: "primary",
      name: "You (T-Rex 3)",
      shortName: "You",
      role: "Heavy Strength & Speed",
      device: "Amazfit T-Rex 3",
      battery: 85,
      weightUnit: "kg",
      recoveryScore: 88,
      hrvRmssd: "58 ms",
      recoveryHours: "18h left",
      cnsRecovery: "Optimal",
      muscleReadiness: "High Readiness",
      weeklyVolumeTargetKg: 45000,
      weeklyDistanceTargetKm: 25,
    },
    partner: {
      id: "partner",
      name: "Wife (Amazfit)",
      shortName: "Wife",
      role: "Sculpt, Glutes & Cardio",
      device: "Amazfit Active / Balance",
      battery: 92,
      weightUnit: "kg",
      recoveryScore: 94,
      hrvRmssd: "66 ms",
      recoveryHours: "6h left",
      cnsRecovery: "Peak State",
      muscleReadiness: "Primed & Ready",
      weeklyVolumeTargetKg: 28000,
      weeklyDistanceTargetKm: 20,
    },
  },
  workoutLogs: [],
  badmintonMatches: [],
  runningSessions: [],
  routines: [
    ...DEFAULT_WATCH_SPLITS.map((s) => ({ ...s, profileId: "primary" })),
    ...DEFAULT_WATCH_SPLITS.map((s) => ({ ...s, profileId: "partner" })),
  ],
  prs: [],
};

export function getLocalStore() {
  const saved = localStorage.getItem(STORAGE_KEY_LOCAL_DATA);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed?.profiles) {
        // Purge legacy mock data IDs starting with w1, w2, w3, w_p, b1, b_p, r1, r2, r_p
        const hasLegacyDemoRoutine = (parsed.routines || []).some(
          (r) => r.id === "push_split_demo" || r.title?.includes("Demo"),
        );
        const routines =
          !hasLegacyDemoRoutine && (parsed.routines || []).length >= 6
            ? parsed.routines
            : INITIAL_MOCK_DATA.routines;

        return {
          ...parsed,
          workoutLogs: (parsed.workoutLogs || []).filter(
            (w) =>
              !w.id?.startsWith("w1") &&
              !w.id?.startsWith("w2") &&
              !w.id?.startsWith("w3") &&
              !w.id?.startsWith("w_p"),
          ),
          badmintonMatches: (parsed.badmintonMatches || []).filter(
            (b) =>
              !b.id?.startsWith("b1") &&
              !b.id?.startsWith("b_p") &&
              !b.id?.startsWith("b_h2h_1"),
          ),
          runningSessions: (parsed.runningSessions || []).filter(
            (r) =>
              !r.id?.startsWith("r1") &&
              !r.id?.startsWith("r2") &&
              !r.id?.startsWith("r_p"),
          ),
          routines,
        };
      }
    } catch {
      // ignore parse error
    }
  }
  return INITIAL_MOCK_DATA;
}

export function saveLocalStore(data) {
  localStorage.setItem(STORAGE_KEY_LOCAL_DATA, JSON.stringify(data));
}

export function getSupabase() {
  if (supabaseInstance) return supabaseInstance;
  const config = getCloudConfig();
  if (config.supabaseUrl && config.supabaseAnonKey) {
    try {
      supabaseInstance = createClient(
        config.supabaseUrl,
        config.supabaseAnonKey,
      );
      return supabaseInstance;
    } catch (e) {
      console.warn("Could not initialize Supabase:", e);
    }
  }
  return null;
}

export async function testCloudConnection(config = getCloudConfig()) {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return { success: false, error: "Supabase URL and anon key are required" };
  }

  try {
    const client = createClient(
      config.supabaseUrl.trim(),
      config.supabaseAnonKey.trim(),
    );
    const { error } = await client.from("workout_logs").select("id").limit(1);
    if (error) throw error;
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function fetchLiveSupabaseData() {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const [
      workoutsRes,
      badmintonRes,
      runningRes,
      routinesRes,
      prsRes,
      profilesRes,
    ] = await Promise.all([
      supabase
        .from("workout_logs")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("badminton_matches")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("running_sessions")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("gym_routines").select("*"),
      supabase.from("prs").select("*"),
      supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true }),
    ]);

    const failedQuery = [
      workoutsRes,
      badmintonRes,
      runningRes,
      routinesRes,
      prsRes,
      profilesRes,
    ].find((result) => result.error);
    if (failedQuery) throw failedQuery.error;

    // Extract real watch battery from most recent telemetry
    const allRecords = [
      ...(workoutsRes.data || []),
      ...(badmintonRes.data || []),
      ...(runningRes.data || []),
    ].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    const extractBattery = (deviceStr) => {
      if (!deviceStr) return null;
      const match =
        deviceStr.match(/(\d+)%\s*Bat/i) || deviceStr.match(/(\d+)%/i);
      return match ? parseInt(match[1], 10) : null;
    };

    let primaryBat = null;
    let partnerBat = null;

    for (const rec of allRecords) {
      const bat = extractBattery(rec.device);
      if (bat !== null) {
        if (
          (!rec.profile_id || rec.profile_id === "primary") &&
          primaryBat === null
        ) {
          primaryBat = bat;
        } else if (rec.profile_id === "partner" && partnerBat === null) {
          partnerBat = bat;
        }
      }
      if (primaryBat !== null && partnerBat !== null) break;
    }

    let athleteNames = null;
    if (profilesRes.data && profilesRes.data.length > 0) {
      athleteNames = {
        primary: profilesRes.data[0]?.athlete_name || "You (T-Rex 3)",
        partner: profilesRes.data[1]?.athlete_name || "Wife (Amazfit)",
      };
    }

    return {
      liveBattery: {
        primary: primaryBat,
        partner: partnerBat,
      },
      athleteNames,
      workoutLogs: (workoutsRes.data || []).map((w) => ({
        id: w.id,
        profileId: w.profile_id || "primary",
        routineId: w.routine_id,
        routineTitle: w.routine_title,
        durationSec: w.duration_sec,
        totalSets: w.total_sets,
        totalVolumeKg: Number(w.total_volume_kg),
        completedSets: Array.isArray(w.completed_sets) ? w.completed_sets : [],
        device: w.device || "Amazfit T-Rex 3",
        date: new Date(w.created_at).getTime(),
      })),
      badmintonMatches: (badmintonRes.data || []).map((b) => ({
        id: b.id,
        profileId: b.profile_id || "primary",
        date: new Date(b.created_at).getTime(),
        player1Score: b.player1_score,
        player2Score: b.player2_score,
        setsWonP1: b.sets_won_p1,
        setsWonP2: b.sets_won_p2,
        durationSec: b.duration_sec,
        peakHr: b.peak_hr,
        avgHr: b.avg_hr,
        isWin: b.is_win,
        opponent:
          b.opponent ||
          (b.profile_id === "partner" ? "You (T-Rex 3)" : "Opponent"),
        isHeadToHead:
          b.opponent?.includes("Wife") || b.opponent?.includes("You"),
        device: b.device || "Amazfit T-Rex 3",
      })),
      runningSessions: (runningRes.data || []).map((r) => ({
        id: r.id,
        profileId: r.profile_id || "primary",
        date: new Date(r.created_at).getTime(),
        distanceKm: Number(r.distance_km),
        durationSec: r.duration_sec,
        avgPace: r.avg_pace,
        avgHr: r.avg_hr,
        calories: r.calories,
        device: r.device || "Amazfit T-Rex 3",
      })),
      routines:
        routinesRes.data?.length > 0
          ? routinesRes.data.map((r) => ({
              id: r.id.replace(/_partner$/, ""),
              profileId: r.profile_id || "primary",
              title: r.title,
              subtitle: r.subtitle,
              exercises: r.exercises || [],
            }))
          : undefined,
      prs:
        prsRes.data?.length > 0
          ? prsRes.data.map((p) => ({
              profileId: p.profile_id || "primary",
              exercise: p.exercise_name,
              weight: Number(p.weight),
              reps: p.reps,
              est1RM: Number(p.estimated_1rm),
              unit: p.unit,
            }))
          : undefined,
    };
  } catch (e) {
    console.warn("Error fetching Supabase data:", e);
    return null;
  }
}

export async function updateAthleteProfileName(profileId, newName) {
  const supabase = getSupabase();
  if (!supabase)
    return { success: false, error: "Supabase client not connected" };

  try {
    const { data: existingProfiles, error: fetchErr } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (fetchErr) throw fetchErr;

    const targetRow =
      profileId === "partner" ? existingProfiles?.[1] : existingProfiles?.[0];
    if (targetRow) {
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ athlete_name: newName, updated_at: new Date().toISOString() })
        .eq("id", targetRow.id);
      if (updateErr) throw updateErr;
    } else {
      const { error: insertErr } = await supabase.from("profiles").insert({
        athlete_name: newName,
        weight_unit: "kg",
        font_scale: "large",
      });
      if (insertErr) throw insertErr;
    }
    return { success: true };
  } catch (e) {
    console.error("Error updating athlete profile name:", e);
    return { success: false, error: e.message };
  }
}

export async function pushRoutinesToCloud(routines, profileId = "primary") {
  const supabase = getSupabase();
  if (!supabase)
    return { success: false, error: "Supabase client not connected" };
  if (profileId !== "primary" && profileId !== "partner") {
    return { success: false, error: `Invalid profile ID: ${profileId}` };
  }

  try {
    const rows = routines.map((r) => ({
      id:
        profileId === "partner"
          ? `${r.id.replace(/_partner$/, "")}_partner`
          : r.id.replace(/_partner$/, ""),
      profile_id: profileId,
      title: r.title,
      subtitle: r.subtitle || "",
      exercises: r.exercises || [],
      is_custom: true,
    }));

    const { data, error } = await supabase
      .from("gym_routines")
      .upsert(rows, { onConflict: "id" });

    if (error) throw error;
    return { success: true, count: rows.length, data };
  } catch (e) {
    console.error("Error pushing routines to Supabase:", e);
    return { success: false, error: e.message };
  }
}
