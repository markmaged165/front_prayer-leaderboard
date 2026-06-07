import { getRanked } from "../utils/helpers";
import Hearts from "./Hearts";
import RankBadge from "./RankBadge";
import { btn, mb, ov } from "./ui";

export default function SeasonModal({ season, onClose }) {
  const ranked = getRanked(season.snapshot);

  return (
    <div style={ov}>
      <div style={{ ...mb, maxWidth: 480, maxHeight: "80vh", overflowY: "auto", textAlign: "right" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#fbbf24" }}>{season.label}</div>
          <button onClick={onClose} style={{ ...btn("#374151", "#6b7280"), padding: "5px 12px" }}>✕</button>
        </div>
        {ranked.map((player) => (
          <div key={player.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, marginBottom: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <RankBadge rank={player.rank} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{player.name}</div>
              <Hearts count={player.hearts} freeze={player.freeze} />
            </div>
            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: "5px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fbbf24" }}>{player.score}</div>
              <div style={{ fontSize: 9, color: "#64748b" }}>نقطة</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
