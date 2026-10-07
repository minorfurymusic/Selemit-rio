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
- [x] Atlas (atlas.co) no cemitério — 07/10/2026: não será usado (decisão do usuário; motivos no DOSSIE.md B7).
- [ ] Cobrar valor simbólico da pessoa física (R$ 30–50/ano)? Parecer de advogado (DOSSIE.md B7: busca e pedidos não podem ser cobrados; extras opcionais talvez).
- [ ] Saber se a empresa do protocolo da prefeitura permite integração (função 10 do B7).
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
- [x] Ajustar o logo (o usuário vai rever). — 07/10/2026: aprovada a marca **escudo VitalPat, opção B** (marinho `#16365a` + dourado fosco `#b8902f`; nome escrito junto, "VitalPat"). Aplicada nos 4 sistemas e na entrada: `logo-vitalpat.svg` (escudo + nome), `icone-vitalpat.svg` (só escudo, para aba e celular), ícones do aplicativo (192 e 512), cor principal das telas. Cores dos gráficos e das situações não mudaram. Testes do zero: campo 43/0, gestões `TODOS PASSARAM` / `TUDO PASSOU`, fumaça `ERROS: []`, entrada com servidor real `TUDO PASSOU`.
- [ ] Marca: o nome na logo usa a fonte do aparelho (Archivo quando houver, senão Helvetica/Arial). Para a arte final (impressos, proposta), converter o texto em desenho com um designer.

## Pedido de 07/10/2026 — Patrimônio (9 itens)

- [x] 1. Separar bens móveis de bens imóveis (abas no menu).
- [x] 2. Aba Frota com as funções do GAX (painel, próprios e alugados, abastecimentos com alertas, diário de bordo, contratos com conferência mensal, motoristas/CNH, preventiva, multas, documentos).
- [x] 3. Novo bem: nome digitado com sugestões; igual a existente puxa as informações; importar nota fiscal (XML NF-e) com conferência das diferenças; produto novo entra no catálogo.
- [x] 4. Classificação digitada com a mesma ideia; nova entra nos Cadastros (com escolha da classe-mãe, de onde vêm conta e vida útil).
- [x] 5. Estado "Novo".
- [x] 6. Detalhes do bem visíveis (não obrigatórios).
- [x] 7. Depreciação automática com gatilho no balancete (ou ao abrir o sistema), à escolha do usuário.
- [x] 8. Botão de tema claro/escuro (antes só seguia o aparelho; não havia botão).
- [x] 9. Robô que clica em todos os botões: Patrimônio 34 telas / 291 botões; Cemitério 13 telas / 60 botões. Defeitos achados e corrigidos: filtro de data do Balancete, "Editar" abastecimento, clique duplicado na Lixeira/Cadastros do Patrimônio.
- Testes do zero (07/10/2026): campo 43/0; gestão patrimônio `TODOS PASSARAM` (34); gestão cemitério `TUDO PASSOU`; fumaça `ERROS: []`; novo bem e nota `TUDO PASSOU` (16); depreciação automática `TUDO PASSOU`; com servidor (banco local com regras reais): gestão patrimônio, gestão cemitério, campo cemitério e campo patrimônio `TUDO PASSOU`.
- [ ] Frota, ainda não feito: pneus (FR-12), reserva de veículos por secretaria (FR-13), arquivo do cartão-combustível (FR-15), dias parados na conferência da locação.
- [ ] Aplicativo de campo do patrimônio ainda usa a escala de estado sem "Novo".
- [ ] Cemitério: "Gerar etiquetas" de todos os 2.058 túmulos de exemplo demora alguns segundos; pensar em gerar por quadra.
- [ ] Nota fiscal: só XML da NF-e (modelo 55). PDF/DANFE e NFS-e não são lidos.

## Ligar ao Supabase (plano aprovado em 07/10/2026; vem antes das etapas do cemitério)

