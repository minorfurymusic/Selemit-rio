# Manual do VitalPat

Como usar o sistema, passo a passo. Este manual vai crescer: cada função nova ganha uma seção aqui.

**Versão do manual:** 08/10/2026. Por enquanto cobre o **VitalPat Patrimônio**: exportar, importar, anexos, itens de controle e leitura da matrícula.

## Índice

1. [Exportar (baixar planilha)](#1-exportar-baixar-planilha)
2. [Importar bens pela planilha do Excel](#2-importar-bens-pela-planilha-do-excel)
3. [Anexos (fotos, notas, termos)](#3-anexos-fotos-notas-termos)
4. [Itens de controle (fora do balancete)](#4-itens-de-controle-fora-do-balancete)
5. [Ler a matrícula do imóvel (PDF)](#5-ler-a-matrícula-do-imóvel-pdf)
6. [Perguntas comuns](#6-perguntas-comuns)

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
     | Estado | Estado |
3. Clique em **Ver a prévia** e confira:
   - **Centros de custo**: cada código que ainda não existe vira uma **unidade nova** com o nome provisório "Centro de custo 84.003.001". Dá para ligar um código a uma unidade que já existe (uma escolha por código, não por bem). Os nomes se corrigem depois em Cadastros → Unidades.
   - **Classificação**: o relatório não traz. Escolha uma por grupo ou deixe **"A classificar (importação)"**, que **não deprecia** até os bens serem classificados. A central de pendências mostra quantos faltam; classifique depois em lote pela lista de bens.
   - A grade mostra as primeiras 300 linhas. **Baixar prévia completa (Excel)** traz todas, com o motivo de cada erro.
   - **Marcar todos os válidos** vale para o arquivo inteiro.
4. **Importar o que está marcado**: o sistema grava em lotes, mostrando "Gravando X de Y bens…", e no fim mostra a tela de resultado. Para voltar atrás, use **Desfazer**: os bens e as unidades criadas vão para a Lixeira.

**Valor contábil × valor de aquisição.** Bem vindo de outro sistema (ou transferido) entra com o **valor contábil**, que é o valor de hoje, já depreciado, como **"Saldo inicial"**. A depreciação segue a partir do mês seguinte. Puxar o valor de compra distorceria: um veículo comprado por 150 mil que hoje vale 10 mil voltaria a valer 150 mil. O **valor de aquisição** é para bem comprado agora (cadastro novo). A data de aquisição original fica registrada.

Importar o mesmo relatório de novo **não duplica**: os bens que já entraram aparecem como "Igual".

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

> **Pendência:** a regra de "pequeno valor e pouca durabilidade" e o valor do limite precisam ser conferidos com a contabilidade e com a norma do município (Portaria STN 448/2002 e MCASP). Por isso o limite fica em Configurações.

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
