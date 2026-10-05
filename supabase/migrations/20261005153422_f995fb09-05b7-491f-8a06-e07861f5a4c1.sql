create type public.app_role as enum ('admin', 'user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create or replace function public.grant_owner_admin()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if lower(new.email) = 'ankushbhattacharya11@gmail.com' then
    insert into public.user_roles(user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_user_created_admin after insert on auth.users
for each row execute function public.grant_owner_admin();

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 255),
  intent text not null default 'Start a project' check (char_length(intent) <= 80),
  message text not null check (char_length(message) between 1 and 1000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;
create policy "anyone can send" on public.contact_messages for insert to anon, authenticated with check (true);
create policy "admin reads" on public.contact_messages for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin updates" on public.contact_messages for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin deletes" on public.contact_messages for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create table public.league_players (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  club text not null,
  created_at timestamptz not null default now()
);
create table public.league_matches (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.league_players(id) on delete cascade,
  away_id uuid not null references public.league_players(id) on delete cascade,
  home_goals int not null check (home_goals >= 0),
  away_goals int not null check (away_goals >= 0),
  scorers jsonb not null default '[]'::jsonb,
  raw_report text,
  played_at timestamptz not null default now()
);
grant select on public.league_players, public.league_matches to anon, authenticated;
grant insert, update, delete on public.league_players, public.league_matches to authenticated;
grant all on public.league_players, public.league_matches to service_role;
alter table public.league_players enable row level security;
alter table public.league_matches enable row level security;
create policy "public read players" on public.league_players for select to anon, authenticated using (true);
create policy "admin write players" on public.league_players for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "public read matches" on public.league_matches for select to anon, authenticated using (true);
create policy "admin write matches" on public.league_matches for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
alter publication supabase_realtime add table public.league_matches;

insert into public.league_players (name, club) values
 ('Ankush','Real Madrid'),('Rohit','Man City'),('Sayan','Barcelona'),('Arjun','Bayern');
insert into public.league_matches (home_id, away_id, home_goals, away_goals, scorers, raw_report)
select a.id, b.id, 3, 1, '[{"player":"Vinicius","side":"home","goals":2},{"player":"Bellingham","side":"home","goals":1},{"player":"Haaland","side":"away","goals":1}]'::jsonb, 'Ankush beat Rohit 3-1'
from public.league_players a, public.league_players b where a.name='Ankush' and b.name='Rohit';
insert into public.league_matches (home_id, away_id, home_goals, away_goals, scorers, raw_report)
select a.id, b.id, 2, 2, '[{"player":"Lewandowski","side":"home","goals":2},{"player":"Kane","side":"away","goals":2}]'::jsonb, 'Sayan drew 2-2 with Arjun'
from public.league_players a, public.league_players b where a.name='Sayan' and b.name='Arjun';