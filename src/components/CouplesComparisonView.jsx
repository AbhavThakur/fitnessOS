import React from "react";
import { CouplesGamification } from "./CouplesGamification";

function formatMatchDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function CouplesComparisonView({ data }) {
  const { profiles, workoutLogs, badmintonMatches, runningSessions } = data;

  const primaryProfile = profiles?.primary || { name: "You (T-Rex 3)" };
  const partnerProfile = profiles?.partner || { name: "Wife (Amazfit)" };

  // Filter stats for Primary
  const primaryWorkouts = workoutLogs.filter((w) => w.profileId === "primary");
  const primaryRuns = runningSessions.filter((r) => r.profileId === "primary");
  const primaryVolume = primaryWorkouts.reduce(
    (a, c) => a + Number(c.totalVolumeKg || 0),
    0,
  );
  const primaryKm = primaryRuns.reduce(
    (a, c) => a + Number(c.distanceKm || 0),
    0,
  );

  // Filter stats for Partner
  const partnerWorkouts = workoutLogs.filter((w) => w.profileId === "partner");
  const partnerRuns = runningSessions.filter((r) => r.profileId === "partner");
  const partnerVolume = partnerWorkouts.reduce(
    (a, c) => a + Number(c.totalVolumeKg || 0),
    0,
  );
  const partnerKm = partnerRuns.reduce(
    (a, c) => a + Number(c.distanceKm || 0),
    0,
  );

  // Head to Head badminton matches
  const h2hMatches = badmintonMatches.filter(
    (m) =>
      m.isHeadToHead ||
      m.opponent?.includes("Wife") ||
      m.opponent?.includes("You"),
  );

  const primaryWins = h2hMatches.filter(
    (m) => m.profileId === "primary" && m.isWin,
  ).length;
  const partnerWins = h2hMatches.filter(
    (m) => m.profileId === "partner" && m.isWin,
  ).length;

  // Most recent head-to-head match (real data), or null when none has been played yet.
  const latestH2H =
    h2hMatches.length > 0
      ? h2hMatches.reduce((a, b) => (a.date > b.date ? a : b))
      : null;

  const primarySessions =
    primaryWorkouts.length +
    primaryRuns.length +
    badmintonMatches.filter((m) => m.profileId === "primary").length;
  const partnerSessions =
    partnerWorkouts.length +
    partnerRuns.length +
    badmintonMatches.filter((m) => m.profileId === "partner").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header Banner */}
      <div
        className="glass-card"
        style={{
          padding: "26px 30px",
          background:
            "linear-gradient(135deg, rgba(255, 61, 0, 0.15) 0%, rgba(20, 22, 30, 0.8) 100%)",
          border: "1px solid rgba(255, 61, 0, 0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: "800",
                color: "var(--color-accent)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              ⚔️ ATHLETE RIVALRY & SYNERGY
            </span>
            <h1 style={{ fontSize: "2rem", marginTop: "6px" }}>
              Couples Performance Battle
            </h1>
            <p style={{ marginTop: "6px", maxWidth: "650px" }}>
              Tracking head-to-head badminton matches, shared cardio runs, and
              combined weekly athletic volume across both Amazfit watches.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Head-to-Head Badminton Championship Card */}
      <div className="glass-card" style={{ padding: "26px" }}>
        <div className="metric-header" style={{ marginBottom: "20px" }}>
          <span className="metric-title">
            🏸 HEAD-TO-HEAD BADMINTON RIVALRY
          </span>
          <span className="metric-icon">🏆</span>
        </div>

        {/* Scoreboard Arena */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            gap: "20px",
            padding: "24px",
            background: "rgba(0,0,0,0.3)",
            borderRadius: "16px",
            border: "1px solid var(--border-subtle)",
            marginBottom: "20px",
          }}
        >
          {/* Primary Athlete (You) */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem" }}>🧔</div>
            <div
              style={{
                fontWeight: "800",
                fontSize: "1.1rem",
                marginTop: "4px",
              }}
            >
              {primaryProfile.name}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Amazfit T-Rex 3
            </div>
            <div
              style={{
                fontSize: "2.6rem",
                fontWeight: "900",
                color: "var(--color-primary)",
                marginTop: "8px",
                fontFamily: "var(--font-display)",
              }}
            >
              {primaryWins}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: "700",
                color: "var(--text-secondary)",
                textTransform: "uppercase",
              }}
            >
              MATCH WINS
            </div>
          </div>

          {/* VS Centerpiece */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "rgba(255, 61, 0, 0.2)",
                border: "2px solid var(--color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "900",
                color: "var(--color-accent)",
                fontSize: "1.1rem",
                margin: "0 auto",
              }}
            >
              VS
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                marginTop: "8px",
              }}
            >
              Best of 3 Sets
            </div>
          </div>

          {/* Partner Athlete (Wife) */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem" }}>👩</div>
            <div
              style={{
                fontWeight: "800",
                fontSize: "1.1rem",
                marginTop: "4px",
              }}
            >
              {partnerProfile.name}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Amazfit Watch
            </div>
            <div
              style={{
                fontSize: "2.6rem",
                fontWeight: "900",
                color: "var(--color-cyan)",
                marginTop: "8px",
                fontFamily: "var(--font-display)",
              }}
            >
              {partnerWins}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: "700",
                color: "var(--text-secondary)",
                textTransform: "uppercase",
              }}
            >
              MATCH WINS
            </div>
          </div>
        </div>

        {/* Latest Match Card (real head-to-head data only) */}
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {latestH2H ? (
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
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    color: "var(--color-success)",
                    textTransform: "uppercase",
                  }}
                >
                  RECENT MATCH RESULT • {formatMatchDate(latestH2H.date)}
                </span>
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    marginTop: "2px",
                  }}
                >
                  {latestH2H.profileId === "primary"
                    ? primaryProfile.name
                    : partnerProfile.name}{" "}
                  {latestH2H.isWin ? "won" : "lost"} {latestH2H.setsWonP1}–
                  {latestH2H.setsWonP2} in sets ({latestH2H.player1Score}–
                  {latestH2H.player2Score} final game)
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    marginTop: "4px",
                  }}
                >
                  ⏱️ Duration: {Math.round((latestH2H.durationSec || 0) / 60)}{" "}
                  min
                  {Number(latestH2H.peakHr) > 0
                    ? ` • Peak HR: ${latestH2H.peakHr} BPM`
                    : ""}
                </div>
              </div>
              <span
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background: "rgba(0, 230, 118, 0.15)",
                  color: "var(--color-success)",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                }}
              >
                ⚡{" "}
                {latestH2H.isWin
                  ? latestH2H.profileId === "primary"
                    ? primaryProfile.name
                    : partnerProfile.name
                  : latestH2H.profileId === "primary"
                    ? partnerProfile.name
                    : primaryProfile.name}{" "}
                took it
              </span>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                padding: "6px 0",
              }}
            >
              No head-to-head match logged yet. Play a badminton match against
              each other on your watches and it will appear here.
            </div>
          )}
        </div>
      </div>

      {/* 2. Side-by-Side Athlete Tonnage & Endurance Comparison */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {/* Your Athletic Cockpit */}
        <div
          className="glass-card"
          style={{
            padding: "24px",
            borderTop: "3px solid var(--color-primary)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: "var(--color-primary)",
                }}
              >
                PRIMARY ATHLETE
              </span>
              <h3 style={{ margin: "2px 0 0 0" }}>🧔 {primaryProfile.name}</h3>
            </div>
            <span
              style={{
                fontSize: "0.78rem",
                padding: "4px 8px",
                borderRadius: "6px",
                background: "rgba(255, 184, 0, 0.15)",
                color: "var(--color-primary)",
                fontWeight: "700",
              }}
            >
              {primarySessions} Session{primarySessions === 1 ? "" : "s"}
            </span>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "rgba(0,0,0,0.2)",
              }}
            >
              <span
                style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
              >
                Total Gym Tonnage
              </span>
              <span
                style={{ fontWeight: "800", color: "var(--color-primary)" }}
              >
                {primaryVolume.toLocaleString()} kg
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "rgba(0,0,0,0.2)",
              }}
            >
              <span
                style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
              >
                Running Distance
              </span>
              <span style={{ fontWeight: "800", color: "var(--color-cyan)" }}>
                {primaryKm.toFixed(1)} km
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "rgba(0,0,0,0.2)",
              }}
            >
              <span
                style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
              >
                Gym Sessions Logged
              </span>
              <span style={{ fontWeight: "800" }}>
                {primaryWorkouts.length}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "rgba(0,0,0,0.2)",
              }}
            >
              <span
                style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
              >
                Watch Hardware
              </span>
              <span style={{ fontWeight: "700" }}>
                {primaryProfile.device || "Amazfit T-Rex 3"} 🔋
                {primaryProfile.battery ?? "—"}%
              </span>
            </div>
          </div>
        </div>

        {/* Wife's Athletic Cockpit */}
        <div
          className="glass-card"
          style={{ padding: "24px", borderTop: "3px solid var(--color-cyan)" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: "var(--color-cyan)",
                }}
              >
                PARTNER ATHLETE
              </span>
              <h3 style={{ margin: "2px 0 0 0" }}>👩 {partnerProfile.name}</h3>
            </div>
            <span
              style={{
                fontSize: "0.78rem",
                padding: "4px 8px",
                borderRadius: "6px",
                background: "rgba(0, 229, 255, 0.15)",
                color: "var(--color-cyan)",
                fontWeight: "700",
              }}
            >
              {partnerSessions} Session{partnerSessions === 1 ? "" : "s"}
            </span>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "rgba(0,0,0,0.2)",
              }}
            >
              <span
                style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
              >
                Total Gym Tonnage
              </span>
              <span style={{ fontWeight: "800", color: "var(--color-cyan)" }}>
                {partnerVolume.toLocaleString()} kg
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "rgba(0,0,0,0.2)",
              }}
            >
              <span
                style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
              >
                Running Distance
              </span>
              <span style={{ fontWeight: "800", color: "var(--color-cyan)" }}>
                {partnerKm.toFixed(1)} km
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "rgba(0,0,0,0.2)",
              }}
            >
              <span
                style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
              >
                Gym Sessions Logged
              </span>
              <span style={{ fontWeight: "800" }}>
                {partnerWorkouts.length}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "rgba(0,0,0,0.2)",
              }}
            >
              <span
                style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
              >
                Watch Hardware
              </span>
              <span style={{ fontWeight: "700" }}>
                {partnerProfile.device || "Amazfit Watch"} 🔋
                {partnerProfile.battery ?? "—"}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Couples Quests, Trophy Arena & Real-Life Reward Vouchers */}
      <CouplesGamification data={data} />
    </div>
  );
}
