import React from "react";

export function ReadinessCoachBanner({
  profile,
  recovery,
  totalVolumeKg,
  weeklyTargetKg = 50000,
  streakDays = 0,
}) {
  const hasData = recovery?.hasData;
  const score = hasData ? recovery.score : 0;
  const progressPct = Math.min(
    100,
    Math.round((totalVolumeKg / weeklyTargetKg) * 100),
  );

  let coachAdvice = {
    title: "NO SESSIONS LOGGED YET",
    color: "var(--text-muted)",
    bg: "rgba(255, 255, 255, 0.03)",
    border: "var(--border-subtle)",
    icon: "👋",
    body: "Sync your Amazfit watch or log a workout to get a real readiness read based on your training history.",
  };

  if (hasData && score >= 85) {
    coachAdvice = {
      title: "PRIMED FOR MAXIMUM INTENSITY",
      color: "var(--color-primary)",
      bg: "rgba(255, 184, 0, 0.08)",
      border: "rgba(255, 184, 0, 0.25)",
      icon: "⚡",
      body: `You last trained ${recovery.hoursSinceLastSession}h ago and are well within your weekly volume target. Today is a strong window to attack heavy lifts, hit PRs, or play a high-speed badminton match!`,
    };
  } else if (hasData && score >= 70) {
    coachAdvice = {
      title: "STEADY WORK CAPACITY ACTIVE",
      color: "var(--color-success)",
      bg: "rgba(0, 230, 118, 0.08)",
      border: "rgba(0, 230, 118, 0.25)",
      icon: "🔋",
      body: `You last trained ${recovery.hoursSinceLastSession}h ago. Good day for accessory volume, hypertrophy work (8-12 reps), or steady cardio endurance.`,
    };
  } else if (hasData) {
    coachAdvice = {
      title: "RECOVERY EMPHASIS DAY",
      color: "var(--color-cyan)",
      bg: "rgba(0, 229, 255, 0.08)",
      border: "rgba(0, 229, 255, 0.25)",
      icon: "🛡️",
      body: `You trained just ${recovery.hoursSinceLastSession}h ago and/or are near your weekly volume target. Suggest a deload session, mobility drills, or a casual aerobic run.`,
    };
  }

  return (
    <div
      className="glass-card"
      style={{
        padding: "20px 24px",
        marginBottom: "26px",
        background: coachAdvice.bg,
        border: `1px solid ${coachAdvice.border}`,
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.4rem",
              flexShrink: 0,
            }}
          >
            {coachAdvice.icon}
          </div>
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: "800",
                color: coachAdvice.color,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              READINESS COACH • {profile?.name}
            </div>
            <h3 style={{ margin: "3px 0 6px 0", fontSize: "1.15rem" }}>
              {coachAdvice.title}
            </h3>
            <p
              style={{
                fontSize: "0.86rem",
                color: "var(--text-secondary)",
                margin: 0,
                maxWidth: "780px",
              }}
            >
              {coachAdvice.body}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(0,0,0,0.3)",
            padding: "6px 14px",
            borderRadius: "10px",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>🔥</span>
          <div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
              }}
            >
              Streak
            </div>
            <div
              style={{
                fontSize: "0.9rem",
                fontWeight: "800",
                color: "var(--color-primary)",
              }}
            >
              {streakDays} Day{streakDays === 1 ? "" : "s"} Active
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Progress Bar */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "14px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.78rem",
            marginBottom: "6px",
          }}
        >
          <span style={{ color: "var(--text-muted)" }}>
            🎯 Weekly Target:{" "}
            <strong>
              {totalVolumeKg.toLocaleString()} /{" "}
              {weeklyTargetKg.toLocaleString()} kg
            </strong>
          </span>
          <span style={{ fontWeight: "800", color: "var(--color-primary)" }}>
            {progressPct}% COMPLETED
          </span>
        </div>
        <div
          style={{
            height: "7px",
            background: "rgba(255,255,255,0.08)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progressPct}%`,
              height: "100%",
              background:
                "linear-gradient(90deg, var(--color-primary), #ff8800)",
              borderRadius: "4px",
              transition: "width 0.8s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}
