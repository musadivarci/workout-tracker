"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Minus, Plus, Save, Dumbbell, LogOut, ChevronDown, Check, Play, Flag, TrendingUp } from "lucide-react";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const DAYS=[{n:1,t:"Göğüs + Arka Kol"},{n:2,t:"Sırt + Ön Kol"},{n:3,t:"Omuz + Bacak"}];

function Stepper({value,step=1,onChange,suffix=""}){
  return <div className="stepper"><button onClick={()=>onChange(Math.max(0,+(Number(value)-step).toFixed(2)))}><Minus/></button><div><b>{value}</b><small>{suffix}</small></div><button onClick={()=>onChange(+(Number(value)+step).toFixed(2))}><Plus/></button></div>
}

function Login({done}){
 const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [signup,setSignup]=useState(false); const [msg,setMsg]=useState("");
 async function go(){setMsg(""); const r=signup?await supabase.auth.signUp({email,password}):await supabase.auth.signInWithPassword({email,password}); if(r.error)setMsg(r.error.message); else if(r.data.session)done(r.data.session); else setMsg("Hesap oluşturuldu. E-posta doğrulaması gerekiyorsa gelen kutunu kontrol et.");}
 return <main className="login"><section><div className="logo"><Dumbbell/></div><h1>Workout</h1><p>Ağırlıklarını ve gelişimini tek yerde tut.</p><input placeholder="E-posta" value={email} onChange={e=>setEmail(e.target.value)}/><input type="password" placeholder="Şifre" value={password} onChange={e=>setPassword(e.target.value)}/><button className="primary" onClick={go}>{signup?"Hesap Oluştur":"Giriş Yap"}</button><button className="link" onClick={()=>setSignup(!signup)}>{signup?"Zaten hesabım var":"İlk kullanım — hesap oluştur"}</button>{msg&&<p className="msg">{msg}</p>}</section></main>
}

function Exercise({ex,expanded,onToggle,workoutId,reload,onNeedWorkout}){
 const [kg,setKg]=useState(Number(ex.last_weight??ex.default_weight??0));
 const [saved,setSaved]=useState(false); const [busy,setBusy]=useState(false);
 useEffect(()=>{setKg(Number(ex.last_weight??ex.default_weight??0));setSaved(false)},[ex.id,ex.last_weight]);
 const pct=ex.previous_weight&&ex.last_weight?(((ex.last_weight-ex.previous_weight)/ex.previous_weight)*100).toFixed(1):null;
 const suggested=+(kg+Number(ex.increment_kg||0)).toFixed(2);
 async function save(){setBusy(true);let wid=workoutId;if(!wid)wid=await onNeedWorkout();if(!wid){setBusy(false);return;}const {data:{user}}=await supabase.auth.getUser();await supabase.from("workout_sets").delete().eq("workout_id",wid).eq("exercise_id",ex.id);const reps=(ex.last_reps?.length?ex.last_reps:[12,12,12]);const rows=reps.map((r,i)=>({user_id:user.id,workout_id:wid,exercise_id:ex.id,set_no:i+1,weight_kg:kg,reps:r})); const q=await supabase.from("workout_sets").insert(rows); if(q.error)alert(q.error.message); else {setSaved(true);await reload();} setBusy(false);}
 return <article className={`exercise-row ${expanded?"open":""} ${saved?"saved-row":""}`}>
   <button className="exercise-summary" onClick={onToggle}>
     <div><h3>{ex.name}</h3></div>
     <div className="summary-right"><b>{ex.last_weight!=null?`${ex.last_weight} kg`:"— kg"}</b><ChevronDown className={expanded?"rotated":""}/></div>
   </button>
   {expanded&&<div className="exercise-detail">
     <div className="meta-line"><span>{ex.last_increase_at?`Son artış · ${new Date(ex.last_increase_at).toLocaleDateString("tr-TR")}`:`Artış adımı · ${ex.increment_kg} kg`}</span>{saved?<span className="done"><Check/> Kaydedildi</span>:pct>0&&<span className="badge"><TrendingUp/> +%{pct}</span>}</div>
     <label>Çalışma ağırlığı</label><Stepper value={kg} step={Number(ex.increment_kg)} onChange={v=>{setKg(v);setSaved(false)}} suffix="kg"/>
     <div className="microcopy">Sonraki artış hedefi <b>{suggested} kg</b></div>
     <button className={`save ${saved?"saved-btn":""}`} onClick={save} disabled={busy}>{saved?<><Check/> Güncelle</>:<><Save/> {busy?"Kaydediliyor…":"Ağırlığı Kaydet"}</>}</button>
   </div>}
 </article>
}

