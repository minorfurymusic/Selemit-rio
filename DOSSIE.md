DOSSIÊ DE PRODUTO E MERCADO

**VitalPat** (nome provisório, escolhido pelo usuário em 07/10/2026)

Dois produtos para prefeituras, vendidos separadamente

Produto 1 — Gestão Patrimonial: bens móveis, bens imóveis, inventário, vistorias e frota de veículos

Produto 2 — Gestão de Cemitério

Público-alvo de referência: Prefeitura Municipal de Rio do Sul/SC

Requisitos • Metodologias • Base legal • Concorrentes e SWOT • Estratégia de licitação

Versão 1.5 — 07/10/2026

Documento interno — não distribuir a terceiros

# Como ler este dossiê

| Marca | Significado |
|---|---|
| **[C]** | Confirmado em fonte pública consultada (lista de fontes no final). |
| **[D]** | Dedução ou proposta nossa. Não é fato verificado. |
| **[A conferir]** | Não consegui confirmar; checar antes de usar em proposta ou edital. |
| **(Pedido)** | Item que veio do texto original de vocês. |
| **(Adicionado)** | Item acrescentado por exigência legal, prática de mercado ou lacuna encontrada. |

## Histórico de versões

| Versão | Data | O que mudou |
|---|---|---|
| 1.0 | 23/09/2026 | Primeira versão: requisitos organizados, metodologias, base legal, concorrentes, SWOT, estratégia. |
| 1.1 | 26/09/2026 | **Reorganizado em 2 produtos principais, cada um vendido separadamente** (Parte A — Patrimônio; Parte B — Cemitério), com o mesmo nível de detalhe. **Pesquisa legal de bens móveis e imóveis aprofundada:** NBC TSP 37 (substitui a NBC TSP 07 a partir de 01/01/2027), prazos do PIPCP confirmados, IN TC-20/2015 do TCE/SC (demonstrativo de imóveis e frota), Nota Técnica CNM 23/2018, alienação e doação (Lei 14.133 art. 76), classificação dos bens públicos, áreas públicas de loteamentos. Novos requisitos: frota de veículos, regularização documental de imóveis, cessões/comodatos, avaliação para alienação. Roteiro em duas trilhas. Nenhum conteúdo da v1.0 foi retirado — só reorganizado ou ampliado. |
| 1.2 | 07/10/2026 | **Decisões do usuário registradas** na seção 1 (impedimento legal resolvido; sistema independente da IPM; equipes de trabalho e treinamento intensivo; apresentação e projetos-piloto no lugar de atestado). **Novo: reavaliação em blocos** por unidade e por outros filtros (Módulo 9, seções A1.13 e A2.13). **Novo: gestão de frota de veículos** completa, com contratos de locação, combustível e quilometragem, tendo o GAX (3ia) como referência (Módulo 10, seções A1.14 e A2.14). **Novo: aplicativo de campo piloto** em HTML, instalável em celular e tablet e funcionando sem internet (seção A2.15, pasta `app-campo/`; na v1.3 separado em `patrimonio/app-campo/` e `cemiterio/app-campo/`). O texto original das seções alteradas foi mantido, e as atualizações aparecem marcadas como "Atualização v1.2". |
| 1.3 | 07/10/2026 | **Nome provisório: VitalPat**, com logo (P sobre o V, T compartilhado entre VITAL e PAT, em outra cor e grande) — arquivo `app-campo/icones/logo-vitalpat.svg`. *Atualização 07/10/2026: logo substituída pelo escudo VitalPat (marinho e dourado fosco), aprovado pelo usuário.* **Relatórios visuais** e **exportação em planilha simples com escolha de colunas** (PB-04, PB-18 e PB-19). **Estrutura da planilha "Lista de chãos do cemitério"** registrada como modelo de importação (seção B5), sem os dados pessoais. **Decisão do usuário: os 2 produtos ficam no mesmo repositório, em pastas independentes** (`patrimonio/` e `cemiterio/`), sem código compartilhado; o app de campo foi separado em dois. Planilha de chãos limpa (só quadra, aléia e sepultura) em `cemiterio/modelos-importacao/`. |
| 1.4 | 07/10/2026 | **Seção A5:** as 47 telas do sistema concorrente (patrimônio) foram mapeadas função por função para uma versão VitalPat mais simples, visual e automática, sem excluir nenhuma função. Criado o sistema de gestão do patrimônio em `patrimonio/gestao/`. |
| 1.5 | 07/10/2026 | **Decisões do usuário:** manter as telas adaptadas do concorrente e somar a elas tudo o que está no dossiê (imóveis, manutenção, chamados, fotos, georreferenciamento); **servidor: Supabase** (já usado pelo usuário em outro projeto); a localização exata de cada túmulo será medida por **empresa especializada** contratada, e o sistema precisa estar pronto para receber esse levantamento (seção B6). Criado o sistema de gestão do cemitério em `cemiterio/gestao/` (etapa 1: túmulos, importação da lista de chãos, mapa por posição, painel, recebimento do levantamento). |
| 1.6 | 07/10/2026 | **Etapa 2 da Gestão do Cemitério construída:** vistorias (V1–V5), triagem de possível abandono pela seção B2 (o sistema só sugere; a pessoa decide; trava de segurança para "Abandono em apuração"), ordens de serviço e app de campo ampliado. Situação dos itens do B7 registrada logo abaixo da tabela do B7. |
| 1.7 | 07/10/2026 | **Etapa 3 da Gestão do Cemitério construída:** concessões, sepultamentos com agenda e funerárias, exumações com travas (prazo mínimo, abandono declarado, 2 testemunhas), ossário e painel de vagas. Prazos ajustáveis por município; D1 automático. Situação dos itens 7 e 8 do B7 registrada abaixo da tabela do B7. |
| 1.8 | 07/10/2026 | **Etapa 4 da Gestão do Cemitério construída (fluxo B2-D):** processo administrativo com notificação por e-mail e WhatsApp (carta com AR opcional, pendência jurídica), aviso no túmulo, edital em lote, prazos, defesa e termo de compromisso, decisão da autoridade e dossiê. Decisão do usuário: coluna "Data" da lista de chãos = data do título de aforamento. |
| 1.11 | 08/10/2026 | **Patrimônio — exportar, importar e anexos** (pedido do usuário, `manual.md`): Excel em toda exportação; importação de bens (móveis, veículos, imóveis) pelo modelo Excel com prévia e desfazer; anexos com tipo e exportação/importação em lote pelo nome `plaqueta_descricao_01`; **itens de controle** fora do balancete (limite padrão R$ 300, [A conferir] base legal); leitura da matrícula do imóvel em PDF. |
| 1.10 | 07/10/2026 | **Etapas 7 e 8 nos dois sistemas:** mapa sobre imagem com Leaflet (foto aérea do levantamento e/ou mapa de ruas do OpenStreetMap, que precisa de internet), link para o Google Maps e arquivo KML para o Google Earth; relatórios com fotos e mapa desenhado (funciona sem internet e sai na impressão). Patrimônio: mapa dos imóveis e localização na ficha. |
| 1.9 | 07/10/2026 | **Patrimônio:** etapa 5 (imóveis: documentos com validade, cessões e comodatos, pendências de regularização, demonstrativo para o TCE/SC), etapa 6 (manutenção: chamados com fluxo, preventiva automática, vistorias com checklist, equipes) e o restante da frota (pneus, reservas, cartão-combustível, dias parados); estado "Novo" no aplicativo de campo. |

# 1. Alertas críticos — ler antes de investir tempo e dinheiro

> **1.1 Impedimento legal por ser "insider" (bloqueador) — vale para os DOIS produtos.**
>
> Lei 14.133/2021, art. 9º, §1º: "Não poderá participar, direta ou indiretamente, da licitação ou da execução do contrato agente público de órgão ou entidade licitante ou contratante" **[C]**. O art. 14 também impede vínculo técnico, comercial, econômico ou familiar (até 3º grau) com dirigente ou com agente público que atue na licitação **[C]**.
>
> Os editais do cemitério de Rio do Sul (2025 e 2026) mandam as famílias ao **Departamento de Patrimônio / Divisão de Gestão Patrimonial** **[C]** — o mesmo setor que cuida dos bens. Enquanto algum sócio (ou parente, ou "sócio oculto") for servidor da Prefeitura de Rio do Sul, **a empresa não pode vender nenhum dos dois produtos para Rio do Sul** — nem por licitação, nem dispensa, nem subcontratação. Contornar (laranja, parente) leva a nulidade, sanções e improbidade (Lei 8.429/1992, alterada pela Lei 14.230/2021).
>
> **Na prática [D]:** o conhecimento interno serve para **desenhar o produto**, não para influenciar edital, termo de referência ou pesquisa de preços de Rio do Sul; vender **primeiro para outros municípios**; quem sair do cargo não deve ter participado de nada do processo; **consultar advogado de licitações antes de abrir CNPJ**. Isto não substitui parecer jurídico.
>
> **Atualização v1.2 (07/10/2026):** o usuário informou que o impedimento está **resolvido**. Nenhum documento (parecer, exoneração ou alteração societária) foi anexado a este dossiê. Recomendação: guardar o documento que comprova a solução junto com o projeto, porque ele pode ser pedido em impugnação de licitação.

> **1.2 Já existe fornecedor instalado — e ele é da cidade.**
>
> Rio do Sul usa o **IPM Atende.Net** desde 2013 (contabilidade, financeiro, RH, compras e **patrimônio**) **[C]**. A IPM tem fábrica em Rio do Sul **[C]** e oferece **módulo de Cemitérios** **[C]**.
>
> **Consequência [D]:** o Decreto 10.540/2020 exige **SIAFIC único** por ente. Os dois produtos precisam ser **complementares e integrados** ao SIAFIC, e não um segundo sistema contábil. "Serfic" foi interpretado como **SIAFIC** — confirmar.
>
> **Atualização v1.2 (07/10/2026):** decisão do usuário: o sistema será **independente** (funciona sozinho, sem depender da IPM). Isso continua valendo: o sistema **não faz lançamento contábil** (Decreto 10.540/2020). Quando a prefeitura quiser os valores na contabilidade, a saída é um arquivo ou relatório para o setor contábil lançar no sistema oficial **[D]**.

> **1.3 Escopo × equipe.**
>
> Dois produtos independentes, cada um vendido separado, é uma boa decisão comercial (licitações e clientes diferentes). Mas o Produto 1 sozinho equivale a vários módulos de ERP. Com 2–3 pessoas, **desenvolver os dois ao mesmo tempo dobra o prazo de cada um**. Recomendação **[D]**: cada produto com uma versão mínima vendável (seção C2) e um responsável por produto, ou lançar um e o outro em seguida — decisão de vocês.
>
> **Atualização v1.2 (07/10/2026):** decisão do usuário: montar **equipes de trabalho** e fazer **treinamento intensivo**.

> **1.4 Itens que dependem de vocês.**
>
> • As **2 planilhas do cemitério** não chegaram a esta conversa — preciso do cabeçalho completo.
>
> • "Emissão das notas fiscais": a Prefeitura **recebe** notas; interpretei como captura automática + prestação de contas. Confirmar.
>
> • "Tabela nossa" de valor residual e vida útil: precisamos da tabela oficial vigente (decreto/portaria municipal).

# 2. Resumo executivo

|  | Produto 1 — Gestão Patrimonial | Produto 2 — Gestão de Cemitério |
|---|---|---|
| O que é | Plataforma web + app de campo para controlar, **por unidade**, bens móveis, imóveis, documentos, responsáveis, manutenções, demandas e custos; inventário anual assistido; vistorias; depreciação e reavaliação; captura de notas; pesquisa de preços; painéis por fundo e centro de custo; **reavaliação em blocos**; **gestão de frota** (locação, combustível, km) | Cadastro georreferenciado de +6.000 túmulos, concessões, sepultamentos, exumações e ossário, com metodologia legal para identificar e tratar ~1.000 túmulos possivelmente abandonados |
| Dor principal do comprador | Inventário anual, conciliação com a contabilidade, cumprimento da NBC TSP (nova NBC TSP 37 em 2027), bens "sumidos" entre unidades | Cemitério lotado, cadastro em papel/planilha, risco jurídico ao retomar túmulos |
| Diferencial | Trabalho de campo (app offline, QR, foto+GPS), inventário que resolve bens que mudam de local, visão 360° por unidade, score de bens | Metodologia de abandono com processo administrativo completo (não encontrada nos concorrentes) |
| Concorrentes | IPM, Betha, CPCON; preços: Banco de Preços, ATA360 | IPM (módulo Cemitérios), Betha |
| Como vende | Licitação própria ou lote próprio | Licitação própria ou lote próprio |

**Principais riscos (comuns aos dois):** impedimento legal (1.1), concorrente incumbente local (1.2), falta de atestados de capacidade técnica (seção C1) e escopo (1.3).

**Oportunidade de momento [D]:** a **NBC TSP 37 entra em vigor em 01/01/2027** e revoga a NBC TSP 07 **[C]** — prefeituras vão precisar revisar política de depreciação, reavaliação, componentes e bens de infraestrutura. Bom argumento de venda para o Produto 1.

# PARTE A — PRODUTO 1: GESTÃO PATRIMONIAL

Bens móveis, bens imóveis, inventário anual, vistorias, demandas das unidades, notas fiscais, pesquisa de preços e painéis financeiros. **Vendido separadamente do Produto 2.** Todos os itens pedidos para "vistorias e inventário" estão aqui.

## A1. Requisitos organizados por módulo

Todos os itens do texto original foram mantidos. Itens repetidos foram unidos em um só (lista na seção A1.12). Itens parecidos, mas diferentes, foram mantidos separados e sinalizados.

### A1.1 Módulo 0 — Plataforma base (vale para todos os módulos)

| ID | Requisito | Origem | Observação |
|---|---|---|---|
| PB-01 | Banco de dados com metodologia clara (dicionário de dados, identificador único por bem/túmulo/unidade, histórico de alterações) | Pedido | Detalhado na seção A2.1 |
| PB-02 | Usuários múltiplos, cada um com limitações próprias, e **admin central** que ajusta o acesso de cada um | Pedido | Perfis + escopo por unidade/centro de custo (A2.9) |
| PB-03 | Dois ambientes: **Gestor** (tudo + relatórios gerenciais) e **Operador** (cadastro e checagem; relatórios só do próprio trabalho) | Pedido |  |
| PB-04 | Importar e exportar em todas as telas; na exportação escolher o que exportar da aba atual | Pedido | Unido: "funções de exportar/importar" + "botões de importar e exportar". v1.3: detalhado em PB-18 e PB-19 |
| PB-05 | Importação segura com **De/Para**, sem sobrescrever o que não deve, guardando o registro anterior sem duplicar, com escolha do que fazer em cada caso | Pedido (melhorar) | Metodologia proposta na seção A2.2 |
| PB-06 | Backup de todos os bens móveis e imóveis cadastrados | Pedido | Ampliado para backup de toda a base + teste de restauração (A2.1) |
| PB-07 | Georreferenciamento e rastreabilidade no que couber | Pedido | Mapa de unidades, bens, túmulos, vistorias |
| PB-08 | IA e outras funções para relatórios e insights | Pedido | Com evidência/fonte em cada resposta (A2.10) |
| PB-09 | Configurações: parte admin, layout e outros | Pedido |  |
| PB-10 | Trilha de auditoria imutável (quem, quando, o quê, valor antes/depois) | Adicionado | Exigência prática de controle interno e TCE |
| PB-11 | "Excluir" = mover para Lixeira (restaurável); exclusão definitiva só por admin, com registro | Adicionado | Evita perda de histórico patrimonial |
| PB-12 | Conformidade com LGPD (Lei 13.709/2018): base legal, registro de acessos e exportações, mascaramento de CPF | Adicionado | Cemitério tem dados de familiares vivos |
| PB-13 | Login com 2 fatores; opção de login gov.br | Adicionado |  |
| PB-14 | Aplicativo de campo que funciona **sem internet** e sincroniza depois | Adicionado | Cemitérios e unidades rurais costumam ter sinal ruim |
| PB-15 | Assinatura eletrônica de termos (responsabilidade, transferência, laudo) | Adicionado |  |
| PB-16 | Integrações: SIAFIC/IPM, PNCP, SEFAZ (NF-e), Ambiente Nacional NFS-e, Portal da Transparência | Adicionado | Seção A2.11 |
| PB-17 | Acessibilidade e linguagem simples, sem jargão técnico nas telas | Adicionado |  |
| PB-18 | **Relatórios visuais**: gráficos, mapas, fotos, cores por situação e resumo no topo; prontos para imprimir ou salvar em PDF | Pedido (v1.3) | Vale para todos os relatórios gerados pelo sistema |
| PB-19 | **Exportação em planilha simples** (CSV/Excel, sem formatação e sem gráficos), com escolha de **quais informações (colunas) entram**; a escolha pode ser salva como **modelo de exportação** por sistema de destino (ex.: "Planilha para o sistema X") | Pedido (v1.3) | Cada sistema de destino aceita só parte das informações. Já no piloto do app: escolha de colunas, lembrada no aparelho |

