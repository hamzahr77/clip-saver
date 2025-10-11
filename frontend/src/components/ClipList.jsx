import React from "react";
import ClipCard from "./ClipCard";

export default function ClipList({ clips = [], onDelete }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {clips.map((c) => (
        <ClipCard key={c.id} clip={c} onDelete={() => onDelete(c.id)} />
      ))}
    </div>
  );
}
