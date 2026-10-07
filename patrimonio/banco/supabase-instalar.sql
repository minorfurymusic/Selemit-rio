-- VitalPat Patrimônio — instalação do banco no Supabase
-- Pode ficar num projeto Supabase só dele ou no mesmo projeto do cemitério (cada sistema na sua área, sem misturar).
-- Como usar: Supabase → SQL Editor → colar este arquivo inteiro → Run. Pode rodar de novo sem estragar nada.
--
-- Regras que o banco garante sozinho:
--   * Sem login, ninguém lê nem grava nada.
--   * Ninguém apaga registro (nem o administrador pelo sistema): "excluir" = marcar como Lixeira.
--   * Toda gravação guarda a versão anterior no histórico, que não pode ser alterado nem apagado.
--   * Este banco só aceita o sistema do patrimônio (tabela "instalacao").

-- Área própria "patrimonio" dentro do projeto: o mesmo projeto pode guardar também o outro sistema (área "cemiterio")
-- sem misturar nada. Depois de rodar, libere a área em Project Settings → Data API → Exposed schemas.
create schema if not exists patrimonio;
grant usage on schema patrimonio to authenticated;
revoke all on schema patrimonio from anon;

-- ------------------------------------------------------------------ identificação do banco
create table if not exists patrimonio.instalacao (
  id boolean primary key default true check (id),           -- só uma linha
  produto text not null check (produto = 'patrimonio'),
  municipio text not null,
  uf char(2) not null,
  criado_em timestamptz not null default now()
);

-- ------------------------------------------------------------------ pessoas que usam o sistema
-- papel: admin (tudo, inclusive cadastrar pessoas), gestor (cadastra e altera), campo (inventário, vistorias, abastecimento e fotos), consulta (só vê)
create table if not exists patrimonio.perfis (
  user_id uuid primary key references auth.users (id),
  nome text not null,
  papel text not null default 'consulta' check (papel in ('admin', 'gestor', 'campo', 'consulta')),
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

alter table patrimonio.perfis add column if not exists email text;

-- Pessoa cadastrada no Supabase (Authentication → Users) ganha perfil automático, INATIVO.
-- Quem libera e escolhe o papel é o administrador, dentro do sistema.
create or replace function patrimonio.novo_usuario() returns trigger
language plpgsql security definer set search_path = patrimonio as $$
begin
  insert into patrimonio.perfis (user_id, nome, email, papel, ativo)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'nome', ''), new.email), new.email, 'consulta', false)
  on conflict (user_id) do nothing;
  return new;
end $$;
drop trigger if exists vitalpat_novo_usuario_patrimonio on auth.users;
create trigger vitalpat_novo_usuario_patrimonio after insert on auth.users for each row execute function patrimonio.novo_usuario();
-- quem já estava cadastrado antes deste roteiro
insert into patrimonio.perfis (user_id, nome, email, papel, ativo)
select id, email, email, 'consulta', false from auth.users on conflict (user_id) do nothing;
update patrimonio.perfis p set email = u.email from auth.users u where u.id = p.user_id and p.email is null;

-- Nunca ficar sem administrador ativo
create or replace function patrimonio.manter_um_admin() returns trigger
language plpgsql security definer set search_path = patrimonio as $$
begin
  if not exists (select 1 from patrimonio.perfis where papel = 'admin' and ativo) then
    raise exception 'É preciso ter pelo menos um administrador ativo.';
  end if;
  return null;
end $$;
drop trigger if exists perfis_manter_um_admin on patrimonio.perfis;
create constraint trigger perfis_manter_um_admin after update on patrimonio.perfis
  deferrable initially deferred for each row
  when (old.papel = 'admin' and old.ativo and (new.papel <> 'admin' or not new.ativo))
  execute function patrimonio.manter_um_admin();

create or replace function patrimonio.meu_papel() returns text
language sql stable security definer set search_path = patrimonio as $$
  select papel from patrimonio.perfis where user_id = auth.uid() and ativo
$$;

-- ------------------------------------------------------------------ dados do sistema
-- Mesmo formato que o sistema usa hoje no navegador: coleção + id + conteúdo.
-- Coleções do patrimônio: as mesmas de patrimonio/gestao/js/base.js (VP.COLECOES) e do app de campo
create table if not exists patrimonio.docs (
  colecao text not null check (colecao ~ '^[a-zA-Z][a-zA-Z0-9]*$'),
  id text not null,
  dados jsonb not null,
  excluido boolean generated always as (coalesce((dados ->> 'excluido')::boolean, false)) stored,
  versao integer not null default 1,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  atualizado_por uuid default auth.uid(),
  primary key (colecao, id)
);
create index if not exists docs_atualizado_em on patrimonio.docs (atualizado_em);
create index if not exists docs_bem on patrimonio.docs ((dados ->> 'bemId')) where colecao = 'eventos';

-- ------------------------------------------------------------------ histórico (nunca apagado)
create table if not exists patrimonio.historico (
  seq bigint generated always as identity primary key,
  colecao text not null,
  id text not null,
  versao integer not null,
  dados_anteriores jsonb,          -- nulo quando é a primeira gravação
  dados_novos jsonb not null,
  alterado_em timestamptz not null default now(),
  alterado_por uuid
);
create index if not exists historico_registro on patrimonio.historico (colecao, id, seq);

