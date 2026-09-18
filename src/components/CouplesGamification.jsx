import React, { useState } from 'react'

export function CouplesGamification({ data }) {
  const { profiles, workoutLogs, badmintonMatches, runningSessions } = data

  const primaryProfile = profiles?.primary || { name: 'You (T-Rex 3)' }
  const partnerProfile = profiles?.partner || { name: 'Wife (Amazfit)' }

  // Custom wagers state
  const [customWagers, setCustomWagers] = useState([
    { id: 'w1', title: '💆 20-Min Deep Tissue Foot & Back Massage', wager: 'Next Badminton Match Winner', unlocked: true, claimed: false },
    { id: 'w2', title: '🍕 Guilt-Free Sunday Cheat Meal (Winner Picks)', wager: 'Weekly Volume Leader', unlocked: true, claimed: false },
    { id: 'w3', title: '🎬 Weekend Movie Night Pick & Royal Treatment', wager: 'First to 20 km Running', unlocked: false, progress: 85 },
    { id: 'w4', title: '☕ Sunday Bed Breakfast Served by Partner', wager: 'Complete 3 Joint Workouts', unlocked: false, progress: 66 }
  ])

  const [newWagerTitle, setNewWagerTitle] = useState('')
  const [newWagerRule, setNewWagerRule] = useState('')
  const [showWagerForm, setShowWagerForm] = useState(false)

  // Calculations for quests
  const primaryVolume = workoutLogs.filter((w) => w.profileId === 'primary').reduce((a, c) => a + Number(c.totalVolumeKg || 0), 0)
  const partnerVolume = workoutLogs.filter((w) => w.profileId === 'partner').reduce((a, c) => a + Number(c.totalVolumeKg || 0), 0)
  const combinedVolume = primaryVolume + partnerVolume
  const volumeTarget = 50000
  const volumePct = Math.min(100, Math.round((combinedVolume / volumeTarget) * 100))

  const primaryKm = runningSessions.filter((r) => r.profileId === 'primary').reduce((a, c) => a + Number(c.distanceKm || 0), 0)
  const partnerKm = runningSessions.filter((r) => r.profileId === 'partner').reduce((a, c) => a + Number(c.distanceKm || 0), 0)
  const combinedKm = primaryKm + partnerKm
  const kmTarget = 25
  const kmPct = Math.min(100, Math.round((combinedKm / kmTarget) * 100))

  const totalMatches = badmintonMatches.length
  const matchTarget = 4
  const matchPct = Math.min(100, Math.round((totalMatches / matchTarget) * 100))

  // Claim voucher handler
  const handleClaim = (id) => {
    setCustomWagers((prev) =>
      prev.map((w) => (w.id === id ? { ...w, claimed: true } : w))
    )
  }

  const handleAddWager = (e) => {
    e.preventDefault()
    if (!newWagerTitle) return
    const newW = {
      id: 'w_' + Date.now(),
      title: newWagerTitle,
      wager: newWagerRule || 'Custom Agreement',
      unlocked: true,
      claimed: false
    }
    setCustomWagers([newW, ...customWagers])
    setNewWagerTitle('')
    setNewWagerRule('')
    setShowWagerForm(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      
      {/* 1. The Couples Trophy & Belt Arena */}
      <div className="glass-card" style={{ padding: '26px', background: 'radial-gradient(circle at 50% 0%, rgba(255, 184, 0, 0.12) 0%, rgba(20, 22, 30, 0.8) 70%)', border: '1px solid rgba(255, 184, 0, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              👑 CURRENT TITLE BELT HOLDER
            </div>
            <h2 style={{ marginTop: '4px' }}>🏆 {primaryProfile.name} holds the Iron Cup!</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Holding the singles championship title after last weekend's 21-17 victory vs {partnerProfile.name}. The belt is on the line in your next match!
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ padding: '10px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-primary)' }}>2 - 1</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>H2H Record</div>
            </div>
            <div style={{ padding: '10px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-success)' }}>+8 Pts</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Point Diff</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Cooperative Weekly Quests */}
      <div className="glass-card" style={{ padding: '26px' }}>
        <div className="metric-header" style={{ marginBottom: '16px' }}>
          <span className="metric-title">🎯 COOPERATIVE WEEKLY ATHLETE QUESTS</span>
          <span className="metric-icon">🤝</span>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Work as a dynamic duo! Combine metrics from both Amazfit watches to unlock shared achievements and rewards.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Quest 1 */}
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>🏋️</span>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>The 50,000 KG Iron Syndicate</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Combine weekly gym volume: You ({primaryVolume.toLocaleString()} kg) + Wife ({partnerVolume.toLocaleString()} kg)
                  </div>
                </div>
              </div>
              <span style={{ fontWeight: '800', color: volumePct >= 100 ? 'var(--color-success)' : 'var(--color-primary)', fontSize: '0.9rem' }}>
                {volumePct >= 100 ? '✓ COMPLETED' : `${combinedVolume.toLocaleString()} / ${volumeTarget.toLocaleString()} kg`}
              </span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${volumePct}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-success))', borderRadius: '4px' }} />
            </div>
          </div>

          {/* Quest 2 */}
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>🏃</span>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Cardio Odyssey (25 KM)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Combined outdoor road & trail runs: You ({primaryKm.toFixed(1)} km) + Wife ({partnerKm.toFixed(1)} km)
                  </div>
                </div>
              </div>
              <span style={{ fontWeight: '800', color: kmPct >= 100 ? 'var(--color-success)' : 'var(--color-cyan)', fontSize: '0.9rem' }}>
                {kmPct >= 100 ? '✓ COMPLETED' : `${combinedKm.toFixed(1)} / ${kmTarget} km`}
              </span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${kmPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-cyan), #00e676)', borderRadius: '4px' }} />
            </div>
          </div>

          {/* Quest 3 */}
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>🏸</span>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Court Masters: 4 Badminton Matches</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Total singles & couples rallies tracked on watches ({totalMatches} logged)
                  </div>
                </div>
              </div>
              <span style={{ fontWeight: '800', color: matchPct >= 100 ? 'var(--color-success)' : 'var(--color-primary)', fontSize: '0.9rem' }}>
                {matchPct >= 100 ? '✓ COMPLETED' : `${totalMatches} / ${matchTarget} Matches`}
              </span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${matchPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), #ff3d00)', borderRadius: '4px' }} />
            </div>
          </div>

        </div>
      </div>

      {/* 3. Real-Life Couples Reward Vouchers 🎟️ */}
      <div className="glass-card" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <span className="metric-title">🎟️ REAL-LIFE COUPLES REWARD VOUCHERS</span>
            <h3 style={{ margin: '4px 0 0 0' }}>Unlock Fun Rewards by Hitting Goals</h3>
          </div>
          <button className="btn-secondary btn-sm" onClick={() => setShowWagerForm(!showWagerForm)}>
            {showWagerForm ? '✕ Cancel' : '➕ Add Custom Wager'}
          </button>
        </div>

        {showWagerForm && (
          <form onSubmit={handleAddWager} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-active)', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              placeholder="e.g. 🍨 Late Night Gelato / Winner Picks Dessert"
              value={newWagerTitle}
              onChange={(e) => setNewWagerTitle(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '0.9rem' }}
            />
            <input
              type="text"
              placeholder="Wager condition: e.g. First to 30 sets this week"
              value={newWagerRule}
              onChange={(e) => setNewWagerRule(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '0.9rem' }}
            />
            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '8px 18px' }}>
              Create Couples Wager
            </button>
          </form>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {customWagers.map((voucher) => (
            <div
              key={voucher.id}
              style={{
                padding: '18px',
                borderRadius: '14px',
                background: voucher.unlocked ? 'rgba(0, 230, 118, 0.06)' : 'rgba(0,0,0,0.2)',
                border: voucher.unlocked ? '1px solid rgba(0, 230, 118, 0.25)' : '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '800', color: voucher.unlocked ? 'var(--color-success)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {voucher.unlocked ? '🏆 UNLOCKED' : `LOCKED (${voucher.progress || 0}%)`}
                  </span>
                  {voucher.claimed && (
                    <span style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                      REDEEMED
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{voucher.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  🎯 <strong>Stake:</strong> {voucher.wager}
                </div>
              </div>

              {voucher.unlocked && !voucher.claimed && (
                <button
                  className="btn-primary"
                  onClick={() => handleClaim(voucher.id)}
                  style={{ width: '100%', padding: '8px', fontSize: '0.8rem', justifyContent: 'center' }}
                >
                  Claim Reward Voucher 🎟️
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
