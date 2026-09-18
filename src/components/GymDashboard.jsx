import React, { useState } from 'react'
import {
  Edit3,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Dumbbell,
  BookOpen,
  Cloud,
  Layers,
  Clock,
  Check
} from 'lucide-react'
import { pushRoutinesToCloud } from '../lib/supabase'
import { getExerciseDetails } from '../data/exerciseLibrary'
import { ExerciseEditModal } from './ExerciseEditModal'
import { ExerciseLibraryModal } from './ExerciseLibraryModal'

function resolveExerciseItem(item) {
  if (typeof item === 'object' && item !== null) {
    const base = getExerciseDetails(item.id)
    return {
      id: item.id,
      name: item.name || base.name,
      category: item.category || base.category,
      defaultSets: item.defaultSets ?? base.defaultSets ?? 3,
      defaultReps: item.defaultReps ?? base.defaultReps ?? 10,
      defaultRestSec: item.defaultRestSec ?? base.defaultRestSec ?? 90,
      targetWeight: item.targetWeight ?? 0
    }
  }
  const base = getExerciseDetails(item)
  return {
    id: item,
    name: base.name,
    category: base.category,
    defaultSets: base.defaultSets ?? 3,
    defaultReps: base.defaultReps ?? 10,
    defaultRestSec: base.defaultRestSec ?? 90,
    targetWeight: 0
  }
}

