# Arquitetura de Maré Viva

## Fluxo

`game.js` compõe os sistemas, recebe entradas e executa o loop. O renderizador desenha o mundo separadamente das regras. O modo solo chama regras locais; o multiplayer envia intenções ao servidor, que aplica as mesmas regras e devolve o perfil atualizado apenas em mudanças relevantes.

| Sistema | Responsabilidade |
| --- | --- |
| FishingSystem | Preparação, arremesso, boia, mordida, reação, minigame, puxada e resultado |
| FishSystem | Catálogo, seleção por região/área/horário, características e captura |
| InventorySystem | Peixes, capacidade de 80 capturas e equipamento |
| CollectionSystem | Descobertas, quantidade e melhor peso persistente |
| ShopSystem | Proximidade da loja e compra de varas, iscas e cosméticos |
| BoatSystem | Embarque, navegação, rota, saída da região e desembarque |
| IslandSystem | Carregamento da região atual e transição com fade |
| PlayerSystem | Movimento, direção, colisão, estados e entradas |
| MultiplayerSystem | Sessão, sala, pedidos, interpolação, emotes e reconexão |
| EconomySystem | Saldo, valor da mochila e venda |
| SaveSystem | Diário solo, configuração e exportação/importação |

`shared/catalog.js` contém todas as fichas de espécies, ilhas, varas, iscas, cosméticos e viajantes. `shared/rules.js` contém transações e geração de capturas. `shared/world.js` define tiles, áreas de pesca, objetos e colisões. `shared/minigame.js` integra a física determinística da captura. `server.mjs` é o serviço HTTP/WebSocket, simulação, sessões e salvamento multiplayer.

## Autoridade e transporte

O cliente nunca envia peso, valor, dinheiro ou espécie para conceder uma captura. Envia alvo do arremesso, intenção de fisgar e se está segurando o controle. O servidor sorteia a espécie, valida água/alcance/horário, consome a isca, controla a janela de reação e integra o minigame a 20 Hz. Somente um resultado bem-sucedido gera peso, preço, inventário e recorde.

Compras e vendas verificam proximidade da loja, saldo e propriedade. Viagens verificam embarque, chegada à borda marítima e licença. Segredos verificam proximidade e descoberta anterior. Movimento tem limite de distância e validação de destino e colisões; não é um mecanismo de proteção contra todos os tipos de trapaça em um serviço competitivo público.

Salas são instâncias lógicas, com até 12 jogadores em cada. Estados compactos usam arrays e coordenadas inteiras em vez de objetos repetidos; são enviados a 10 Hz. Cada cliente interpola os outros viajantes. Inventário e coleção completos ficam privados e são enviados somente ao próprio jogador quando mudam. Mensagens de capturas raras e emotes são eventos. O servidor usa limite de mensagens, origem do handshake, máscara de frames, limite de payload e heartbeat.

O transporte WebSocket segue o enquadramento do [RFC 6455](https://www.rfc-editor.org/rfc/rfc6455). Não negocia compressão permessage-deflate; a compactação aqui é estrutural, com campos curtos e arrays numéricos. Não há dependência de pacote externo.

## Renderização e desempenho

- Somente a região atual tem tilemap, objetos e texturas carregados. A troca substitui os caches da região e limpa as partículas.
- Atlas de tiles e mapa de fundo são montados uma vez por região. Água, boia, fauna e vegetação continuam animadas sobre esse cache.
- Personagens usam spritesheets de quatro direções e quatro quadros; equipamentos e peixes usam caches de sprites.
- Objetos fora da câmera são descartados do desenho. Os objetos visíveis respeitam profundidade pela posição vertical.
- Partículas reutilizam 128 entradas, sem criar um objeto por respingo.
- Coordenadas de rede são arredondadas; entradas de minigame usam eventos e atualização de aproximadamente 6 Hz, com resultado calculado a 20 Hz.
- DPR limitado a 1,5; delta de física limitado para evitar grandes saltos; efeitos reduzidos nas configurações.
- A coleção só cria as imagens de peixes que estão sendo exibidas. Dados das 50 espécies são leves e permanecem disponíveis.

Não há benchmark garantido de FPS em hardware externo. A inspeção desta entrega foi feita no ambiente disponível.

## Persistência

Solo: save versionado no localStorage, salvo após transações/capturas/troca de região e ao sair. Multiplayer: Map de perfis em memória, snapshot serializado e escrita temporária seguida de rename. Um perfil ativo não pode entrar novamente em outra janela. Um arquivo ilegível não é sobrescrito.

O modelo de conta é um identificador aleatório guardado no navegador; recuperação por conta e infraestrutura de banco não estão implementadas. Em produção, use um repositório de perfis com autenticação e migrações, mantendo as regras de transação do servidor.

## Expandir

Novos peixes: adicione uma ficha ao catálogo com ID único, ilha, zona, horário, parâmetros de forma e marcações. Amplie o desenho de `fishArt` para uma anatomia nova.

Novas ilhas: adicione metadados e uma definição de geometria em `world.js`, com temas de objetos em `art.js`. Atualize os limites e contagens que hoje descrevem o conteúdo inicial de cinco ilhas/cinquenta espécies na interface e no importador de saves.

Varas/iscas/cosméticos: adicione ao catálogo; a loja deriva suas listas desses dados. Equipamento altera seleção ou minigame através das regras compartilhadas.

Barcos: crie fichas de atributos e a seleção em BoatSystem; hoje todos têm o mesmo barco básico. Eventos/NPCs/missões: adicione sistemas à composição e eventos de intenção no servidor. Comércio/clãs/torneios: adicione transações e tabelas no servidor, com mensagens específicas, sem confiar em valores fornecidos pelo cliente.

Para várias instâncias de hospedagem, substitua o armazenamento em arquivo e o Map de salas por serviços compartilhados. O limite e a simulação atuais são por sala, dentro de um único processo.
