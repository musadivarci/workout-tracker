-- 1. Eklentileri etkinleştir
create extension if not exists pgcrypto;

-- 2. Tabloları oluştur
create table if not exists exercises(
  id uuid primary key default gen_random_uuid(),
  day_no int not null,
  sort_order int not null,
  name text not null,
  increment_kg numeric(6,2) default 2.5,
  default_weight numeric(6,2) default 0,
  active boolean default true
);

create table if not exists workouts(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000001',
  workout_day int not null,
  performed_at timestamptz default now()
);

create table if not exists workout_sets(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default '00000000-0000-0000-0000-000000000001',
  workout_id uuid not null references workouts(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete cascade,
  set_no int not null,
  weight_kg numeric(6,2) default 0,
  reps int default 0,
  created_at timestamptz default now()
);

-- 3. RLS'i devre dışı bırak (anonim doğrudan erişim için)
alter table workouts disable row level security;
alter table workout_sets disable row level security;
alter table exercises disable row level security;

-- 4. FK kısıtlamalarını temizle (auth.users bağımlılığını kaldır)
alter table workouts drop constraint if exists workouts_user_id_fkey;
alter table workout_sets drop constraint if exists workout_sets_user_id_fkey;

-- 5. Güncel 3 Günlük Egzersiz Listesini Sıfırla ve Ekle
truncate table exercises cascade;

insert into exercises(day_no, sort_order, name, increment_kg, default_weight) values
-- GÜN 1: Göğüs + Arka Kol + Karın
(1, 1, 'Dumbbell Bench Press', 2.5, 20),
(1, 2, 'Incline Barbell Bench Press', 2.5, 35),
(1, 3, 'Smith Machine Dips', 2.5, 0),
(1, 4, 'Pectoral Fly', 2.5, 30),
(1, 5, 'Cable Pushdown', 2.5, 25),
(1, 6, 'Dumbbell Kickback', 2.5, 7.5),
(1, 7, 'Şınav', 0, 0),
(1, 8, 'Mekik (Crunch)', 0, 0),

-- GÜN 2: Sırt + Ön Kol + Karın
(2, 1, 'Lat Pulldown', 2.5, 45),
(2, 2, 'Close Grip Pulldown', 2.5, 40),
(2, 3, 'Cable Row', 2.5, 40),
(2, 4, 'Lower Back Extension', 2.5, 10),
(2, 5, 'Barbell Curl', 2.5, 20),
(2, 6, 'Dumbbell Hammer Curl', 2.5, 10),
(2, 7, 'Asılı Diz Çekme (Hanging Knee Raise)', 0, 0),

-- GÜN 3: Bacak + Omuz + Karın
(3, 1, 'Dumbbell Squat', 2.5, 20),
(3, 2, 'Dumbbell Lunges', 2.5, 12.5),
(3, 3, 'Leg Extension', 2.5, 35),
(3, 4, 'Leg Curl', 2.5, 30),
(3, 5, 'Adductor Machine', 2.5, 35),
(3, 6, 'Dumbbell Shoulder Press', 2.5, 15),
(3, 7, 'Dumbbell Lateral Raise', 2.5, 7.5),
(3, 8, 'Face Pull', 2.5, 25),
(3, 9, 'Shrugs', 2.5, 20);

-- 6. get_exercises_with_last_session Fonksiyonunu Güncelle
create or replace function get_exercises_with_last_session(
  p_day_no int, 
  p_user_id uuid default '00000000-0000-0000-0000-000000000001'
)
returns table(
  id uuid,
  day_no int,
  sort_order int,
  name text,
  increment_kg numeric,
  default_weight numeric,
  last_weight numeric,
  last_reps int[],
  previous_weight numeric,
  last_increase_at timestamptz
)
language sql security invoker as $$
with s as (
  select ws.exercise_id, w.id wid, w.performed_at,
    max(ws.weight_kg) weight,
    array_agg(ws.reps order by ws.set_no) reps,
    dense_rank() over(partition by ws.exercise_id order by w.performed_at desc) rk
  from workout_sets ws
  join workouts w on w.id=ws.workout_id
  where w.user_id=p_user_id
  group by ws.exercise_id, w.id, w.performed_at
),
lt as (
  select exercise_id,
    max(weight) filter(where rk=1) last_weight,
    max(reps) filter(where rk=1) last_reps,
    max(weight) filter(where rk=2) previous_weight
  from s where rk<=2 group by exercise_id
),
inc as (
  select exercise_id, max(performed_at) last_increase_at
  from (
    select exercise_id, performed_at, weight,
      lag(weight) over(partition by exercise_id order by performed_at) prev
    from s
  ) x where weight > prev group by exercise_id
)
select 
  e.id,
  e.day_no,
  e.sort_order,
  e.name,
  e.increment_kg,
  e.default_weight,
  lt.last_weight,
  lt.last_reps,
  lt.previous_weight,
  inc.last_increase_at
from exercises e
left join lt on lt.exercise_id=e.id
left join inc on inc.exercise_id=e.id
where e.day_no=p_day_no and e.active=true
order by e.sort_order;
$$;
