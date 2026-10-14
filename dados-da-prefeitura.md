# Dados que a prefeitura precisa enviar

Lista do que o VitalPat precisa receber da prefeitura para funcionar com dados reais. Criada em 14/10/2026; atualizar marcando `[x]` com a data, sem apagar o histórico.

**Importante:** estes dados têm nomes, CPFs e outros dados pessoais. Eles entram **só no sistema** (servidor da cidade), **nunca no GitHub**. Combinar com a prefeitura um meio seguro de envio.

No sistema, enquanto um cadastro básico estiver vazio, o **Painel** mostra a pendência "Cadastro vazio: … — dados a receber da prefeitura", e o **Novo bem** avisa embaixo da lista vazia.

## Patrimônio — cadastros básicos (sem eles não dá para cadastrar bens)

| Ok | O que mandar | Formato | Para quê | Aviso no sistema |
|---|---|---|---|---|
| [ ] | **Entidades e fundos**: nome e CNPJ da prefeitura e de cada fundo (ex.: Fundo Municipal de Saúde) | planilha | Cada bem e cada nota pertencem a uma entidade | Painel (urgente) |
| [ ] | **Unidades / centros de custo**: código, nome, endereço, secretaria; responsável da unidade | planilha ou relatório do sistema atual | Onde o bem está; responsável que vem da unidade | Painel (urgente) + Novo bem |
| [ ] | **Tabela de classificação** com vida útil e valor residual de cada classe (tabela oficial do município) | planilha ou decreto/portaria | Depreciação; o campo Classificação completa e filtra ao digitar | Painel (urgente) |
| [ ] | **Contas contábeis** (patrimônio e depreciação acumulada) ligadas a cada classe | planilha do plano de contas | Arquivo para a contabilidade | Painel |
| [ ] | **Responsáveis**: nome, matrícula, cargo, e-mail (e CPF, se o termo exigir) | planilha | Termo de responsabilidade; envio por e-mail no futuro | Painel + Novo bem |
| [ ] | **Fornecedores**: razão social e CNPJ | planilha ou relatório do sistema de compras | Nota fiscal e compra | Painel + Novo bem |

## Patrimônio — bens e documentos

| Ok | O que mandar | Formato | Para quê |
|---|---|---|---|
| [ ] | **Relatório "Consulta de Bem"** do sistema atual (todos os bens) | o relatório como sai do sistema | Importar os bens (o sistema já lê esse formato) |
| [ ] | **Nomes dos centros de custo** (o relatório traz só o código) | planilha código + nome | Hoje são 159 códigos sem nome |
| [ ] | Conferir os **5 códigos repetidos** do relatório (22945, 23284, 23291, 23294, 23296) | resposta | Saber qual cadastro é o certo |
| [ ] | **Imóveis**: matrículas (PDF), escrituras, situação (próprio, cedido, alugado) | PDF / planilha | Cadastro de imóveis |
| [ ] | **Veículos**: placa, renavam, chassi, ano, combustível, unidade | planilha | Frota |
| [ ] | **Arquivo do cartão-combustível** (exemplo real da administradora) | o arquivo como vem | Conferir o formato de importação |
| [ ] | **Compras em andamento**: ordens de compra/empenhos de bens permanentes ainda não incorporados | relatório do IPM | Tela Entradas |
| [ ] | **Ações e vínculos (fonte do recurso)** usados no orçamento: código + nome | relatório do IPM | Painéis por fonte (ver `DOSSIE.md` A6.6) |
| [ ] | **Layout do arquivo para a contabilidade** que o setor contábil aceita | exemplo de planilha | Validar o arquivo "Para a contabilidade" |

## Patrimônio — configurações e acessos

| Ok | O que mandar | Para quê |
|---|---|---|
| [ ] | **Usuários**: nome, e-mail e papel (administrador, gestor, campo, consulta) | Login no sistema |
| [ ] | **E-mail institucional** e autorização para o sistema enviar mensagens | Gatilhos do termo de responsabilidade (objetivo) |
| [ ] | Prazo do termo, limite do item de controle (hoje R$ 300 e 24 meses) e regras próprias | Configurações |
| [ ] | **Certificado digital (e-CNPJ)** de cada entidade, se quiserem baixar as notas automaticamente | Integração com a SEFAZ (futuro) |

## Cemitério

| Ok | O que mandar | Para quê |
|---|---|---|
| [ ] | **Segunda planilha do cemitério** (se existir), com o cabeçalho completo | Importação de titulares e sepultados |
| [ ] | Significado da coluna "Data", dos valores "I" e "P" em "Situação" e a regra do ano com 2 dígitos | Ler a planilha de chãos certo |
| [ ] | Texto da **Lei Municipal 4.100/2004** e dos decretos do cemitério (concessões, taxas) | Regras de concessão |
| [ ] | Levantamento da localização dos túmulos (empresa contratada) | Mapa (formato no `DOSSIE.md` B6) |
