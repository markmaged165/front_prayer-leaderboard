import { useState, useEffect } from "react";
import "./App.css";

const ADMIN_PASSWORD = "432017@Aa";

const cn = (...parts) => parts.filter(Boolean).join(" ");

// const season1Data = [
//   { id: 101, name: "فيلو مجدي", score: 24, hearts: 3, freeze: 0 },
//   { id: 102, name: "فيلو ماهر", score: 20, hearts: 3, freeze: 0 },
//   { id: 103, name: "يوسف ماجد", score: 16, hearts: 3, freeze: 0 },
//   { id: 104, name: "كيرلس جورج", score: 15, hearts: 3, freeze: 0 },
//   { id: 105, name: "مينا عماد", score: 9, hearts: 3, freeze: 0 },
//   { id: 106, name: "مارك ماجد", score: 9, hearts: 3, freeze: 0 },
//   { id: 107, name: "فيلوباتير ياسر", score: 5, hearts: 3, freeze: 0 },
//   { id: 108, name: "ديفيد هاني", score: 4, hearts: 3, freeze: 0 },
//   { id: 109, name: "كيرو ريمون", score: 4, hearts: 3, freeze: 0 },
//   { id: 110, name: "جرجس رائف", score: 3, hearts: 3, freeze: 0 },
//   { id: 111, name: "مينا روماني", score: 2, hearts: 3, freeze: 0 },
//   { id: 112, name: "مارك عماد", score: 1, hearts: 3, freeze: 0 },
//   { id: 113, name: "كيرلس سامح", score: 1, hearts: 3, freeze: 0 },
// ];

// const initialPlayers = [
//   { id: 1, name: "يوسف ماجد", score: 53, hearts: 3, freeze: 0 },
//   { id: 2, name: "كيرو جورج", score: 54, hearts: 3, freeze: 0 },
//   { id: 3, name: "فيلو ياسر", score: 54, hearts: 3, freeze: 0 },
//   { id: 4, name: "مارك ماجد", score: 53, hearts: 3, freeze: 0 },
//   { id: 5, name: "يوسف اشرف", score: 49, hearts: 2, freeze: 0 },
//   { id: 6, name: "مينا عماد", score: 48, hearts: 2, freeze: 0 },
//   { id: 7, name: "مينا ميلاد", score: 48, hearts: 2, freeze: 0 },
//   { id: 8, name: "ديفيد هاني", score: 48, hearts: 2, freeze: 0 },
//   { id: 9, name: "فيلو مجدي", score: 47, hearts: 2, freeze: 5 },
//   { id: 10, name: "كيرو ريمون", score: 44, hearts: 0, freeze: 4 },
//   { id: 11, name: "كيرلس سامح", score: 44, hearts: 0, freeze: 1 },
//   { id: 12, name: "فيلو ماهر", score: 42, hearts: 0, freeze: 4 },
//   { id: 13, name: "كاراس كيرلس", score: 36, hearts: 1, freeze: 1 },
//   { id: 14, name: "ابانوب فايز", score: 33, hearts: 1, freeze: 1 },
//   { id: 15, name: "جرجس رائف", score: 31, hearts: 3, freeze: 5 },
//   { id: 16, name: "كاراس عوني", score: 26, hearts: 1, freeze: 2 },
//   { id: 17, name: "مايكل جرجس", score: 19, hearts: 1, freeze: 0 },
//   { id: 18, name: "بيشوي فوزي", score: 1, hearts: 1, freeze: 0 },
//   { id: 19, name: "كيرو عماد", score: 1, hearts: 1, freeze: 0 },
// ];

const defaultSeasons = [];
const API_BASE = "/api";
const today = () => new Date().toISOString().split("T")[0];
const defaultAppState = {
  rounds: {},
  seasons: defaultSeasons,
  news: [],
  notice: "",
  seasonStart: today(),
  seasonLabel: "الموسم الأول",
  lastScoreDate: null,
};

async function fetchPlayersFromApi() {
  const response = await fetch(`${API_BASE}/players`);
  if (!response.ok) {
    throw new Error("Failed to load players");
  }
  return response.json();
}

async function replacePlayersOnApi(players) {
  try {
    await fetch(`${API_BASE}/players`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(players),
    });
  } catch (error) {
    void error;
  }
}

async function fetchAppStateFromApi() {
  const response = await fetch(`${API_BASE}/state`);
  if (!response.ok) {
    throw new Error("Failed to load app state");
  }
  return response.json();
}

async function replaceAppStateOnApi(state) {
  try {
    await fetch(`${API_BASE}/state`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(state),
    });
  } catch (error) {
    console.error(error);
  }
}

function getRanked(players) {
  const visible = players.filter((p) => p.score > 0);
  const s = [...visible].sort(
    (a, b) => b.score - a.score || b.hearts - a.hearts || a.freeze - b.freeze,
  );
  return s.map((p, i, arr) => {
    if (i === 0) return { ...p, rank: 1 };
    const prev = arr[i - 1];
    return {
      ...p,
      rank:
        p.score === prev.score && p.hearts === prev.hearts
          ? arr[i - 1].rank
          : i + 1,
    };
  });
}

function Hearts({ count, freeze }) {
  return (
    <span className="hearts">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            "hearts__icon",
            i < count ? "hearts__icon--on" : "hearts__icon--off",
          )}
        >
          {i < count ? "❤️" : "🖤"}
        </span>
      ))}
      {freeze > 0 && (
        <span className="hearts__freeze">
          🥶
          <span className="hearts__freeze-count">×{freeze}</span>
        </span>
      )}
    </span>
  );
}

