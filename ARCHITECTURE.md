# Arquitetura da API Recicla

## 📁 Estrutura de Pastas

```
src/
├── config/           # Configurações e variáveis de ambiente
│   └── env.ts
├── infra/           # Infraestrutura (DB, cache, etc)
│   └── database.ts
├── middlewares/     # Middlewares Express
│   ├── error.ts
│   └── notFound.ts
├── modules/         # Módulos de domínio
│   └── user/
│       ├── models.ts      # Schemas Zod e tipos
│       ├── repository.ts  # Acesso a dados
│       ├── services.ts    # Lógica de negócio
│       └── routes.ts      # Rotas HTTP
├── app.ts          # Configuração do Express
├── routes.ts       # Router principal
├── server.ts       # Bootstrap e lifecycle
└── settings.ts     # Settings derivados do env
```

## 🏗️ Camadas da Aplicação

### 1. **Config Layer** (`src/config/`)

- Carrega e valida variáveis de ambiente com Zod
- Garante type-safety em todo o app
- Valores default para desenvolvimento

### 2. **Infra Layer** (`src/infra/`)

- **Database**: Pool de conexões PostgreSQL
  - Singleton pattern
  - Graceful shutdown
  - Health check integrado
  - Error handling robusto

### 3. **Domain Layer** (`src/modules/*/`)

Cada módulo segue a estrutura:

#### **Models** (`models.ts`)

- Schemas Zod como fonte da verdade
- Tipos derivados com `z.infer`
- Validação runtime + compile-time
- DTOs (CreateInput, UpdateInput)

#### **Repository** (`repository.ts`)

- Interface para contrato
- Factory function para implementação
- Acesso direto ao banco via pool
- Queries parametrizadas (SQL injection safe)

#### **Service** (`services.ts`)

- Interface para contrato
- Factory function para lógica de negócio
- Validação com Zod schemas
- Regras de negócio (unicidade, etc)
- Erros com status HTTP

#### **Routes** (`routes.ts`)

- Handlers HTTP simples
- Delegam para services
- Tratamento de erros via next()

### 4. **HTTP Layer**

- **app.ts**: Setup do Express + middlewares
- **routes.ts**: Agregador de rotas
- **server.ts**: Bootstrap + lifecycle

## 🎯 Princípios Aplicados

### Clean Architecture

- **Separação de responsabilidades**: Cada camada tem papel único
- **Dependency Inversion**: Services recebem repos como dependência
- **Domain-centric**: Lógica de negócio isolada

### SOLID

- **Single Responsibility**: Funções pequenas e focadas
- **Open/Closed**: Interfaces permitem extensão
- **Liskov Substitution**: Tipos/interfaces intercambiáveis
- **Interface Segregation**: Contratos específicos
- **Dependency Inversion**: Abstrações via interfaces

### Outros

- **Factory Pattern**: Services e repos
- **Singleton Pattern**: Database pool
- **Repository Pattern**: Abstração de dados
- **DTO Pattern**: Validação de entrada/saída

## 🔄 Fluxo de uma Request

```
1. HTTP Request → Express
2. Middlewares globais (helmet, cors, json, morgan)
3. Route handler
4. Service (validação + lógica)
5. Repository (acesso DB)
6. ← Response
7. Error middleware (se houver erro)
```

## 🧪 Testabilidade

### Por que funções/factories?

- **Injeção de dependência simples**: Passa mocks como args
- **Sem estado compartilhado**: Cada teste é isolado
- **Fácil stub/spy**: Substituir implementação

### Exemplo de teste

```typescript
// Mock do repository
const mockRepo = {
  findByEmail: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockResolvedValue({ id: '123', ... }),
};

// Service com mock
const service = makeUserService(mockRepo);

// Testar
await service.create({ name: 'Test', email: 'test@test.com', ... });
expect(mockRepo.create).toHaveBeenCalled();
```

## 🔐 Segurança

- **Helmet**: Headers de segurança
- **CORS**: Origens controladas por env
- **Prepared statements**: Queries parametrizadas
- **Zod validation**: Input sempre validado
- **Error handling**: Não vaza detalhes internos

## 📊 Observabilidade

- **Morgan**: Logs HTTP em dev
- **Health check**: `/health` com status do DB
- **Graceful shutdown**: Fecha conexões antes de terminar
- **Pool events**: Logs de conexão/erro

## 🚀 Próximos Passos

1. **Autenticação**: JWT middleware
2. **Autorização**: RBAC baseado em roles
3. **Validação avançada**: Rate limiting
4. **Observabilidade**: Métricas (Prometheus)
5. **Testes**: Jest + supertest
6. **CI/CD**: GitHub Actions
7. **Documentação**: Swagger/OpenAPI
