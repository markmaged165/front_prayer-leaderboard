import { useState, useEffect, useCallback } from "react";
import { season1Data, initialPlayers, defaultSeasons } from "./data/initialData";
import { fbGet, fbSet, lload, lsave } from "./utils/storage";
import { playerAPI } from "./services/api";
import { getRanked, formatDate, daysBetween, daysSinceStart, toArabicOrdinal } from "./utils/helpers";
import Hearts from "./components/Hearts";
import RankBadge from "./components/RankBadge";
import Confirm from "./components/Confirm";
import NewsItem from "./components/NewsItem";
import ResetTab from "./components/ResetTab";
import SeasonModal from "./components/SeasonModal";
import StatCard from "./components/StatCard";
import { btn, inp, icb, ov, mb } from "./components/ui";
import { STORAGE_KEYS, DEFAULTS } from "./constants/app";
import "./App.css";

const ADMIN_PASSWORD_KEY = STORAGE_KEYS.ADMIN_PASSWORD;
const DEFAULT_PASSWORD = DEFAULTS.PASSWORD;

export default function App() {
  useEffect(() => { document.title = "الصلاة خدمة اعدادي"; }, []);

  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("");
  const [players, setPlayersS] = useState(initialPlayers);
  const [rounds, setRoundsS] = useState({});
  const [seasons, setSeasonsS] = useState(defaultSeasons);
  const [news, setNewsS] = useState([]);
  const [notice, setNoticeS] = useState("");
  const [seasonStart, setSeasonStartS] = useState(null);
  const [seasonLabel, setSeasonLabelS] = useState("الموسم الحالي");
  const [lastScoreDate, setLastScoreDateS] = useState(null);
  const [adminPw, setAdminPw] = useState(() => lload(ADMIN_PASSWORD_KEY, DEFAULT_PASSWORD));

  const showSync = (status) => {
    setSyncStatus(status);
    if (status === "saved" || status === "error") setTimeout(() => setSyncStatus(""), 2500);
  };

  const updPlayers = useCallback(async (value) => {
    setPlayersS(value);
    showSync("saving");
    const ok = await fbSet("players", value);
    showSync(ok ? "saved" : "error");
  }, []);

  const updRounds = useCallback(async (value) => { setRoundsS(value); await fbSet("rounds", value); }, []);
  const updSeasons = useCallback(async (value) => { setSeasonsS(value); await fbSet("seasons", value); }, []);
  const updNews = useCallback(async (value) => { setNewsS(value); await fbSet("news", value); }, []);
  const updNotice = useCallback(async (value) => { setNoticeS(value); await fbSet("notice", value); }, []);
  const updSeasonStart = useCallback(async (value) => { setSeasonStartS(value); await fbSet("seasonStart", value); }, []);
  const updSeasonLabel = useCallback(async (value) => { setSeasonLabelS(value); await fbSet("seasonLabel", value); }, []);
  const updLastScoreDate = useCallback(async (value) => { setLastScoreDateS(value); await fbSet("lastScoreDate", value); }, []);

  useEffect(() => {
    (async () => {
      const [p, r, s, n, no, ss, sl, lsd] = await Promise.all([
        fbGet("players"), fbGet("rounds"), fbGet("seasons"), fbGet("news"),
        fbGet("notice"), fbGet("seasonStart"), fbGet("seasonLabel"), fbGet("lastScoreDate"),
      ]);
      if (p) setPlayersS(p);
      if (r) setRoundsS(r);
      if (s) setSeasonsS(s);
      if (n) setNewsS(n);
      if (no !== null && no !== undefined) setNoticeS(no);
      if (ss) setSeasonStartS(ss);
      if (sl) setSeasonLabelS(sl);
      if (lsd) setLastScoreDateS(lsd);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const p = await fbGet("players");
      if (p) setPlayersS(p);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const [adminMode, setAdminMode] = useState(false);
  const [tab, setTab] = useState("board");
  const [showLogin, setShowLogin] = useState(false);
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const [showChangePw, setShowChangePw] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw1, setNewPw1] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [pwChangeErr, setPwChangeErr] = useState("");
  const [pwChangeOk, setPwChangeOk] = useState(false);

  const [checks, setChecks] = useState({});
  const [roundDate, setRoundDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newName, setNewName] = useState("");
  const [roundDone, setRoundDone] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [newP, setNewP] = useState({ name: "", score: 1, hearts: 3, freeze: 0 });

  const [editNotice, setEditNotice] = useState("");
  const [editingLabel, setEditingLabel] = useState(false);
  const [tempLabel, setTempLabel] = useState("");
  const [profileId, setProfileId] = useState(null);
  const [viewSeason, setViewSeason] = useState(null);

  const login = () => {
    if (pw === adminPw) {
      setAdminMode(true);
      setShowLogin(false);
      setPw("");
      setPwErr(false);
      openRound();
    } else {
      setPwErr(true);
    }
  };

  const changePassword = () => {
    setPwChangeErr("");
    setPwChangeOk(false);
    if (oldPw !== adminPw) {
      setPwChangeErr("الباسورد القديم غلط");
      return;
    }
    if (newPw1.length < 4) {
      setPwChangeErr("الباسورد الجديد قصير جداً (4 حروف على الأقل)");
      return;
    }
    if (newPw1 !== newPw2) {
      setPwChangeErr("الباسورد الجديد مش متطابق");
      return;
    }
    setAdminPw(newPw1);
    lsave(ADMIN_PASSWORD_KEY, newPw1);
    setPwChangeOk(true);
    setOldPw("");
    setNewPw1("");
    setNewPw2("");
    setTimeout(() => {
      setShowChangePw(false);
      setPwChangeOk(false);
    }, 1500);
  };

  const openRound = () => {
    const checksInit = {};
    players.forEach((player) => { checksInit[player.id] = false; });
    setChecks(checksInit);
    setRoundDone(false);
    setTab("round");
  };

  const toggleCheck = (id) => setChecks((prev) => ({ ...prev, [id]: !prev[id] }));

  const generateNews = (beforePlayers, afterPlayers, checkedIds, date) => {
    const beforeRanked = getRanked(beforePlayers);
    const afterRanked = getRanked(afterPlayers);
    const newItems = [];

    afterRanked.forEach((afterPlayer) => {
      const beforePlayer = beforeRanked.find((x) => x.id === afterPlayer.id);
      if (!beforePlayer) return;
      if (afterPlayer.rank < beforePlayer.rank) {
        const displaced = beforeRanked.find((x) => x.rank === afterPlayer.rank);
        if (displaced) {
          newItems.push({ date, text: `${afterPlayer.name} 💪 خطف المركز ${toArabicOrdinal(afterPlayer.rank)} من ${displaced.name} 🤦‍♂️` });
        }
      }
    });

    players.forEach((player) => {
      if (!checkedIds[player.id]) newItems.push({ date, text: `${player.name} مصلاش النهاردة 💔` });
    });

    const streakMap = {};
    afterPlayers.forEach((player) => {
      const roundData = rounds[player.id];
      if (roundData?.streak) streakMap[player.id] = roundData.streak;
    });

    const maxStreak = Math.max(...Object.values(streakMap), 0);
    if (maxStreak > 0) {
      const leaders = afterPlayers.filter((player) => (streakMap[player.id] || 0) === maxStreak);
      if (leaders.length === 1) {
        newItems.push({ date, text: `🔥 Man of Streak: ${leaders[0].name} (${maxStreak} يوم متواصل)` });
      }
    }

    const maxScore = Math.max(...afterPlayers.map((player) => player.score), 0);
    if (maxScore > 0) {
      const topScorers = afterPlayers.filter((player) => player.score === maxScore);
      if (topScorers.length === 1) {
        newItems.push({ date, text: `⭐ Man of Score: ${topScorers[0].name} (${maxScore} نقطة)` });
      }
    }

    return newItems;
  };

  const applyRound = () => {
    const beforePlayers = JSON.parse(JSON.stringify(players));
    processNext([...players], { ...rounds }, 0, beforePlayers);
  };

  const processNext = (ps, rs, idx, beforePlayers) => {
    if (idx >= ps.length) {
      const newItems = generateNews(beforePlayers, ps, checks, roundDate);
      const updatedNews = [...newItems, ...news].slice(0, 100);
      updPlayers(ps);
      updRounds(rs);
      updNews(updatedNews);
      updLastScoreDate(roundDate);
      if (!seasonStart) updSeasonStart(roundDate);
      setRoundDone(true);
      return;
    }

    const player = ps[idx];
    if (checks[player.id]) {
      const prev = rs[player.id] || {};
      const isConsecutive = prev.lastDate && daysBetween(prev.lastDate, roundDate) === 1;
      rs[player.id] = {
        firstDate: prev.firstDate || roundDate,
        lastDate: roundDate,
        streak: isConsecutive ? (prev.streak || 1) + 1 : 1,
      };
      ps[idx] = { ...player, score: player.score + 1 };
      processNext(ps, rs, idx + 1, beforePlayers);
    } else if (player.freeze === 5) {
      setConfirm({
        msg: `${player.name} وصل للفريز الأقصى (5) ومش معلم ✓\nهتشيل اسمه؟`,
        yesLabel: "🗑️ شيل",
        noLabel: "تخليه",
        onYes: () => { ps.splice(idx, 1); setConfirm(null); processNext(ps, rs, idx, beforePlayers); },
        onNo: () => { setConfirm(null); processNext(ps, rs, idx + 1, beforePlayers); },
      });
    } else if (player.hearts === 0) {
      setConfirm({
        msg: `${player.name} معهوش قلوب ومش معلم ✓\nعايز تعمله إيه؟`,
        yesLabel: "🗑️ شيل اسمه",
        noLabel: `🥶 Freeze (${player.freeze}/5)`,
        yesColor: "#ef4444",
        onYes: () => { ps.splice(idx, 1); setConfirm(null); processNext(ps, rs, idx, beforePlayers); },
        onNo: () => { ps[idx] = { ...player, freeze: player.freeze + 1 }; setConfirm(null); processNext(ps, rs, idx + 1, beforePlayers); },
      });
    } else {
      ps[idx] = { ...player, hearts: player.hearts - 1 };
      processNext(ps, rs, idx + 1, beforePlayers);
    }
  };

  const doNewSeason = (label) => {
    const snapshot = { label, snapshot: JSON.parse(JSON.stringify(players)) };
    updSeasons([...seasons, snapshot]);
    updPlayers(players.map((player) => ({ ...player, score: 0, hearts: 3, freeze: 0 })));
    updRounds({});
    updNews([]);
    updLastScoreDate(null);
    updSeasonStart(new Date().toISOString().split("T")[0]);
    updSeasonLabel("الموسم الحالي");
    setTab("board");
  };

  const startEdit = (player) => { setEditId(player.id); setEditData({ ...player }); };
  const saveEdit = async () => {
    const updatedPlayer = { ...editData, score: +editData.score, hearts: +editData.hearts, freeze: +editData.freeze };
    const newPlayers = players.map((player) => player.id === editId ? updatedPlayer : player);
    setPlayersS(newPlayers);
    lsave(STORAGE_KEYS.PLAYERS, newPlayers);

    try {
      await playerAPI.update(editId, updatedPlayer);
      showSync("saved");
    } catch (error) {
      console.error("Failed to update player on server:", error.message);
      showSync("error");
    }

    setEditId(null);
  };

  const delPlayer = async (id) => {
    const newPlayers = players.filter((player) => player.id !== id);
    setPlayersS(newPlayers);
    lsave(STORAGE_KEYS.PLAYERS, newPlayers);

    try {
      await playerAPI.delete(id);
      showSync("saved");
    } catch (error) {
      console.error("Failed to delete player on server:", error.message);
      showSync("error");
    }
  };

  const addPlayer = async () => {
    if (!newP.name.trim()) return;
    const player = { ...newP, id: Date.now(), score: 1, hearts: 3, freeze: 0 };
    // Persist to backend (create single player) and to localStorage
    try {
      await playerAPI.create(player);
      const newPlayers = [...players, player];
      setPlayersS(newPlayers);
      lsave(STORAGE_KEYS.PLAYERS, newPlayers);
      showSync("saved");
    } catch (error) {
      console.error("Failed to create player on server:", error.message);
      const newPlayers = [...players, player];
      setPlayersS(newPlayers);
      lsave(STORAGE_KEYS.PLAYERS, newPlayers);
      showSync("error");
    }

    setNewP({ name: "", score: 1, hearts: 3, freeze: 0 });
    setShowAdd(false);
  };

  const ranked = getRanked(players);
  const dayCount = daysSinceStart(seasonStart);

  const streakMap = {};
  players.forEach((player) => { const roundData = rounds[player.id]; if (roundData?.streak) streakMap[player.id] = roundData.streak; });
  const maxStreak = Math.max(...Object.values(streakMap), 0);
  const streakLeaders = players.filter((player) => (streakMap[player.id] || 0) === maxStreak && maxStreak > 0);
  const manOfStreak = streakLeaders.length === 1 ? streakLeaders[0] : null;
  const maxScore = Math.max(...players.map((player) => player.score), 0);
  const scoreLeaders = players.filter((player) => player.score === maxScore && maxScore > 0);
  const manOfScore = scoreLeaders.length === 1 ? scoreLeaders[0] : null;

  if (profileId !== null) {
    const profilePlayer = players.find((player) => player.id === profileId);
    if (!profilePlayer) { setProfileId(null); return null; }
    const profileRound = rounds[profilePlayer.id] || {};
    const rankedPlayers = getRanked(players);
    const me = rankedPlayers.find((player) => player.id === profilePlayer.id);
    const myRank = me?.rank || "—";
    const above = rankedPlayers.filter((player) => player.rank < myRank);
    const nextUp = above.length > 0 ? above[above.length - 1] : null;
    const streak = profileRound.streak || 0;
    const isTop3 = myRank <= 3;

    return (
      <div className="app-root app-profile-screen">
        <div className="app-header">
          <button onClick={() => setProfileId(null)} style={btn("#1e293b", "#475569")}>← رجوع</button>
          <span className="app-profile-title">بطاقة المتسابق</span>
        </div>
        <div className="app-panel-small">
          <div className="app-profile-card" style={{ background: isTop3 ? "linear-gradient(135deg,rgba(251,191,36,.18),rgba(251,191,36,.06))" : "rgba(255,255,255,0.05)", border: isTop3 ? "1px solid rgba(251,191,36,.4)" : "1px solid rgba(255,255,255,0.1)" }}>
            <div className="app-profile-badge">{myRank === 1 ? "🥇" : myRank === 2 ? "🥈" : myRank === 3 ? "🥉" : "🎖️"}</div>
            <div className="app-profile-name">{profilePlayer.name}</div>
            <div className="app-profile-score">{profilePlayer.score}</div>
            <div className="app-profile-label">نقطة</div>
            <Hearts count={profilePlayer.hearts} freeze={profilePlayer.freeze} />
            {manOfScore?.id === profilePlayer.id && <div className="app-badge app-badge--gold">⭐ Man of Score</div>}
            {manOfStreak?.id === profilePlayer.id && <div className="app-badge app-badge--red">🔥 Man of Streak</div>}
          </div>
          <div className="app-stat-grid">
            <StatCard icon="🏆" label="المركز" value={`#${myRank}`} />
            <StatCard icon="🔥" label="أيام متواصلة" value={streak > 0 ? `${streak} يوم` : "—"} />
            <StatCard icon="📅" label="أول مرة صلى" value={formatDate(profileRound.firstDate)} small />
            <StatCard icon="🕐" label="آخر مرة صلى" value={formatDate(profileRound.lastDate)} small />
          </div>
          <div className="app-card">
            {isTop3 ? (
              <div style={{ textAlign: "center", fontSize: 15, fontWeight: 700, color: "#fbbf24" }}>
                {myRank === 1 ? "🥇 أنت في المركز الأول يا صديقي! 🎉" : myRank === 2 ? "🥈 أنت في المركز الثاني يا صديقي! 💪" : "🥉 أنت في المركز الثالث يا صديقي! 🔥"}
              </div>
            ) : nextUp ? (
              <>
                <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>للوصول للمركز #{nextUp.rank}</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>فاضل <span style={{ color: "#fbbf24" }}>{nextUp.score - profilePlayer.score + 1} نقطة</span> عشان تتعدى <span style={{ color: "#93c5fd" }}>{nextUp.name}</span></div>
              </>
            ) : (
              <div style={{ textAlign: "center", fontSize: 13, color: "#64748b" }}>لا يوجد أحد أعلى</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="app-loading">
      <div className="loading-icon">⏳</div>
      <div className="loading-text">جاري تحميل البيانات...</div>
    </div>
  );

  return (
    <div className="app-root">
      <div className="app-header">
        <div className="app-header-icon">🏆</div>
        <div className="app-header-subtitle">
          "صَلُّوا بِلاَ انْقِطَاعٍ"<br />
          <a href="https://st-takla.org/Bibles/BibleSearch/showVerses.php?book=62&chapter=5&vmin=17&vmax=17" target="_blank" rel="noopener noreferrer">
            (تس 5: 17)
          </a>
        </div>
        <div className="app-header-tagline">تعيشوا وتصلوا يا أحلى رجالة 🤍</div>
        {syncStatus && (
          <div className="app-sync-status" style={{ color: syncStatus === "saved" ? "#22c55e" : syncStatus === "error" ? "#ef4444" : "#fbbf24" }}>
            {syncStatus === "saving" ? "⏳ جاري الحفظ..." : syncStatus === "saved" ? "✅ اتحفظ على Firebase!" : "❌ فشل الحفظ"}
          </div>
        )}
        <div className="app-actions">
          {!adminMode ? (
            <button onClick={() => setShowLogin(true)} style={btn("#1e293b", "#475569")}>🔐 دخول الأدمن</button>
          ) : (
            <>
              <button onClick={() => { setAdminMode(false); setTab("board"); }} style={btn("#7f1d1d", "#ef4444")}>🚪 خروج</button>
              <button onClick={() => { setShowChangePw(true); setOldPw(""); setNewPw1(""); setNewPw2(""); setPwChangeErr(""); setPwChangeOk(false); }} style={btn("#1e3a5f", "#3b82f6")}>🔑 تغيير الباسورد</button>
            </>
          )}
        </div>
      </div>

      {adminMode && (
        <div className="app-tab-list">
          {[{ key: "board", label: "🏠 Home" }, { key: "round", label: "✅ جولة جديدة" }, { key: "news", label: "📰 الأخبار" }, { key: "edit", label: "✏️ تعديل" }, { key: "reset", label: "🔄 موسم جديد" }, { key: "notice", label: "📢 تنبيهات" }].map((t) => (
            <button key={t.key} onClick={() => t.key === "round" ? openRound() : setTab(t.key)} className={`app-tab ${tab === t.key ? "app-tab--active" : ""}`}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {!adminMode && (
        <div className="app-tab-list">
          {[{ key: "board", label: "🏠 Home" }, { key: "news", label: "📰 الأخبار" }].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`app-tab ${tab === t.key ? "app-tab--active" : ""}`}>
              {t.label}
            </button>
          ))}
          {seasons.length > 0 && (
            <select
              onChange={(e) => { if (e.target.value !== "") { setViewSeason(seasons[+e.target.value]); e.target.value = ""; } }}
              defaultValue=""
              className="app-input app-input--full"
              style={{ maxWidth: 180 }}
            >
              <option value="" disabled>📂 المواسم السابقة</option>
              {[...seasons].reverse().map((season, ri) => {
                const index = seasons.length - 1 - ri;
                return <option key={index} value={index}>{season.label}</option>;
              })}
            </select>
          )}
        </div>
      )}

      {tab === "board" && (
        <div className="app-panel">
          <div className="app-card app-card--row">
            <div>
              {editingLabel && adminMode ? (
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input value={tempLabel} onChange={(e) => setTempLabel(e.target.value)} style={{ ...inp, fontSize: 13 }} autoFocus />
                  <button onClick={() => { updSeasonLabel(tempLabel); setEditingLabel(false); }} style={btn("#166534", "#22c55e")}>✓</button>
                  <button onClick={() => setEditingLabel(false)} style={btn("#374151", "#6b7280")}>✕</button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#fbbf24" }}>{seasonLabel}</span>
                  {adminMode && <button onClick={() => { setTempLabel(seasonLabel); setEditingLabel(true); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: 2 }}>✏️</button>}
                </div>
              )}
              {lastScoreDate && <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>آخر حساب: {formatDate(lastScoreDate)}</div>}
            </div>
            <div style={{ textAlign: "center", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 10, padding: "6px 14px" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fbbf24", lineHeight: 1 }}>{dayCount}</div>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>يوم من بداية الموسم</div>
            </div>
          </div>

          {notice && notice.trim() && (
            <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 14, padding: "12px 16px", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24", marginBottom: 6, textAlign: "center" }}>⚠️ تنبيهات ⚠️</div>
              <div style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.8, whiteSpace: "pre-wrap", textAlign: "center" }}>{notice}</div>
            </div>
          )}

          {ranked.map((player) => {
            const isTop3 = player.rank <= 3;
            return (
              <div key={player.id} onClick={() => setProfileId(player.id)} style={{
                background: isTop3 ? player.rank === 1 ? "linear-gradient(135deg,rgba(251,191,36,.18),rgba(251,191,36,.06))" : player.rank === 2 ? "linear-gradient(135deg,rgba(148,163,184,.18),rgba(148,163,184,.06))" : "linear-gradient(135deg,rgba(180,120,60,.18),rgba(180,120,60,.06))" : "rgba(255,255,255,0.04)",
                border: isTop3 ? player.rank === 1 ? "1px solid rgba(251,191,36,.35)" : player.rank === 2 ? "1px solid rgba(148,163,184,.3)" : "1px solid rgba(180,120,60,.3)" : "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14,
                padding: "11px 14px",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
              }}>
                <div style={{ minWidth: 28, textAlign: "center" }}><RankBadge rank={player.rank} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{player.name}</span>
                    {manOfScore?.id === player.id && <span style={{ fontSize: 10, background: "rgba(251,191,36,0.2)", border: "1px solid rgba(251,191,36,0.4)", borderRadius: 6, padding: "1px 6px", color: "#fbbf24" }}>⭐</span>}
                    {manOfStreak?.id === player.id && <span style={{ fontSize: 10, background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 6, padding: "1px 6px", color: "#fca5a5" }}>🔥</span>}
                  </div>
                  <div style={{ marginTop: 3 }}><Hearts count={player.hearts} freeze={player.freeze} /></div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: "6px 11px", textAlign: "center", minWidth: 46 }}>
                  <div style={{ fontSize: 19, fontWeight: 800, color: isTop3 ? "#fbbf24" : "#e2e8f0", lineHeight: 1 }}>{player.score}</div>
                  <div style={{ fontSize: 9, color: "#64748b", marginTop: 1 }}>نقطة</div>
                </div>
              </div>
            );
          })}
          <div className="app-list-note">{ranked.length} لاعب • اضغط على أي لاعب لعرض بطاقته</div>
        </div>
      )}

      {tab === "news" && (
        <div style={{ maxWidth: 560, margin: "14px auto 0", padding: "0 12px" }}>
          <div style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#fbbf24" }}>📰 أخبار المسابقة</div>
            {adminMode && news.length > 0 && <button onClick={() => updNews([])} style={{ ...btn("#7f1d1d", "#ef4444"), fontSize: 11, padding: "5px 10px" }}>🗑️ مسح الكل</button>}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {manOfScore && (
              <div style={{ flex: 1, minWidth: 120, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 12, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>⭐ Man of Score</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#fbbf24" }}>{manOfScore.name}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{manOfScore.score} نقطة</div>
              </div>
            )}
            {manOfStreak && (
              <div style={{ flex: 1, minWidth: 120, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>🔥 Man of Streak</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#fca5a5" }}>{manOfStreak.name}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{streakMap[manOfStreak.id]} يوم متواصل</div>
              </div>
            )}
          </div>
          {news.length === 0 ? (
            <div style={{ textAlign: "center", color: "#475569", padding: 40 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
              <div>مفيش أخبار لسه</div>
            </div>
          ) : news.map((item, index) => (
            <NewsItem key={index} item={item} index={index} adminMode={adminMode} onDelete={(idx) => updNews(news.filter((_, j) => j !== idx))} onEdit={(idx, text) => updNews(news.map((value, j) => j === idx ? { ...value, text } : value))} />
          ))}
        </div>
      )}

      {adminMode && tab === "round" && (
        <div className="app-panel">
          <div className="app-card app-card--row app-card--dense">
            <span className="app-secondary-text">📅 تاريخ الجولة:</span>
            <input type="date" value={roundDate} onChange={(e) => setRoundDate(e.target.value)} className="app-input app-input__date" />
          </div>
          <div className="app-card app-card--green">
            <div className="app-secondary-text" style={{ marginBottom: 8 }}>➕ إضافة متسابق جديد</div>
            <div className="app-form-row">
              <input
                placeholder="الاسم"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newName.trim()) {
                    const player = { id: Date.now(), name: newName.trim(), score: 1, hearts: 3, freeze: 0 };
                    updPlayers([...players, player]);
                    setChecks((current) => ({ ...current, [player.id]: true }));
                    setNewName("");
                  }
                }}
                className="app-input app-input__date"
              />
              <button onClick={() => {
                if (!newName.trim()) return;
                const player = { id: Date.now(), name: newName.trim(), score: 1, hearts: 3, freeze: 0 };
                updPlayers([...players, player]);
                setChecks((current) => ({ ...current, [player.id]: true }));
                setNewName("");
              }} style={btn("#166534", "#22c55e")}>إضافة</button>
            </div>
          </div>
          <div className="app-secondary-text" style={{ marginBottom: 10 }}>علّم ✓ على اللي حضروا</div>
          {[...players].sort((a, b) => a.name.localeCompare(b.name, "ar")).map((player) => (
            <div key={player.id} onClick={() => toggleCheck(player.id)} style={{
              background: checks[player.id] ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.04)",
              border: checks[player.id] ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: "11px 13px",
              marginBottom: 7,
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
            }}>
              <div style={{ width: 24, height: 24, borderRadius: 7, background: checks[player.id] ? "#22c55e" : "rgba(255,255,255,0.08)", border: checks[player.id] ? "none" : "2px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{checks[player.id] ? "✓" : ""}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{player.name}</div>
                <div style={{ marginTop: 2 }}><Hearts count={player.hearts} freeze={player.freeze} /></div>
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#fbbf24" }}>{player.score}</div>
            </div>
          ))}
          {!roundDone ? (
            <button onClick={applyRound} style={{ width: "100%", marginTop: 10, padding: 13, background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", border: "none", borderRadius: 14, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>🚀 تطبيق الجولة</button>
          ) : (
            <div style={{ textAlign: "center", marginTop: 14, padding: 14, background: "rgba(34,197,94,0.1)", borderRadius: 14, border: "1px solid rgba(34,197,94,0.3)" }}>
              <div style={{ fontSize: 22 }}>✅</div>
              <div style={{ color: "#22c55e", fontWeight: 700, marginTop: 4 }}>اتطبقت الجولة بنجاح!</div>
              <button onClick={() => setTab("board")} style={{ ...btn("#1e293b", "#475569"), marginTop: 10 }}>عرض الليدربورد</button>
            </div>
          )}
        </div>
      )}

      {adminMode && tab === "notice" && (
        <div className="app-panel-small">
          <div className="app-section-title">📢 إدارة التنبيهات</div>
          <textarea
            value={editNotice}
            onChange={(e) => setEditNotice(e.target.value)}
            onFocus={() => setEditNotice(notice)}
            placeholder="اكتب تنبيه هنا..."
            rows={5}
            className="app-input app-input--full app-textarea--center"
          />
          <div className="app-form-row" style={{ marginTop: 10 }}>
            <button onClick={() => updNotice(editNotice)} style={{ flex: 1, ...btn("#166534", "#22c55e"), padding: 11 }}>💾 حفظ التنبيه</button>
            <button onClick={() => { updNotice(""); setEditNotice(""); }} style={btn("#7f1d1d", "#ef4444")}>🗑️ حذف</button>
          </div>
          {notice && (
            <div style={{ marginTop: 16 }}>
              <div className="app-small-text" style={{ marginBottom: 6 }}>معاينة:</div>
              <div className="app-card app-card--highlight">
                <div className="app-warning">⚠️ تنبيهات ⚠️</div>
                <div className="app-subtle-text">{notice}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {adminMode && tab === "edit" && (
        <div style={{ maxWidth: 560, margin: "18px auto 0", padding: "0 12px" }}>
          <button onClick={() => setShowAdd(true)} style={{ ...btn("#166534", "#22c55e"), marginBottom: 12 }}>➕ إضافة لاعب</button>
          {players.map((player) => (
            <div key={player.id} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "11px 13px", marginBottom: 7 }}>
              {editId === player.id ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                  <input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} style={{ ...inp, flex: 2, minWidth: 100 }} />
                  <input type="number" value={editData.score} onChange={(e) => setEditData({ ...editData, score: e.target.value })} style={{ ...inp, width: 58 }} />
                  <select value={editData.hearts} onChange={(e) => setEditData({ ...editData, hearts: +e.target.value })} style={{ ...inp, width: 66 }}>
                    {[0, 1, 2, 3].map((value) => <option key={value} value={value}>{value} ❤️</option>)}
                  </select>
                  <select value={editData.freeze} onChange={(e) => setEditData({ ...editData, freeze: +e.target.value })} style={{ ...inp, width: 66 }}>
                    {[0, 1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} 🥶</option>)}
                  </select>
                  <button onClick={saveEdit} style={btn("#166534", "#22c55e")}>✓</button>
                  <button onClick={() => setEditId(null)} style={btn("#374151", "#6b7280")}>✕</button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{player.name}</div>
                    <div style={{ marginTop: 2 }}><Hearts count={player.hearts} freeze={player.freeze} /></div>
                  </div>
                  <div style={{ fontWeight: 800, color: "#fbbf24", fontSize: 16 }}>{player.score}</div>
                  <button onClick={() => startEdit(player)} style={{ ...icb, background: "rgba(59,130,246,0.3)" }}>✏️</button>
                  <button onClick={() => delPlayer(player.id)} style={{ ...icb, background: "rgba(239,68,68,0.3)" }}>🗑️</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {adminMode && tab === "reset" && (
        <ResetTab seasons={seasons} onReset={doNewSeason} onViewSeason={(season) => setViewSeason(season)} updSeasons={updSeasons} />
      )}

      {viewSeason && <SeasonModal season={viewSeason} onClose={() => setViewSeason(null)} />}

      {showAdd && (
        <div className="app-modal-overlay">
          <div className="app-modal">
            <div className="app-modal-title" style={{ color: "#22c55e" }}>➕ إضافة لاعب</div>
            <input placeholder="الاسم" value={newP.name} onChange={(e) => setNewP({ ...newP, name: e.target.value })} className="app-input app-input--full" style={{ marginBottom: 8 }} />
            <div className="app-form-row" style={{ marginBottom: 8 }}>
              <input type="number" placeholder="Score" value={newP.score} onChange={(e) => setNewP({ ...newP, score: e.target.value })} className="app-input app-input__date" />
              <select value={newP.hearts} onChange={(e) => setNewP({ ...newP, hearts: +e.target.value })} className="app-input app-input__date">
                {[0, 1, 2, 3].map((value) => <option key={value} value={value}>{value} ❤️</option>)}
              </select>
              <select value={newP.freeze} onChange={(e) => setNewP({ ...newP, freeze: +e.target.value })} className="app-input app-input__date">
                {[0, 1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} 🥶</option>)}
              </select>
            </div>
            <div className="app-form-row" style={{ justifyContent: "center" }}>
              <button onClick={addPlayer} style={btn("#166634", "#22c55e")}>إضافة</button>
              <button onClick={() => setShowAdd(false)} style={btn("#374151", "#6b7280")}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {showLogin && (
        <div style={ov}>
          <div style={mb}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>🔐</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "#fbbf24" }}>دخول الأدمن</div>
            <input type="password" placeholder="الباسورد" value={pw} onChange={(e) => { setPw(e.target.value); setPwErr(false); }} onKeyDown={(e) => e.key === "Enter" && login()} style={{ ...inp, width: "100%", marginBottom: 8 }} autoFocus />
            {pwErr && <div style={{ color: "#f87171", fontSize: 12, marginBottom: 8 }}>❌ باسورد غلط</div>}
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={login} style={btn("#1d4ed8", "#3b82f6")}>دخول</button>
              <button onClick={() => { setShowLogin(false); setPw(""); setPwErr(false); }} style={btn("#374151", "#6b7280")}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {showChangePw && (
        <div style={ov}>
          <div style={mb}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>🔑</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "#fbbf24" }}>تغيير الباسورد</div>
            <input type="password" placeholder="الباسورد القديم" value={oldPw} onChange={(e) => { setOldPw(e.target.value); setPwChangeErr(""); }} style={{ ...inp, width: "100%", marginBottom: 8 }} autoFocus />
            <input type="password" placeholder="الباسورد الجديد" value={newPw1} onChange={(e) => { setNewPw1(e.target.value); setPwChangeErr(""); }} style={{ ...inp, width: "100%", marginBottom: 8 }} />
            <input type="password" placeholder="تأكيد الباسورد الجديد" value={newPw2} onChange={(e) => { setNewPw2(e.target.value); setPwChangeErr(""); }} onKeyDown={(e) => e.key === "Enter" && changePassword()} style={{ ...inp, width: "100%", marginBottom: 8 }} />
            {pwChangeErr && <div style={{ color: "#f87171", fontSize: 12, marginBottom: 8 }}>❌ {pwChangeErr}</div>}
            {pwChangeOk && <div style={{ color: "#22c55e", fontSize: 12, marginBottom: 8 }}>✅ اتغير الباسورد بنجاح!</div>}
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={changePassword} style={btn("#1d4ed8", "#3b82f6")}>💾 حفظ</button>
              <button onClick={() => setShowChangePw(false)} style={btn("#374151", "#6b7280")}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {confirm && <Confirm {...confirm} />}
    </div>
  );
}
