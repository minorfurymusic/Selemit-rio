# VitalPat Patrimônio · Gestão (demonstração)

Este é o sistema de gestão do **Produto 1 (Patrimônio e frota)**, para usar no computador. Ele também funciona no tablet e no celular. Não usa nenhum arquivo do sistema do cemitério.

Ele foi feito a partir das funções do sistema concorrente (47 telas), mas numa versão **mais simples, mais visual e com menos passos**. A comparação, função por função, está no `DOSSIE.md`, seção A5.

## Como entrar

Abra o endereço principal do VitalPat (`index.html`, na raiz do repositório) e entre com o usuário `patrimonio` e a senha `123456`. Esse login é só de demonstração: roda no navegador e não é segurança de verdade.

O botão **Aplicativo de campo**, no topo, abre o aplicativo de celular e tablet do patrimônio.

## O que tem

| Área | O que faz |
|---|---|
| **Painel** | Números principais, central de pendências e gráficos |
| **Bens** | Uma busca só (código, faixa de códigos "1,2,6-10", plaqueta, nome, local, responsável, placa), filtros que se somam e podem ser salvos, ações em lote e planilha com escolha de colunas |
| **Ficha do bem** | Tudo numa página: resumo com valor, vida útil usada, score e QR Code; seções que você edita uma a uma; depreciação em gráfico; anexos; linha do tempo com estorno |
| **Novo bem** | Só o essencial; o resto vem do produto e da classificação; quantidade gera vários bens |
| **Entradas** | Itens comprados aguardando incorporação: um clique cria todos os bens já com empenho, fornecedor e valor; também registra compra à mão ou importa planilha |
| **Transferências** | Interna (com aceite de quem recebe), externa e entre entidades; termo automático |
| **Inventário** | Data de corte, conferência por unidade, leitura de plaqueta, bem achado em outro lugar, sobras, importação do aplicativo de campo, lista "procura-se" e encerramento |
| **Financeiro** | Fechar o mês, com prévia e opção de desfazer; reavaliação em blocos, com controle da classe inteira e opção de desfazer; melhorias (que aumentam o valor do bem) diferentes de manutenção; baixas com as exigências da Lei 14.133; arquivo para a contabilidade |
| **Relatórios** | 13 relatórios visuais, que abrem na hora, e mais etiquetas com QR Code, termos e documentos. Todos com Imprimir/PDF e Baixar planilha |
| **Histórico** | Todos os eventos patrimoniais numa busca |
| **Cadastros** | Unidades (com a visão completa de cada uma), responsáveis, classificações, produtos, contas, fornecedores, motivos, entidades, comissões, seguradoras e tipos de garantia |
| **Configurações** | Todas as opções do concorrente, explicadas, e mais a cópia de segurança (baixar e restaurar) |
| **Lixeira** | Tudo o que foi excluído, com opção de restaurar |

## Limitações reais desta demonstração

- **Os dados são fictícios** e ficam só neste navegador. Para guardá-los, use Configurações → Baixar cópia completa.
- **Sem configuração de servidor**, não há login de verdade nem uso por várias pessoas ao mesmo tempo. (Atualização: com o servidor configurado, isso já funciona; veja a seção "Com servidor".) A integração com outros sistemas continua por arquivo.
- **A importação do aplicativo de campo**, sem servidor, só funciona quando os dois rodam no mesmo navegador e no mesmo endereço. Com servidor, ela também usa os registros que os aparelhos já enviaram.
- **Estas configurações ficam guardadas, mas ainda não mudam nada:**
  - cada usuário vê só as suas unidades;
  - taxa de depreciação por entidade;
  - enviar valores para a arrecadação;
  - status no extrato do cidadão;
  - doação gera movimento financeiro;
  - permitir bem por compra global;
  - tipo de importação de itens;
  - receber itens de compras por arquivo (a importação de planilha funciona sem depender dela);
  - movimentar por unidade;
  - unidade do patrimônio e unidade da solicitação de baixa;
  - conferir entidade × órgão;
  - intervalo de repetição do aviso de seguro;
  - aviso de transferência (a pendência sempre aparece no painel);
  - dupla aprovação durante o inventário.

## Com servidor (Supabase)

Quando o arquivo `patrimonio/config-servidor.js` está preenchido (endereço e chave pública do banco desta cidade), o sistema deixa de ser demonstração:
- entra com **e-mail e senha** na tela inicial (o login `patrimonio`/`123456` deixa de valer);
- começa **vazio**, sem dados de exemplo, e lê e grava tudo no servidor;
- fotos e anexos vão para o armazenamento privado do servidor;
- o administrador libera pessoas e escolhe o papel em **Pessoas** (menu);
- quem é só "consulta" não vê os botões de alterar, e o banco recusa qualquer alteração dessa pessoa.

Como instalar o banco: `patrimonio/banco/LEIA-ME.md`.

Limitação conhecida: se duas pessoas alterarem o mesmo registro ao mesmo tempo, vale a última gravação. As duas versões ficam no histórico do banco.

## Como testar no computador

```
cd <pasta do repositório>
python3 -m http.server 8080
```

Depois, abra `http://localhost:8080` e entre com `patrimonio` / `123456`.

## Arquivos

- `index.html`, `estilo.css`: a página e a aparência.
- `js/base.js`: utilidades, armazenamento no navegador e configurações.
- `js/calculos.js`: valores, depreciação, score, pendências e fechamento do mês.
- `js/semente.js`: dados de exemplo fictícios.
- `js/graficos.js`: gráficos em SVG, sem biblioteca, com cores validadas para daltonismo.
- `js/componentes.js`: janelas, tabelas, filtros, planilhas e impressão.
- `js/telas-*.js`: as telas.
- `vendor/qrcode.js`: biblioteca de QR Code (qrcode-generator 2.0.4, licença MIT; veja `vendor/LEIA-ME.md`).
