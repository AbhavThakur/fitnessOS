import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { MobileTopBar } from "./components/MobileTopBar";
import { RecoveryCard } from "./components/RecoveryCard";
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
          if (cloudData.liveBattery) {
            if (cloudData.liveBattery.primary != null && nextProfiles.primary) {
              nextProfiles.primary = {
                ...nextProfiles.primary,
                battery: cloudData.liveBattery.primary,
              };
            }
            if (cloudData.liveBattery.partner != null && nextProfiles.partner) {
              nextProfiles.partner = {
                ...nextProfiles.partner,
                battery: cloudData.liveBattery.partner,
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
          return {
            ...prev,
            profiles: nextProfiles,
            workoutLogs: cloudData.workoutLogs ?? prev.workoutLogs,
            badmintonMatches:
              cloudData.badmintonMatches ?? prev.badmintonMatches,
            runningSessions: cloudData.runningSessions ?? prev.runningSessions,
            routines:
              cloudData.routines?.length > 0
                ? cloudData.routines
                : prev.routines,
            prs: cloudData.prs ?? prev.prs,
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
    recoveryScore: 88,
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
    setData((prev) => ({
      ...prev,
      routines: [
        ...prev.routines.filter(
          (r) => r.profileId && r.profileId !== currentProfileKey,
        ),
        ...newRoutines.map((r) => ({ ...r, profileId: currentProfileKey })),
      ],
    }));
  };

  const handleSimulateBadminton = () => {
    const isPrimary = currentProfileKey === "primary";
    const newMatch = {
      id: "b_" + Date.now(),
      profileId: currentProfileKey,
      date: Date.now(),
      player1Score: 21,
      player2Score: 18,
      setsWonP1: 2,
      setsWonP2: 0,
      durationSec: 2280,
      peakHr: isPrimary ? 176 : 170,
      avgHr: isPrimary ? 150 : 145,
      isWin: true,
      opponent: isPrimary ? "Vikram S." : "Pooja R.",
      device: currentProfile.device,
    };
    setData((prev) => ({
      ...prev,
      badmintonMatches: [newMatch, ...prev.badmintonMatches],
    }));
  };

  const handleSimulateH2HBadminton = () => {
    const now = Date.now();
    const matchPrimary = {
      id: "b_h2h_" + now,
      profileId: "primary",
      date: now,
      player1Score: 21,
      player2Score: 19,
      setsWonP1: 2,
      setsWonP2: 1,
      durationSec: 2580,
      peakHr: 178,
      avgHr: 152,
      isWin: true,
      opponent: "Wife (Amazfit)",
      isHeadToHead: true,
      device: "Amazfit T-Rex 3",
    };
    const matchPartner = {
      id: "b_h2h_" + now + "_p",
      profileId: "partner",
      date: now,
      player1Score: 19,
      player2Score: 21,
      setsWonP1: 1,
      setsWonP2: 2,
      durationSec: 2580,
      peakHr: 174,
      avgHr: 148,
      isWin: false,
      opponent: "You (T-Rex 3)",
      isHeadToHead: true,
      device: "Amazfit Watch",
    };
    setData((prev) => ({
      ...prev,
      badmintonMatches: [matchPrimary, matchPartner, ...prev.badmintonMatches],
    }));
  };

  const handleSimulateRun = () => {
    const isPrimary = currentProfileKey === "primary";
    const newRun = {
      id: "r_" + Date.now(),
      profileId: currentProfileKey,
      date: Date.now(),
      distanceKm: isPrimary ? 6.2 : 4.5,
      durationSec: isPrimary ? 1980 : 1665,
      avgPace: isPrimary ? "5:19" : "6:10",
      avgHr: isPrimary ? 156 : 150,
      calories: isPrimary ? 430 : 295,
      cadence: isPrimary ? 168 : 172,
      device: currentProfile.device,
    };
    setData((prev) => ({
      ...prev,
      runningSessions: [newRun, ...prev.runningSessions],
    }));
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
                        🔋 {currentProfile.battery || 85}% BATTERY
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
                  <div className="metric-subtext">GPS & Cadence Tracked</div>
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
                      No sessions logged yet. Tap "Log Workout" on your Amazfit
                      watch or simulate one!
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
          {activeTab === "comparison" && (
            <CouplesComparisonView
              data={data}
              onSimulateMatch={handleSimulateH2HBadminton}
            />
          )}

          {/* Gym Studio Tab */}
          {activeTab === "gym" && (
            <GymDashboard
              routines={profileRoutines}
              workoutLogs={profileWorkouts}
              onUpdateRoutines={handleUpdateRoutines}
              prs={derivedPrs}
              onOpenPlateCalc={() => setActiveTab("plates")}
              profileId={currentProfileKey}
            />
          )}

          {/* Badminton Tab */}
          {activeTab === "badminton" && (
            <BadmintonDashboard
              matches={profileBadminton}
              onSimulateMatch={handleSimulateBadminton}
            />
          )}

          {/* Running Tab */}
          {activeTab === "running" && (
            <RunningDashboard
              runs={profileRuns}
              onSimulateRun={handleSimulateRun}
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
