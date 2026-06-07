export default function Hearts({ count, freeze }) {
  return (
    <span>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ fontSize: 13, opacity: i < count ? 1 : 0.15 }}>
          {i < count ? "❤️" : "🖤"}
        </span>
      ))}
      {freeze > 0 && (
        <span style={{ marginLeft: 3, fontSize: 11 }}>
          🥶
          <span style={{ fontSize: 10, color: "#7dd3fc", fontWeight: 700 }}>×{freeze}</span>
        </span>
      )}
    </span>
  );
}
