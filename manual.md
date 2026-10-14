# Manual do VitalPat

Como usar o sistema, passo a passo. Este manual vai crescer: cada função nova ganha uma seção aqui.

**Versão do manual:** 14/10/2026. Por enquanto cobre o **VitalPat Patrimônio**: exportar, importar, anexos, itens de controle e leitura da matrícula.

## Índice

1. [Exportar (baixar planilha)](#1-exportar-baixar-planilha)
2. [Importar bens pela planilha do Excel](#2-importar-bens-pela-planilha-do-excel)
3. [Anexos (fotos, notas, termos)](#3-anexos-fotos-notas-termos)
4. [Itens de controle (fora do balancete)](#4-itens-de-controle-fora-do-balancete)
5. [Ler a matrícula do imóvel (PDF)](#5-ler-a-matrícula-do-imóvel-pdf)
6. [Perguntas comuns](#6-perguntas-comuns)
7. [Estado de conservação, inservível e imprestável](#7-estado-de-conservação-inservível-e-imprestável)
8. [Baixa em lote (leilão)](#8-baixa-em-lote-leilão)
9. [Plaquetas: anteriores, troca e cadastros duplicados](#9-plaquetas-anteriores-troca-e-cadastros-duplicados)
10. [Recebimento e termo de responsabilidade com prazo](#10-recebimento-e-termo-de-responsabilidade-com-prazo)
11. [Menu lateral: grupos e menu escondido](#11-menu-lateral-grupos-e-menu-escondido)
12. [Cadastros vazios: dados a receber da prefeitura](#12-cadastros-vazios-dados-a-receber-da-prefeitura)
13. [Cadastros por planilha e planilha de teste](#13-cadastros-por-planilha-e-planilha-de-teste)
14. [Compras: fornecedor cadastrado sozinho](#14-compras-fornecedor-cadastrado-sozinho)
15. [Valor residual (depreciação)](#15-valor-residual-depreciação)

---

## 1. Exportar (baixar planilha)

Há três jeitos de tirar dados do sistema.

### 1.1 Botão "Baixar planilha" em qualquer lista

Toda lista do sistema tem o botão **Baixar planilha**.

1. Abra a lista (por exemplo, Bens móveis) e use os filtros, se quiser.
2. Quer só algumas linhas? Marque-as na lista. Assim, só elas saem.
3. Clique em **Baixar planilha**.
4. Marque as **colunas** que quer levar e desmarque o resto. Cada sistema de destino aceita só parte das informações.
5. Se for usar a mesma escolha de novo, dê um nome em **Salvar esta escolha como modelo**. Da próxima vez, é só escolher o modelo.
6. Escolha o **formato**:
   - **Excel (.xlsx)**: é o padrão.
   - **CSV**: planilha simples.
   - **JSON**: arquivo de dados, para outros sistemas.
7. Clique em **Baixar**.

O sistema lembra o último formato e as últimas colunas escolhidas em cada lista.

### 1.2 Tela "Exportar e importar" → aba Exportar (bens em lote)

Menu **Exportar e importar** → aba **Exportar**.

1. **O que exportar**: Bens móveis, Veículos, Imóveis ou Itens de controle.
2. **Filtros** (opcionais):
   - Unidade;
   - Local (por exemplo, "Sala 12");
   - Grupo da classificação;
   - Situação (ativos, baixados ou todos).
3. **Uma aba por unidade**: marque para sair uma aba do Excel para cada unidade.
4. Marque as **colunas**. Também dá para salvar como modelo.
5. Clique em **Baixar Excel**.

As colunas desta exportação são **as mesmas do modelo de importação**. Por isso, dá para exportar, corrigir no Excel e importar de volta (seção 2). As colunas "Código", "Tipo", "Situação", "Valor contábil atual" e "Fotos e anexos" saem só na exportação. Na importação, elas são ignoradas.

### 1.3 Lista completa de onde dá para exportar

Cada item abaixo tem o botão **Baixar planilha** na própria tela. A aba Exportar mostra os mesmos links.

| Área | Listas |
|---|---|
| **Bens** | Bens móveis · Bens imóveis · Bens de uma unidade (abra a unidade em Cadastros) · Entradas (itens a incorporar) · Transferências · Histórico de movimentações |
| **Financeiro** | Fechamento do mês · Melhorias · Baixas · Reavaliações (blocos) · Arquivos para a contabilidade · Todos os relatórios (balancete, depreciação, inventário, seguros, despesas, incorporações, baixas, imóveis, veículos…) |
| **Inventário** | Inventários feitos · Andamento por unidade |
| **Imóveis** | Demonstrativo (TCE/SC) · Documentos · Cessões · Pendências |
| **Frota** | Veículos · Abastecimentos · Viagens · Contratos e conferência · Motoristas · Manutenção · Multas · Documentos · Pneus · Reservas · Arquivos do cartão-combustível |
| **Manutenção** | Chamados · Preventiva · Vistorias · Equipes · Custo por unidade |
| **Itens de controle** | Lista dos itens |
| **Cadastros** | Unidades · Responsáveis · Classificações · Produtos · Contas · Fornecedores · Motivos · Entidades · Comissões · Seguradoras · Tipos de garantia |
| **Outros** | Lixeira · Pessoas (só administrador, com servidor) · Prévia de importação |

---

## 2. Importar bens pela planilha do Excel

Serve para incluir muitos bens de uma vez ou para corrigir dados em lote. **Nada é gravado antes da sua confirmação, e dá para desfazer.**

### 2.1 Baixar o modelo

Menu **Exportar e importar** → botão **Baixar modelo para importação**.

O modelo é um arquivo Excel com estas abas:

| Aba | O que é |
|---|---|
| **Bens móveis** | Uma linha por bem (móveis, equipamentos, informática…). |
| **Veículos** | As mesmas colunas, mais placa, RENAVAM, chassi, combustível e ano/modelo. |
| **Imóveis** | As mesmas colunas, mais matrícula, cartório, situação do registro, o que impede o registro, uso, afetado, IPTU, áreas, valor do terreno, endereço e coordenadas. |
| **Itens de controle** | Itens fora do balancete (seção 4). |
| **Instruções** | O que vai em cada coluna e quais são obrigatórias. |
| **Listas** | Os nomes exatos de unidades, classificações, responsáveis, fornecedores, estados e demais opções. |

Outro caminho: exporte os bens (seção 1.2), corrija no Excel e importe o mesmo arquivo de volta.

### 2.2 Preencher

- **Uma linha por bem**, na aba do tipo certo. **Não mude os títulos da primeira linha.**
- **Apague as linhas de EXEMPLO.** O sistema recusa as linhas que começam com "EXEMPLO".
- **Bem novo**: deixe a **Plaqueta** vazia para o sistema dar uma automática, ou informe a plaqueta que já está colada no bem.
  - Obrigatórios: **Descrição, Classificação, Data de aquisição e Valor de aquisição**.
  - A **Unidade** também é obrigatória, se essa opção estiver ligada em Configurações.
- **Bem que já existe**: informe a **Plaqueta** e só as colunas que quer mudar.
  - **Célula vazia não apaga nada.**
  - O valor anterior fica no histórico do bem.
- **Não mudam pela planilha** (para ficar registrado do jeito certo):

  | Informação | Como mudar |
  |---|---|
  | Valor | Reavaliação |
  | Unidade | Transferência (gera termo) |
  | Data de aquisição e classificação | Na ficha do bem |

  Se a planilha trouxer um valor diferente nessas colunas, a prévia avisa e não altera.
- **Datas**: dd/mm/aaaa. Pode ser data do próprio Excel.
- **Valores**: número, com vírgula nos centavos (1250,90).
- **Unidade, classificação, responsável e fornecedor**: escreva igual à aba **Listas**. Para a unidade, também vale o código. Para o fornecedor, também vale o CNPJ.
- **Estado**: Novo, Ótimo, Bom, Regular, Ruim ou Péssimo (ou os números 6 a 1).

### 2.3 Importar

1. Menu **Exportar e importar** → aba **Importar** → **Escolher arquivo** (.xlsx ou .csv).
2. **Colunas do arquivo**: o sistema liga cada coluna da planilha a uma informação do bem pelo título.
   - Confira as ligações. "— não importar —" ignora a coluna.
   - Marque as abas que devem entrar.
   - "Lembrar estas ligações" guarda a escolha para a próxima vez. Isso serve para planilhas com outros títulos, como as de um sistema antigo.
3. Clique em **Ver a prévia**. Cada linha aparece com a sua situação:

   | Situação | O que significa |
   |---|---|
   | **Novo** | Será incluído. |
   | **Alterado** | Mostra cada informação, antes → depois. |
   | **Igual** | Nada muda. |
   | **Erro** | Mostra o motivo: unidade que não existe, data inválida, plaqueta repetida no arquivo, coluna obrigatória vazia… |

4. Desmarque o que não quiser e clique em **Importar o que está marcado**.
5. Aparece a **tela de resultado**: quantos deram certo e a lista do que não entrou, com o motivo. O botão **Baixar lista de falhas** gera uma planilha com essa lista.

### 2.4 Desfazer

Na aba **Importar**, em **Importações feitas**, clique em **Desfazer**:

- os bens incluídos vão para a **Lixeira** (podem voltar de lá);
- os bens alterados voltam ao valor anterior.

Se um bem incluído já teve outra movimentação depois da importação (por exemplo, uma transferência), ele não é desfeito. A tela de resultado mostra quais foram.

### 2.5 Importar do sistema atual (relatório "Consulta de Bem")

Para trazer de uma vez todos os bens do sistema que a prefeitura usa hoje (testado com 35 mil bens: a prévia sai em cerca de 1 segundo e a gravação em cerca de 25 segundos):

1. No sistema atual, tire o relatório **Consulta de Bem** (Tipo, Status e Estado: Todos) e salve em **CSV/texto**. Não precisa mexer no arquivo: pode deixar as linhas de título, o rodapé e os acentos como vieram.
2. Em **Exportar e importar** → **Importar**, escolha o arquivo. O sistema:
   - acha sozinho o cabeçalho (depois das linhas de título) e ignora o rodapé ("Total de bens", "Emitido em");
   - liga as **colunas, uma vez só** (não é bem por bem):

     | Coluna do relatório | Informação no VitalPat |
     |---|---|
     | Código | Plaqueta |
     | Tipo | Tipo do bem, linha a linha (móvel, imóvel, domínio público) |
     | Complemento | Descrição e complemento |
     | Aquisição | Data de aquisição |
     | Valor Contábil | Valor contábil |
     | Status | Situação |
     | Centro de Custo | Unidade |
     | Características | Características |
     | Estado | Estado (*atualização 08/10/2026:* "Inservível" vira a **situação** do bem, não o estado — ver seção 7) |
3. Clique em **Ver a prévia** e confira:
   - **Centros de custo**: cada código que ainda não existe vira uma **unidade nova** com o nome provisório "Centro de custo 84.003.001". Dá para ligar um código a uma unidade que já existe (uma escolha por código, não por bem). Os nomes se corrigem depois em Cadastros → Unidades.
     - *Atualização 08/10/2026 (decisão do usuário):* código **não cadastrado não vira mais unidade provisória**. O bem entra **sem centro de custo**, guardando o código, e aparece como **pendência grave** no painel. Em **Centros de custo pendentes** (link na pendência), escolha a unidade de cada código e clique em **Ligar** (com confirmação; fica no histórico de cada bem), ou cadastre a unidade com aquele código. Nada é ligado sozinho. Dica: importe antes os nomes dos centros de custo (2.6).
   - **Classificação**: o relatório não traz. Escolha uma por grupo ou deixe **"A classificar (importação)"**. *Atualização 08/10/2026:* "A classificar" **deprecia como "Demais bens"** (tabela do livro de controle patrimonial: móveis 84 meses e 10% de valor residual, imóveis 360 e 30%, veículos 120 e 30%, domínio público 1.200 e 80%), para nenhum bem ficar sem depreciar. Classificações "A classificar" criadas antes passam a depreciar sozinhas ao abrir o sistema (o que estava antes fica guardado). A central de pendências mostra quantos faltam; classifique depois em lote pela lista de bens.
   - A grade mostra as primeiras 300 linhas. **Baixar prévia completa (Excel)** traz todas, com o motivo de cada erro.
     - *Atualização 08/10/2026:* a prévia tem **páginas** (100, 300 ou 1.000 linhas por página; a tela mostra uma página por vez para o navegador não travar) e **filtros** por situação, **centro de custo** e tipo. Botões: **Salvar os marcados desta página** (grava só o que está na página da tela; o resto continua na prévia, e o que foi gravado aparece como "Já gravado") e **Salvar todos os marcados** (todas as páginas de uma vez, por exemplo depois de conferir tudo no Excel). Cada salvamento pode ser desfeito separadamente.
     - A prévia fica guardada enquanto a aba estiver aberta, mesmo trocando de tela. Ela some se a página for atualizada (F5), fechada ou se a pessoa sair; aí basta escolher o arquivo de novo (nada foi gravado).
     - Bem **sem plaqueta** no arquivo recebe a **próxima plaqueta livre** (a maior já usada + 1). Ela nunca repete uma plaqueta que já existe, nem as que estão no próprio arquivo, nem plaquetas antigas.
   - **Marcar todos os válidos** vale para o arquivo inteiro.
4. **Importar o que está marcado**: o sistema grava em lotes, mostrando "Gravando X de Y bens…", e no fim mostra a tela de resultado. Para voltar atrás, use **Desfazer**: os bens e as unidades criadas vão para a Lixeira.

**Valor contábil × valor de aquisição.** Bem vindo de outro sistema (ou transferido) entra com o **valor contábil**, que é o valor de hoje, já depreciado, como **"Saldo inicial"**. A depreciação segue a partir do mês seguinte. Puxar o valor de compra distorceria: um veículo comprado por 150 mil que hoje vale 10 mil voltaria a valer 150 mil. O **valor de aquisição** é para bem comprado agora (cadastro novo). A data de aquisição original fica registrada.

Importar o mesmo relatório de novo **não duplica**: os bens que já entraram aparecem como "Igual".

---

### 2.6 Importar nomes dos centros de custo (unidades)

O relatório de bens traz só o **código** do centro de custo. Os nomes vêm de outro relatório do sistema atual (lista de usuários × centros de custo).

1. Em **Exportar e importar** → **Importar**, escolha o arquivo (CSV ou Excel). O sistema reconhece sozinho a lista de centros de custo e mostra **"É de: Unidades / centros de custo"**.
2. Só **duas colunas** são lidas: **Classificação** (o código, ex.: 01.001.008) e **Descrição** (o nome). **As outras colunas — como nome e matrícula de servidores — não são lidas nem guardadas.**
3. **Ver a prévia**. O arquivo repete o centro uma vez por servidor; a prévia junta tudo numa linha por código:

   | Na prévia | O que acontece |
   |---|---|
   | **Alterado** | Troca o nome (por exemplo, o provisório "Centro de custo 01.001.008" pelo nome real). O nome anterior fica no histórico da unidade. |
   | **Novo** | Código que ainda não existe: vira uma unidade nova. |
   | **Igual** | Nada muda. |
   | **Erro (conflito)** | O mesmo código com dois nomes diferentes no arquivo. Não entra: corrija o arquivo. |

4. **Importar o que está marcado** e confira a tela de resultado. **Desfazer** volta os nomes anteriores e manda as unidades novas para a Lixeira (as que já tiverem bens continuam).

Dá para importar os nomes antes ou depois do relatório de bens: os bens ficam ligados pelo código.

### 2.7 Itens baratos na importação: patrimônio ou item de controle

Na prévia, os bens **novos sem plaqueta** que custam até o limite (padrão R$ 300) ganham o campo **"Vai para"**, com a **sugestão** do sistema e o motivo (seção 4). O aviso no topo diz quantos foram sugeridos como item de controle, e o filtro **"Valor baixo: conferir destino"** mostra só esses. Mude o que precisar; ao importar, cada linha vai para o lugar escolhido. Bens que já vêm com plaqueta (do sistema atual) não recebem sugestão.

---

## 3. Anexos (fotos, notas, termos)

### 3.1 Cadastrar anexos na ficha do bem

Abra o bem → seção **Anexos**:

- **+ Anexar**: escolha o **tipo** e os arquivos (até 10 MB cada). A descrição é opcional.
  - Tipos: Foto, Nota fiscal, Termo de responsabilidade assinado, Laudo, Contrato, Matrícula ou Outro.
  - Se o tipo ficar vazio, o sistema escolhe pelo arquivo: imagem vira Foto.
- **+ Termo assinado**: atalho para anexar o termo de responsabilidade já assinado, que é o que foi impresso pelo sistema e assinado.
- **Renomear**: muda o tipo, a descrição e o nome do arquivo. Fica no histórico.
- **Tirar**: o anexo sai da lista, mas **não é apagado**. Ele fica em "anexos retirados" e pode ser **restaurado**.
- **Baixar todos (.zip)**: todos os arquivos do bem, com os nomes no padrão abaixo.

As fotos são reduzidas (até 1280 pixels) para não pesar. A foto principal do bem continua em **Trocar foto**, no topo da ficha.

### 3.2 Nome dos arquivos

Na exportação e na importação, o padrão é o mesmo:

```
plaqueta_descricao_01.extensão
```

| Parte | Regra |
|---|---|
| **plaqueta** | O número da plaquinha. |
| **descricao** | A descrição do bem, simplificada: minúsculas, sem acento, `_` no lugar de espaço. |
| **01, 02, 03…** | A ordem dos arquivos de cada bem. |

Exemplo de um bem com 3 fotos e a nota fiscal:

```
123_cadeira_presidente_01.jpg
123_cadeira_presidente_02.jpg
123_cadeira_presidente_03.jpg
123_nota_fiscal_01.pdf
```

### 3.3 Exportar anexos em lote

Menu **Exportar e importar** → aba **Anexos em lote** → **Exportar anexos (.zip)**:

1. Escolha os bens (móveis, veículos ou imóveis) e a unidade.
2. Marque os **tipos** de arquivo (por exemplo, só Fotos ou só Notas fiscais).
3. Clique em **Baixar .zip**.

Junto com os arquivos vai a planilha **lista-dos-arquivos.xlsx**, com cada arquivo, a plaqueta, o bem, o tipo e o nome original.

### 3.4 Importar anexos em lote

1. Dê aos arquivos o nome no padrão `plaqueta_descricao_01`. **O que vem antes do primeiro `_` é a plaqueta.**
2. Menu **Exportar e importar** → aba **Anexos em lote** → **Escolher arquivos**. Pode escolher vários arquivos de uma vez, ou um **.zip** com eles dentro.
3. A **prévia** mostra cada arquivo:

   | Situação | O que significa |
   |---|---|
   | **Pronto** | O bem foi achado pela plaqueta. |
   | **Já existe** | O bem já tem um anexo com esse nome. Vem desmarcado; marque se quiser anexar de novo. |
   | **Não entra** | Nenhum bem tem essa plaqueta, o nome não segue o padrão, o arquivo é maior que 10 MB ou o bem já foi baixado. |

4. O **tipo** é sugerido pelo nome e pode ser trocado na própria grade:
   - "nota" ou "nf" → Nota fiscal;
   - "termo" → Termo;
   - "laudo" → Laudo;
   - "contrato" → Contrato;
   - "matricula" → Matrícula;
   - imagem → Foto.
5. Clique em **Importar o que está marcado**. Aparece a tela de resultado.
6. Para **desfazer**, use **Importações de anexos feitas** → **Desfazer**. Os anexos são retirados (ficam guardados) e podem ser restaurados na ficha.

---

## 4. Itens de controle (fora do balancete)

Servem para bens de **pequeno valor** ou de **pouca durabilidade**, como grampeador, lixeira, garrafa térmica e ventilador de mesa. O limite padrão é abaixo de **R$ 300**, ajustável em Configurações.

*Atualização 08/10/2026 — regra de Rio do Sul (valor × vida útil):* o bem **tem plaqueta** se durar **mais de 2 anos** **ou** custar **mais de R$ 300**. Só vira **item de controle** quando dura **até 2 anos** **e** custa **até R$ 300**. Exemplo: um item de R$ 100 que dura 3 anos tem plaqueta. Os dois limites ficam em **Configurações → Avisos** ("Item de controle: valor até" e "vida útil até (meses)"), porque cada município tem a sua regra.

- **Não ganham plaqueta.** O código é interno: C-000001, C-000002…
- **Não depreciam e não entram** no balancete, na contabilidade nem no inventário oficial. São controlados à parte.

Menu **Itens de controle**:

- **+ Novo item**:
  - descrição, quantidade, valor unitário, unidade, local, responsável, data de entrada, **vida útil prevista (anos)**, estado, fornecedor, nota fiscal e foto.
- **Clique no código** para abrir o item e escolher:

  | Ação | O que faz |
  |---|---|
  | **Editar** | Muda os dados do item. |
  | **Entregar / transferir** | Leva para outra unidade ou responsável. Fica no histórico do item. |
  | **Anexar** | Foto ou documento. |
  | **Dar baixa** | O item sai de uso (gasto, quebrado, extraviado, doado). Fica guardado com o motivo. |
  | **Excluir** | Só para cadastro feito por engano. Vai para a Lixeira. |

- **Fim da vida útil**: o painel mostra quantos itens passaram da vida útil prevista, para avaliar a troca.
- **Exportar e importar**: pelos mesmos caminhos dos bens (seções 1 e 2), com a aba **Itens de controle** do modelo.
  - Para atualizar um item, informe o **Código** (C-000001).
  - Para incluir, deixe o Código vazio.
- **Sugestão no Novo bem**: ao incluir um bem móvel com valor abaixo do limite, o sistema **sugere** cadastrar como item de controle. **Não obriga**: a pessoa decide.
  - *Atualização 08/10/2026:* a sugestão só aparece quando o valor está dentro do limite **e** o item dura até 24 meses. Bem barato e durável (ex.: cadeira de R$ 100) não recebe sugestão: ganha plaqueta.

### 4.1 Sugestão automática: patrimônio ou item de controle (classificador)

O sistema **sempre avisa e mostra**; **quem decide é a pessoa**, item a item.

- **De onde vem a vida útil:** da lista **Cadastros → Vida útil dos itens** (ex.: mouse 12 meses, vassoura 6, cadeira 120). A lista inicial é uma sugestão do sistema: inclua, corrija ou mande para a Lixeira o que não servir. Se o nome do item não está na lista, usa a vida útil da classificação. Se ninguém sabe, a sugestão é **plaqueta**, com o aviso "confira".
- **Onde aparece:**
  - **Nota fiscal (XML):** cada item ganha **"Vai para"** já marcado com a sugestão e o motivo. Exemplo: numa nota de 10 itens, os 4 que custam menos de R$ 10 e duram menos de 1 ano já vêm marcados como item de controle; o aviso no topo diz "4 de 10". Confira, mude o que precisar e clique em **Incluir bens**: os itens de controle vão para **Itens de controle** (sem plaqueta, com a quantidade da nota) e os outros viram bens com plaqueta. Item de controle não pede classificação.
  - **Importação por planilha** (seção 2.7) e **Novo bem**.
- **Aprende com as decisões:** a escolha feita para cada item barato fica em **Cadastros → Decisões guardadas**. Da próxima vez que o mesmo item aparecer, a sugestão segue a última decisão ("da última vez você escolheu…"). Dá para corrigir a decisão ali, ou mandá-la para a Lixeira para o sistema voltar a usar a regra.
- Arquivo de teste fictício: `patrimonio/gestao/exemplos/nfe-exemplo-itens-baratos.xml` (10 itens, 4 sugeridos como item de controle).

> **Pendência (texto de 08/10/2026, mantido):** a regra de "pequeno valor e pouca durabilidade" e o valor do limite precisam ser conferidos com a contabilidade e com a norma do município (Portaria STN 448/2002 e MCASP). Por isso o limite fica em Configurações.

---

## 5. Ler a matrícula do imóvel (PDF)

O sistema lê o **PDF da matrícula** (do cartório ou do e-Cartório) e preenche os dados do imóvel. **Nada entra sozinho**: a pessoa confere campo a campo.

**Imóvel que já existe:**

1. Abra o imóvel → seção **Matrícula** → **Ler matrícula (PDF)** → escolha o arquivo.
2. O sistema mostra, para cada informação, **o que leu** e **o que está hoje no sistema**. As informações lidas são:
   - número da matrícula;
   - cartório;
   - área do terreno e área construída;
   - inscrição imobiliária (IPTU);
   - endereço e bairro;
   - proprietário atual;
   - data do último registro.
3. Corrija o que estiver errado direto na caixa, desmarque o que não deve entrar e clique em **Gravar**.
4. O PDF fica anexado ao imóvel, com o tipo "Matrícula". O valor anterior de cada informação fica no histórico.

**Imóvel novo:**

1. Menu **Bens imóveis** → **+ Novo imóvel** → **Cadastrar pela matrícula (PDF)**.
2. Confira os dados lidos.
3. Complete descrição, classificação, unidade, data e valor.
4. Clique em **Incluir imóvel**. O imóvel é criado já com a matrícula anexada.

**Matrícula escaneada** (foto ou imagem do papel) **não tem texto para ler**. O sistema avisa, e os dados devem ser digitados. O PDF pode ser anexado mesmo assim. Ler imagem exige reconhecimento de texto, que fica para uma próxima etapa.

**Atenção:** cada cartório escreve a matrícula de um jeito. O sistema procura as expressões mais comuns ("MATRÍCULA Nº", "área de … m²", "situado na Rua…", "Inscrição imobiliária", "ADQUIRENTE:"…). Por isso, **sempre confira** antes de gravar.

---

## 6. Perguntas comuns

**A planilha do meu sistema antigo tem outros títulos de coluna. Dá para importar?**
Dá. Na tela "Colunas do arquivo", ligue cada coluna à informação certa. Marque "Lembrar estas ligações" e, da próxima vez, o sistema já liga sozinho.

**Tenho um arquivo .xls antigo.**
Abra no Excel e salve como **.xlsx** (Arquivo → Salvar como → Pasta de Trabalho do Excel).

**Importei errado. E agora?**
Use **Desfazer** na lista de importações feitas (seção 2.4 para bens, seção 3.4 para anexos). Nada é apagado de verdade: o que sai vai para a Lixeira ou para "anexos retirados".

**Quem pode importar?**
Com servidor, só administrador e gestor. O perfil "consulta" vê as telas, mas não importa, e o banco também recusa a gravação.

---

## 7. Estado de conservação, inservível e imprestável

*Novo em 08/10/2026, pela escala do livro de controle patrimonial.*

**Estado de conservação** (8 níveis): **Novo, Ótimo, Muito bom, Bom, Regular, Ruim, Péssimo, Imprestável**.

- Os dados que já existiam (escala antiga de 6) são convertidos **uma vez só**, ao abrir o sistema: Novo → Novo, Ótimo → Ótimo, Bom → Bom, Regular → Regular, Ruim → Ruim, Péssimo → Péssimo (os nomes continuam; muda só o número por trás). O valor antigo fica guardado no próprio registro. Vale para bens, itens de controle, vistorias, inventários e o aplicativo de campo.
- O **aplicativo de campo** mostra os 8 estados com o nome escrito no botão.

**Inservível não é estado: é a situação do bem.** Quer dizer que o bem não serve mais para o órgão, mas ainda pode ser **vendido (leilão), doado ou transferido**.

- Na ficha do bem (ou na lista, com vários marcados): botão **Inservível**. Escolha o motivo (ocioso, antieconômico, irrecuperável, obsoleto) e o laudo. Fica no histórico.
- A lista de bens filtra por **Situação → Inservível**. A central de pendências mostra quantos estão disponíveis.
- Se o bem voltar a servir: **Volta ao uso**.
- Na importação do sistema atual, "Inservível" na coluna Estado vira a situação.

**Imprestável** é o estado 1: o bem não tem conserto (sucata). A ficha mostra o aviso com o botão **Iniciar baixa**, e a central de pendências mostra "Bens imprestáveis aguardando baixa".

---

## 8. Baixa em lote (leilão)

*Novo em 08/10/2026.* Os bens inservíveis normalmente saem por leilão. Menu **Baixa em lote**:

1. **+ Novo lote**: número (automático, ex.: 1/2026), tipo de baixa (padrão "Alienação (leilão)"), descrição, edital ou processo, data do leilão, motivo, avaliação prévia (laudo) e justificativa.
2. **Incluir os bens**:
   - digite as **plaquetas** (separadas por espaço, vírgula ou uma por linha), ou
   - clique em **Incluir todos os inservíveis**, ou
   - na lista de bens, marque vários e use **Incluir em lote de baixa**.

   O sistema avisa o que não entrou e por quê (plaqueta que não existe, bem já baixado, bem que já está em outro lote).
3. Informe o **valor arrematado** de cada bem, se quiser.
4. **Anexar ata**: foto ou PDF da ata do leilão. É obrigatória para confirmar.
5. Até confirmar, **dá para mudar tudo**: tirar bens, editar dados, trocar a ata (a ata tirada fica guardada no histórico do lote).
6. **Confirmar baixa do lote**: o sistema mostra o valor contábil que sai e pede confirmação. Cada bem recebe a baixa e **sai da lista de bens em uso**, mas **nunca é apagado**: continua consultável (filtro "Mostrar baixados"), com a baixa, o lote e o valor arrematado no histórico, e a ficha mostra "Baixado no lote …". No fim, **Imprimir termo de baixa**.

Venda, doação e permuta exigem **avaliação prévia e justificativa** (Lei 14.133/2021, art. 76). Imóvel não entra por lote: a baixa de imóvel é feita pela ficha, porque exige lei autorizativa. Um lote em montagem pode ir para a **Lixeira** (os bens continuam como estavam).

---

## 9. Plaquetas: anteriores, troca e cadastros duplicados

*Novo em 08/10/2026.* Na ficha do bem, quadro **Plaquetas**:

- **+ Plaqueta anterior**: registra uma plaqueta antiga do bem (por exemplo, a que caiu e foi substituída), com **data, motivo e observação**. Pode haver quantas forem preciso; nada é apagado. A plaqueta atual não muda.
- **Trocar plaqueta**: informe a nova plaqueta e o motivo. A atual vai para o registro de plaquetas anteriores.
- **Plaqueta nunca é reaproveitada**: o sistema recusa uma plaqueta que é (ou já foi) de outro bem, inclusive bens baixados ou na Lixeira.
- A **busca** por um número acha o código, a plaqueta atual ou uma plaqueta antiga.

**Unir cadastros (mesmo bem com duas plaquetas)** — botão **Unir cadastros** na ficha. Acontece muito: a plaqueta cai, alguém coloca outra, e no inventário descobre-se que as duas eram do mesmo bem.

1. Digite a plaqueta do outro cadastro.
2. Abre a tela de **conferência lado a lado**, dado por dado (descrição, classificação, unidade, local, responsável, estado, marca, modelo, série, data, fornecedor, nota). As diferenças aparecem em destaque. Escolha em cada linha o dado que fica e qual dos dois cadastros **continua ativo**.
3. Escreva o **motivo** (obrigatório) e clique em **Unir e desativar o outro**.
   - O cadastro ativo recebe os dados escolhidos, as fotos, os anexos e a plaqueta do outro no registro de plaquetas anteriores.
   - O outro é **desativado** com a baixa "Cadastro duplicado (mesmo bem)". O valor contábil dele sai, porque o bem estava contado duas vezes. **[A conferir com a contabilidade.]**
   - Os dois guardam no histórico que eram o mesmo bem, com o motivo. Nada é apagado.
4. **Desfazer união**: na ficha do cadastro ativo. O outro volta ativo, com a baixa estornada, e os dados trazidos voltam ao que eram.

---

## 10. Recebimento e termo de responsabilidade com prazo

*Novo em 08/10/2026.* Exemplo: o bem chega e Fernando recebe. Depois vai para a Saúde, no nome de João. Mais tarde muda para o CRAS, no nome de Josélia.

- **Recebimento** (botão na ficha, na lista de bens com vários marcados, e o campo "Recebido por" na nota fiscal): quem recebeu, data, documento e a **foto do documento de recebimento assinado**. Fica no histórico e nos anexos do bem.
- **Termo de responsabilidade com prazo**: quando alguém passa a ser responsável por bens (novo bem, nota fiscal, incorporação, transferência aceita ou troca do responsável na ficha), o sistema abre um termo **aguardando assinatura**. O prazo padrão é de **15 dias** (Configurações → Avisos).
  - A ficha do bem mostra a pendência. O painel mostra "Termos aguardando assinatura" e, passado o prazo, **"Termos vencidos"** (pendência grave).
  - Menu **Termos**: **Imprimir** o termo e, quando voltar assinado, **Anexar assinado** (foto ou PDF). A pendência fecha, e o termo assinado fica na ficha de cada bem.
  - Se o bem muda de responsável antes da assinatura, o termo anterior fica "cancelado" (no histórico) e abre um novo para o novo responsável.
- **Envio por e-mail (futuro):** o termo já preenchido será enviado automaticamente por e-mail ao responsável, que devolve assinado para um e-mail definido. **Ainda não está no sistema**: depende de um serviço de e-mail ligado ao servidor (decisão de 08/10/2026). Hoje o termo é impresso e entregue em mãos.

---

## 11. Menu lateral: grupos e menu escondido

*Novo em 14/10/2026.* O menu da esquerda está separado em 5 grupos, cada um com seu título:

- **Visão geral:** Painel e Relatórios.
- **Bens:** Bens móveis, Bens imóveis, Frota e Itens de controle.
- **Movimentações:** Entradas, Transferências, Baixa em lote e Termos.
- **Controle:** Inventário, Manutenção e Financeiro.
- **Sistema:** Histórico, Cadastros, Configurações, Exportar e importar, Pessoas (só para o administrador, com servidor) e Lixeira.

Cada item tem um ícone próprio.

**Esconder o menu:** no pé do menu, clique em **Esconder menu**. Ficam só os ícones, com uma linha separando os grupos, e a tela ganha espaço. Pare o mouse sobre um ícone para ver o nome. O número de pendências continua no ícone do Painel. Para voltar, clique em **›** (Mostrar menu), no pé do menu.

O sistema lembra a escolha **neste navegador**: ao abrir de novo, o menu volta do jeito que você deixou.

**No celular e no tablet em pé**, nada muda: o menu abre pelo botão **☰**, sempre com os nomes.

---

## 12. Cadastros vazios: dados a receber da prefeitura

*Novo em 14/10/2026.* Num sistema novo da cidade, os cadastros começam vazios. Enquanto faltar um cadastro básico, o **Painel** mostra na central de pendências **"Cadastro vazio: … — dados a receber da prefeitura"**. Clique para abrir o cadastro.

- **Urgente:** Entidades e fundos, Unidades e Classificações (sem eles não dá para cadastrar bens direito).
- **Atenção:** Contas contábeis e Responsáveis. *(Atualização 14/10/2026: Fornecedores saiu desta lista, porque é cadastrado sozinho pela compra ou pela nota fiscal — seção 14.)*

No **Novo bem**, embaixo de Unidade, Responsável e Fornecedor aparece o aviso de onde cadastrar quando a lista está vazia. O campo **Classificação** completa e filtra enquanto você digita, mas só depois que as classificações estiverem cadastradas.

A pendência some sozinha quando o cadastro recebe o primeiro registro. A lista completa do que pedir à prefeitura está no arquivo `dados-da-prefeitura.md`.

---

## 13. Cadastros por planilha e planilha de teste

*Novo em 14/10/2026.* Todos os cadastros entram e saem por planilha do Excel, uma aba para cada: **Unidades, Entidades, Contas contábeis, Responsáveis, Fornecedores, Motivos, Comissões, Seguradoras, Tipos de garantia, Classificações, Produtos e Compras**.

**Exportar:** menu **Exportar e importar** → aba **Exportar** → quadro **Cadastros** → **Baixar cadastros (Excel)**. As colunas são as mesmas da importação. Serve para conferir, corrigir no Excel e importar de volta, ou como modelo para os dados da prefeitura.

**Importar:** menu **Exportar e importar** → aba **Importar** → escolha o arquivo. O sistema reconhece cada aba pelo nome. Depois é igual aos bens (seção 2):

1. Confira as colunas.
2. Veja a prévia (Novo, Alterado, Igual, Erro).
3. Salve o que está marcado.
4. Se precisar, use **Desfazer** na lista de importações feitas.

- O que já existe, com o mesmo nome, código ou CNPJ, **não é duplicado**: aparece como "Igual", ou como "Alterado" mostrando o que muda.
- A mesma planilha pode ter cadastros e bens juntos. Um bem pode usar uma unidade, classificação, responsável ou fornecedor que é novo na própria planilha: o sistema grava os cadastros primeiro.
- Classificação: a coluna "Fica dentro de" é o grupo (ex.: "Bens móveis"). Quem tem vida útil precisa do valor residual (seção 15).
- Compras: entidade vazia vale a única cadastrada; fornecedor que não existe é cadastrado sozinho (seção 14); empenho pode ficar vazio.
- Unidades: só **código e nome** (decisão de 08/10/2026: o sistema não lê nomes de servidores dessa planilha). Responsável, tipo e endereço da unidade são preenchidos na tela.
- **Desfazer:** os cadastros novos vão para a Lixeira. Se algum já estiver em uso por um bem, ele continua no cadastro.

**Planilha de teste (1 de cada coisa):** arquivo `patrimonio/modelos-importacao/dados-de-teste.xlsx`, no repositório. Só dados fictícios, com nomes começando por "TESTE". Tem:

- 2 unidades, 1 entidade, 2 contas, 1 responsável, 1 fornecedor, 1 motivo, 1 comissão, 1 seguradora e 1 tipo de garantia;
- 4 classificações e 1 produto;
- 1 compra, com um fornecedor novo que é cadastrado sozinho;
- 1 bem móvel, 1 veículo, 1 imóvel e 1 item de controle.

Num sistema vazio, importe esse arquivo e todos os cadastros do Painel ficam preenchidos. Pode importar de novo sem duplicar nada, a não ser o item de controle, porque item novo não leva código.

---

## 14. Compras: fornecedor cadastrado sozinho

*Novo em 14/10/2026.* O fornecedor vem da ordem de compra ou da nota fiscal. Quando ele ainda não existe, o sistema cadastra sozinho:

- **Registrar compra** (menu Entradas): o campo **Fornecedor** completa e filtra enquanto você digita. Se o nome for novo, informe o CNPJ ao lado: o fornecedor é cadastrado com a compra.
- **Importar compras por planilha CSV** (Entradas) ou pela aba **Compras** da planilha de cadastros: fornecedor novo é cadastrado (com o CNPJ, se vier).
- **Nota fiscal (XML):** já fazia isso antes.
- **Empenho** pode ficar vazio (ordem de compra ainda sem empenho).
- **Entidade:** vem da coluna "entidade" (nome ou CNPJ). Se ficar vazia e só houver uma entidade, vale ela. *(Correção: antes a importação por CSV gravava sempre a entidade da demonstração.)*

---

## 15. Valor residual (depreciação)

*Novo em 14/10/2026.* O **valor residual** é o quanto o bem ainda vale no fim da vida útil. **O valor do bem nunca fica abaixo dele e nunca fica negativo**: a depreciação para quando chega no residual.

- **Novo bem:** o campo **Valor residual** vem preenchido pela classificação (em %). Dá para trocar para **Dinheiro (R$)** e digitar o valor. É obrigatório, a não ser que a classificação "não deprecia" (ex.: terreno). Em %, vai de 0 a 99. Em R$, tem que ser menor que o valor de aquisição.
- **Classificações:** quem tem vida útil precisa do valor residual (%). Classe e subclasse podem herdar o do grupo.
- **Ficha do bem → Depreciação:** já permitia mudar o residual (em % ou R$), com justificativa, valendo daqui para frente.

