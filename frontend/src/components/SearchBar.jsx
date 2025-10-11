import React from "react";

export default function SearchBar({ value, onChange, onSearch }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", width: "100%" }}>
      <input
        className="input"
        placeholder="Search title, content, tags..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
      />
      <button className="btn" onClick={onSearch}>Search</button>
    </div>
  );
}
