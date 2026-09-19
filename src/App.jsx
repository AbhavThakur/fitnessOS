import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "./components/Sidebar";
import { MobileTopBar } from "./components/MobileTopBar";
import { RecoveryCard } from "./components/RecoveryCard";
import { BiometricsCard } from "./components/BiometricsCard";
import { GymDashboard } from "./components/GymDashboard";
import { BadmintonDashboard } from "./components/BadmintonDashboard";
import { RunningDashboard } from "./components/RunningDashboard";
import { PlateCalculatorTool } from "./components/PlateCalculatorTool";
import { WatchSyncModal } from "./components/WatchSyncModal";
import { WorkoutCharts } from "./components/WorkoutCharts";
import { CouplesComparisonView } from "./components/CouplesComparisonView";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { ReadinessCoachBanner } from "./components/ReadinessCoachBanner";
import { ProfileSettingsModal } from "./components/ProfileSettingsModal";
import { PinLockOverlay } from "./components/PinLockOverlay";
import { isAppLocked, lockApp } from "./lib/security";
import {
  computeStreakDays,
  computeRecoveryModel,
  computePersonalRecords,
} from "./lib/metrics";
import { getExerciseDetails } from "./data/exerciseLibrary";
import {
  getLocalStore,
  saveLocalStore,
  getCloudConfig,
  getActiveProfileId,
  saveActiveProfileId,
  fetchLiveSupabaseData,
  syncRoutinesToCloud,
  deleteCloudSession,
} from "./lib/supabase";

