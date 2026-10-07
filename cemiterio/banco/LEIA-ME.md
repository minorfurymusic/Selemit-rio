# VitalPat Cemitério — banco de dados (Supabase)

**Cada sistema fica numa área própria do banco** (`cemiterio`), então ele pode ter um projeto Supabase só dele **ou dividir o projeto com o patrimônio** (`patrimonio/banco/`), sem misturar dados, pessoas liberadas, histórico nem fotos. Atualização de 07/10/2026: decisão do usuário de usar, no teste, **um projeto só para os dois**. A ideia original era um projeto por cidade e por produto; as duas formas funcionam. Nenhum dado de uma cidade fica no banco de outra.

## Instalar (uma vez por cidade)

1. Entre em supabase.com com a conta da empresa e clique em **New project**.
   - Nome: `vitalpat-cemiterio-<cidade>-<uf>` (ex.: `vitalpat-cemiterio-riodosul-sc`).
   - Senha do banco: gere uma forte e guarde num cofre de senhas. Não mande por e-mail nem chat.
   - Região: **South America (São Paulo)**.
2. Abra **SQL Editor** → **New query**, cole o arquivo `supabase-instalar.sql` inteiro e clique em **Run**. Pode rodar de novo sem estragar nada.
3. Ainda no SQL Editor, identifique a cidade (troque o nome e a UF):
   ```sql
   insert into cemiterio.instalacao (produto, municipio, uf) values ('cemiterio', 'Rio do Sul', 'SC');
   ```
4. Crie o primeiro administrador: **Authentication** → **Users** → **Add user** → **Create new user** (e-mail e senha, marque "Auto Confirm User"). Depois rode, trocando o e-mail:
   ```sql
   update cemiterio.perfis set papel = 'admin', ativo = true, nome = 'Nome da pessoa' where email = 'email@prefeitura.gov.br';
   ```
   As próximas pessoas são criadas do mesmo jeito (Add user), mas entram **inativas**: o administrador libera e escolhe o papel dentro do sistema, em Configurações → Pessoas.
5. **Liberar a área para o sistema:** **Project Settings** → **Data API** (ou **API**) → **Exposed schemas** → acrescente `cemiterio` (e `patrimonio`, se o projeto for dividido) → **Save**. Sem isso o sistema não enxerga os dados.
6. Em **Project Settings** → **API**, copie a **Project URL** e a chave **anon / public**. São essas duas que o sistema vai usar.
   - A chave **service_role** é secreta: nunca vai para o repositório, nem para o sistema, nem para o chat.

## O que o banco garante sozinho (testado em PostgreSQL local, ver checklist.md)

- Sem login, ninguém lê nem grava.
- Ninguém apaga registro, nem pelo SQL Editor: "excluir" é marcar como Lixeira.
- Toda alteração guarda a versão anterior no histórico, que não pode ser alterado nem apagado.
- Papéis: **admin** (tudo e cadastra pessoas), **gestor** (cadastra e altera), **campo** (só vistorias e registros de campo), **consulta** (só vê).
- Fotos e anexos ficam num armazenamento privado ("arquivos"); o sistema não apaga arquivo enviado.
- Toda pessoa cadastrada no Supabase começa inativa; sempre fica pelo menos um administrador ativo.
- O banco do cemitério recusa ser marcado como banco do patrimônio, e vice-versa.

## O que ainda falta

O sistema ainda grava só no navegador. Ligar as telas a este banco (login de verdade com e-mail e senha, envio e recebimento dos dados) é o próximo passo e precisa da URL e da chave anon de um projeto de teste.
