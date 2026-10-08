# CLAUDE.md: VitalPat — Patrimônio e Cemitério para prefeituras

Contexto para o Claude Code. Este arquivo veio de uma conversa no Cowork (set–out/2026). O detalhe completo está em `DOSSIE.md` (v1.3). Nome provisório do sistema: **VitalPat**. As pendências estão em `checklist.md`.

## O que é o projeto

Uma empresa nova, com 2 ou 3 pessoas, vai desenvolver **dois produtos para prefeituras, cada um vendido separadamente** (licitação própria ou lote próprio):

1. **Produto 1: Gestão Patrimonial.** Cobre bens móveis, bens imóveis, inventário anual, vistorias, demandas das unidades, notas fiscais, pesquisa de preços, painéis por fundo e centro de custo, **reavaliação em blocos** (por unidade e outros filtros) e **frota de veículos** (locação, combustível, km; referência: GAX da 3ia).
2. **Produto 2: Gestão de Cemitério.** Cobre mais de 6.000 túmulos, concessões, sepultamentos, exumações e ossário, com uma metodologia legal para tratar cerca de 1.000 túmulos possivelmente abandonados.

A referência de público-alvo é a Prefeitura de Rio do Sul/SC.

## Decisões já tomadas (não reabrir sem o usuário pedir)

- São 2 produtos com o mesmo peso, e cada um é vendido separadamente.
- Os dois **complementam o SIAFIC** (hoje, em Rio do Sul, é o IPM Atende.Net). Nenhum deles é um segundo sistema contábil (Decreto 10.540/2020).
- Nenhuma exumação ou retomada de túmulo acontece automaticamente. O sistema aponta indícios, e uma pessoa decide em processo administrativo.
- "Excluir" significa mover para a Lixeira. O histórico nunca é apagado.
- A importação usa De/Para com área de espera e prévia. O valor anterior vai para o histórico, sem duplicar o registro.
- (07/10/2026) O sistema é **independente** da IPM. Mesmo assim, não faz lançamento contábil: entrega arquivo/relatório para o setor contábil.
- (07/10/2026) Equipes de trabalho e treinamento intensivo; apresentação e projetos-piloto no lugar de atestado.
- (07/10/2026) Relatórios do sistema são visuais. Exportação em planilha é simples, com escolha das colunas (cada sistema de destino aceita só parte das informações).
- (07/10/2026) O repositório é público: **nunca** colocar nele planilhas ou dados reais com nomes, CPFs ou outros dados pessoais. Só estrutura (cabeçalhos) e dados fictícios.
- (07/10/2026) O aplicativo de campo é HTML instalável (aplicativo web progressivo), funcionando sem internet, em celular e tablet. São dois, um por produto: `patrimonio/app-campo/` (VitalPat Patrimônio) e `cemiterio/app-campo/` (VitalPat Cemitério), cada um com armazenamento e cache próprios.
- (07/10/2026) Entrada única com login (`index.html` na raiz): o tipo de usuário abre o sistema certo. Usuários de teste `patrimonio`/`123456` e `selemitério`/`123456`. É login **de demonstração** (só no navegador), não é segurança real.
- (07/10/2026) Publicação e testes pelo Google AI Studio, sincronizado com o GitHub.
- (07/10/2026) Sistema de gestão do patrimônio em `patrimonio/gestao/` (HTML/JS puros, dados no navegador). O login `patrimonio` abre a Gestão; o app de campo fica no botão do topo. Base: as 47 telas do concorrente, numa versão mais simples e visual, **sem cópia** (mapa em `DOSSIE.md` A5). As imagens do concorrente ficam fora do repositório (Google Drive, pasta Trabalho → "Manual de Utilização Sistema"), porque têm dados internos e nomes de servidores.
- (07/10/2026) Manter as telas adaptadas do concorrente e **somar** a elas o que está no dossiê (imóveis, manutenção, chamados, fotos, georreferenciamento). Plano em etapas; cada etapa testada e commitada, push só com autorização.
- (07/10/2026) No teste, **um projeto Supabase só para os dois sistemas** (limite do plano gratuito), cada sistema na sua área do banco (`patrimonio` / `cemiterio`). Projeto de teste: `https://scmrceuxzsukxwsusygk.supabase.co`. Provado em 07/10/2026 (`TUDO PASSOU NO SUPABASE REAL`). Os arquivos `*/config-servidor.js` apontam para ele (decisão do usuário): a versão publicada no AI Studio usa login por e-mail; o login de demonstração só volta se esses arquivos forem esvaziados.
- (07/10/2026) **Servidor: Supabase**, com **um projeto por cidade e por produto** (ex.: `vitalpat-cemiterio-riodosul-sc` e `vitalpat-patrimonio-riodosul-sc`). Roteiros de instalação em `patrimonio/banco/` e `cemiterio/banco/`. Ligação pronta: `*/config-servidor.js` vazio = demonstração; preenchido = login por e-mail e dados no servidor (código em `*/gestao/js/servidor.js` e `*/app-campo/envio.js`). Ainda não foi criado nenhum projeto Supabase de verdade. Por enquanto os dados ficam no navegador, com as mesmas funções de armazenamento para trocar depois.
- (07/10/2026) A localização exata dos túmulos virá de **empresa especializada** (drone/GNSS). O sistema só recebe (CSV ou GeoJSON, com prévia) — formato no `DOSSIE.md` B6.
- (07/10/2026) Atlas (atlas.co) **não** será usado; mapa = Leaflet no próprio sistema. Funções novas aprovadas no `DOSSIE.md` B7. Busca pública "chegar ao túmulo" só com código do túmulo ou nome completo, gratuita, com cadastro.
- (07/10/2026) Gestão do cemitério em `cemiterio/gestao/`. O login `selemitério` abre a Gestão; o app de campo fica no botão do topo.
- (07/10/2026) **Marca: escudo VitalPat, opção B** (marinho `#16365a`, dourado fosco `#b8902f`), nome escrito junto "VitalPat". Arquivos `icones/logo-vitalpat.svg` (escudo + nome) e `icones/icone-vitalpat.svg` (só escudo) em cada sistema.
- (07/10/2026) Modelo de importação do cemitério (planilha limpa, só quadra/aléia/sepultura): `cemiterio/modelos-importacao/`.

