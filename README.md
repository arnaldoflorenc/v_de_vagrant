# V de Vagrant

Sistema de pedidos (tipo comanda de cozinha) provisionado automaticamente com **Vagrant** e **VirtualBox**, simulando uma arquitetura de três camadas em máquinas virtuais separadas:

- **Frontend** — React + Vite
- **Backend** — Node.js + Express (API REST)
- **Banco de dados** — MySQL

Clientes se cadastram/logam, criam pedidos e acompanham o status (`pendente` → `em produção` → `finalizado`); um usuário do tipo `cozinha` visualiza e atualiza todos os pedidos.

## Arquitetura

O `Vagrantfile` sobe três VMs independentes conectadas por duas redes privadas:

| VM | Hostname | IP(s) | Porta exposta no host | Função |
|---|---|---|---|---|
| `frontend` | frontend | `10.1.1.10` (rede `front_back`) | `5173` | Serve a aplicação React (Vite dev server) |
| `backend` | backend | `10.1.1.2` (`front_back`) e `10.1.2.10` (`back_db`) | `3000` | API Express, faz ponte entre frontend e banco |
| `db` | db | `10.1.2.2` (rede `back_db`) | — (apenas interno) | MySQL, acessível apenas pelo backend |

Cada VM, ao ser provisionada, clona este repositório via `git sparse-checkout` (somente a pasta correspondente), instala as dependências e registra um serviço `systemd` (`frontend.service` / `backend.service`) para manter o processo em execução com reinício automático.

## Pré-requisitos

- [Vagrant](https://www.vagrantup.com/) instalado
- [VirtualBox](https://www.virtualbox.org/) instalado
- Acesso à internet na primeira subida (as VMs clonam o repositório do GitHub e instalam pacotes via `apt`/`npm`)

## Como subir o ambiente

1. Configure as variáveis de ambiente do backend (usadas para popular o `.env` da VM `backend`):

   ```bash
   cp .env.example .env
   ```

   Preencha `.env` com os valores reais. Para bater com a configuração padrão do banco (`db/schema.sql`)

2. Suba as três VMs:

   ```bash
   vagrant up
   ```

3. Acesse a aplicação:
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - API do backend: [http://localhost:<port>](http://localhost:<port>)

> Em Macs com chip Apple Silicon (ARM), o `Vagrantfile` já detecta a arquitetura e usa a box `bento/ubuntu-22.04` automaticamente; em outras arquiteturas usa `ubuntu/focal64`.

## Usuário padrão

No primeiro start do backend, um usuário da cozinha é criado automaticamente caso não exista:

- **E-mail:** `cozinha@cozinha`
- **Senha:** `cozinha`

Use essas credenciais para acessar a visão de cozinha (`tipo = 'cozinha'`), que lista e atualiza todos os pedidos. Novos cadastros feitos pela tela inicial são sempre criados com `tipo = 'cliente'`.

## Estrutura do projeto

```
.
├── Vagrantfile          # Provisionamento das 3 VMs (frontend, backend, db)
├── .env.example         # Modelo de variáveis de ambiente do backend
├── db/
│   └── schema.sql       # Criação do banco, tabelas e usuário de acesso do backend
├── backend/
│   ├── src/
│   │   ├── server.js            # Ponto de entrada da API Express
│   │   ├── config/database.js   # Pool de conexão MySQL (mysql2)
│   │   ├── Routes/               # Definição das rotas (auth, pedidos)
│   │   └── controllers/          # Regras de negócio (auth, pedidos)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx               # Roteamento simples por tipo de usuário
    │   ├── pages/                # HomePage (login/cadastro), PedidosPage, KitchenPage
    │   └── services/api.js       # Helper de fetch para a API
    └── package.json
```

## API (backend)

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/register` | Cadastra um novo cliente |
| `POST` | `/api/login` | Autentica um usuário |
| `GET` | `/cozinha/pedidos/` | Lista pedidos (todos, se `tipo` for `cozinha`/`admin`; ou apenas do `userId`) |
| `POST` | `/cozinha/pedidos` | Cria um novo pedido |
| `PUT` | `/cozinha/pedidos` | Atualiza o status de um pedido |
| `GET` | `/usuarios` | Lista todos os usuários cadastrados |

## Banco de dados

O schema (`db/schema.sql`) cria o banco com duas tabelas:

- **`usuarios`**: `id`, `nome`, `email`, `senha` (hash bcrypt), `tipo` (`cliente` \| `cozinha` \| `admin`)
- **`pedidos`**: `id`, `usuario_id` (FK para `usuarios`), `data_pedido`, `hora_pedido`, `content`, `value` (status do pedido)

O script também cria o usuário MySQL `app`, usado pelo backend para se conectar ao banco a partir da rede `back_db`.