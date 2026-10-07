# VitalPat Patrimônio — banco de dados (Supabase)

**Um projeto Supabase por cidade, só para o patrimônio.** O cemitério tem o seu próprio (`cemiterio/banco/`). Nenhum dado de uma cidade fica no banco de outra.

## Instalar (uma vez por cidade)

1. Entre em supabase.com com a conta da empresa e clique em **New project**.
   - Nome: `vitalpat-patrimonio-<cidade>-<uf>` (ex.: `vitalpat-patrimonio-riodosul-sc`).
   - Senha do banco: gere uma forte e guarde num cofre de senhas. Não mande por e-mail nem chat.
   - Região: **South America (São Paulo)**.
2. Abra **SQL Editor** → **New query**, cole o arquivo `supabase-instalar.sql` inteiro e clique em **Run**. Pode rodar de novo sem estragar nada.
3. Ainda no SQL Editor, identifique a cidade (troque o nome e a UF):
   ```sql
   insert into public.instalacao (produto, municipio, uf) values ('patrimonio', 'Rio do Sul', 'SC');
   ```
4. Crie o primeiro administrador: **Authentication** → **Users** → **Add user** (e-mail e senha). Copie o **User UID** que aparece e rode:
   ```sql
   insert into public.perfis (user_id, nome, papel) values ('COLE-O-UID-AQUI', 'Nome da pessoa', 'admin');
   ```
5. Em **Project Settings** → **API**, copie a **Project URL** e a chave **anon / public**. São essas duas que o sistema vai usar.
   - A chave **service_role** é secreta: nunca vai para o repositório, nem para o sistema, nem para o chat.

## O que o banco garante sozinho (testado em PostgreSQL local, ver checklist.md)

- Sem login, ninguém lê nem grava.
- Ninguém apaga registro, nem pelo SQL Editor: "excluir" é marcar como Lixeira.
- Toda alteração guarda a versão anterior no histórico, que não pode ser alterado nem apagado.
- Papéis: **admin** (tudo e cadastra pessoas), **gestor** (cadastra e altera), **campo** (só registros de campo: inventário, vistorias, abastecimento), **consulta** (só vê).
- Fotos e anexos ficam num armazenamento privado ("arquivos"); o sistema não apaga arquivo enviado.
- O banco do patrimônio recusa ser marcado como banco do cemitério, e vice-versa.

## O que ainda falta

O sistema ainda grava só no navegador. Ligar as telas a este banco (login de verdade com e-mail e senha, envio e recebimento dos dados) é o próximo passo e precisa da URL e da chave anon de um projeto de teste.
