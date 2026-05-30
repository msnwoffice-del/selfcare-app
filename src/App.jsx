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
