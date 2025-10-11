import React, { useEffect, useState } from "react";
import { fetchClips, createClip, deleteClip } from "./api";
import ClipList from "./components/ClipList";
import ClipEditorModal from "./components/ClipEditorModal";
import SearchBar from "./components/SearchBar";
import TagFilter from "./components/TagFilter";
import ExportBox from "./components/ExportBox";
import "./styles.css";

export default function App() {
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedKind, setSelectedKind] = useState(""); // "", "note", "bookmark"
  const [showEditor, setShowEditor] = useState(false);

  async function loadClips() {
    setLoading(true);
    try {
      const res = await fetchClips({ q: query, tag: selectedTag, kind: selectedKind });
      setClips(res.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedTag, selectedKind]);

  async function onCreate(data) {
    await createClip(data);
    setShowEditor(false);
    setQuery("");
    loadClips();
  }

  async function onDelete(id) {
    await deleteClip(id);
    loadClips();
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="logo">CS</div>
          <div>
            <div className="title">Clip Saver</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>Notes, bookmarks & quick captures</div>
          </div>
        </div>

        <div className="controls">
          <button className="btn" onClick={() => { setQuery(""); setSelectedTag(""); setSelectedKind(""); }}>Clear</button>
          <button className="btn primary" onClick={() => setShowEditor(true)}>New clip</button>
        </div>
      </header>

      <div className="main">
        <div className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <SearchBar value={query} onChange={setQuery} onSearch={loadClips} />
            <div style={{ width: 12 }} />
          </div>

          <TagFilter
            onSelect={setSelectedTag}
            onKindSelect={setSelectedKind}
            selectedTag={selectedTag}
            selectedKind={selectedKind}
          />

          <div className="clip-list">
            {loading ? <div className="kv">Loading…</div> : (
              clips.length ? <ClipList clips={clips} onDelete={onDelete} /> : <div className="empty">No clips yet. Add one with “New clip”.</div>
            )}
          </div>
        </div>

        <aside className="aside">
          <div className="panel export-box">
            <ExportBox />
            <div style={{ marginTop: 12, color: "var(--muted)" }} className="kv">
              Tip: Use tags to organize and filter your clips.
            </div>
          </div>
        </aside>
      </div>

      {showEditor && <ClipEditorModal onClose={() => setShowEditor(false)} onSave={onCreate} />}
    </div>
  );
}
