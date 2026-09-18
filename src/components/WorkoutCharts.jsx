import React, { useState } from "react";
import { getExerciseDetails } from "../data/exerciseLibrary";
import { computeMuscleBreakdown, computeHrZoneBreakdown } from "../lib/metrics";

export function WorkoutCharts({
  workoutLogs,
  runningSessions,
  badmintonMatches = [],
}) {
  const [activeBar, setActiveBar] = useState(null);

  // Generate 7-day volume and running distance data
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const dayLabel = daysOfWeek[d.getDay()];
    const dateStr = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const startMs = d.getTime();
    const endMs = startMs + 86400000;

    // Volume in kg on this day
    const dayVolume = workoutLogs
      .filter((w) => w.date >= startMs && w.date < endMs)
      .reduce((sum, w) => sum + (Number(w.totalVolumeKg) || 0), 0);

    // Distance in km on this day
    const dayKm = runningSessions
      .filter((r) => r.date >= startMs && r.date < endMs)
      .reduce((sum, r) => sum + (Number(r.distanceKm) || 0), 0);

    const hasGym = dayVolume > 0;
    const hasRun = dayKm > 0;

    return {
      dayLabel,
      dateStr,
      volumeKg: dayVolume,
      distanceKm: dayKm,
      hasGym,
      hasRun,
    };
  });

  // Max volume for scaling
  const maxVolume = Math.max(...last7Days.map((d) => d.volumeKg), 18000);

  // Real muscle-group split derived from synced set-level data (null when no workout has any yet).
  const muscleBreakdown = computeMuscleBreakdown(
    workoutLogs,
    getExerciseDetails,
  );

  // Real time-in-zone breakdown derived from each cardio session's recorded avg HR + duration.
  const hrZones = computeHrZoneBreakdown([
    ...runningSessions,
    ...badmintonMatches,
  ]);

  const activeDaysThisWeek = last7Days.filter(
    (d) => d.hasGym || d.hasRun,
  ).length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        marginBottom: "28px",
      }}
    >
      {/* 1. Interactive Volume Load & Distance Chart */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: "700",
                color: "var(--color-primary)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              WEEKLY TRAINING TONNAGE & DISTANCE
            </div>
            <h3 style={{ margin: "4px 0 0 0" }}>
              Training Load Distribution (7 Days)
            </h3>
          </div>
          <div style={{ display: "flex", gap: "16px", fontSize: "0.8rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "3px",
                  background: "var(--color-primary)",
                }}
              ></span>
              Gym Volume (kg)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "3px",
                  background: "var(--color-cyan)",
                }}
              ></span>
              Outdoor Run (km)
            </span>
          </div>
        </div>

        {/* SVG Interactive Bar Chart */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "180px",
            display: "flex",
            alignItems: "flex-end",
            gap: "12px",
            paddingBottom: "30px",
          }}
        >
          {/* Y Axis reference line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              borderBottom: "1px dashed rgba(255,255,255,0.08)",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              borderBottom: "1px dashed rgba(255,255,255,0.08)",
            }}
          ></div>

          {last7Days.map((day, idx) => {
            const heightPct = Math.max(
              (day.volumeKg / maxVolume) * 100,
              day.volumeKg > 0 ? 12 : 4,
            );
            const isHovered = activeBar === idx;

            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  cursor: "pointer",
                  position: "relative",
                }}
                onMouseEnter={() => setActiveBar(idx)}
                onMouseLeave={() => setActiveBar(null)}
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: `${heightPct + 10}%`,
                      background: "rgba(15, 16, 21, 0.95)",
                      border: "1px solid var(--border-active)",
                      padding: "6px 10px",
                      borderRadius: "8px",
                      whiteSpace: "nowrap",
                      fontSize: "0.75rem",
                      zIndex: 10,
                      boxShadow: "0 8px 20px rgba(0,0,0,0.6)",
                      pointerEvents: "none",
                    }}
                  >
                    <div style={{ fontWeight: "700", color: "#fff" }}>
                      {day.dayLabel} ({day.dateStr})
                    </div>
                    <div style={{ color: "var(--color-primary)" }}>
                      🏋️ {day.volumeKg.toLocaleString()} kg
                    </div>
                    {day.distanceKm > 0 && (
                      <div style={{ color: "var(--color-cyan)" }}>
                        🏃 {day.distanceKm} km
                      </div>
                    )}
                  </div>
                )}

                {/* Bar */}
                <div
                  style={{
                    width: "100%",
                    maxWidth: "42px",
                    height: `${heightPct}%`,
                    background:
                      day.volumeKg > 0
                        ? "linear-gradient(180deg, var(--color-primary) 0%, rgba(255, 184, 0, 0.35) 100%)"
                        : "rgba(255, 255, 255, 0.05)",
                    borderRadius: "6px 6px 2px 2px",
                    transition: "all 0.25s ease",
                    transform: isHovered ? "scaleY(1.05)" : "scaleY(1)",
                    boxShadow:
                      isHovered && day.volumeKg > 0
                        ? "0 0 16px var(--color-primary-glow)"
                        : "none",
                    border: isHovered
                      ? "1px solid var(--color-primary)"
                      : "1px solid transparent",
                  }}
                />

                {/* Day Label */}
                <span
                  style={{
                    position: "absolute",
                    bottom: "0",
                    fontSize: "0.75rem",
                    fontWeight: isHovered ? "700" : "500",
                    color: isHovered
                      ? "var(--color-primary)"
                      : "var(--text-muted)",
                  }}
                >
                  {day.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Dual Breakdown: HR Zones & Muscle Group Split */}
      <div className="dashboard-columns" style={{ margin: 0 }}>
        {/* Heart Rate Training Zones (Z1 - Z5) */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div className="metric-header" style={{ marginBottom: "14px" }}>
            <span className="metric-title">HEART RATE ZONES BREAKDOWN</span>
            <span className="metric-icon">❤️</span>
          </div>
          <p style={{ fontSize: "0.82rem", marginBottom: "16px" }}>
            Time-in-zone estimated from the average heart rate recorded on each
            synced badminton match and run.
          </p>

          {hrZones ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {hrZones.map((zone) => (
                <div key={zone.key}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.78rem",
                      marginBottom: "4px",
                    }}
                  >
                    <span style={{ color: zone.color }}>
                      {zone.label} ({zone.range})
                    </span>
                    <span style={{ fontWeight: "700" }}>{zone.pct}%</span>
                  </div>
                  <div
                    style={{
                      height: "7px",
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${zone.pct}%`,
                        height: "100%",
                        background: zone.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: "20px 0",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "0.85rem",
              }}
            >
              Log a badminton match or run with heart rate data to see your zone
              breakdown.
            </div>
          )}
        </div>

        {/* Muscle Volume Breakdown */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div className="metric-header" style={{ marginBottom: "14px" }}>
            <span className="metric-title">TARGET MUSCLE STIMULUS</span>
            <span className="metric-icon">🎯</span>
          </div>
          <p style={{ fontSize: "0.82rem", marginBottom: "16px" }}>
            Relative training volume distribution derived from logged sets,
            weighted by weight × reps.
          </p>

          {muscleBreakdown ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {muscleBreakdown.map((item, idx) => (
                <div key={idx}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.82rem",
                      marginBottom: "5px",
                    }}
                  >
                    <span style={{ fontWeight: "600" }}>{item.name}</span>
                    <span
                      style={{
                        color: "var(--color-primary)",
                        fontWeight: "700",
                      }}
                    >
                      {item.pct}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: "8px",
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${item.pct}%`,
                        height: "100%",
                        background:
                          idx % 2 === 0
                            ? "var(--color-primary)"
                            : "var(--color-success)",
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: "20px 0",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "0.85rem",
              }}
            >
              Log a strength workout with tracked sets on your watch to see your
              muscle split.
            </div>
          )}
        </div>
      </div>

      {/* 3. 7-Day Consistency Streak Heatmap */}
      <div className="glass-card" style={{ padding: "20px 24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: "700",
                color: "var(--color-success)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              7-DAY ATHLETE STREAK
            </div>
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: "700",
                marginTop: "2px",
              }}
            >
              🔥 {activeDaysThisWeek} Active Session
              {activeDaysThisWeek === 1 ? "" : "s"} This Week
            </div>
          </div>

          {/* Consistency Dots */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {last7Days.map((day, idx) => {
              const active = day.hasGym || day.hasRun;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "6px",
                      background: active
                        ? day.hasGym
                          ? "var(--color-primary)"
                          : "var(--color-cyan)"
                        : "rgba(255,255,255,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      color: active ? "#000" : "var(--text-muted)",
                      fontWeight: "700",
                      boxShadow: active
                        ? "0 0 10px rgba(255, 184, 0, 0.4)"
                        : "none",
                    }}
                  >
                    {active ? "✓" : "•"}
                  </div>
                  <span
                    style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}
                  >
                    {day.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
