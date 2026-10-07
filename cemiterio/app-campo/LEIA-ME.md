# VitalPat Cemitério — aplicativo de campo, piloto (demonstração)

Este aplicativo faz parte do **Produto 2 (Cemitério)**. Ele é independente do VitalPat Patrimônio (`patrimonio/app-campo/`) e não usa nenhum arquivo dele.

A equipe usa este aplicativo em campo, no celular ou no tablet. Ele é feito em HTML e pode ser instalado na tela inicial, como qualquer outro aplicativo. Depois de aberto uma vez, funciona sem internet.

## Entrar

O aplicativo só abre depois do login na tela inicial do VitalPat (`index.html`, na raiz do repositório). Usuário de teste: `selemitério`, senha `123456`. O login abre a Gestão do Cemitério (`cemiterio/gestao/`); este aplicativo fica no botão **Aplicativo de campo**, no topo da Gestão. Esse login é de demonstração e não é segurança de verdade. O botão **Sair** volta para o login; os registros continuam guardados no aparelho.

## O que ele faz

- **Vistoria de túmulo:** você lê o QR Code ou digita o código do túmulo e dá uma nota de 0 a 4 para estrutura, limpeza, identificação e tampa. Também registra se há sinais de visita recente e guarda as fotos. O aplicativo só registra o que foi visto e não toma nenhuma medida sobre o túmulo.
- **Registros:** mostra o que está guardado no aparelho. Daqui você baixa uma cópia completa (com fotos) ou uma planilha simples, marcando só as colunas que quiser. O aparelho lembra a última escolha.
- **Lixeira:** o que você exclui vai para a Lixeira e pode ser restaurado. Nada é apagado de verdade.

Toda foto recebe a data, a hora e a localização gravadas na própria imagem.

## O que ainda não faz

- (Atualização) **Com servidor configurado** (`cemiterio/config-servidor.js`): os registros são enviados sozinhos quando há internet, ou pelo botão **Enviar para o servidor** em Registros. Sem internet, ficam guardados no aparelho e vão quando a internet voltar. Se um envio falhar, o motivo aparece no próprio registro, que continua no aparelho. Sem servidor configurado, segue a demonstração abaixo.
- Na demonstração (sem servidor): não envia; os dados saem pelos botões de baixar.
- Sincronização entre aparelhos (cada aparelho envia o que fez; não recebe o dos outros).
- Carregar a lista real de covas. O modelo da planilha está em `cemiterio/modelos-importacao/`; a importação será feita pelo sistema principal (De/Para), e não por este aplicativo.

Os túmulos de exemplo são fictícios e ficam no arquivo `dados-exemplo.js`.

## Como abrir e instalar

O aplicativo precisa ser aberto por um endereço **https** (ou `localhost` no computador).

Para testar no computador:

```
cd cemiterio/app-campo
python3 -m http.server 8080
```

Depois, abra `http://localhost:8080` no navegador.

- **Android (Chrome):** toque no menu ⋮ e depois em "Instalar aplicativo".
- **iPhone ou iPad (Safari):** toque em Compartilhar e depois em "Adicionar à Tela de Início".

## Limitações conhecidas

- A leitura de QR Code pela câmera só funciona onde o navegador permite (Chrome no Android). Nos outros aparelhos, digite o código.
- Os dados ficam no navegador do aparelho. Se você limpar os dados do navegador, os registros que ainda não foram baixados se perdem.
