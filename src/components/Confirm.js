import { btn, mb, ov } from "./ui";

export default function Confirm({ msg, yesLabel = "نعم", noLabel = "لا", yesColor = "#ef4444", onYes, onNo }) {
  return (
    <div style={ov}>
      <div style={mb}>
        <div style={{ fontSize: 26, marginBottom: 8 }}>⚠️</div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 18, color: "#f1f5f9", lineHeight: 1.6, whiteSpace: "pre-line" }}>
          {msg}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={onYes} style={btn(yesColor, yesColor)}>{yesLabel}</button>
          <button onClick={onNo} style={btn("#374151", "#6b7280")}>{noLabel}</button>
        </div>
      </div>
    </div>
  );
}
