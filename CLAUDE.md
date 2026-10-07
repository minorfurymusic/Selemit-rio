# CLAUDE.md: Patrimônio e Cemitério para prefeituras

Contexto para o Claude Code. Este arquivo veio de uma conversa no Cowork (set–out/2026). O detalhe completo está em `DOSSIE.md` (v1.1). As pendências estão em `checklist.md`.

## O que é o projeto

Uma empresa nova, com 2 ou 3 pessoas, vai desenvolver **dois produtos para prefeituras, cada um vendido separadamente** (licitação própria ou lote próprio):

1. **Produto 1: Gestão Patrimonial.** Cobre bens móveis, bens imóveis, inventário anual, vistorias, demandas das unidades, notas fiscais, pesquisa de preços e painéis por fundo e centro de custo.
2. **Produto 2: Gestão de Cemitério.** Cobre mais de 6.000 túmulos, concessões, sepultamentos, exumações e ossário, com uma metodologia legal para tratar cerca de 1.000 túmulos possivelmente abandonados.

A referência de público-alvo é a Prefeitura de Rio do Sul/SC.

## Decisões já tomadas (não reabrir sem o usuário pedir)

- São 2 produtos com o mesmo peso, e cada um é vendido separadamente.
- Os dois **complementam o SIAFIC** (hoje, em Rio do Sul, é o IPM Atende.Net). Nenhum deles é um segundo sistema contábil (Decreto 10.540/2020).
- Nenhuma exumação ou retomada de túmulo acontece automaticamente. O sistema aponta indícios, e uma pessoa decide em processo administrativo.
- "Excluir" significa mover para a Lixeira. O histórico nunca é apagado.
- A importação usa De/Para com área de espera e prévia. O valor anterior vai para o histórico, sem duplicar o registro.

## Bloqueador legal (ler antes de qualquer coisa comercial)

A Lei 14.133/2021, art. 9º, §1º, impede servidor da prefeitura contratante de participar da licitação, direta ou indiretamente. Um dos sócios trabalha no Departamento de Patrimônio de Rio do Sul. Enquanto isso durar, **nenhum dos produtos pode ser vendido para Rio do Sul**. A estratégia é vender primeiro para outros municípios. O parecer jurídico está pendente.

## Decisões em aberto (são do usuário, perguntar antes)

- Um repositório ou dois (um por produto)? Os produtos têm uma plataforma base em comum (usuários, perfis, importação De/Para, auditoria, backup, mapa).
- Stack/tecnologia: o dossiê só sugere PostgreSQL + PostGIS como exemplo; isso não foi decidido.
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
