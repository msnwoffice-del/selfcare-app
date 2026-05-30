import { useState, useEffect, useCallback } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = [
  { id: "mind",      label: "Minte",     emoji: "🧠", color: "#C4A8E0", bg: "#F5EEFF", items: ["Meditație 5 min", "Jurnal / scriere liberă", "Lectură", "Respirație profundă"] },
  { id: "body",      label: "Corp",      emoji: "🌿", color: "#7EC8A0", bg: "#EDFAF3", items: ["Mișcare / sport", "Stretching dimineață", "Hidratare (2L apă)", "Plimbare în aer liber"] },
  { id: "sleep",     label: "Somn",      emoji: "🌙", color: "#F0A07A", bg: "#FFF4EC", items: ["Culcare înainte de 23:00", "Fără ecrane -1h", "Rutină de seară", "7-8 ore somn"] },
  { id: "nutrition", label: "Nutriție",  emoji: "🥗", color: "#E8C84A", bg: "#FFFBEF", items: ["Mic dejun nutritiv", "Fructe și legume", "Fără zahăr procesat", "Masă în liniște"] },
  { id: "social",    label: "Conexiune", emoji: "💛", color: "#F5A0B8", bg: "#FFF0F4", items: ["Timp cu familia", "Conversație autentică", "Moment doar pentru mine", "3 lucruri de care sunt recunoscătoare"] },
];

const QUOTES = [
  "Grija de sine nu e egoism — e oxigenul tău.",
  "Nu ai nevoie de o zi perfectă. Ai nevoie de un pas bun.",
  "Cinci minute pentru tine azi valorează mai mult decât zero mâine.",
  "Corpul tău ține minte tot ce mintea uită să recunoască.",
  "Rutina ta zilnică e votul pe care îl dai pentru persoana care vrei să devii.",
];

const TABS = ["Azi", "Istoric", "Statistici", "Setări"];

const todayStr = () => new Date().toISOString().slice(0, 10);
const formatDate = (d) => new Date(d).toLocaleDateString("ro-RO", { weekday: "short", day: "numeric", month: "short" });

// ─── STORAGE ──────────────────────────────────────────────────────────────────

const load = (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// ─── STYLES ───────────────────────────────────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Nunito:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --cream: #FAF7F2;
  --warm: #F3EDE4;
  --bark: #3D2F28;
  --bark2: #6B5248;
  --muted: #A89890;
  --border: #EAE2D8;
  --white: #FFFFFF;
  --gold: #D4A853;
  --premium: #C4896A;
}

body { background: var(--cream); font-family: 'Nunito', sans-serif; }

.app { max-width: 460px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; }

