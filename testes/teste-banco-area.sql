\set ON_ERROR_STOP 0
\set QUIET 1
insert into :"produto".instalacao (produto, municipio, uf) values (:'produto', 'Cidade Exemplo', 'SC');
insert into auth.users (id, email, raw_user_meta_data) values ('00000000-0000-0000-0000-00000000000b', 'gestor@ex.gov.br', '{"nome":"Gestor Exemplo"}'), ('00000000-0000-0000-0000-00000000000c', 'campo@ex.gov.br', '{}'), ('00000000-0000-0000-0000-00000000000d', 'consulta@ex.gov.br', '{}'), ('00000000-0000-0000-0000-00000000000e', 'novo@ex.gov.br', '{}');
select count(*) filter (where not ativo) as perfis_criados_inativos, count(*) as total, max(nome) filter (where email = 'gestor@ex.gov.br') as nome_do_cadastro from :"produto".perfis;
update :"produto".perfis set papel = 'admin', ativo = true where email = 'admin@ex.gov.br';
update :"produto".perfis set papel = 'gestor', ativo = true where email = 'gestor@ex.gov.br';
update :"produto".perfis set papel = 'campo', ativo = true where email = 'campo@ex.gov.br';
update :"produto".perfis set papel = 'consulta', ativo = true where email = 'consulta@ex.gov.br';
insert into :"produto".instalacao (produto, municipio, uf) values (:'outro', 'X', 'SC');
\echo '[1] acima: deve ter dado ERRO (banco aceita só o seu produto ou só 1 linha)'
set role anon;
select count(*) as anon_ve_docs from :"produto".docs;
\echo '[2] acima: anon sem permissão (ERRO esperado)'
reset role; set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
insert into :"produto".docs (colecao, id, dados) values ('quadras', 'Q1', '{"nome":"Quadra 01"}');
update :"produto".docs set dados = '{"nome":"Quadra 01 A"}' where id = 'Q1';
update :"produto".docs set dados = '{"nome":"Quadra 01 A"}' where id = 'Q1';
select versao as gestor_versao_2 from :"produto".docs where id = 'Q1';
delete from :"produto".docs where id = 'Q1';
\echo '[3] acima: apagar dá ERRO (Lixeira)'
update :"produto".docs set dados = dados || '{"excluido":true}' where id = 'Q1';
select excluido as na_lixeira from :"produto".docs where id = 'Q1';
select count(*) as historico_3_versoes, min(dados_anteriores ->> 'nome') as anterior_guardado from :"produto".historico where id = 'Q1';
update :"produto".historico set dados_novos = '{}';
\echo '[4] acima: alterar histórico dá ERRO'
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000c';
insert into :"produto".docs (colecao, id, dados) values ('quadras', 'Q2', '{}');
\echo '[5] acima: campo não cria quadra (ERRO esperado)'
insert into :"produto".docs (colecao, id, dados) values ('eventos', 'E1', '{"descricao":"vistoria"}');
select count(*) as campo_grava_evento from :"produto".docs where id = 'E1';
select count(*) as campo_nao_ve_historico from :"produto".historico;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000d';
select count(*) as consulta_le from :"produto".docs;
update :"produto".docs set dados = '{}' where id = 'Q1';
select dados ->> 'nome' as consulta_nao_altera from :"produto".docs where id = 'Q1';
update :"produto".perfis set papel = 'admin' where user_id = '00000000-0000-0000-0000-00000000000d';
select papel as consulta_nao_vira_admin from :"produto".perfis where user_id = '00000000-0000-0000-0000-00000000000d';
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000e';
select count(*) as inativo_nao_ve from :"produto".docs;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
update :"produto".perfis set ativo = true where email = 'novo@ex.gov.br';
select count(*) as admin_libera_pessoa from :"produto".perfis where email = 'novo@ex.gov.br' and ativo;
select count(*) as admin_ve_todos from :"produto".perfis;
update :"produto".perfis set papel = 'gestor' where email = 'admin@ex.gov.br';
\echo '[7] acima: último admin não perde o papel (ERRO esperado)'
select papel as continua_admin from :"produto".perfis where email = 'admin@ex.gov.br';
insert into storage.objects (bucket_id, name) values (:'produto' || '-arquivos', 'foto.jpg');
select count(*) as foto_enviada from storage.objects;
delete from storage.objects;
select count(*) as foto_nao_apagada from storage.objects;
