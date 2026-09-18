import React from 'react'
import { Zap, RefreshCw, Lock } from 'lucide-react'

export function MobileTopBar({
  activeTab,
  activeProfileId,
  onSelectProfile,
  profiles,
  cloudConnected,
  onOpenSync,
  onOpenProfileSettings,
  onLockApp
}) {
  const primary = profiles?.primary || { name: 'You', battery: 84 }
  const partner = profiles?.partner || { name: 'Wife', battery: 92 }

  const tabTitles = {
    overview: 'Telemetry Overview',
    gym: 'Gym Studio & Routines',
    badminton: 'Badminton Telemetry',
    running: 'Running Telemetry',
    comparison: 'Couples Rivalry & Wagers',
    plates: 'Barbell Plate Calculator'
  }

  return (
    <header className="mobile-topbar" aria-label="Mobile Header">
      {/* Brand row with Cloud Sync pill & Lock */}
      <div className="mobile-topbar-header">
        <div className="mobile-topbar-brand">
          <div className="mobile-brand-icon">
            <Zap size={14} color="var(--color-primary)" fill="var(--color-primary)" />
          </div>
          <span className="mobile-brand-name">IRONPULSE</span>
          <span className="mobile-brand-sub">ATHLETE OS</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className="mobile-sync-chip"
            onClick={onOpenSync}
            title="Supabase Cloud Connection"
            aria-label="Cloud Sync Hub"
          >
            <span className={`status-dot ${cloudConnected ? 'connected' : 'offline'}`} />
            <span className="mobile-sync-text">{cloudConnected ? 'Cloud' : 'Offline'}</span>
            <RefreshCw size={11} color="var(--text-muted)" />
          </button>

          {onLockApp && (
            <button
              className="mobile-sync-chip"
              onClick={onLockApp}
              title="Lock Dashboard"
              aria-label="Lock Dashboard"
              style={{ padding: '4px 8px' }}
            >
              <Lock size={12} color="var(--text-muted)" />
            </button>
          )}
        </div>
      </div>

      {/* Profile chips switcher */}
      <div className="mobile-topbar-profiles" role="radiogroup" aria-label="Athlete profile switcher">
        <button
          role="radio"
          aria-checked={activeProfileId === 'primary'}
          className={`mobile-profile-chip ${activeProfileId === 'primary' ? 'active' : ''}`}
          onClick={() => onSelectProfile('primary')}
        >
          <span className="mobile-chip-emoji">🧔</span>
          <span className="mobile-chip-label">{primary.shortName || primary.name || 'You'}</span>
          <span className="mobile-chip-battery">🔋{primary.battery || 84}%</span>
        </button>

        <button
          role="radio"
          aria-checked={activeProfileId === 'partner'}
          className={`mobile-profile-chip ${activeProfileId === 'partner' ? 'active' : ''}`}
          onClick={() => onSelectProfile('partner')}
        >
          <span className="mobile-chip-emoji">👩</span>
          <span className="mobile-chip-label">{partner.shortName || partner.name || 'Wife'}</span>
          <span className="mobile-chip-battery">🔋{partner.battery || 92}%</span>
        </button>

        <button
          role="radio"
          aria-checked={activeProfileId === 'comparison'}
          className={`mobile-profile-chip ${activeProfileId === 'comparison' ? 'active' : ''}`}
          onClick={() => onSelectProfile('comparison')}
        >
          <span className="mobile-chip-emoji">⚔️</span>
          <span className="mobile-chip-label">Rivalry</span>
          <span className="mobile-chip-badge">VS</span>
        </button>

        {onOpenProfileSettings && (
          <button
            className="mobile-profile-chip"
            onClick={onOpenProfileSettings}
            title="Edit Athlete Names"
            aria-label="Edit Athlete Names"
            style={{ padding: '4px 8px', minWidth: 'auto', border: '1px dashed rgba(255, 179, 0, 0.4)' }}
          >
            ✏️
          </button>
        )}
      </div>

      {/* Page Title & Status */}
      <div className="mobile-topbar-title">
        {tabTitles[activeTab] || 'IronPulse'}
      </div>
    </header>
  )
}