function DayCard({day,items,reload}){
 const [expanded,setExpanded]=useState(null); const [workoutId,setWorkoutId]=useState(null); const [startedAt,setStartedAt]=useState(null);
 useEffect(()=>{const raw=typeof window!=="undefined"?localStorage.getItem(`active-workout-${day.n}`):null;if(raw){try{const x=JSON.parse(raw);setWorkoutId(x.id);setStartedAt(x.startedAt)}catch{}}},[day.n]);
 async function ensureWorkout(){if(workoutId)return workoutId;const {data:{user}}=await supabase.auth.getUser();const w=await supabase.from("workouts").insert({user_id:user.id,workout_day:day.n}).select("id,performed_at").single();if(w.error){alert(w.error.message);return null;}setWorkoutId(w.data.id);setStartedAt(w.data.performed_at);localStorage.setItem(`active-workout-${day.n}`,JSON.stringify({id:w.data.id,startedAt:w.data.performed_at}));return w.data.id;}
 function finishWorkout(){localStorage.removeItem(`active-workout-${day.n}`);setWorkoutId(null);setStartedAt(null);setExpanded(null);reload();}
 return <section className="day-card">
   <div className="day-head"><div><small>GÜN {day.n}</small><h2>{day.t}</h2></div>{workoutId?<button className="session-action finish" onClick={finishWorkout}><Flag/> Bitir</button>:<button className="session-action" onClick={ensureWorkout}><Play/> Başlat</button>}</div>
   {workoutId&&<div className="active-note">Aktif antrenman · {new Date(startedAt).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}</div>}
   <div className="exercise-overview">{items.map(ex=><Exercise key={ex.id} ex={ex} expanded={expanded===ex.id} onToggle={()=>setExpanded(expanded===ex.id?null:ex.id)} workoutId={workoutId} reload={reload} onNeedWorkout={ensureWorkout}/>)}</div>
 </section>
}

export default function Home(){
 const [session,setSession]=useState(null),[loading,setLoading]=useState(true),[daysData,setDaysData]=useState({1:[],2:[],3:[]});
 useEffect(()=>{supabase.auth.getSession().then(({data})=>{setSession(data.session);setLoading(false)});const {data}=supabase.auth.onAuthStateChange((_,s)=>setSession(s));return()=>data.subscription.unsubscribe()},[]);
 async function load(){if(!session)return;const rs=await Promise.all(DAYS.map(d=>supabase.rpc("get_exercises_with_last_session",{p_day_no:d.n})));const next={};DAYS.forEach((d,i)=>next[d.n]=rs[i].error?[]:(rs[i].data||[]));setDaysData(next)}
 useEffect(()=>{load()},[session]);
 if(loading)return <main className="center">Yükleniyor…</main>; if(!session)return <Login done={setSession}/>;
 return <main className="shell"><header><div><small>WORKOUT TRACKER</small><h1>Programım</h1></div><button className="icon" onClick={()=>supabase.auth.signOut()}><LogOut/></button></header><p className="intro">Bugünkü gücün, dünkü kaydın üzerine kurulur.</p><div className="days-list">{DAYS.map(d=><DayCard key={d.n} day={d} items={daysData[d.n]} reload={load}/>)}</div></main>
}
