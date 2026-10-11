#!/bin/bash
# Sobe PostgreSQL local + PostgREST imitando UM projeto Supabase com os DOIS sistemas (áreas cemiterio e patrimonio).
set -e
S=$(cd "$(dirname "$0")" && pwd)
D=/tmp/vitalpat-pg; BIN=$(ls -d /usr/lib/postgresql/*/bin)
if [ ! -d $D/data ]; then mkdir -p $D; chown postgres $D; su postgres -c "$BIN/initdb -D $D/data -A trust -U postgres" >/dev/null; fi
if ! su postgres -c "$BIN/pg_ctl -D $D/data status" >/dev/null 2>&1; then rm -f $D/data/postmaster.pid; su postgres -c "$BIN/pg_ctl -D $D/data -o '-p 5499 -k $D -c listen_addresses=127.0.0.1' -l $D/log start" >/dev/null; sleep 2; fi
pgrep -f 'postgrest/postgrest .*postgrest-unico.conf' | xargs -r kill; sleep 1
P="psql -h $D -p 5499 -U postgres -v ON_ERROR_STOP=1 -q"
psql -h $D -p 5499 -U postgres -qc "drop database if exists s_unico with (force)" -c "create database s_unico" 2>/dev/null
$P -d s_unico -f $S/stub-supabase.sql
$P -d s_unico -c "create or replace function auth.uid() returns uuid language sql stable as \$\$ select coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''), current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid \$\$;"
for prod in cemiterio patrimonio; do $P -d s_unico -f $(cd "$(dirname "$0")/.." && pwd)/$prod/banco/supabase-instalar.sql 2>&1 | grep -i error || true; done
$P -d s_unico <<SQL
do \$\$ begin if not exists (select 1 from pg_roles where rolname = 'autenticador') then create role autenticador login noinherit; end if; end \$\$;
grant anon, authenticated to autenticador;
insert into cemiterio.instalacao (produto, municipio, uf) values ('cemiterio', 'Cidade Exemplo', 'SC');
insert into patrimonio.instalacao (produto, municipio, uf) values ('patrimonio', 'Cidade Exemplo', 'SC');
insert into auth.users (id, email, raw_user_meta_data) values
 ('00000000-0000-0000-0000-0000000000b1', 'bia@ex.gov.br', '{"nome":"Bia Admin"}'),
 ('00000000-0000-0000-0000-0000000000c1', 'caio@ex.gov.br', '{"nome":"Caio Consulta"}'),
 ('00000000-0000-0000-0000-0000000000e1', 'eva@ex.gov.br', '{"nome":"Eva Nova"}'),
 ('00000000-0000-0000-0000-0000000000d1', 'davi@ex.gov.br', '{"nome":"Davi Campo"}');
update cemiterio.perfis set papel = 'admin', ativo = true where email = 'bia@ex.gov.br';
update cemiterio.perfis set papel = 'consulta', ativo = true where email = 'caio@ex.gov.br';
update cemiterio.perfis set papel = 'campo', ativo = true where email = 'davi@ex.gov.br';
update patrimonio.perfis set papel = 'admin', ativo = true where email = 'bia@ex.gov.br';
update patrimonio.perfis set papel = 'consulta', ativo = true where email = 'caio@ex.gov.br';
update patrimonio.perfis set papel = 'campo', ativo = true where email = 'davi@ex.gov.br';
SQL
cat > $S/postgrest-unico.conf <<CONF
db-uri = "postgres://autenticador@127.0.0.1:5499/s_unico"
db-schemas = "cemiterio,patrimonio"
db-anon-role = "anon"
jwt-secret = "segredo-de-teste-local-com-32-caracteres-ou-mais"
server-port = 3001
db-max-rows = 1000
CONF
nohup $S/postgrest/postgrest $S/postgrest-unico.conf > $S/postgrest-unico.log 2>&1 &
sleep 2; curl -s -o /dev/null -w "PostgREST (1 projeto, 2 sistemas): %{http_code}\n" http://127.0.0.1:3001/
