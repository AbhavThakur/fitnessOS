import React from 'react'
import { ProfileSwitcher } from './ProfileSwitcher'

export function Navbar({
  activeTab,
  setActiveTab,
  onOpenSync,
  cloudConnected,
  activeProfileId,
  onSelectProfile,
  profiles
}) {
  return (
    <header className="glass-card navbar">
      <div className="brand" onClick={() => setActiveTab('overview')} style={{ cursor: 'pointer' }}>
        <div className="brand-icon">⚡</div>
        <div>
          <div className="brand-title">
            IRONPULSE
            <span className="brand-badge">ATHLETE OS</span>
          </div>
        </div>
      </div>

      <nav className="nav-tabs" aria-label="Main Navigation">
        <button
          id="nav-overview"
          className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span>📊</span> Overview
        </button>
        <button
          id="nav-gym"
          className={`nav-btn ${activeTab === 'gym' ? 'active' : ''}`}
          onClick={() => setActiveTab('gym')}
        >
          <span>🏋️</span> Gym Studio
        </button>
        <button
          id="nav-badminton"
          className={`nav-btn ${activeTab === 'badminton' ? 'active' : ''}`}
          onClick={() => setActiveTab('badminton')}
        >
          <span>🏸</span> Badminton
        </button>
        <button
          id="nav-running"
          className={`nav-btn ${activeTab === 'running' ? 'active' : ''}`}
          onClick={() => setActiveTab('running')}
        >
          <span>🏃</span> Running
        </button>
        <button
          id="nav-comparison"
          className={`nav-btn ${activeTab === 'comparison' ? 'active' : ''}`}
          onClick={() => setActiveTab('comparison')}
        >
          <span>⚔️</span> Rivalry
        </button>
        <button
          id="nav-plates"
          className={`nav-btn ${activeTab === 'plates' ? 'active' : ''}`}
          onClick={() => setActiveTab('plates')}
        >
          <span>🧮</span> Plate Math
        </button>
      </nav>

      <div className="nav-actions">
        <ProfileSwitcher
          activeProfileId={activeProfileId}
          onSelectProfile={onSelectProfile}
          profiles={profiles}
        />

        <button id="btn-sync-modal" className="btn-secondary btn-sm" onClick={onOpenSync}>
          <span style={{ color: cloudConnected ? 'var(--color-success)' : 'var(--color-primary)' }}>●</span>
          <span className="hide-mobile">{cloudConnected ? 'Supabase Connected' : 'Sync Hub'}</span>
        </button>
      </div>
    </header>
  )
}
