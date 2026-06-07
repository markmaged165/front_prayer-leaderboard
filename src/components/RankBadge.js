export default function RankBadge({ rank }) {
  if (rank === 1) return <span style={{ fontSize: 20 }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize: 20 }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: 20 }}>🥉</span>;
  return (
    <span style={{ color: "#94a3b8", fontWeight: 700, fontSize: 13, minWidth: 22, display: "inline-block", textAlign: "center" }}>
      #{rank}
    </span>
  );
}
