# VitalPat Cemitério — Gestão (demonstração)

Sistema principal do **Produto 2 (Cemitério)**, usado no computador da administração. É independente do VitalPat Patrimônio e não usa nenhum arquivo dele. Os dados de exemplo são **fictícios** e ficam guardados só no navegador.

## Entrar

Abra o `index.html` da raiz e entre com `selemitério` / `123456` (login de demonstração, não é segurança de verdade). O aplicativo de campo abre pelo botão **Aplicativo de campo**, no topo.

## O que já faz (etapa 1)

- **Painel:** ocupação, vagos, localização exata e central de pendências.
- **Mapa:** mapa por posição (quadra → aléia → número), colorido por ocupação, tipo, localização ou foto/plaqueta. Clique em um túmulo para abrir a ficha.
- **Túmulos:** lista com filtros e ações em lote (ocupação, tipo, plaqueta afixada, etiquetas, Lixeira).
- **Ficha do túmulo:** foto, QR Code, posição na aléia, localização com botão para o Google Maps e linha do tempo.
- **Importar planilha:** De/Para com prévia (novo, igual, alterado, conflito, erro), aplicação e "desfazer". O valor anterior vai para a linha do tempo. Modelo da planilha: `cemiterio/modelos-importacao/`.
- **Localização (levantamento da empresa especializada):** baixa a lista de túmulos para a empresa e recebe de volta as coordenadas em CSV (`quadra;aleia;numero;latitude;longitude;precisao_m`) ou GeoJSON. Gera arquivo KML para o Google Earth.
- **Relatórios:** ocupação e folha de etiquetas com QR Code.
- **Cadastros, Configurações** (precisão máxima da localização exata, cópia de segurança) e **Lixeira**.

## O que ainda não faz

Vistorias e túmulos possivelmente abandonados, concessões, sepultamentos, exumações, ossário, processo administrativo e mapa sobre imagem real. Estão nas próximas etapas do `checklist.md`. (Atualização: a ligação ao servidor já existe; veja abaixo.)

## Com servidor (Supabase)

Quando o arquivo `cemiterio/config-servidor.js` está preenchido (endereço e chave pública do banco desta cidade), o sistema deixa de ser demonstração:
- entra com **e-mail e senha** na tela inicial (o login `selemitério`/`123456` deixa de valer);
- começa **vazio**, sem dados de exemplo, e lê e grava tudo no servidor;
- fotos e anexos vão para o armazenamento privado do servidor;
- o administrador libera pessoas e escolhe o papel em **Pessoas** (menu);
- quem é só "consulta" não vê os botões de alterar, e o banco recusa qualquer alteração dessa pessoa.

Como instalar o banco: `cemiterio/banco/LEIA-ME.md`.

Limitação conhecida: se duas pessoas alterarem o mesmo registro ao mesmo tempo, vale a última gravação. As duas versões ficam no histórico do banco.

## Como abrir no computador

```
python3 -m http.server 8080
```

Rode o comando na raiz do repositório e abra `http://localhost:8080`.