/* HEADER */
.hdr {
  background: linear-gradient(150deg, #3D2F28 0%, #5A3E34 60%, #7A5548 100%);
  padding: 32px 24px 0;
  position: relative;
  overflow: hidden;
}
.hdr::before {
  content: '';
  position: absolute;
  top: -40px; right: -40px;
  width: 180px; height: 180px;
  border-radius: 50%;
  background: rgba(212,168,83,0.12);
}
.hdr-top { display: flex; justify-content: space-between; align-items: flex-start; }
.hdr-date { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 4px; }
.hdr-title { font-family: 'Playfair Display', serif; font-size: 24px; color: white; line-height: 1.2; }
.hdr-title em { color: var(--gold); font-style: italic; }
.premium-badge {
  background: linear-gradient(135deg, #D4A853, #C4896A);
  color: white;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  padding: 5px 12px;
  border-radius: 99px;
  text-transform: uppercase;
  cursor: pointer;
  border: none;
  white-space: nowrap;
  flex-shrink: 0;
}
.free-badge {
  background: rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.7);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  padding: 5px 12px;
  border-radius: 99px;
  text-transform: uppercase;
  cursor: pointer;
  border: none;
  white-space: nowrap;
  flex-shrink: 0;
}

/* PROGRESS */
.progress-card {
  background: rgba(255,255,255,0.1);
  border-radius: 14px;
  padding: 14px 18px;
  margin-top: 18px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255,255,255,0.12);
}
.progress-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.progress-num { font-family: 'Playfair Display', serif; font-size: 28px; color: white; }
.progress-num span { font-size: 13px; color: rgba(255,255,255,0.5); font-family: 'Nunito', sans-serif; }
.progress-pct { font-size: 13px; color: var(--gold); font-weight: 600; }
.bar-bg { height: 6px; background: rgba(255,255,255,0.15); border-radius: 99px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, #D4A853, #F5A0B8); transition: width .6s cubic-bezier(.4,0,.2,1); }

/* TABS */
.tabs {
  display: flex;
  background: var(--warm);
  border-bottom: 1px solid var(--border);
  padding: 0 8px;
}
.tab {
  flex: 1;
  padding: 13px 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  border: none;
  background: none;
  cursor: pointer;
  letter-spacing: 0.3px;
  border-bottom: 2px solid transparent;
  transition: all .2s;
  position: relative;
}
.tab.active { color: var(--bark); border-bottom-color: var(--gold); }
.tab .lock { font-size: 9px; margin-left: 2px; }

/* CONTENT */
.content { flex: 1; padding: 0 0 80px; overflow-y: auto; }

/* QUOTE */
.quote-strip {
  margin: 14px 16px 0;
  padding: 14px 18px;
  background: var(--white);
  border-radius: 14px;
  border-left: 3px solid var(--gold);
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
}
.quote-strip p { font-family: 'Playfair Display', serif; font-size: 12.5px; font-style: italic; color: var(--bark2); line-height: 1.6; }

/* CATEGORY */
.cat { margin: 12px 16px 0; background: var(--white); border-radius: 18px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
.cat-hdr { display: flex; align-items: center; gap: 10px; padding: 15px 18px 12px; cursor: pointer; border-bottom: 1px solid var(--border); }
.cat-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.cat-name { font-family: 'Playfair Display', serif; font-size: 15px; color: var(--bark); flex: 1; }
.cat-pills { display: flex; gap: 6px; align-items: center; }
.cat-count { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 99px; color: white; }
.chevron { font-size: 11px; color: var(--muted); transition: transform .3s; }
.chevron.open { transform: rotate(180deg); }

.items { overflow: hidden; transition: max-height .35s cubic-bezier(.4,0,.2,1); }
.item { display: flex; align-items: center; gap: 12px; padding: 13px 18px; border-bottom: 1px solid #FAF7F2; cursor: pointer; transition: background .15s; }
.item:last-child { border-bottom: none; }
.item:hover { background: #FDFBF8; }
.check { width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 11px; color: white; flex-shrink: 0; transition: all .2s; }
.check.done { border-color: transparent; transform: scale(1.1); }
.item-label { font-size: 13.5px; color: #5A4840; flex: 1; transition: color .2s; }
.item-label.done { color: var(--muted); text-decoration: line-through; text-decoration-color: var(--border); }
.del-btn { background: none; border: none; color: #E0C8C0; font-size: 16px; cursor: pointer; padding: 0 4px; line-height: 1; }
.del-btn:hover { color: #C0786A; }

/* ADD ITEM */
.add-row { display: flex; gap: 8px; padding: 10px 18px 14px; }
.add-input { flex: 1; border: 1.5px solid var(--border); border-radius: 10px; padding: 8px 12px; font-size: 13px; font-family: 'Nunito', sans-serif; color: var(--bark); background: var(--cream); outline: none; }
.add-input:focus { border-color: var(--gold); }
.add-btn { background: var(--gold); border: none; color: white; border-radius: 10px; padding: 8px 14px; font-size: 18px; cursor: pointer; font-weight: 300; transition: opacity .2s; }
.add-btn:hover { opacity: .85; }

/* CONGRATS */
.congrats { margin: 14px 16px 0; background: linear-gradient(135deg, #FFF8EC, #FFF0F4); border-radius: 18px; padding: 22px; text-align: center; border: 1px solid #F0DDD0; }
.congrats p { font-family: 'Playfair Display', serif; font-size: 15px; color: var(--bark2); line-height: 1.6; font-style: italic; }

/* RESET */
.reset-btn { display: block; margin: 16px auto; background: none; border: 1.5px solid var(--border); color: var(--muted); font-family: 'Nunito', sans-serif; font-size: 12px; padding: 8px 22px; border-radius: 99px; cursor: pointer; transition: all .2s; }
.reset-btn:hover { border-color: var(--muted); color: var(--bark2); }

/* PREMIUM GATE */
.gate {
  margin: 20px 16px 0;
  background: linear-gradient(135deg, #3D2F28, #5A3E34);
  border-radius: 20px;
  padding: 28px 24px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.gate::before { content: '✦'; position: absolute; top: 14px; right: 20px; font-size: 32px; color: rgba(212,168,83,0.2); }
.gate-icon { font-size: 36px; margin-bottom: 10px; }
.gate h3 { font-family: 'Playfair Display', serif; color: white; font-size: 18px; margin-bottom: 8px; }
.gate p { color: rgba(255,255,255,0.6); font-size: 13px; line-height: 1.6; margin-bottom: 20px; }
.gate ul { text-align: left; margin: 0 auto 20px; max-width: 220px; }
.gate ul li { color: rgba(255,255,255,0.75); font-size: 13px; margin-bottom: 6px; list-style: none; padding-left: 20px; position: relative; }
.gate ul li::before { content: '✦'; position: absolute; left: 0; color: var(--gold); font-size: 9px; top: 3px; }
.gate-btn { background: linear-gradient(135deg, #D4A853, #C4896A); color: white; border: none; border-radius: 12px; padding: 14px 32px; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; width: 100%; transition: opacity .2s; }
.gate-btn:hover { opacity: .9; }
.gate-price { color: rgba(255,255,255,0.45); font-size: 11px; margin-top: 10px; }

/* HISTORY */
.hist-day { margin: 12px 16px 0; background: var(--white); border-radius: 14px; padding: 16px 18px; box-shadow: 0 2px 10px rgba(0,0,0,0.04); }
.hist-date { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
.hist-row { display: flex; align-items: center; justify-content: space-between; }
.hist-label { font-family: 'Playfair Display', serif; font-size: 15px; color: var(--bark); }
.hist-pct { font-size: 13px; font-weight: 600; color: var(--gold); }
.hist-bar-bg { height: 4px; background: var(--warm); border-radius: 99px; overflow: hidden; margin-top: 8px; }
.hist-bar-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, #D4A853, #F5A0B8); }
.hist-cats { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
.hist-chip { font-size: 11px; padding: 3px 10px; border-radius: 99px; color: white; font-weight: 500; }

/* STATS */
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 14px 16px 0; }
.stat-card { background: var(--white); border-radius: 16px; padding: 18px; box-shadow: 0 2px 10px rgba(0,0,0,0.04); }
.stat-card.wide { grid-column: 1/-1; }
.stat-num { font-family: 'Playfair Display', serif; font-size: 32px; color: var(--bark); margin-bottom: 2px; }
.stat-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
.streak-flame { font-size: 28px; margin-bottom: 4px; }
.cat-stat-row { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
.cat-stat-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.cat-stat-name { font-size: 13px; color: var(--bark2); flex: 1; }
.cat-stat-pct { font-size: 13px; font-weight: 600; color: var(--bark); }

/* SETTINGS */
.settings-section { margin: 14px 16px 0; background: var(--white); border-radius: 16px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.04); }
.settings-title { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); padding: 16px 18px 8px; }
.settings-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-top: 1px solid var(--border); }
.settings-row-label { font-size: 14px; color: var(--bark2); }
.settings-row-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }
.toggle { width: 44px; height: 24px; border-radius: 12px; background: var(--border); position: relative; cursor: pointer; border: none; transition: background .2s; flex-shrink: 0; }
.toggle.on { background: var(--gold); }
.toggle::after { content: ''; position: absolute; width: 18px; height: 18px; background: white; border-radius: 50%; top: 3px; left: 3px; transition: transform .2s; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
.toggle.on::after { transform: translateX(20px); }
.time-input { border: 1.5px solid var(--border); border-radius: 8px; padding: 6px 10px; font-family: 'Nunito', sans-serif; font-size: 13px; color: var(--bark); background: var(--cream); outline: none; }
.time-input:focus { border-color: var(--gold); }

/* PDF BTN */
.pdf-btn { display: block; margin: 14px 16px 0; width: calc(100% - 32px); background: linear-gradient(135deg, #3D2F28, #5A3E34); color: white; border: none; border-radius: 14px; padding: 16px; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; letter-spacing: 0.3px; transition: opacity .2s; }
.pdf-btn:hover { opacity: .9; }

/* MODAL */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: flex-end; justify-content: center; }
.modal { background: white; border-radius: 24px 24px 0 0; padding: 28px 24px 40px; width: 100%; max-width: 460px; }
.modal h2 { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--bark); margin-bottom: 6px; }
.modal p { font-size: 13px; color: var(--muted); margin-bottom: 20px; line-height: 1.6; }
.modal-features { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; }
.modal-feat { background: var(--cream); border-radius: 12px; padding: 12px 14px; }
.modal-feat .f-icon { font-size: 20px; margin-bottom: 4px; }
.modal-feat .f-label { font-size: 12px; font-weight: 600; color: var(--bark2); }
.modal-feat .f-sub { font-size: 11px; color: var(--muted); }
.modal-price { text-align: center; margin-bottom: 16px; }
.modal-price .price { font-family: 'Playfair Display', serif; font-size: 36px; color: var(--bark); }
.modal-price .price-sub { font-size: 12px; color: var(--muted); }
.modal-buy { width: 100%; background: linear-gradient(135deg, #D4A853, #C4896A); color: white; border: none; border-radius: 14px; padding: 16px; font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; margin-bottom: 10px; }
.modal-close { width: 100%; background: none; border: none; color: var(--muted); font-family: 'Nunito', sans-serif; font-size: 13px; cursor: pointer; }

@keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
.cat { animation: fadeUp .4s ease both; }
`;

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [isPremium, setIsPremium] = useState(() => load("sc_premium", false));
  const [tab, setTab] = useState(0);
  const [categories, setCategories] = useState(() => load("sc_cats", DEFAULT_CATEGORIES));
  const [checked, setChecked] = useState(() => load("sc_today_" + todayStr(), {}));
  const [history, setHistory] = useState(() => load("sc_history", {}));
  const [openCats, setOpenCats] = useState({ mind: true });
  const [newItems, setNewItems] = useState({});
  const [reminder, setReminder] = useState(() => load("sc_reminder", false));
  const [reminderTime, setReminderTime] = useState(() => load("sc_reminder_time", "08:00"));
  const [showModal, setShowModal] = useState(false);
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  const today = todayStr();
  const totalItems = categories.reduce((s, c) => s + c.items.length, 0);
  const doneCount = Object.values(checked).filter(Boolean).length;
  const pct = totalItems ? Math.round((doneCount / totalItems) * 100) : 0;

  // Save today's progress to history
  useEffect(() => {
    save("sc_today_" + today, checked);
    if (doneCount > 0) {
      const h = { ...history, [today]: { checked, total: totalItems, done: doneCount } };
      setHistory(h);
      save("sc_history", h);
    }
  }, [checked]);

  useEffect(() => { save("sc_cats", categories); }, [categories]);
  useEffect(() => { save("sc_reminder", reminder); }, [reminder]);
  useEffect(() => { save("sc_reminder_time", reminderTime); }, [reminderTime]);

  const toggle = (catId, item) => {
    const key = catId + "::" + item;
    setChecked(p => ({ ...p, [key]: !p[key] }));
  };

  const toggleCat = (id) => setOpenCats(p => ({ ...p, [id]: !p[id] }));

  const addItem = (catId) => {
    const val = (newItems[catId] || "").trim();
    if (!val) return;
    setCategories(cats => cats.map(c => c.id === catId ? { ...c, items: [...c.items, val] } : c));
    setNewItems(p => ({ ...p, [catId]: "" }));
  };

  const deleteItem = (catId, item) => {
    setCategories(cats => cats.map(c => c.id === catId ? { ...c, items: c.items.filter(i => i !== item) } : c));
    const key = catId + "::" + item;
    setChecked(p => { const n = { ...p }; delete n[key]; return n; });
  };

  const activatePremium = () => {
    setIsPremium(true);
    save("sc_premium", true);
    setShowModal(false);
  };

  const exportPDF = () => {
    const lines = [];
    lines.push("SELF-CARE TRACKER — Raport Personal");
    lines.push(`Generat: ${new Date().toLocaleDateString("ro-RO")}\n`);
    lines.push("=== PROGRES AZI ===");
    lines.push(`Completat: ${doneCount}/${totalItems} activități (${pct}%)\n`);
    categories.forEach(cat => {
      lines.push(`\n${cat.emoji} ${cat.label.toUpperCase()}`);
      cat.items.forEach(item => {
        const done = checked[cat.id + "::" + item];
        lines.push(`  ${done ? "✓" : "○"} ${item}`);
      });
    });
    lines.push("\n=== ISTORIC (ultimele zile) ===");
    Object.entries(history).sort((a,b) => b[0].localeCompare(a[0])).slice(0, 14).forEach(([d, v]) => {
      const p = Math.round((v.done / v.total) * 100);
      lines.push(`${formatDate(d)}: ${p}% (${v.done}/${v.total})`);
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `selfcare-raport-${today}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  // Stats calculations
  const histDays = Object.entries(history).sort((a,b) => b[0].localeCompare(a[0]));
  const streak = (() => {
    let s = 0, d = new Date();
    while (true) {
      const k = d.toISOString().slice(0,10);
      if (history[k] && history[k].done > 0) { s++; d.setDate(d.getDate()-1); }
      else break;
    }
    return s;
  })();
  const avgPct = histDays.length ? Math.round(histDays.reduce((s,[,v]) => s + (v.done/v.total)*100, 0) / histDays.length) : 0;
  const catStats = categories.map(cat => {
    const total = histDays.length * cat.items.length;
    if (!total) return { ...cat, pct: 0 };
    const done = histDays.reduce((s, [, v]) => {
      return s + cat.items.filter(i => v.checked && v.checked[cat.id + "::" + i]).length;
    }, 0);
    return { ...cat, pct: Math.round((done / total) * 100) };
  });

  const todayLabel = new Date().toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        {/* HEADER */}
        <div className="hdr">
          <div className="hdr-top">
            <div>
              <div className="hdr-date">{todayLabel}</div>
              <h1 className="hdr-title">Rutina ta de <em>self-care</em></h1>
            </div>
            {isPremium
              ? <span className="premium-badge">✦ Premium</span>
              : <button className="free-badge" onClick={() => setShowModal(true)}>Free ↑</button>
            }
          </div>
          <div className="progress-card">
            <div className="progress-row">
              <span className="progress-num">{doneCount}<span>/{totalItems}</span></span>
              <span className="progress-pct">{pct}% ✦</span>
            </div>
            <div className="bar-bg"><div className="bar-fill" style={{ width: pct + "%" }} /></div>
          </div>

          {/* TABS */}
          <div className="tabs" style={{ marginTop: 16 }}>
            {TABS.map((t, i) => (
              <button key={t} className={`tab ${tab === i ? "active" : ""}`}
                onClick={() => { if ((i === 1 || i === 2) && !isPremium) { setShowModal(true); return; } setTab(i); }}>
                {t}{(i === 1 || i === 2) && !isPremium ? <span className="lock">🔒</span> : ""}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="content">

          {/* TAB: AZI */}
          {tab === 0 && <>
            <div className="quote-strip"><p>"{quote}"</p></div>

            {categories.map((cat, ci) => (
              <div className="cat" key={cat.id} style={{ animationDelay: ci * 60 + "ms" }}>
                <div className="cat-hdr" onClick={() => toggleCat(cat.id)}>
                  <div className="cat-icon" style={{ background: cat.bg }}>{cat.emoji}</div>
                  <span className="cat-name">{cat.label}</span>
                  {cat.items.filter(i => checked[cat.id + "::" + i]).length > 0 && (
                    <span className="cat-count" style={{ background: cat.color }}>
                      {cat.items.filter(i => checked[cat.id + "::" + i]).length}/{cat.items.length}
                    </span>
                  )}
                  <span className={`chevron ${openCats[cat.id] ? "open" : ""}`}>▼</span>
                </div>
                <div className="items" style={{ maxHeight: openCats[cat.id] ? (cat.items.length * 52 + (isPremium ? 60 : 0)) + "px" : "0" }}>
                  {cat.items.map(item => {
                    const done = !!checked[cat.id + "::" + item];
                    return (
                      <div className="item" key={item} onClick={() => toggle(cat.id, item)}>
                        <div className="check done" style={done ? { background: cat.color } : {}}>
                          {done ? "✓" : ""}
                        </div>
                        <span className={`item-label ${done ? "done" : ""}`}>{item}</span>
                        {isPremium && (
                          <button className="del-btn" onClick={e => { e.stopPropagation(); deleteItem(cat.id, item); }}>×</button>
                        )}
                      </div>
                    );
                  })}
                  {isPremium && (
                    <div className="add-row">
                      <input
                        className="add-input"
                        placeholder="Adaugă activitate..."
                        value={newItems[cat.id] || ""}
                        onChange={e => setNewItems(p => ({ ...p, [cat.id]: e.target.value }))}
                        onKeyDown={e => e.key === "Enter" && addItem(cat.id)}
                      />
                      <button className="add-btn" onClick={() => addItem(cat.id)}>+</button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {!isPremium && (
              <div className="gate">
                <div className="gate-icon">✦</div>
                <h3>Deblochează versiunea completă</h3>
                <p>Obține acces la toate funcțiile și transformă self-care-ul în stil de viață.</p>
                <ul>
                  <li>Istoric complet pe 30 de zile</li>
                  <li>Statistici și streak-uri</li>
                  <li>Activități personalizate</li>
                  <li>Export raport PDF</li>
                  <li>Reminder-uri zilnice</li>
                </ul>
                <button className="gate-btn" onClick={() => setShowModal(true)}>Obține Premium — 29 RON</button>
                <p className="gate-price">Plată unică · Acces pe viață</p>
              </div>
            )}

            {pct === 100 && (
              <div className="congrats">
                <p>🌸 Ziua perfectă de self-care.<br />Ești un exemplu pentru cei din jurul tău.</p>
              </div>
            )}

            {doneCount > 0 && (
              <button className="reset-btn" onClick={() => { setChecked({}); }}>↺ Resetează ziua</button>
            )}
          </>}

          {/* TAB: ISTORIC */}
          {tab === 1 && isPremium && <>
            {histDays.length === 0 && (
              <div className="quote-strip" style={{ margin: "20px 16px" }}>
                <p>Nicio zi înregistrată încă. Bifează activități azi pentru a vedea istoricul.</p>
              </div>
            )}
            {histDays.slice(0, 30).map(([d, v]) => {
              const p = Math.round((v.done / v.total) * 100);
              return (
                <div className="hist-day" key={d}>
                  <div className="hist-date">{formatDate(d)}</div>
                  <div className="hist-row">
                    <span className="hist-label">{v.done}/{v.total} activități</span>
                    <span className="hist-pct">{p}%</span>
                  </div>
                  <div className="hist-bar-bg"><div className="hist-bar-fill" style={{ width: p + "%" }} /></div>
                  <div className="hist-cats">
                    {categories.map(cat => {
                      const done = cat.items.filter(i => v.checked && v.checked[cat.id + "::" + i]).length;
                      if (!done) return null;
                      return <span key={cat.id} className="hist-chip" style={{ background: cat.color }}>{cat.emoji} {done}</span>;
                    })}
                  </div>
                </div>
              );
            })}
          </>}

          {/* TAB: STATISTICI */}
          {tab === 2 && isPremium && <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="streak-flame">🔥</div>
                <div className="stat-num">{streak}</div>
                <div className="stat-label">Zile la rând</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">{avgPct}%</div>
                <div className="stat-label">Medie zilnică</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">{histDays.length}</div>
                <div className="stat-label">Zile completate</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">{histDays.reduce((s,[,v])=>s+v.done,0)}</div>
                <div className="stat-label">Activități totale</div>
              </div>
              <div className="stat-card wide">
                <div className="stat-label" style={{ marginBottom: 8 }}>Performanță pe categorii</div>
                {catStats.sort((a,b) => b.pct - a.pct).map(cat => (
                  <div className="cat-stat-row" key={cat.id}>
                    <div className="cat-stat-dot" style={{ background: cat.color }} />
                    <span className="cat-stat-name">{cat.emoji} {cat.label}</span>
                    <span className="cat-stat-pct">{cat.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="pdf-btn" onClick={exportPDF}>📄 Exportă raport complet</button>
          </>}

          {/* TAB: SETĂRI */}
          {tab === 3 && <>
            <div className="settings-section">
              <div className="settings-title">Reminder-uri</div>
              <div className="settings-row">
                <div>
                  <div className="settings-row-label">Notificare zilnică</div>
                  <div className="settings-row-sub">Te amintim să îți faci check-in-ul</div>
                </div>
                {isPremium
                  ? <button className={`toggle ${reminder ? "on" : ""}`} onClick={() => setReminder(r => !r)} />
                  : <button className="free-badge" style={{ fontSize: 10 }} onClick={() => setShowModal(true)}>🔒 Premium</button>
                }
              </div>
              {reminder && isPremium && (
                <div className="settings-row">
                  <div className="settings-row-label">Ora reminder</div>
                  <input type="time" className="time-input" value={reminderTime} onChange={e => setReminderTime(e.target.value)} />
                </div>
              )}
            </div>

            <div className="settings-section">
              <div className="settings-title">Export</div>
              <div className="settings-row">
                <div>
                  <div className="settings-row-label">📄 Raport PDF / text</div>
                  <div className="settings-row-sub">Istoric + statistici personale</div>
                </div>
                {isPremium
                  ? <button className="premium-badge" style={{ cursor: "pointer" }} onClick={exportPDF}>Export</button>
                  : <button className="free-badge" style={{ fontSize: 10 }} onClick={() => setShowModal(true)}>🔒 Premium</button>
                }
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-title">Cont</div>
              {isPremium ? (
                <div className="settings-row">
                  <div>
                    <div className="settings-row-label">✦ Premium activ</div>
                    <div className="settings-row-sub">Acces complet pe viață</div>
                  </div>
                  <span style={{ color: "var(--gold)", fontSize: 20 }}>✓</span>
                </div>
              ) : (
                <div className="settings-row" style={{ cursor: "pointer" }} onClick={() => setShowModal(true)}>
                  <div>
                    <div className="settings-row-label">Obține Premium</div>
                    <div className="settings-row-sub">Plată unică — 29 RON</div>
                  </div>
                  <span style={{ color: "var(--gold)" }}>→</span>
                </div>
              )}
            </div>

            <div className="settings-section">
              <div className="settings-title">Date</div>
              <div className="settings-row" style={{ cursor: "pointer" }} onClick={() => { if (window.confirm("Ștergi tot istoricul?")) { localStorage.clear(); window.location.reload(); } }}>
                <div>
                  <div className="settings-row-label" style={{ color: "#C0786A" }}>Șterge toate datele</div>
                  <div className="settings-row-sub">Resetare completă a aplicației</div>
                </div>
                <span style={{ color: "#C0786A" }}>🗑</span>
              </div>
            </div>
          </>}
        </div>

        {/* PREMIUM MODAL */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>✦ Self-Care Premium</h2>
              <p>O singură plată, acces pe viață. Investiția cea mai bună în rutina ta zilnică.</p>
              <div className="modal-features">
                <div className="modal-feat"><div className="f-icon">📅</div><div className="f-label">Istoric 30 zile</div><div className="f-sub">Urmărește progresul</div></div>
                <div className="modal-feat"><div className="f-icon">📊</div><div className="f-label">Statistici</div><div className="f-sub">Streak-uri & medii</div></div>
                <div className="modal-feat"><div className="f-icon">✏️</div><div className="f-label">Custom</div><div className="f-sub">Activități proprii</div></div>
                <div className="modal-feat"><div className="f-icon">📄</div><div className="f-label">Export PDF</div><div className="f-sub">Raport personal</div></div>
              </div>
              <div className="modal-price">
                <div className="price">29 RON</div>
                <div className="price-sub">Plată unică · Fără abonament · Acces pe viață</div>
              </div>
              <button className="modal-buy" onClick={activatePremium}>Obține acces complet acum</button>
              <button className="modal-close" onClick={() => setShowModal(false)}>Mai târziu</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