- [ ] Passo 0 (usuário): liberar `*.supabase.co` na rede do ambiente do Claude Code; criar 2 projetos de teste (`vitalpat-patrimonio-teste`, `vitalpat-cemiterio-teste`); passar URL, chave anon e um usuário de teste de cada.
- [x] Passo 1: biblioteca supabase-js 2.117.3 (MIT) em `vendor/` de cada sistema e da entrada; `patrimonio/config-servidor.js` e `cemiterio/config-servidor.js` (vazio = demonstração). — 07/10/2026.
- [x] Passo 2: banco cria o perfil (inativo) de quem é cadastrado no Supabase; admin libera pelo sistema; nunca fica sem admin ativo. Testado 2x em PostgreSQL 16 local nos dois produtos: `perfis_criados_inativos = 5`, `inativo_nao_ve = 0`, `É preciso ter pelo menos um administrador ativo.` — 07/10/2026.
- [x] Passo 3: login de verdade (e-mail e senha) na entrada única; demonstração continua sem configuração. — 07/10/2026. Testado com Supabase **simulado** no navegador automático (13 verificações: e-mail/senha, escolha entre os 2 sistemas, inativo barrado, papel campo abre o app de campo, esqueci a senha, nova senha). Demonstração: campo 43/0, gestão patrimônio `TODOS PASSARAM`, gestão cemitério `TUDO PASSOU`, fumaça `ERROS: []`. Falta provar no Supabase real.
- [x] Passo 4: Gestão (patrimônio e cemitério) grava no servidor; tela Pessoas; botões por papel. — 07/10/2026. Testado com o roteiro do banco REAL em PostgreSQL 16 + PostgREST 12.2.3 locais (mesmo programa que o Supabase usa); login e fotos simulados. Cemitério: 23 verificações (importação real da lista de chãos, 6.468 túmulos em 2,3 s; recarregar lê do servidor em páginas; histórico com valor anterior; Lixeira; desfazer; Pessoas; consulta recusada pelo banco). Patrimônio: 15 verificações (2.500 bens em lotes; Configurações; consulta recusada). Defeito achado e corrigido no banco: o histórico ganhava linha falsa em "grava ou atualiza".
- [x] Passo 5: fotos no armazenamento de arquivos (registro guarda só o caminho; tela usa link temporário de 12 h). — 07/10/2026, armazenamento simulado no teste.
- [ ] Limitação conhecida: duas pessoas alterando o mesmo registro ao mesmo tempo → vale a última gravação (as duas ficam no histórico).
- [ ] Botões escondidos por papel cobrem as ações principais; o que escapar, o banco recusa com a mensagem "Seu acesso não permite esta alteração".
- [x] Passo 6: apps de campo: sem internet + "Enviar para o servidor". — 07/10/2026, commit `f84e51b`. Cemitério: 14 verificações (sem internet fica no aparelho; internet volta → envia sozinho; foto, GPS e notas no banco; banco registra quem enviou; consulta recusada com motivo; Gestão recebe). Patrimônio: 3 verificações.
- [x] Passo 7: documentos (LEIA-ME dos 4 sistemas, dossiê B6, CLAUDE.md) e texto do AI Studio. — 07/10/2026.
- Rodada final do zero (07/10/2026): campo demonstração 43/0; gestão patrimônio demonstração `TODOS PASSARAM`; gestão cemitério demonstração `TUDO PASSOU`; fumaça `ERROS: []`; login servidor `TUDO PASSOU`; gestão cemitério servidor, campo cemitério servidor e gestão patrimônio servidor `TUDO PASSOU`.
- [x] Um projeto Supabase para os dois sistemas (decisão do usuário, 07/10/2026, por causa do limite do plano gratuito): cada sistema na sua área do banco (`patrimonio` e `cemiterio`) e com armazenamento de fotos próprio. Testado com os dois instalados no mesmo banco local: regras do banco nos dois (rodado 2x), gestor liberado só no cemitério vê `0` registros do patrimônio e não grava lá; testes com servidor das 2 Gestões e dos 2 apps de campo `TUDO PASSOU`; demonstração 43/0, `TODOS PASSARAM`, `TUDO PASSOU`, `ERROS: []`.
- [x] Projeto de teste criado pelo usuário no Supabase (07/10/2026): `https://scmrceuxzsukxwsusygk.supabase.co` (nome "departamenteo de patrimônio", região São Paulo, plano Free, mesma organização do Sispu).
- [x] No projeto: instalação dos 2 sistemas, áreas liberadas em Exposed schemas, administrador criado, chave anon passada. — 07/10/2026 (usuário; print com `minorfurymusic@gmail.com | admin | true` nas duas áreas).
- [x] Liberar `*.supabase.co` na rede do ambiente do Claude Code. — 07/10/2026.
- [x] Prova contra o Supabase de verdade — 07/10/2026, navegador automático no projeto `scmrceuxzsukxwsusygk`, nada simulado: `TUDO PASSOU NO SUPABASE REAL`. Login por e-mail com escolha do sistema; importação da lista de chãos (6.468 túmulos em 23,8 s; reabrir lendo do servidor 8,4 s); histórico real com valor anterior (versões 1,2); banco recusa apagar (`permission denied for table docs`); foto no armazenamento real aparece depois de recarregar; excluir → Lixeira; tela Pessoas; app de campo enviou 1 registro e a Gestão recebeu; patrimônio entra, grava Configurações e não vê nada do cemitério; sem erros no console. Sem internet: o servidor recusa quem não fez login (`permission denied for schema cemiterio`).
- [x] Trocar a senha de teste do usuário (passou pelo chat). — 07/10/2026, feito pelo usuário.
- [x] Decidir se o AI Studio passa a usar o servidor de teste — 07/10/2026: decisão do usuário: **sim**. `patrimonio/config-servidor.js` e `cemiterio/config-servidor.js` preenchidos com o projeto de teste. O login de demonstração (`patrimonio`/`selemitério` + `123456`) deixa de valer na versão publicada. Testado contra o projeto real: `TUDO PASSOU` (entrada pede e-mail; demonstração recusada; senha errada com mensagem clara; Gestão sem login volta para a entrada).
- [ ] Supabase → Authentication → URL Configuration: colocar o endereço publicado do AI Studio em Site URL e Redirect URLs, para o "Esqueci a senha" voltar para o sistema.
- [ ] Testes automáticos do modo demonstração agora precisam forçar a configuração vazia (o repositório aponta para o servidor de teste).
- [ ] Observação: excluir usuário pelo painel do Supabase dá erro, porque o perfil fica ligado à pessoa e o banco não apaga nada; para tirar o acesso, desativar em Pessoas.

