# Checklist: pendências do projeto

Atualizar este arquivo a cada entrega, sem apagar o histórico. Marcar `[x]` com a data e a prova (hash de commit, saída de teste ou link).

## Bloqueadores

- [x] Parecer de advogado sobre o impedimento do art. 9º §1º da Lei 14.133 (sócio servidor em Rio do Sul). Produtos 1 e 2. — 07/10/2026: resolvido, segundo o usuário. Prova: nenhum documento anexado ao repositório.
- [ ] Receber as 2 planilhas do cemitério, com o cabeçalho completo, para mapear a importação. Produto 2. — 07/10/2026: recebida a "Lista de chãos" (estrutura no DOSSIE.md, seção B5; arquivo fora do repositório por ter nomes e CPFs). Falta a 2ª, se existir.
- [ ] Repositório público: o usuário vai torná-lo privado depois; por ora fica público (decisão de 07/10/2026).
- [ ] Planilha de chãos limpa: revisar 109 covas sem aléia e 14 com aléia "ok".
- [ ] Decidir o destino da estrutura Django que já existia na raiz do repositório.

## Decisões do usuário

- [x] Um repositório ou dois (um por produto)? — 07/10/2026: um repositório, duas pastas independentes (`patrimonio/` e `cemiterio/`). Commit: ver histórico do git.
- [ ] Stack/tecnologia. — 07/10/2026: servidor = Supabase (decisão do usuário). Falta o resto.
- [ ] Supabase: criar projeto próprio do VitalPat e passar URL e chave pública (anon key). Nunca a chave secreta. — 07/10/2026: decisão do usuário: um projeto por cidade e por produto. Roteiros prontos em `patrimonio/banco/` e `cemiterio/banco/` (testados em PostgreSQL 16 local imitando o Supabase; não testados no Supabase de verdade, porque a rede deste ambiente bloqueia supabase.com).
- [ ] Criar 1 projeto de teste de cada produto e passar URL + anon key, para ligar as telas ao banco (login de verdade).
- [ ] Conferir preço do Supabase (plano gratuito limita projetos ativos; 2 projetos por cidade).
- [ ] Atlas (atlas.co) no cemitério: avaliar plano gratuito (pesquisa em andamento).
- [ ] Contratar a empresa do levantamento (localização exata dos túmulos); formato de entrega no DOSSIE.md B6.
- [x] As duas trilhas andam juntas, ou uma sai primeiro? — 07/10/2026: decisão do usuário: equipes de trabalho e treinamento intensivo.
- [ ] Em que fase entra a frota de veículos (Módulo 10).
- [ ] Confirmar se "Serfic" = SIAFIC.
- [ ] Planilha de chãos: significado da coluna "Data", dos valores "I" e "P" em "Situação" e regra do ano com 2 dígitos.
- [ ] Pesquisar "VitalPat" no INPI antes de registrar a marca.
- [x] Nome provisório do sistema: VitalPat — 07/10/2026, decisão do usuário. Logo em `app-campo/icones/logo-vitalpat.svg`.
- [ ] Confirmar o que significa "emissão de notas fiscais" no pedido original.
- [ ] Escolher municípios piloto sem vínculo com os sócios, um por produto. (07/10/2026: estratégia de apresentação + projetos-piloto no lugar de atestado.)

## Dados a obter

- [ ] Tabela oficial de vida útil e valor residual do município. Produto 1.
- [ ] Texto integral da Lei Municipal 4.100/2004 (Rio do Sul) e dos decretos do cemitério: concessões perpétuas e taxas. Produto 2.
- [x] Saber se a IPM oferece API para integração com terceiros. Produtos 1 e 2. — 07/10/2026: deixou de ser obrigatório; decisão do usuário: sistema independente.
- [ ] Conferir as funções do GAX (3ia) direto no site ou manual (o site não abriu no ambiente do Claude Code). Frota.

## Itens [A conferir] do dossiê

- [ ] Texto integral da NBC TSP 37: mapear cada item no sistema.
- [ ] IN SEGES 65/2021: idade máxima das fontes de preço.
- [ ] LC 182/2021 (CPSI): valores e regras de habilitação.
- [ ] Lei 13.589/2018 (PMOC): detalhes.
- [ ] Portaria SES/SC 167/2018: regras sanitárias de exumação.
- [ ] Regras de adesão a ata de registro de preços municipal.

