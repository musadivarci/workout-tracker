"use client";

import { useEffect, useState, useCallback } from "react";
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
  Zap,
  RefreshCw,
  Cloud,
  CloudOff,
  AlertCircle
} from "lucide-react";

// Check for valid Supabase credentials
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const isSupabaseConfigured = Boolean(
  rawUrl && 
  !rawUrl.includes("YOUR_PROJECT") && 
  !rawUrl.includes("placeholder") && 
  rawKey && 
  !rawKey.includes("YOUR_ANON_KEY")
);

const supabase = isSupabaseConfigured 
  ? createClient(rawUrl, rawKey)
  : null;

const ANON_USER_ID = "00000000-0000-0000-0000-000000000001";

const DAYS = [
  { n: 1, t: "Göğüs + Arka Kol + Karın", short: "Göğüs & Kol" },
  { n: 2, t: "Sırt + Ön Kol + Karın", short: "Sırt & Kol" },
  { n: 3, t: "Bacak + Omuz + Karın", short: "Bacak & Omuz" }
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

  return defaults.map((def) => {
    const matched = items.find(it => 
      it.id === def.id || 
      it.name?.trim().toLowerCase() === def.name?.trim().toLowerCase() ||
      DISPLAY_NAMES[it.name]?.trim().toLowerCase() === def.name?.trim().toLowerCase() ||
      DISPLAY_NAMES[def.name]?.trim().toLowerCase() === it.name?.trim().toLowerCase()
    );
    if (matched) {
      return {
        ...def,
        id: matched.id || def.id,
        last_weight: matched.last_weight != null ? Number(matched.last_weight) : def.default_weight,
        previous_weight: matched.previous_weight != null ? Number(matched.previous_weight) : undefined,
        last_increase_at: matched.last_increase_at
      };
    }
    return def;
  });
}