### A1.2 Módulo 1 — Unidades (visão 360°: móveis + imóvel juntos)

| ID | Requisito | Origem | Observação |
|---|---|---|---|
| UN-01 | Ala unificada de bens móveis e imóveis por unidade: escolho uma escola e vejo tudo dela | Pedido |  |
| UN-02 | Documentos do imóvel (matrícula, escritura, habite-se, AVCB, plantas, laudos) e dos bens | Pedido | Lista de documentos com validade e alerta |
| UN-03 | Responsável(is) pelo imóvel e pelos bens — um ou mais por centro de custo | Pedido | Unido com "responsável 1 ou mais em cada centro" |
| UN-04 | Várias abas dentro da unidade (dados, bens, documentos, fotos, manutenções, demandas, custos, mapa, histórico) | Pedido |  |
| UN-05 | Incluir documentos e fotos; importar; preencher automaticamente quando possível (OCR/IA) | Pedido |  |
| UN-06 | Termo de responsabilidade por unidade, renovado na troca do responsável | Adicionado | Evita "bem sem dono" |

### A1.3 Módulo 2 — Bens móveis e imóveis

| ID | Requisito | Origem | Observação |
|---|---|---|---|
| BM-01 | Cadastro completo com abas, documentos, fotos, importação | Pedido |  |
| BM-02 | Rastreabilidade de bens entre unidades com histórico de movimentações | Pedido | Transferência com aceite do recebedor |
| BM-03 | Score dos bens (móveis e imóveis) para amortização, depreciação, reformas e manutenção | Pedido | Metodologia A2.4 |
| BM-04 | Depreciação e amortização | Pedido | A2.5 |
| BM-05 | Valor residual conforme tabela nossa + alerta ao alterar, com explicação obrigatória | Pedido | A2.5 |
| BM-06 | Alertas de reavaliação de móveis e imóveis com base na lei + reavaliação em massa | Pedido | A2.5; ampliado na v1.2 para **reavaliação em blocos** (Módulo 9, A1.13 e A2.13) |
| BM-07 | Selecionar rua/escola/unidade e lançar investimento de obra que aumenta vida útil e valor contábil (pintura, recapeamento, tubulação) | Pedido | Atenção: nem todo gasto aumenta valor — A2.5 |
| BM-08 | Controle por tempo das manutenções (limpeza de ar-condicionado, pintura etc.) | Pedido | Planos preventivos A2.6 |
| BM-09 | Plaqueta com QR Code (opção RFID) por bem | Adicionado |  |
| BM-10 | Baixa de bens (inservível, alienação, leilão, doação, furto) com processo e documentos | Adicionado |  |
| BM-11 | Bens de terceiros, cedidos e em comodato separados dos próprios | Adicionado |  |
| BM-12 | Garantias, seguros e contratos de manutenção vinculados ao bem | Adicionado |  |
| BM-13 | Bens de infraestrutura (ruas, redes, pontes) e intangíveis (softwares) como classes próprias | Adicionado | Exigência do MCASP / PIPCP |
| BM-14 | Incorporação do bem a partir do item da nota fiscal (já com valor e fornecedor) | Adicionado | Liga módulo de NF ao patrimônio |
| BM-15 | **Frota de veículos** como classe própria: custos (combustível, manutenção, seguro, IPVA/licenciamento), quilometragem, responsável | Adicionado | O TCE/SC pede demonstrativo da frota com custos no relatório de gestão (IN TC-20/2015, Anexo V) [C]. Na v1.2 virou o **Módulo 10 — Frota** (A1.14 e A2.14) |
| BM-16 | **Situação documental de cada imóvel**: matrícula, cartório, área, uso, pendências de registro; lista de imóveis "sem registro" | Adicionado | IN TC-20/2015 pede demonstrativo de imóveis e bens não registrados [C]; A2.12 |
| BM-17 | Classificação do imóvel: uso comum do povo, uso especial ou dominical (afetado/desafetado) | Adicionado | Código Civil arts. 98–103; define se pode ser vendido [D] |
| BM-18 | Áreas públicas recebidas de loteamentos (verdes, institucionais, sistema viário) cadastradas e mapeadas | Adicionado | Lei 6.766/1979 art. 22 [D]; A2.12 |
| BM-19 | Cessões, permissões, concessões de uso e comodatos de imóveis (a terceiros e de terceiros), com prazo e alerta de vencimento | Adicionado |  |
| BM-20 | Alienação e doação com requisitos da lei: interesse público justificado, avaliação prévia, autorização legislativa (imóveis), leilão | Adicionado | Lei 14.133 art. 76 [C]; complementa BM-10 |
| BM-21 | Componentes significativos depreciados separadamente (ex.: telhado, elevador, sistema elétrico de um prédio) | Adicionado | NBC TSP 37 [C] |
| BM-22 | Teste de redução ao valor recuperável (bem danificado, obsoleto, ocioso) | Adicionado | NBC TSP 09 [C via fonte secundária] |

### A1.4 Módulo 3 — Inventário anual (TCE/SC)

| ID | Requisito | Origem | Observação |
|---|---|---|---|
| IN-01 | Módulo que facilite o inventário anual exigido | Pedido | Lei 4.320/64 arts. 94–96; prestação de contas ao TCE/SC |
| IN-02 | Resolver bem que troca de local **depois** de inventariado e é lido de novo em outro local | Pedido | Solução A2.3 |
| IN-03 | Resolver bem que sai de local **ainda não inventariado** e vai para local **já concluído**, ficando de fora | Pedido | Solução A2.3 |
| IN-04 | Comissão de inventário com designação por ato, relatório final e conciliação físico × cadastro × contábil | Adicionado |  |

### A1.5 Módulo 4 — Vistorias e equipes

| ID | Requisito | Origem | Observação |
|---|---|---|---|
| VI-01 | Dashboard para coordenar vistorias físicas em diversos locais e equipes | Pedido | Unido com item "Vistorias" da lista de dashboards |
| VI-02 | Gestor cria demandas para cada membro da equipe e acompanha | Pedido | Diferente de DE-01 (demandas da unidade) |
| VI-03 | Workflow de trabalho | Pedido | Etapas configuráveis: aberta → em campo → revisão → concluída |
| VI-04 | Indicadores e não conformidades | Pedido |  |
| VI-05 | Plano de manutenção e aprimoramento | Pedido | Gerado a partir das vistorias e do score |
| VI-06 | Checklists por tipo de vistoria; fotos com GPS, data e hora gravados | Adicionado | Prova para processo administrativo |

### A1.6 Módulo 5 — Demandas das unidades

| ID | Requisito | Origem | Observação |
|---|---|---|---|
| DE-01 | Rastrear demandas nas unidades: físicas (reformas, manutenção), pedidos e outras | Pedido |  |
| DE-02 | Parte contábil das demandas (custo previsto × realizado por unidade) | Pedido |  |
| DE-03 | Prazo e responsável por demanda; histórico | Adicionado |  |

### A1.7 Módulo 6 — Financeiro, contábil e fundos (painéis)

| ID | Requisito | Origem | Observação |
|---|---|---|---|
| FI-01 | Dashboard contábil e financeiro, incluindo fundos, cada um separadamente e consolidado | Pedido | Unido com item "Financeiro" da lista de dashboards. Lê dados do SIAFIC — não lança contabilidade |
| FI-02 | Portfólio de ativos móveis e imóveis por centro de custo e responsável (1 ou mais) | Pedido |  |
| FI-03 | Financeiro e conformidade | Pedido | Diferente de FI-01: foca em pendências legais (reavaliação vencida, inventário, documentos) |
| FI-04 | Estratégias e aproveitamento (relatórios e insights gerenciais) | Pedido | Ex.: imóveis ociosos, bens parados |
| FI-05 | Conciliação mensal patrimônio × contabilidade por conta contábil | Adicionado | Diferenças geram alerta |
| FI-06 | Relatórios prontos para a prestação de contas ao TCE/SC: demonstrativo de imóveis, de frota e de bens não registrados; notas explicativas da política de depreciação/reavaliação | Adicionado | IN TC-20/2015 Anexo V [C]; PIPCP exige divulgar a política em notas [C] |

### A1.8 Módulo 7 — Notas fiscais e prestação de contas

| ID | Requisito | Origem | Observação |
|---|---|---|---|
| NF-01 | Leitura/importação automática de notas emitidas no nome da Prefeitura e dos fundos (CNPJs próprios) | Pedido | Unido: "importar NF automaticamente" + "leitura automática". A2.7 |
| NF-02 | Importação manual para notas anteriores à criação do sistema | Pedido | XML, PDF com OCR |
| NF-03 | Prestação de contas a partir das notas | Pedido | "Emissão" a confirmar (1.4) |
| NF-04 | Vínculo nota → empenho/liquidação (SIAFIC) → bem incorporado | Adicionado |  |

### A1.9 Módulo 8 — Pesquisa de preços

| ID | Requisito | Origem | Observação |
|---|---|---|---|
| PP-01 | Pesquisa de preços com base no mercado da cidade ou regional, com fontes confiáveis e em massa | Pedido (melhorar) | Metodologia A2.8 |
| PP-02 | Relatórios visíveis em sites e locais autorizados, de forma segura | Pedido | Publicação controlada; respeitar orçamento sigiloso quando adotado |
| PP-03 | Memória de cálculo e fontes arquivadas (link, print, data/hora) | Adicionado | Exigência da IN SEGES 65/2021 e do TCU |

### A1.10 Lista de painéis (dashboards) pedida

| Painel | Público | Conteúdo principal |
|---|---|---|
| Financeiro | Gestor | Valores por unidade, fundo, centro de custo; depreciação acumulada |
| Portfólio de ativos (móveis e imóveis) por centro de custo e responsável | Gestor | Quantidade, valor, estado, responsável |
| Estratégias e aproveitamento | Gestor | Insights: ociosidade, bens parados, custo de manter × substituir |
| Vistorias | Gestor / Operador | Agenda, equipes, mapa, pendências |
| Plano de manutenção e aprimoramento | Gestor | Preventivas vencendo, obras, prioridades por score |
| Financeiro e conformidade | Gestor | Pendências legais e prazos |
| Configurações | Admin | Perfis, layout, tabelas, integrações |
| Indicadores e não conformidades | Gestor | Por unidade, equipe, tipo |
| Workflow de trabalho | Gestor / Operador | Demandas por pessoa e etapa |

Botões de importar e exportar presentes em todos os painéis (PB-04).

### A1.11 Restrições legais (pedido)

O texto pede que "restrições legais sejam um problema a ser superado" e cita integração com SIAFIC ("Serfic") e Tribunal de Contas. Tratado nas seções 1, A2.11 e A3. Importante: restrição legal se **cumpre**, não se contorna — o produto ganha valor exatamente por já nascer em conformidade.

### A1.12 Itens duplicados unidos

| Texto original (repetido) | Virou |
|---|---|
| "Funções de exportar… e importar" + "Ter botões de importar e exportar" | PB-04 |
| "Importar notas fiscais automaticamente" + "leitura automática de notas expedidas…" | NF-01 |
| "Dashboard para a parte contábil e financeira" + painel "Financeiro" | FI-01 |
| "Dashboard para coordenar vistorias" + painel "Vistorias" | VI-01 |
| "Responsável por aquele imóvel" + "responsável (podendo ter 1 ou mais em cada centro)" | UN-03 |
| "Depreciação/amortização" (aparece 2 vezes) | BM-04 |

**Parecidos, mas mantidos separados:** demandas da equipe (VI-02) × demandas da unidade (DE-01); Financeiro (FI-01) × Financeiro e conformidade (FI-03); rastreabilidade de bens entre unidades (BM-02) × georreferenciamento geral (PB-07); workflow (VI-03) × criação de demandas pelo gestor (VI-02).

### A1.13 Módulo 9 — Reavaliação em blocos (novo na v1.2)

| ID | Requisito | Origem | Observação |
|---|---|---|---|
| RB-01 | Reavaliar bens **em bloco** escolhendo por **unidade** (uma ou várias) | Pedido (v1.2) | Amplia BM-06 |
| RB-02 | Reavaliar em bloco por **outros filtros**, que podem ser combinados: classe/grupo de bem, conta contábil, centro de custo, fundo, secretaria, bairro/região (mapa), responsável, estado de conservação, faixa de score, faixa de valor contábil, data/ano de aquisição, % de vida útil consumida, bens totalmente depreciados ainda em uso, bens sem reavaliação há X anos, marcadores livres | Pedido (v1.2) | Os filtros podem ser salvos como modelo |
| RB-03 | **Prévia antes de aplicar**: lista dos bens do bloco, valor atual × valor novo, diferença em R$ (total e por conta contábil), quantidade de bens | Adicionado | Mesma lógica da importação (A2.2) |
| RB-04 | Forma de calcular o valor novo no bloco: valor informado bem a bem, percentual sobre o valor atual, tabela de referência (ex.: planta genérica do IPTU para imóveis) ou importação de planilha do laudo | Adicionado |  |
| RB-05 | Ajuste item a item dentro do bloco (tirar bem, mudar valor, mudar vida útil restante) com justificativa | Adicionado |  |
| RB-06 | Laudo da comissão anexado ao bloco; designação da comissão e assinaturas | Adicionado | Nota Técnica CNM 23/2018 [C] |
| RB-07 | Aprovação em duas etapas (comissão → setor contábil) antes de valer | Adicionado |  |
| RB-08 | **Controle da classe inteira:** se o bloco escolhido tem só parte de uma classe de bens, o sistema avisa e mostra quanto da classe falta reavaliar no ciclo | Adicionado | A reavaliação vale para a classe inteira, e não para itens escolhidos [C via fonte secundária]. Ver A2.13 |
| RB-09 | Desfazer o bloco inteiro enquanto não houver lançamento posterior; o valor anterior vai para o histórico (sem apagar) | Adicionado | Mesma regra de PB-11 |
| RB-10 | Relatório do bloco (PDF/Excel) com memória de cálculo, para o processo e para o setor contábil | Adicionado |  |

### A1.14 Módulo 10 — Frota de veículos (novo na v1.2)

*Atualização 07/10/2026: aba Frota implementada na Gestão do Patrimônio (`patrimonio/gestao/js/telas-frota.js`) com FR-01 a FR-11, FR-14 e FR-16 (custos já no relatório de veículos) e FR-17 (app de campo). Faltam FR-12 (pneus), FR-13 (reservas) e FR-15 (cartão-combustível).*

