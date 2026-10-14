# Imóveis: plano de análise com o Gemini (3 rodadas)

Criado em 14/10/2026. Atualizar sem apagar o histórico. **Neste repositório (público) ficam só o plano, os prompts e a estrutura. Nunca matrículas, planilhas reais, nomes ou CPFs.**

## O que existe (conferido em 14/10/2026 só pela lista de pastas; nenhum conteúdo foi aberto)

| Fonte | Onde | Observação |
|---|---|---|
| Planilha "Relação Imóveis PMRS" | Google Planilhas (link enviado pelo usuário; o dono é outra pessoa da prefeitura) | Tem várias abas. A primeira ("Cartório") é de conferência: matrícula, encontrado, planilha, check list, Sistema IPM |
| Matrículas em **TXT** | `Acervo Imóveis/DOC/<tipo>/` | Subpastas por tipo (Unidades, Escolas, APP, Área Verde…) e uma pasta `Imagens` |
| Matrículas em **PDF** | `Acervo Imóveis/Tipos/<tipo>/` | Só quando o TXT está vazio ou falta. Tipos: Área Verde, APP, Casa Popular, Equipamentos Comunitário, Escolas, Não é do Município, Posto de Saúde, Praça, Ruas, Terreno, Unidades |
| Matrículas por **situação** | `Acervo Imóveis/` → Baixadas, A Verificar, Confirmadas, Unificadas e Desmembradas | Entram na análise; o nome da pasta é uma informação |
| Mapa (Google Earth) | `Acervo Imóveis/PMRS.kml` (138 KB) | Pontos e/ou contornos com nome |
| Ignorar | `DOC_state.json`, `RELATORIO_ERROS_TRANSCRICAO`, `RELATORIO_FINAL_…`, `Transcrição PDF's e Imagens` | |

Cruzamento: planilha × matrícula (TXT, ou PDF se faltar) × mapa, pelo **número da matrícula** e pelo **endereço**. O que faltar em algum lado vai para o relatório de faltantes.

## Etapas

**Etapa 0 — amostra (Claude, nesta conversa).** Só o combinado:

- 5 linhas da planilha;
- 1 matrícula TXT de cada pasta;
- 5 itens do KML, conferindo no mapa se a coordenada bate com o endereço.

Também mede o tamanho total das pastas pela lista de arquivos, sem abrir, para saber se tudo cabe numa vez só no Gemini (1 milhão de tokens).

Resultado: os prompts são escritos sobre o formato real. Nada da amostra vai para o repositório.

**Etapa 1 — Rodada 1 do Gemini: descobrir.** Prompt 1 (`prompt-1-descobrir.md`) com tudo junto. O Gemini entrega:

1. inventário de todos os dados de cada fonte;
2. catálogo de padrões **com contagem de ocorrências** (como cada cartório e cada época escreve área, confrontações, averbações, transmissões, unificação e desmembramento);
3. variações e abreviações;
4. problemas de qualidade (TXT vazio, transcrição ruim, número divergente);
5. proposta de **abas e campos** para o sistema;
6. relatório de faltantes (está na planilha e não tem matrícula, tem matrícula e não está na planilha, sem ponto no mapa, e o contrário).

**Etapa 2 — decisão (usuário + Claude).** Revisar a proposta, decidir abas e campos, ajustar o cadastro de imóveis do VitalPat se faltar campo. Hoje ele já tem matrícula, cartório, situação do registro, uso, afetado, áreas, IPTU, endereço e latitude/longitude.

**Etapa 3 — Rodada 2 do Gemini: extrair.** Prompt 2 (`prompt-2-extrair.md`) com a estrutura aprovada. O Gemini preenche cada imóvel nos mesmos campos e entrega a planilha **no formato da importação do VitalPat**, com:

- a fonte de cada valor (arquivo e trecho);
- "não encontrado" no lugar de chute;
- as divergências entre as fontes;
- os faltantes.

**Etapa 4 — Rodada 3 do Gemini: mecanismo.** Prompt 3 (`prompt-3-mecanismo.md`): a partir dos padrões, o Gemini descreve as regras de leitura (por cartório e época) e de cruzamento. O Claude transforma isso em código no VitalPat:

- leitura de matrícula em TXT e PDF;
- importação da planilha;
- importação do KML.

Tudo testado só com dados fictícios.

**Etapa 5 — importar no sistema de teste.** Importar com prévia, conferir por amostra, corrigir, desfazer se precisar.

## Cuidados

- **Dados pessoais:** matrículas trazem nomes e CPFs. Mandar para o Gemini é decisão do usuário (LGPD).
- **O Gemini pode inventar:** todo prompt exige "não encontrado" e a origem de cada valor. A importação no VitalPat continua com prévia e conferência por pessoa.
- **Tamanho:** se não couber numa vez só, cada lote recebe o catálogo de padrões acumulado e devolve atualizado, com contagem. Assim nenhum padrão se perde entre lotes.
- **Leitura de TXT pelo Drive** (deduzido pela lista de formatos do conector, a conferir na etapa 0): o conector lê planilha, PDF e Word; TXT será testado pelo download.

## Resultado da etapa 0 (14/10/2026)

Confirmado por leitura real:

- **amostra**: 5 linhas de "Relação IPM - Atualizando" e de "Baixadas"; 1 TXT de cada uma das 11 pastas da `DOC` (sem `Imagens`); 5 itens do KML;
- **leitura de TXT pelo Drive funciona**: a suspeita do plano estava errada;
- **tamanho**: 712 TXT com "Matricula" no nome, 2,1 MB, cerca de 600 mil tokens. **Cabe numa vez só** no Gemini (1 milhão), junto com a planilha e o KML. A planilha "Cartório" fala em 716 matrículas únicas;
- **KML**: 231 marcadores (230 pontos, 1 polígono). O nome é a matrícula **ou** o cadastro imobiliário. Em 3 pontos conferidos, a coordenada bateu com a da planilha (menos de 2 m).

Não deu para fazer:

- **conferir o endereço no mapa**: a rede deste ambiente recusa os serviços de mapa. Testado em 3 serviços independentes (OpenStreetMap, Photon, ArcGIS), todos recusados.

Achados que entram no prompt 1:

- OCR com erros;
- **o titular da abertura muitas vezes não é o atual** (doação a fundação, desafetação e doação a pessoa física, encargo com reversão);
- confrontações em 3 formatos, inclusive coordenadas UTM SIRGAS 2000;
- a mesma matrícula em várias linhas e arquivos;
- áreas com dois valores numa célula.

Prompt 1: `prompt-1-descobrir.md`. **Os links do Drive ficam fora do repositório** (público); a versão com links fica com o usuário.

## Histórico

- 14/10/2026: plano criado; estrutura das pastas conferida pela lista (sem abrir conteúdo).
- 14/10/2026: etapa 0 feita; prompt 1 escrito.