## Gestão do cemitério (`cemiterio/gestao/`) — plano em etapas

- [x] Etapa 1 — túmulos, importação da lista de chãos (De/Para, prévia, desfazer), mapa por posição, painel, ficha com QR, recebimento do levantamento (CSV/GeoJSON), KML, etiquetas, Lixeira. — 07/10/2026, 29 verificações passaram no navegador automático (commit no histórico do git).
- [ ] Etapa 0 — conferir no AI Studio, rodando, se o estilo (.css) do cemitério é publicado (aparecia sem estilo).
- [x] Etapa 2 — vistorias, triagem de possível abandono, ordens de serviço, app de campo ampliado (B7 itens 2, 3, 4 e 6). — 07/10/2026, commit no histórico do git.
  - Gestão: menus **Vistorias** (com a aba "Recebidos do aplicativo"), **Triagem** e **Ordens de serviço**; ficha do túmulo com vistorias, situação, indicadores documentais (D1–D5), exceção histórica e ordens; mapa colorido por situação e por vistoria; relatório "Triagem de abandono por quadra"; painel e pendências (risco sem ordem, ordens atrasadas, registros para conferir, sugestão diferente da situação); Lixeira com vistorias e ordens; limites da triagem em Configurações.
  - Regra (DOSSIE.md B2): o sistema só **sugere** (Regular, Atenção, Indício). A situação muda só quando uma pessoa decide (na ficha ou aceitando a sugestão em lote na Triagem, com tela de resultado). "Abandono em apuração" só pela ficha, com 2 vistorias com intervalo mínimo, 1 indicador documental (D5 sozinho não conta), sem exceção histórica, nº do processo e quem revisou. "Declarado" exige apuração antes, nº do ato e data.
  - Aplicativo de campo: **Aviso de problema** (limpeza, conserto, acidente) e **Ordens de serviço** (marcar como feita, com foto obrigatória); com servidor, baixa a lista de túmulos e ordens abertas para conferir o código sem internet.
  - Registro do aplicativo só entra no túmulo depois que uma pessoa confere na grade (dá para corrigir o código na própria linha) e pode ser desfeito (o lançamento vai para a Lixeira).
  - Testes do zero (07/10/2026): etapa 2 na demonstração `TUDO PASSOU` (39); aplicativo + Gestão na demonstração `TUDO PASSOU` (11; achou e corrigiu defeito: a ordem feita no aplicativo era ligada pelo número a outra ordem); etapa 2 com servidor (banco local com regras reais) `TUDO PASSOU` (19); campo 43/0; gestão cemitério `TUDO PASSOU`; gestão patrimônio `TODOS PASSARAM`; fumaça `ERROS 0` e `ERROS: []`; novo bem `TUDO PASSOU`; depreciação `TUDO PASSOU`; demais testes com servidor `TUDO PASSOU`; robô de botões: Cemitério 18 telas / 128 botões / 0 suspeitos, Patrimônio 34 telas / 291 botões / 1 suspeito já conhecido ("Tudo" na ficha do bem não muda nada visível quando já está nessa aba).