*Atualização 07/10/2026 (2): FR-12 (pneus), FR-13 (reservas por secretaria), FR-15 (arquivo do cartão-combustível, com prévia e desfazer) e os dias parados do FR-03 implementados em `patrimonio/gestao/js/telas-frota2.js`.*

Referência de mercado pedida pelo usuário: **GAX (3ia)** — ver A4. Os itens marcados "GAX" são funções que o GAX divulga publicamente; os demais foram acrescentados.

| ID | Requisito | Origem | Observação |
|---|---|---|---|
| FR-01 | Cadastro do veículo: placa, RENAVAM, chassi, marca/modelo, ano, combustível, capacidade do tanque, tipo (próprio, **locado**, cedido), unidade e secretaria, responsável, fotos e documentos (CRLV, seguro) | Pedido (v1.2) | Veículo próprio também é bem patrimonial (BM-15); veículo locado **não** entra no patrimônio (BM-11) |
| FR-02 | **Contratos de locação de veículos**: contrato e aditivos, empresa, vigência, valor mensal por veículo, franquia de km, valor do km excedente, veículo reserva, quem paga manutenção e combustível; alertas de vencimento e de saldo do contrato | Pedido (v1.2) |  |
| FR-03 | Conferência mensal da locação: km rodado × franquia, dias parados, substituições → valor a pagar previsto, para conferir a fatura da locadora | Adicionado |  |
| FR-04 | **Abastecimentos**: data/hora, veículo, motorista, posto, combustível, litros, valor, **km no painel**, foto do cupom e do painel | Pedido (v1.2) / GAX |  |
| FR-05 | **Consumo médio** (km/l) por veículo, modelo e secretaria, com gráfico de 30 dias a 1 ano | Pedido (v1.2) / GAX | [C via resultado de busca] |
| FR-06 | **Alertas de inconsistência**: km menor que o anterior, litros acima da capacidade do tanque, consumo fora da média, dois abastecimentos em pouco tempo, combustível diferente do veículo, abastecimento com veículo marcado como parado | Adicionado / GAX | O GAX divulga análise automática de inconsistências com alarme ao gestor [C via resultado de busca] |
| FR-07 | **Controle de km**: diário de bordo (saída e retorno, km inicial e final, destino, motivo, motorista), com bloqueio de km regressivo | Pedido (v1.2) |  |
| FR-08 | Manutenção preventiva por km **ou** por tempo (troca de óleo, revisão, pneus, filtros), e corretiva com orçamento e ordem de serviço | Adicionado / GAX | O GAX importa orçamentos de manutenção pelo sistema Audatex/Molicar [C via resultado de busca] — integração [A conferir] |
| FR-09 | Motoristas: CNH (número, categoria, validade), curso obrigatório quando houver, bloqueio de motorista com CNH vencida ou de categoria incompatível | Adicionado |  |
| FR-10 | Multas: registro, identificação do condutor, prazos de indicação e recurso | Adicionado |  |
| FR-11 | Documentos e obrigações: licenciamento, seguro, tacógrafo (quando houver), com alerta de vencimento | Adicionado |  |
| FR-12 | Pneus: controle por posição, rodízio, recapagem, km por pneu | Adicionado |  |
| FR-13 | Agendamento/reserva de veículos por secretaria | Adicionado |  |
| FR-14 | Painel da frota: veículos ativos, parados e em manutenção, consumo e custo do dia/mês, **custo por km** por veículo e por secretaria, próprio × locado | Pedido (v1.2) / GAX |  |
| FR-15 | Integração com cartão-combustível e postos credenciados (arquivo ou API da administradora), quando a prefeitura tiver esse contrato | Adicionado | O GAX usa cartão magnético e terminal no posto [C via resultado de busca]. Para nós: importar o arquivo da administradora [D] |
| FR-16 | **Demonstrativo da frota com custos** pronto para a prestação de contas ao TCE/SC | Adicionado | IN TC-20/2015 Anexo V [C]; já previsto em FI-06 |
| FR-17 | Uso no **aplicativo de campo**: abastecimento, saída/retorno com km e checklist do veículo (pneus, luzes, avarias) com foto | Adicionado | Já no piloto (A2.15) |

## A2. Metodologias propostas — Produto 1

Tudo nesta seção é proposta **[D]**, salvo quando marcado **[C]**.

### A2.1 Banco de dados e backup

- **Banco relacional com mapa** (ex.: PostgreSQL + PostGIS, ambos de código aberto e mantidos) — guarda os dados e as coordenadas no mesmo lugar.
- **Um identificador único e permanente** para cada unidade, bem, túmulo, pessoa e documento. O número da plaqueta pode mudar; o identificador interno, nunca.
- **Tabela de eventos que não se apaga:** toda movimentação, avaliação, manutenção, vistoria, importação e alteração vira um evento com data, usuário, valor antes e depois. O "cadastro atual" é o resultado desses eventos — por isso sempre dá para saber como estava em qualquer data (essencial para inventário e auditoria).
- **Dicionário de dados publicado** (o que significa cada campo, formato, quem pode alterar).
- **Backup:** cópia automática diária + recuperação ponto a ponto, uma cópia em outro local, e **teste de restauração mensal com registro** (backup sem teste de restauração não é prova de nada). Exportação completa da base disponível à Prefeitura a qualquer momento (evita "refém do fornecedor", tema comum em editais).
- Hospedagem em nuvem com data center no Brasil.

### A2.2 Importação segura com De/Para (melhoria pedida)

Objetivo: importar planilhas (inclusive os layouts do cemitério) sem estragar o que já existe.

1. **Área de espera:** o arquivo entra numa área separada. Nada toca a base oficial ainda.
1. **De/Para de colunas:** a pessoa liga cada coluna do arquivo a um campo do sistema. O mapeamento pode ser salvo como **modelo** (ex.: "Layout Cemitério — planilha 1").
1. **De/Para de valores:** ex.: "E.M. Prof. X" → unidade "Escola Municipal Professor X"; "BOM" → estado "3".
1. **Chave de comparação:** define como o sistema reconhece que é o mesmo registro (nº patrimônio; quadra+aléia+lote; CPF do titular etc.).
1. **Prévia por linha**, com cada registro classificado em: **Novo** / **Igual** (ignorado) / **Alterado** (mostra valor antigo × novo, campo a campo) / **Conflito** (duas linhas para o mesmo registro) / **Erro** (dado inválido).
1. **Escolha do usuário** por linha, por campo ou em lote: aplicar, ignorar, criar como novo, mandar para revisão.
1. **Campos protegidos:** campos marcados como "não sobrescrever por importação" (ex.: valor contábil, data de aquisição) só mudam por tela própria com justificativa.
1. **Sem duplicar:** o valor anterior vai para o histórico do mesmo registro (evento), não vira um registro novo.
1. **Desfazer a importação inteira** (lote identificado) enquanto não houver alteração posterior.
1. **Tela de resultado real**: quantos entraram, quantos falharam e o motivo de cada falha, com download da lista.

**Exportação:** em qualquer aba, escolher colunas, filtros e formato (Excel, CSV, PDF, JSON). Toda exportação com dado pessoal fica registrada (LGPD).

### A2.3 Inventário anual — solução para bens que mudam de local

**Problema pedido:** (a) bem inventariado no local A é movido e lido de novo no local B; (b) bem sai do local A (ainda não inventariado) para o local B (já concluído) e fica de fora.

### Regras propostas

1. **Data de corte:** ao abrir o ciclo, o sistema tira uma "foto" de onde cada bem deveria estar.
1. **Cada bem é inventariado uma vez por ciclo.** O controle é **por bem**, não por local.
1. **Caso (a):** na segunda leitura, o app avisa "já inventariado em A em dd/mm". O operador escolhe: foi movido (gera transferência A→B com aceite) ou erro de leitura (ignora). Nunca conta duas vezes.
1. **Caso (b):** como o controle é por bem, concluir o local B não "fecha" os bens que chegam depois. Toda transferência durante o ciclo cria para o recebedor uma **tarefa "confirmar recebimento"** com leitura do QR. Se a leitura acontece, o bem sai da pendência de A e fica inventariado em B.
1. **Movido sem registro:** o bem aparece como "não localizado" em A e, se lido em B, como "sobra". O sistema cruza sobras × não localizados de todas as unidades automaticamente e propõe o casamento (confirmação humana).
1. **Varredura final ("procura-se"):** antes de encerrar o ciclo, a lista de não localizados vai para todas as unidades com foto do bem.
1. **Opção de congelamento:** durante a janela do inventário, transferências só com dupla aprovação.
1. **Encerramento:** relatório da comissão com: localizados, localizados em outro local, não localizados, sobras, sem plaqueta, a baixar; e **conciliação com o saldo contábil** por conta.

### A2.4 Score de bens (móveis e imóveis)

| Componente | Peso sugerido | Fonte |
|---|---|---|
| Estado de conservação na última vistoria (1 a 5) | 35% | Vistoria com foto |
| Vida útil já consumida (%) | 25% | Tabela de vida útil |
| Manutenções preventivas em dia (%) | 20% | Plano de manutenção |
| Custo de manutenção acumulado ÷ valor do bem | 10% | Notas e demandas |
| Criticidade de uso (ex.: bem essencial em escola/posto) | 10% | Cadastro |

Resultado de 0 a 100 → faixas: **manter**, **atenção**, **reformar**, **substituir/baixar**. Os pesos são configuráveis pelo admin. **Importante:** o score **não substitui** o cálculo contábil — ele serve para priorizar manutenção e como **evidência para revisar vida útil e valor residual**, que a norma contábil manda revisar pelo menos uma vez por ano (NBC TSP 07 hoje; NBC TSP 37 a partir de 01/01/2027) **[D]**.

### A2.5 Depreciação, valor residual, reavaliação e obras

- **Depreciação:** método linear como padrão (o mais usado no setor público segundo o MCASP), mensal, por classe de bem, com tabela de vida útil e valor residual **da Prefeitura** (decreto/portaria municipal).
- **Antes de depreciar — saneamento inicial:** inventário físico, conferência com o registro contábil, tratamento de faltas e sobras, e avaliação dos bens usados que nunca foram depreciados. A Nota Técnica CNM 23/2018 recomenda esse passo e uma **comissão de pelo menos 3 servidores** que emite laudo com descrição, critério de valor, vida útil restante e data **[C]**. O sistema deve ter o fluxo dessa comissão (designação, laudo, assinatura).
- **Tabela de referência:** a CNM cita tabela de referência da STN com vida útil de 5 a 15 anos e valor residual de 10% a 20% conforme o tipo de bem **[C]** — a tabela oficial é a do município (decreto). O sistema vem com a tabela de referência pré-carregada, marcada como "sugestão", até a Prefeitura aprovar a sua.
- **Componentes:** partes com custo significativo (telhado, elevador, sistema elétrico) depreciadas separadamente — exigência reforçada pela NBC TSP 37 **[C]**. **Terrenos não são depreciados** **[D]**.
- **Bem totalmente depreciado ainda em uso:** continua no cadastro até a baixa; se ainda gera serviço, pode ser reavaliado com nova vida útil **[C — CNM]**.
- **Alterar a tabela (valor residual ou vida útil):** exige justificativa escrita, anexo do ato que aprovou e aplica **daqui para frente** (mudança de estimativa — não recalcula o passado). O sistema mostra antes de salvar o impacto em R$ e quantos bens são afetados.
- **Periodicidade de reavaliação:** o MCASP indica **anual** para bens cujo valor de mercado muda muito e intervalos de **3 a 5 anos** para os demais **[C via fonte secundária]**; a NBC TSP 37 mantém a regra de "suficiente regularidade", de anual a 3–5 anos **[C]**; a CNM sugere 4 anos para os demais **[C]**. A reavaliação vale para a **classe inteira** de bens, não para itens escolhidos **[C via fonte secundária]**. O prazo exato fica na política contábil do município (configurável no sistema).
- **Alerta de reavaliação:** por prazo definido na política contábil do município e por gatilhos (valor contábil muito distante do de mercado, bem totalmente depreciado ainda em uso, dano relevante). **Reavaliação em massa** por classe, unidade ou região, com laudo da comissão anexado; para imóveis, usar como referência a planta genérica de valores do IPTU **[D]**.
- **Obra que aumenta vida útil e valor (pedido BM-07):** o sistema separa dois tipos de gasto:
  - **Melhoria (capitaliza):** aumenta capacidade, vida útil ou potencial de serviço — ex.: recapeamento completo, troca de toda a tubulação, ampliação. Soma ao valor contábil e recalcula a vida útil restante.
  - **Manutenção (despesa):** mantém o bem como está — ex.: limpeza, reparo pontual, **pintura comum**. Não aumenta o valor contábil.

> **Correção direta:** pintura, na maioria dos casos, é manutenção e **não** aumenta valor contábil. Lançar pintura como melhoria infla o patrimônio e pode ser apontado pelo TCE. O sistema deve perguntar o tipo e pedir aprovação do setor contábil para capitalizar.

- **Ruas, redes e similares** são bens de infraestrutura — classe própria, com mapa por trecho (ex.: trecho de rua entre dois cruzamentos).

### A2.6 Manutenção preventiva por tempo

| Item | Por que controlar | Base |
|---|---|---|
| Ar-condicionado (limpeza, PMOC) | Plano de Manutenção, Operação e Controle obrigatório em prédios de uso público e coletivo climatizados | Lei 13.589/2018 [A conferir detalhes] |
| Extintores e sistemas de incêndio / AVCB | Validade do atestado do Corpo de Bombeiros | Normas do CBMSC [A conferir] |
| Limpeza de caixas d'água | Periodicidade sanitária | Normas de saúde [A conferir] |
| Pintura, telhado, calhas, instalações elétricas, SPDA (para-raios) | Conservação e segurança | Política interna |

Cada plano gera tarefas automáticas com antecedência configurável, vinculadas à unidade e ao responsável, com comprovação por foto/nota.

### A2.7 Notas fiscais — captura automática

- **NF-e (produtos):** serviço oficial de Distribuição de Documentos Fiscais da SEFAZ/Receita, consultado por CNPJ (Prefeitura e cada fundo), usando certificado digital de cada CNPJ. Baixa o XML automaticamente **[D — mecanismo padrão do mercado]**.
- **NFS-e (serviços):** desde 01/01/2026 os municípios são obrigados ao padrão nacional (LC 214/2025) e o Ambiente de Dados Nacional distribui as notas também para o **tomador** **[C]**. Notas antigas de sistemas municipais: importação de XML/PDF.
- **Notas anteriores ao sistema:** importação manual em lote (XML) ou PDF com leitura automática (OCR) e conferência humana.
- **Uso:** cada nota é ligada ao fundo/CNPJ, ao empenho e liquidação do SIAFIC e, se for bem permanente, gera a **pré-incorporação** do bem com valor e fornecedor.

### A2.8 Pesquisa de preços (melhoria pedida)

A Lei 14.133/2021, art. 23, define os parâmetros e o TCU proíbe pesquisa baseada só em cotação de fornecedores (Acórdão 3059/2020, citado em fonte secundária) **[C]**. Atenção: o **Painel de Preços** do governo federal parou de ser atualizado em **04/07/2025** (Comunicado 30/2025) **[C]** — isso abre espaço para ferramentas que juntem as fontes.

| Fonte | Como o sistema usa |
|---|---|
| PNCP e Compras.gov.br (dados abertos) | Busca automática de contratos e atas similares, com filtro por região (SC / Alto Vale) |
| Notas fiscais recebidas pela própria Prefeitura e fundos | Base local real e auditável de preços pagos (vem do módulo 7) |
| Tabelas oficiais (SINAPI para obras) | Composição de custos |
| Sites e comércio eletrônico | Captura com link, print, data e hora |
| Fornecedores locais | Convite registrado pelo portal, prazo, CNPJ validado, justificativa de escolha |