function RankBadge({ rank }) {
  if (rank === 1)
    return <span className="rank-badge rank-badge--emoji">🥇</span>;
  if (rank === 2)
    return <span className="rank-badge rank-badge--emoji">🥈</span>;
  if (rank === 3)
    return <span className="rank-badge rank-badge--emoji">🥉</span>;
  return <span className="rank-badge rank-badge--number">#{rank}</span>;
}

function Confirm({ msg, yesLabel = "نعم", noLabel = "لا", onYes, onNo }) {
  return (
    <div className="overlay">
      <div className="modal modal--confirm">
        <div className="modal__icon">⚠️</div>
        <div className="modal__message">{msg}</div>
        <div className="modal__actions modal__actions--center">
          <button onClick={onYes} className="btn btn--danger">
            {yesLabel}
          </button>
          <button onClick={onNo} className="btn btn--gray">
            {noLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function daysBetween(d1, d2) {
  if (!d1 || !d2) return 0;
  return Math.round((new Date(d2) - new Date(d1)) / 86400000);
}

function daysSinceStart(startDate) {
  if (!startDate) return 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((now - start) / 86400000));
}

export default function App() {
  useEffect(() => {
    document.title = "الصلاة خدمة اعدادي";
  }, []);

  const [players, setPlayers] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [playersError, setPlayersError] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState(false);
  const [confirm, setConfirm] = useState(null);

  // round
  const [checks, setChecks] = useState({});
  const [roundDate, setRoundDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [newName, setNewName] = useState("");
  const [roundDone, setRoundDone] = useState(false);

  const [rounds, setRounds] = useState(defaultAppState.rounds);
  const [seasons, setSeasons] = useState(defaultAppState.seasons);
  const [news, setNews] = useState(defaultAppState.news);
  const [notice, setNotice] = useState(defaultAppState.notice);
  const [seasonStart, setSeasonStart] = useState(defaultAppState.seasonStart);
  const [seasonLabel, setSeasonLabel] = useState(defaultAppState.seasonLabel);
  const [lastScoreDate, setLastScoreDate] = useState(
    defaultAppState.lastScoreDate,
  );
  const [adminMode, setAdminMode] = useState(false);
  const [tab, setTab] = useState("board");

  // edit
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [newP, setNewP] = useState({
    name: "",
    score: 1,
    hearts: 3,
    freeze: 0,
  });

  // notice edit
  const [editNotice, setEditNotice] = useState("");

  // season label edit
  const [editingLabel, setEditingLabel] = useState(false);
  const [tempLabel, setTempLabel] = useState("");

  // profile
  const [profileId, setProfileId] = useState(null);
  const [viewSeason, setViewSeason] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      try {
        setPlayersLoading(true);
        setPlayersError("");
        const [serverPlayers, appState] = await Promise.all([
          fetchPlayersFromApi(),
          fetchAppStateFromApi(),
        ]);

        if (!cancelled && Array.isArray(serverPlayers)) {
          setPlayers(serverPlayers);
        }
        if (!cancelled && appState) {
          setRounds(appState.rounds || defaultAppState.rounds);
          setSeasons(
            Array.isArray(appState.seasons)
              ? appState.seasons
              : defaultAppState.seasons,
          );
          setNews(
            Array.isArray(appState.news) ? appState.news : defaultAppState.news,
          );
          setNotice(
            typeof appState.notice === "string"
              ? appState.notice
              : defaultAppState.notice,
          );
          setSeasonStart(appState.seasonStart || defaultAppState.seasonStart);
          setSeasonLabel(appState.seasonLabel || defaultAppState.seasonLabel);
          setLastScoreDate(appState.lastScoreDate || null);
        }
      } catch (error) {
        if (!cancelled) {
          setPlayers([]);
          setPlayersError(
            "مش قادر أجيب بيانات المسابقة من السيرفر. تأكد إن الباك شغال.",
          );
          console.error(error);
        }
      } finally {
        if (!cancelled) {
          setPlayersLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  const persistAppState = (overrides = {}) => {
    void replaceAppStateOnApi({
      rounds,
      seasons,
      news,
      notice,
      seasonStart,
      seasonLabel,
      lastScoreDate,
      ...overrides,
    });
  };

  const applyAppStatePatch = (patch) => {
    if (Object.prototype.hasOwnProperty.call(patch, "rounds")) {
      setRounds(patch.rounds);
    }
    if (Object.prototype.hasOwnProperty.call(patch, "seasons")) {
      setSeasons(patch.seasons);
    }
    if (Object.prototype.hasOwnProperty.call(patch, "news")) {
      setNews(patch.news);
    }
    if (Object.prototype.hasOwnProperty.call(patch, "notice")) {
      setNotice(patch.notice);
    }
    if (Object.prototype.hasOwnProperty.call(patch, "seasonStart")) {
      setSeasonStart(patch.seasonStart);
    }
    if (Object.prototype.hasOwnProperty.call(patch, "seasonLabel")) {
      setSeasonLabel(patch.seasonLabel);
    }
    if (Object.prototype.hasOwnProperty.call(patch, "lastScoreDate")) {
      setLastScoreDate(patch.lastScoreDate);
    }
    persistAppState(patch);
  };

  const updPlayers = (ps) => {
    setPlayers(ps);
    void replacePlayersOnApi(ps);
  };
  const updRounds = (rs) => {
    setRounds(rs);
    persistAppState({ rounds: rs });
  };
  const updSeasons = (ss) => {
    setSeasons(ss);
    persistAppState({ seasons: ss });
  };
  const updNews = (ns) => {
    setNews(ns);
    persistAppState({ news: ns });
  };
  const updNotice = (n) => {
    setNotice(n);
    persistAppState({ notice: n });
  };
  const updSeasonStart = (d) => {
    setSeasonStart(d);
    persistAppState({ seasonStart: d });
  };
  const updSeasonLabel = (l) => {
    setSeasonLabel(l);
    persistAppState({ seasonLabel: l });
  };
  const updLastScoreDate = (d) => {
    setLastScoreDate(d);
    persistAppState({ lastScoreDate: d });
  };

  const login = () => {
    if (pw === ADMIN_PASSWORD) {
      setAdminMode(true);
      setShowLogin(false);
      setPw("");
      setPwErr(false);
      openRound();
    } else setPwErr(true);
  };

  const openRound = () => {
    const c = {};
    players.forEach((p) => {
      c[p.id] = false;
    });
    setChecks(c);
    setRoundDone(false);
    setTab("round");
  };

  const toggleCheck = (id) => setChecks((p) => ({ ...p, [id]: !p[id] }));

  // Generate news items from round
  const generateNews = (beforePlayers, afterPlayers, checkedIds, date) => {
    const beforeRanked = getRanked(beforePlayers);
    const afterRanked = getRanked(afterPlayers);

    const newItems = [];

    // Rank changes
    afterRanked.forEach((afterP) => {
      const beforeP = beforeRanked.find((x) => x.id === afterP.id);
      if (!beforeP) return;
      if (afterP.rank < beforeP.rank) {
        // Find who they overtook
        const displaced = beforeRanked.find((x) => x.rank === afterP.rank);
        if (displaced) {
          newItems.push({
            date,
            text: `${afterP.name} 💪 خطف المركز ${toArabicOrdinal(afterP.rank)} من ${displaced.name} 🤦‍♂️`,
          });
        }
      }
    });

    // Didn't pray
    players.forEach((p) => {
      if (!checkedIds[p.id]) {
        newItems.push({ date, text: `${p.name} مصلاش النهاردة 💔` });
      }
    });

    // Man of Streak
    const streakMap = {};
    afterPlayers.forEach((p) => {
      const r = rounds[p.id];
      if (r && r.streak) streakMap[p.id] = r.streak;
    });
    const maxStreak = Math.max(...Object.values(streakMap), 0);
    if (maxStreak > 0) {
      const leaders = afterPlayers.filter(
        (p) => (streakMap[p.id] || 0) === maxStreak,
      );
      if (leaders.length === 1) {
        newItems.push({
          date,
          text: `🔥 Man of Streak: ${leaders[0].name} (${maxStreak} يوم متواصل)`,
        });
      }
    }

    // Man of Score
    const maxScore = Math.max(...afterPlayers.map((p) => p.score), 0);
    if (maxScore > 0) {
      const topScorers = afterPlayers.filter((p) => p.score === maxScore);
      if (topScorers.length === 1) {
        newItems.push({
          date,
          text: `⭐ Man of Score: ${topScorers[0].name} (${maxScore} نقطة)`,
        });
      }
    }

    return newItems;
  };

  const applyRound = () => {
    const beforePlayers = JSON.parse(JSON.stringify(players));
    const ps = [...players];
    const rs = { ...rounds };
    processNext(ps, rs, 0, beforePlayers);
  };

  const processNext = (ps, rs, idx, beforePlayers) => {
    if (idx >= ps.length) {
      const newItems = generateNews(beforePlayers, ps, checks, roundDate);
      const updatedNews = [...newItems, ...news].slice(0, 100);
      updPlayers(ps);
      applyAppStatePatch({
        rounds: rs,
        news: updatedNews,
        lastScoreDate: roundDate,
        ...(!seasonStart ? { seasonStart: roundDate } : {}),
      });
      setRoundDone(true);
      return;
    }
    const p = ps[idx];
    const checked = checks[p.id];

    if (checked) {
      const prev = rs[p.id] || {};
      const prevLast = prev.lastDate;
      const isConsecutive = prevLast && daysBetween(prevLast, roundDate) === 1;
      rs[p.id] = {
        firstDate: prev.firstDate || roundDate,
        lastDate: roundDate,
        streak: isConsecutive ? (prev.streak || 1) + 1 : 1,
      };
      ps[idx] = { ...p, score: p.score + 1 };
      processNext(ps, rs, idx + 1, beforePlayers);
    } else {
      if (p.freeze === 5) {
        setConfirm({
          msg: `${p.name} وصل للفريز الأقصى (5) ومش معلم ✓\nهتشيل اسمه؟`,
          yesLabel: "🗑️ شيل",
          noLabel: "تخليه",
          onYes: () => {
            ps.splice(idx, 1);
            setConfirm(null);
            processNext(ps, rs, idx, beforePlayers);
          },
          onNo: () => {
            setConfirm(null);
            processNext(ps, rs, idx + 1, beforePlayers);
          },
        });
      } else if (p.hearts === 0) {
        setConfirm({
          msg: `${p.name} معهوش قلوب ومش معلم ✓\nعايز تعمله إيه؟`,
          yesLabel: "🗑️ شيل اسمه",
          noLabel: `🥶 Freeze (${p.freeze}/5)`,
          onYes: () => {
            ps.splice(idx, 1);
            setConfirm(null);
            processNext(ps, rs, idx, beforePlayers);
          },
          onNo: () => {
            ps[idx] = { ...p, freeze: p.freeze + 1 };
            setConfirm(null);
            processNext(ps, rs, idx + 1, beforePlayers);
          },
        });
      } else {
        ps[idx] = { ...p, hearts: p.hearts - 1 };
        processNext(ps, rs, idx + 1, beforePlayers);
      }
    }
  };

  const doNewSeason = (label) => {
    const snap = { label, snapshot: JSON.parse(JSON.stringify(players)) };
    const reset = players.map((p) => ({
      ...p,
      score: 0,
      hearts: 3,
      freeze: 0,
    }));
    updPlayers(reset);
    applyAppStatePatch({
      seasons: [...seasons, snap],
      rounds: {},
      news: [],
      lastScoreDate: null,
      seasonStart: today(),
      seasonLabel: "الموسم الحالي",
    });
    setTab("board");
  };

  // edit
  const startEdit = (p) => {
    setEditId(p.id);
    setEditData({ ...p });
  };
  const saveEdit = () => {
    updPlayers(
      players.map((p) =>
        p.id === editId
          ? {
              ...editData,
              score: +editData.score,
              hearts: +editData.hearts,
              freeze: +editData.freeze,
            }
          : p,
      ),
    );
    setEditId(null);
  };
  const delPlayer = (id) => updPlayers(players.filter((p) => p.id !== id));
  const addPlayer = () => {
    if (!newP.name.trim()) return;
    updPlayers([
      ...players,
      { ...newP, id: Date.now(), score: 1, hearts: 3, freeze: 0 },
    ]);
    setNewP({ name: "", score: 1, hearts: 3, freeze: 0 });
    setShowAdd(false);
  };

  const ranked = getRanked(players);
  const dayCount = daysSinceStart(seasonStart);

  // Man of streak/score for board badge
  const streakMap = {};
  players.forEach((p) => {
    const r = rounds[p.id];
    if (r && r.streak) streakMap[p.id] = r.streak;
  });
  const maxStreak = Math.max(...Object.values(streakMap), 0);
  const streakLeaders = players.filter(
    (p) => (streakMap[p.id] || 0) === maxStreak && maxStreak > 0,
  );
  const manOfStreak = streakLeaders.length === 1 ? streakLeaders[0] : null;

  const maxScore = Math.max(...players.map((p) => p.score), 0);
  const scoreLeaders = players.filter(
    (p) => p.score === maxScore && maxScore > 0,
  );
  const manOfScore = scoreLeaders.length === 1 ? scoreLeaders[0] : null;

  const tabButtonClass = (key) =>
    cn("tab-button", tab === key && "tab-button--active");

  const rankCardClass = (rank) =>
    cn(
      "leaderboard-item",
      rank === 1 && "leaderboard-item--gold",
      rank === 2 && "leaderboard-item--silver",
      rank === 3 && "leaderboard-item--bronze",
      rank > 3 && "leaderboard-item--plain",
    );

  const topCardClass = (rank) =>
    cn(
      "panel",
      "panel--soft",
      rank === 1 && "panel--gold",
      rank === 2 && "panel--silver",
      rank === 3 && "panel--bronze",
      rank > 3 && "panel--plain",
    );

  // Profile page
  if (profileId !== null) {
    const p = players.find((x) => x.id === profileId);
    if (!p) {
      setProfileId(null);
      return null;
    }
    const r = rounds[p.id] || {};
    const ranked2 = getRanked(players);
    const me = ranked2.find((x) => x.id === p.id);
    const myRank = me?.rank || "—";
    const above = ranked2.filter((x) => x.rank < myRank);
    const nextUp = above.length > 0 ? above[above.length - 1] : null;
    const streak = r.streak || 0;
    const isTop3 = myRank <= 3;

    return (
      <div className="app-shell app-shell--profile">
        <div className="app-header app-header--profile">
          <button onClick={() => setProfileId(null)} className="btn btn--dark">
            ← رجوع
          </button>
          <span className="app-header__title">بطاقة المتسابق</span>
        </div>
        <div className="section section--narrow">
          <div className={topCardClass(p.rank)}>
            <div className="profile-rank-emoji">
              {myRank === 1
                ? "🥇"
                : myRank === 2
                  ? "🥈"
                  : myRank === 3
                    ? "🥉"
                    : "🎖️"}
            </div>
            <div className="profile-name">{p.name}</div>
            <div className="profile-score">{p.score}</div>
            <div className="muted-label">نقطة</div>
            <Hearts count={p.hearts} freeze={p.freeze} />
            {manOfScore?.id === p.id && (
              <div className="status-badge status-badge--score">
                ⭐ Man of Score
              </div>
            )}
            {manOfStreak?.id === p.id && (
              <div className="status-badge status-badge--streak">
                🔥 Man of Streak
              </div>
            )}
          </div>
          <div className="stat-grid">
            <StatCard icon="🏆" label="المركز" value={`#${myRank}`} />
            <StatCard
              icon="🔥"
              label="أيام متواصلة"
              value={streak > 0 ? `${streak} يوم` : "—"}
            />
            <StatCard
              icon="📅"
              label="أول مرة صلى"
              value={formatDate(r.firstDate)}
              small
            />
            <StatCard
              icon="🕐"
              label="آخر مرة صلى"
              value={formatDate(r.lastDate)}
              small
            />
          </div>
          <div className="panel panel--soft panel--stacked">
            {isTop3 ? (
              <div className="profile-note profile-note--accent">
                {myRank === 1
                  ? "🥇 أنت في المركز الأول يا صديقي! 🎉"
                  : myRank === 2
                    ? "🥈 أنت في المركز الثاني يا صديقي! 💪"
                    : "🥉 أنت في المركز الثالث يا صديقي! 🔥"}
              </div>
            ) : nextUp ? (
              <>
                <div className="muted-label muted-label--spaced">
                  للوصول للمركز #{nextUp.rank}
                </div>
                <div className="profile-target">
                  فاضل{" "}
                  <span className="text-gold">
                    {nextUp.score - p.score + 1} نقطة
                  </span>{" "}
                  عشان تتعدى <span className="text-blue">{nextUp.name}</span>
                </div>
              </>
            ) : (
              <div className="muted-label centered">لا يوجد أحد أعلى</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="app-header">
        <div className="app-header__icon">🏆</div>
        <div className="app-header__quote">
          "صَلُّوا بِلاَ انْقِطَاعٍ"
          <br />
          <a
            href="https://st-takla.org/Bibles/BibleSearch/showVerses.php?book=62&chapter=5&vmin=17&vmax=17"
            target="_blank"
            rel="noopener noreferrer"
            className="app-header__verse"
          >
            (تس 5: 17)
          </a>
        </div>
        <div className="app-header__subtitle">
          تعيشوا وتصلوا يا أحلى رجالة 🤍
        </div>
        <div className="app-header__actions">
          {!adminMode ? (
            <button
              onClick={() => setShowLogin(true)}
              className="btn btn--dark"
            >
              🔐 دخول الأدمن
            </button>
          ) : (
            <button
              onClick={() => {
                setAdminMode(false);
                setTab("board");
              }}
              className="btn btn--danger"
            >
              🚪 خروج
            </button>
          )}
        </div>
      </div>

      {adminMode && (
        <div className="tabs">
          {[
            { key: "board", label: "🏆 الليدربورد" },
            { key: "round", label: "✅ جولة جديدة" },
            { key: "news", label: "📰 الأخبار" },
            { key: "edit", label: "✏️ تعديل" },
            { key: "reset", label: "🔄 موسم جديد" },
            { key: "notice", label: "📢 تنبيهات" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => (t.key === "round" ? openRound() : setTab(t.key))}
              className={tabButtonClass(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {!adminMode && (
        <div className="tabs tabs--public">
          {[
            { key: "board", label: "🏆 الليدربورد" },
            { key: "news", label: "📰 الأخبار" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={tabButtonClass(t.key)}
            >
              {t.label}
            </button>
          ))}
          {seasons.length > 0 && (
            <select
              onChange={(e) => {
                if (e.target.value !== "") {
                  setViewSeason(seasons[+e.target.value]);
                  e.target.value = "";
                }
              }}
              defaultValue=""
              className="select-field"
            >
              <option value="" disabled>
                📂 المواسم السابقة
              </option>
              {[...seasons].reverse().map((s, ri) => {
                const i = seasons.length - 1 - ri;
                return (
                  <option key={i} value={i}>
                    {s.label}
                  </option>
                );
              })}
            </select>
          )}
        </div>
      )}

      {/* ===== LEADERBOARD ===== */}
      {tab === "board" && (
        <div className="section section--wide">
          <div className="panel panel--soft panel--header">
            <div>
              {editingLabel && adminMode ? (
                <div className="inline-form">
                  <input
                    value={tempLabel}
                    onChange={(e) => setTempLabel(e.target.value)}
                    className="input input--small"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      updSeasonLabel(tempLabel);
                      setEditingLabel(false);
                    }}
                    className="btn btn--green"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setEditingLabel(false)}
                    className="btn btn--gray"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="inline-title-row">
                  <span className="text-gold text-strong">{seasonLabel}</span>
                  {adminMode && (
                    <button
                      onClick={() => {
                        setTempLabel(seasonLabel);
                        setEditingLabel(true);
                      }}
                      className="icon-button icon-button--plain"
                    >
                      ✏️
                    </button>
                  )}
                </div>
              )}
              {lastScoreDate && (
                <div className="muted-label muted-label--small">
                  آخر حساب: {formatDate(lastScoreDate)}
                </div>
              )}
            </div>
            <div className="panel panel--badge">
              <div className="panel__value panel__value--gold">{dayCount}</div>
              <div className="panel__caption">يوم من بداية الموسم</div>
            </div>
          </div>

          {notice && notice.trim() && (
            <div className="panel panel--notice">
              <div className="panel__heading panel__heading--gold">
                ⚠️ تنبيهات ⚠️
              </div>
              <div className="panel__body panel__body--notice">{notice}</div>
            </div>
          )}

          {playersLoading && (
            <div className="empty-state">
              <div className="empty-state__icon">⏳</div>
              <div>جاري تحميل اللاعبين من السيرفر...</div>
            </div>
          )}

          {!playersLoading && playersError && (
            <div className="panel panel--warning">
              <div className="panel__heading panel__heading--warning">
                مشكلة في الاتصال
              </div>
              <div className="panel__body panel__body--warning">
                {playersError}
              </div>
            </div>
          )}

          {!playersLoading && !playersError && ranked.length === 0 && (
            <div className="empty-state">
              <div className="empty-state__icon">📭</div>
              <div>لا يوجد لاعبين في قاعدة البيانات حاليا</div>
            </div>
          )}

          {!playersLoading && !playersError && ranked.map((p) => {
            const isTop3 = p.rank <= 3;
            return (
              <div
                key={p.id}
                onClick={() => setProfileId(p.id)}
                className={rankCardClass(p.rank)}
              >
                <div className="leaderboard-item__rank">
                  <RankBadge rank={p.rank} />
                </div>
                <div className="leaderboard-item__main">
                  <div className="leaderboard-item__title">
                    <span className="leaderboard-item__name">{p.name}</span>
                    {manOfScore?.id === p.id && (
                      <span className="mini-badge mini-badge--gold">
                        ⭐ Score
                      </span>
                    )}
                    {manOfStreak?.id === p.id && (
                      <span className="mini-badge mini-badge--red">
                        🔥 Streak
                      </span>
                    )}
                  </div>
                  <div className="leaderboard-item__hearts">
                    <Hearts count={p.hearts} freeze={p.freeze} />
                  </div>
                </div>
                <div className="leaderboard-item__score">
                  <div
                    className={cn(
                      "leaderboard-item__score-value",
                      isTop3 && "leaderboard-item__score-value--gold",
                    )}
                  >
                    {p.score}
                  </div>
                  <div className="leaderboard-item__score-label">نقطة</div>
                </div>
              </div>
            );
          })}
          <div className="section-note">
            {ranked.length} لاعب • اضغط على أي لاعب لعرض بطاقته
          </div>
        </div>
      )}

      {/* ===== NEWS TAB ===== */}
      {tab === "news" && (
        <div className="section section--wide">
          <div className="section__header section__header--spaced">
            <div className="section-title">📰 أخبار المسابقة</div>
            {adminMode && news.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm && typeof window.confirm === "function") {
                    updNews([]);
                  } else {
                    updNews([]);
                  }
                }}
                className="btn btn--danger btn--compact"
              >
                🗑️ مسح الكل
              </button>
            )}
          </div>

          <div className="badge-grid">
            {manOfScore && (
              <div className="badge-card badge-card--gold">
                <div className="badge-card__label">⭐ Man of Score</div>
                <div className="badge-card__name badge-card__name--gold">
                  {manOfScore.name}
                </div>
                <div className="badge-card__meta">{manOfScore.score} نقطة</div>
              </div>
            )}
            {manOfStreak && (
              <div className="badge-card badge-card--red">
                <div className="badge-card__label">🔥 Man of Streak</div>
                <div className="badge-card__name badge-card__name--red">
                  {manOfStreak.name}
                </div>
                <div className="badge-card__meta">
                  {streakMap[manOfStreak.id]} يوم متواصل
                </div>
              </div>
            )}
            {!manOfScore && !manOfStreak && (
              <div className="empty-state empty-state--inline">
                لا توجد ألقاب بعد — يجب أن يكون هناك فائز واحد فقط
              </div>
            )}
          </div>

          {news.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">📭</div>
              <div>مفيش أخبار لسه</div>
            </div>
          ) : (
            news.map((item, i) => (
              <NewsItem
                key={i}
                item={item}
                index={i}
                adminMode={adminMode}
                onDelete={(idx) => {
                  const updated = news.filter((_, j) => j !== idx);
                  updNews(updated);
                }}
                onEdit={(idx, newText) => {
                  const updated = news.map((n, j) =>
                    j === idx ? { ...n, text: newText } : n,
                  );
                  updNews(updated);
                }}
              />
            ))
          )}
        </div>
      )}

      {/* ===== ROUND TAB ===== */}
      {adminMode && tab === "round" && (
        <div className="section section--wide">
          <div className="panel panel--soft panel--row">
            <span className="muted-label muted-label--row">
              📅 تاريخ الجولة:
            </span>
            <input
              type="date"
              value={roundDate}
              onChange={(e) => setRoundDate(e.target.value)}
              className="input input--flex"
            />
          </div>
          <div className="panel panel--success">
            <div className="panel__heading panel__heading--green">
              ➕ إضافة متسابق جديد
            </div>
            <div className="row row--gap">
              <input
                placeholder="الاسم"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newName.trim()) {
                    const np = {
                      id: Date.now(),
                      name: newName.trim(),
                      score: 1,
                      hearts: 3,
                      freeze: 0,
                    };
                    updPlayers([...players, np]);
                    setChecks((p) => ({ ...p, [np.id]: true }));
                    setNewName("");
                  }
                }}
                className="input input--flex"
              />
              <button
                onClick={() => {
                  if (!newName.trim()) return;
                  const np = {
                    id: Date.now(),
                    name: newName.trim(),
                    score: 1,
                    hearts: 3,
                    freeze: 0,
                  };
                  updPlayers([...players, np]);
                  setChecks((p) => ({ ...p, [np.id]: true }));
                  setNewName("");
                }}
                className="btn btn--green"
              >
                إضافة
              </button>
            </div>
          </div>
          <div className="muted-label muted-label--small">
            علّم ✓ على اللي حضروا
          </div>
          {[...players]
            .sort((a, b) => a.name.localeCompare(b.name, "ar"))
            .map((p) => (
              <div
                key={p.id}
                onClick={() => toggleCheck(p.id)}
                className={cn(
                  "check-item",
                  checks[p.id] ? "check-item--checked" : "check-item--idle",
                )}
              >
                <div
                  className={cn(
                    "check-item__box",
                    checks[p.id] && "check-item__box--checked",
                  )}
                >
                  {checks[p.id] ? "✓" : ""}
                </div>
                <div className="check-item__main">
                  <div className="check-item__name">{p.name}</div>
                  <div className="check-item__hearts">
                    <Hearts count={p.hearts} freeze={p.freeze} />
                  </div>
                </div>
                <div className="check-item__score">{p.score}</div>
              </div>
            ))}
          {!roundDone ? (
            <button
              onClick={applyRound}
              className="btn btn--gradient btn--full"
            >
              🚀 تطبيق الجولة
            </button>
          ) : (
            <div className="panel panel--success panel--centered">
              <div className="panel__icon">✅</div>
              <div className="panel__heading panel__heading--green panel__heading--centered">
                اتطبقت الجولة بنجاح!
              </div>
              <button
                onClick={() => setTab("board")}
                className="btn btn--dark btn--spaced"
              >
                عرض الليدربورد
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===== NOTICE TAB ===== */}
      {adminMode && tab === "notice" && (
        <div className="section section--narrow">
          <div className="section-title">📢 إدارة التنبيهات</div>
          <div className="muted-label muted-label--small">
            اكتب التنبيه اللي عايز يظهر للمتسابقين في الليدربورد:
          </div>
          <textarea
            value={editNotice}
            onChange={(e) => setEditNotice(e.target.value)}
            onFocus={() => setEditNotice(notice)}
            placeholder="اكتب تنبيه هنا..."
            rows={5}
            className="textarea"
          />
          <div className="row row--gap row--top">
            <button
              onClick={() => {
                updNotice(editNotice);
              }}
              className="btn btn--green btn--flex"
            >
              💾 حفظ التنبيه
            </button>
            <button
              onClick={() => {
                updNotice("");
                setEditNotice("");
              }}
              className="btn btn--danger"
            >
              🗑️ حذف
            </button>
          </div>
          {notice && (
            <div className="section-stack">
              <div className="muted-label muted-label--small">معاينة:</div>
              <div className="panel panel--notice">
                <div className="panel__heading panel__heading--gold">
                  ⚠️ تنبيهات ⚠️
                </div>
                <div className="panel__body panel__body--notice">{notice}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== EDIT TAB ===== */}
      {adminMode && tab === "edit" && (
        <div className="section section--wide">
          <button
            onClick={() => setShowAdd(true)}
            className="btn btn--green btn--block-space"
          >
            ➕ إضافة لاعب
          </button>
          {players.map((p) => (
            <div key={p.id} className="list-card">
              {editId === p.id ? (
                <div className="row row--wrap row--tight">
                  <input
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    className="input input--grow"
                  />
                  <input
                    type="number"
                    value={editData.score}
                    onChange={(e) =>
                      setEditData({ ...editData, score: e.target.value })
                    }
                    className="input input--xs"
                  />
                  <select
                    value={editData.hearts}
                    onChange={(e) =>
                      setEditData({ ...editData, hearts: +e.target.value })
                    }
                    className="input input--sm"
                  >
                    {[0, 1, 2, 3].map((v) => (
                      <option key={v} value={v}>
                        {v} ❤️
                      </option>
                    ))}
                  </select>
                  <select
                    value={editData.freeze}
                    onChange={(e) =>
                      setEditData({ ...editData, freeze: +e.target.value })
                    }
                    className="input input--sm"
                  >
                    {[0, 1, 2, 3, 4, 5].map((v) => (
                      <option key={v} value={v}>
                        {v} 🥶
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={saveEdit}
                    className="btn btn--green btn--icon"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setEditId(null)}
                    className="btn btn--gray btn--icon"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="row row--space">
                  <div className="list-card__main">
                    <div className="list-card__name">{p.name}</div>
                    <div className="list-card__hearts">
                      <Hearts count={p.hearts} freeze={p.freeze} />
                    </div>
                  </div>
                  <div className="list-card__score">{p.score}</div>
                  <button
                    onClick={() => startEdit(p)}
                    className="icon-button icon-button--blue"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => delPlayer(p.id)}
                    className="icon-button icon-button--red"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ===== RESET TAB ===== */}
      {adminMode && tab === "reset" && (
        <ResetTab
          seasons={seasons}
          onReset={doNewSeason}
          onSeasonsChange={updSeasons}
          onViewSeason={(s) => setViewSeason(s)}
        />
      )}

      {/* Season viewer */}
      {viewSeason && (
        <SeasonModal season={viewSeason} onClose={() => setViewSeason(null)} />
      )}

      {/* Add player modal */}
      {showAdd && (
        <div className="overlay">
          <div className="modal">
            <div className="modal__title modal__title--green">
              ➕ إضافة لاعب
            </div>
            <input
              placeholder="الاسم"
              value={newP.name}
              onChange={(e) => setNewP({ ...newP, name: e.target.value })}
              className="input input--full input--bottom"
            />
            <div className="row row--gap row--bottom">
              <input
                type="number"
                placeholder="Score"
                value={newP.score}
                onChange={(e) => setNewP({ ...newP, score: e.target.value })}
                className="input input--flex"
              />
              <select
                value={newP.hearts}
                onChange={(e) => setNewP({ ...newP, hearts: +e.target.value })}
                className="input input--flex"
              >
                {[0, 1, 2, 3].map((v) => (
                  <option key={v} value={v}>
                    {v} ❤️
                  </option>
                ))}
              </select>
              <select
                value={newP.freeze}
                onChange={(e) => setNewP({ ...newP, freeze: +e.target.value })}
                className="input input--flex"
              >
                {[0, 1, 2, 3, 4, 5].map((v) => (
                  <option key={v} value={v}>
                    {v} 🥶
                  </option>
                ))}
              </select>
            </div>
            <div className="modal__actions modal__actions--center">
              <button onClick={addPlayer} className="btn btn--green">
                إضافة
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="btn btn--gray"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login modal */}
      {showLogin && (
        <div className="overlay">
          <div className="modal">
            <div className="modal__icon">🔐</div>
            <div className="modal__title modal__title--gold">دخول الأدمن</div>
            <input
              type="password"
              placeholder="الباسورد"
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                setPwErr(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && login()}
              className="input input--full input--bottom"
              autoFocus
            />
            {pwErr && <div className="form-error">❌ باسورد غلط</div>}
            <div className="modal__actions modal__actions--center">
              <button onClick={login} className="btn btn--blue">
                دخول
              </button>
              <button
                onClick={() => {
                  setShowLogin(false);
                  setPw("");
                  setPwErr(false);
                }}
                className="btn btn--gray"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {confirm && <Confirm {...confirm} />}
    </div>
  );
}

function NewsItem({ item, index, adminMode, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.text);

  const save = () => {
    if (text.trim()) {
      onEdit(index, text.trim());
      setEditing(false);
    }
  };

  return (
    <div className="news-card">
      {editing ? (
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="textarea textarea--news"
            autoFocus
          />
          <div className="row row--gap row--compact">
            <button onClick={save} className="btn btn--green">
              💾 حفظ
            </button>
            <button
              onClick={() => {
                setText(item.text);
                setEditing(false);
              }}
              className="btn btn--gray"
            >
              إلغاء
            </button>
          </div>
        </div>
      ) : (
        <div className="news-card__row">
          <div className="news-card__text">{item.text}</div>
          <div className="news-card__meta">
            <div className="news-card__date">{formatDate(item.date)}</div>
            {adminMode && (
              <div className="row row--tight row--end">
                <button
                  onClick={() => setEditing(true)}
                  className="icon-button icon-button--blue icon-button--small"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDelete(index)}
                  className="icon-button icon-button--red icon-button--small"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ResetTab({ seasons, onReset, onSeasonsChange, onViewSeason }) {
  const [label, setLabel] = useState("");
  const [step, setStep] = useState(1);
  const [editIdx, setEditIdx] = useState(null);
  const [editLbl, setEditLbl] = useState("");
  const [ss, setSs] = useState(seasons);

  useEffect(() => {
    setSs(seasons);
  }, [seasons]);

  const saveLabel = (i) => {
    const updated = ss.map((s, idx) =>
      idx === i ? { ...s, label: editLbl } : s,
    );
    setSs(updated);
    onSeasonsChange(updated);
    setEditIdx(null);
  };

  return (
    <div className="section section--narrow section--reset">
      <div className="panel panel--reset">
        <div className="panel__icon panel__icon--large">🔄</div>
        <div className="panel__title panel__title--center panel__title--gold">
          موسم جديد
        </div>
        <div className="panel__subtitle panel__subtitle--center">
          هيتحفظ الموسم الحالي وكل الأسكورات هترجع 0 والقلوب ❤️❤️❤️
        </div>
        {step === 1 && (
          <>
            <div className="muted-label muted-label--small">
              اكتب اسم للموسم الحالي قبل ما تبدأ جديد:
            </div>
            <input
              placeholder="مثال: موسم الصيف 2025"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="input input--full input--bottom"
            />
            <button
              onClick={() => label.trim() && setStep(2)}
              className={cn(
                "btn",
                "btn--gradient",
                "btn--full",
                !label.trim() && "btn--disabled",
              )}
            >
              التالي →
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <div className="panel panel--warning">
              <div className="panel__heading panel__heading--warning">
                ⚠️ تأكيد
              </div>
              <div className="panel__body panel__body--warning">
                هيتحفظ موسم "<span className="text-gold">{label}</span>" وكل
                حاجة هترجع من الأول.
              </div>
            </div>
            <div className="row row--gap">
              <button
                onClick={() => {
                  onReset(label);
                  setStep(1);
                  setLabel("");
                }}
                className="btn btn--danger btn--flex"
              >
                ✅ تأكيد
              </button>
              <button onClick={() => setStep(1)} className="btn btn--gray">
                رجوع
              </button>
            </div>
          </>
        )}
      </div>

      {ss.length > 0 && (
        <div className="stacked-list">
          <div className="muted-label muted-label--small">
            المواسم المحفوظة ({ss.length}):
          </div>
          {[...ss].reverse().map((s, ri) => {
            const i = ss.length - 1 - ri;
            return (
              <div key={i} className="list-card list-card--season">
                {editIdx === i ? (
                  <div className="row row--gap row--center">
                    <input
                      value={editLbl}
                      onChange={(e) => setEditLbl(e.target.value)}
                      className="input input--flex"
                      autoFocus
                    />
                    <button
                      onClick={() => saveLabel(i)}
                      className="btn btn--green btn--icon"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setEditIdx(null)}
                      className="btn btn--gray btn--icon"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="row row--space">
                    <div className="row row--gap row--center">
                      <span className="list-card__name list-card__name--season">
                        {s.label}
                      </span>
                      <button
                        onClick={() => {
                          setEditIdx(i);
                          setEditLbl(s.label);
                        }}
                        className="icon-button icon-button--plain"
                      >
                        ✏️
                      </button>
                    </div>
                    <button
                      onClick={() => onViewSeason(s)}
                      className="btn btn--dark btn--sm"
                    >
                      عرض
                    </button>
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

function SeasonModal({ season, onClose }) {
  const ranked = getRanked(season.snapshot);
  return (
    <div className="overlay">
      <div className="modal modal--scrollable modal--season-view">
        <div className="modal__header modal__header--spaced">
          <div className="modal__title modal__title--gold">{season.label}</div>
          <button onClick={onClose} className="btn btn--gray btn--sm">
            ✕
          </button>
        </div>
        {ranked.map((p) => (
          <div key={p.id} className="list-card list-card--season-view">
            <RankBadge rank={p.rank} />
            <div className="list-card__main">
              <div className="list-card__name">{p.name}</div>
              <Hearts count={p.hearts} freeze={p.freeze} />
            </div>
            <div className="list-card__score list-card__score--gold">
              {p.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, small }) {
  return (
    <div className="stat-card">
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__label">{label}</div>
      <div
        className={cn("stat-card__value", small && "stat-card__value--small")}
      >
        {value}
      </div>
    </div>
  );
}

function toArabicOrdinal(n) {
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
  return map[n] || `#${n}`;
}
