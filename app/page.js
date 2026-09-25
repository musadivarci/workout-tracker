"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ShieldCheck
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
  "Pectoral Fly": "Dumbbell Fly"
};

// Exact 3-day program template (used to match ordering & meta)
const DEFAULT_EXERCISES = {
  1: [
    { id: "ex-1-1", day_no: 1, sort_order: 1, name: "Dumbbell Bench Press", increment_kg: 2.5, default_weight: 20 },
    { id: "ex-1-2", day_no: 1, sort_order: 2, name: "Incline Barbell Bench Press", increment_kg: 2.5, default_weight: 35 },
    { id: "ex-1-3", day_no: 1, sort_order: 3, name: "Smith Machine Dips", increment_kg: 2.5, default_weight: 0 },
    { id: "ex-1-4", day_no: 1, sort_order: 4, name: "Dumbbell Fly", increment_kg: 2.5, default_weight: 12.5 },
    { id: "ex-1-5", day_no: 1, sort_order: 5, name: "Cable Pushdown", increment_kg: 2.5, default_weight: 25 },
    { id: "ex-1-6", day_no: 1, sort_order: 6, name: "Dumbbell Kickback", increment_kg: 2.5, default_weight: 7.5 },
    { id: "ex-1-7", day_no: 1, sort_order: 7, name: "Şınav", virtual: true, note: "Antrenman sonu göğüs ve triceps bitiricisi (RPE 10 / Tükenişe kadar)", increment_kg: 0, last_weight: null },
    { id: "ex-1-8", day_no: 1, sort_order: 8, name: "Mekik (Crunch)", virtual: true, note: "3 set x 12-15 tekrar kontrollü tempo", increment_kg: 0, last_weight: null }
  ],
  2: [
    { id: "ex-2-1", day_no: 2, sort_order: 1, name: "Lat Pulldown", increment_kg: 2.5, default_weight: 45 },
    { id: "ex-2-2", day_no: 2, sort_order: 2, name: "Close Grip Pulldown", increment_kg: 2.5, default_weight: 40 },
    { id: "ex-2-3", day_no: 2, sort_order: 3, name: "Cable Row", increment_kg: 2.5, default_weight: 40 },
    { id: "ex-2-4", day_no: 2, sort_order: 4, name: "Lower Back Extension", increment_kg: 2.5, default_weight: 10 },
    { id: "ex-2-5", day_no: 2, sort_order: 5, name: "Barbell Curl", increment_kg: 2.5, default_weight: 20 },
    { id: "ex-2-6", day_no: 2, sort_order: 6, name: "Dumbbell Hammer Curl", increment_kg: 2.5, default_weight: 10 },
    { id: "ex-2-7", day_no: 2, sort_order: 7, name: "Asılı Diz Çekme (Hanging Knee Raise)", virtual: true, note: "3 set x 12-15 tekrar veya Crunch", increment_kg: 0, last_weight: null }
  ],
  3: [
    { id: "ex-3-1", day_no: 3, sort_order: 1, name: "Dumbbell Squat", increment_kg: 2.5, default_weight: 20 },
    { id: "ex-3-2", day_no: 3, sort_order: 2, name: "Dumbbell Lunges", increment_kg: 2.5, default_weight: 12.5 },
    { id: "ex-3-3", day_no: 3, sort_order: 3, name: "Leg Extension", increment_kg: 2.5, default_weight: 35 },
    { id: "ex-3-4", day_no: 3, sort_order: 4, name: "Leg Curl", increment_kg: 2.5, default_weight: 30 },
    { id: "ex-3-5", day_no: 3, sort_order: 5, name: "Adductor Machine", increment_kg: 2.5, default_weight: 35 },
    { id: "ex-3-6", day_no: 3, sort_order: 6, name: "Dumbbell Shoulder Press", increment_kg: 2.5, default_weight: 15 },
    { id: "ex-3-7", day_no: 3, sort_order: 7, name: "Dumbbell Lateral Raise", increment_kg: 2.5, default_weight: 7.5 },
    { id: "ex-3-8", day_no: 3, sort_order: 8, name: "Face Pull", increment_kg: 2.5, default_weight: 25 },
    { id: "ex-3-9", day_no: 3, sort_order: 9, name: "Shrugs", increment_kg: 2.5, default_weight: 20 }
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
    if (!supabase) {
      alert("❌ Veritabanı bağlantısı yok! Lütfen Vercel Supabase ayarlarını yapın.");
      return;
    }

    const saveKg = isDumbbell ? Math.max(0, Math.round(Number(kg) / 2.5) * 2.5) : kg;
    if (saveKg !== kg) setKg(saveKg);

    setBusy(true);

    try {
      let wid = workoutId;
      if (!wid) {
        wid = await onNeedWorkout();
      }
      if (!wid) {
        throw new Error("Antrenman başlatılamadı. Veritabanına ulaşılamıyor.");
      }

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
          } else {
            throw new Error("Egzersiz veritabanında bulunamadı: " + (insEx.error?.message || ""));
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
        } else {
          throw new Error("Antrenman oturumu oluşturulamadı: " + (newWorkout.error?.message || ""));
        }
      }

      // 3. Save sets strictly to Supabase (NO localStorage)
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
        throw new Error(insertRes.error.message);
      }

      setSaved(true);
      setHistory([]);
      await reload();
    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Kayıt Veritabanına İletilemedi!\n" + (err.message || err));
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

    if (!supabase) return;

    setHistoryBusy(true);
    try {
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
                  <span className="stat-tag done"><Check size={12} /> Buluta Kaydedildi</span>
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
                    <div className="history-empty">Buluttan geçmiş kayıtlar çekiliyor…</div>
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
                    <Check size={18} /> Kaydedildi (Bulut Senkron)
                  </>
                ) : (
                  <>
                    <Zap size={18} /> {busy ? "Buluta Kaydediliyor…" : "Seti Kaydet"}
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
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [daysData, setDaysData] = useState({});
  const [activeWorkouts, setActiveWorkouts] = useState({});
  const [dbState, setDbState] = useState({
    status: "checking", // checking | connected | error | not_configured
    error: ""
  });
  const [retryCountdown, setRetryCountdown] = useState(10);
  const timerRef = useRef(null);

  // Background keep-alive ping on launch
  useEffect(() => {
    fetch("/api/keepalive").catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setDbState({
        status: "not_configured",
        error: "Vercel ortam değişkenlerinde NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlanmamış."
      });
      setLoading(false);
      return;
    }

    try {
      // 1. Try RPC get_exercises_with_last_session
      const fetchPromise = Promise.all(
        DAYS.map(d => supabase.rpc("get_exercises_with_last_session", { p_day_no: d.n, p_user_id: ANON_USER_ID }))
      );
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Veritabanı yanıt vermedi (Proje uykuda olabilir).")), 4500)
      );

      const rs = await Promise.race([fetchPromise, timeoutPromise]);
      const hasValidRpcData = rs.some(r => !r.error && r.data && r.data.length > 0);

      if (hasValidRpcData) {
        const next = {};
        DAYS.forEach((d, i) => {
          next[d.n] = (!rs[i].error && rs[i].data?.length > 0) ? rs[i].data : DEFAULT_EXERCISES[d.n];
        });
        setDaysData(next);
        setDbState({ status: "connected", error: "" });
        setLoading(false);
        return;
      }

      // 2. Direct fallback to exercises table
      const { data: allExercises, error: exErr } = await supabase
        .from("exercises")
        .select("id,day_no,sort_order,name,increment_kg,default_weight,active")
        .eq("active", true)
        .order("sort_order");

      if (exErr) {
        throw new Error(exErr.message || "exercises tablosuna erişilemedi.");
      }

      if (allExercises && allExercises.length > 0) {
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
        setDbState({ status: "connected", error: "" });
        setLoading(false);
        return;
      }

      // If empty table, try to auto-seed
      throw new Error("Veritabanında egzersiz tablosu boş. Lütfen SQL Editor'den full_setup.sql çalıştırın.");

    } catch (err) {
      console.error("Database connection error:", err);
      setDbState({
        status: "error",
        error: err.message || "Veritabanı bağlantı hatası."
      });
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-retry countdown when DB has error
  useEffect(() => {
    if (dbState.status === "error") {
      setRetryCountdown(8);
      timerRef.current = setInterval(() => {
        setRetryCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            loadData();
            return 8;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [dbState.status, loadData]);

  async function startWorkout(dayNo) {
    if (activeWorkouts[dayNo]?.id) return activeWorkouts[dayNo].id;
    if (!supabase) return null;

    try {
      const w = await supabase
        .from("workouts")
        .insert({ user_id: ANON_USER_ID, workout_day: dayNo })
        .select("id,performed_at")
        .single();

      if (!w.error && w.data) {
        const data = { id: w.data.id, startedAt: w.data.performed_at };
        setActiveWorkouts(prev => ({ ...prev, [dayNo]: data }));
        return w.data.id;
      }
    } catch (e) {
      console.warn("startWorkout error:", e);
    }
    return null;
  }

  function finishWorkout(dayNo) {
    setActiveWorkouts(prev => {
      const copy = { ...prev };
      delete copy[dayNo];
      return copy;
    });
    loadData();
  }

  // 1. Initial Loading Screen
  if (loading) {
    return (
      <main className="loading-center">
        <div className="loading-spinner" />
        <p className="loading-text">Veritabanına bağlanılıyor ve canlı veriler çekiliyor…</p>
        <span className="loading-subtext">Cihazlar arası eşitlik için doğrudan bulut sorgulanıyor.</span>
      </main>
    );
  }

  // 2. DATABASE ERROR / PAUSED SCREEN (No LocalStorage fallback)
  if (dbState.status === "error" || dbState.status === "not_configured") {
    return (
      <main className="db-offline-screen">
        <div className="db-offline-card">
          <div className="offline-icon-wrap">
            <AlertTriangle size={36} className="offline-icon" />
          </div>

          <h2 className="offline-title">
            {dbState.status === "not_configured" 
              ? "Veritabanı Ayarları Eksik" 
              : "Veritabanı Bağlantısı Bekleniyor"}
          </h2>

          <p className="offline-desc">
            {dbState.status === "not_configured"
              ? "Vercel üzerinde NEXT_PUBLIC_SUPABASE_URL ve ANON_KEY değişkenleri tanımlanmamış."
              : "Supabase veritabanı uykuda (Paused) olabilir veya uyanıyor. Veri kaybını ve cihazlar arası tutarsızlığı önlemek için yerel kayıt devre dışı bırakılmıştır."}
          </p>

          {dbState.error && (
            <div className="offline-error-box">
              <code>{dbState.error}</code>
            </div>
          )}

          <div className="offline-auto-retry">
            <span className="pulse-dot warn" />
            <span><strong>{retryCountdown}</strong> saniye sonra otomatik tekrar denenecek…</span>
          </div>

          <div className="offline-actions">
            <button 
              className="btn-retry" 
              onClick={() => { setLoading(true); loadData(); }}
            >
              <RotateCcw size={17} /> Şimdi Tekrar Dene
            </button>

            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-supabase-link"
            >
              <ExternalLink size={16} /> Supabase Konsoluna Git (Resume Project)
            </a>
          </div>

          <div className="offline-guarantee">
            <ShieldCheck size={16} />
            <span>Tüm antrenman verileriniz yalnızca merkezi bulutta tutulur.</span>
          </div>
        </div>
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
          {/* Cloud Live Status */}
          <div className="sync-status-badge connected" title="Tüm cihazlar Supabase veritabanı ile canlı eşleşiyor">
            <Cloud size={14} className="badge-icon ok" />
            <span className="badge-text">Bulut Canlı</span>
          </div>

          {/* Quick Reload Button */}
          <button 
            className={`refresh-btn ${refreshing ? "is-spinning" : ""}`}
            onClick={async () => {
              setRefreshing(true);
              await loadData();
              setRefreshing(false);
            }}
            aria-label="Buluttan Verileri Yenile"
            title="Diğer cihazlardan gelen son kayıtları çek"
          >
            <RefreshCw size={17} />
          </button>
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
        reload={loadData}
        activeWorkoutId={activeDaySession?.id}
        startedAt={activeDaySession?.startedAt}
        onStartWorkout={startWorkout}
        onFinishWorkout={finishWorkout}
      />
    </main>
  );
}
