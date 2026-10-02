# Publicação no GitHub e Render

O servidor Node entrega o jogo e o multiplayer no mesmo endereço. Use um **Web Service**, com HTTPS/WSS automático do Render.

## Repositório público

Publique os arquivos deste diretório na raiz do repositório, na branch `main`. Preserve a estrutura de `public/`, `shared/`, `tests/` e `.github/`.

A pasta `data/` contém saves e identificadores de acesso dos jogadores. Ela está no `.gitignore` e nunca deve entrar no repositório. Arquivos `.env` e logs também estão excluídos. O jogo não exige chaves de API.

O workflow do GitHub executa os testes em Linux e Windows. O próprio build do Render também executa `npm test`; um build com falha não entra no ar.

## Plano gratuito

Crie um Blueprint no Render apontando para o repositório e usando `render.yaml`. Ele define explicitamente o plano gratuito, Node 24.19.0, região Virginia, build `npm test`, start `npm start` e health check `/health`.

O plano gratuito pode suspender o servidor por inatividade e tem filesystem temporário. Os saves multiplayer desaparecem ao reiniciar, suspender ou publicar outra versão. O diário solo continua no navegador. Não altere o plano sem conferir o preço indicado no painel.

## Saves multiplayer permanentes

O modelo `deploy/render-persistente.yaml` usa uma instância paga com disco de 1 GB. Depois de aprovar o valor no painel, use esse arquivo como Blueprint ou copie seu conteúdo para `render.yaml` antes de aplicar.

Configuração equivalente pelo painel:

| Campo | Valor |
| --- | --- |
| Runtime | Node |
| Branch | main |
| Build Command | npm test |
| Start Command | npm start |
| Health Check Path | /health |
| NODE_VERSION | 24.19.0 |
| NODE_ENV | production |
| HOST | 0.0.0.0 |
| SAVE_DIR | /var/data/mare-viva |
| SKIP_INSTALL_DEPS | true |
| Disco | 1 GB em /var/data |
| Instâncias | 1 |

`PORT` é fornecida pelo Render. O servidor já escuta em `0.0.0.0`. Os clientes escolhem WSS automaticamente em HTTPS. Se um proxy personalizado usar um Host diferente, configure `ALLOWED_ORIGINS` com a URL pública completa. O endereço `https://…onrender.com/health` deve responder com `ok: true`.

O disco preserva os perfis do servidor. Cada jogador precisa manter o identificador no armazenamento do seu navegador para retomá-los. Faça backups privados do arquivo `profiles.json`; ele contém identificadores de acesso.

## Conferir depois de publicar

1. Espere o serviço indicar **Live**.
2. Abra a URL pública e entre em Multiplayer.
3. Em outro navegador, entre na mesma sala; confirme movimento e pesca sincronizados.
4. Confira `/health`, a reconexão e o save. No plano com disco, confirme também a retomada depois de uma nova implantação.

Referências oficiais: [Web Services](https://render.com/docs/web-services), [WebSocket](https://render.com/docs/websocket), [Blueprint](https://render.com/docs/blueprint-spec), [discos](https://render.com/docs/disks), [plano gratuito](https://render.com/docs/free) e [versão do Node](https://render.com/docs/node-version).
