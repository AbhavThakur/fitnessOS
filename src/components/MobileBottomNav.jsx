import React from 'react'
import {
  LayoutDashboard,
  Dumbbell,
  Activity,
  Footprints,
  Trophy,
  Calculator
} from 'lucide-react'

export function MobileBottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'gym', label: 'Gym', icon: Dumbbell },
    { id: 'badminton', label: 'Badminton', icon: Activity },
    { id: 'running', label: 'Running', icon: Footprints },
    { id: 'comparison', label: 'Rivalry', icon: Trophy, badge: 'VS' },
    { id: 'plates', label: 'Plates', icon: Calculator }
  ]

  return (
    <nav className="mobile-bottom-nav" aria-label="Main mobile navigation">
      {tabs.map(({ id, label, icon: Icon, badge }) => {
        const isActive = activeTab === id
        return (
          <button
            key={id}
            id={`mob-nav-${id}`}
            className={`mobile-bottom-tab ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => setActiveTab(id)}
          >
            <div className="mobile-bottom-icon-wrap">
              <Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} />
              {badge && <span className="mobile-tab-badge">{badge}</span>}
            </div>
            <span className="mobile-bottom-label">{label}</span>
            {isActive && <span className="mobile-active-dot" />}
          </button>
        )
      })}
    </nav>
  )
}