- **Tratamento:** mínimo de 3 preços; descarte de preços inexequíveis ou excessivos por critério escrito (ex.: fora de uma faixa em torno da mediana); resultado por média, mediana ou menor preço, conforme justificativa.
- **Validade das fontes:** a IN SEGES 65/2021 limita a idade dos preços (contratações similares e notas: até 1 ano; sites: até 6 meses) **[A conferir no texto da IN]**.
- **Relatório** com mapa de preços, memória de cálculo e todas as evidências. **Publicação segura:** link público só do relatório final, com código de autenticidade; edição apenas por usuários autorizados; respeitar quando o órgão optar por **orçamento sigiloso** (art. 24 da Lei 14.133) **[D]**.

### A2.9 Perfis e acesso

| Perfil | Vê | Faz |
|---|---|---|
| Admin central | Tudo | Cria usuários, define perfis e escopo, configura tabelas e integrações |
| Gestor | Tudo do seu escopo + relatórios gerenciais | Cria demandas, aprova transferências, baixas, reavaliações |
| Responsável de unidade | Sua(s) unidade(s) | Aceita recebimentos, abre demandas, confirma inventário |
| Operador / vistoriador | Tarefas atribuídas | Cadastra, vistoria, fotografa; relatórios só do próprio trabalho |
| Contábil | Valores, notas, fundos | Aprova capitalização, depreciação, conciliação |
| Consulta / controle interno | Leitura | Relatórios e auditoria |

Escopo por unidade, centro de custo, fundo e módulo. Toda permissão alterada fica registrada.

### A2.10 IA — onde ajuda de verdade

- Leitura de notas e documentos (OCR) com preenchimento automático para conferência.
- Sugestão de estado de conservação pela foto — **sempre confirmada por pessoa**.
- Alertas de anomalia: bem sem leitura há 2 ciclos, custo de manutenção fora do padrão, unidade com muitos "não localizados".
- Perguntas em linguagem simples ("quais escolas têm PMOC vencido?"), com **link para os registros que sustentam a resposta**.
- Rascunho de relatórios gerenciais e de notificações — revisados por pessoa.

### A2.11 Integrações e Tribunal de Contas

- **e-Sfinge (TCE/SC):** a IN TC-28/2021 prevê remessas nos módulos Planejamento, Execução Orçamentária, Registros Contábeis (mensal), Tributário, Atos Jurídicos e Atos de Pessoal; o responsável é o dirigente máximo **[C]**. Patrimônio não é módulo separado — os reflexos (depreciação, reavaliação, baixas) chegam pelos **registros contábeis do SIAFIC**. Portanto, o nosso sistema deve **enviar lançamentos/arquivos ao SIAFIC (IPM)**, que faz a remessa oficial **[D]**. Verificar se existe remessa específica de obras (e-Sfinge Obras) aplicável **[A conferir]**.
- **SIAFIC (IPM Atende.Net):** integração por API ou arquivo — **depende de a IPM disponibilizar**. Esse é um risco comercial real (seção A4).
- **PNCP, SEFAZ, ADN NFS-e, Portal da Transparência, Diário Oficial dos Municípios (DOM/SC)** para publicação de editais do cemitério.

### A2.12 Bens imóveis — metodologia própria

Imóvel público tem regras que bem móvel não tem. O Produto 1 trata imóveis em quatro camadas:

| Camada | O que o sistema controla | Base |
|---|---|---|
| 1. Identificação | Código único, endereço, mapa (polígono georreferenciado), área de terreno e construída, unidade que ocupa, responsável | IN TC-20/2015 Anexo V: demonstrativo de imóveis com localização, situação e valor [C] |
| 2. Situação jurídica e documental | Matrícula e cartório; escritura; situação: registrado / em regularização / sem registro / posse; habite-se, AVCB, alvarás, laudos com validade | Registro de imóveis (Lei 6.015/1973) [D]; TCE/SC pede apontar bens não registrados e o que impede a regularização [C] |
| 3. Classificação e uso | Uso comum do povo (praças, ruas), uso especial (escolas, postos), dominical (sem destinação); afetado ou não; cedido, permitido, concedido, em comodato — com prazos | Código Civil arts. 98–103 [D] |
| 4. Valor e vida útil | Terreno (não deprecia) separado de edificação e componentes; valor de aquisição ou avaliação; reavaliação por comissão; obras capitalizadas (melhoria) × manutenção | NBC TSP 07 / NBC TSP 37 [C]; MCASP [C] |

### Fontes de imóveis que costumam ficar fora do cadastro [D]

- **Áreas públicas de loteamentos** (áreas verdes, institucionais, sistema viário): passam ao município com o registro do loteamento (Lei 6.766/1979, art. 22) e muitas vezes nunca entram no patrimônio.
- **Imóveis recebidos por doação, desapropriação ou dação em pagamento** sem registro concluído.
- **Bens de infraestrutura** (ruas, pontes, redes): obrigatórios no balanço de municípios acima de 50 mil habitantes desde 2023 (PIPCP) **[C]**; o TCE/SC orientou municípios sobre como valorar esses bens (Decisão 696/2023) **[C]**.

### Fluxo de regularização

1. Levantamento: cruzar cadastro imobiliário do IPTU, mapas, loteamentos aprovados e o cadastro patrimonial.
1. Vistoria com foto e GPS de cada imóvel encontrado.
1. Pesquisa documental (cartório) e classificação da situação.
1. Abertura de pendência por imóvel irregular, com responsável e prazo.
1. Avaliação pela comissão e incorporação contábil (integração SIAFIC).
1. Relatório para o TCE/SC: registrados, em regularização, sem registro e motivo.

### Venda, doação e cessão de bens

A Lei 14.133/2021, art. 76, exige para qualquer alienação: **interesse público justificado e avaliação prévia**; para imóveis, **autorização legislativa e leilão**, com exceções (ex.: doação só para outro órgão público); para móveis, **leilão**, com exceções (ex.: doação só para fins de interesse social) **[C]**. O sistema monta o dossiê do bem para cada caso (laudo, justificativa, lei autorizativa, edital, ata) e só permite a baixa com esses documentos anexados.

### A2.13 Reavaliação em blocos (novo na v1.2)

1. **Montar o bloco:** escolher uma ou mais unidades **ou** combinar filtros (RB-02). O filtro pode ser salvo ("Escolas da zona rural — mobiliário").
2. **Conferir a classe:** o sistema mostra a que classes os bens do bloco pertencem e quanto de cada classe já foi reavaliado no ciclo. Se a classe ficar incompleta, aparece o aviso: *"Faltam 312 bens desta classe em outras unidades. Para fechar a reavaliação da classe, eles também precisam ser reavaliados neste ciclo."* Bloco por unidade serve para **organizar o trabalho da comissão** (uma escola por vez); o fechamento contábil é **por classe** **[D, baseado na regra C via fonte secundária]**.
3. **Calcular o valor novo:** por bem, percentual, tabela de referência ou planilha do laudo (RB-04).
4. **Prévia:** valor atual × novo, diferença em R$ por conta contábil, bens com diferença muito grande destacados.
5. **Ajustes item a item** com justificativa.
6. **Laudo e aprovação:** comissão anexa o laudo e assina; setor contábil aprova.
7. **Aplicar:** cada bem recebe um evento de reavaliação (valor antes/depois, vida útil restante, laudo). Nada é apagado.
8. **Desfazer** o bloco inteiro enquanto não houver lançamento posterior.
9. **Relatório** do bloco e arquivo para o setor contábil lançar no sistema oficial.

**Ponto de atenção:** reavaliar só parte de uma classe (ex.: só os computadores de uma escola) e lançar na contabilidade pode ser apontado pelo controle interno ou pelo TCE. Por isso o sistema deixa trabalhar por bloco, mas acompanha o fechamento da classe inteira. A periodicidade e os critérios ficam na política contábil do município.

### A2.14 Frota de veículos (novo na v1.2)

- **Um registro de abastecimento por evento**, sempre com km do painel. O consumo médio sai da diferença de km entre dois abastecimentos de tanque cheio ÷ litros **[D]**.
- **Regras de alerta** (FR-06) configuráveis por modelo de veículo (ex.: faixa aceitável de km/l). O alerta não bloqueia nada: vai para o gestor conferir, com o registro e a foto do cupom.
- **Locação:** o contrato é cadastrado uma vez; cada veículo locado aponta para o contrato. No fim do mês o sistema soma km, dias de uso e substituições e mostra o valor previsto para conferir a fatura (FR-03).
- **Fonte dos dados:** digitação no aplicativo de campo pelo motorista/frentista **ou** importação do arquivo da administradora do cartão-combustível, pela importação De/Para (A2.2), sem duplicar.
- **Custo por km** = (combustível + manutenção + locação ou depreciação + seguro/licenciamento) ÷ km rodado no período **[D]**.
- **Referência GAX:** o GAX trabalha com cartão magnético e terminal no posto e oficina, captura em tempo real, gráfico de consumo de 30 dias a 1 ano e alarmes de inconsistência **[C via resultado de busca]**. Nosso diferencial proposto: frota dentro da mesma visão por unidade (UN-01), contratos de locação conferidos contra a fatura e o aplicativo de campo sem internet **[D]**.

### A2.15 Aplicativo de campo — piloto em HTML (novo na v1.2)

- **Formato:** página web instalável ("aplicativo web progressivo"). Abre no navegador do celular ou tablet e pode ser **adicionada à tela inicial**, aparecendo como um aplicativo. Não precisa de loja de aplicativos.
- **Sem internet:** depois de aberto uma vez, funciona offline. Os registros ficam guardados no próprio aparelho até serem enviados.
- **O que o piloto faz:** vistoria e inventário de bens (leitura de QR Code pela câmera, quando o aparelho permite, ou digitação do número), vistoria de túmulos (V1–V5 da seção B2), frota (abastecimento e saída/retorno com km e checklist), foto com data/hora e GPS, lista de pendentes de envio, Lixeira e exportação dos dados (planilha CSV e arquivo JSON).
- **Atualização v1.3:** o piloto foi separado em **dois aplicativos independentes**, um por produto: **VitalPat Patrimônio** (`patrimonio/app-campo/`: bens, abastecimento, saída/retorno de veículo) e **VitalPat Cemitério** (`cemiterio/app-campo/`: vistoria de túmulo). Cada um tem seu próprio armazenamento no aparelho, então os dois podem ser instalados no mesmo celular sem misturar dados.
- **Atualização v1.3 (login):** a pedido do usuário, há uma **tela de login única** (`index.html` na raiz). O tipo de usuário abre o sistema certo: `patrimonio` abre o VitalPat Patrimônio e `selemitério` abre o VitalPat Cemitério. Um usuário não entra no sistema do outro e há botão **Sair**. Usuários de teste: `patrimonio` / `123456` e `selemitério` / `123456`. **Este login é só de demonstração:** roda no navegador e pode ser contornado por quem entende de programação. O login seguro depende do servidor, que ainda não existe. O primeiro login precisa de internet; depois disso o aplicativo instalado abre sem internet.
- **O que o piloto ainda não faz:** envio para um servidor (ainda não existe servidor), login de usuários e sincronização entre aparelhos. Os dados de exemplo são fictícios.
- **Limitações reais conhecidas:** leitura de QR pela câmera depende do navegador (funciona no Chrome para Android; no iPhone o piloto oferece a digitação do número); a instalação no iPhone é feita pelo menu "Compartilhar → Adicionar à Tela de Início"; o funcionamento offline e a câmera exigem que o aplicativo seja aberto por endereço **https**.

## A3. Base legal de bens móveis e imóveis (mapa de conformidade)

### A3.1 Contabilidade e controle patrimonial

| Norma | O que exige / trata | Impacto no Produto 1 | Status |
|---|---|---|---|
| Lei 4.320/1964, arts. 94–96 | Registro analítico dos bens e levantamento do balanço patrimonial | Cadastro analítico, inventário anual, conciliação | [C] |
| LC 101/2000 (LRF) | Controle e evidenciação do patrimônio | Painéis e conciliação | [C] via fonte secundária |
| NBC TSP 07 — Ativo Imobilizado (vigente até 31/12/2026) | Reconhecimento, mensuração, depreciação, revisão de vida útil e valor residual, reavaliação | Módulo de depreciação/reavaliação | [C] |
| **NBC TSP 37 — Ativo Imobilizado** (baseada na IPSAS 45) | **Revoga a NBC TSP 07 e vale a partir de 01/01/2027.** Reforça componentes significativos, bens de infraestrutura e patrimônio cultural, introduz "valor corrente operacional"; reavaliação com "suficiente regularidade" (anual a 3–5 anos) | O sistema precisa nascer já na NBC TSP 37 — argumento de venda | [C] |
| NBC TSP 09 e 10 | Redução ao valor recuperável (impairment) | Teste para bens danificados, obsoletos, ociosos (BM-22) | [C] via fonte secundária |
| MCASP (STN) | Procedimentos contábeis patrimoniais; periodicidade de reavaliação | Classes de bens, lançamentos | [C] |
| Portaria STN 548/2015 (PIPCP) — municípios > 50 mil hab. | Móveis e imóveis com depreciação: 2020; intangíveis: 2021; infraestrutura e patrimônio cultural: 2023. Política de depreciação/reavaliação divulgada em notas explicativas | Todos os prazos já venceram para municípios deste porte — quem não cumpriu precisa regularizar | [C] palestra TCE/SC |
| TCE/SC — Decisão 696/2023 (consulta de Mafra) | Orientação sobre registro e valoração de bens de infraestrutura | Classe de infraestrutura com mapa por trecho | [C] |
| Nota Técnica CNM 23/2018 | Passo a passo municipal: saneamento inicial, comissão de ≥3 servidores com laudo, tabela de referência, método linear, reavaliação | Fluxo da comissão e tabela sugerida | [C] |
| Decreto 10.540/2020 (SIAFIC) | Sistema contábil único por ente | Produto 1 é complementar e integrado | [C] |

### A3.2 Tribunal de Contas de SC

| Norma | O que exige / trata | Impacto no Produto 1 | Status |
|---|---|---|---|
| IN TC-28/2021 — e-Sfinge | Remessas: planejamento, execução orçamentária, registros contábeis (mensal), tributário, atos jurídicos e de pessoal | Patrimônio chega ao TCE pelos registros contábeis do SIAFIC | [C] |
| IN TC-20/2015 (consolidada 2026) — prestação de contas e relatório de gestão | Anexo V: **demonstrativo dos imóveis** (localização, situação, valor), **demonstrativo da frota** com custos, avaliação da gestão patrimonial apontando bens não registrados e impedimentos à regularização | Relatórios prontos (FI-06), frota (BM-15), situação documental (BM-16) | [C] |

### A3.3 Bens públicos, alienação e contratação

| Norma | O que exige / trata | Impacto no Produto 1 | Status |
|---|---|---|---|
| Código Civil, arts. 98–103 | Bens públicos: uso comum, uso especial, dominicais; os de uso comum e especial não podem ser vendidos enquanto afetados | Classificação do imóvel (BM-17) | [D] |
| Lei 14.133/2021, art. 76 | Alienação: interesse público + avaliação prévia; imóveis: autorização legislativa + leilão; móveis: leilão; exceções (doação de imóvel só a órgão público; de móvel só para interesse social) | Dossiê de baixa/alienação (BM-20) | [C] |
| Lei 6.766/1979, art. 22 | Áreas públicas de loteamentos passam ao município com o registro | Cadastro dessas áreas (BM-18) | [D] |
| Lei 6.015/1973 | Registro de imóveis | Situação registral (BM-16) | [D] |
| Lei 13.465/2017 | Regularização fundiária (inclui imóveis públicos) | Fluxo de regularização | [D] |
| Lei 14.133/2021, arts. 9º §1º e 14 | Impedimento do "insider" | Seção 1.1 | [C] |
| Lei 14.133/2021, art. 23 + IN SEGES 65/2021 | Pesquisa de preços | Módulo 8 | [C] |
| Lei 14.133/2021, art. 24 | Orçamento sigiloso (opcional) | Controle de publicação | [D] |
| LC 214/2025 | NFS-e nacional obrigatória aos municípios desde 01/01/2026 | Captura de NFS-e | [C] |

