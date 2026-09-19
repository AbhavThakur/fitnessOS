import React, { useState, useEffect } from 'react'
import { Lock, ShieldCheck, Delete, AlertCircle } from 'lucide-react'
import { verifyAndUnlock } from '../lib/security'

export function PinLockOverlay({ onUnlocked }) {
  const [pin, setPin] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      setPin((prev) => (prev.length < 4 ? prev + digit : prev))
      setError(false)
    }
  }

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1))
    setError(false)
  }

  const handleClear = () => {
    setPin('')
    setError(false)
  }

  // Validate PIN whenever 4 digits have been entered
  useEffect(() => {
    if (pin.length === 4) {
      const success = verifyAndUnlock(pin, remember)
      if (success) {
        setError(false)
        onUnlocked()
      } else {
        setError(true)
        setErrorMessage('Incorrect PIN. Default is 1234')
        const timer = setTimeout(() => {
          setPin('')
        }, 400)
        return () => clearTimeout(timer)
      }
    }
  }, [pin, remember, onUnlocked])

  // Support physical keyboard entry
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        setPin((prev) => (prev.length < 4 ? prev + e.key : prev))
        setError(false)
      } else if (e.key === 'Backspace') {
        setPin((prev) => prev.slice(0, -1))
        setError(false)
      } else if (e.key === 'Escape') {
        setPin('')
        setError(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 5, 8, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '380px',
          padding: '36px 28px',
          textAlign: 'center',
          border: '1px solid rgba(255, 179, 0, 0.25)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 179, 0, 0.08)'
        }}
      >
        {/* Lock Icon */}
        <div
          style={{
            width: '60px',
            height: '60px',
            margin: '0 auto 16px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(255, 179, 0, 0.2), rgba(0, 229, 255, 0.1))',
            border: '1px solid var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Lock size={28} color="var(--color-primary)" />
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '0.04em', margin: '0 0 6px 0' }}>
          IRONPULSE OS
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 24px 0' }}>
          Enter 4-Digit Athlete Security PIN
        </p>

        {/* 4 Dot Indicators */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '28px'
          }}
        >
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index
            return (
              <div
                key={index}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: `2px solid ${error ? 'var(--color-accent)' : isFilled ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.2)'}`,
                  background: isFilled
                    ? error
                      ? 'var(--color-accent)'
                      : 'var(--color-primary)'
                    : 'transparent',
                  boxShadow: isFilled
                    ? `0 0 14px ${error ? 'var(--color-accent)' : 'var(--color-primary)'}`
                    : 'none',
                  transition: 'all 0.15s ease'
                }}
              />
            )
          })}
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              color: 'var(--color-accent)',
              marginBottom: '16px'
            }}
          >
            <AlertCircle size={14} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tactile Keypad */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            maxWidth: '280px',
            margin: '0 auto 20px'
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(String(digit))}
              style={{
                height: '60px',
                fontSize: '1.4rem',
                fontWeight: '700',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.12s ease'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.background = 'rgba(255, 179, 0, 0.2)'
                e.currentTarget.style.borderColor = 'var(--color-primary)'
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
              }}
            >
              {digit}
            </button>
          ))}

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            style={{
              height: '60px',
              fontSize: '0.85rem',
              fontWeight: '700',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            CLEAR
          </button>

          {/* 0 Button */}
          <button
            type="button"
            onClick={() => handleDigit('0')}
            style={{
              height: '60px',
              fontSize: '1.4rem',
              fontWeight: '700',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            onClick={handleDelete}
            style={{
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <Delete size={20} />
          </button>
        </div>

        {/* Remember Device Checkbox */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            margin: '0 0 16px 0'
          }}
        >
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            style={{ accentColor: 'var(--color-primary)' }}
          />
          <span>Remember this device for 7 days</span>
        </label>

        {/* Security Info */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
          <ShieldCheck size={13} color="var(--color-primary)" />
          <span>Default PIN: <strong>1234</strong> (customizable in Settings)</span>
        </div>
      </div>
    </div>
  )
}
