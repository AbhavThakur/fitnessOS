import React from 'react'
import {
  LayoutDashboard,
  Dumbbell,
  Activity,
  Footprints,
  Trophy,
  Calculator,
  RefreshCw,
  Zap,
  Lock
} from 'lucide-react'

export function Sidebar({
  activeTab,
  setActiveTab,
  activeProfileId,
  onSelectProfile,
  profiles,
  cloudConnected,
  onOpenSync,
  onOpenProfileSettings,
  onLockApp
}) {
  const primary = profiles?.primary || { name: 'You (T-Rex 3)', battery: 84 }
  const partner = profiles?.partner || { name: 'Wife (Amazfit)', battery: 92 }

  const navGroups = [
    {
      label: 'TRAINING',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'gym', label: 'Gym Studio', icon: Dumbbell },
        { id: 'badminton', label: 'Badminton', icon: Activity },
        { id: 'running', label: 'Running', icon: Footprints }
      ]
    },
    {
      label: 'COUPLES & TOOLS',
      items: [
        { id: 'comparison', label: 'Couples Rivalry', icon: Trophy, badge: 'VS' },
        { id: 'plates', label: 'Plate Math', icon: Calculator }
      ]
    }
  ]

  return (
    <aside className="desktop-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand" onClick={() => setActiveTab('overview')}>
        <div className="sidebar-brand-icon">
          <Zap size={18} color="var(--color-primary)" fill="var(--color-primary)" />
        </div>
        <div>
          <div className="sidebar-brand-title">IRONPULSE</div>
          <div className="sidebar-brand-sub">ATHLETE OS</div>
        </div>
      </div>

      {/* Profile Switcher (WealthOS-inspired Luxury Pill Switcher) */}
      <div className="sidebar-profile-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div className="sidebar-section-label" style={{ margin: 0 }}>ACTIVE ATHLETE</div>
          {onOpenProfileSettings && (
            <button
              onClick={onOpenProfileSettings}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '600', padding: '0 4px' }}
              title="Edit Athlete Names"
            >
              ✏️ Edit
            </button>
          )}
        </div>
        <div className="sidebar-profile-list">
          <button
            className={`sidebar-profile-item ${activeProfileId === 'primary' ? 'active' : ''}`}
            onClick={() => onSelectProfile('primary')}
          >
            <span className="profile-dot dot-primary" />
            <span className="profile-name">🧔 {primary.name || 'You (T-Rex 3)'}</span>
            <span className="profile-battery">🔋{primary.battery || 84}%</span>
          </button>

          <button
            className={`sidebar-profile-item ${activeProfileId === 'partner' ? 'active' : ''}`}
            onClick={() => onSelectProfile('partner')}
          >
            <span className="profile-dot dot-partner" />
            <span className="profile-name">👩 {partner.name || 'Wife (Amazfit)'}</span>
            <span className="profile-battery">🔋{partner.battery || 92}%</span>
          </button>

          <button
            className={`sidebar-profile-item ${activeProfileId === 'comparison' ? 'active' : ''}`}
            onClick={() => onSelectProfile('comparison')}
          >
            <span className="profile-dot dot-rivalry" />
            <span className="profile-name">⚔️ Couples Rivalry</span>
            <span className="profile-badge-vs">VS</span>
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="sidebar-nav-group">
            <div className="sidebar-nav-label">{group.label}</div>
            {group.items.map(({ id, label, icon: Icon, badge }) => {
              const isActive = activeTab === id
              return (
                <button
                  key={id}
                  id={`nav-${id}`}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(id)}
                >
                  <Icon size={16} className="nav-icon" />
                  <span className="nav-label">{label}</span>
                  {badge && <span className="nav-badge">{badge}</span>}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer Cloud & Watch Status */}
      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button className="sidebar-sync-btn" onClick={onOpenSync}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`status-dot ${cloudConnected ? 'connected' : 'offline'}`} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#fff' }}>
                {cloudConnected ? 'Supabase Cloud' : 'Offline Buffer'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {cloudConnected ? 'Real-time Sync Active' : 'Tap to Configure'}
              </div>
            </div>
          </div>
          <RefreshCw size={13} color="var(--text-muted)" />
        </button>

        {onLockApp && (
          <button
            type="button"
            onClick={onLockApp}
            className="sidebar-sync-btn"
            style={{ padding: '8px 12px', justifyContent: 'center', gap: '6px', color: 'var(--text-muted)' }}
            title="Lock Dashboard (PIN Required)"
          >
            <Lock size={12} />
            <span style={{ fontSize: '11px', fontWeight: '600' }}>🔒 Lock Dashboard</span>
          </button>
        )}
      </div>
    </aside>
  )
}