create or replace function patrimonio.docs_antes_de_gravar() returns trigger
language plpgsql security definer set search_path = patrimonio as $$
begin
  if tg_op = 'UPDATE' then
    if new.dados = old.dados then return null; end if;      -- nada mudou: não grava
    new.versao := old.versao + 1;
    new.criado_em := old.criado_em;
  else
    new.versao := 1;
  end if;
  new.atualizado_em := now();
  new.atualizado_por := auth.uid();
  return new;
end $$;
drop trigger if exists docs_antes_de_gravar on patrimonio.docs;
create trigger docs_antes_de_gravar before insert or update on patrimonio.docs
  for each row execute function patrimonio.docs_antes_de_gravar();

-- O histórico é escrito DEPOIS de gravar: assim um "grava ou atualiza" (upsert) não deixa linha falsa
create or replace function patrimonio.docs_depois_de_gravar() returns trigger
language plpgsql security definer set search_path = patrimonio as $$
begin
  insert into patrimonio.historico (colecao, id, versao, dados_anteriores, dados_novos, alterado_por)
  values (new.colecao, new.id, new.versao, case when tg_op = 'UPDATE' then old.dados end, new.dados, auth.uid());
  return null;
end $$;
drop trigger if exists docs_depois_de_gravar on patrimonio.docs;
create trigger docs_depois_de_gravar after insert or update on patrimonio.docs
  for each row execute function patrimonio.docs_depois_de_gravar();

create or replace function patrimonio.nao_apagar() returns trigger language plpgsql as $$
begin
  raise exception 'Registros não são apagados. Use a Lixeira (excluido = true).';
end $$;
drop trigger if exists docs_nao_apagar on patrimonio.docs;
create trigger docs_nao_apagar before delete on patrimonio.docs for each row execute function patrimonio.nao_apagar();
drop trigger if exists historico_nao_apagar on patrimonio.historico;
create trigger historico_nao_apagar before delete or update on patrimonio.historico for each row execute function patrimonio.nao_apagar();

-- ------------------------------------------------------------------ quem pode o quê
alter table patrimonio.instalacao enable row level security;
alter table patrimonio.perfis enable row level security;
alter table patrimonio.docs enable row level security;
alter table patrimonio.historico enable row level security;

revoke all on patrimonio.instalacao, patrimonio.perfis, patrimonio.docs, patrimonio.historico from anon;
grant select on patrimonio.instalacao, patrimonio.historico to authenticated;
grant select, insert, update on patrimonio.perfis, patrimonio.docs to authenticated;

grant execute on function patrimonio.meu_papel() to authenticated;

drop policy if exists instalacao_ler on patrimonio.instalacao;
create policy instalacao_ler on patrimonio.instalacao for select to authenticated using (patrimonio.meu_papel() is not null);

drop policy if exists perfis_ler on patrimonio.perfis;
create policy perfis_ler on patrimonio.perfis for select to authenticated using (user_id = auth.uid() or patrimonio.meu_papel() = 'admin');
drop policy if exists perfis_admin_incluir on patrimonio.perfis;
create policy perfis_admin_incluir on patrimonio.perfis for insert to authenticated with check (patrimonio.meu_papel() = 'admin');
drop policy if exists perfis_admin_alterar on patrimonio.perfis;
create policy perfis_admin_alterar on patrimonio.perfis for update to authenticated using (patrimonio.meu_papel() = 'admin') with check (patrimonio.meu_papel() = 'admin');

drop policy if exists docs_ler on patrimonio.docs;
create policy docs_ler on patrimonio.docs for select to authenticated using (patrimonio.meu_papel() is not null);
drop policy if exists docs_incluir on patrimonio.docs;
create policy docs_incluir on patrimonio.docs for insert to authenticated
  with check (patrimonio.meu_papel() in ('admin', 'gestor') or (patrimonio.meu_papel() = 'campo' and colecao in ('registrosCampo', 'eventos')));
drop policy if exists docs_alterar on patrimonio.docs;
create policy docs_alterar on patrimonio.docs for update to authenticated
  using (patrimonio.meu_papel() in ('admin', 'gestor') or (patrimonio.meu_papel() = 'campo' and colecao in ('registrosCampo', 'eventos')))
  with check (patrimonio.meu_papel() in ('admin', 'gestor') or (patrimonio.meu_papel() = 'campo' and colecao in ('registrosCampo', 'eventos')));

drop policy if exists historico_ler on patrimonio.historico;
create policy historico_ler on patrimonio.historico for select to authenticated using (patrimonio.meu_papel() in ('admin', 'gestor'));

-- ------------------------------------------------------------------ fotos e anexos (armazenamento de arquivos, privado)
insert into storage.buckets (id, name, public) values ('patrimonio-arquivos', 'patrimonio-arquivos', false) on conflict (id) do nothing;
drop policy if exists patrimonio_arquivos_ler on storage.objects;
create policy patrimonio_arquivos_ler on storage.objects for select to authenticated using (bucket_id = 'patrimonio-arquivos' and patrimonio.meu_papel() is not null);
drop policy if exists patrimonio_arquivos_enviar on storage.objects;
create policy patrimonio_arquivos_enviar on storage.objects for insert to authenticated with check (bucket_id = 'patrimonio-arquivos' and patrimonio.meu_papel() in ('admin', 'gestor', 'campo'));
-- sem política de apagar: arquivo enviado não é apagado pelo sistema
