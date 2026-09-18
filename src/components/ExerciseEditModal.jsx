import React, { useState } from 'react'
import { Dumbbell, Clock, Layers, Hash, Weight, X, Check } from 'lucide-react'

export function ExerciseEditModal({ exercise, onSave, onClose }) {
  const [name, setName] = useState(exercise.name || 'Exercise')
  const [category, setCategory] = useState(exercise.category || 'Chest')
  const [sets, setSets] = useState(exercise.defaultSets || 3)
  const [reps, setReps] = useState(exercise.defaultReps || 10)
  const [restSec, setRestSec] = useState(exercise.defaultRestSec || 90)
  const [weight, setWeight] = useState(exercise.targetWeight || 0)

  const categories = ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core', 'Cardio']
  const restPresets = [30, 45, 60, 90, 120, 180, 240]

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...exercise,
      name: name.trim() || exercise.name,
      category,
      defaultSets: Math.max(1, Math.min(10, sets)),
      defaultReps: Math.max(1, Math.min(100, reps)),
      defaultRestSec: Math.max(15, Math.min(600, restSec)),
      targetWeight: Number(weight) || 0
    })
  }

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(5, 5, 8, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '28px',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid rgba(255, 179, 0, 0.3)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(255, 179, 0, 0.15)',
                border: '1px solid var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Dumbbell size={18} color="var(--color-primary)" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Edit Exercise</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customize sets, reps, and rest timer</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Exercise Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              EXERCISE NAME
            </label>
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Barbell Bench Press"
              required
              style={{ width: '100%' }}
            />
          </div>

          {/* Muscle Category Chips */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              MUSCLE GROUP
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: category === cat ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.05)',
                    color: category === cat ? '#000000' : 'var(--text-secondary)',
                    border: category === cat ? '1px solid var(--color-primary)' : '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Target Sets & Target Reps Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Target Sets */}
            <div className="glass-card" style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Layers size={14} color="var(--color-primary)" />
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>TARGET SETS</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => setSets((s) => Math.max(1, s - 1))}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', fontSize: '1.2rem', fontWeight: '700', cursor: 'pointer' }}
                >
                  -
                </button>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-primary)' }}>{sets}</span>
                <button
                  type="button"
                  onClick={() => setSets((s) => Math.min(10, s + 1))}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', fontSize: '1.2rem', fontWeight: '700', cursor: 'pointer' }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Target Reps */}
            <div className="glass-card" style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Hash size={14} color="var(--color-cyan)" />
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>TARGET REPS</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => setReps((r) => Math.max(1, r - 1))}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', fontSize: '1.2rem', fontWeight: '700', cursor: 'pointer' }}
                >
                  -
                </button>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-cyan)' }}>{reps}</span>
                <button
                  type="button"
                  onClick={() => setReps((r) => Math.min(100, r + 1))}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', fontSize: '1.2rem', fontWeight: '700', cursor: 'pointer' }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Rest Timer */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} color="var(--color-success)" />
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>REST TIMER (BETWEEN SETS)</span>
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-success)' }}>{restSec}s ({Math.floor(restSec / 60)}m {restSec % 60 ? `${restSec % 60}s` : ''})</span>
            </div>

            {/* Quick Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {restPresets.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setRestSec(sec)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: restSec === sec ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    color: restSec === sec ? 'var(--color-success)' : 'var(--text-muted)',
                    border: restSec === sec ? '1px solid var(--color-success)' : '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  {sec}s
                </button>
              ))}
            </div>

            {/* Stepper Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setRestSec((s) => Math.max(15, s - 15))}
                className="btn-secondary btn-sm"
                style={{ flex: 1 }}
              >
                - 15s
              </button>
              <button
                type="button"
                onClick={() => setRestSec((s) => Math.min(600, s + 15))}
                className="btn-secondary btn-sm"
                style={{ flex: 1 }}
              >
                + 15s
              </button>
            </div>
          </div>

          {/* Starting / Working Weight (optional) */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <Weight size={14} color="var(--color-primary)" />
              TARGET / WORKING WEIGHT (OPTIONAL)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              className="input-field"
              value={weight || ''}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 60 kg"
              style={{ width: '100%' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button type="submit" className="btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Check size={16} /> Save & Apply
            </button>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
