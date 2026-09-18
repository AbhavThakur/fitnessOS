import React, { useState } from 'react'
import { Dumbbell, Search, Plus, Check, X, Sparkles } from 'lucide-react'
import { EXERCISE_LIBRARY } from '../data/exerciseLibrary'

export function ExerciseLibraryModal({ currentExerciseIds = [], onAddExercise, onClose }) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [customName, setCustomName] = useState('')
  const [customCategory, setCustomCategory] = useState('Chest')
  const [showCustomForm, setShowCustomForm] = useState(false)

  const categories = ['All', 'Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core']

  const filteredExercises = EXERCISE_LIBRARY.filter((ex) => {
    const matchesCat = selectedCategory === 'All' || ex.category.toLowerCase() === selectedCategory.toLowerCase()
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) || ex.category.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  const handleCreateCustom = (e) => {
    e.preventDefault()
    if (!customName.trim()) return
    const customId = 'custom_' + customName.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Date.now()
    const newEx = {
      id: customId,
      name: customName.trim(),
      category: customCategory,
      defaultSets: 3,
      defaultReps: 10,
      defaultRestSec: 90
    }
    onAddExercise(newEx)
    setCustomName('')
    setShowCustomForm(false)
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
          maxWidth: '620px',
          padding: '28px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(255, 179, 0, 0.3)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
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
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Exercise Library</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Choose from 30+ exercises or create custom</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar & Custom Toggle */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input-field"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercise (e.g. Incline, Squat, Pull)..."
              style={{ width: '100%', paddingLeft: '36px' }}
            />
          </div>
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={() => setShowCustomForm(!showCustomForm)}
            style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Sparkles size={13} color="var(--color-primary)" />
            {showCustomForm ? 'View Library' : '+ Custom'}
          </button>
        </div>

        {/* Custom Exercise Form */}
        {showCustomForm && (
          <form
            onSubmit={handleCreateCustom}
            className="glass-card"
            style={{
              padding: '16px',
              marginBottom: '16px',
              border: '1px solid rgba(255, 179, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-primary)' }}>
              CREATE NEW CUSTOM EXERCISE
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="input-field"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Custom exercise name..."
                required
                style={{ flex: 2, minWidth: '180px' }}
              />
              <select
                className="input-field"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                style={{ flex: 1, minWidth: '120px' }}
              >
                {categories.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c} style={{ background: '#121218', color: '#fff' }}>
                    {c}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn-primary btn-sm" style={{ padding: '0 16px' }}>
                Add
              </button>
            </div>
          </form>
        )}

        {/* Category Pills */}
        {!showCustomForm && (
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  background: selectedCategory === cat ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.04)',
                  color: selectedCategory === cat ? '#000000' : 'var(--text-secondary)',
                  border: selectedCategory === cat ? '1px solid var(--color-primary)' : '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable List of Exercises */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
          {filteredExercises.map((ex) => {
            const alreadyInSplit = currentExerciseIds.includes(ex.id)
            return (
              <div
                key={ex.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'background 0.15s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{ex.name}</span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: 'var(--color-primary)',
                        fontWeight: '700'
                      }}
                    >
                      {ex.category}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Preset: {ex.defaultSets} sets • {ex.defaultReps} reps • ⏱️ {ex.defaultRestSec}s rest
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onAddExercise(ex)}
                  disabled={alreadyInSplit}
                  className={alreadyInSplit ? 'btn-secondary btn-sm' : 'btn-primary btn-sm'}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    opacity: alreadyInSplit ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {alreadyInSplit ? (
                    <>
                      <Check size={12} /> Added
                    </>
                  ) : (
                    <>
                      <Plus size={12} /> Add
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
