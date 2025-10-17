## API Recicla

API para gerenciamento de materiais recicláveis, pontos de coleta e usuários. Construída com Node.js, Express e PostgreSQL, com validação via Zod e documentação interativa via OpenAPI.

### Sumário

- [Introdução](#introdução)
- [Instalação e Configuração](#instalação-e-configuração)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Principais Recursos](#principais-recursos)
- [Exemplos de Uso](#exemplos-de-uso)
- [Relação entre as Tabelas](#relação-entre-as-tabelas)

### Introdução

A API Recicla oferece endpoints para:

- Gerenciar materiais recicláveis (CRUD, busca, associação com pontos de coleta)
- Gerenciar pontos de coleta (CRUD, filtros por materiais)
- Gerenciar usuários (CRUD)
- Healthcheck e documentação interativa

Tecnologias e bibliotecas:

- Express 5, CORS, Helmet, Morgan
- PostgreSQL (`pg`), Pool de conexões
- Zod (validação) e middlewares de validação
- Pino para logs (com `pino-pretty` em desenvolvimento)
- OpenAPI com UI (`@scalar/express-api-reference`)

### Instalação e Configuração

1. Pré‑requisitos

- Node.js 18+
- PostgreSQL 14+

2. Instale dependências

```bash
npm install
```

3. Configuração de ambiente
   Crie um arquivo `.env` baseado em `env.example`:

```bash
cp env.example .env
```

Variáveis principais:

- `HTTP_PORT` (porta da API, ex.: 3333)
- `CORS_ORIGIN` (origens permitidas, ex.: http://localhost:5173)
- Banco: use `DATABASE_URL` ou `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

4. Banco de dados
   Crie o banco e as tabelas executando o script SQL:

```bash
psql -U postgres -f database.sql
```

O script cria o banco `recicla`, tabelas e dados de exemplo.

5. Executar em desenvolvimento

```bash
npm run dev
```

Aplicação inicia em `http://localhost:<HTTP_PORT>` (padrão 3333).

6. Build e produção

```bash
npm run build
npm start
```

### Scripts Disponíveis

- `npm run dev`: inicia o servidor com reload (tsx)
- `npm run build`: compila TypeScript para `dist`
- `npm start`: executa `dist/server.js`
- `npm run typecheck`: checagem de tipos
- `npm run lint` / `npm run lint:fix`: lint do projeto

### Estrutura de Pastas

```
src/
  app.ts                # Configuração do Express, middlewares, rotas e /health
  server.ts             # Bootstrap: conecta DB e inicia servidor
  settings.ts           # Agrega configurações derivadas de env
  config/
    env.ts              # Leitura e validação das variáveis de ambiente (Zod)
  infra/
    database.ts         # Pool do PostgreSQL, healthcheck e utilitários de DB
    logger.ts           # Logger Pino e middleware de debug HTTP
  middlewares/
    error.ts            # Tratamento centralizado de erros (AppError)
    notFound.ts         # 404 Not Found
  shared/
    index.ts            # Re‑exports (validate, tipos, openapi)
    openapi.ts          # Declaração do OpenAPI e rota /api-docs
    validation.ts       # Middleware validate (Zod)
    types.ts            # Tipos utilitários de resposta
  routes.ts             # Router raiz, mapeia /users, /materials, /points
  modules/
    material/           # CRUD de materiais
      routes.ts
      controller.ts
      services.ts
      repository.ts
      models.ts
      index.ts
    point/              # CRUD de pontos de coleta e filtros por material
      routes.ts
      controller.ts
      services.ts
      repository.ts
      models.ts
      index.ts
    user/               # CRUD de usuários
      routes.ts
      controller.ts
      services.ts
      repository.ts
      models.ts
      index.ts

database.sql            # Script para criar o DB e dados de exemplo
env.example             # Exemplo de variáveis de ambiente
```

### Principais Recursos

- Segurança básica com Helmet e CORS configurável
- Validação de entrada com Zod (query, params e body)
- Logs estruturados com Pino e pretty em dev
- Documentação OpenAPI disponível em `/api-docs` (UI) e `/api-docs.json` (spec)
- Health check em `/health` retornando status do app e do banco

### Exemplos de Uso

Base URL padrão: `http://localhost:3333`

- Listar materiais

```bash
curl "http://localhost:3333/materials?limit=10&offset=0&search=pa&active=true"
```

- Criar material

```bash
curl -X POST http://localhost:3333/materials \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Metal",
    "slug": "metal",
    "description": "Latas, sucata metálica",
    "active": true
  }'
```

- Listar pontos de coleta (filtrar por materiais)

```bash
curl "http://localhost:3333/points?materialIds=<uuid1>,<uuid2>"
```

- Criar ponto de coleta

```bash
curl -X POST http://localhost:3333/points \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ecoponto Bairro",
    "address": "Rua X, 123",
    "latitude": -27.6000,
    "longitude": -48.5000,
    "materialIds": ["<uuid-material>"]
  }'
```

- Documentação interativa (OpenAPI)

```text
GET http://localhost:3333/api-docs
```

### Relação entre as Tabelas

Entidades principais no PostgreSQL (ver `database.sql`):

- `users` (id, name, email, password, role, created_at, updated_at)
- `materials` (id, name, slug, description, active, created_at, updated_at)
- `points_of_collection` (id, name, address, latitude, longitude, active, created_at, updated_at)
- `point_materials` (id, point_id, material_id, created_at)

Relações:

- Um registro em `points_of_collection` pode estar associado a vários `materials` via `point_materials`
- Um registro em `materials` pode estar associado a vários `points_of_collection` via `point_materials`
- `point_materials.point_id` referencia `points_of_collection.id` (ON DELETE CASCADE)
- `point_materials.material_id` referencia `materials.id` (ON DELETE CASCADE)

Diagrama simplificado (MER):

```
materials (1..*) ←→ ( *..1 ) point_materials ( *..1 ) ←→ (1..*) points_of_collection
```

Seed de exemplo no `database.sql` inclui materiais (papel, plástico, vidro), pontos de coleta e vínculos entre eles.