// Single Exercise Row Component
function Exercise({ ex, index, expanded, onToggle, workoutId, reload, onNeedWorkout, isOnline }) {
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
        // 1. Ensure exercise exists with real UUID in Supabase
        let validExerciseId = ex.id;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ex.id);
        
        if (!isUuid) {
          const lookup = await supabase.from("exercises").select("id").ilike("name", ex.name).limit(1);
          if (lookup.data && lookup.data[0]?.id) {
            validExerciseId = lookup.data[0].id;
          } else {
            const insEx = await supabase.from("exercises").insert({
              day_no: ex.day_no || 1,
              sort_order: ex.sort_order || 1,
              name: ex.name,
              increment_kg: ex.increment_kg || 2.5,
              default_weight: ex.default_weight || 0
            }).select("id").single();
            if (insEx.data?.id) {
              validExerciseId = insEx.data.id;
            }
          }
        }

        // 2. Ensure workout_id is a valid UUID
        let validWorkoutId = wid;
        const isWorkoutUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(wid);
        if (!isWorkoutUuid) {
          const newWorkout = await supabase.from("workouts").insert({
            user_id: ANON_USER_ID,
            workout_day: ex.day_no || 1
          }).select("id").single();
          if (newWorkout.data?.id) {
            validWorkoutId = newWorkout.data.id;
          }
        }

        // 3. Save sets to Supabase
        const isReadyUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validExerciseId);
        const isReadyWorkout = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validWorkoutId);

        if (isReadyUuid && isReadyWorkout) {
          await supabase.from("workout_sets").delete().eq("workout_id", validWorkoutId).eq("exercise_id", validExerciseId);
          const reps = ex.last_reps?.length ? ex.last_reps : [12, 12, 12];
          const rows = reps.map((r, i) => ({
            user_id: ANON_USER_ID,
            workout_id: validWorkoutId,
            exercise_id: validExerciseId,
            set_no: i + 1,
            weight_kg: saveKg,
            reps: r
          }));
          const insertRes = await supabase.from("workout_sets").insert(rows);
          if (insertRes.error) {
            console.error("Supabase insert error:", insertRes.error);
            alert("Bulut Veritabanı Hatası: " + insertRes.error.message + "\n(Lütfen Supabase tablosunun açık olduğundan emin olun.)");
          }
        }
      }

      // Always update local cache for instant feedback & offline fallback
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("workout-local-data");
        const cache = stored ? JSON.parse(stored) : {};
        cache[ex.id] = {
          last_weight: saveKg,
          previous_weight: ex.last_weight || saveKg,
          updated_at: new Date().toISOString()
        };
        localStorage.setItem("workout-local-data", JSON.stringify(cache));

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
      alert("Kayıt hatası: " + (err.message || err));
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
        let targetId = ex.id;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ex.id);
        if (!isUuid) {
          const lookup = await supabase.from("exercises").select("id").ilike("name", ex.name).limit(1);
          if (lookup.data && lookup.data[0]?.id) {
            targetId = lookup.data[0].id;
          }
        }

        const q = await supabase
          .from("workout_sets")
          .select("workout_id,weight_kg,created_at")
          .eq("exercise_id", targetId)
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

              {/* Stepper Container */}
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

              {/* Quick Jump Buttons */}
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
                    <Check size={18} /> Kaydedildi & Senkronize Edildi
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
function DayView({ day, items, reload, activeWorkoutId, onStartWorkout, onFinishWorkout, startedAt, isOnline }) {
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
              isOnline={isOnline}
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
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [daysData, setDaysData] = useState(DEFAULT_EXERCISES);
  const [activeWorkouts, setActiveWorkouts] = useState({});
  const [dbStatus, setDbStatus] = useState("checking"); // checking | connected | offline | error
  const [dbErrorMsg, setDbErrorMsg] = useState("");
  const [showConfigModal, setShowConfigModal] = useState(false);

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

  const load = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    let loadedFromDb = false;

    if (supabase) {
      try {
        // Attempt 1: RPC get_exercises_with_last_session
        const fetchPromise = Promise.all(
          DAYS.map(d => supabase.rpc("get_exercises_with_last_session", { p_day_no: d.n, p_user_id: ANON_USER_ID }))
        );
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Supabase zaman aşımı (3.5s)")), 3500)
        );

        const rs = await Promise.race([fetchPromise, timeoutPromise]);
        const hasValidRpcData = rs.some(r => !r.error && r.data && r.data.length > 0);

        if (hasValidRpcData) {
          const next = {};
          DAYS.forEach((d, i) => {
            if (!rs[i].error && rs[i].data?.length > 0) {
              next[d.n] = rs[i].data;
            } else {
              next[d.n] = DEFAULT_EXERCISES[d.n];
            }
          });
          setDaysData(next);
          setDbStatus("connected");
          setDbErrorMsg("");
          loadedFromDb = true;
        } else {
          // Attempt 2: Direct query to exercises & workout_sets
          const { data: allExercises, error: exErr } = await supabase
            .from("exercises")
            .select("id,day_no,sort_order,name,increment_kg,default_weight,active")
            .eq("active", true)
            .order("sort_order");

          if (!exErr && allExercises && allExercises.length > 0) {
            const { data: sets } = await supabase
              .from("workout_sets")
              .select("exercise_id,weight_kg,created_at")
              .eq("user_id", ANON_USER_ID)
              .order("created_at", { ascending: false });

            const latestWeightMap = {};
            if (sets) {
              for (const s of sets) {
                if (latestWeightMap[s.exercise_id] === undefined) {
                  latestWeightMap[s.exercise_id] = {
                    last_weight: s.weight_kg,
                    last_increase_at: s.created_at
                  };
                }
              }
            }

            const next = {};
            DAYS.forEach(d => {
              const dayExs = allExercises
                .filter(e => e.day_no === d.n)
                .map(e => ({
                  ...e,
                  last_weight: latestWeightMap[e.id]?.last_weight ?? e.default_weight,
                  last_increase_at: latestWeightMap[e.id]?.last_increase_at
                }));
              next[d.n] = dayExs.length ? dayExs : DEFAULT_EXERCISES[d.n];
            });

            setDaysData(next);
            setDbStatus("connected");
            setDbErrorMsg("");
            loadedFromDb = true;
          } else if (exErr) {
            console.error("Supabase direct query error:", exErr);
            setDbStatus("error");
            setDbErrorMsg(exErr.message || "Veritabanı tablosuna ulaşılamadı.");
          }
        }
      } catch (e) {
        console.warn("Supabase fetch failed:", e.message);
        setDbStatus("error");
        setDbErrorMsg(e.message || "Bağlantı hatası.");
      }
    } else {
      setDbStatus("offline");
      setDbErrorMsg("Supabase anahtarları Vercel ortam değişkenlerinde tanımlı değil.");
    }

    // Offline / Local storage fallback only if DB could not be loaded
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
    if (isManualRefresh) setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
        <p>Antrenman programı ve bulut verileri yükleniyor…</p>
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

        <div className="header-actions">
          {/* Cloud Sync Status Indicator */}
          <button 
            className={`sync-status-badge ${dbStatus}`}
            onClick={() => setShowConfigModal(true)}
            title="Veritabanı Durumu ve Senkronizasyon"
          >
            {dbStatus === "connected" ? (
              <>
                <Cloud size={14} className="badge-icon ok" />
                <span className="badge-text">Bulut Canlı</span>
              </>
            ) : dbStatus === "offline" ? (
              <>
                <CloudOff size={14} className="badge-icon warn" />
                <span className="badge-text">Yerel Mod</span>
              </>
            ) : (
              <>
                <AlertCircle size={14} className="badge-icon error" />
                <span className="badge-text">Bağlantı Hatası</span>
              </>
            )}
          </button>

          {/* Quick Reload Button */}
          <button 
            className={`refresh-btn ${refreshing ? "is-spinning" : ""}`}
            onClick={() => load(true)}
            aria-label="Buluttan Verileri Yenile"
            title="Tüm cihazlardan son kayıtları çek"
          >
            <RefreshCw size={17} />
          </button>
        </div>
      </header>

      {/* Sync Warning Banner if offline or error */}
      {dbStatus !== "connected" && (
        <div className="sync-warning-banner" onClick={() => setShowConfigModal(true)}>
          <AlertCircle size={18} className="warn-icon" />
          <div className="warn-text">
            <strong>Cihazlar Arası Eşitleme Kapalı ({dbStatus === "offline" ? "Yerel Hafıza" : "Bağlantı Sorunu"})</strong>
            <span>Kayıtların tüm telefon ve bilgisayarlarında aynı görünmesi için dokun.</span>
          </div>
        </div>
      )}

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
        isOnline={dbStatus === "connected"}
      />

      {/* Cloud Status Modal */}
      {showConfigModal && (
        <div className="modal-backdrop" onClick={() => setShowConfigModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚡ Cihazlar Arası Canlı Eşitleme</h3>
              <button className="modal-close-btn" onClick={() => setShowConfigModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="status-box">
                <span className="status-label">Supabase Durumu:</span>
                <span className={`status-pill ${dbStatus}`}>
                  {dbStatus === "connected" && "🟢 Canlı & Senkronize (Tüm Cihazlar Eşit)"}
                  {dbStatus === "offline" && "🟡 Çevrimdışı / Yerel Hafıza (Sadece Bu Cihaz)"}
                  {dbStatus === "error" && "🔴 Hata / SQL Tablo Eksik"}
                </span>
              </div>

              {dbErrorMsg && (
                <div className="error-detail-box">
                  <strong>Detay:</strong> {dbErrorMsg}
                </div>
              )}

              <div className="modal-instructions">
                <h4>Farklı cihazlarda aynı değerlerin görünmesi için 2 adım:</h4>
                <ol>
                  <li>
                    <strong>Vercel Ortam Değişkenleri:</strong>
                    <p>Vercel panelinizde <code>Settings &gt; Environment Variables</code> kısmına şu iki anahtarı ekleyin ve ardından <code>Deployments &gt; Redeploy</code> yapın:</p>
                    <div className="code-block">
                      <code>NEXT_PUBLIC_SUPABASE_URL</code><br/>
                      <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
                    </div>
                  </li>
                  <li>
                    <strong>Supabase SQL Tablo Kurulumu:</strong>
                    <p>Supabase SQL Editor&apos;e girip <code>supabase/full_setup.sql</code> dosyasındaki kodları yapıştırıp <strong>RUN</strong> butonuna basın.</p>
                  </li>
                </ol>
              </div>

              <div className="modal-actions">
                <button className="btn-modal-primary" onClick={() => { setShowConfigModal(false); load(true); }}>
                  Yeniden Kontrol Et & Senkronize Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
