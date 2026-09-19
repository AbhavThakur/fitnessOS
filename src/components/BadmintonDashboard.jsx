import React from "react";

export function BadmintonDashboard({ matches, onDeleteMatch }) {
  const totalMatches = matches.length;
  const totalWins = matches.filter((m) => m.isWin).length;
  const winRate =
    totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

  // Only average over matches that actually recorded a heart rate; ignore zero/missing.
  const hrMatches = matches.filter((m) => Number(m.peakHr) > 0);
  const avgPeakHr =
    hrMatches.length > 0
      ? Math.round(
          hrMatches.reduce((a, c) => a + Number(c.peakHr), 0) /
            hrMatches.length,
        )
      : null;

  const avgDurationMin =
    totalMatches > 0
      ? Math.round(
          matches.reduce((a, c) => a + Number(c.durationSec || 0), 0) /
            totalMatches /
            60,
        )
      : null;

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
              color: "var(--color-success)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            RALLY TRACKER & CARDIOVASCULAR INTENSITY
          </span>
          <h2 style={{ marginTop: "4px" }}>Badminton Match Arena</h2>
          <p style={{ marginTop: "4px" }}>
            Scores logged with the physical UP/DOWN buttons on your Amazfit
            T-Rex 3. Heart rate is read live from the watch's PPG sensor during
            the match.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-header">
            <span className="metric-title">WIN RATE</span>
            <span className="metric-icon">🏆</span>
          </div>
          <div
            className="metric-value"
            style={{ color: "var(--color-success)" }}
          >
            {totalMatches > 0 ? `${winRate}%` : "—"}
          </div>
          <div className="metric-subtext">
            {totalWins} Wins / {totalMatches} Matches
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-header">
            <span className="metric-title">AVG PEAK HEART RATE</span>
            <span className="metric-icon">❤️</span>
          </div>
          <div
            className="metric-value"
            style={{ color: "var(--color-accent)" }}
          >
            {avgPeakHr != null ? (
              <>
                {avgPeakHr} <span style={{ fontSize: "1.1rem" }}>BPM</span>
              </>
            ) : (
              "—"
            )}
          </div>
          <div className="metric-subtext">
            {avgPeakHr != null
              ? `Across ${hrMatches.length} matches with HR data`
              : "No heart rate recorded yet"}
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-header">
            <span className="metric-title">AVG MATCH DURATION</span>
            <span className="metric-icon">⏱️</span>
          </div>
          <div className="metric-value">
            {avgDurationMin != null ? (
              <>
                {avgDurationMin}{" "}
                <span style={{ fontSize: "1.1rem" }}>MINS</span>
              </>
            ) : (
              "—"
            )}
          </div>
          <div className="metric-subtext">21-Point BWF Rally Rules</div>
        </div>
      </div>

      {/* Match History Scorecards */}
      <div className="glass-card" style={{ padding: "28px" }}>
        <h3 style={{ marginBottom: "20px" }}>🏸 Official Match Scorecards</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {matches.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "36px 20px",
                color: "var(--text-muted)",
              }}
            >
              <div style={{ fontSize: "2.2rem", marginBottom: "10px" }}>🏸</div>
              <div
                style={{
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  fontSize: "1rem",
                }}
              >
                No Badminton matches logged yet
              </div>
              <div style={{ fontSize: "0.82rem", marginTop: "6px" }}>
                Launch a Badminton match on your Amazfit T-Rex 3, track sets and
                score, then sync to see your head-to-head match stats here!
              </div>
            </div>
          ) : (
            matches.map((m) => (
              <div
                key={m.id}
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
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "12px",
                      background: m.isWin
                        ? "rgba(0, 230, 118, 0.15)"
                        : "rgba(255, 61, 0, 0.15)",
                      color: m.isWin
                        ? "var(--color-success)"
                        : "var(--color-accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "800",
                      fontSize: "0.85rem",
                    }}
                  >
                    {m.isWin ? "WIN" : "LOSS"}
                  </div>

                  <div>
                    <div
                      style={{
                        fontWeight: "700",
                        fontSize: "1.05rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      vs {m.opponent || "Opponent"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {new Date(m.date).toLocaleDateString()} • Duration:{" "}
                      {Math.round(m.durationSec / 60)} mins • {m.device}
                    </div>
                  </div>
                </div>

                {/* Set Scores */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "24px" }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.6rem",
                        fontWeight: "800",
                        color: "var(--text-primary)",
                      }}
                    >
                      {m.setsWonP1} - {m.setsWonP2}
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      Sets Won
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
                        color: "var(--color-accent)",
                      }}
                    >
                      {Number(m.peakHr) > 0
                        ? `🔥 ${m.peakHr} BPM Peak`
                        : "❤️ No HR recorded"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {Number(m.avgHr) > 0
                        ? `Avg: ${m.avgHr} BPM`
                        : `Score: ${m.player1Score}-${m.player2Score}`}
                    </div>
                  </div>

                  {onDeleteMatch && (
                    <button
                      type="button"
                      title="Delete this match from the cloud"
                      onClick={() =>
                        confirm("Delete this match for all devices?") &&
                        onDeleteMatch(m.id)
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
