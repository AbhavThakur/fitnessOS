import React from "react";

export function RecoveryCard({ profile, recovery }) {
  const hasData = recovery?.hasData;
  const score = hasData ? recovery.score : 0;

  // Calculate circular SVG progress
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card metric-card" style={{ gridColumn: "span 1" }}>
      <div className="metric-header">
        <span className="metric-title">TRAINING READINESS</span>
        <span className="metric-icon">🛡️</span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          margin: "14px 0",
          flexWrap: "wrap",
        }}
      >
        {/* Circular SVG Gauge */}
        <div
          style={{
            position: "relative",
            width: "110px",
            height: "110px",
            flexShrink: 0,
          }}
        >
          <svg width="110" height="110" style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx="55"
              cy="55"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="9"
              fill="transparent"
            />
            {hasData && (
              <circle
                cx="55"
                cy="55"
                r={radius}
                stroke="var(--color-success)"
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: "stroke-dashoffset 1s ease" }}
              />
            )}
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontSize: hasData ? "1.75rem" : "1rem",
                fontWeight: "800",
                fontFamily: "var(--font-display)",
                color: "var(--text-primary)",
              }}
            >
              {hasData ? `${score}%` : "—"}
            </span>
            <span
              style={{
                fontSize: "0.62rem",
                fontWeight: "700",
                color: "var(--color-success)",
                textTransform: "uppercase",
              }}
            >
              {hasData ? recovery.statusLabel : "No Data Yet"}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            minWidth: "150px",
            flex: 1,
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
              }}
            >
              Recovery Status
            </div>
            <div
              style={{
                fontSize: "0.95rem",
                fontWeight: "700",
                color: "var(--color-primary)",
              }}
            >
              {hasData ? recovery.statusLabel : "Log a session to see this"}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
              }}
            >
              Since Last Session
            </div>
            <div
              style={{
                fontSize: "0.95rem",
                fontWeight: "700",
                color: "var(--color-success)",
              }}
            >
              {hasData
                ? `${recovery.hoursSinceLastSession}h ago (${recovery.readinessNote})`
                : "—"}
            </div>
          </div>
        </div>
      </div>

      <div
        className="metric-subtext"
        style={{
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "10px",
          marginTop: "6px",
        }}
      >
        <span>
          ⌚ Amazfit {profile?.device || "Wearable"} • 🔋
          {profile?.battery || 85}% Battery
        </span>
      </div>
    </div>
  );
}
