-- Imitação mínima do Supabase para testar (só no teste local)
do $$ begin if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; create role authenticated nologin; end if; end $$;
create schema auth; create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
create schema storage; create table storage.buckets (id text primary key, name text, public boolean);
create table storage.objects (id serial primary key, bucket_id text, name text); alter table storage.objects enable row level security;
grant usage on schema storage, public to anon, authenticated; grant select, insert, update, delete on storage.objects to authenticated; grant usage on sequence storage.objects_id_seq to authenticated;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'admin@ex.gov.br'); -- já existia antes da instalação
