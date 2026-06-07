import { useState, useEffect } from "react";
import { btn, inp } from "./ui";

export default function ResetTab({ seasons, onReset, onViewSeason, updSeasons }) {
  const [label, setLabel] = useState("");
  const [step, setStep] = useState(1);
  const [editIdx, setEditIdx] = useState(null);
  const [editLbl, setEditLbl] = useState("");
  const [ss, setSs] = useState(seasons);

  useEffect(() => {
    setSs(seasons);
  }, [seasons]);

  const saveLabel = async (index) => {
    const updated = ss.map((season, idx) => (idx === index ? { ...season, label: editLbl } : season));
    setSs(updated);
    await updSeasons(updated);
    setEditIdx(null);
  };

  return (
    <div style={{ maxWidth: 480, margin: "24px auto 0", padding: "0 16px" }}>
      <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 20, padding: 24, marginBottom: 20 }}>
        <div style={{ textAlign: "center", fontSize: 36, marginBottom: 8 }}>🔄</div>
        <div style={{ textAlign: "center", fontWeight: 800, fontSize: 18, color: "#fbbf24", marginBottom: 6 }}>موسم جديد</div>
        <div style={{ textAlign: "center", fontSize: 13, color: "#94a3b8", marginBottom: 20, lineHeight: 1.7 }}>
          هيتحفظ الموسم الحالي وكل الأسكورات هترجع 0 والقلوب ❤️❤️❤️
        </div>
        {step === 1 && (
          <>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>اكتب اسم للموسم الحالي قبل ما تبدأ جديد:</div>
            <input placeholder="مثال: موسم الصيف 2025" value={label} onChange={(e) => setLabel(e.target.value)} style={{ ...inp, width: "100%", marginBottom: 12 }} />
            <button
              onClick={() => label.trim() && setStep(2)}
              style={{
                width: "100%",
                padding: 12,
                background: label.trim() ? "linear-gradient(135deg,#dc2626,#7f1d1d)" : "rgba(255,255,255,0.05)",
                border: "none",
                borderRadius: 12,
                color: label.trim() ? "#fff" : "#475569",
                fontSize: 14,
                fontWeight: 700,
                cursor: label.trim() ? "pointer" : "default",
              }}
            >
              التالي →
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <div style={{ background: "rgba(239,68,68,0.12)", borderRadius: 12, padding: 14, marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "#fca5a5", fontWeight: 600 }}>⚠️ تأكيد</div>
              <div style={{ fontSize: 13, color: "#f1f5f9", marginTop: 6, lineHeight: 1.7 }}>
                هيتحفظ موسم "<span style={{ color: "#fbbf24" }}>{label}</span>" وكل حاجة هترجع من الأول.
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  onReset(label);
                  setStep(1);
                  setLabel("");
                }}
                style={{
                  flex: 1,
                  padding: 12,
                  background: "linear-gradient(135deg,#dc2626,#7f1d1d)",
                  border: "none",
                  borderRadius: 12,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ✅ تأكيد
              </button>
              <button onClick={() => setStep(1)} style={btn("#374151", "#6b7280")}>رجوع</button>
            </div>
          </>
        )}
      </div>
      {ss.length > 0 && (
        <div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>المواسم المحفوظة ({ss.length}):</div>
          {[...ss].reverse().map((season, ri) => {
            const index = ss.length - 1 - ri;
            return (
              <div key={index} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px", marginBottom: 6 }}>
                {editIdx === index ? (
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input value={editLbl} onChange={(e) => setEditLbl(e.target.value)} style={{ ...inp, flex: 1 }} autoFocus />
                    <button onClick={() => saveLabel(index)} style={btn("#166534", "#22c55e")}>✓</button>
                    <button onClick={() => setEditIdx(null)} style={btn("#374151", "#6b7280")}>✕</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{season.label}</span>
                      <button onClick={() => { setEditIdx(index); setEditLbl(season.label); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: 2 }}>✏️</button>
                    </div>
                    <button onClick={() => onViewSeason(season)} style={{ ...btn("#1e293b", "#475569"), fontSize: 12, padding: "5px 12px" }}>عرض</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
