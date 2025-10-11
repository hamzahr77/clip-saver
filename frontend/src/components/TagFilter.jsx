// TagFilter.jsx
import React, { useEffect, useState } from "react";

export default function TagFilter({ onSelect, onKindSelect, selectedTag, selectedKind }) {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API || "http://localhost:5000/api"}/tags`)
      .then((r) => r.json())
      .then(setTags)
      .catch(() => setTags([]));
  }, []);

  function handleKind(k) {
    if (onKindSelect) onKindSelect(k);
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ marginBottom: 8, color: "var(--muted)" }}>Type</div>
      <div className="kind-row">
        <button
          className={`chip ${!selectedKind ? "active" : ""}`}
          onClick={() => handleKind("")}
          title="Show all items"
        >
          All
        </button>
        <button
          className={`chip ${selectedKind === "note" ? "active" : ""}`}
          onClick={() => handleKind("note")}
          title="Show notes only"
        >
          Notes
        </button>
        <button
          className={`chip ${selectedKind === "bookmark" ? "active" : ""}`}
          onClick={() => handleKind("bookmark")}
          title="Show bookmarks only"
        >
          Bookmarks
        </button>
      </div>

      <div style={{ marginTop: 12, marginBottom: 8, color: "var(--muted)" }}>Tags</div>
      <div className="chips">
        <button
          className={`chip ${!selectedTag ? "active" : ""}`}
          onClick={() => onSelect && onSelect("")}
        >
          All
        </button>

        {tags.map((t) => (
          <button
            key={t.tag}
            className={`chip ${selectedTag === t.tag ? "active" : ""}`}
            onClick={() => onSelect && onSelect(t.tag)}
            title={`${t.count} clips`}
          >
            {t.tag} <span style={{ color: "var(--muted)", marginLeft: 8, fontWeight: 600 }}>({t.count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
