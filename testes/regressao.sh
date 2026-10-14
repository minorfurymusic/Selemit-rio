#!/bin/bash
# Roda os testes do zero e imprime um resumo por teste. Uso: regressao.sh <lista de testes demo> -- <lista de testes servidor>
S=$(cd "$(dirname "$0")" && pwd)
# Sem argumentos: a regressão completa do Patrimônio (demonstração + servidor local)
if [ $# -eq 0 ]; then set -- teste-gestao.js teste-patrimonio.js teste-planilhas.js teste-controle.js teste-importa-relatorio.js teste-importa-paginas.js teste-matricula.js teste-novo-bem.js teste-deprec.js teste-anexos.js teste-tabelas-simples.js teste-imoveis.js teste-manutencao.js teste-frota2.js teste-mapas-pat.js teste-plaquetas.js teste-escala.js teste-centros-custo.js teste-baixa-lote.js teste-plaquetas-unir.js teste-termos.js teste-menu.js fumaca.js -- teste-pat-servidor.js teste-campo-pat-servidor.js teste-planilhas-servidor.js teste-login-servidor.js; fi
cd $S && ./copia.sh >/dev/null
modo=demo
for t in "$@"; do
  if [ "$t" = "--" ]; then modo=servidor; continue; fi
  [ $modo = servidor ] && ./sobe-banco.sh >/dev/null 2>&1
  r=$(timeout 600 node $t $S 2>&1)
  echo "=== $t: $(echo "$r" | grep -c '^PASSOU') passou, $(echo "$r" | grep -c '^FALHOU') falhou | $(echo "$r" | grep -E 'TUDO PASSOU|TODOS PASSARAM|ERROS|botões clicados|FALHARAM' | tail -1)"
  echo "$r" | grep -E "^FALHOU|^ - |^   ERRO" | head -5
done
