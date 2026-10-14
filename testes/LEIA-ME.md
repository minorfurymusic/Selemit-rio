# Testes automáticos do VitalPat

Robôs que abrem o sistema num navegador automático (Chromium + Playwright) e clicam como uma pessoa, conferindo o resultado. **Só usam dados fictícios.** Testes que liam arquivos reais da prefeitura ficaram fora do repositório de propósito.

## Rodar tudo do Patrimônio (regressão)

```bash
testes/regressao.sh            # sem argumentos = regressão completa do Patrimônio
testes/regressao.sh teste-escala.js teste-termos.js   # só alguns
```

Cada linha mostra `=== teste: N passou, M falhou`. Tudo certo = `0 falhou` em todas. Leva cerca de 30 minutos.

- `copia.sh` copia o repositório para `/tmp/vp-copia` com `config-servidor.js` **vazio** (modo demonstração) e serve em `http://localhost:8765`.
- Testes depois de `--` usam um **servidor local que imita o Supabase**: `sobe-banco.sh` sobe PostgreSQL (porta 5499) + PostgREST (porta 3001) com os roteiros de `*/banco/supabase-instalar.sql`. Precisa de PostgreSQL 16 instalado e do programa PostgREST 12.2.3 em `testes/postgrest/postgrest` (baixar de https://github.com/PostgREST/postgrest/releases; não vai para o repositório). `simulador-supabase.js` imita o login.

## O que cada teste confere (Patrimônio)

| Teste | Confere |
|---|---|
| teste-gestao | telas principais, painel, bens, relatórios |
| teste-patrimonio | aplicativo de campo |
| teste-planilhas / teste-planilhas-servidor | exportar e importar Excel, modelo, prévia, desfazer |
| teste-importa-relatorio | relatório "Consulta de Bem" do sistema atual (arquivo fictício de `gera-relatorio.py`) |
| teste-importa-paginas | prévia com páginas, filtros, salvar página / salvar todos, plaqueta automática |
| teste-controle | itens de controle |
| teste-anexos | anexos, zip, nome `plaqueta_descricao_01` |
| teste-matricula | leitura da matrícula em PDF (fictício de `gera-pdf.py`) |
| teste-novo-bem, teste-deprec | novo bem, nota fiscal, depreciação |
| teste-imoveis, teste-manutencao, teste-frota2, teste-mapas-pat, teste-plaquetas | etapas 5 a 8 |
| teste-escala | estado em 8 níveis, conversão única, inservível/imprestável, classificador |
| teste-centros-custo | nomes dos centros de custo (sem gravar servidores) |
| teste-baixa-lote | baixa em lote (leilão) com ata |
| teste-plaquetas-unir | plaquetas anteriores, trocar plaqueta, unir cadastros |
| teste-termos | recebimento e termo de responsabilidade com prazo |
| teste-menu | menu lateral em grupos, ícones, esconder/mostrar (lembrado), celular |
| teste-cadastros-vazios | cadastro básico vazio: pendência no Painel e aviso no Novo bem |
| teste-residual-compras | valor residual sempre pedido (R$ ou %), valor nunca abaixo do residual; compra com fornecedor novo cadastrado sozinho e entidade certa |
| teste-dados-teste-servidor | com servidor e sistema vazio: importa `patrimonio/modelos-importacao/dados-de-teste.xlsx` (1 de cada coisa), não duplica ao importar de novo, exporta e importa de volta, desfaz |
| fumaca | abre todas as telas procurando erro |
| teste-pat-servidor, teste-campo-pat-servidor, teste-login-servidor | mesmas regras com o servidor local |
| robo-botoes.js `patrimonio` | clica em todos os botões de todas as telas (rodar à parte) |

Os testes do Cemitério (`teste-cemiterio`, `teste-cem-*`, `teste-etapa2..4*`, `teste-mapas-cem`, `fumaca-cem`) rodam do mesmo jeito: `testes/regressao.sh teste-cem-gestao.js ...`.

## Planilha de dados de teste

`patrimonio/modelos-importacao/dados-de-teste.xlsx`: 1 de cada coisa (cadastros, compra, bem móvel, veículo, imóvel, item de controle), só dados fictícios com o nome "TESTE". Para gerar de novo (por exemplo, depois de mudar colunas): `testes/copia.sh && node testes/gera-dados-teste.js`.