- [ ] Etapa 2, limitações: D1 (concessão vencida) é marcado à mão até existirem as concessões (etapa 3); a cor "concessão vencida" no mapa também depende da etapa 3. Na demonstração, as ordens do aplicativo são exemplos fictícios que não existem na Gestão de exemplo (com servidor, a lista é a mesma). Navegadores que já tinham os dados de exemplo antigos não ganham vistorias de exemplo; "Voltar aos dados de exemplo" em Configurações recria.
- [ ] Etapa 2, conferir com o usuário/Procuradoria: limites da triagem (6 e 10 de 16 pontos) e o intervalo de 90 dias entre vistorias (o dossiê sugere 90 a 180).
- [ ] Funções do B7 (decididas em 07/10/2026): 1 (concessões vencendo, notificações, pedidos de limpeza e avisos de acidente) com a etapa 4; 5 (busca pública com cadastro) e 10 (portal do titular e protocolo) depois do login de verdade no Supabase; 7 (agenda e funerárias) com a etapa 3; 8 (painel de vagas melhorado) com a etapa 3; 9 (digitalização de livros) com a importação.
- [x] Etapa 3 — concessões, sepultamentos, exumações e ossário, mais agenda das funerárias (B7 item 7) e painel de vagas melhorado (B7 item 8). — 07/10/2026, commit no histórico do git.
  - Planilha de chãos (decisão do usuário, 07/10/2026): a coluna "Data" das abas de quadra será tratada como **data do título de aforamento (concessão)**, não do sepultamento.
  - Gestão: menus **Sepultamentos** (agenda com confirmar/cancelar e lista de todos os sepultados com busca por nome), **Concessões**, **Exumações e ossário** e **Vagas**; ficha do túmulo com concessão (titular com CPF mascarado, trocar titular, renovar, encerrar), sepultados, exumações e restos do nicho; cadastro de **Funerárias**; mapa colorido por concessão; busca geral também acha pelo nome do falecido ou do titular.
  - Regras (todas com prazo ajustável em Configurações): permanência em gaveta 5 anos adulto / 3 criança (Rio do Sul [C]); exumação só depois de 5 anos, salvo ordem judicial ou policial (referência Bom Retiro [C]); exumação por abandono só com "Abandono declarado"; guarda no ossário 3 anos (referência Joinville [C]); gaveta não recebe segundo sepultamento; túmulo em processo de abandono não recebe sepultamento; registro da exumação exige 2 testemunhas diferentes e destino.
  - Nada automático: o sistema agenda o que a pessoa pediu e registra o que foi feito. A exumação feita deixa o túmulo "Vago" só se não sobrar ninguém sepultado; a concessão **não** é encerrada sozinha.
  - D1 (concessão temporária vencida) agora é automático na triagem. Concessão **perpétua** bloqueia "Abandono em apuração" até alguém marcar em Configurações que a lei municipal permite.
  - Testes do zero (07/10/2026): etapa 3 na demonstração `TUDO PASSOU` (45, inclusive celular sem rolagem lateral); etapa 3 com servidor (banco local com regras reais) `TUDO PASSOU` (7); etapa 2 `TUDO PASSOU` (39 e 11) e com servidor (19); campo 43/0; gestão cemitério `TUDO PASSOU` (27); gestão patrimônio `TODOS PASSARAM` (34); fumaça `ERROS 0` e `ERROS: []`; novo bem (16) e depreciação (5) `TUDO PASSOU`; login (13), gestão cemitério (22), campo cemitério (14), gestão patrimônio (15) e campo patrimônio (3) com servidor `TUDO PASSOU`. Robô de botões: Cemitério 25 telas / 183 botões / 1 suspeito ("Gerar etiquetas" demorou mais de 2 s para responder: é a lentidão já anotada, gera as etiquetas de todos os túmulos; o teste da gestão confirma que as etiquetas saem); Patrimônio 34 / 291 / 1 suspeito já conhecido ("Tudo").
