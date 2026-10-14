# Prompt 1 — Rodada 1 do Gemini: descobrir padrões e propor a estrutura

Criado em 14/10/2026 a partir da etapa 0 (amostra: 5 linhas de 2 abas da planilha, 1 matrícula TXT de cada uma das 11 pastas da `DOC`, 5 itens do KML). Atualizar sem apagar o histórico.

## Antes de colar o prompt: juntar tudo num arquivo só (recomendado)

O Gemini lê melhor **um arquivo grande** do que 700 arquivos soltos pelo Drive. Tamanho medido em 14/10/2026 pela lista de arquivos, sem abrir nenhum:

- **712 TXT** com "Matricula" no nome, somando 2,1 MB, o que dá cerca de **600 mil tokens**;
- mais a planilha e o KML.

**Cabe em 1 milhão de tokens.** É uma estimativa: a lista pode ter TXT de fora do Acervo.

Script para juntar (Google Apps Script):

1. Abra script.google.com → **Novo projeto**.
2. Cole o código abaixo e clique em **Executar**. Na primeira vez, autorize o acesso ao seu Drive.
3. Ele cria dois arquivos na pasta **Acervo Imóveis**:
   - `GEMINI_todas_matriculas.txt`: todos os TXT, um depois do outro, com o nome do arquivo e a pasta antes de cada um;
   - `GEMINI_inventario_arquivos.tsv`: a lista de **todos** os arquivos (TXT, PDF, outros), com pasta, tamanho e ID, usada para o relatório de faltantes.

```javascript
function juntarMatriculasParaGemini() {
  var ACERVO = 'COLE_AQUI_O_ID_DA_PASTA_ACERVO';               // pasta Acervo Imóveis (o código que aparece no link da pasta)
  var IGNORAR_PASTAS = ['Imagens'];                               // DOC/Imagens fica de fora
  var IGNORAR_ARQUIVOS = /^(DOC_state\.json|RELATORIO_ERROS_TRANSCRICAO|RELATORIO_FINAL|Transcrição PDF's e Imagens|GEMINI_)/i;
  var texto = [], inventario = ['pasta\tarquivo\ttipo\ttamanho\tid'];
  function percorrer(pasta, caminho) {
    var arqs = pasta.getFiles();
    while (arqs.hasNext()) {
      var a = arqs.next(), nome = a.getName();
      if (IGNORAR_ARQUIVOS.test(nome)) continue;
      inventario.push([caminho, nome, a.getMimeType(), a.getSize(), a.getId()].join('\t'));
      if (a.getMimeType() === 'text/plain' && /^matr/i.test(nome)) {
        texto.push('\n\n===== ARQUIVO: ' + nome + ' | PASTA: ' + caminho + ' | ID: ' + a.getId() + ' =====\n' + a.getBlob().getDataAsString('UTF-8'));
      }
    }
    var subs = pasta.getFolders();
    while (subs.hasNext()) { var s = subs.next(); if (IGNORAR_PASTAS.indexOf(s.getName()) < 0) percorrer(s, caminho + '/' + s.getName()); }
  }
  var raiz = DriveApp.getFolderById(ACERVO);
  percorrer(raiz, 'Acervo Imóveis');
  raiz.createFile('GEMINI_todas_matriculas.txt', texto.join(''), MimeType.PLAIN_TEXT);
  raiz.createFile('GEMINI_inventario_arquivos.tsv', inventario.join('\n'), MimeType.PLAIN_TEXT);
  Logger.log('TXT juntados: ' + texto.length + ' · arquivos no inventário: ' + (inventario.length - 1));
}
```

Depois, no Gemini, anexe estes **4 arquivos**:

1. `GEMINI_todas_matriculas.txt`
2. `GEMINI_inventario_arquivos.tsv`
3. a planilha "Relação Imóveis PMRS"
4. `PMRS.kml`

Cole o prompt abaixo. Se preferir não usar o script, anexe as pastas pelos links. O prompt funciona do mesmo jeito, mas o risco de o Gemini não abrir todos os arquivos é maior.

## Links

**No repositório (público) os links ficam de fora**, porque dão acesso a matrículas com dados pessoais. A versão com os links fica com o usuário, fora do repositório. As fontes são: a planilha "Relação Imóveis PMRS", a pasta Acervo Imóveis (DOC, Tipos, Baixadas, A Verificar, Confirmadas, Unificadas e Desmembradas) e o arquivo PMRS.kml.

---

## PROMPT (copiar daqui até o fim)

Você é um analista de cadastro imobiliário público. Vou te dar o acervo de imóveis do Município de Rio do Sul/SC para você **descobrir padrões e propor uma estrutura de dados**. Ainda **não** é para extrair imóvel por imóvel. Isso será a rodada 2, com a estrutura que sair daqui. Leia **tudo** antes de responder: os padrões precisam de contagem sobre o acervo inteiro, não sobre uma parte.

### Fontes