### A3.4 Outras

| Norma | O que exige / trata | Impacto no Produto 1 | Status |
|---|---|---|---|
| Lei 13.709/2018 (LGPD) | Dados pessoais | Logs, controle de acesso | [C] |
| Lei 13.589/2018 | PMOC para climatização em prédios de uso público e coletivo | Plano preventivo de ar-condicionado | [A conferir detalhes] |
| Normas do Corpo de Bombeiros de SC | AVCB, extintores | Alertas de validade | [A conferir] |
| Lei 8.429/1992, alt. Lei 14.230/2021 | Improbidade | Risco do "insider" | [C] |

## A4. Concorrentes e SWOT — Produto 1

Dois campos: (1) patrimônio, inventário e vistorias; (2) pesquisa de preços. "Não encontrado" = não achei em fonte pública.

| Campo | Concorrente | O que oferece (público) | Fonte |
|---|---|---|---|
| Patrimônio | **IPM Sistemas — Atende.Net** | ERP 100% web; patrimônio integrado à contabilidade; **fornecedor atual de Rio do Sul desde 2013**; fábrica em Rio do Sul | [C] ACATE / IPM |
| Patrimônio | **Betha Sistemas — Patrimônio Cloud** | Inventário, app móvel, depreciação, reavaliação, transferências, integração contábil; 800+ municípios; unidade em Rio do Sul | [C] Betha |
| Patrimônio (especialista em campo) | **CPCON Brasil** | Serviço + software de inventário com RFID e avaliação conforme NBC TSP 07; 30+ anos | [C] CPCON |
| Pesquisa de preços | **Banco de Preços (Grupo Negócios Públicos)** | Plataforma paga de pesquisa de preços para órgãos públicos | [C] site; detalhes [A conferir] |
| Pesquisa de preços | **ATA360** | Pesquisa de preços com IA sobre PNCP, Compras.gov.br e notas fiscais, seguindo a IN 65/2021 | [C] ATA360 |
| Frota (v1.2) | **GAX — 3ia** | Gestão de frota e custos para empresas e órgãos públicos: cartão magnético e terminal no posto/oficina, dados em tempo real, gráfico de consumo de 30 dias a 1 ano, alarmes de inconsistência, orçamentos de manutenção via Audatex/Molicar, app do condutor | [C via resultado de busca] — o site da 3ia não pôde ser aberto deste ambiente; detalhes [A conferir] |

| Função | Nós (proposta) | IPM | Betha | Especialistas |
|---|---|---|---|---|
| Integração nativa com contabilidade (SIAFIC) | Depende de API da IPM | Sim (nativo) | Sim (nativo) | Via arquivo |
| App de inventário/vistoria em campo | Sim, offline | Não encontrado | Sim | Sim (CPCON: RFID) |
| Conciliação de bens movidos durante inventário | Sim (A2.3) | Não encontrado | Não encontrado | Parcial (serviço) |
| Score de bens / prioridade de manutenção | Sim | Não encontrado | Não encontrado | Não encontrado |
| Visão 360° por unidade | Sim | Não encontrado | Não encontrado | Não |
| Situação documental e regularização de imóveis | Sim (A2.12) | Não encontrado | Não encontrado | Não encontrado |
| Pronto para NBC TSP 37 (2027) | Planejado desde o início | Não encontrado | Não encontrado | Não encontrado |
| Pesquisa de preços com notas locais | Sim | Não encontrado | Não encontrado | ATA360: usa NF |
| Atestados, histórico, suporte | Nenhum | Muito forte | Muito forte | Forte |

### IPM Sistemas — patrimônio

**Forças (S)**
- Incumbente em Rio do Sul desde 2013
- Tudo integrado (contábil, tributos, patrimônio)
- Presença física na cidade
- Escala e atestados

**Fraquezas (W)**
- ERP amplo tende a ser genérico em trabalho de campo
- Não encontrei conciliação de inventário com bens em movimento nem regularização de imóveis

**Oportunidades (O)**
- Expandir módulos rapidamente
- Fechar integração para concorrentes de nicho

**Ameaças (T)**
- Nichos atendidos melhor por especialistas
- Pressão por interoperabilidade

### Betha Sistemas — Patrimônio Cloud

**Forças (S)**
- App, depreciação e reavaliação prontos
- 800+ municípios

**Fraquezas (W)**
- Não é o fornecedor atual de Rio do Sul
- Produto padronizado

**Oportunidades (O)**
- Disputar a próxima licitação de ERP
- Vender módulos isolados

**Ameaças (T)**
- Incumbente local (IPM)
- Especialistas mais baratos em nichos

### CPCON Brasil — inventário físico

**Forças (S)**
- Experiência longa e RFID
- Avaliação conforme NBC TSP 07

**Fraquezas (W)**
- Foco em serviço pontual, não em gestão contínua
- Custo de deslocamento para municípios pequenos

**Oportunidades (O)**
- Licitações de "serviço de inventário e reavaliação"
- Adequação à NBC TSP 37

**Ameaças (T)**
- Softwares com app que permitem à prefeitura inventariar sozinha

### Banco de Preços e ATA360 — pesquisa de preços

**Forças (S)**
- Bases de preços públicas organizadas
- ATA360 usa IA e segue IN 65/2021

**Fraquezas (W)**
- Pouco foco em preço local (comércio da cidade)
- Assinatura separada do sistema de gestão

**Oportunidades (O)**
- Lacuna deixada pelo fim do Painel de Preços (04/07/2025)

**Ameaças (T)**
- Ferramentas gratuitas de tribunais de contas e do governo

### Nossa empresa — Produto 1 (Gestão Patrimonial)

**Forças (S)**
- Conhecimento real das dores do setor de patrimônio (uso legítimo: desenho do produto)
- Foco em campo: inventário com conciliação, vistoria com foto/GPS, score
- Imóveis tratados a fundo (documentação, regularização, classificação)
- Nasce na NBC TSP 37
- Custo baixo e agilidade

**Fraquezas (W)**
- Equipe de 2–3 pessoas; sem atestados
- Depende de integração com o SIAFIC (IPM)
- Sem histórico de suporte e segurança
- Conflito de interesse com Rio do Sul

**Oportunidades (O)**
- **NBC TSP 37 em 01/01/2027**: todas as prefeituras precisam se adequar
- Municípios com PIPCP atrasado (infraestrutura, imóveis sem registro)
- Fim do Painel de Preços federal
- NFS-e nacional obrigatória desde 2026
- CPSI (LC 182/2021)

**Ameaças (T)**
- IPM e Betha podem copiar funções
- IPM pode não liberar integração
- Habilitação técnica em licitação
- Troca de gestão política

## A5. Funções do sistema concorrente → versão VitalPat (novo na v1.4)

Base: 47 telas do módulo de patrimônio de um sistema concorrente, enviadas pelo usuário em 07/10/2026. As imagens estão guardadas fora do repositório, porque contêm dados internos e nomes de servidores: Google Drive → Trabalho → "Manual de Utilização Sistema". **[C — lido das telas]** para "o que o concorrente tem"; **[D]** para a nossa proposta.

**Regra pedida pelo usuário:** não excluir nenhuma função; criar as que faltam; não copiar; fazer uma versão **mais simples, mais visual, mais automática e com menos passos**, principalmente nos relatórios.

### A5.1 Princípios da versão VitalPat

| Concorrente | VitalPat |
|---|---|
| Menus com 5 níveis (Cadastros, Gerenciar, Consultas, Relatórios, Outros) | Menu lateral com **8 áreas**: Painel, Bens, Entradas, Movimentar, Inventário, Financeiro, Relatórios, Cadastros/Configurações. Cada função fica a no máximo 2 cliques |
| 12 campos de filtro na consulta | **Uma busca única** (código, plaqueta, nome, local, responsável) + filtros em "etiquetas" clicáveis; filtros podem ser salvos |
| Ficha do bem em 10 abas | **Ficha em uma página**: resumo no topo (foto, valor, barra de depreciação, situação, responsável, QR) e seções abaixo; histórico financeiro e físico juntos numa **linha do tempo** |
| Ações uma de cada vez, menus suspensos | **Ações em lote**: marcar vários bens → transferir, desuso, baixa, reavaliar, dados complementares, seguro/garantia, etiquetas, termo, planilha |
| Assistentes de 3 telas (selecionar → selecionados → informações) | **Uma tela com prévia**: filtro, lista marcada, valores antes × depois, confirmar; tudo pode ser desfeito |
| "Virada mensal" manual (executar / retornar) | **Fechamento do mês** com prévia; o painel avisa quando o mês está pronto para fechar; **desfazer** o último fechamento |
| Relatórios = formulário de filtros + espera em fila de impressão | **Relatório visual na hora**: números-resumo no topo, gráficos, tabela, filtros em etiquetas; botões **Imprimir/PDF** e **Baixar planilha** (com escolha de colunas) |
| Configurações com dezenas de chaves | Mesmas opções, **agrupadas e explicadas em linguagem simples**, com valor padrão recomendado |
| Alertas só de seguro | **Central de pendências** no painel: seguros e garantias vencendo, reavaliação vencida, itens a incorporar, transferências aguardando aceite, bens sem responsável, inventário aberto, mês a fechar, movimentos a contabilizar |

### A5.2 Mapa função por função

| # | Tela / função do concorrente | Onde fica no VitalPat | O que melhora |
|---|---|---|---|
| 1 | Consulta de Bem: filtros por classificação, tipo, status, estado, minha responsabilidade, totalizador/paginação, exibir baixados, cidade, bairro, logradouro (faixas "1,2,6-10,15"), campo + operador + valor | **Bens** | Busca única + etiquetas de filtro; faixas de código aceitas na busca ("1,2,6-10"); total de bens e de valor sempre visível; filtros salvos |
| 2 | Colunas: código, tipo, complemento, aquisição, início depreciação, valor contábil, status, estado, centro de custo/classificação, características; layout "Padrão"; registros por página | **Bens** | Escolha de colunas lembrada; foto e barra de depreciação na lista |
| 3 | Incluir / Alterar / Excluir / Visualizar | **Bens → Novo bem** e **Ficha** | Inclusão curta (só o essencial) com o resto preenchido pelo produto e pela classificação; código automático; excluir = Lixeira |
| 4 | Transferência interna / externa / entidade | **Movimentar → Transferências** e ação em lote | Uma tela para os três tipos; aceite do recebedor; termo gerado na hora |
| 5 | Movimentação financeira | **Ficha → Linha do tempo** e **Financeiro** | Lançamentos financeiros e físicos na mesma linha do tempo |
| 6 | Desuso (incluir) | Ação na ficha e em lote | Motivo e retorno ao uso registrados |
| 7 | Anexos (consultar / incluir) | **Ficha → Anexos** | Arrastar arquivo ou foto; prévia da imagem |
| 8 | Outros → Replicar | Ficha → **Replicar** | Informa a quantidade e gera N bens iguais com códigos seguidos |
| 9 | Outros → Vistoria | Ficha → **Vistoria** (e app de campo) | Estado, fotos e observação; vistoria do app de campo entra pela importação |
| 10 | Outros → Dados depreciação | Ficha → **Depreciação** | Gráfico da depreciação ao longo da vida útil; valores calculados sozinhos |
| 11 | Outros → Unidades produzidas | Ficha → **Depreciação** (método por unidades) | Lançamento mensal de unidades produzidas |
| 12 | Outros → Despesas | Ficha → **Despesas e manutenções** | Custo acumulado aparece no resumo e no score |
| 13 | Outros → Observações | Ficha → **Observação** (linha do tempo) | Datada e com autor |
| 14 | Outros → Medidas | Ficha → **Medidas** | Campos livres (ex.: área, dimensões) |
| 15 | Outros → Saldo contábil | Ficha → resumo do topo | Valor contábil, depreciação acumulada e valor líquido sempre visíveis |
| 16 | Outros → Licitação | Ficha → **Origem** | Processo, modalidade e número ligados ao bem |
| 17 | Veículo | Ficha → **Veículo** (placa, RENAVAM, chassi, combustível) | Liga ao Módulo 10 (frota) |
| 18 | Imprimir | Ficha → **Imprimir ficha** | Ficha visual de 1 página com QR |
| 19 | Aba Geral: tipo, código, situação de aquisição, data de aquisição e incorporação, comissão, exercícios anteriores | Ficha → **Identificação** | — |
| 20 | Aba Empenhos: entidade, empenho, item, quantidade, valores | Ficha → **Origem** | Preenchido sozinho quando o bem vem de "Itens a incorporar" |
| 21 | Aba Adicional: produto, complemento, fornecedor, conta débito, valor de aquisição e contábil | Ficha → **Identificação / Valores** | Conta sugerida pela classificação |
| 22 | Aba Centro de Custo/Responsável: centro de custo, localização, responsável, responsáveis adicionais | Ficha → **Local e responsáveis** | — |
| 23 | Aba Seguro/Garantia: seguradora, corretora, apólice, adesão, início/término, valor, franquia; garantia: fornecedor, tipo, início/término, observação | Ficha → **Seguro e garantia** | Alerta de vencimento no painel; também em lote |
| 24 | Aba Dados complementares: marca, modelo, cor, série, estado, plaqueta anterior, tombamento, NF (número/série/emissão), RFID, texto jurídico (entidade, categoria, número/ano) | Ficha → **Detalhes** | Também em lote |
| 25 | Aba Depreciação: automática, método, início, vida útil, tipo de residual (valor/%), valor base, residual, a depreciar, contas débito/crédito, acúmulos manual/automático/total, taxas mensal/anual | Ficha → **Depreciação** | Métodos: cotas constantes, soma dos dígitos, unidades produzidas; taxas calculadas; gráfico |
| 26 | Aba Anexos | Ficha → **Anexos** | — |
| 27 | Aba Mov. Financeira (data, tipo, ano, contas, valores, estornado) | Ficha → **Linha do tempo** (filtro "financeiro") | Estorno = lançamento contrário, nada apagado |
| 28 | Aba Mov. Física (data, tipo, centro de custo, responsável, estado) | Ficha → **Linha do tempo** (filtro "físico") | — |
| 29 | Anterior / Próximo | Ficha → setas | Navega dentro do resultado da busca |
| 30 | Cadastros: produtos, gerais, motivos, tipos, centros de custo/localização, contábeis | **Cadastros** | Uma tela por cadastro, mesma aparência, busca e planilha |
| 31 | Gerenciar → Itens a incorporar (itens de ordem de compra: entidade, incorpora patrimônio, situação; incluir bem, ativar, desativar, empenhos) | **Entradas → Itens a incorporar** | Quantidade 5 → gera 5 bens de uma vez, já com empenho, fornecedor e valor |
| 32 | Gerenciar → Dados complementares (em lote) | Ação em lote | Uma tela |
| 33 | Gerenciar → Desuso | Ação em lote | — |
| 34 | Gerenciar → Inventário | **Inventário** | Ciclo com data de corte, progresso por unidade em barras, importação do app de campo, sobras × não localizados (A2.3) |
| 35 | Financeiro → Movimentos para contabilizar | **Financeiro → Para a contabilidade** | Arquivo para o setor contábil lançar no sistema oficial; marca o que já foi enviado |
| 36 | Financeiro → Agregação | **Financeiro → Melhorias (agregação)** | Pergunta "melhoria ou manutenção?" (A2.5) antes de somar ao valor |
| 37 | Financeiro → Reavaliação (coletiva: bens disponíveis → selecionados → informações; "selecionar todos do filtro") | **Financeiro → Reavaliação** | Reavaliação em blocos (A2.13) com prévia, controle da classe inteira e desfazer |
| 38 | Financeiro → Depreciação | **Financeiro → Fechar o mês** | Prévia, fechamento e desfazer |
| 39 | Financeiro → Baixa | **Movimentar → Baixa** e ação em lote | Exige motivo e documentos conforme Lei 14.133 art. 76 (A2.12) |
| 40 | Transferências → interna, externa, entidade, solicitação, termos de transferência | **Movimentar → Transferências** | Solicitação com aceite; termo automático |
| 41 | Consultas → eventos patrimoniais, movimentação geral, observações do bem | **Histórico** (linha do tempo geral) | Uma busca para todos os eventos, com filtros por tipo e período |
| 42 | Consultas → tipo do bem, tipo de movimentações financeiras | **Cadastros** | — |
| 43 | Relatório: Balancete patrimonial (entidade, período, detalhar bens, tipo, bem, status, conta, centro de custo, cidade/bairro/logradouro) | **Relatórios → Balancete** | Saldo anterior, entradas, saídas, depreciação e saldo final por conta, com gráfico |
| 44 | Relatório: Bem (datas de aquisição/incorporação/baixa, tipo, conta, estado, status, ordenação; relacionar dados complementares, empenhos, seguros, campos adicionais, responsáveis, mov. física e financeira, depreciação) | **Relatórios → Bens** | Escolha das seções por etiquetas; lista com fotos |
| 45 | Relatório: Despesas do bem | **Relatórios → Despesas e manutenções** | Ranking dos bens mais caros de manter |
| 46 | Relatório: Estatístico (incorporação, aquisição, situação, tipo, estado, status, conta, localização; relacionar bem, só baixados, consolidado, motivo de baixa, marca, receptor) | **Relatórios → Estatístico** | Gráficos por estado, classe, unidade, idade e ano de aquisição |
| 47 | Impressão de etiquetas (grupo, classe, subclasse, produto, datas, centro de custo, localização, status, bens inexistentes, tipo, bem) | **Relatórios → Etiquetas** | Etiqueta com QR Code, pronta para impressora comum |
| 48 | Relatório: Garantia do bem | **Relatórios → Seguros e garantias** | Linha do tempo de vencimentos |
| 49 | Relatório: Manutenções (somente bens ausentes, tipo, motivo, fornecedor) | **Relatórios → Despesas e manutenções** | — |
| 50 | Relatório: Baixa (tipo, motivo, conta, detalhar) | **Relatórios → Baixas** | Gráfico por motivo |
| 51 | Relatório: Depreciação acumulada (ano, entidade, períodos, grupo/classe/subclasse, contas, centro de custo) | **Relatórios → Depreciação** | Gráfico mês a mês |
| 52 | Relatório: Incorporação | **Relatórios → Incorporações** | Gráfico mês a mês por origem |
| 53 | Relatório: Movimentações financeiras | **Relatórios → Movimentações financeiras** | — |
| 54 | Relatório: Resumo patrimonial (grupo contábil, detalhar) | **Relatórios → Resumo patrimonial** | Cartões por grupo |
| 55 | Relatório: Inventário (situação, período, centro de custo, localização, responsável; localizados, transferidos, não localizados) | **Relatórios → Inventário** | Progresso e pendências por unidade |
| 56 | Termo de responsabilidade | **Relatórios → Termo de responsabilidade** | Gerado por responsável ou unidade, com assinatura |
| 57 | Termo de conferência | **Relatórios → Termo de conferência** | Lista para conferir com caixas de marcação |
| 58 | Documentos diversos: parecer técnico de avaliação de bens móveis; laudo de reavaliação de veículo | **Relatórios → Documentos** | Preenchidos com os dados do bem e da comissão |
| 59 | Planilhas | **Baixar planilha** em toda lista e relatório | Escolha de colunas (PB-19) |
| 60 | Outros → Virada mensal (executar / retornar) | **Financeiro → Fechar o mês** | Ver nº 38 |
| 61 | Configurações gerais: obriga contas; permite bem por empenho/compra global; código de localização manual; controle de usuário por centro de custo; descrição completa do centro de custo; incorpora só empenhos liquidados; filtro por classificação; plaqueta anterior no relatório; fluxo de cálculo da reavaliação; valida transferência retroativa; notificação de transferência; depreciação anual; código de tombamento automático; obriga centro de custo/localização; taxa de depreciação por entidade | **Configurações → Geral** | Explicação de cada chave em linguagem simples |
| 62 | Configurações: integrações (compras, contabilidade, importação de itens, arrecadação, extrato do cidadão, doação) | **Configurações → Integrações** | Sistema independente: integrações por arquivo (importar/exportar) |
| 63 | Configurações: origens (termo de baixa) | **Configurações → Documentos** | — |
| 64 | Configurações: bem (minha responsabilidade por padrão, código manual, aparência do bem) | **Configurações → Bens** | — |
| 65 | Configurações: centro de custo (movimentação por centro de custo, centro do patrimônio, centro da solicitação de baixa, valida entidade × órgão) | **Configurações → Unidades** | — |
| 66 | Agendamento: notificação de vencimento de seguro (período e intervalo) | **Configurações → Avisos** | Avisos de seguro, garantia, reavaliação, manutenção, inventário e fechamento do mês |

