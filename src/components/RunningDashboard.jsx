import React from "react";

function formatPace(secPerKm) {
  if (!secPerKm || !isFinite(secPerKm)) return null;
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function RunningDashboard({ runs, onDeleteRun, weeklyGoalKm = 20 }) {
  const totalDistance = runs.reduce((a, c) => a + Number(c.distanceKm || 0), 0);
  const totalCalories = runs.reduce((a, c) => a + Number(c.calories || 0), 0);
  const totalDurationSec = runs.reduce(
    (a, c) => a + Number(c.durationSec || 0),
    0,
  );
  const progressPercent = Math.min(
    100,
    Math.round((totalDistance / weeklyGoalKm) * 100),
  );

  // Distance-weighted average pace across all runs (total time / total distance).
  const avgPace =
    totalDistance > 0 ? formatPace(totalDurationSec / totalDistance) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Top Banner */}
      <div
        className="glass-card"
        style={{
          padding: "28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: "700",
              color: "var(--color-cyan)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            GPS DISTANCE & HEART RATE TELEMETRY
          </span>
          <h2 style={{ marginTop: "4px" }}>Running & Cardio Hub</h2>
          <p style={{ marginTop: "4px" }}>
            Distance and pace come from the watch's GPS fixes; heart rate from
            its PPG sensor. Indoor runs without a GPS lock fall back to an
            estimate.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-header">
            <span className="metric-title">TOTAL DISTANCE</span>
            <span className="metric-icon">🗺️</span>
          </div>
          <div className="metric-value" style={{ color: "var(--color-cyan)" }}>
            {totalDistance.toFixed(1)}{" "}
            <span style={{ fontSize: "1.1rem" }}>KM</span>
          </div>
          <div className="metric-subtext">
            <span>Goal: {weeklyGoalKm} km / week</span>
          </div>
          {/* Progress Bar */}
          <div
            style={{
              width: "100%",
              height: "6px",
              background: "rgba(255,255,255,0.08)",
              borderRadius: "3px",
              marginTop: "12px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                background: "var(--color-cyan)",
                borderRadius: "3px",
                transition: "width 0.8s ease",
              }}
            ></div>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-header">
            <span className="metric-title">AVG RUNNING PACE</span>
            <span className="metric-icon">⚡</span>
          </div>
          <div className="metric-value">
            {avgPace ? (
              <>
                {avgPace} <span style={{ fontSize: "1.1rem" }}>/KM</span>
              </>
            ) : (
              "—"
            )}
          </div>
          <div className="metric-subtext">
            {avgPace
              ? "Distance-weighted across all runs"
              : "No runs logged yet"}
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-header">
            <span className="metric-title">ENERGY EXPENDITURE</span>
            <span className="metric-icon">🔥</span>
          </div>
          <div
            className="metric-value"
            style={{ color: "var(--color-primary)" }}
          >
            {totalCalories} <span style={{ fontSize: "1.1rem" }}>KCAL</span>
          </div>
          <div className="metric-subtext">Across {runs.length} Sessions</div>
        </div>
      </div>

      {/* Running Session History */}
      <div className="glass-card" style={{ padding: "28px" }}>
        <h3 style={{ marginBottom: "20px" }}>🏃 Logged Running Sessions</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {runs.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "36px 20px",
                color: "var(--text-muted)",
              }}
            >
              <div style={{ fontSize: "2.2rem", marginBottom: "10px" }}>🏃</div>
              <div
                style={{
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  fontSize: "1rem",
                }}
              >
                No running sessions logged yet
              </div>
              <div style={{ fontSize: "0.82rem", marginTop: "6px" }}>
                Track an outdoor run on your Amazfit T-Rex 3, then sync
                telemetry to see your pace, distance, heart rate, and cadence
                here!
              </div>
            </div>
          ) : (
            runs.map((r) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "18px 22px",
                  background: "rgba(0, 0, 0, 0.35)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  flexWrap: "wrap",
                  gap: "14px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "16px" }}
                >
                  <div
                    className="activity-badge badge-running"
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "12px",
                      fontSize: "1.3rem",
                    }}
                  >
                    🏃
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: "700",
                        fontSize: "1.1rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      {r.distanceKm} km Outdoor Run
                    </div>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {new Date(r.date).toLocaleDateString()} • Time:{" "}
                      {Math.floor(r.durationSec / 60)}:
                      {(r.durationSec % 60).toString().padStart(2, "0")} •{" "}
                      {r.device}
                    </div>
                  </div>
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "24px" }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.4rem",
                        fontWeight: "800",
                        color: "var(--color-cyan)",
                      }}
                    >
                      {r.avgPace}
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      Avg Pace /km
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: "right",
                      borderLeft: "1px solid var(--border-subtle)",
                      paddingLeft: "20px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: "700",
                        color: "var(--color-primary)",
                      }}
                    >
                      {Number(r.avgHr) > 0
                        ? `❤️ ${r.avgHr} BPM`
                        : "❤️ No HR recorded"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {r.calories} kcal
                    </div>
                  </div>

                  {onDeleteRun && (
                    <button
                      type="button"
                      title="Delete this run from the cloud"
                      onClick={() =>
                        confirm("Delete this run for all devices?") &&
                        onDeleteRun(r.id)
                      }
                      style={{
                        background: "transparent",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        padding: "8px 10px",
                      }}
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
