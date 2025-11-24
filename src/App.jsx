import React, { useState, useRef } from "react";
import { extractPageTexts, detectEventsFromPages, splitPdfByPages } from "./pdfUtils";
import Footer from "./Footer";
import "./style.css";

export default function App() {
  const [fileName, setFileName] = useState(null);
  const [pagesInfo, setPagesInfo] = useState([]);
  const [eventsMap, setEventsMap] = useState(new Map());
  const [selectedEvent, setSelectedEvent] = useState("");
  const [manualEvent, setManualEvent] = useState("");
  const [status, setStatus] = useState("idle");

  const fileBufferRef = useRef(null);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    resetState();
    if (!file) return;

    setFileName(file.name);
    setStatus("reading");

    try {
      const originalBuffer = await file.arrayBuffer();
      // keep an untouched copy for splitting later
      fileBufferRef.current = originalBuffer.slice(0);

      setStatus("extracting text");
      const textExtractionBuffer = originalBuffer.slice(0);

      const pages = await extractPageTexts(textExtractionBuffer);
      setPagesInfo(pages);

      const events = detectEventsFromPages(pages);
      setEventsMap(new Map(events));

      setStatus("ready");
    } catch (err) {
      console.error(err);
      setStatus("error reading file");
    }
  }

  function resetState() {
    setFileName(null);
    setPagesInfo([]);
    setEventsMap(new Map());
    setSelectedEvent("");
    setManualEvent("");
    setStatus("idle");
    fileBufferRef.current = null;
  }

  async function handleExtract() {
    const targetEvent = manualEvent.trim() || selectedEvent;

    if (!targetEvent) return alert("Please select or type event name.");
    if (!fileBufferRef.current) return alert("Upload a PDF first.");

    setStatus("creating pdf");

    let pageIndices = [];

    if (eventsMap.has(targetEvent)) {
      pageIndices = eventsMap.get(targetEvent);
    } else {
      for (const [ev, pages] of eventsMap.entries()) {
        if (
          ev.toLowerCase().includes(targetEvent.toLowerCase()) ||
          targetEvent.toLowerCase().includes(ev.toLowerCase())
        ) {
          pageIndices = pages;
          break;
        }
      }
    }

    if (pageIndices.length === 0) {
      pagesInfo.forEach(({ pageIndex, lines }) => {
        if (lines[1]?.trim().toLowerCase() === targetEvent.toLowerCase()) {
          pageIndices.push(pageIndex);
        }
      });
    }

    if (pageIndices.length === 0) {
      alert("No matching event found!");
      setStatus("ready");
      return;
    }

    pageIndices = [...new Set(pageIndices)].sort((a, b) => a - b);

    try {
      const blob = await splitPdfByPages(fileBufferRef.current, pageIndices);
      const finalName = `${targetEvent.replace(/\s+/g, "_")}.pdf`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = finalName;
      a.click();
      URL.revokeObjectURL(url);

      alert(`PDF created successfully!\nFile: ${finalName}`);
      setStatus("done");
    } catch (err) {
      console.error(err);
      alert("PDF creation failed.");
      setStatus("error");
    }
  }

  return (
    <div className="app-root">
      {/* Background watermark handled in CSS via body::before using /mnt/data/IMG_5764.png */}

      <header className="topbar">
        <div className="topbar-inner">
          <img src="/assets/IMG_5764.png" alt="logo" className="topbar-logo" />
          <div className="topbar-title">O₂ THE FEST — Certificate Extractor</div>
        </div>
      </header>

      <div className="content-wrapper">
        <div className="main-card">

          {/* LEFT - Controls */}
          <div className="left-pane">
            <h1 className="heading">Extract certificates by event</h1>
            <p className="lead">Upload a multi-page certificate PDF and extract event-specific PDFs instantly.</p>

            <div className="card upload-card">
              <label className="upload-label" aria-label="Upload PDF">
                <div className="upload-area">
                  {fileName ? <strong>{fileName}</strong> : <span>Click to choose PDF file</span>}
                </div>
                <input type="file" accept="application/pdf" onChange={handleFileChange} />
              </label>
              <div className="small muted">Supported: multi-page certificate PDFs (text-based).</div>
            </div>

            <div className="card status-card">
              <label className="label">Status</label>
              <div className={`status-badge status-${status.replace(/\s+/g, "-")}`}>{status}</div>
            </div>

            {eventsMap.size > 0 && (
              <div className="card">
                <label className="label">Detected Events</label>
                <select
                  className="input"
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                >
                  <option value="">— choose detected event —</option>
                  {[...eventsMap.keys()].map((ev, i) => (
                    <option key={i} value={ev}>
                      {ev} ({eventsMap.get(ev).length})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="card">
              <label className="label">Or type event name</label>
              <input
                className="input"
                type="text"
                placeholder="e.g. DJ Night — O2 The Fest"
                value={manualEvent}
                onChange={(e) => setManualEvent(e.target.value)}
              />
            </div>

            <div className="actions">
              <button className="btn primary" onClick={handleExtract}>Extract & Download PDF</button>
              <button className="btn" onClick={resetState}>Reset</button>
            </div>
          </div>

        
        </div>
      </div>

      <Footer />
    </div>
  );
}