export function GymDashboard({
  routines,
  onUpdateRoutines,
  workoutLogs,
  prs,
  onOpenPlateCalc,
  profileId = 'primary'
}) {
  const [selectedRoutineId, setSelectedRoutineId] = useState(routines[0]?.id || 'push')
  const [editingExercise, setEditingExercise] = useState(null)
  const [editingExerciseIndex, setEditingExerciseIndex] = useState(-1)
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const [isEditingSplitInfo, setIsEditingSplitInfo] = useState(false)
  const [splitTitle, setSplitTitle] = useState('')
  const [splitSubtitle, setSplitSubtitle] = useState('')
  const [isPushing, setIsPushing] = useState(false)
  const [pushStatus, setPushStatus] = useState(null)

  const activeRoutine = routines.find((r) => r.id === selectedRoutineId) || routines[0]

  const handlePushToCloud = async () => {
    setIsPushing(true)
    setPushStatus(null)
    const res = await pushRoutinesToCloud(routines, profileId)
    setIsPushing(false)
    if (res.success) {
      setPushStatus({
        type: 'success',
        text: `✓ Pushed ${res.count} routines to Supabase Cloud! Ready to sync on watch.`
      })
      setTimeout(() => setPushStatus(null), 5000)
    } else {
      setPushStatus({ type: 'error', text: `Failed to push: ${res.error}` })
    }
  }

  // --- Exercise Editing Handlers ---
  const handleOpenEditExercise = (exItem, index) => {
    setEditingExercise(resolveExerciseItem(exItem))
    setEditingExerciseIndex(index)
  }

  const handleSaveExercise = (updatedEx) => {
    if (!activeRoutine || editingExerciseIndex < 0) return
    const nextExercises = [...activeRoutine.exercises]
    nextExercises[editingExerciseIndex] = updatedEx

    const updated = routines.map((r) =>
      r.id === activeRoutine.id ? { ...r, exercises: nextExercises } : r
    )
    onUpdateRoutines(updated)
    setEditingExercise(null)
    setEditingExerciseIndex(-1)
  }

  const handleMoveExercise = (index, direction) => {
    if (!activeRoutine) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= activeRoutine.exercises.length) return

    const nextExercises = [...activeRoutine.exercises]
    const temp = nextExercises[index]
    nextExercises[index] = nextExercises[targetIndex]
    nextExercises[targetIndex] = temp

    const updated = routines.map((r) =>
      r.id === activeRoutine.id ? { ...r, exercises: nextExercises } : r
    )
    onUpdateRoutines(updated)
  }

  const handleRemoveExercise = (index) => {
    if (!activeRoutine) return
    const nextExercises = activeRoutine.exercises.filter((_, i) => i !== index)
    const updated = routines.map((r) =>
      r.id === activeRoutine.id ? { ...r, exercises: nextExercises } : r
    )
    onUpdateRoutines(updated)
  }

  const handleAddExerciseFromLibrary = (exerciseObj) => {
    if (!activeRoutine) return
    const nextExercises = [...activeRoutine.exercises, exerciseObj]
    const updated = routines.map((r) =>
      r.id === activeRoutine.id ? { ...r, exercises: nextExercises } : r
    )
    onUpdateRoutines(updated)
  }

  // --- Split Management Handlers ---
  const handleStartEditSplitInfo = () => {
    if (!activeRoutine) return
    setSplitTitle(activeRoutine.title)
    setSplitSubtitle(activeRoutine.subtitle || '')
    setIsEditingSplitInfo(true)
  }

  const handleSaveSplitInfo = (e) => {
    e.preventDefault()
    if (!activeRoutine || !splitTitle.trim()) return
    const updated = routines.map((r) =>
      r.id === activeRoutine.id
        ? { ...r, title: splitTitle.trim(), subtitle: splitSubtitle.trim() }
        : r
    )
    onUpdateRoutines(updated)
    setIsEditingSplitInfo(false)
  }

  const handleCreateNewSplit = () => {
    const newId = 'split_' + Date.now()
    const newSplit = {
      id: newId,
      profileId,
      title: 'Custom Split',
      subtitle: 'Custom focus routine',
      exercises: ['bench_press', 'overhead_press', 'lateral_raise']
    }
    const updated = [...routines, newSplit]
    onUpdateRoutines(updated)
    setSelectedRoutineId(newId)
  }

  const handleDeleteSplit = (splitId) => {
    if (routines.length <= 1) {
      alert('You must keep at least one workout split.')
      return
    }
    if (!confirm('Are you sure you want to delete this workout split?')) return
    const updated = routines.filter((r) => r.id !== splitId)
    onUpdateRoutines(updated)
    setSelectedRoutineId(updated[0]?.id || '')
  }

  const currentExerciseIds = (activeRoutine?.exercises || []).map((e) =>
    typeof e === 'object' && e !== null ? e.id : e
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner */}
      <div
        className="glass-card"
        style={{
          padding: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: '700',
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}
          >
            STRENGTH & PROGRESSIVE OVERLOAD
          </span>
          <h2 style={{ marginTop: '4px' }}>Gym Studio & Routine Architect</h2>
          <p style={{ marginTop: '4px' }}>
            Customize your exercises, sets, reps, and rest timers. Changes sync wirelessly to your Amazfit watch.
          </p>
          {pushStatus && (
            <div
              style={{
                marginTop: '10px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: '600',
                background:
                  pushStatus.type === 'success'
                    ? 'rgba(0, 230, 118, 0.15)'
                    : 'rgba(255, 61, 0, 0.15)',
                color:
                  pushStatus.type === 'success'
                    ? 'var(--color-success)'
                    : 'var(--color-accent)',
                border: `1px solid ${
                  pushStatus.type === 'success'
                    ? 'rgba(0, 230, 118, 0.3)'
                    : 'rgba(255, 61, 0, 0.3)'
                }`
              }}
            >
              {pushStatus.text}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            id="btn-push-cloud"
            className="btn-primary"
            onClick={handlePushToCloud}
            disabled={isPushing}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Cloud size={16} /> {isPushing ? 'Pushing...' : 'Push to Watch Cloud'}
          </button>
          <button id="btn-open-plate" className="btn-secondary" onClick={onOpenPlateCalc}>
            <span>🧮</span> Olympic Plate Math
          </button>
        </div>
      </div>

      {/* Main Grid: Left Routine Builder, Right PRs & Logs */}
      <div className="dashboard-columns">
        {/* Routine Builder */}
        <div className="glass-card" style={{ padding: '26px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>Workout Splits on Watch</h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {routines.length} Splits Active • Tap split to edit
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateNewSplit}
              className="btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem' }}
            >
              <Plus size={13} color="var(--color-primary)" /> New Split
            </button>
          </div>

          {/* Routine Selector Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {routines.map((routine) => (
              <button
                key={routine.id}
                onClick={() => {
                  setSelectedRoutineId(routine.id)
                  setIsEditingSplitInfo(false)
                }}
                className={`btn-secondary btn-sm ${routine.id === selectedRoutineId ? 'active' : ''}`}
                style={{
                  background:
                    routine.id === selectedRoutineId
                      ? 'var(--color-primary)'
                      : 'rgba(255, 255, 255, 0.05)',
                  color: routine.id === selectedRoutineId ? '#000000' : 'var(--text-secondary)',
                  fontWeight: '700'
                }}
              >
                {routine.title}
              </button>
            ))}
          </div>

          {/* Active Split Exercise List & Details */}
          {activeRoutine && (
            <div>
              {/* Split Header & Rename Controls */}
              <div
                style={{
                  marginBottom: '18px',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                {!isEditingSplitInfo ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ color: 'var(--color-primary)', margin: 0, fontSize: '1.15rem' }}>
                        {activeRoutine.title}
                      </h4>
                      <button
                        type="button"
                        onClick={handleStartEditSplitInfo}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '2px 4px'
                        }}
                        title="Rename Split"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                    <p style={{ fontSize: '0.82rem', margin: '4px 0 0 0', color: 'var(--text-muted)' }}>
                      {activeRoutine.subtitle || 'Custom workout split'} • {activeRoutine.exercises.length} Exercises
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSaveSplitInfo} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%' }}>
                    <input
                      type="text"
                      className="input-field"
                      value={splitTitle}
                      onChange={(e) => setSplitTitle(e.target.value)}
                      placeholder="Split Title (e.g. Push Day)"
                      required
                      style={{ flex: 1, minWidth: '140px' }}
                    />
                    <input
                      type="text"
                      className="input-field"
                      value={splitSubtitle}
                      onChange={(e) => setSplitSubtitle(e.target.value)}
                      placeholder="Subtitle (e.g. Chest • Shoulders)"
                      style={{ flex: 1, minWidth: '140px' }}
                    />
                    <button type="submit" className="btn-primary btn-sm" style={{ padding: '0 14px' }}>
                      <Check size={14} /> Save
                    </button>
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={() => setIsEditingSplitInfo(false)}
                    >
                      Cancel
                    </button>
                  </form>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsLibraryOpen(true)}
                    className="btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <BookOpen size={13} /> + Add from Library
                  </button>
                  {routines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteSplit(activeRoutine.id)}
                      className="btn-secondary btn-sm"
                      style={{ color: 'var(--color-accent)', padding: '6px 10px' }}
                      title="Delete Split"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Exercises List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {activeRoutine.exercises.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '36px 20px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '12px',
                      border: '1px dashed rgba(255, 255, 255, 0.1)',
                      color: 'var(--text-muted)'
                    }}
                  >
                    <Dumbbell size={32} color="var(--text-muted)" style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <div style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>No exercises in this split yet</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                      Click <strong>"+ Add from Library"</strong> below to select exercises.
                    </div>
                  </div>
                ) : (
                  activeRoutine.exercises.map((item, index) => {
                    const ex = resolveExerciseItem(item)
                    return (
                      <div
                        key={ex.id + index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 16px',
                          background: 'rgba(0, 0, 0, 0.4)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          transition: 'border-color 0.15s ease'
                        }}
                      >
                        {/* Left: Reorder buttons & Exercise details */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                          {/* Reorder Stepper */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <button
                              type="button"
                              onClick={() => handleMoveExercise(index, 'up')}
                              disabled={index === 0}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: index === 0 ? 'rgba(255,255,255,0.1)' : 'var(--text-muted)',
                                cursor: index === 0 ? 'default' : 'pointer',
                                padding: '1px'
                              }}
                              title="Move Up"
                            >
                              <ChevronUp size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveExercise(index, 'down')}
                              disabled={index === activeRoutine.exercises.length - 1}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color:
                                  index === activeRoutine.exercises.length - 1
                                    ? 'rgba(255,255,255,0.1)'
                                    : 'var(--text-muted)',
                                cursor:
                                  index === activeRoutine.exercises.length - 1 ? 'default' : 'pointer',
                                padding: '1px'
                              }}
                              title="Move Down"
                            >
                              <ChevronDown size={15} />
                            </button>
                          </div>

                          <span
                            style={{
                              color: 'var(--text-muted)',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.85rem',
                              width: '20px'
                            }}
                          >
                            {index + 1}.
                          </span>

                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                {ex.name}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: 'rgba(255, 184, 0, 0.12)',
                                  color: 'var(--color-primary)',
                                  fontWeight: '700'
                                }}
                              >
                                {ex.category}
                              </span>
                              {ex.targetWeight > 0 && (
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    background: 'rgba(0, 229, 255, 0.12)',
                                    color: 'var(--color-cyan)',
                                    fontWeight: '700'
                                  }}
                                >
                                  {ex.targetWeight} kg
                                </span>
                              )}
                            </div>

                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span>
                                <Layers size={11} style={{ display: 'inline', marginRight: '3px' }} />
                                <strong>{ex.defaultSets}</strong> sets × <strong>{ex.defaultReps}</strong> reps
                              </span>
                              <span>
                                <Clock size={11} style={{ display: 'inline', marginRight: '3px' }} />
                                ⏱️ {ex.defaultRestSec}s rest
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Edit & Remove Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditExercise(item, index)}
                            className="btn-secondary btn-sm"
                            style={{
                              padding: '6px 10px',
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: 'var(--color-primary)'
                            }}
                            title="Edit Sets, Reps & Rest"
                          >
                            <Edit3 size={13} /> Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(index)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '6px',
                              borderRadius: '6px'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent)')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                            title="Remove from split"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Bottom Quick Library Add Button */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsLibraryOpen(true)}
                  className="btn-secondary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px dashed rgba(255, 179, 0, 0.3)',
                    background: 'rgba(255, 179, 0, 0.03)',
                    color: 'var(--color-primary)',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Plus size={16} /> Add Exercise from Library (30+ Presets)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: 1RM Records & Recent Workout Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Estimated 1RM Leaderboard */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}
            >
              <h3>⚡ Personal Records (1RM)</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: '700' }}>
                EPLEY FORMULA
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {prs.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '24px 16px',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>⚡</div>
                  <div>No Personal Records logged yet.</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                    Complete a workout and log your weights on your watch to calculate your 1RM!
                  </div>
                </div>
              ) : (
                prs.map((pr, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'rgba(0, 0, 0, 0.25)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{pr.exercise}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Logged: {pr.weight} {pr.unit} × {pr.reps} reps
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.25rem',
                          fontWeight: '800',
                          color: 'var(--color-primary)'
                        }}
                      >
                        {pr.est1RM} {pr.unit}
                      </div>
                      <div
                        style={{
                          fontSize: '0.68rem',
                          color: 'var(--color-success)',
                          textTransform: 'uppercase',
                          fontWeight: '700'
                        }}
                      >
                        Est. 1RM Max
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Workout Logs */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>🏋️ Recent T-Rex 3 Logs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {workoutLogs.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '24px 16px',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🏋️</div>
                  <div>No workout logs synced yet.</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                    Start a workout on your Amazfit watch and tap "Sync Telemetry" to see it here!
                  </div>
                </div>
              ) : (
                workoutLogs.map((log) => (
                  <div key={log.id} className="activity-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="activity-badge badge-gym">🏋️</div>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                          {log.routineTitle}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {new Date(log.date).toLocaleDateString()} • {Math.round(log.durationSec / 60)} mins • {log.totalSets} sets
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontWeight: '800',
                          color: 'var(--color-primary)',
                          fontFamily: 'var(--font-display)'
                        }}
                      >
                        {Number(log.totalVolumeKg).toLocaleString()} kg
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>VOLUME LOAD</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Edit Modal */}
      {editingExercise && (
        <ExerciseEditModal
          exercise={editingExercise}
          onSave={handleSaveExercise}
          onClose={() => {
            setEditingExercise(null)
            setEditingExerciseIndex(-1)
          }}
        />
      )}

      {/* Exercise Library Modal */}
      {isLibraryOpen && (
        <ExerciseLibraryModal
          currentExerciseIds={currentExerciseIds}
          onAddExercise={handleAddExerciseFromLibrary}
          onClose={() => setIsLibraryOpen(false)}
        />
      )}
    </div>
  )
}
