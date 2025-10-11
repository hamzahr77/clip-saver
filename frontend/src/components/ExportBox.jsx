// ExportBox.jsx
import React, { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* Utilities */
function toCSV(items) {
  if (!items || items.length === 0) return "";
  const headers = ["id","kind","title","content","url","tags","created_at","updated_at"];
  const rows = items.map(it =>
    headers.map(h => {
      let v = it[h] ?? "";
      v = String(v).replace(/"/g, '""');
      if (v.indexOf(",") >= 0 || v.indexOf("\n") >= 0) v = `"${v}"`;
      return v;
    }).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
function escapeHtml(s){ if (!s) return ""; return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function escapeAttr(s){ return (s||"").replace(/"/g,"&quot;"); }

/* Build printable HTML with embedded styles for a nicer look */
function makePrintableHtml(items, title = "Clip Saver Export") {
  const headerHtml = `
    <div class="export-header">
      <div class="brand">
        <div class="logo">CS</div>
        <div>
          <div class="report-title">${escapeHtml(title)}</div>
          <div class="meta">Exported: ${new Date().toLocaleString()}</div>
        </div>
      </div>
      <div style="flex:1"></div>
    </div>
  `;

  const cards = items.map(it => {
    const content = (it.content || "").replace(/\n/g, "<br/>");
    const tags = (it.tags || "").split(",").filter(Boolean).map(t => `<span class="badge">${escapeHtml(t)}</span>`).join(" ");
    const urlHtml = it.url ? `<div class="url"><a href="${escapeAttr(it.url)}">${escapeHtml(it.url)}</a></div>` : "";
    return `
      <article class="card">
        <div class="card-head">
          <h3 class="card-title">${escapeHtml(it.title || "")}</h3>
          <div class="card-meta">${escapeHtml(it.kind || "")}${it.tags ? " • " + escapeHtml(it.tags) : ""}</div>
        </div>
        <div class="card-body">${content}</div>
        ${urlHtml}
        <div class="card-footer">
          <div class="badges">${tags}</div>
          <div class="created">Created: ${escapeHtml(it.created_at || "")}</div>
        </div>
      </article>
    `;
  }).join("\n");

  const style = `
    <style>
      @media print { @page { size: A4; margin: 12mm; } }
      :root{ --bg:#f7f8fb; --card:#ffffff; --muted:#6b7280; --accent:#6c3fff; }
      body { margin:0; padding:24px; font-family: Inter, Arial, Helvetica, sans-serif; background: var(--bg); color:#111; }
      .export-header { display:flex; align-items:center; gap:16px; margin-bottom:18px; }
      .brand { display:flex; gap:12px; align-items:center; }
      .logo { width:56px; height:56px; border-radius:12px; background:linear-gradient(135deg,var(--accent),#9a6eff); display:flex; align-items:center; justify-content:center; color:white; font-weight:700; font-size:18px; box-shadow:0 8px 28px rgba(108,63,255,0.12); }
      .report-title { font-weight:700; font-size:20px; color:#111; }
      .meta { color:var(--muted); font-size:12px; margin-top:4px; }
      .cards { display:grid; grid-template-columns: repeat(2, 1fr); gap:18px; margin-top:12px; }
      .card { background:var(--card); border-radius:10px; padding:14px; box-shadow: 0 6px 18px rgba(0,0,0,0.05); border:1px solid rgba(17,24,39,0.04); min-height:120px; box-sizing:border-box; }
      .card-head { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
      .card-title { margin:0; font-size:16px; color:#111; }
      .card-meta { color:var(--muted); font-size:12px; text-align:right; min-width:80px; }
      .card-body { margin-top:8px; color:#333; font-size:13px; line-height:1.4; max-height:300px; overflow:hidden; }
      .url { margin-top:8px; font-size:12px; }
      .url a { color:#0b5fff; text-decoration:underline; }
      .card-footer { display:flex; justify-content:space-between; align-items:center; margin-top:10px; gap:12px; }
      .badges { display:flex; gap:8px; flex-wrap:wrap; }
      .badge { background: rgba(108,63,255,0.08); color: #3b2aa6; padding:4px 8px; border-radius:999px; font-size:11px; }
      .created { color:var(--muted); font-size:11px; }
      /* Make single column on narrow widths */
      @media (max-width: 900px) {
        .cards { grid-template-columns: 1fr; }
      }
    </style>
  `;

  // set printable wrapper width to 1200px (good for A4 scaling)
  const wrapper = `<div style="width:1200px; box-sizing:border-box;">${headerHtml}<div class="cards">${cards}</div></div>`;

  return `<!doctype html><html><head><meta charset="utf-8">${style}</head><body>${wrapper}</body></html>`;
}

/* Main component */
export default function ExportBox() {
  const [open, setOpen] = useState(false);
  const api = import.meta.env.VITE_API || "http://localhost:5000/api";

  async function fetchExport() {
    const res = await fetch(`${api}/export`);
    return res.json();
  }

  async function downloadJSON() {
    const data = await fetchExport();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const filename = `clips_export_${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.json`;
    downloadBlob(blob, filename);
    setOpen(false);
  }

  async function downloadCSV() {
    const data = await fetchExport();
    const csv = toCSV(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const filename = `clips_export_${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.csv`;
    downloadBlob(blob, filename);
    setOpen(false);
  }

  async function downloadPDF() {
    try {
      const data = await fetchExport();
      if (!Array.isArray(data) || data.length === 0) {
        alert("No clips to export.");
        return;
      }

      // build printable HTML and add to off-screen container
      const html = makePrintableHtml(data, "Clip Saver Export");
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.zIndex = "99999";
      container.innerHTML = html;
      document.body.appendChild(container);

      // use html2canvas to render - set scale for crisp result
      const scale = 2; // increase to 3 for even higher quality but more memory
      const canvas = await html2canvas(container, {
        scale,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: 1200, // match wrapper width
      });

      container.remove();

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // convert canvas px -> mm (approx)
      const mmPerPx = 0.2645833333;
      const imgWidthMm = (canvas.width * mmPerPx) / scale;
      const imgHeightMm = (canvas.height * mmPerPx) / scale;

      // If image fits on one page
      if (imgHeightMm <= pageHeight) {
        pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, (imgHeightMm / imgWidthMm) * pageWidth);
        // footer page number
        pdf.setFontSize(10);
        pdf.setTextColor(120);
        pdf.text(`Page 1`, pageWidth / 2, pageHeight - 6, { align: "center" });
      } else {
        // slice canvas vertically
        const pxPerPage = Math.floor((pageHeight / mmPerPx) * scale); // px slice height
        let yOffset = 0;
        let page = 1;
        while (yOffset < canvas.height) {
          const sliceHeight = Math.min(pxPerPage, canvas.height - yOffset);
          const tmpCanvas = document.createElement("canvas");
          tmpCanvas.width = canvas.width;
          tmpCanvas.height = sliceHeight;
          const ctx = tmpCanvas.getContext("2d");
          ctx.drawImage(canvas, 0, yOffset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
          const sliceData = tmpCanvas.toDataURL("image/jpeg", 0.95);
          const sliceImgHeightMm = (sliceHeight * mmPerPx) / scale;
          pdf.addImage(sliceData, "JPEG", 0, 0, pageWidth, (sliceImgHeightMm / imgWidthMm) * pageWidth);
          // page number
          pdf.setFontSize(10);
          pdf.setTextColor(120);
          pdf.text(`Page ${page}`, pageWidth / 2, pageHeight - 6, { align: "center" });
          yOffset += sliceHeight;
          page += 1;
          if (yOffset < canvas.height) pdf.addPage();
        }
      }

      const filename = `clips_export_${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.pdf`;
      pdf.save(filename);
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("PDF export failed. See console for details.");
    }
  }

  return (
    <div className="export-actions">
      <div style={{ fontWeight: 700 }}>Export</div>
      <div className="export-menu">
        <button className="btn" onClick={() => setOpen((s) => !s)}>Download ▾</button>
        {open && (
          <div className="export-dropdown">
            <button onClick={downloadJSON}>Download JSON</button>
            <button onClick={downloadCSV}>Download CSV</button>
            <button onClick={downloadPDF}>Download PDF</button>
          </div>
        )}
      </div>
    </div>
  );
}
