"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Minus, Plus, Save, Dumbbell, LogOut, ChevronLeft, ChevronRight } from "lucide-react";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const DAYS=[{n:1,t:"Göğüs + Arka Kol"},{n:2,t:"Sırt + Ön Kol"},{n:3,t:"Omuz + Bacak"}];

function Stepper({value,step=1,onChange,suffix=""}){
  return <div className="stepper"><button onClick={()=>onChange(Math.max(0,+(value-step).toFixed(2)))}><Minus/></button><div><b>{value}</b><small>{suffix}</small></div><button onClick={()=>onChange(+(value+step).toFixed(2))}><Plus/></button></div>
}

function Login({done}){
 const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [signup,setSignup]=useState(false); const [msg,setMsg]=useState("");
 async function go(){setMsg(""); const r=signup?await supabase.auth.signUp({email,password}):await supabase.auth.signInWithPassword({email,password}); if(r.error)setMsg(r.error.message); else if(r.data.session)done(r.data.session); else setMsg("Hesap oluşturuldu. E-posta doğrulaması gerekiyorsa gelen kutunu kontrol et.");}
 return <main className="login"><section><div className="logo"><Dumbbell/></div><h1>Workout</h1><p>Ağırlıklarını ve gelişimini tek yerde tut.</p><input placeholder="E-posta" value={email} onChange={e=>setEmail(e.target.value)}/><input type="password" placeholder="Şifre" value={password} onChange={e=>setPassword(e.target.value)}/><button className="primary" onClick={go}>{signup?"Hesap Oluştur":"Giriş Yap"}</button><button className="link" onClick={()=>setSignup(!signup)}>{signup?"Zaten hesabım var":"İlk kullanım — hesap oluştur"}</button>{msg&&<p className="msg">{msg}</p>}</section></main>
}

function Exercise({ex,reload}){
 const [kg,setKg]=useState(Number(ex.last_weight??ex.default_weight??0)); const [reps,setReps]=useState(ex.last_reps?.length?ex.last_reps:[12,12,12]);
 useEffect(()=>{setKg(Number(ex.last_weight??ex.default_weight??0));setReps(ex.last_reps?.length?ex.last_reps:[12,12,12])},[ex.id,ex.last_weight]);
 async function save(){const {data:{user}}=await supabase.auth.getUser(); const w=await supabase.from("workouts").insert({user_id:user.id,workout_day:ex.day_no}).select("id").single(); if(w.error)return alert(w.error.message); const rows=reps.map((r,i)=>({user_id:user.id,workout_id:w.data.id,exercise_id:ex.id,set_no:i+1,weight_kg:kg,reps:r})); const q=await supabase.from("workout_sets").insert(rows); if(q.error)alert(q.error.message); else reload();}
 const pct=ex.previous_weight&&ex.last_weight?(((ex.last_weight-ex.previous_weight)/ex.previous_weight)*100).toFixed(1):null;
 return <article className="card"><div className="head"><div><h3>{ex.name}</h3><small>Artış adımı {ex.increment_kg} kg{ex.last_increase_at?` · Son artış ${new Date(ex.last_increase_at).toLocaleDateString("tr-TR")}`:""}</small></div>{pct>0&&<span className="badge">+%{pct}</span>}</div>{ex.last_weight!=null&&<div className="previous">Önceki: <b>{ex.last_weight} kg</b> · {(ex.last_reps||[]).join(" / ")}</div>}<label>Ağırlık</label><Stepper value={kg} step={Number(ex.increment_kg)} onChange={setKg} suffix="kg"/><label>Tekrarlar</label><div className="sets">{reps.map((r,i)=><div className="set" key={i}><span>Set {i+1}</span><Stepper value={r} onChange={v=>{let x=[...reps];x[i]=v;setReps(x)}}/></div>)}</div><button className="save" onClick={save}><Save/> Kaydet</button></article>
}

export default function Home(){
 const [session,setSession]=useState(null),[loading,setLoading]=useState(true),[day,setDay]=useState(1),[items,setItems]=useState([]);
 useEffect(()=>{supabase.auth.getSession().then(({data})=>{setSession(data.session);setLoading(false)});const {data}=supabase.auth.onAuthStateChange((_,s)=>setSession(s));return()=>data.subscription.unsubscribe()},[]);
 async function load(){if(!session)return;const r=await supabase.rpc("get_exercises_with_last_session",{p_day_no:day});if(!r.error)setItems(r.data||[])}
 useEffect(()=>{load()},[session,day]);
 if(loading)return <main className="center">Yükleniyor…</main>; if(!session)return <Login done={setSession}/>; const d=DAYS.find(x=>x.n===day);
 return <main className="shell"><header><div><small>WORKOUT TRACKER</small><h1>{d.t}</h1></div><button className="icon" onClick={()=>supabase.auth.signOut()}><LogOut/></button></header><nav><button onClick={()=>setDay(day===1?3:day-1)}><ChevronLeft/></button><div><b>Gün {day}</b><span>{d.t}</span></div><button onClick={()=>setDay(day===3?1:day+1)}><ChevronRight/></button></nav><div className="list">{items.map(x=><Exercise key={x.id} ex={x} reload={load}/>)}</div></main>
}
