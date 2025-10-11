import React, { useState } from "react";

export default function ClipEditorModal({ onClose, onSave }) {
  const [kind, setKind] = useState("note");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const payload = { kind, title: title.trim(), content, url: url.trim() || null, tags };
    onSave(payload);
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={submit}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>New clip</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn" onClick={onClose}>Close</button>
            <button type="submit" className="btn primary">Save</button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label className="label">Kind</label>
          <div className="form-row">
            <select value={kind} onChange={(e) => setKind(e.target.value)} className="input-sm">
              <option value="note">Note</option>
              <option value="bookmark">Bookmark</option>
            </select>
            <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="input-sm" style={{ flex: 1 }} required />
          </div>

          {kind === "bookmark" && (
            <div style={{ marginTop: 10 }}>
              <label className="label">URL</label>
              <input value={url} onChange={(e) => setUrl(e.target.value)} className="input-sm" style={{ width: "100%" }} />
            </div>
          )}

          <div style={{ marginTop: 10 }}>
            <label className="label">Content</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} className="input-sm" style={{ width: "100%" }} />
          </div>

          <div style={{ marginTop: 10 }}>
            <label className="label">Tags (comma separated)</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} className="input-sm" style={{ width: "100%" }} />
          </div>
        </div>
      </form>
    </div>
  );
}
