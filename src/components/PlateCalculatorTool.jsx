import React, { useState } from 'react'

const PLATE_COLORS = {
  25: { bg: '#d32f2f', text: '#fff' },     // Red
  20: { bg: '#1976d2', text: '#fff' },     // Blue
  15: { bg: '#fbc02d', text: '#000' },     // Yellow
  10: { bg: '#388e3c', text: '#fff' },     // Green
  5: { bg: '#f5f5f5', text: '#000' },      // White
  2.5: { bg: '#212121', text: '#fff' },    // Black
  1.25: { bg: '#78909c', text: '#fff' }    // Chrome/Grey
}

export function PlateCalculatorTool() {
  const [totalWeight, setTotalWeight] = useState(82.5)
  const [barWeight, setBarWeight] = useState(20)

  // Plate calculation logic
  const calculatePlates = (target, bar) => {
    const netWeight = Math.max(0, target - bar)
    const perSide = Math.round((netWeight / 2) * 100) / 100
    let remaining = perSide
    const standardPlates = [25, 20, 15, 10, 5, 2.5, 1.25]
    const breakdown = []

    for (const p of standardPlates) {
      if (remaining >= p) {
        const count = Math.floor(remaining / p)
        for (let i = 0; i < count; i++) {
          breakdown.push(p)
        }
        remaining = Math.round((remaining - count * p) * 100) / 100
      }
    }

    return { perSide, breakdown }
  }

  const { perSide, breakdown } = calculatePlates(totalWeight, barWeight)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          ADVANCE UTILITY
        </span>
        <h2 style={{ marginTop: '4px' }}>Olympic Barbell Plate Math Calculator</h2>
        <p style={{ marginTop: '4px' }}>
          Instantly solve the plate math for any target barbell load with competition plate color coding.
        </p>
      </div>

      <div className="dashboard-columns">
        {/* Input Controls */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ marginBottom: '20px' }}>Target Load Settings</h3>

          {/* Stepper Input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              TOTAL BARBELL WEIGHT (KG)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                className="btn-secondary"
                style={{ width: '48px', height: '48px', justifyContent: 'center', fontSize: '1.2rem' }}
                onClick={() => setTotalWeight((prev) => Math.max(barWeight, prev - 2.5))}
              >
                -
              </button>

              <input
                type="number"
                step="2.5"
                min={barWeight}
                value={totalWeight}
                onChange={(e) => setTotalWeight(Number(e.target.value))}
                style={{
                  flex: 1,
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  color: 'var(--color-primary)',
                  fontSize: '1.6rem',
                  fontWeight: '800',
                  fontFamily: 'var(--font-display)',
                  textAlign: 'center',
                  outline: 'none'
                }}
              />

              <button
                className="btn-secondary"
                style={{ width: '48px', height: '48px', justifyContent: 'center', fontSize: '1.2rem' }}
                onClick={() => setTotalWeight((prev) => prev + 2.5)}
              >
                +
              </button>
            </div>
          </div>

          {/* Bar Weight Toggle */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              BARBELL WEIGHT
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setBarWeight(20)}
                className={`btn-secondary btn-sm ${barWeight === 20 ? 'active' : ''}`}
                style={{
                  background: barWeight === 20 ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.05)',
                  color: barWeight === 20 ? '#000' : 'var(--text-secondary)'
                }}
              >
                20 kg (Standard Men's Bar)
              </button>
              <button
                onClick={() => setBarWeight(15)}
                className={`btn-secondary btn-sm ${barWeight === 15 ? 'active' : ''}`}
                style={{
                  background: barWeight === 15 ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.05)',
                  color: barWeight === 15 ? '#000' : 'var(--text-secondary)'
                }}
              >
                15 kg (Technique Bar)
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              QUICK WEIGHT PRESETS
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[60, 80, 82.5, 100, 120, 140, 160].map((val) => (
                <button
                  key={val}
                  onClick={() => setTotalWeight(val)}
                  className="btn-secondary btn-sm"
                  style={{ fontWeight: '700' }}
                >
                  {val} kg
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Barbell & Plates Breakdown */}
        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>Plate Loading Breakdown</h3>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-success)' }}>
                {perSide} kg / side
              </span>
            </div>

            {/* Visual Barbell Graphic */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                padding: '24px 16px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '20px 0',
                overflowX: 'auto',
                minHeight: '120px'
              }}
            >
              {/* Sleeve Collar */}
              <div style={{ width: '14px', height: '54px', background: '#555', borderRadius: '3px 0 0 3px' }}></div>
              <div style={{ width: '40px', height: '24px', background: '#777' }}></div>

              {/* Plates on Sleeve */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {breakdown.length === 0 ? (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '12px' }}>
                    Empty Bar (No plates)
                  </span>
                ) : (
                  breakdown.map((plate, index) => {
                    const color = PLATE_COLORS[plate] || { bg: '#888', text: '#fff' }
                    const height = Math.min(96, Math.max(34, plate * 3.5))
                    return (
                      <div
                        key={index}
                        style={{
                          width: '20px',
                          height: `${height}px`,
                          background: color.bg,
                          color: color.text,
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.62rem',
                          fontWeight: '800',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                          writingMode: 'vertical-lr'
                        }}
                        title={`${plate} kg plate`}
                      >
                        {plate}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Bar End */}
              <div style={{ width: '50px', height: '18px', background: '#444', borderRadius: '0 4px 4px 0' }}></div>
            </div>

            {/* Itemized List */}
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                PLATES NEEDED PER SIDE:
              </h4>
              {breakdown.length === 0 ? (
                <p style={{ fontSize: '0.9rem' }}>Load 0 plates. Standard barbell only.</p>
              ) : (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {breakdown.map((p, i) => {
                    const c = PLATE_COLORS[p] || { bg: '#444', text: '#fff' }
                    return (
                      <span
                        key={i}
                        style={{
                          padding: '6px 14px',
                          background: c.bg,
                          color: c.text,
                          fontWeight: '700',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem'
                        }}
                      >
                        {p} kg
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="metric-subtext" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: '20px' }}>
            <span>⚡ Also available live on your watch during sets!</span>
          </div>
        </div>
      </div>
    </div>
  )
}