export function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeProfileId, setActiveProfileId] = useState(getActiveProfileId());
  const [data, setData] = useState(getLocalStore());
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [cloudConnected, setCloudConnected] = useState(
    getCloudConfig().connected,
  );
  const [isLocked, setIsLocked] = useState(isAppLocked());
  const [expandedActivityId, setExpandedActivityId] = useState(null);
  const [routineSyncStatus, setRoutineSyncStatus] = useState(null);
  // Profiles whose routines have local edits not yet confirmed by the cloud.
  // The poll must not overwrite these or the athlete's edit silently vanishes.
  const dirtyRoutineProfilesRef = useRef(new Set());

  useEffect(() => {
    saveLocalStore(data);
  }, [data]);

  useEffect(() => {
    saveActiveProfileId(activeProfileId);
  }, [activeProfileId]);

  // Fetch real-time data from Supabase on mount & poll every 10 seconds
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const cloudData = await fetchLiveSupabaseData();
        if (!mounted || !cloudData) return;
        setData((prev) => {
          const nextProfiles = { ...prev.profiles };
          // Battery always mirrors the cloud: the latest synced telemetry, or null
          // when that athlete has never synced (never invent a percentage).
          if (cloudData.liveBattery) {
            if (nextProfiles.primary) {
              nextProfiles.primary = {
                ...nextProfiles.primary,
                battery: cloudData.liveBattery.primary ?? null,
              };
            }
            if (nextProfiles.partner) {
              nextProfiles.partner = {
                ...nextProfiles.partner,
                battery: cloudData.liveBattery.partner ?? null,
              };
            }
          }
          if (cloudData.biometrics) {
            if (nextProfiles.primary && cloudData.biometrics.primary) {
              nextProfiles.primary = {
                ...nextProfiles.primary,
                biometrics: cloudData.biometrics.primary,
              };
            }
            if (nextProfiles.partner && cloudData.biometrics.partner) {
              nextProfiles.partner = {
                ...nextProfiles.partner,
                biometrics: cloudData.biometrics.partner,
              };
            }
          }
          if (cloudData.athleteNames) {
            if (cloudData.athleteNames.primary && nextProfiles.primary) {
              nextProfiles.primary = {
                ...nextProfiles.primary,
                name: cloudData.athleteNames.primary,
                shortName: cloudData.athleteNames.primary.split(" ")[0],
              };
            }
            if (cloudData.athleteNames.partner && nextProfiles.partner) {
              nextProfiles.partner = {
                ...nextProfiles.partner,
                name: cloudData.athleteNames.partner,
                shortName: cloudData.athleteNames.partner.split(" ")[0],
              };
            }
          }
          // Cloud is the source of truth for routines, EXCEPT for a profile
          // with a pending local edit that hasn't been confirmed by the cloud yet.
          const dirty = dirtyRoutineProfilesRef.current;
          const cloudRoutines = cloudData.routines || [];
          const mergedRoutines =
            cloudRoutines.length > 0
              ? [
                  ...cloudRoutines.filter((r) => !dirty.has(r.profileId)),
                  ...prev.routines.filter((r) => dirty.has(r.profileId)),
                ]
              : prev.routines;

          return {
            ...prev,
            profiles: nextProfiles,
            workoutLogs: cloudData.workoutLogs ?? prev.workoutLogs,
            badmintonMatches:
              cloudData.badmintonMatches ?? prev.badmintonMatches,
            runningSessions: cloudData.runningSessions ?? prev.runningSessions,
            routines: mergedRoutines,
            prs: cloudData.prs ?? [],
          };
        });
      } catch (err) {
        console.warn("Live fetch error:", err);
      }
    };

    loadData();
    const interval = setInterval(loadData, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSelectProfile = (pId) => {
    if (pId === "comparison") {
      setActiveProfileId("comparison");
      setActiveTab("comparison");
    } else {
      setActiveProfileId(pId);
      if (activeTab === "comparison") {
        setActiveTab("overview");
      }
    }
  };

  // Active athlete profile resolution
  const currentProfileKey =
    activeProfileId === "comparison" ? "primary" : activeProfileId;
  const currentProfile = data.profiles?.[currentProfileKey] || {
    name: "Athlete",
    device: "Amazfit T-Rex 3",
  };

  // Pure real athlete data from Supabase & Amazfit watch
  const profileWorkouts = data.workoutLogs.filter(
    (w) => !w.profileId || w.profileId === currentProfileKey,
  );
  const profileBadminton = data.badmintonMatches.filter(
    (b) => !b.profileId || b.profileId === currentProfileKey,
  );
  const profileRuns = data.runningSessions.filter(
    (r) => !r.profileId || r.profileId === currentProfileKey,
  );

  const profileRoutines = (data.routines || []).filter(
    (rt) => !rt.profileId || rt.profileId === currentProfileKey,
  );
  const profilePrs = (data.prs || []).filter(
    (p) => !p.profileId || p.profileId === currentProfileKey,
  );
  // The watch does not yet write to the `prs` table, so derive PRs client-side
  // from real completed_sets rather than leaving this card permanently empty.
  const derivedPrs =
    profilePrs.length > 0
      ? profilePrs
      : computePersonalRecords(profileWorkouts, getExerciseDetails).map(
          (pr) => ({
            ...pr,
            unit: currentProfile.weightUnit || "kg",
          }),
        );

  // Handlers for data updates
  const handleUpdateRoutines = (newRoutines) => {
    const profileKey = currentProfileKey;
    const tagged = newRoutines.map((r) => ({ ...r, profileId: profileKey }));

    // Mark dirty BEFORE the state update so a poll landing mid-save can't clobber it.
    dirtyRoutineProfilesRef.current.add(profileKey);
    setData((prev) => ({
      ...prev,
      routines: [
        ...prev.routines.filter(
          (r) => r.profileId && r.profileId !== profileKey,
        ),
        ...tagged,
      ],
    }));

    // Write-through: the cloud is what the watch reads, so an edit that only
    // lives in this browser's localStorage is not really saved.
    setRoutineSyncStatus({ type: "pending", text: "Saving to cloud…" });
    syncRoutinesToCloud(tagged, profileKey).then((res) => {
      dirtyRoutineProfilesRef.current.delete(profileKey);
      if (res.success) {
        setRoutineSyncStatus({
          type: "success",
          text: "✓ Saved & synced to watch",
        });
        setTimeout(() => setRoutineSyncStatus(null), 3000);
      } else {
        setRoutineSyncStatus({
          type: "error",
          text: `Saved locally only — cloud sync failed: ${res.error}`,
        });
      }
    });
  };

  const handleDeleteSession = async (kind, id) => {
    const listKey = {
      gym: "workoutLogs",
      badminton: "badmintonMatches",
      running: "runningSessions",
    }[kind];
    if (!listKey) return;

    // Optimistic removal; the next poll confirms against the cloud.
    setData((prev) => ({
      ...prev,
      [listKey]: prev[listKey].filter((s) => s.id !== id),
    }));

    const res = await deleteCloudSession(kind, id);
    if (!res.success) {
      alert(`Could not delete from cloud: ${res.error}`);
    }
  };

  // Calculate high-level athlete metrics for active profile
  const totalVolumeKg = profileWorkouts.reduce(
    (a, c) => a + Number(c.totalVolumeKg || 0),
    0,
  );
  const totalKm = profileRuns.reduce(
    (a, c) => a + Number(c.distanceKm || 0),
    0,
  );
  const badmintonWins = profileBadminton.filter((m) => m.isWin).length;

  // Combined chronological recent activity feed for active profile
  const combinedActivities = [
    ...profileWorkouts.map((l) => ({
      ...l,
      type: "gym",
      title: l.routineTitle,
      sub: `${Number(l.totalVolumeKg).toLocaleString()} kg • ${l.totalSets} sets`,
    })),
    ...profileBadminton.map((m) => ({
      ...m,
      type: "badminton",
      title: `Badminton vs ${m.opponent || "Opponent"}`,
      sub: `Score: ${m.setsWonP1}-${m.setsWonP2} • Peak HR: ${m.peakHr} BPM`,
    })),
    ...profileRuns.map((r) => ({
      ...r,
      type: "running",
      title: `${r.distanceKm} km Run`,
      sub: `Pace: ${r.avgPace}/km • ${r.calories} kcal`,
    })),
  ].sort((a, b) => b.date - a.date);

  // Real recovery/streak metrics derived from actual synced sessions, not mock profile fields.
  const streakDays = computeStreakDays(combinedActivities);
  const recovery = computeRecoveryModel(
    combinedActivities,
    totalVolumeKg,
    currentProfile.weeklyVolumeTargetKg || 45000,
  );

  return (
    <div className="app-shell">
      {/* Desktop Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeProfileId={activeProfileId}
        onSelectProfile={handleSelectProfile}
        profiles={data.profiles}
        cloudConnected={cloudConnected}
        onOpenSync={() => setIsSyncModalOpen(true)}
        onOpenProfileSettings={() => setIsProfileModalOpen(true)}
        onLockApp={() => {
          lockApp();
          setIsLocked(true);
        }}
      />

      {/* Mobile Sticky Top Header */}
      <MobileTopBar
        activeTab={activeTab}
        activeProfileId={activeProfileId}
        onSelectProfile={handleSelectProfile}
        profiles={data.profiles}
        cloudConnected={cloudConnected}
        onOpenSync={() => setIsSyncModalOpen(true)}
        onOpenProfileSettings={() => setIsProfileModalOpen(true)}
        onLockApp={() => {
          lockApp();
          setIsLocked(true);
        }}
      />

      {/* Main Content Area */}
      <div className="app-layout">
        <main className="main-content">
          {activeTab === "overview" && (
            <div>
              {/* Athlete Header */}
              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "14px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: "800",
                          color: "var(--color-primary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        AMAZFIT {currentProfile.device?.toUpperCase()} •{" "}
                        {currentProfile.role?.toUpperCase()}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          background: "rgba(0, 230, 118, 0.15)",
                          color: "var(--color-success)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontWeight: "700",
                        }}
                      >
                        🔋 {currentProfile.battery ?? "—"}% BATTERY
                      </span>
                    </div>
                    <h1 style={{ marginTop: "2px" }}>
                      Welcome back, {currentProfile.name}
                    </h1>
                    <p style={{ marginTop: "6px", maxWidth: "650px" }}>
                      Unified multi-sport telemetry: Strength load, badminton
                      matches, and outdoor runs synced directly from your
                      Amazfit watch.
                    </p>
                  </div>

                  {/* Live Watch Status Badge & Edit Names Trigger */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "rgba(0, 230, 118, 0.12)",
                        padding: "6px 12px",
                        borderRadius: "10px",
                        border: "1px solid rgba(0, 230, 118, 0.3)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-success)",
                          fontWeight: "700",
                        }}
                      >
                        🟢 Live Watch Cloud Active
                      </span>
                    </div>
                    <button
                      onClick={() => setIsProfileModalOpen(true)}
                      className="btn-secondary btn-sm"
                      style={{ fontSize: "0.78rem", padding: "6px 14px" }}
                    >
                      ✏️ Edit Athlete Names
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Readiness Coach & Daily Guidance Banner */}
              <ReadinessCoachBanner
                profile={currentProfile}
                recovery={recovery}
                totalVolumeKg={totalVolumeKg}
                weeklyTargetKg={currentProfile.weeklyVolumeTargetKg || 50000}
                streakDays={streakDays}
              />

              {/* Real-time Health & Biometrics Hub (Heart Rate Curve, Sleep Hypnogram, Steps) */}
              <BiometricsCard
                profile={currentProfile}
                biometrics={currentProfile.biometrics}
              />

              {/* Top Metrics Row */}
              <div className="metrics-grid">
                {/* Circular Recovery Card */}
                <RecoveryCard profile={currentProfile} recovery={recovery} />

                {/* Gym Volume Card */}
                <div className="glass-card metric-card">
                  <div className="metric-header">
                    <span className="metric-title">TOTAL STRENGTH TONNAGE</span>
                    <span className="metric-icon">🏋️</span>
                  </div>
                  <div
                    className="metric-value"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {totalVolumeKg.toLocaleString()}{" "}
                    <span style={{ fontSize: "1.1rem" }}>KG</span>
                  </div>
                  <div className="metric-subtext">
                    Across {profileWorkouts.length} Logged Sessions
                  </div>
                </div>

                {/* Badminton Matches Card */}
                <div className="glass-card metric-card">
                  <div className="metric-header">
                    <span className="metric-title">BADMINTON COURT RECORD</span>
                    <span className="metric-icon">🏸</span>
                  </div>
                  <div
                    className="metric-value"
                    style={{ color: "var(--color-success)" }}
                  >
                    {badmintonWins}{" "}
                    <span style={{ fontSize: "1.1rem" }}>WINS</span>
                  </div>
                  <div className="metric-subtext">
                    {profileBadminton.length} Matches Logged on Watch
                  </div>
                </div>

                {/* Running Distance Card */}
                <div className="glass-card metric-card">
                  <div className="metric-header">
                    <span className="metric-title">
                      OUTDOOR RUNNING DISTANCE
                    </span>
                    <span className="metric-icon">🏃</span>
                  </div>
                  <div
                    className="metric-value"
                    style={{ color: "var(--color-cyan)" }}
                  >
                    {totalKm.toFixed(1)}{" "}
                    <span style={{ fontSize: "1.1rem" }}>KM</span>
                  </div>
                  <div className="metric-subtext">
                    GPS Distance & Heart Rate Tracked
                  </div>
                </div>
              </div>

              {/* Interactive Visual Training Charts (Volume, HR Zones, Muscle Split, Consistency Heatmap) */}
              <WorkoutCharts
                workoutLogs={profileWorkouts}
                runningSessions={profileRuns}
                badmintonMatches={profileBadminton}
                profile={currentProfile}
              />

              {/* Two Column Layout: Recent Unified Feed & Quick Splits */}
              <div className="dashboard-columns">
                {/* Left Column: Combined Activity Feed */}
                <div className="glass-card" style={{ padding: "24px" }}>
                  <div
                    className="metric-header"
                    style={{ marginBottom: "18px" }}
                  >
                    <span className="metric-title">
                      RECENT ATHLETIC SESSIONS
                    </span>
                    <span className="metric-icon">⚡</span>
                  </div>

                  {combinedActivities.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "var(--text-muted)",
                      }}
                    >
                      No sessions logged yet. Finish a workout, match or run on
                      your Amazfit watch and tap Sync — it will appear here.
                    </div>
                  ) : (
                    <div>
                      {combinedActivities.slice(0, 5).map((act) => {
                        const hasSetDetail =
                          act.type === "gym" &&
                          (act.completedSets || []).length > 0;
                        const isExpanded = expandedActivityId === act.id;
                        return (
                          <div
                            key={act.id}
                            className="activity-item"
                            style={{
                              flexDirection: "column",
                              alignItems: "stretch",
                              cursor: hasSetDetail ? "pointer" : "default",
                            }}
                            onClick={() =>
                              hasSetDetail &&
                              setExpandedActivityId(isExpanded ? null : act.id)
                            }
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "14px",
                                }}
                              >
                                <div
                                  className={`activity-badge ${
                                    act.type === "gym"
                                      ? "badge-gym"
                                      : act.type === "badminton"
                                        ? "badge-badminton"
                                        : "badge-running"
                                  }`}
                                >
                                  {act.type === "gym"
                                    ? "🏋️"
                                    : act.type === "badminton"
                                      ? "🏸"
                                      : "🏃"}
                                </div>
                                <div>
                                  <div
                                    style={{
                                      fontWeight: "700",
                                      fontSize: "0.95rem",
                                    }}
                                  >
                                    {act.title}
                                    {hasSetDetail && (
                                      <span
                                        style={{
                                          color: "var(--text-muted)",
                                          fontWeight: 400,
                                        }}
                                      >
                                        {" "}
                                        {isExpanded ? "▲" : "▼"}
                                      </span>
                                    )}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "0.78rem",
                                      color: "var(--text-secondary)",
                                    }}
                                  >
                                    {act.sub}
                                  </div>
                                </div>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                }}
                              >
                                <div style={{ textAlign: "right" }}>
                                  <div
                                    style={{
                                      fontSize: "0.75rem",
                                      color: "var(--text-muted)",
                                    }}
                                  >
                                    {new Date(act.date).toLocaleDateString(
                                      undefined,
                                      { month: "short", day: "numeric" },
                                    )}
                                    {" · "}
                                    {new Date(act.date).toLocaleTimeString(
                                      undefined,
                                      { hour: "2-digit", minute: "2-digit" },
                                    )}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "0.7rem",
                                      color: "var(--color-success)",
                                      fontWeight: "600",
                                    }}
                                  >
                                    ✓ Synced
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  title="Delete this session from the cloud"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (
                                      confirm(
                                        `Delete "${act.title}"? This removes it from the cloud for all devices.`,
                                      )
                                    ) {
                                      handleDeleteSession(act.type, act.id);
                                    }
                                  }}
                                  style={{
                                    background: "transparent",
                                    border: "1px solid var(--border-subtle)",
                                    borderRadius: "8px",
                                    color: "var(--text-muted)",
                                    cursor: "pointer",
                                    padding: "6px 8px",
                                    fontSize: "0.8rem",
                                    lineHeight: 1,
                                  }}
                                >
                                  🗑
                                </button>
                              </div>
                            </div>

                            {isExpanded && (
                              <div
                                style={{
                                  marginTop: "10px",
                                  paddingTop: "10px",
                                  borderTop: "1px solid var(--border-subtle)",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "4px",
                                }}
                              >
                                {act.completedSets.map((set, i) => (
                                  <div
                                    key={i}
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      fontSize: "0.78rem",
                                      color: "var(--text-secondary)",
                                    }}
                                  >
                                    <span>
                                      {getExerciseDetails(set.exerciseId)
                                        ?.name || set.exerciseId}{" "}
                                      · Set {set.setNumber || i + 1}
                                    </span>
                                    <span style={{ fontWeight: 600 }}>
                                      {set.weight} kg × {set.reps}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right Column: Custom Routines Quick Card */}
                <div className="glass-card" style={{ padding: "24px" }}>
                  <div
                    className="metric-header"
                    style={{ marginBottom: "18px" }}
                  >
                    <span className="metric-title">ATHLETE WORKOUT SPLITS</span>
                    <span className="metric-icon">📋</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {profileRoutines.map((routine) => (
                      <div
                        key={routine.id}
                        style={{
                          padding: "14px 16px",
                          borderRadius: "var(--radius-md)",
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid var(--border-subtle)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div
                            style={{ fontWeight: "700", fontSize: "0.9rem" }}
                          >
                            {routine.title}
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {routine.subtitle ||
                              `${routine.exercises.length} Exercises`}
                          </div>
                        </div>
                        <button
                          className="btn-secondary btn-sm"
                          onClick={() => setActiveTab("gym")}
                          style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    className="btn-primary"
                    onClick={() => setActiveTab("gym")}
                    style={{
                      width: "100%",
                      marginTop: "18px",
                      padding: "12px",
                    }}
                  >
                    Manage Routine Splits in Gym Studio →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Couples Rivalry Mode */}
          {activeTab === "comparison" && <CouplesComparisonView data={data} />}

          {/* Gym Studio Tab */}
          {activeTab === "gym" && (
            <>
              {routineSyncStatus && (
                <div
                  role="status"
                  style={{
                    marginBottom: "16px",
                    padding: "10px 16px",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    border: "1px solid",
                    borderColor:
                      routineSyncStatus.type === "error"
                        ? "rgba(255, 61, 0, 0.4)"
                        : routineSyncStatus.type === "success"
                          ? "rgba(0, 230, 118, 0.4)"
                          : "var(--border-subtle)",
                    background:
                      routineSyncStatus.type === "error"
                        ? "rgba(255, 61, 0, 0.08)"
                        : routineSyncStatus.type === "success"
                          ? "rgba(0, 230, 118, 0.08)"
                          : "rgba(255,255,255,0.03)",
                    color:
                      routineSyncStatus.type === "error"
                        ? "#ff6e40"
                        : routineSyncStatus.type === "success"
                          ? "var(--color-success)"
                          : "var(--text-secondary)",
                  }}
                >
                  {routineSyncStatus.text}
                </div>
              )}
              <GymDashboard
                routines={profileRoutines}
                workoutLogs={profileWorkouts}
                onUpdateRoutines={handleUpdateRoutines}
                prs={derivedPrs}
                onOpenPlateCalc={() => setActiveTab("plates")}
                profileId={currentProfileKey}
              />
            </>
          )}

          {/* Badminton Tab */}
          {activeTab === "badminton" && (
            <BadmintonDashboard
              matches={profileBadminton}
              onDeleteMatch={(id) => handleDeleteSession("badminton", id)}
            />
          )}

          {/* Running Tab */}
          {activeTab === "running" && (
            <RunningDashboard
              runs={profileRuns}
              onDeleteRun={(id) => handleDeleteSession("running", id)}
              weeklyGoalKm={currentProfile.weeklyDistanceTargetKm || 20}
            />
          )}

          {/* Plate Math Tab */}
          {activeTab === "plates" && <PlateCalculatorTool />}
        </main>
      </div>

      {/* Mobile Bottom Sticky Navigation */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Sync & Settings Modal */}
      <WatchSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSaveConfig={setCloudConnected}
      />

      {/* Athlete Names & Profiles Modal */}
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profiles={data.profiles}
        onUpdateProfiles={(updated) =>
          setData((prev) => ({ ...prev, profiles: updated }))
        }
      />

      {/* 4-Digit Athlete PIN Lock Screen */}
      {isLocked && <PinLockOverlay onUnlocked={() => setIsLocked(false)} />}
    </div>
  );
}

export default App;