## Aplicativo de campo piloto

- [ ] Testar os dois aplicativos (Patrimônio e Cemitério) em celular e tablet reais (Android e iPhone), abertos por endereço https.
- [ ] Definir onde o piloto será hospedado para a apresentação (endereço https).

- [ ] Login de verdade (servidor, senhas fortes, troca de senha). O atual é só de demonstração.
- [ ] Conferir se o Google AI Studio publica os arquivos como estão (HTML puro) e a partir de qual ramo do GitHub.

## Gestão do patrimônio (`patrimonio/gestao/`)

- [ ] Testar a Gestão com usuários reais do setor (fluxos: incluir, transferir, inventário, fechar mês, reavaliar, relatórios).
- [ ] Trocar a tabela de vida útil e valor residual de exemplo pela tabela oficial do município.
- [ ] Validar com o setor contábil o arquivo "Para a contabilidade" (layout das colunas).
- [ ] Configurações que ainda só ficam guardadas (lista em `patrimonio/gestao/LEIA-ME.md`) dependem do servidor.
- [ ] Ajustar o logo (o usuário vai rever).

## Gestão do cemitério (`cemiterio/gestao/`) — plano em etapas

- [x] Etapa 1 — túmulos, importação da lista de chãos (De/Para, prévia, desfazer), mapa por posição, painel, ficha com QR, recebimento do levantamento (CSV/GeoJSON), KML, etiquetas, Lixeira. — 07/10/2026, 29 verificações passaram no navegador automático (commit no histórico do git).
- [ ] Etapa 0 — conferir no AI Studio, rodando, se o estilo (.css) do cemitério é publicado (aparecia sem estilo).
- [ ] Etapa 2 — vistorias, triagem de possível abandono, ordens de limpeza, app de campo ampliado.
- [ ] Etapa 3 — concessões, sepultamentos, exumações e ossário.
- [ ] Etapa 4 — processo administrativo (nada automático; pessoa decide).
- [ ] Etapa 5 — imóveis (Patrimônio).
- [ ] Etapa 6 — chamados de conserto, manutenção preventiva, vistorias e equipes.
- [ ] Etapa 7 — mapas com fundo de imagem (Leaflet + OpenStreetMap), Google Maps, KML.
- [ ] Etapa 8 — relatórios com fotos e mapas.
- [ ] Planilha de chãos: 11 linhas repetidas na mesma aba aparecem como Conflito na importação (bate com o DOSSIE.md B5, item 6).
- [ ] Gestão do patrimônio: mesmo defeito corrigido no cemitério (clique que pode ser contado duas vezes em Cadastros) existe em `patrimonio/gestao/js/telas-cadastros.js`; corrigir só com autorização.

## Histórico

- 23/09/2026: dossiê v1.0 criado (Cowork).
- 26/09/2026: dossiê v1.1, com 2 produtos vendidos separadamente e pesquisa legal de bens móveis e imóveis aprofundada (Cowork).
- 07/10/2026: exportado para o Claude Code (`CLAUDE.md`, `DOSSIE.md`, `checklist.md`).
- 07/10/2026: dossiê v1.2 (Claude Code): reavaliação em blocos, frota de veículos (referência GAX), decisões do usuário e aplicativo de campo piloto em `app-campo/`.
- 07/10/2026: dossiê v1.3 (Claude Code): nome VitalPat e logo, relatórios visuais, exportação com escolha de colunas (já no app), estrutura da planilha de chãos.
- 07/10/2026: separação em 2 sistemas independentes (`patrimonio/`, `cemiterio/`), cada um com seu app de campo; planilha de chãos limpa em `cemiterio/modelos-importacao/`.
- 07/10/2026: tela de login única na raiz; cada usuário abre seu sistema (teste: 42 verificações passaram no navegador automático).
- 07/10/2026: Gestão do patrimônio criada em `patrimonio/gestao/` a partir das 47 telas do concorrente (DOSSIE.md A5); login `patrimonio` passa a abrir a Gestão.
- 07/10/2026: dossiê v1.5; Gestão do cemitério (etapa 1) em `cemiterio/gestao/`; login `selemitério` passa a abrir a Gestão; decisões: Supabase e empresa de levantamento.
- 07/10/2026: roteiros de instalação do banco (Supabase) para patrimônio e cemitério, um projeto por cidade e por produto.