- (08/10/2026) **Manual de uso em `manual.md`** (raiz). Cada função nova ganha uma seção; o documento é atualizado, nunca recriado.
- (08/10/2026) Patrimônio: **itens de controle** (baixo valor ou pouca durabilidade; padrão abaixo de R$ 300) ficam fora do balancete, sem plaqueta. Os anexos exportados e importados usam o nome `plaqueta_descricao_01.ext`.

## Bloqueador legal (ler antes de qualquer coisa comercial)

**Atualização 07/10/2026:** o usuário informou que o impedimento foi resolvido. Nenhum documento foi anexado. O texto abaixo foi mantido como histórico.


A Lei 14.133/2021, art. 9º, §1º, impede servidor da prefeitura contratante de participar da licitação, direta ou indiretamente. Um dos sócios trabalha no Departamento de Patrimônio de Rio do Sul. Enquanto isso durar, **nenhum dos produtos pode ser vendido para Rio do Sul**. A estratégia é vender primeiro para outros municípios. O parecer jurídico está pendente.

## Decisões em aberto (são do usuário, perguntar antes)

- ~~Um repositório ou dois?~~ **Decidido em 07/10/2026: um repositório, duas pastas independentes** — `patrimonio/` (Produto 1) e `cemiterio/` (Produto 2). Nenhuma pasta usa arquivo da outra; o que for parecido é copiado e adaptado em cada uma.
- O que fazer com a estrutura Django que já existia na raiz (`apps/`, `config/`, `gestao/`, `selemit_projeto/` etc.).
- Stack/tecnologia: servidor decidido (Supabase, 07/10/2026); o resto não. Hoje é HTML/JS puro. (O repositório já tem uma estrutura Django de julho/2026, que o usuário disse que será parcialmente substituída.)
- Em que fase entra a frota de veículos.
- As duas trilhas andam juntas, ou uma sai primeiro?
- Qual produto ou fase começa a ser codificada.

## Regras de trabalho com este usuário

- Responder em português (pt-BR), de forma simples. O usuário é iniciante em tecnologia.
- Nunca dizer "funciona", "corrigido" ou "pronto" sem colar a saída real (log, teste, hash de commit).
- Separar sempre "confirmado por execução" de "deduzido por leitura".
- Não mexer fora do escopo pedido. Se for preciso, avisar e pedir confirmação antes.
- Propor primeiro a solução mais simples.
- Manter o `checklist.md` atualizado no repositório.
- Não recriar documentos do zero: atualizar, mantendo o histórico, e avisar.
- Pedir confirmação antes de git push, PR ou qualquer coisa visível para terceiros.
- Antes de assumir a estrutura das planilhas do cemitério, pedir o cabeçalho completo.
- Zero jargão técnico nas telas para o usuário final.
- Contrariar o usuário quando ele estiver errado ou perdendo tempo ou dinheiro.

## Marcas usadas no dossiê

- **[C]**: confirmado em fonte.
- **[D]**: dedução ou proposta.
- **[A conferir]**: ainda não verificado. Não usar em código de regra legal sem confirmar.
