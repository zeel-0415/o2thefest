// src/GlassHero.jsx
import React from "react";

export default function GlassHero() {
  return (
    <div className="glass-hero">
      <div className="hero-inner">
        <div className="hero-title">Fast. Accurate. Usable.</div>
        <div className="hero-sub">Split large certificate PDFs by event — no manual work.</div>

        <div className="hero-stats">
          <div className="stat">
            <div className="stat-num">99.2%</div>
            <div className="stat-label">Text match accuracy</div>
          </div>
          <div className="stat">
            <div className="stat-num"><span className="muted">—</span></div>
            <div className="stat-label">Realtime preview</div>
          </div>
        </div>

        <div className="hero-actions">
          <button className="btn ghost">How it works</button>
          <button className="btn outline">Docs</button>
        </div>
      </div>
    </div>
  );
}