### A5.3 Funções que o concorrente não mostrou e o VitalPat tem

Estas funções já estavam no dossiê e foram ligadas ao sistema de gestão: painel com central de pendências; visão por unidade (UN-01); score do bem (A2.4); inventário com bens que mudam de lugar (A2.3); importação do app de campo; reavaliação em blocos com controle da classe (A2.13); melhoria × manutenção (A2.5); Lixeira em tudo (PB-11); trilha de auditoria (PB-10); relatórios visuais (PB-18); planilha com escolha de colunas (PB-19); frota (Módulo 10).

### A5.4 Onde está no código

`patrimonio/gestao/` — **VitalPat Patrimônio · Gestão**. É HTML/CSS/JS puros, com dados guardados no navegador. Os dados de exemplo são fictícios e o envio a servidor ainda não existe. Ao entrar com o usuário `patrimonio`, abre a Gestão, que tem um botão para o aplicativo de campo.

# PARTE B — PRODUTO 2: GESTÃO DE CEMITÉRIO

**Vendido separadamente do Produto 1.** Usa a mesma plataforma base por dentro (mesmo código), mas é contratado, instalado e cobrado à parte. Um município pode comprar só o cemitério.

## B1. Requisitos

### B1.1 Específicos do cemitério

| ID | Requisito | Origem | Observação |
|---|---|---|---|
| CE-01 | Cadastro de +6.000 túmulos, incluindo cerca de 1.000 possivelmente abandonados | Pedido |  |
| CE-02 | Importar as 2 planilhas recebidas (layouts que a Prefeitura exporta) | Pedido | Aguardando os arquivos |
| CE-03 | Alertas de possível abandono por via documental e por vistoria | Pedido |  |
| CE-04 | Metodologia de abandono seguindo legislação municipal, estadual e federal | Pedido | Seção B2 + base legal B3 |
| CE-05 | Mapa georreferenciado (quadra, aléia, lote, gaveta) + QR Code no túmulo | Adicionado |  |
| CE-06 | Concessões (temporária/perpétua), vencimentos, titulares e sucessores | Adicionado | Rio do Sul: 5 anos adulto / 3 anos criança em gavetas [C] |
| CE-07 | Sepultamentos, exumações, translados, ossário, capelas — com registro e documentos | Adicionado |  |
| CE-08 | Geração de notificação, edital e ato de retomada; controle de prazos | Adicionado |  |
| CE-09 | Consulta pública de localização de falecidos | Adicionado | Concorrentes já oferecem [C] |
| CE-10 | Painel do cemitério: ocupação, vagas, vencimentos de concessão, casos de abandono por etapa, prazos do processo | Adicionado |  |
| CE-11 | Documento de cada sepultamento vinculado à certidão de óbito | Adicionado | Lei 6.015/1973 (registro de óbito) [D] |
| CE-12 | Taxas e boletos: gerar a cobrança no sistema tributário da Prefeitura (integração), não cobrar por fora | Adicionado | Evita conflito com o SIAFIC/tributário |

### B1.2 Itens da plataforma base que o Produto 2 também tem

Mesmas regras descritas na Parte A (seções A1.1 e A2), aplicadas ao cemitério:

| ID | Requisito | Origem | Observação |
|---|---|---|---|
| PB-02/03 | Usuários com limitações, admin central; visão Gestor × Operador | Pedido | Perfis: administração do cemitério, coveiro/vistoriador, atendimento, consulta |
| PB-04/05 | Importar/exportar em todas as telas; importação segura com De/Para (layouts das 2 planilhas) | Pedido | A2.2 |
| PB-06 | Backup | Pedido | A2.1 |
| PB-07 | Georreferenciamento | Pedido | Mapa de quadras e túmulos |
| PB-08 | IA para relatórios e insights | Pedido | Ex.: fotos que sugerem abandono — confirmação humana |
| PB-10/11 | Trilha de auditoria; "excluir" = Lixeira | Adicionado | Essencial: cada exumação precisa de histórico completo |
| PB-12 | LGPD — dados de titulares e familiares | Adicionado |  |
| PB-14 | App de campo offline | Adicionado | Vistorias no cemitério |

## B2. Metodologia de identificação e tratamento de abandono

Princípio: **o sistema aponta indícios; quem decide é a autoridade, em processo administrativo com direito de defesa.** Nenhuma exumação é disparada automaticamente.

### A) Indicadores documentais

| Código | Indicador | Observação |
|---|---|---|
| D1 | Concessão temporária vencida | Rio do Sul: até 5 anos adulto e 3 anos criança em gaveta, conforme editais baseados na Lei Municipal 4.100/2004 [C] |
| D2 | Taxas/tarifas cemiteriais em aberto | Se a lei municipal prever taxa de manutenção [A conferir na Lei 4.100/2004] |
| D3 | Titular sem cadastro válido, falecido sem sucessor registrado, ou correspondência devolvida |  |
| D4 | Sem nenhum movimento (sepultamento, reforma, pagamento, atendimento) há X anos | X configurável |
| D5 | Concessão sem documento que comprove título | Não é abandono sozinho; é regularização |

### B) Indicadores de vistoria (checklist com foto, GPS, data e hora)

| Código | Item | Escala |
|---|---|---|
| V1 | Estrutura (rachaduras, desabamento, risco a terceiros) | 0–4 |
| V2 | Limpeza e vegetação | 0–4 |
| V3 | Identificação (lápide/placa legível) | 0–4 |
| V4 | Vedação/tampa (risco sanitário) | 0–4 |
| V5 | Sinais de visitação recente (flores, velas, limpeza) — fator que **reduz** o indício | sim/não |

### C) Classificação

- **Regular** → **Atenção** → **Indício de abandono** → **Abandono em apuração** → **Abandono declarado (ato publicado)**.
- Regra de segurança: só vai para "Abandono em apuração" com **pelo menos 2 vistorias em datas distintas** (intervalo configurável, ex.: 90 a 180 dias) **e** pelo menos 1 indicador documental, e com revisão humana (comissão ou servidor designado).
- Túmulos com valor histórico, artístico ou de personalidades: marcação de exceção e consulta ao órgão de patrimônio cultural antes de qualquer medida.

### D) Fluxo do processo administrativo

1. Indício gerado pelo sistema.
1. Confirmação com 2ª vistoria (fotos datadas e georreferenciadas).
1. Notificação pessoal ao titular/responsável (carta com AR; e-mail e WhatsApp como reforço, com registro).
1. Aviso físico no túmulo (placa) e **edital** no Diário Oficial dos Municípios (DOM/SC) para quem não foi localizado.
1. Prazo para manifestação conforme a lei municipal. Referências encontradas: Rio do Sul (gavetas vencidas) — 15 dias úteis + 10 dias corridos improrrogáveis **[C]**; Joinville — 30 dias úteis **[C]**; Bom Retiro (Lei 2.573/2024) — até 60 dias, notificação por AR e depois edital **[C]**.
1. Regularização (termo de compromisso com prazo para reforma/limpeza) ou defesa escrita, analisada e respondida.
1. Decisão fundamentada da autoridade competente, publicada.
1. Exumação só após o prazo mínimo sanitário (Bom Retiro, por exemplo, proíbe antes de 5 anos, salvo ordem judicial/policial **[C]**), com registro, fotos e testemunhas.
1. Restos mortais em ossário identificado (etiqueta ligada ao cadastro). Referência: Joinville guarda por 3 anos, período em que a família pode retirar **[C]**.
1. Liberação do espaço para nova concessão; todo o dossiê do caso fica arquivado no sistema.

> **Riscos jurídicos do cemitério (não subestimar):**
>
> • Concessões **perpétuas**: só podem ser retomadas se a lei municipal previr e com processo completo. Se a Lei 4.100/2004 não tratar abandono de perpétuas, será preciso alterar a lei — **[A conferir, texto integral da lei não localizado online]**.
>
> • Erros de identificação geram condenação: o TJSC condenou município e cemitério por "corpo estranho em jazigo de família" **[C]**.
>
> • Exumação irregular pode configurar crime contra o respeito aos mortos (Código Penal, arts. 209 a 212) **[D]**.
>
> • Licenciamento ambiental de cemitérios (Resolução CONAMA 335/2003) e normas sanitárias estaduais (Portaria SES/SC 167/2018 — **não consegui abrir o texto; a conferir**).
>
> • Recomendação: validar a metodologia com a Procuradoria do município comprador antes de usar.

### E) Levantamento inicial dos +6.000 túmulos

- Voo de drone para ortofoto (mapa aéreo) + desenho de quadras e lotes sobre a imagem.
- Plaqueta com QR Code em cada túmulo; vistoria inicial pelo app, com foto.
- Importação das planilhas existentes via De/Para (mesma lógica da seção A2.2) e cruzamento: registro sem túmulo físico, túmulo sem registro.

**Argumento de venda [D]:** cerca de 1.000 túmulos possivelmente abandonados representam espaço que pode voltar a ser concedido (receita e alívio de lotação), sem precisar abrir novo cemitério.

## B3. Base legal do cemitério

| Norma | O que exige / trata | Impacto no sistema | Status |
|---|---|---|---|
| CF/88, art. 30 (I e V) | Município legisla sobre interesse local e presta o serviço de cemitério | Regras seguem a lei municipal; sistema parametrizável por município | [D] |
| Lei Municipal 4.100/2004 (Rio do Sul) | Cemitério municipal: permanência até 5 anos adulto / 3 anos criança em gavetas; edital com 15 dias úteis + 10 dias corridos | Parâmetros padrão para Rio do Sul | [C] via editais; texto integral [A conferir] |
| Leis de outros municípios de SC (ex.: Bom Retiro, Lei 2.573/2024) | Abandono: até 60 dias após notificação por AR e depois edital; exumação só após 5 anos; cadastro com numeração e mapeamento obrigatórios | Modelo de parametrização; referência para municípios sem regra | [C] |
| Lei 6.015/1973 | Registro de óbito | Vínculo sepultamento–certidão | [D] |
| Resolução CONAMA 335/2003 | Licenciamento ambiental de cemitérios | Documentos do cemitério | [C] |
| Portaria SES/SC 167/2018 | Necrotério e congêneres em SC | Regras sanitárias de exumação | [A conferir — texto não aberto] |
| Código Penal, arts. 209–212 | Crimes contra o respeito aos mortos | Rigor no fluxo de exumação | [D] |
| Lei 13.709/2018 (LGPD) | Dados pessoais de familiares e titulares | Controle de acesso, logs | [C] |
| Lei 14.133/2021, art. 9º §1º | Impedimento do "insider" | Seção 1.1 | [C] |