- [ ] Etapa 3, pendências: importar titulares e sepultados das planilhas reais depende das respostas abaixo (significado da coluna "Data", regra do ano com 2 dígitos, "I"/"P" em Situação); portal das funerárias (cada uma com o próprio acesso) fica para depois do login de terceiros; confirmar os prazos com a lei de cada município.
- [x] Código das plaquetas — 07/10/2026, decisão do usuário: **número sequencial de 000000 a 100.000** (limite ajustável), gerado em lotes (+10, +30, +50, +100 ou quantidade escolhida) no menu **Plaquetas**. Cada plaqueta é ligada a um túmulo por uma pessoa (ficha → "Ligar plaqueta", ou em lote pela lista de Túmulos → "Numerar plaquetas", com prévia na ordem do mapa); desligar pede o motivo (volta a ficar livre ou fica inutilizada) e tudo fica no histórico. O QR leva o número; a busca e o aplicativo de campo acham o túmulo pelo número (com ou sem zeros). O código antigo (quadra-aléia-número) continua valendo para quem ainda não tem plaqueta. Teste: `TUDO PASSOU` (16).
- [ ] Formato definitivo das plaquetas e da arte (tamanho, material) fica para depois (decisão do usuário).
- [x] Etapa 4 — processo administrativo do abandono (nada automático; pessoa decide). — 07/10/2026, commit no histórico do git.
  - Menu **Processos**: abrir pela ficha ("Mudar situação" → Abandono em apuração, com os requisitos da triagem); notificação por **e-mail e WhatsApp** (o sistema abre o WhatsApp ou o e-mail com o texto pronto; a pessoa envia e registra com comprovante); aviso (placa) no túmulo com foto obrigatória; **edital em lote** com texto pronto; prazo para manifestação contado em dias úteis ou corridos a partir da ciência mais tardia (notificação confirmada ou edital); defesa com resposta fundamentada; termo de compromisso com verificação; **decisão da autoridade** (arquivar a qualquer momento; declarar só com tudo cumprido e nº do ato publicado); **dossiê** completo para imprimir.
  - "Abandono declarado" saiu de "Mudar situação": só sai pela decisão do processo. Com processo aberto, a situação do túmulo não muda por fora.
  - Testes do zero (07/10/2026), depois das mudanças: etapa 4 `TUDO PASSOU` (27: abrir, notificação com links do WhatsApp e do e-mail, aviso com foto obrigatória, edital em lote e edital anterior à abertura barrado, prazo de 30 dias úteis, defesa, decisão sem ato barrada, termo de compromisso, dossiê, celular); etapa 4 com servidor (banco local com regras reais) `TUDO PASSOU` (6: comprovante vai ao armazenamento, consulta recusada); plaquetas `TUDO PASSOU` (16); etapas 2 (39 e 11) e 3 (45), gestão do cemitério (27), campo 43/0, fumaça `ERROS 0` e testes com servidor `TUDO PASSOU`; robô de botões do Cemitério: 27 telas, 203 botões, 0 suspeitos.
- [ ] Etapa 4, pendência jurídica (decisão do usuário, 07/10/2026): a prefeitura hoje notifica só por e-mail e WhatsApp; a carta com AR ficou **opcional** (Configurações → "exigir carta com AR"). Conferir com a Procuradoria se e-mail/WhatsApp bastam. Em Rio do Sul, as concessões seguirão outros parâmetros e sairá uma lei nova: ajustar prazos e regras quando a lei sair.
- [ ] Etapa 4: a contagem de dias úteis não desconta feriados (só sábados e domingos).
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
- 07/10/2026: pesquisa de sistemas de outros países; Atlas descartado; 10 funções aprovadas (DOSSIE.md B7).
- 07/10/2026: sistema ligado ao Supabase (login de verdade, Gestões e apps de campo gravando no servidor), testado com o banco real em PostgreSQL+PostgREST locais; falta provar no Supabase de verdade (passo 0).
- 07/10/2026: ligação ao Supabase provada no projeto de teste real (um projeto para os dois sistemas).
- 07/10/2026: marca nova (escudo VitalPat, opção B) aplicada em todo o sistema.
- 07/10/2026: Patrimônio com abas (móveis, imóveis, frota), Frota completa, novo bem com nota fiscal, depreciação automática, tema claro/escuro; robô de botões.
