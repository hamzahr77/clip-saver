import React from "react";

function tagElements(tags) {
  if (!tags) return null;
  return tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
    <span key={t} className="tag">#{t}</span>
  ));
}

export default function ClipCard({ clip, onDelete }) {
  const { title, kind, content, url, tags } = clip;
  return (
    <div className="clip-card">
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="clip-title">{title}</div>
          <div className="clip-kind">{kind}</div>
        </div>
        <div className="clip-body">{content ? content.slice(0, 160) + (content.length > 160 ? "…" : "") : (url || "")}</div>
        <div style={{ marginTop: 10 }}>{tagElements(tags)}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button className="btn" onClick={onDelete} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.04)", color: "var(--muted)" }}>
          Delete
        </button>
      </div>
    </div>
  );
}
