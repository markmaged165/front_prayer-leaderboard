export default function StatCard({ icon, label, value, small }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{label}</div>
      <div style={{ fontSize: small ? 12 : 16, fontWeight: 700, color: "#f1f5f9", marginTop: 4 }}>{value}</div>
    </div>
  );
}
