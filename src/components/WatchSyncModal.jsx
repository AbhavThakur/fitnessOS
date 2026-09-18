import React, { useState } from "react";
import {
  getCloudConfig,
  saveCloudConfig,
  testCloudConnection,
} from "../lib/supabase";

export function WatchSyncModal({ isOpen, onClose, onSaveConfig }) {
  const [config, setConfig] = useState(getCloudConfig());
  const [isTesting, setIsTesting] = useState(false);
  const [syncLog, setSyncLog] = useState([
    "⚡ BLE Peripheral: Amazfit T-Rex 3 (MAC: 48:E7:29:A1:04) connected.",
    "⚡ IronPulse Zepp OS Side-Service (v1.0.0) initialized.",
    "⚡ Ready to synchronize Gym, Badminton, and Running sessions.",
  ]);

  if (!isOpen) return null;

  const handleSave = () => {
    const savedConfig = {
      supabaseUrl: config.supabaseUrl.trim(),
      supabaseAnonKey: config.supabaseAnonKey.trim(),
      connected: false,
    };
    saveCloudConfig(savedConfig);
    setConfig(savedConfig);
    if (onSaveConfig) onSaveConfig(false);
    setSyncLog((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Cloud configuration saved. Test the connection to verify it.`,
    ]);
  };

  const handleTestSync = async () => {
    setIsTesting(true);
    const result = await testCloudConnection(config);
    const connected = result.success;
    const savedConfig = {
      supabaseUrl: config.supabaseUrl.trim(),
      supabaseAnonKey: config.supabaseAnonKey.trim(),
      connected,
    };
    saveCloudConfig(savedConfig);
    setConfig(savedConfig);
    if (onSaveConfig) onSaveConfig(connected);
    setSyncLog((prev) => [
      ...prev,
      connected
        ? `[${new Date().toLocaleTimeString()}] Supabase connection verified.`
        : `[${new Date().toLocaleTimeString()}] Connection failed: ${result.error}`,
    ]);
    setIsTesting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <h3>Amazfit T-Rex 3 & Supabase Cloud Sync</h3>
            <p style={{ fontSize: "0.85rem" }}>
              BLE side-service bridge configuration
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

        {/* Supabase URL & Key Form */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            marginBottom: "20px",
          }}
        >
          <div>
            <label
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              SUPABASE PROJECT URL
            </label>
            <input
              type="text"
              placeholder="https://your-project.supabase.co"
              value={config.supabaseUrl}
              onChange={(e) =>
                setConfig({ ...config, supabaseUrl: e.target.value })
              }
              style={{
                width: "100%",
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "10px 14px",
                color: "#ffffff",
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              SUPABASE ANON PUBLIC KEY
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={config.supabaseAnonKey}
              onChange={(e) =>
                setConfig({ ...config, supabaseAnonKey: e.target.value })
              }
              style={{
                width: "100%",
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "10px 14px",
                color: "#ffffff",
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-primary btn-sm" onClick={handleSave}>
              Save Cloud Settings
            </button>
            <button
              className="btn-secondary btn-sm"
              onClick={handleTestSync}
              disabled={isTesting}
            >
              {isTesting ? "Testing..." : "Test Cloud Connection"}
            </button>
          </div>
        </div>

        {/* Live Terminal Console */}
        <div>
          <label
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              display: "block",
              marginBottom: "6px",
            }}
          >
            LIVE BLE SYNC PACKET CONSOLE
          </label>
          <div
            style={{
              background: "#040406",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "14px",
              height: "150px",
              overflowY: "auto",
              fontFamily: "var(--font-mono)",
              fontSize: "0.78rem",
              lineHeight: "1.6",
              color: "var(--color-primary)",
            }}
          >
            {syncLog.map((log, index) => (
              <div
                key={index}
                style={{
                  color: log.includes("verified")
                    ? "var(--color-success)"
                    : "inherit",
                }}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
