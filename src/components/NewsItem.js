import { useState } from "react";
import { formatDate } from "../utils/helpers";
import { btn, inp } from "./ui";

export default function NewsItem({ item, index, adminMode, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.text);

  const save = () => {
    if (text.trim()) {
      onEdit(index, text.trim());
      setEditing(false);
    }
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px", marginBottom: 6 }}>
      {editing ? (
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            style={{ ...inp, width: "100%", resize: "vertical", lineHeight: 1.6, fontSize: 13, marginBottom: 8 }}
            autoFocus
          />
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={save} style={btn("#166534", "#22c55e")}>💾 حفظ</button>
            <button onClick={() => { setText(item.text); setEditing(false); }} style={btn("#374151", "#6b7280")}>إلغاء</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.6, flex: 1 }}>{item.text}</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: "#475569", whiteSpace: "nowrap" }}>{formatDate(item.date)}</div>
            {adminMode && (
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setEditing(true)} style={{ ...inp, background: "rgba(59,130,246,0.3)", fontSize: 11, padding: "3px 7px" }}>✏️</button>
                <button onClick={() => onDelete(index)} style={{ ...inp, background: "rgba(239,68,68,0.3)", fontSize: 11, padding: "3px 7px" }}>🗑️</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