1. **Matrículas em TXT.** Todas no arquivo `GEMINI_todas_matriculas.txt`, cada uma depois de uma linha `===== ARQUIVO: … | PASTA: … =====`. Ou, se o arquivo não vier anexado, na pasta DOC, onde cada subpasta é um tipo (Área Verde, APP, Casa Popular, Equipamentos Comunitário, Escolas, Não é do Município, Posto de Saúde, Praça, Ruas, Terreno, Unidades), às vezes com uma subpasta por imóvel. **Ignore a pasta DOC/Imagens.** Os Google Docs soltos na raiz da DOC (ex.: "Unidades", "[Temp] Ruas - Parte 3") são compilados antigos: não use.
2. **Matrículas em PDF** (pasta Tipos, mesmas subpastas). Use o PDF **só** quando o TXT da mesma matrícula estiver vazio, cortado ou não existir. Diga sempre quando usou PDF.
3. **Pastas de situação** (Baixadas, A Verificar, Confirmadas, Unificadas e Desmembradas). O nome da pasta é uma informação sobre a matrícula. Inclua na análise.
4. **Planilha "Relação Imóveis PMRS".** A aba principal é **"Relação IPM - Atualizando"**. Use também "Baixadas", "Imóveis" e "Cartório" (conferência). "Retificação" está vazia.
5. **PMRS.kml** (Google Earth): pontos com o nome igual a um número.
6. **`GEMINI_inventario_arquivos.tsv`**: a lista de todos os arquivos, para conferir o que falta.

Ignore: `DOC_state.json`, `RELATORIO_ERROS_TRANSCRICAO`, `RELATORIO_FINAL_…`, `Transcrição PDF's e Imagens`.

### O que já se sabe (amostra) — confirme ou corrija no acervo inteiro

**Nome do arquivo.** Normalmente é `Matricula_<nº> - <cadastro(s) imobiliário(s)> - <descrição>_<AAAAMMDD>_<HHMM>.txt`. Variações vistas:

- `Matricula_<nº>_cod<cadastro>_…`;
- duas matrículas no mesmo nome (`Matricula_49386, 814 - …`);
- vários cadastros (`39264, 39922`, `42576 e 54135`);
- sem cadastro;
- descrição com observação de situação ("Possível Invasão ou terra doada", "NÃO É DO MUNICÍPIO", "Precisa Arrumar Cigageo");
- a mesma matrícula em dois arquivos, com cadastros diferentes.

**Texto da matrícula.** É transcrição automática (OCR), com erros: I/1, O/0, l/1, S/5, palavras quebradas com hífen, "digo:" corrigindo o que vem antes. Tem cabeçalhos e rodapés repetidos ("Livro N. 02", "Registro Geral", "Fls.", "Continua no verso", "Visualização gerada em … Não vale como certidão").

- **CNM**: Código Nacional de Matrícula, `108522.2.00NNNNN-DD`, em que 108522 é o cartório e NNNNN o número da matrícula.
- **Partes**: número e data de abertura; **Imóvel**; **Proprietário** (o da abertura, não necessariamente o atual); **Registro anterior** (transcrição, matrícula anterior, livro e folhas); depois os **atos em ordem**.
- **R-n** (registro): doação, compra e venda, desapropriação amigável ou judicial, dação em pagamento, usucapião, herança/partilha, divisão, permuta, hipoteca, penhora.
- **AV-n** (averbação): construção (habite-se, área construída), retificação ("e não como consta por engano"), cancelamento, desafetação, qualificação objetiva (logradouro, cadastro imobiliário, inscrição imobiliária), escrituração eletrônica, servidão de passagem, encargos e cláusulas de reversão com prazo.
- **Descrição do terreno**: área (m², às vezes por extenso), rua, bairro, lote/quadra/loteamento, e medidas e confrontações em três formatos: (a) frente/fundos/lado direito/lado esquerdo, (b) Norte/Sul/Leste/Oeste, (c) vértices em coordenadas **UTM SIRGAS 2000 (meridiano central −51)**, com azimutes e distâncias, nas matrículas recentes de Reurb.
- **Valores** em moedas antigas (CR$, NCz$, CR$ "cruzeiros reais", R$), cada um com a data do ato.
- **Atenção ao titular atual**: o proprietário da abertura muitas vezes não é o atual. Exemplos da amostra: imóvel desapropriado pelo Município e depois **doado a uma fundação** com cláusula de reversão; imóvel doado ao Município pelo Estado **com encargo e prazo**, sob pena de reversão; lote de Reurb **desafetado e doado a pessoa física** (pasta "Não é do Município"); imóvel doado a uma entidade e devolvido ao Município anos depois.

**Planilha, aba "Relação IPM - Atualizando".** Colunas:

- Pasta, Tipo, Cadastro Imobiliário, **Matrícula**, Logradouro, N°, Bairro, Complemento, OBS, Área M², **Coordenada**, Fotos, Fornecedor, Forma, Etiqueta, Secretaria.

Problemas vistos:

- a mesma matrícula em várias linhas (uma por cadastro ou benfeitoria);
- cadastro com dois números ("39922/39264");
- área com dois valores ("3016,69 (2989,73)") ou mal escrita ("5,000,70 (4826,00)");
- coordenada em graus-minutos-segundos (`27°13'47.74"S 49°39'33.20"W`) ou com texto no lugar ("Invasão");
- bairro com espaço no fim;
- OBS com informação importante em texto livre.

**Aba "Baixadas".** As mesmas colunas (Tipo vazio) e mais "Coluna 1…14" vazias.

- O OBS traz o **motivo da baixa** (doação com número da lei, permuta, retificação/unificação "à matrícula X, pasta Y", desmembramento, "baixado em <data> pela Lei <nº>").
- O Complemento às vezes traz "EM NOME DE <pessoa>".

**KML.** 231 marcadores: 230 pontos e 1 polígono, sem descrição.

- O **nome** é o número da **matrícula ou do cadastro imobiliário**: na amostra os dois aparecem.
- Às vezes vem uma lista ("19477, 19587, 19588 e 19589", "14860 e 21716"), um sufixo ("69816 - 01") ou um asterisco ("28360*").
- Nos 3 pontos conferidos, a coordenada do KML bateu com a coluna Coordenada da planilha (diferença menor que 2 m).

### Regras

- **Não invente.** Se não encontrou, escreva "não encontrado". Se leu com dúvida (OCR ruim), marque "dúvida" e copie o trecho.
- Para todo padrão, dê a **contagem** (quantas matrículas) e **2 exemplos** com o nome do arquivo.
- **Dados pessoais:** **não** copie CPF, RG, estado civil nem endereço de pessoas. Quando o titular for pessoa física, escreva só "pessoa física". Nomes de empresas, entidades e órgãos públicos podem aparecer.
- Corrija mentalmente os erros de OCR para entender o texto, mas mostre o trecho original quando citar.

### O que entregar (nesta ordem, em tabelas)

1. **Resumo do acervo.** Quantos TXT, PDF e matrículas únicas; por pasta de tipo e por pasta de situação; TXT vazios ou cortados; PDF usados por falta de TXT.
2. **Inventário de dados por fonte.** Para matrícula, planilha (cada aba) e KML: cada dado que existe, onde aparece, em quantos registros e o formato.
3. **Catálogo de padrões das matrículas, com contagem:**
   - formatos de cabeçalho;
   - formatos de descrição e de confrontações;
   - tipos de ato R e AV;
   - como aparece a área (e quantas têm área retificada depois);
   - como aparece o cadastro imobiliário;
   - construções e habite-se;
   - encargos, cláusulas e prazos de reversão;
   - desafetação;
   - unificação e desmembramento (matrícula "mãe" e "filhas");
   - matrícula encerrada;
   - moedas;
   - períodos (décadas) e diferenças entre épocas.
4. **Titular atual.** Regra para descobrir o titular atual seguindo a cadeia de atos. Quantas matrículas terminam com o Município, com outro ente público, com entidade e com pessoa física. Quantas estão em pasta que não combina com isso (ex.: pasta "Unidades" mas o titular atual não é o Município).
5. **Cruzamento** matrícula × planilha × KML: qual é a chave de ligação (número da matrícula, cadastro imobiliário, endereço) e quanto liga em cada combinação. Divergências de área, bairro, rua e tipo, com contagem e exemplos.
6. **Relatório de faltantes:**
   - na planilha e sem TXT nem PDF;
   - com TXT ou PDF e fora da planilha;
   - na planilha sem coordenada;
   - no KML sem linha na planilha;
   - matrícula repetida;
   - número que aparece como matrícula num lugar e como cadastro em outro.
7. **Problemas de qualidade:** OCR ilegível, números trocados, campos misturados na planilha (texto em coluna de coordenada, duas áreas numa célula), com contagem.
8. **Proposta de estrutura** para o sistema de patrimônio:
   - **abas** (ex.: Imóvel, Matrícula, Atos/Histórico, Construções, Encargos e cláusulas, Cadastros imobiliários, Localização, Pendências);
   - **campos** de cada aba: nome, tipo, se é obrigatório, de que fonte vem, e um exemplo **sem dados pessoais**;
   - **listas fixas** (tipos de ato, situação, tipo de imóvel, forma de aquisição).

   O sistema já tem: matrícula, cartório, situação do registro (registrado / em regularização / sem registro / posse), classificação de uso (uso comum do povo / uso especial / dominical), afetado (sim/não), área do terreno, área construída, valor do terreno, inscrição do IPTU, endereço (logradouro, bairro, cidade), latitude e longitude. Diga o que falta.
9. **Perguntas** que só a prefeitura pode responder (ex.: significado de "Etiqueta", "Forma", "Fotos"; o que conta como "Confirmada" ou "A Verificar").

No fim, escreva em 5 linhas o que você recomenda para a rodada 2, que é a extração imóvel por imóvel.
