export function getRanked(players) {
  const visible = players.filter((player) => player.score > 0);
  const sorted = [...visible].sort((a, b) => b.score - a.score || b.hearts - a.hearts || a.freeze - b.freeze);
  return sorted.map((player, index, array) => {
    if (index === 0) return { ...player, rank: 1 };
    const prev = array[index - 1];
    return {
      ...player,
      rank: player.score === prev.score && player.hearts === prev.hearts ? prev.rank : index + 1,
    };
  });
}

export function formatDate(dateValue) {
  if (!dateValue) return "—";
  return new Date(dateValue).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function daysBetween(d1, d2) {
  if (!d1 || !d2) return 0;
  return Math.round((new Date(d2) - new Date(d1)) / 86400000);
}

export function daysSinceStart(startDate) {
  if (!startDate) return 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((now - start) / 86400000));
}

export function toArabicOrdinal(number) {
  const map = {
    1: "الأول",
    2: "الثاني",
    3: "الثالث",
    4: "الرابع",
    5: "الخامس",
    6: "السادس",
    7: "السابع",
    8: "الثامن",
    9: "التاسع",
    10: "العاشر",
  };
  return map[number] || `#${number}`;
}
