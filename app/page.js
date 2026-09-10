"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Minus, 
  Plus, 
  Check, 
  Play, 
  Flag, 
  TrendingUp, 
  History, 
  ChevronDown, 
  Zap
} from "lucide-react";

// Check for valid Supabase credentials
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const isSupabaseConfigured = rawUrl && !rawUrl.includes("YOUR_PROJECT") && !rawUrl.includes("placeholder") && rawKey && !rawKey.includes("YOUR_ANON_KEY");

const supabase = isSupabaseConfigured 
  ? createClient(rawUrl, rawKey)
  : null;

const ANON_USER_ID = "00000000-0000-0000-0000-000000000001";

const DAYS = [
  { n: 1, t: "Göğüs + Arka Kol + Karın", short: "1. Gün: Göğüs & Kol" },
  { n: 2, t: "Sırt + Ön Kol + Karın", short: "2. Gün: Sırt & Kol" },
  { n: 3, t: "Bacak + Omuz + Karın", short: "3. Gün: Bacak & Omuz" }
];

const DISPLAY_NAMES = {
  "Barbell Bench Press": "Dumbbell Bench Press",
  "Dips": "Smith Machine Dips",
  "Dumbbell Fly": "Pectoral Fly"
};

// Exact 3-day program specified by user
const DEFAULT_EXERCISES = {
  1: [
    { id: "ex-1-1", day_no: 1, sort_order: 1, name: "Dumbbell Bench Press", increment_kg: 2.5, default_weight: 20, last_weight: 20 },
    { id: "ex-1-2", day_no: 1, sort_order: 2, name: "Incline Barbell Bench Press", increment_kg: 2.5, default_weight: 35, last_weight: 35 },
    { id: "ex-1-3", day_no: 1, sort_order: 3, name: "Smith Machine Dips", increment_kg: 2.5, default_weight: 0, last_weight: 0 },
    { id: "ex-1-4", day_no: 1, sort_order: 4, name: "Pectoral Fly", increment_kg: 2.5, default_weight: 30, last_weight: 30 },
    { id: "ex-1-5", day_no: 1, sort_order: 5, name: "Cable Pushdown", increment_kg: 2.5, default_weight: 25, last_weight: 25 },
    { id: "ex-1-6", day_no: 1, sort_order: 6, name: "Dumbbell Kickback", increment_kg: 2.5, default_weight: 7.5, last_weight: 7.5 },
    { id: "ex-1-7", day_no: 1, sort_order: 7, name: "Şınav", virtual: true, note: "Antrenman sonu göğüs ve triceps bitiricisi (RPE 10 / Tükenişe kadar)", increment_kg: 0, last_weight: null },
    { id: "ex-1-8", day_no: 1, sort_order: 8, name: "Mekik (Crunch)", virtual: true, note: "3 set x 12-15 tekrar kontrollü tempo", increment_kg: 0, last_weight: null }
  ],
  2: [
    { id: "ex-2-1", day_no: 2, sort_order: 1, name: "Lat Pulldown", increment_kg: 2.5, default_weight: 45, last_weight: 45 },
    { id: "ex-2-2", day_no: 2, sort_order: 2, name: "Close Grip Pulldown", increment_kg: 2.5, default_weight: 40, last_weight: 40 },
    { id: "ex-2-3", day_no: 2, sort_order: 3, name: "Cable Row", increment_kg: 2.5, default_weight: 40, last_weight: 40 },
    { id: "ex-2-4", day_no: 2, sort_order: 4, name: "Lower Back Extension", increment_kg: 2.5, default_weight: 10, last_weight: 10 },
    { id: "ex-2-5", day_no: 2, sort_order: 5, name: "Barbell Curl", increment_kg: 2.5, default_weight: 20, last_weight: 20 },
    { id: "ex-2-6", day_no: 2, sort_order: 6, name: "Dumbbell Hammer Curl", increment_kg: 2.5, default_weight: 10, last_weight: 10 },
    { id: "ex-2-7", day_no: 2, sort_order: 7, name: "Asılı Diz Çekme (Hanging Knee Raise)", virtual: true, note: "3 set x 12-15 tekrar veya Crunch", increment_kg: 0, last_weight: null }
  ],
  3: [
    { id: "ex-3-1", day_no: 3, sort_order: 1, name: "Dumbbell Squat", increment_kg: 2.5, default_weight: 20, last_weight: 20 },
    { id: "ex-3-2", day_no: 3, sort_order: 2, name: "Dumbbell Lunges", increment_kg: 2.5, default_weight: 12.5, last_weight: 12.5 },
    { id: "ex-3-3", day_no: 3, sort_order: 3, name: "Leg Extension", increment_kg: 2.5, default_weight: 35, last_weight: 35 },
    { id: "ex-3-4", day_no: 3, sort_order: 4, name: "Leg Curl", increment_kg: 2.5, default_weight: 30, last_weight: 30 },
    { id: "ex-3-5", day_no: 3, sort_order: 5, name: "Adductor Machine", increment_kg: 2.5, default_weight: 35, last_weight: 35 },
    { id: "ex-3-6", day_no: 3, sort_order: 6, name: "Dumbbell Shoulder Press", increment_kg: 2.5, default_weight: 15, last_weight: 15 },
    { id: "ex-3-7", day_no: 3, sort_order: 7, name: "Dumbbell Lateral Raise", increment_kg: 2.5, default_weight: 7.5, last_weight: 7.5 },
    { id: "ex-3-8", day_no: 3, sort_order: 8, name: "Face Pull", increment_kg: 2.5, default_weight: 25, last_weight: 25 },
    { id: "ex-3-9", day_no: 3, sort_order: 9, name: "Shrugs", increment_kg: 2.5, default_weight: 20, last_weight: 20 }
  ]
};