## B4. Concorrentes e SWOT — cemitério

| Concorrente | O que oferece (público) | Fonte |
|---|---|---|
| **IPM — módulo Cemitérios (Atende.Net)** | Cadastro de cemitérios, ossários, capelas; localização de jazigos; histórico de falecidos; translados; escala de coveiros; taxas com boleto/Pix; consulta pública 24h. **Já é o sistema de Rio do Sul.** | [C] IPM |
| **Betha — gestão de cemitérios** | Mapa digital de ocupação, consulta online de jazigos, registro de sepultamentos, relatórios; caso São Miguel do Oeste/SC (2024); 42 cemitérios | [C] Noticenter |

| Função | Nós (proposta) | IPM | Betha |
|---|---|---|---|
| Mapa georreferenciado | Sim (drone + QR) | Não encontrado | Sim |
| Metodologia de abandono com processo completo | Sim (B2) | Não encontrado | Não encontrado |
| Vistoria em campo com foto/GPS | Sim, offline | Não encontrado | Não encontrado |
| Consulta pública de falecidos | Sim | Sim | Sim |
| Taxas/boletos | Via sistema tributário da Prefeitura | Sim (nativo) | Sim |
| Atestados, histórico, suporte | Nenhum | Muito forte | Muito forte |

"Não encontrado" = não achei em fonte pública; não quer dizer que não exista.

### IPM — módulo Cemitérios

**Forças (S)**
- Incumbente em Rio do Sul
- Integrado ao tributário (boletos, Pix)
- Consulta pública pronta

**Fraquezas (W)**
- Não encontrei mapa georreferenciado nem metodologia de abandono

**Oportunidades (O)**
- Acrescentar abandono ao módulo existente

**Ameaças (T)**
- Prefeituras com problema de lotação procurando solução específica

### Betha — gestão de cemitérios

**Forças (S)**
- Mapa digital já em uso em SC
- Escala nacional

**Fraquezas (W)**
- Não é fornecedor atual de Rio do Sul
- Não encontrei metodologia de abandono

**Oportunidades (O)**
- Vender módulo isolado de cemitério

**Ameaças (T)**
- Incumbente local; especialistas

### Nossa empresa — Produto 2 (Cemitério)

**Forças (S)**
- Metodologia de abandono com processo legal completo (diferencial não encontrado nos concorrentes)
- Mapa georreferenciado + QR em cada túmulo
- Retorno fácil de mostrar: espaço recuperado sem abrir novo cemitério
- Produto pequeno, vendável sozinho

**Fraquezas (W)**
- Sem atestado; risco jurídico alto se a metodologia falhar
- Taxas dependem do tributário da Prefeitura
- Conflito de interesse com Rio do Sul

**Oportunidades (O)**
- Cemitérios municipais lotados
- Prefeituras de SC publicando editais de abandono (Rio do Sul 2025/2026, Joinville 2026) — demanda comprovada
- Serviço de levantamento inicial (drone, plaquetas, vistoria) gera receita imediata

**Ameaças (T)**
- IPM e Betha podem acrescentar abandono
- Processos judiciais de famílias
- Leis municipais diferentes exigem parametrização

## B5. Planilha "Lista de chãos do cemitério" — modelo de importação (novo na v1.3)

Arquivo recebido do usuário em 07/10/2026 (`LISTA_CHÃOS_DO_CEMITÉRIO.xlsx`). **O arquivo original não foi copiado para o repositório**, porque tem nomes e CPFs e o repositório é público. A pedido do usuário, foi gerada uma **versão limpa**, só com quadra (nome da aba), aléia e sepultura: `cemiterio/modelos-importacao/lista-chaos-modelo.xlsx` (48 abas, 6.479 covas; varredura sem CPF nem nomes). Aqui fica só a estrutura, levantada por leitura automática do arquivo **[C — lido do arquivo]**.

### Visão geral

| Item | Encontrado |
|---|---|
| Abas | 51: 47 de quadras/gavetas, 1 "MARMORARIAS", 1 "TOTAL DE SEPULTURAS", 1 "gaveta jardim primavera" (só cabeçalho) e as abas "A" (ex.: "Quadra 01 A") |
| Linhas de sepultura | cerca de **6.457** (contando só linhas cujo código parece de sepultura) |
| Com nome do proprietário | 274 linhas |
| Com CPF | 247 linhas |
| Cabeçalho | linha 4 na maioria das abas (linha 5 em "GAVETA 36"); título "Serviços de Administração do Cemitério Municipal" nas linhas 1–3 |

### Colunas das abas de quadra (layout padrão)

| Coluna na planilha | Campo no sistema (De/Para proposto) | Observação |
|---|---|---|
| Sepulturas | Número da sepultura | Formatos: "001", "001 A", "001 B", "001 C", "001 Jazigos", "01 Irregulares", "001 - 005" (faixa), "001 (02)" |
| Aléia | Aléia | Uma aba usa "Aléia-A" |
| Nome Proprietário | Titular da concessão | Dado pessoal |
| CPF | CPF do titular | Dado pessoal (LGPD; mascarar na tela) |
| Registros de Inumações | Sepultamentos ligados à sepultura | Várias colunas mescladas |
| Situação | Situação | Quase sempre vazia; valores achados: "I" (24) e "P" (1) — **significado a confirmar** |
| Comp. | Comprimento (m) | Texto com vírgula ("2,80") → número |
| Largura | Largura (m) | Idem |
| Observações | Observação | |
| Título Aforamento | Número do título de aforamento | Em algumas abas o cabeçalho tem quebra de linha |
| Data | Data (**qual data? a confirmar**) | Maioria "dd/mm/aa" (ano com 2 dígitos); algumas "dd/mm/aaaa" e algumas com histórico na mesma célula ("dd/mm/aaaa — Antigo: dd/mm/aa") |

**Aba de gavetas ("GAVETA 36") tem layout diferente:** sepultura, aléia, nome do sepultado, CPF, nº da inumação, data do sepultamento, data da exumação, observação, liberação, contato. Vira um segundo modelo de importação.

**Aba "MARMORARIAS":** nº da licença, data, localização e marmoraria — registro de licenças de obra em túmulo. Pode virar um cadastro de licenças de marmoraria **[D]**.

**Aba "TOTAL DE SEPULTURAS":** total por quadra — serve para **conferir** a importação (total importado × total da planilha).

### Problemas que a importação precisa tratar

1. **A posição das colunas muda entre abas:** em 6 abas, as colunas a partir de "Situação" estão uma casa para a direita. O De/Para tem que ligar **pelo nome do cabeçalho**, e não pela posição.
2. **Cabeçalhos repetidos no meio da aba** (quebra de página de impressão): cerca de 240 linhas "Sepulturas" e 230 linhas "Quadra NN" no meio dos dados. Essas linhas devem ser ignoradas.
3. **Células mescladas** (nome, inumações, título) — ler o valor da primeira célula do bloco.
4. **Ano com 2 dígitos:** é preciso uma regra (ex.: 00–29 = 20xx; 30–99 = 19xx) **confirmada pelo usuário**.
5. **Histórico dentro da célula** ("Antigo: ...") — separar: valor atual no campo, valor antigo no histórico (regra de não apagar).
6. **Códigos repetidos na mesma aba:** Quadra 02 (1), Quadra 14 (3), Quadra 29 (6), Quadra 35 Crianças (1) — vão para a prévia como **Conflito**, para decisão humana.
7. **Chave da sepultura no sistema:** quadra (nome da aba) + aléia + número da sepultura (com letra). Ex.: "Quadra 01 / Aléia 01 / 001 A".
8. Comprimento e largura como texto com vírgula; observações gerais no cabeçalho (ex.: "Todos lotes da Quadra 42 são 2,80m x 1,40m").

## B6. Localização exata dos túmulos e servidor (novo na v1.5)

**Decisão do usuário (07/10/2026):** uma empresa especializada fará o levantamento da posição exata de cada túmulo. O sistema não mede nada sozinho; ele fica pronto para receber o resultado.

- **Por que não o GPS do celular [D]:** o GPS comum erra de 3 a 15 m, e as covas ficam a cerca de 1,5 m uma da outra. Por isso, até o levantamento chegar, o túmulo é achado pela posição (quadra → aléia → número), pelo mapa esquemático e pela plaqueta QR. Coordenada do celular fica marcada como **aproximada**.
- **O que o sistema entrega à empresa:** planilha com todos os túmulos (quadra, aléia, número, código do QR) e colunas vazias `latitude`, `longitude`, `precisao_m`.
- **O que a empresa devolve (formato a combinar no contrato):** a mesma planilha preenchida (CSV, `quadra;aleia;numero;latitude;longitude;precisao_m`, coordenadas em graus decimais WGS84) **ou** GeoJSON com pontos ou contornos dos túmulos (`properties`: quadra, aleia, numero) e contornos das quadras (`properties`: tipo = "quadra", quadra). Ortofoto (foto aérea do drone) com os limites (norte, sul, leste, oeste) fica no cadastro do cemitério.
- **Como entra:** prévia antes de gravar (recebem localização, trocam localização, não encontrados, erros como latitude/longitude trocadas ou fora do Brasil); a coordenada anterior vai para a linha do tempo; dá para desfazer.
- **O que é "exata":** origem = levantamento e precisão até o valor configurado (padrão 0,5 m; ajustável por município).
- **Saídas:** botão do Google Maps na ficha; arquivo KML para o Google Earth. Mapa com fundo de imagem (Leaflet + OpenStreetMap) fica para a etapa 7.

**Servidor [decisão do usuário, 07/10/2026]: Supabase.** Hoje os dados ficam no navegador; o armazenamento foi escrito com as mesmas funções (carregar, listar, gravar) para trocar pelo Supabase depois. **[D]** Pela regra "cada projeto é independente", o VitalPat deve ter um projeto Supabase próprio, separado do outro projeto do usuário. A troca exige login de verdade e regras de acesso por usuário antes de colocar dados reais.

**Atualização (07/10/2026): ligação feita.** Com `patrimonio/config-servidor.js` ou `cemiterio/config-servidor.js` preenchido, o sistema usa login por e-mail e senha, grava tudo no banco da cidade, guarda fotos no armazenamento privado e os aplicativos de campo enviam sozinhos quando há internet. Sem configuração, segue a demonstração. Testado com o roteiro real do banco em PostgreSQL + PostgREST locais (login e fotos simulados); **falta testar no Supabase de verdade**.

**Atualização (07/10/2026, decisão do usuário):** no teste, **um projeto só para os dois sistemas**, cada um na sua área do banco (`patrimonio` e `cemiterio`), sem misturar dados, pessoas liberadas, histórico ou fotos. O mesmo arquivo de instalação serve para projeto separado ou dividido.

**Atualização (07/10/2026, decisão do usuário):** um projeto Supabase **por cidade e por produto**; cada um roda separado. Roteiros de instalação (ver também B7): `patrimonio/banco/supabase-instalar.sql` e `cemiterio/banco/supabase-instalar.sql` (sem login ninguém acessa; nada é apagado; histórico de toda alteração; papéis admin, gestor, campo e consulta; fotos em armazenamento privado). **[A conferir]** custo: o plano gratuito do Supabase limita o número de projetos ativos e pausa projeto parado; com 2 projetos por cidade, o plano pago será necessário a partir da primeira cidade em produção. Conferir valores em supabase.com/pricing antes de fazer proposta.

## B7. Funções inspiradas em sistemas de cemitério de outros países (novo na v1.5)

Pesquisa de 07/10/2026 (PlotBox, Chronicle, CemSites, Cemify, CIMS e outros; fontes no relatório entregue ao usuário). **Decisões do usuário em 07/10/2026:**

- **Atlas (atlas.co): não será usado.** Motivos: duplica os dados, plano gratuito limitado, dados na Europa (LGPD) e termos que proíbem revenda. O mapa será o Leaflet no próprio sistema. O servidor público do OpenStreetMap proíbe uso sem internet, então o app de campo usa fundo próprio (ortofoto do levantamento ou croqui).
- **Função pública "chegar ao túmulo":** só para quem informa o **código do túmulo** ou o **nome completo** do falecido. Não haverá lista aberta de sepultados.

| # | Função | Decisão |
|---|---|---|
| 1 | Concessões vencendo, notificações, registro de cada tentativa de contato e dossiê do processo de abandono | Sim. Inclui **pedidos de limpeza do túmulo e avisos de acidente** (quebra, desabamento) feitos pela família ou pela população |
| 2 | Mapa colorido por situação (inclui "concessão vencida" e "indícios de abandono") | Sim |
| 3 | Ordens de serviço e vistorias no app de campo, com foto e GPS | Sim, para os funcionários da prefeitura |
| 4 | Fotos e documentos por túmulo | Sim |
| 5 | Busca pública e "como chegar ao túmulo" | Sim, **gratuita**, com cadastro do usuário e nome completo ou código do túmulo |
| 6 | QR com o código do túmulo | Sim; útil quando a placa com nome ou foto se perde |
| 7 | Agenda de sepultamentos e pedidos das funerárias | Sim |
| 8 | Painel de vagas e anos restantes | Sim, **melhorado** (ver abaixo), para planejamento e relatórios |
| 9 | Digitalização de livros antigos com revisão humana | Sim |
| 10 | Portal do titular da concessão (atualizar contato, fazer pedidos) | Sim. Integrar com o protocolo da prefeitura se a empresa que fornece o protocolo permitir; senão, protocolo próprio dentro do sistema |

**Situação em 07/10/2026 (etapa 3):** item 7 em parte (agenda de sepultamentos com funerárias cadastradas; o pedido feito pela própria funerária, com acesso dela, fica para depois); item 8 feito (painel de vagas com tudo o que está listado acima).

**Situação em 07/10/2026 (etapa 2 da Gestão do Cemitério):** item 2 feito (mapa colorido por situação e por vistoria; a cor "concessão vencida" depende das concessões, etapa 3); item 3 feito (vistorias, avisos de problema e ordens de serviço no app de campo, com foto e GPS, conferidos no escritório antes de entrar no túmulo); item 4 em parte (fotos na ficha, nas vistorias e nas ordens; documentos anexos ainda não); item 6 já existia (QR com o código do túmulo). Pedidos de limpeza e avisos de acidente (item 1) já entram como ordens de serviço com origem "família" ou "população"; notificações e dossiê do processo ficam para a etapa 4.

Ficaram fora: venda de jazigo pela internet (concessão pública não é venda livre), memorial pago e genealogia aberta.

**Painel de vagas melhorado [D]:**
- vagas livres por tipo (chão, gaveta, jazigo, ossário) e por quadra;
- sepultamentos por mês nos últimos anos, com sazonalidade;
- previsão de quando cada tipo acaba, em 3 cenários (ritmo atual, alta e baixa);
- vagas que podem voltar: concessões vencidas, gavetas com prazo de permanência vencido (exumação possível pela lei municipal) e processos de abandono em andamento, mostrando quanto tempo cada uma ganha;
- capacidade do ossário;
- relatório visual pronto para o prefeito e a câmara (ampliação, novo cemitério, ossário).

**Cobrança da pessoa física (pergunta do usuário, 07/10/2026) — [A conferir] com advogado antes de qualquer proposta [D]:**
- **Não dá para cobrar:** informação pública (onde a pessoa está sepultada) e pedidos à prefeitura (Lei 12.527/2011, de acesso à informação; CF art. 5º, XXXIV, direito de petição sem taxa). Isso inclui a busca, o "como chegar", os pedidos de limpeza e os avisos de acidente. O usuário já definiu a busca como gratuita.
- **Talvez dê para cobrar:** um serviço **extra e opcional**, que não seja necessário para exercer nenhum direito. Exemplos: foto anual do túmulo, avisos automáticos de vencimento por WhatsApp, limpeza feita por empresa contratada. Mas isso exige uma de duas coisas: previsão no edital ou contrato com a prefeitura (tarifa definida pelo município, como concessão de serviço, Lei 8.987/1995), ou um serviço totalmente privado e separado, sem usar a marca nem os dados da prefeitura além do autorizado. Cobrar do cidadão por uma função de um sistema que a prefeitura já paga pode ser visto como cobrança indevida.
- **Risco comercial [D]:** cobrança ao cidadão costuma pesar contra em licitação e na imagem do prefeito. A receita mais segura é o contrato com a prefeitura.

