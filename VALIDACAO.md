# Verificação da entrega

Data: 2 de outubro de 2026. Ambiente: Windows, Node.js 24.19.0 e navegador do Codex.

**12 testes automatizados passaram**, sem falhas. O cenário de servidor utiliza conexões TCP/WebSocket reais, perfis temporários e uma porta isolada. O teste adicional dos alvos de boia confirmou a sincronização das coordenadas da pesca.

Foram verificados:

- 50 espécies distintas, 10 por ilha, distribuição de raridades, pesos e fichas.
- Recordes e coleção mantidos após venda; pesos e preços dentro das regras.
- Saldo insuficiente, compras duplicadas, equipamento indisponível e progressão de ilhas.
- Sorteio respeitando ilha, área e horário.
- Minigame com captura possível das 50 espécies usando equipamento adequado e falha ao perder controle.
- Caminho do píer até a loja e áreas de pesca das cinco regiões.
- Resultado de captura e falha solo, animação de puxada e validação de importação de saves.
- 12 clientes em uma sala; rejeição do 13º; sala independente e recusa de um perfil já conectado.
- Rejeição de deslocamento excessivo, compras fora da loja, pesca fora da janela e viagem bloqueada.
- Captura calculada pelo servidor a partir de entradas; inventário e recorde restaurados após reconexão.
- Compra de isca e venda na loja após deslocamento pelo mapa.
- Licença de rota, embarque, navegação até a borda, transição de ilha, desembarque e persistência em arquivo.
- Encerramento em menos de dois segundos, inclusive com WebSockets ainda sem sessão, e salvamento imediato antes de parar o servidor.

Na inspeção do navegador, a coleção apresentou 50 silhuetas, o filtro Astral apresentou 10 espécies, a restauração de diário carregou as regiões esperadas e as cinco ilhas foram inspecionadas visualmente. Não apareceram erros de console durante essas verificações. As prévias estão em `previews/`.

Os saves com todas as licenças e equipamento avançado usados na inspeção visual pertencem à sessão de teste isolada; não fazem parte da aventura inicial do jogo. Um jogador novo começa com 50 moedas, Vara Inicial e apenas a Enseada.

O servidor local foi aberto e o perfil multiplayer existente foi restaurado. Testes pela internet entre computadores externos, benchmark em hardware simples e execução do Docker não foram realizados. Não houve publicação em hospedagem pública.

Para repetir os testes:

```sh
npm test
```