function getDayExercises(dayNo, items) {
  const defaults = DEFAULT_EXERCISES[dayNo] || [];
  if (!items || items.length === 0) return defaults;

  // Map server items to default structure or fill missing properties
  return defaults.map((def, idx) => {
    const matched = items.find(it => 
      it.id === def.id || 
      it.name?.toLowerCase() === def.name?.toLowerCase() ||
      DISPLAY_NAMES[it.name]?.toLowerCase() === def.name?.toLowerCase()
    );
    if (matched) {
      return {
        ...def,
        last_weight: matched.last_weight ?? def.default_weight,
        previous_weight: matched.previous_weight,
        last_increase_at: matched.last_increase_at
      };
    }
    return def;
  });
}

// Single Exercise Row Component
function Exercise({ ex, index, expanded, onToggle, workoutId, reload, onNeedWorkout }) {
  const isBodyweight = ex.virtual === true;
  const isBarbell = /barbell/i.test(ex.name);
  const isDumbbell = /dumbbell/i.test(ex.name);
  const usesFixedStep = isBarbell || isDumbbell;
  const increment = usesFixedStep ? 2.5 : Number(ex.increment_kg || 2.5);

  const rawWeight = Number(ex.last_weight ?? ex.default_weight ?? 0);
  const initialKg = isDumbbell ? Math.max(0, Math.round(rawWeight / 2.5) * 2.5) : rawWeight;

  const [kg, setKg] = useState(initialKg);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyBusy, setHistoryBusy] = useState(false);

  useEffect(() => {
    const raw = Number(ex.last_weight ?? ex.default_weight ?? 0);
    setKg(isDumbbell ? Math.max(0, Math.round(raw / 2.5) * 2.5) : raw);
    setSaved(false);
    setHistoryOpen(false);
    setHistory([]);
  }, [ex.id, ex.last_weight, isDumbbell]);

  const pct = ex.previous_weight && ex.last_weight
    ? (((ex.last_weight - ex.previous_weight) / ex.previous_weight) * 100).toFixed(1)
    : null;

  const suggested = +(kg + increment).toFixed(2);

  const handleStep = (delta) => {
    const newWeight = Math.max(0, +(Number(kg) + delta).toFixed(2));
    const snapped = isDumbbell ? Math.max(0, Math.round(newWeight / 2.5) * 2.5) : newWeight;
    setKg(snapped);
    setSaved(false);
  };

  async function save() {
    if (isBodyweight) return;
    const saveKg = isDumbbell ? Math.max(0, Math.round(Number(kg) / 2.5) * 2.5) : kg;
    if (saveKg !== kg) setKg(saveKg);

    setBusy(true);
    let wid = workoutId;
    if (!wid) {
      wid = await onNeedWorkout();
    }
    if (!wid) {
      setBusy(false);
      return;
    }

    try {
      if (supabase) {
        await supabase.from("workout_sets").delete().eq("workout_id", wid).eq("exercise_id", ex.id);
        const reps = ex.last_reps?.length ? ex.last_reps : [12, 12, 12];
        const rows = reps.map((r, i) => ({
          user_id: ANON_USER_ID,
          workout_id: wid,
          exercise_id: ex.id,
          set_no: i + 1,
          weight_kg: saveKg,
          reps: r
        }));
        await supabase.from("workout_sets").insert(rows);
      }

      // Save to local storage cache
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("workout-local-data");
        const cache = stored ? JSON.parse(stored) : {};
        cache[ex.id] = {
          last_weight: saveKg,
          previous_weight: ex.last_weight || saveKg,
          updated_at: new Date().toISOString()
        };
        localStorage.setItem("workout-local-data", JSON.stringify(cache));

        // Save to local history
        const histKey = `history-${ex.id}`;
        const histRaw = localStorage.getItem(histKey);
        const histArr = histRaw ? JSON.parse(histRaw) : [];
        histArr.unshift({ workout_id: wid, weight_kg: saveKg, created_at: new Date().toISOString() });
        localStorage.setItem(histKey, JSON.stringify(histArr.slice(0, 10)));
      }

      setSaved(true);
      setHistory([]);
      await reload();
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setBusy(false);
    }
  }

  async function toggleHistory() {
    if (historyOpen) {
      setHistoryOpen(false);
      return;
    }
    setHistoryOpen(true);
    if (history.length) return;

    setHistoryBusy(true);
    try {
      if (supabase) {
        const q = await supabase
          .from("workout_sets")
          .select("workout_id,weight_kg,created_at")
          .eq("exercise_id", ex.id)
          .order("created_at", { ascending: false })
          .limit(36);

        if (!q.error && q.data && q.data.length > 0) {
          const seen = new Set();
          const rows = [];
          for (const r of q.data) {
            if (seen.has(r.workout_id)) continue;
            seen.add(r.workout_id);
            rows.push(r);
            if (rows.length === 6) break;
          }
          setHistory(rows);
          setHistoryBusy(false);
          return;
        }
      }

      // Fallback to local history
      if (typeof window !== "undefined") {
        const histKey = `history-${ex.id}`;
        const histRaw = localStorage.getItem(histKey);
        if (histRaw) {
          setHistory(JSON.parse(histRaw));
        }
      }
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setHistoryBusy(false);
    }
  }

  const displayName = DISPLAY_NAMES[ex.name] || ex.name;

  return (
    <article className={`exercise-row ${expanded ? "is-open" : ""} ${saved ? "is-completed" : ""}`}>
      <button className="exercise-summary" onClick={onToggle} aria-expanded={expanded}>
        <span className="exercise-index">{saved ? <Check size={16} /> : index + 1}</span>
        <div className="exercise-title-wrap">
          <h3 className="exercise-name">{displayName}</h3>
          <div className="exercise-meta-preview">
            {ex.previous_weight != null && (
              <span className="prev-tag">Önceki: {ex.previous_weight} kg</span>
            )}
            {pct > 0 && <span className="stat-tag progression">+{pct}%</span>}
          </div>
        </div>
        <div className="exercise-summary-right">
          <div className="weight-pill">
            {isBodyweight ? "Vücut Ağırlığı" : ex.last_weight != null ? `${ex.last_weight} kg` : "— kg"}
          </div>
          <ChevronDown className={`chevron-icon ${expanded ? "is-rotated" : ""}`} />
        </div>
      </button>

      {expanded && (
        <div className="exercise-detail">
          {isBodyweight ? (
            <div className="bodyweight-card">
              {ex.note ? (
                <span>{ex.note}</span>
              ) : (
                <span><strong>{displayName}</strong> setlerini kontrollü tempoda uygula. Bu harekette harici ağırlık kullanılmaz.</span>
              )}
            </div>
          ) : (
            <>
              <div className="detail-meta-bar">
                <span>
                  {ex.last_increase_at
                    ? `Son artış: ${new Date(ex.last_increase_at).toLocaleDateString("tr-TR")}`
                    : `Artış adımı: ${increment} kg`}
                </span>
                {saved ? (
                  <span className="stat-tag done"><Check size={12} /> Kaydedildi</span>
                ) : (
                  pct > 0 && <span className="stat-tag progression"><TrendingUp size={12} /> +%{pct}</span>
                )}
              </div>

              <div className="stepper-label-row">
                <span className="stepper-label">Hedef Ağırlık</span>
                <span className="stepper-target">Sonraki Kademe: <strong>{suggested} kg</strong></span>
              </div>

              {/* Big Stepper */}
              <div className="stepper-container">
                <button
                  className="stepper-btn"
                  onClick={() => handleStep(-increment)}
                  aria-label="Ağırlığı Azalt"
                >
                  <Minus size={22} />
                </button>
                <div className="stepper-display">
                  <span className="stepper-val">{kg}</span>
                  <span className="stepper-unit">kg</span>
                </div>
                <button
                  className="stepper-btn"
                  onClick={() => handleStep(increment)}
                  aria-label="Ağırlığı Artır"
                >
                  <Plus size={22} />
                </button>
              </div>

              {/* Quick Jump Buttons for Fast Adjustments */}
              <div className="quick-jump-row">
                <button className="jump-btn" onClick={() => handleStep(-5)}>-5 kg</button>
                <button className="jump-btn" onClick={() => handleStep(-2.5)}>-2.5 kg</button>
                <button className="jump-btn" onClick={() => handleStep(2.5)}>+2.5 kg</button>
                <button className="jump-btn" onClick={() => handleStep(5)}>+5 kg</button>
              </div>

              {/* History Toggle */}
              <div>
                <button className="history-toggle-btn" onClick={toggleHistory}>
                  <History size={15} />
                  {historyOpen ? "Geçmişi Gizle" : "Ağırlık Gelişim Geçmişi"}
                </button>
              </div>

              {historyOpen && (
                <div className="history-panel">
                  {historyBusy ? (
                    <div className="history-empty">Geçmiş veriler yükleniyor…</div>
                  ) : history.length ? (
                    history.map((r, i) => (
                      <div className="history-item" key={`${r.workout_id}-${i}`}>
                        <span className="history-date">
                          {new Date(r.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
                        </span>
                        <span className="history-val">{Number(r.weight_kg)} kg</span>
                      </div>
                    ))
                  ) : (
                    <div className="history-empty">Henüz geçmiş kayıt bulunmuyor.</div>
                  )}
                </div>
              )}

              {/* Save Button */}
              <button
                className={`save-action-btn ${saved ? "saved" : ""}`}
                onClick={save}
                disabled={busy}
              >
                {saved ? (
                  <>
                    <Check size={18} /> Kaydedildi & Güncellendi
                  </>
                ) : (
                  <>
                    <Zap size={18} /> {busy ? "Kaydediliyor…" : "Seti Kaydet"}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      )}
    </article>
  );
}

// Day Section Component
function DayView({ day, items, reload, activeWorkoutId, onStartWorkout, onFinishWorkout, startedAt }) {
  const [expanded, setExpanded] = useState(null);
  const visibleItems = getDayExercises(day.n, items);

  return (
    <section className="day-session-card">
      <div className="day-session-head">
        <div>
          <span className="day-info-eyebrow">GÜN {day.n} PROGRAMI</span>
          <h2 className="day-info-title">{day.t}</h2>
        </div>
        {activeWorkoutId ? (
          <button className="session-btn finish" onClick={() => onFinishWorkout(day.n)}>
            <Flag size={16} /> Bitir
          </button>
        ) : (
          <button className="session-btn start" onClick={() => onStartWorkout(day.n)}>
            <Play size={16} /> Başlat
          </button>
        )}
      </div>

      {activeWorkoutId && startedAt && (
        <div className="active-session-hud">
          <div className="hud-left">
            <span className="pulse-dot" />
            <span>Aktif Antrenman</span>
          </div>
          <div className="hud-timer">
            {new Date(startedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      )}

      <div className="exercise-list">
        {visibleItems.length > 0 ? (
          visibleItems.map((ex, i) => (
            <Exercise
              key={ex.id || `ex-${day.n}-${i}`}
              ex={ex}
              index={i}
              expanded={expanded === (ex.id || `ex-${day.n}-${i}`)}
              onToggle={() => setExpanded(expanded === (ex.id || `ex-${day.n}-${i}`) ? null : (ex.id || `ex-${day.n}-${i}`))}
              workoutId={activeWorkoutId}
              reload={reload}
              onNeedWorkout={() => onStartWorkout(day.n)}
            />
          ))
        ) : (
          <div className="history-empty">Bu gün için hareket tanımlanmamış.</div>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [daysData, setDaysData] = useState(DEFAULT_EXERCISES);
  const [activeWorkouts, setActiveWorkouts] = useState({});

  // Load active sessions from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const activeObj = {};
      DAYS.forEach(d => {
        const raw = localStorage.getItem(`active-workout-${d.n}`);
        if (raw) {
          try {
            activeObj[d.n] = JSON.parse(raw);
          } catch (e) {}
        }
      });
      setActiveWorkouts(activeObj);
    }
  }, []);

  async function load() {
    let loadedFromDb = false;

    if (supabase) {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Timeout")), 3000)
        );

        const fetchPromise = Promise.all(
          DAYS.map(d => supabase.rpc("get_exercises_with_last_session", { p_day_no: d.n, p_user_id: ANON_USER_ID }))
        );

        const rs = await Promise.race([fetchPromise, timeoutPromise]);
        
        const hasData = rs.some(r => r.data && r.data.length > 0);
        if (hasData) {
          const next = {};
          DAYS.forEach((d, i) => {
            next[d.n] = rs[i].error ? DEFAULT_EXERCISES[d.n] : (rs[i].data?.length ? rs[i].data : DEFAULT_EXERCISES[d.n]);
          });
          setDaysData(next);
          loadedFromDb = true;
        }
      } catch (e) {
        console.warn("Supabase load fallback:", e.message);
      }
    }

    if (!loadedFromDb && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("workout-local-data");
        if (stored) {
          const cache = JSON.parse(stored);
          const next = { ...DEFAULT_EXERCISES };
          DAYS.forEach(d => {
            next[d.n] = next[d.n].map(ex => {
              if (cache[ex.id]) {
                return {
                  ...ex,
                  last_weight: cache[ex.id].last_weight,
                  previous_weight: cache[ex.id].previous_weight,
                  last_increase_at: cache[ex.id].updated_at
                };
              }
              return ex;
            });
          });
          setDaysData(next);
        } else {
          setDaysData(DEFAULT_EXERCISES);
        }
      } catch (e) {
        setDaysData(DEFAULT_EXERCISES);
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function startWorkout(dayNo) {
    if (activeWorkouts[dayNo]?.id) return activeWorkouts[dayNo].id;
    const nowIso = new Date().toISOString();
    const fakeId = `local-workout-${Date.now()}`;

    if (supabase) {
      try {
        const w = await supabase
          .from("workouts")
          .insert({ user_id: ANON_USER_ID, workout_day: dayNo })
          .select("id,performed_at")
          .single();

        if (!w.error && w.data) {
          const data = { id: w.data.id, startedAt: w.data.performed_at };
          localStorage.setItem(`active-workout-${dayNo}`, JSON.stringify(data));
          setActiveWorkouts(prev => ({ ...prev, [dayNo]: data }));
          return w.data.id;
        }
      } catch (e) {
        console.warn("Supabase startWorkout error:", e);
      }
    }

    // Fallback local session
    const data = { id: fakeId, startedAt: nowIso };
    if (typeof window !== "undefined") {
      localStorage.setItem(`active-workout-${dayNo}`, JSON.stringify(data));
    }
    setActiveWorkouts(prev => ({ ...prev, [dayNo]: data }));
    return fakeId;
  }

  function finishWorkout(dayNo) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(`active-workout-${dayNo}`);
    }
    setActiveWorkouts(prev => {
      const copy = { ...prev };
      delete copy[dayNo];
      return copy;
    });
    load();
  }

  if (loading) {
    return (
      <main className="loading-center">
        <div className="loading-spinner" />
        <p>Antrenman programı yükleniyor…</p>
      </main>
    );
  }

  const activeDaySession = activeWorkouts[selectedDay];

  return (
    <main className="shell">
      {/* App Header */}
      <header className="app-header">
        <div>
          <div className="brand-badge">
            <span className="dot" />
            <span>ATHLETIC TRACKER</span>
          </div>
          <h1 className="app-title">Antrenman Takibi</h1>
          <p className="app-subtitle">İlerleyen yükleme ve güç kayıtların</p>
        </div>
      </header>

      {/* Day Segmented Tabs */}
      <nav className="day-tabs" role="tablist">
        {DAYS.map(d => {
          const hasActive = !!activeWorkouts[d.n];
          return (
            <button
              key={d.n}
              role="tab"
              aria-selected={selectedDay === d.n}
              className={`day-tab ${selectedDay === d.n ? "active" : ""} ${hasActive ? "has-active-session" : ""}`}
              onClick={() => setSelectedDay(d.n)}
            >
              <span className="tab-number">Gün {d.n}</span>
              <span className="tab-title">{d.short}</span>
            </button>
          );
        })}
      </nav>

      {/* Selected Day View */}
      <DayView
        day={DAYS.find(d => d.n === selectedDay) || DAYS[0]}
        items={daysData[selectedDay] || []}
        reload={load}
        activeWorkoutId={activeDaySession?.id}
        startedAt={activeDaySession?.startedAt}
        onStartWorkout={startWorkout}
        onFinishWorkout={finishWorkout}
      />
    </main>
  );
}