# PARTE C — ESTRATÉGIA COMERCIAL E PRÓXIMOS PASSOS

## C1. Como vender — cada produto separado

Cada produto é contratado separadamente: pode ser uma licitação só para ele ou um **lote próprio** dentro de uma licitação maior. O município pode comprar um, o outro ou os dois.

| Produto | O que entra no contrato | Serviço opcional (receita imediata e atestado) |
|---|---|---|
| **Produto 1 — Gestão Patrimonial** | Licença de uso (mensal), implantação, migração de dados, treinamento, suporte | Execução do inventário físico, reavaliação por comissão/laudo, levantamento e regularização documental de imóveis, adequação à NBC TSP 37 |
| **Produto 2 — Cemitério** | Licença de uso (mensal), implantação, importação das planilhas, treinamento, suporte | Levantamento inicial com drone, plaquetas QR, vistoria de todos os túmulos, apoio na montagem dos processos de abandono |

### Formas de contratação possíveis (valem para os dois)

| Via | Como funciona | Prós | Contras |
|---|---|---|---|
| Pregão eletrônico (software como serviço) | Licitação comum por menor preço, com termo de referência e, em geral, prova de conceito | Caminho mais usado | Exige atestados de capacidade técnica — empresa nova não tem |
| Pregão com registro de preços + participantes | Vários municípios entram juntos desde o início (intenção de registro de preços) | Uma licitação, vários clientes | Mais articulação; regras de adesão posterior [A conferir] |
| CPSI — LC 182/2021 | Licitação especial para testar solução inovadora; contrato de teste e depois fornecimento | Feita para startups [A conferir regras de habilitação] | Prefeitura precisa querer usar o instrumento |
| Consórcio intermunicipal / associação regional | Contratação via consórcio da região (ex.: AMAVI) [A conferir quais compram software] | Escala regional | Ciclo de decisão longo |
| Parceria com empresa maior | Nosso produto entra na proposta de outra empresa (consórcio de empresas, art. 15 da Lei 14.133) | Resolve falta de atestado | Margem menor; dependência |

### Resolver a falta de atestado

1. Piloto gratuito ou de baixo valor em município vizinho **sem vínculo com os sócios**, com contrato ou termo de cooperação, para gerar atestado — um piloto por produto.
1. Parceria com empresa que já tem atestado (subcontratação permitida no edital ou consórcio de empresas).
1. CPSI, se a prefeitura aceitar essa via.

**Atualização v1.2 (07/10/2026):** decisão do usuário: por ser empresa nova, pedir **apresentação do sistema** e **projetos-piloto**. O aplicativo de campo piloto (A2.15) serve para essa apresentação.

### Rio do Sul, especificamente

> Só depois de nenhum sócio ter vínculo com a Prefeitura de Rio do Sul, e sem que nenhum sócio tenha participado da elaboração do termo de referência, da pesquisa de preços ou da comissão. Até lá, Rio do Sul é **caso de estudo interno**, não cliente — para os dois produtos. Validar com advogado.

## C2. Roteiro em duas trilhas

Cada produto tem sua própria trilha e sua versão mínima vendável. Rodar as duas ao mesmo tempo com 2–3 pessoas exige **um responsável por trilha**; se isso não for possível, escolher qual sai primeiro (seção 1.3).

| Fase | Trilha Produto 1 — Patrimônio | Trilha Produto 2 — Cemitério |
|---|---|---|
| 0 — Comum | Parecer jurídico sobre impedimento; CNPJ; modelo de contrato; política LGPD; plataforma base (usuários, perfis, importação De/Para, exportação, auditoria, backup, mapa) | (mesma fase 0) |
| 1 — Versão mínima vendável | Unidades 360°, bens móveis e imóveis, transferências com aceite, inventário anual com conciliação (A2.3), app de campo (piloto em HTML já iniciado na v1.2 — A2.15), relatórios do TCE/SC | Cadastro, importação das 2 planilhas, mapa, QR, vistoria no app, indicadores de abandono, notificação/edital, painel |
| 2 | Depreciação, valor residual, reavaliação em massa e **em blocos** (A2.13), componentes, NBC TSP 37, obras (melhoria × manutenção), exportação ao SIAFIC | Fluxo completo do processo de abandono, ossário, consulta pública, integração com tributário |
| 3 | Vistorias e equipes, demandas, manutenção preventiva (PMOC etc.), score, imóveis: regularização documental | — |
| 4 | Notas fiscais, pesquisa de preços, painéis por fundo, IA | — |
| Frota (v1.2) | **Frota de veículos** (Módulo 10): fase a definir pelo usuário. Abastecimento, km e checklist já estão no piloto do app | — |

## C3. Pendências e perguntas abertas

| # | Pendência | Produto | Quem resolve |
|---|---|---|---|
| 1 | Enviar as 2 planilhas do cemitério (cabeçalho completo) — **v1.3: recebida a "Lista de chãos" (B5); falta a 2ª planilha, se existir** | 2 | Vocês |
| 2 | Parecer de advogado sobre o impedimento (art. 9º §1º Lei 14.133) — **v1.2: resolvido, segundo o usuário (documento não anexado)** | 1 e 2 | Advogado |
| 3 | Texto integral da Lei Municipal 4.100/2004 e decretos do cemitério (concessões perpétuas, taxas) | 2 | Pesquisa / Câmara |
| 4 | Confirmar se "Serfic" = SIAFIC | 1 | Vocês |
| 5 | Confirmar o que significa "emissão de notas fiscais" no pedido | 1 | Vocês |
| 6 | Tabela oficial de vida útil e valor residual do município | 1 | Vocês / contabilidade |
| 7 | Verificar se a IPM oferece API para integração com terceiros — **v1.2: sistema será independente; integração deixa de ser obrigatória** | 1 e 2 | Pesquisa / contato comercial |
| 8 | Ler o texto integral da NBC TSP 37 e mapear cada item no sistema | 1 | Pesquisa |
| 9 | Conferir: IN SEGES 65 (prazos das fontes), LC 182 (valores e habilitação), Lei 13.589 (PMOC), Portaria SES/SC 167/2018, regras de adesão a ata municipal | 1 e 2 | Pesquisa |
| 10 | Escolher municípios piloto (sem vínculo com os sócios) — um por produto | 1 e 2 | Vocês |
| 11 | Decidir se as duas trilhas andam juntas ou uma primeiro (1.3) — **v1.2: equipes de trabalho e treinamento intensivo** | 1 e 2 | Vocês |
| 12 | Em que fase entra a frota (Módulo 10) | 1 | Vocês |
| 13 | Conferir as funções do GAX direto no site/manual da 3ia (o site não abriu deste ambiente) | 1 | Pesquisa |
| 14 | Testar o app piloto em celulares e tablets reais (Android e iPhone), por endereço https | 1 e 2 | Vocês |
| 15 | Planilha de chãos: o que significa a coluna "Data" e os valores "I" e "P" de "Situação"; regra para ano com 2 dígitos | 2 | Vocês |
| 16 | Pesquisar a marca "VitalPat" no INPI antes de registrar (busca na internet não achou o nome exato; achou parecidos na área da saúde, como VITALPAC) | 1 e 2 | Vocês |
| 17 | Repositório no GitHub é **público**: decidir se o dossiê (marcado "documento interno") pode ficar lá ou se o repositório vira privado — **v1.3: o usuário vai tornar privado depois; por ora fica público** | 1 e 2 | Vocês |
| 18 | Planilha de chãos limpa: revisar 109 covas sem aléia e 14 com aléia "ok" (como vieram no original) | 2 | Vocês |
| 20 | Login de verdade (servidor, senhas fortes, troca de senha); o login atual é só de demonstração | 1 e 2 | Desenvolvimento |
| 21 | Supabase: criar um projeto novo só do VitalPat e informar o endereço (URL) e a chave pública (anon key). A chave secreta (service role) **nunca** vai para o repositório | 1 e 2 | Vocês |
| 22 | Contratar a empresa do levantamento: combinar no contrato o formato de entrega (B6), a precisão mínima e a ortofoto | 2 | Vocês |
| 19 | O que fazer com a estrutura Django que já existia no repositório (pastas `apps/`, `config/`, `gestao/` etc.): em qual produto entra, ou se será substituída | 1 e 2 | Vocês |

## C4. Fontes consultadas (v1.0 + v1.1)

- TCU — Impedimentos de participar da licitação (Lei 14.133 arts. 9º e 14) — https://licitacoesecontratos.tcu.gov.br/4-5-2-1-impedimentos-de-participar-da-licitacao/
- TCU — Pesquisa de preços — https://licitacoesecontratos.tcu.gov.br/4-3-9-1-fontes-para-obtencao-de-precos-2/
- TCE/SC — Instrução Normativa TC-28/2021 (consolidada) — https://www.tcesc.tc.br/sites/default/files/leis_normas/INSTRU%C3%87%C3%83O%20NORMATIVA%20N%2028-2021%20CONSOLIDADA.pdf
- TCE/SC — e-Sfinge informações — https://www.tcesc.tc.br/esfinge/informacoes
- GCD — Rio do Sul convoca familiares (sepultamento vencido, Lei 4.100/2004), 04/07/2025 — https://www.gcd.com.br/rio-do-sul/prefeitura-de-rio-do-sul-convoca-familiares-para-providencias-sobre-sepultamento-vencido/
- GCD — Rio do Sul convoca familiares sobre gavetas (Edital 002/2026) — https://www.gcd.com.br/rio-do-sul/prefeitura-de-rio-do-sul-convoca-familiares-sobre-gavetas-no-cemiterio/
- Prefeitura de Joinville — sepulturas em abandono, Cemitério Rio Bonito — https://www.joinville.sc.gov.br/noticias/prefeitura-de-joinville-convoca-responsaveis-para-regularizacao-de-sepulturas-em-estado-de-abandono-no-cemiterio-rio-bonito/
- ND+ — Sepulturas abandonadas em SC — https://ndmais.com.br/infraestrutura/sepulturas-abandonadas-podem-ter-restos-mortais-retirados/
- Bom Retiro/SC — Lei 2.573/2024 (regulamenta cemitério) — https://bomretiro.sc.gov.br/uploads/sites/284/2024/03/2573.24-Lei-Regulamenta-Cemiterio.pdf
- TJSC — Corpo estranho em jazigo de família resulta em condenação — https://www.tjsc.jus.br/web/imprensa/-/corpo-estranho-em-jazigo-de-familia-resulta-em-condenacao-de-cemiterio-e-municipio
- Resolução CONAMA 335/2003 — https://www.legisweb.com.br/legislacao/?id=99465
- Portaria SES/SC 167/2018 (não aberta — a conferir) — https://www.legisweb.com.br/legislacao/?id=358159
- Decreto 10.540/2020 (SIAFIC) — https://planalto.gov.br/ccivil_03/_ato2019-2022/2020/decreto/d10540.htm
- Portaria STN 548/2015 (PIPCP) — https://cnm.org.br/cms/images/stories/Links/30092015_CPU_Portaria_STN_548-2015_-_PIPCP1.pdf
- Focus NFe — NFS-e Nacional 2026 (LC 214/2025, ADN para tomador) — https://focusnfe.com.br/blog/nfse-nacional/
- Revista de Geopolítica — fim da atualização do Painel de Preços (Comunicado 30/2025) — https://revistageo.com.br/revgeo/article/view/3510
- ATA360 — metodologia IN 65/2021 — https://ata360.com.br/noticias/pesquisa-precos-in-65-2021-metodologia-completa
- ACATE — Rio do Sul moderniza administração com IPM (2013) — https://www.acate.com.br/noticias/rio-do-sul-sc-moderniza-administracao-com-sistema-de-gestao-em-nuvem-da-ipm/
- IPM — Gestão de cemitérios (módulo Cemitérios) — https://www.ipm.com.br/gestao-de-cemiterios-veja-como-a-tecnologia-facilita-o-trabalho-das-prefeituras/
- Betha — Patrimônio Cloud — https://www.betha.com.br/noticia/solucao-de-patrimonio-da-betha-conta-agora-com-tecnologia-cloud/
- Betha — unidade em Rio do Sul — https://www.betha.com.br/noticia/betha-sistemas-inaugura-unidade-em-rio-do-sul/
- Noticenter — Betha, mapas de ocupação de cemitérios em SC — https://www.noticenter.com.br/n.php?ID=41145&T=com-mapas-de-ocupacao-e-consulta-online-de-jazigos-tecnologia-facilita-gestao-de-cemiterios-em-sc
- CPCON — Inventário de bens patrimoniais públicos — https://grupocpcon.com/artigos/inventario-de-bens-patrimoniais-publicos
- Banco de Preços — https://www.bancodeprecos.com.br/
- CFC / Participa+Brasil — NBC TSP 37 Ativo Imobilizado (substitui NBC TSP 07, vigência 01/01/2027) — https://www.gov.br/participamaisbrasil/nbctsp37r1
- Legismap — NBC TSP 37, de 11/12/2025 — https://legismap.com.br/leis-e-normas/norma-brasileira-de-contabilidade-nbc-tsp-n-37-de-11-12-2025
- TCE/SC — Palestra PIPCP (prazos por porte de município) — https://www.tcesc.tc.br/sites/default/files/Palestra%206%20-%20Plano%20de%20implanta%C3%A7%C3%A3o%20dos%20procedimentos%20cont%C3%A1beis%20patrimoniais%20(PIPCP).pdf
- TCE/SC — Bens de infraestrutura (Decisão 696/2023) — https://www.tcesc.tc.br/municipios-com-menos-de-50-mil-habitantes-tem-ate-1o-de-janeiro-para-incluir-bens-de-infraestrutura
- IN TC-20/2015 consolidada (cópia publicada por Caçador/SC) — https://cacador.sc.gov.br/uploads/sites/319/2026/06/Instrucao-normativa-20-2015-Tcesc-SC-consolidada-13-03-2026.pdf
- CNM — Nota Técnica 23/2018 (depreciação e reavaliação) — https://cnm.org.br/storage/biblioteca/2018/Notas_tecnicas/20810911_NT23_CONTAB_depreciacao_reavaliacao_bens_moveis_imoveis.pdf
- Estratégia Concursos — reavaliação e valor recuperável (MCASP) — https://www.estrategiaconcursos.com.br/blog/reavaliacao-valor-rec-ibama/
- LegJur — Lei 14.133, art. 76 — https://www.legjur.com/legislacao/art/lei_00141332021-76
- CFC — Circuito Técnico Imobilizado e Intangível 2025 — https://cfc.org.br/wp-content/uploads/2025/05/50o-Circuito-Tecnico-CFC-Imobilizado-e-Intangivel.pdf

- 3ia — GAX (gestão de frotas) — https://www.3ia.com.br/gax/ (conteúdo lido só pelo resultado de busca)
- GAX — Wiki de fornecedores, Principais Funcionalidades — http://gax.3ia.com.br/wiki/index.php?title=P%C3%A1gina_principal (conteúdo lido só pelo resultado de busca)
- Google Play — app Condutor Gax — https://play.google.com/store/apps/details?id=com.execucao.condutor_gax

*Pesquisas realizadas em 23/09/2026, 26/09/2026 e 07/10/2026. Este dossiê não é parecer jurídico nem contábil.*
