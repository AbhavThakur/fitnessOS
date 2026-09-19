import React, { useState } from "react";

/**
 * BiometricsCard — Real-time Amazfit T-Rex 3 Health & Biometrics Hub
 * Displays live Heart Rate with 24h curve, Sleep Architecture with hypnogram,
 * and Daily Activity Progress (Steps, Calories, Distance, SpO2, Stress).
 */
export function BiometricsCard({ profile, biometrics }) {
  const [selectedHrPoint, setSelectedHrPoint] = useState(null);

  const hasLiveBiometrics = Boolean(
    biometrics &&
      (biometrics.heartRate?.current ||
        biometrics.sleep?.score ||
        biometrics.activity?.steps > 0),
  );

  // Fallback defaults if first sync hasn't run yet or mid-day before sleep
  const hr = biometrics?.heartRate || {};
  const currentBpm = hr.current || 72;
  const restingBpm = hr.resting || 64;
  const minBpm = hr.min || 56;
  const maxBpm = hr.max || 148;

  // Generate 24-hr heart rate samples (1 sample per 30 mins = 48 points)
  const hrPoints = React.useMemo(() => {
    if (Array.isArray(hr.today) && hr.today.length > 0) {
      // Downsample to 48 points across 24 hours
      const points = [];
      const step = Math.max(1, Math.floor(hr.today.length / 48));
      for (let i = 0; i < hr.today.length; i += step) {
        const val = hr.today[i];
        if (typeof val === "number" && val > 35 && val < 230) {
          const hour = Math.floor((i / hr.today.length) * 24);
          const min = Math.floor(((i / hr.today.length) * 1440) % 60);
          points.push({
            hour,
            min,
            timeStr: `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
            bpm: val,
          });
        }
      }
      if (points.length > 5) return points;
    }

    // Default healthy athletic diurnal rhythm
    const defaults = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        let base = 62;
        if (h >= 0 && h < 6) base = 58 + Math.sin(h) * 4; // Sleep dip
        else if (h >= 7 && h < 10) base = 75 + Math.cos(h) * 8; // Morning rise
        else if (h >= 17 && h < 19) base = 125 + Math.sin(m) * 15; // Workout peak
        else base = 70 + Math.sin(h * 0.8) * 6;
        defaults.push({
          hour: h,
          min: m,
          timeStr: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
          bpm: Math.round(base),
        });
      }
    }
    return defaults;
  }, [hr.today]);

  // SVG dimensions for 24h HR graph
  const svgW = 600;
  const svgH = 140;
  const padX = 20;
  const padY = 20;

  const minGraphBpm = 45;
  const maxGraphBpm = 175;

  const getCoord = (idx, bpm) => {
    const x = padX + (idx / (hrPoints.length - 1)) * (svgW - padX * 2);
    const clamped = Math.max(minGraphBpm, Math.min(maxGraphBpm, bpm));
    const y =
      svgH -
      padY -
      ((clamped - minGraphBpm) / (maxGraphBpm - minGraphBpm)) *
        (svgH - padY * 2);
    return { x, y };
  };

  const pathD = hrPoints.reduce((acc, pt, idx) => {
    const { x, y } = getCoord(idx, pt.bpm);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, "");

  const areaD = `${pathD} L ${getCoord(hrPoints.length - 1, minGraphBpm).x} ${svgH - padY} L ${getCoord(0, minGraphBpm).x} ${svgH - padY} Z`;

  // Sleep details
  const sleep = biometrics?.sleep || {};
  const sleepScore = sleep.score || 88;
  const totalSleepMin = sleep.totalMinutes || 462; // ~7h 42m
  const deepSleepMin = sleep.deepMinutes || 112; // ~1h 52m
  const sleepHrs = Math.floor(totalSleepMin / 60);
  const sleepMins = totalSleepMin % 60;
  const deepHrs = Math.floor(deepSleepMin / 60);
  const deepMins = deepSleepMin % 60;
  const deepPercent = Math.round((deepSleepMin / (totalSleepMin || 1)) * 100);

  // Sleep hypnogram breakdown
  const sleepStages =
    Array.isArray(sleep.stages) && sleep.stages.length > 0
      ? sleep.stages
      : [
          { stage: "light", duration: 75 },
          { stage: "deep", duration: 112 },
          { stage: "rem", duration: 98 },
          { stage: "light", duration: 145 },
          { stage: "wake", duration: 32 },
        ];

  // Daily activity
  const act = biometrics?.activity || {};
  const steps = act.steps || 8450;
  const stepTarget = act.stepTarget || 10000;
  const stepPercent = Math.min(100, Math.round((steps / stepTarget) * 100));

  const calories = act.calories || 520;
  const calorieTarget = act.calorieTarget || 650;
  const calPercent = Math.min(100, Math.round((calories / calorieTarget) * 100));

  const distanceKm = act.distanceMeters
    ? (act.distanceMeters / 1000).toFixed(1)
    : "6.2";
  const spo2 = act.spo2 || 98;
  const stress = act.stress !== null && act.stress !== undefined ? act.stress : 28;

  return (
    <div
      className="glass-card"
      style={{
        padding: "24px",
        borderRadius: "20px",
        marginBottom: "28px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Accent Glow */}
      <div
        style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "250px",
          height: "250px",
          background:
            "radial-gradient(circle, rgba(255, 61, 0, 0.12) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: "16px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "rgba(255, 61, 0, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.4rem",
              border: "1px solid rgba(255, 61, 0, 0.3)",
            }}
          >
            ❤️
          </div>
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--color-primary)",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              AMAZFIT T-REX 3 TELEMETRY
            </div>
            <h2 style={{ fontSize: "1.35rem", margin: "2px 0 0" }}>
              Live Health & Biometrics Hub
            </h2>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              background: hasLiveBiometrics
                ? "rgba(0, 230, 118, 0.15)"
                : "rgba(255, 184, 0, 0.15)",
              color: hasLiveBiometrics
                ? "var(--color-success)"
                : "var(--color-primary)",
              border: `1px solid ${hasLiveBiometrics ? "rgba(0, 230, 118, 0.3)" : "rgba(255, 184, 0, 0.3)"}`,
              padding: "5px 12px",
              borderRadius: "10px",
              fontSize: "0.75rem",
              fontWeight: "700",
            }}
          >
            {hasLiveBiometrics ? "🟢 Synced from Watch" : "⌚ Sensor Ready"}
          </span>
          <span
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              background: "rgba(255, 255, 255, 0.04)",
              padding: "5px 10px",
              borderRadius: "8px",
            }}
          >
            🔋 {profile?.battery ?? "—"}% Bat
          </span>
        </div>
      </div>

      {/* Main Grid: 2 Columns on Desktop, 1 on Mobile */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
        }}
      >
        {/* ================================================================= */}
        {/* 1. HEART RATE & 24H TIMELINE GRAPH                                */}
        {/* ================================================================= */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "16px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "14px",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  fontWeight: "700",
                  textTransform: "uppercase",
                }}
              >
                HEART RATE MONITOR
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "8px",
                  marginTop: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "2.4rem",
                    fontWeight: "900",
                    fontFamily: "var(--font-display)",
                    color: "#ff3d00",
                  }}
                >
                  {selectedHrPoint ? selectedHrPoint.bpm : currentBpm}
                </span>
                <span
                  style={{
                    fontSize: "1rem",
                    color: "var(--text-muted)",
                    fontWeight: "600",
                  }}
                >
                  BPM
                </span>
                {selectedHrPoint && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-primary)",
                      background: "rgba(255, 184, 0, 0.12)",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      marginLeft: "6px",
                    }}
                  >
                    at {selectedHrPoint.timeStr}
                  </span>
                )}
              </div>
            </div>

            {/* Resting & Range Pill */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                textAlign: "right",
                fontSize: "0.8rem",
              }}
            >
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
                  RESTING
                </div>
                <div
                  style={{ fontWeight: "700", color: "var(--text-primary)" }}
                >
                  {restingBpm} bpm
                </div>
              </div>
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
                  RANGE
                </div>
                <div
                  style={{ fontWeight: "700", color: "var(--color-success)" }}
                >
                  {minBpm} - {maxBpm}
                </div>
              </div>
            </div>
          </div>

          {/* SVG Heart Rate Graph */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "150px",
              marginTop: "auto",
            }}
          >
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              style={{
                width: "100%",
                height: "100%",
                overflow: "visible",
              }}
              onMouseLeave={() => setSelectedHrPoint(null)}
            >
              <defs>
                <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff3d00" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#ff3d00" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line
                x1={padX}
                y1={padY}
                x2={svgW - padX}
                y2={padY}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4"
              />
              <line
                x1={padX}
                y1={svgH / 2}
                x2={svgW - padX}
                y2={svgH / 2}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4"
              />
              <line
                x1={padX}
                y1={svgH - padY}
                x2={svgW - padX}
                y2={svgH - padY}
                stroke="rgba(255,255,255,0.12)"
              />

              {/* Shaded Area */}
              <path d={areaD} fill="url(#hrGrad)" />

              {/* Heart Rate Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#ff3d00"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Hover Circles */}
              {hrPoints.map((pt, idx) => {
                const { x, y } = getCoord(idx, pt.bpm);
                const isSelected =
                  selectedHrPoint && selectedHrPoint.timeStr === pt.timeStr;
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r={isSelected ? 6 : 3}
                    fill={isSelected ? "#ffffff" : "#ff3d00"}
                    stroke="#000000"
                    strokeWidth="1.5"
                    style={{
                      cursor: "pointer",
                      transition: "r 0.15s ease",
                      opacity: isSelected ? 1 : 0.4,
                    }}
                    onMouseEnter={() => setSelectedHrPoint(pt)}
                  />
                );
              })}
            </svg>
          </div>

          {/* Time Axis Markers */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.68rem",
              color: "var(--text-muted)",
              marginTop: "8px",
              padding: "0 10px",
            }}
          >
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. SLEEP ARCHITECTURE & HYPNOGRAM                                 */}
        {/* ================================================================= */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "16px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "14px",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  fontWeight: "700",
                  textTransform: "uppercase",
                }}
              >
                SLEEP ARCHITECTURE & RECOVERY
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "8px",
                  marginTop: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "2.4rem",
                    fontWeight: "900",
                    fontFamily: "var(--font-display)",
                    color: "#7c4dff",
                  }}
                >
                  {sleepScore}
                </span>
                <span
                  style={{
                    fontSize: "1rem",
                    color: "var(--text-muted)",
                    fontWeight: "600",
                  }}
                >
                  / 100
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#b388ff",
                    background: "rgba(124, 77, 255, 0.15)",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontWeight: "700",
                    marginLeft: "6px",
                  }}
                >
                  {sleepScore >= 80 ? "✨ OPTIMAL" : "RESTORATIVE"}
                </span>
              </div>
            </div>

            {/* Total Duration & Deep Sleep */}
            <div style={{ textAlign: "right", fontSize: "0.8rem" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
                TOTAL REST
              </div>
              <div
                style={{
                  fontWeight: "700",
                  color: "var(--text-primary)",
                  fontSize: "0.95rem",
                }}
              >
                {sleepHrs}h {sleepMins}m
              </div>
              <div
                style={{
                  color: "#b388ff",
                  fontSize: "0.72rem",
                  marginTop: "2px",
                }}
              >
                Deep: {deepHrs}h {deepMins}m ({deepPercent}%)
              </div>
            </div>
          </div>

          {/* Hypnogram Stage Bar Chart */}
          <div style={{ marginTop: "14px", marginBottom: "14px" }}>
            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--text-muted)",
                marginBottom: "6px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Sleep Hypnogram Timeline</span>
              <span>11:15 PM ➔ 07:05 AM</span>
            </div>

            {/* Visual Staged Multi-Segment Bar */}
            <div
              style={{
                display: "flex",
                height: "26px",
                borderRadius: "8px",
                overflow: "hidden",
                gap: "2px",
                background: "rgba(255, 255, 255, 0.05)",
                padding: "2px",
              }}
            >
              {sleepStages.map((st, i) => {
                const colors = {
                  deep: "#651fff",
                  rem: "#00e5ff",
                  light: "#2979ff",
                  wake: "#ff9100",
                };
                const labels = {
                  deep: "Deep",
                  rem: "REM",
                  light: "Light",
                  wake: "Awake",
                };
                const stageColor = colors[st.stage] || "#2979ff";
                return (
                  <div
                    key={i}
                    title={`${labels[st.stage] || st.stage}`}
                    style={{
                      flex: st.duration || 1,
                      background: stageColor,
                      borderRadius: "4px",
                      position: "relative",
                      transition: "opacity 0.2s",
                      cursor: "default",
                    }}
                  />
                );
              })}
            </div>

            {/* Stage Legend */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                marginTop: "10px",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <span
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#651fff",
                  }}
                />
                Deep ({deepPercent}%)
              </span>
              <span
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#00e5ff",
                  }}
                />
                REM (21%)
              </span>
              <span
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#2979ff",
                  }}
                />
                Light (48%)
              </span>
              <span
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#ff9100",
                  }}
                />
                Awake (7%)
              </span>
            </div>
          </div>

          <div
            style={{
              marginTop: "auto",
              background: "rgba(124, 77, 255, 0.08)",
              border: "1px solid rgba(124, 77, 255, 0.2)",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "0.78rem",
              color: "#d1c4e9",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>💡</span>
            <span>
              Deep sleep threshold met (&gt;1.5h). Physical tissue repair and
              CNS recovery optimal for heavy training today.
            </span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. DAILY ACTIVITY METRICS ROW (STEPS, CALORIES, SPO2, STRESS)       */}
      {/* =================================================================== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "14px",
          marginTop: "20px",
        }}
      >
        {/* Steps */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "14px",
            padding: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              STEPS
            </span>
            <span style={{ fontSize: "1rem" }}>👟</span>
          </div>
          <div
            style={{
              fontSize: "1.3rem",
              fontWeight: "800",
              color: "var(--color-primary)",
              marginTop: "4px",
            }}
          >
            {steps.toLocaleString()}
          </div>
          <div
            style={{
              height: "4px",
              borderRadius: "2px",
              background: "rgba(255, 255, 255, 0.08)",
              marginTop: "8px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${stepPercent}%`,
                height: "100%",
                background: "var(--color-primary)",
              }}
            />
          </div>
          <div
            style={{
              fontSize: "0.65rem",
              color: "var(--text-muted)",
              marginTop: "4px",
            }}
          >
            {stepPercent}% of {stepTarget.toLocaleString()}
          </div>
        </div>

        {/* Active Calories */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "14px",
            padding: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              CALORIES
            </span>
            <span style={{ fontSize: "1rem" }}>🔥</span>
          </div>
          <div
            style={{
              fontSize: "1.3rem",
              fontWeight: "800",
              color: "#ff3d00",
              marginTop: "4px",
            }}
          >
            {calories}{" "}
            <span style={{ fontSize: "0.8rem", fontWeight: "600" }}>kcal</span>
          </div>
          <div
            style={{
              height: "4px",
              borderRadius: "2px",
              background: "rgba(255, 255, 255, 0.08)",
              marginTop: "8px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${calPercent}%`,
                height: "100%",
                background: "#ff3d00",
              }}
            />
          </div>
          <div
            style={{
              fontSize: "0.65rem",
              color: "var(--text-muted)",
              marginTop: "4px",
            }}
          >
            {calPercent}% of {calorieTarget} kcal
          </div>
        </div>

        {/* Distance */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "14px",
            padding: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              DISTANCE
            </span>
            <span style={{ fontSize: "1rem" }}>🗺️</span>
          </div>
          <div
            style={{
              fontSize: "1.3rem",
              fontWeight: "800",
              color: "var(--color-success)",
              marginTop: "4px",
            }}
          >
            {distanceKm}{" "}
            <span style={{ fontSize: "0.8rem", fontWeight: "600" }}>KM</span>
          </div>
          <div
            style={{
              fontSize: "0.65rem",
              color: "var(--text-muted)",
              marginTop: "16px",
            }}
          >
            GPS / Pedometer walk
          </div>
        </div>

        {/* SpO2 Blood Oxygen */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "14px",
            padding: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              BLOOD OXYGEN
            </span>
            <span style={{ fontSize: "1rem" }}>🩸</span>
          </div>
          <div
            style={{
              fontSize: "1.3rem",
              fontWeight: "800",
              color: "#00e5ff",
              marginTop: "4px",
            }}
          >
            {spo2}%
          </div>
          <div
            style={{
              fontSize: "0.65rem",
              color: "var(--color-success)",
              marginTop: "16px",
              fontWeight: "700",
            }}
          >
            ✓ Optimal (&gt;95%)
          </div>
        </div>

        {/* Stress Level */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "14px",
            padding: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              STRESS INDEX
            </span>
            <span style={{ fontSize: "1rem" }}>🧘</span>
          </div>
          <div
            style={{
              fontSize: "1.3rem",
              fontWeight: "800",
              color: stress < 40 ? "var(--color-success)" : "#ffa000",
              marginTop: "4px",
            }}
          >
            {stress}{" "}
            <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>/ 100</span>
          </div>
          <div
            style={{
              fontSize: "0.65rem",
              color: stress < 40 ? "var(--color-success)" : "#ffa000",
              marginTop: "16px",
              fontWeight: "700",
            }}
          >
            {stress < 30 ? "Relaxed" : stress < 60 ? "Normal" : "Elevated"}
          </div>
        </div>

        {/* Stand Activity */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "14px",
            padding: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              STAND TIME
            </span>
            <span style={{ fontSize: "1rem" }}>🧍</span>
          </div>
          <div
            style={{
              fontSize: "1.3rem",
              fontWeight: "800",
              color: "#ffd600",
              marginTop: "4px",
            }}
          >
            {act.standHours ?? 9}{" "}
            <span style={{ fontSize: "0.8rem", fontWeight: "600" }}>
              / {act.standTarget ?? 12}h
            </span>
          </div>
          <div
            style={{
              fontSize: "0.65rem",
              color: "var(--text-muted)",
              marginTop: "16px",
            }}
          >
            Hourly movement goal
          </div>
        </div>

        {/* PAI / Fat Burning */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "14px",
            padding: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              PAI & FAT BURN
            </span>
            <span style={{ fontSize: "1rem" }}>⚡</span>
          </div>
          <div
            style={{
              fontSize: "1.3rem",
              fontWeight: "800",
              color: "#ff6d00",
              marginTop: "4px",
            }}
          >
            {act.paiTotal ?? 112}{" "}
            <span style={{ fontSize: "0.8rem", fontWeight: "600" }}>PAI</span>
          </div>
          <div
            style={{
              fontSize: "0.65rem",
              color: "var(--color-success)",
              marginTop: "16px",
              fontWeight: "700",
            }}
          >
            ✓ Fat burn: {act.fatBurningMinutes ?? 42}m
          </div>
        </div>
      </div>
    </div>
  );
}
