import React from 'react'

export function ProfileSwitcher({ activeProfileId, onSelectProfile, profiles }) {
  const profileList = [
    {
      id: 'primary',
      name: profiles?.primary?.name || 'You (T-Rex 3)',
      icon: '🧔',
      device: 'T-Rex 3',
      battery: profiles?.primary?.battery || 84
    },
    {
      id: 'partner',
      name: profiles?.partner?.name || 'Wife (Amazfit)',
      icon: '👩',
      device: 'Amazfit',
      battery: profiles?.partner?.battery || 92
    },
    {
      id: 'comparison',
      name: 'Couples Rivalry',
      icon: '⚔️',
      device: 'H2H Battle',
      badge: 'VS'
    }
  ]

  return (
    <div className="profile-switcher-container" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '4px' }} className="hide-mobile">
        ATHLETE:
      </span>
      <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', padding: '3px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
        {profileList.map((p) => {
          const isActive = activeProfileId === p.id
          return (
            <button
              key={p.id}
              onClick={() => onSelectProfile(p.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                border: 'none',
                borderRadius: '9px',
                background: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? '#000' : 'var(--text-secondary)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isActive ? '0 0 12px var(--color-primary-glow)' : 'none'
              }}
            >
              <span>{p.icon}</span>
              <span>{p.name.split(' ')[0]}</span>
              {p.battery && (
                <span
                  style={{
                    fontSize: '0.65rem',
                    background: isActive ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.08)',
                    padding: '1px 5px',
                    borderRadius: '4px'
                  }}
                  className="hide-mobile"
                >
                  🔋{p.battery}%
                </span>
              )}
              {p.badge && (
                <span
                  style={{
                    fontSize: '0.62rem',
                    background: isActive ? '#000' : 'rgba(255, 61, 0, 0.2)',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-accent)',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontWeight: '800'
                  }}
                >
                  {p.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
