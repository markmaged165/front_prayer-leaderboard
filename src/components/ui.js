export const btn = (background, borderColor) => ({
  background,
  border: `1px solid ${borderColor}`,
  color: "#f1f5f9",
  borderRadius: 8,
  padding: "7px 16px",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
});

export const inp = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 8,
  color: "#f1f5f9",
  padding: "7px 10px",
  fontSize: 13,
  outline: "none",
};

export const icb = {
  border: "none",
  borderRadius: 8,
  padding: "5px 8px",
  cursor: "pointer",
  fontSize: 13,
};

export const ov = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.75)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
};

export const mb = {
  background: "#1e293b",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 20,
  padding: "24px 20px",
  minWidth: 280,
  width: "90%",
  boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
  textAlign: "center",
};
