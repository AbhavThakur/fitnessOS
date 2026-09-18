/**
 * Security & Athlete PIN Code Protection
 * Protects private health, workout metrics, and family telemetry when hosted on Vercel
 */

const STORAGE_KEY_PIN = 'ironpulse_athlete_pin'
const STORAGE_KEY_PIN_ENABLED = 'ironpulse_pin_enabled'
const STORAGE_KEY_SESSION_UNLOCKED = 'ironpulse_session_unlocked'
const STORAGE_KEY_REMEMBER_EXPIRY = 'ironpulse_remember_expiry'

const DEFAULT_PIN = '1234'
const REMEMBER_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 Days

export function getStoredPin() {
  return localStorage.getItem(STORAGE_KEY_PIN) || DEFAULT_PIN
}

export function setStoredPin(newPin) {
  if (/^\d{4}$/.test(newPin)) {
    localStorage.setItem(STORAGE_KEY_PIN, newPin)
    return true
  }
  return false
}

export function isPinEnabled() {
  const val = localStorage.getItem(STORAGE_KEY_PIN_ENABLED)
  return val === null ? true : val === 'true'
}

export function setPinEnabled(enabled) {
  localStorage.setItem(STORAGE_KEY_PIN_ENABLED, enabled ? 'true' : 'false')
}

export function isAppLocked() {
  if (!isPinEnabled()) return false

  // Check in-tab session unlock
  if (sessionStorage.getItem(STORAGE_KEY_SESSION_UNLOCKED) === 'true') {
    return false
  }

  // Check 7-day remember device token
  const rememberExpiry = localStorage.getItem(STORAGE_KEY_REMEMBER_EXPIRY)
  if (rememberExpiry && Date.now() < Number(rememberExpiry)) {
    return false
  }

  return true
}

export function verifyAndUnlock(enteredPin, rememberDevice = false) {
  const currentPin = getStoredPin()
  if (enteredPin === currentPin) {
    sessionStorage.setItem(STORAGE_KEY_SESSION_UNLOCKED, 'true')
    if (rememberDevice) {
      localStorage.setItem(STORAGE_KEY_REMEMBER_EXPIRY, String(Date.now() + REMEMBER_DURATION_MS))
    }
    return true
  }
  return false
}

export function lockApp() {
  sessionStorage.removeItem(STORAGE_KEY_SESSION_UNLOCKED)
  localStorage.removeItem(STORAGE_KEY_REMEMBER_EXPIRY)
}

export function resetPinToDefault() {
  localStorage.setItem(STORAGE_KEY_PIN, DEFAULT_PIN)
  localStorage.setItem(STORAGE_KEY_PIN_ENABLED, 'true')
}
