#!/bin/bash
# Cópia do repositório com a configuração vazia (modo demonstração) servida na porta 8765
rm -rf /tmp/vp-copia && mkdir -p /tmp/vp-copia
cd $(cd "$(dirname "$0")/.." && pwd) && git ls-files -co --exclude-standard | grep -v '^\(apps\|config\|docker\|selemit_projeto\|templates\)/' | while read f; do mkdir -p "/tmp/vp-copia/$(dirname "$f")"; cp "$f" "/tmp/vp-copia/$f"; done
for k in patrimonio cemiterio; do K=$(echo $k | tr a-z A-Z); echo "window.VP_SERVIDOR_$K = { url: '', chavePublica: '', municipio: '' };" > /tmp/vp-copia/$k/config-servidor.js; done
pkill -f "http.server 8765" ; sleep 0.5
cd /tmp/vp-copia && nohup python3 -m http.server 8765 >/dev/null 2>&1 &
sleep 1; curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8765/cemiterio/gestao/
