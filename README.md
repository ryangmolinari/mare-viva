# Maré Viva

Jogo de pesca 2D para navegador, com mundo em tiles, arte original em pixel, cinco ilhas, cinquenta espécies exclusivas e salas multiplayer para até 12 jogadores. Não depende de serviços pagos, downloads de assets, fontes externas ou pacotes npm.

## Jogar

No Windows, abra **Jogar.cmd**. Ele usa o Node.js instalado ou o runtime do Codex já disponível neste computador. Mantenha a janela do servidor aberta e visite **http://localhost:3210**.

Em outro computador com **Node.js 22 ou superior**:

```sh
node server.mjs
```

Abra o endereço indicado. Não abra `index.html` diretamente: os módulos JavaScript e o multiplayer precisam do servidor HTTP. Você pode escolher **Aventura solo** ou **Multiplayer**. Os dois modos têm diários separados.

## Controles

| Tecla | Ação |
| --- | --- |
| WASD ou setas | Caminhar / navegar |
| Espaço ou clique na água | Arremessar / puxar quando a boia afundar |
| Segurar Espaço ou botão de ação | Subir a área de captura no minigame |
| Soltar | Descer a área de captura |
| E | Loja, barco, desembarque e segredos |
| I / C | Mochila / coleção |
| 2 | Alternar iscas disponíveis |
| R | Emote |
| Esc | Recolher linha / fechar janela / configurações |

Há controles de toque em telas pequenas. O som começa depois de clicar para entrar; pode ser ajustado nas configurações.

## Primeira viagem

1. Comece na Enseada do Sol com 50 moedas e uma Vara Inicial.
2. No píer, olhe para baixo e pressione Espaço. Também pode clicar diretamente na água ao alcance da vara.
3. Espere o arremesso e o splash. Quando aparecer **Mordeu!**, pressione Espaço em até 1,6 segundo.
4. Segure e solte para manter o peixe na área verde. A captura só é concedida se o minigame chegar a 100%.
5. Leve seus peixes à Nara, na vila a oeste do píer. A coleção e os recordes ficam registrados depois da venda.
6. Compre a Vara de Madeira. Após 6 capturas e 220 moedas, compre a licença do Bosque no mapa do arquipélago.
7. No fim do píer, aproxime-se do barco e pressione E. Escolha uma rota desbloqueada, navegue para leste seguindo os pontos dourados e atravesse o limite do mar. Na nova ilha, pressione E perto do píer para desembarcar.

Pesque também nos lagos internos e no mar profundo a leste do píer. Algumas espécies só aparecem de dia ou à noite. O ciclo compartilhado dura 24 minutos reais. Há um tesouro secreto em cada ilha.

## Regiões e progressão

| Ilha | Ambiente | Capturas exigidas | Vara equipada | Licença |
| --- | --- | ---: | --- | ---: |
| Enseada do Sol | Palmeiras, praia, vila, lago e mar | 0 | Inicial | Grátis |
| Bosque da Bruma | Floresta densa, rio, cachoeira e pontes | 6 | Madeira | 220 |
| Dunas de Âmbar | Cactos, oásis, costa rochosa e ruínas | 18 | Reforçada | 850 |
| Baía Boreal | Pinheiros, neve, montanha e buracos no gelo | 35 | Profissional | 2.400 |
| Arquipélago Astral | Vegetação exótica, cavernas e água luminescente | 60 | Avançada | 7.200 |

Cada licença exige a ilha anterior e é permanente. Cada ilha possui 3 comuns, 2 incomuns, 2 raros, 2 épicos e 1 lendário. As fichas completas estão em **catalogo-peixes.csv** e em `shared/catalog.js`. Os percentuais da ficha são pesos base; o sorteio normaliza as espécies disponíveis na área e horário, aplicando os bônus da vara e isca.

## Jogar com amigos

Todos precisam abrir o **mesmo servidor** e informar o mesmo código de sala. Cada sala aceita 12 participantes, que se veem, navegam, pescam e usam emotes. Não são jogadores simulados.

Na mesma rede, abra `http://IP-DO-COMPUTADOR-DO-SERVIDOR:3210` nos outros computadores, conforme as permissões de rede existentes. `localhost` em outro computador aponta para esse outro computador.

Para acesso pela internet, execute o projeto em uma hospedagem com Node e suporte a WebSocket. A pasta `data/` precisa de armazenamento persistente. O projeto inclui um Dockerfile:

```sh
docker build -t mare-viva .
docker run -p 3210:3210 -v mare-viva-data:/app/data mare-viva
```

Uma implantação pública deve usar HTTPS/WSS no proxy da hospedagem. Variáveis: `PORT`, `HOST`, `SAVE_DIR` e, se houver uma origem diferente da do servidor, `ALLOWED_ORIGINS` com URLs completas separadas por vírgula.

Para publicar no Render a partir do GitHub, consulte [PUBLICACAO.md](PUBLICACAO.md). O `render.yaml` contém uma configuração gratuita; `deploy/render-persistente.yaml` contém a opção paga com disco para saves permanentes. O plano gratuito perde os saves multiplayer ao reiniciar.

## Salvamento

O diário solo usa o armazenamento local do navegador e permite exportar/restaurar JSON. O multiplayer salva perfis no servidor em `data/profiles.json`, a cada 4 segundos e ao encerrar normalmente. Faça backup dessa pasta. Arquivos corrompidos interrompem a inicialização para preservar os dados.

O navegador guarda um identificador de acesso ao perfil multiplayer. Não há conta com senha nem recuperação por e-mail nesta entrega. Manter o mesmo navegador e os dados do site permite retomar o perfil. O mesmo perfil só pode estar aberto em uma janela multiplayer por vez. Em navegadores diferentes, novas pessoas ganham perfis diferentes. Um diário multiplayer exportado pode ser usado como cópia solo; importação não altera o perfil validado no servidor.

Uma desconexão pausa a partida e oferece reconexão, preservando o diário. Os jogadores reaparecem no píer da sua ilha ao entrar novamente; a coordenada exata não é persistida.

## Arquitetura

Os sistemas pedidos estão separados em `public/js/systems/`. O documento **ARQUITETURA.md** descreve responsabilidades, validações, transporte e pontos de expansão. As regras de catálogo, economia, mundo e minigame são compartilhadas entre cliente e servidor.

Arte, spritesheets de personagens, ícones e versões detalhadas dos peixes são gerados pelo código em `public/js/art.js`. O mapa não é uma imagem pronta: tiles, colisões, construções, árvores, água, partículas, barcos e personagens têm responsabilidades separadas. A música e os efeitos são sintetizados com Web Audio.

## Verificação

```sh
npm test
```

Os testes incluem catálogo completo, pesos e recordes, venda, equipamento, progressão, sorteio por área e horário, caminhos dos mapas, captura e falha solo, 12 conexões reais, recusa do 13º, salas independentes, reconexão, salvamento e captura validada pelo servidor.

A implementação usa uma única instância de servidor e arquivo JSON para saves. É uma versão jogável independente; publicação, testes com pessoas pela internet, distribuição com instalador e infraestrutura para múltiplas instâncias são etapas adicionais. Missões, clãs, comércio e torneios podem ser adicionados pelos pontos de expansão descritos na arquitetura.
