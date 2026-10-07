# VitalPat — aplicativo de campo, piloto (demonstração)

Este é o aplicativo que a equipe usa em campo, no celular ou no tablet. Ele é feito em HTML e pode ser instalado na tela inicial, como qualquer outro aplicativo. Depois de aberto uma vez, funciona sem internet.

## O que ele faz

- **Conferir bem:** inventário e vistoria. Você lê o QR Code ou digita o número da plaqueta e informa onde o bem está, o estado de conservação (de 1 a 5) e tira fotos. Se o bem já foi conferido em outro local, o aplicativo pergunta se ele foi levado para lá ou se foi uma leitura repetida, para que nenhum bem seja contado duas vezes.
- **Vistoria de túmulo:** dá notas de 0 a 4 para estrutura, limpeza, identificação e tampa, registra se há sinais de visita recente e guarda as fotos. O aplicativo só registra o que foi visto e não toma nenhuma medida sobre o túmulo.
- **Abastecimento:** registra veículo, motorista, quilometragem, litros, valor, posto e a foto do cupom. Avisa quando a quilometragem é menor que a anterior, quando os litros passam da capacidade do tanque ou quando o combustível é diferente do veículo. Para salvar mesmo com o aviso, é preciso escrever uma explicação.
- **Saída e retorno de veículo:** registra quilometragem, destino, motivo, checklist (pneus, luzes, lataria e documento) e fotos.
- **Registros:** mostra tudo o que está guardado no aparelho. Daqui você baixa uma cópia completa (com fotos) ou uma planilha simples, escolhendo o tipo de registro e marcando só as colunas que quer. O aparelho lembra a última escolha.
- **Lixeira:** o que você exclui vai para a Lixeira e pode ser restaurado. Nada é apagado de verdade.

Toda foto recebe a data, a hora e a localização gravadas na própria imagem.

## O que ainda não faz

- Enviar os dados para um servidor, porque ele ainda não existe. Por enquanto, os dados saem do aparelho pelos botões de baixar.
- Login de usuários.
- Sincronização entre aparelhos.

Todos os dados de exemplo (bens, túmulos e veículos) são fictícios e ficam no arquivo `dados-exemplo.js`.

## Como abrir

O aplicativo precisa ser aberto por um endereço **https** (ou `localhost` no computador). Sem isso, o celular não deixa instalar, não libera a câmera e não funciona sem internet.

No computador, para testar:

```
cd app-campo
python3 -m http.server 8080
```

Depois, abra `http://localhost:8080` no navegador.

## Como instalar no aparelho

- **Android (Chrome):** abra o endereço, toque no menu ⋮ e depois em "Instalar aplicativo".
- **iPhone ou iPad (Safari):** abra o endereço, toque em Compartilhar e depois em "Adicionar à Tela de Início".

## Limitações conhecidas

- A leitura de QR Code pela câmera só funciona onde o navegador permite (Chrome no Android). Nos outros aparelhos, digite o número.
- Os dados ficam no navegador do aparelho. Se você limpar os dados do navegador ou desinstalar o aplicativo, os registros que ainda não foram baixados se perdem.
