-- 1. RLS'i kapat
alter table workouts disable row level security;
alter table workout_sets disable row level security;
alter table exercises disable row level security;

-- 2. Mevcut politikaları sil
drop policy if exists "own workouts" on workouts;
drop policy if exists "own sets" on workout_sets;
drop policy if exists "read exercises" on exercises;

-- 3. workouts.user_id ve workout_sets.user_id FK'sini auth.users'dan ayır
alter table workouts drop constraint if exists workouts_user_id_fkey;
alter table workout_sets drop constraint if exists workout_sets_user_id_fkey;

-- 4. Sabit anonim kullanıcı UUID'si ekle (FK yoksa direkt insert çalışır)
-- ANON_USER_ID = 00000000-0000-0000-0000-000000000001

-- 5. get_exercises_with_last_session fonksiyonunu user_id parametresiyle güncelle
create or replace function get_exercises_with_last_session(p_day_no int, p_user_id uuid default '00000000-0000-0000-0000-000000000001')
returns table(id uuid,day_no int,sort_order int,name text,increment_kg numeric,default_weight numeric,last_weight numeric,last_reps int[],previous_weight numeric,last_increase_at timestamptz)
language sql security invoker as $$
with s as(
  select ws.exercise_id,w.id wid,w.performed_at,
    max(ws.weight_kg) weight,
    array_agg(ws.reps order by ws.set_no) reps,
    dense_rank() over(partition by ws.exercise_id order by w.performed_at desc) rk
  from workout_sets ws
  join workouts w on w.id=ws.workout_id
  where w.user_id=p_user_id
  group by ws.exercise_id,w.id,w.performed_at
),
lt as(
  select exercise_id,
    max(weight) filter(where rk=1) last_weight,
    max(reps) filter(where rk=1) last_reps,
    max(weight) filter(where rk=2) previous_weight
  from s where rk<=2 group by exercise_id
),
inc as(
  select exercise_id,max(performed_at) last_increase_at
  from(
    select exercise_id,performed_at,weight,
      lag(weight) over(partition by exercise_id order by performed_at) prev
    from s
  )x where weight>prev group by exercise_id
)
select e.id,e.day_no,e.sort_order,e.name,e.increment_kg,e.default_weight,
  lt.last_weight,lt.last_reps,lt.previous_weight,inc.last_increase_at
from exercises e
left join lt on lt.exercise_id=e.id
left join inc on inc.exercise_id=e.id
where e.day_no=p_day_no and e.active=true
order by e.sort_order;
$$;
