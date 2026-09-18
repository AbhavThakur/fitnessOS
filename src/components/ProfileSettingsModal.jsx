import React, { useState } from "react";
import { Lock, ShieldCheck, UserCheck } from "lucide-react";
import { updateAthleteProfileName } from "../lib/supabase";
import {
  getStoredPin,
  setStoredPin,
  isPinEnabled,
  setPinEnabled,
} from "../lib/security";

export function ProfileSettingsModal({
  isOpen,
  onClose,
  profiles,
  onUpdateProfiles,
}) {
  const [primaryName, setPrimaryName] = useState(
    profiles?.primary?.name || "You (T-Rex 3)",
  );
  const [partnerName, setPartnerName] = useState(
    profiles?.partner?.name || "Wife (Amazfit)",
  );
  const [pinProtection, setPinProtection] = useState(isPinEnabled());
  const [newPin, setNewPin] = useState(getStoredPin());
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);

    if (pinProtection && !/^\d{4}$/.test(newPin)) {
      setStatusMsg({
        type: "error",
        text: "PIN must be exactly 4 numeric digits (e.g. 1234).",
      });
      setIsSaving(false);
      return;
    }

    try {
      // 1. Save security PIN settings
      setPinEnabled(pinProtection);
      if (pinProtection) {
        setStoredPin(newPin);
      }

      // 2. Save athlete profile names to Supabase
      const profileResults = [];
      profileResults.push(
        await updateAthleteProfileName("primary", primaryName.trim() || "You"),
      );
      profileResults.push(
        await updateAthleteProfileName("partner", partnerName.trim() || "Wife"),
      );
      const failedProfile = profileResults.find((result) => !result.success);
      if (failedProfile)
        throw new Error(failedProfile.error || "Profile sync failed");

      const updated = {
        ...profiles,
        primary: {
          ...profiles.primary,
          name: primaryName.trim() || "You",
          shortName: primaryName.trim().split(" ")[0] || "You",
        },
        partner: {
          ...profiles.partner,
          name: partnerName.trim() || "Wife",
          shortName: partnerName.trim().split(" ")[0] || "Wife",
        },
      };

      onUpdateProfiles(updated);
      setStatusMsg({
        type: "success",
        text: "✓ Profiles and security settings saved! Changes sync to your watch automatically.",
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: "Failed to update settings: " + err.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "500px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "18px",
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>Athlete Profiles & Security</h3>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "0.85rem",
                color: "var(--text-muted)",
              }}
            >
              Customize athlete names & configure website access PIN
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "1.2rem",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSave}
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
        >
          {/* Athlete Names Section */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.8rem",
                color: "var(--color-primary)",
                fontWeight: "700",
              }}
            >
              <UserCheck size={14} /> ATHLETE PROFILES (SYNCED WITH WATCH)
            </div>

            <div>
              <label
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: "600",
                }}
              >
                🧔 YOUR NAME (PRIMARY ATHLETE • T-REX 3)
              </label>
              <input
                type="text"
                className="input-field"
                value={primaryName}
                onChange={(e) => setPrimaryName(e.target.value)}
                placeholder="e.g. Aman"
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: "600",
                }}
              >
                👩 WIFE'S NAME (PARTNER ATHLETE • AMAZFIT)
              </label>
              <input
                type="text"
                className="input-field"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="e.g. Pooja"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <hr
            style={{
              border: "none",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              margin: "4px 0",
            }}
          />

          {/* Security & PIN Lock Section */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.8rem",
                color: "var(--color-primary)",
                fontWeight: "700",
              }}
            >
              <Lock size={14} /> WEBSITE SECURITY & PIN PROTECTION
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              <input
                type="checkbox"
                checked={pinProtection}
                onChange={(e) => setPinProtection(e.target.checked)}
                style={{ accentColor: "var(--color-primary)" }}
              />
              <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                Require 4-digit PIN to view website (Vercel protection)
              </span>
            </label>

            {pinProtection && (
              <div>
                <label
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--text-muted)",
                    display: "block",
                    marginBottom: "4px",
                    fontWeight: "600",
                  }}
                >
                  4-DIGIT ATHLETE PIN
                </label>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <input
                    type="password"
                    maxLength={4}
                    className="input-field"
                    value={newPin}
                    onChange={(e) =>
                      setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    placeholder="1234"
                    style={{
                      width: "120px",
                      letterSpacing: "0.3em",
                      textAlign: "center",
                      fontWeight: "800",
                      fontSize: "1.2rem",
                    }}
                  />
                  <span
                    style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                  >
                    Only users with this PIN can view your workouts on Vercel.
                  </span>
                </div>
              </div>
            )}
          </div>

          {statusMsg && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: "600",
                background:
                  statusMsg.type === "success"
                    ? "rgba(0, 230, 118, 0.15)"
                    : "rgba(255, 61, 0, 0.15)",
                color:
                  statusMsg.type === "success"
                    ? "var(--color-success)"
                    : "var(--color-accent)",
                border: `1px solid ${statusMsg.type === "success" ? "rgba(0, 230, 118, 0.3)" : "rgba(255, 61, 0, 0.3)"}`,
              }}
            >
              {statusMsg.text}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
            <button
              type="submit"
              className="btn-primary"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
              disabled={isSaving}
            >
              <ShieldCheck size={16} />
              {isSaving ? "Saving to Cloud..." : "💾 Save & Sync with Watch"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{ padding: "0 16px" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
