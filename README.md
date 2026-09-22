# NestJS Project Template

A NestJS starting point with a small set of framework-agnostic building blocks: paging, sorting, filtering, and a few
entity/DTO base classes. The goal is to drop in a feature module and get consistent, documented, paginated endpoints
without re-solving the same plumbing.

## Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Framework  | NestJS 11                           |
| Language   | TypeScript 6                        |
| Database   | PostgreSQL + TypeORM                |
| Validation | class-validator + class-transformer |
| Docs       | Swagger (`@nestjs/swagger`)         |
| Testing    | Vitest                              |
| Build      | SWC                                 |

---

## Project Structure

```
src/
├── commons/
│   ├── decorators/         # @NamedProperty, request/response logging
│   ├── guards/             # JwtAuthGuard
│   ├── interceptors/       # Request/response logging interceptor
│   ├── models/             # PersistentEntity, EntityDetails
│   └── utils/              # Date, entity, enum, random-string, validation factory
├── libs/
│   ├── filtering/core/     # EntityFilter, DateRange
│   └── paging/
│       ├── core/           # PageRequest, Sort/Order/Direction, Page/Slice
│       ├── http/           # @Paginate, PageResponse, @ApiPaginatedResponse, sort parsers
│       └── typeorm/        # paginate(), applySort()
├── features/               # Domain feature modules (empty)
├── health/                 # Health check endpoint
└── infrastructure/         # Config, database, datasource, migrations, seeder
```

`commons/` holds Nest-coupled helpers. `libs/` holds self-contained packages — `core` has no framework dependency,
`http` is the Nest/Swagger layer, `typeorm` is the persistence layer.

---

## Setup

### 1. Environment variables

Copy `.env.schema` to `.env` and fill in your values:

```bash
cp .env.schema .env
```

Config is read once at startup in `src/infrastructure/config/app.config.ts` and exported as a plain `config` object —
there is no `ConfigService` indirection.

| Variable                 | Default                        | Description                                                                          |
| ------------------------ | ------------------------------ | ------------------------------------------------------------------------------------ |
| `NODE_ENV`               | `development`                  | Runtime environment (`development`, `production`, `test`)                            |
| `APP_NAME`               | `App`                          | Application name                                                                     |
| `APP_HOST`               | `127.0.0.1`                    | Server bind address                                                                  |
| `APP_PORT`               | `9898`                         | Server port                                                                          |
| `APP_URL`                | `http://<APP_HOST>:<APP_PORT>` | Public base URL of the app                                                           |
| `CORS_ORIGINS`           | `http://localhost:5173`        | Comma-separated allowed origins, parsed into `config.cors.origins` (not wired up yet) |
| `JWT_SECRET`             | — (required on use)            | Secret for access tokens; throws only when actually read                             |
| `JWT_EXPIRES_IN`         | `3600`                         | Access token lifetime in seconds                                                     |
| `JWT_REFRESH_SECRET`     | — (required on use)            | Secret for refresh tokens; throws only when actually read                            |
| `JWT_REFRESH_EXPIRES_IN` | `604800`                       | Refresh token lifetime in seconds                                                    |
| `HASH_SALT`              | `10`                           | bcrypt salt rounds                                                                   |
| `DB_HOST`                | `localhost`                    | PostgreSQL host                                                                      |
| `DB_PORT`                | `5432`                         | PostgreSQL port                                                                      |
| `DB_USERNAME`            | `postgres`                     | PostgreSQL user                                                                      |
| `DB_PASSWORD`            | `postgres`                     | PostgreSQL password                                                                  |
| `DB_NAME`                | `nest_template`                | PostgreSQL database name                                                             |
| `DB_SYNCHRONIZE`         | `false`                        | TypeORM auto-sync schema — ignored in production                                     |
| `DB_DROP_SCHEMA`         | `false`                        | Drop the schema on connection — ignored in production                                |
| `ADMIN_EMAIL`            | `admin@admin.com`              | Seed admin account email                                                             |
| `ADMIN_PASSWORD`         | `admin`                        | Seed admin account password                                                          |

### 2. Install dependencies

```bash
pnpm install
```

### 3. Run

```bash
# Development (watch mode)
pnpm run dev

# Production
pnpm run build && pnpm run prod
```

Routes are served under the `api` global prefix; Swagger UI is at `/api/docs`.

---

## Database

`DatabaseModule` is present but commented out in `InfrastructureModule` — uncomment it once you have a database to
connect to:

```ts
// src/infrastructure/infrastructure.module.ts
import { DatabaseModule } from '@infrastructure/database/database.module';

@Module({
    imports: [
        // ...
        DatabaseModule,
    ],
})
```

The data source lives in `src/infrastructure/database/postgres/postgres.datasource.ts`. It uses
`SnakeNamingStrategy` (camelCase properties → snake_case columns), `useUTC: true`, and resolves entities and
migrations from `dist/`, so all CLI scripts build first.

### Migrations

```bash
# Generate a migration from entity changes
pnpm run migration:gen MigrationName

# Create an empty migration
pnpm run migration:create MigrationName

# Run pending migrations
pnpm run migration:run

# Revert last migration
pnpm run migration:revert

# Show migration status
pnpm run migration:show

# Drop the whole schema (destructive)
pnpm run migration:drop
```

### Seeding

`SeederService` ships with empty `clear()` and `seed()` methods — fill them in per project. The seeder runs as its own
Nest application context, independent of `DatabaseModule`.

```bash
# Run seeders
pnpm run seed

# Clear data and re-seed
pnpm run seed:clear
```

Seed arguments are parsed by `SeedOptions`: `--clear`, `--superuser-email=`, `--superuser-password=`.

---

## Testing

```bash
# All suites
pnpm test

pnpm run test:unit
pnpm run test:integration
pnpm run test:e2e

pnpm run test:watch
pnpm run test:cov
```

Tests live in `test/unit/`, `test/integration/`, and `test/e2e/`, each with its own Vitest config that shares
`vitest.config.ts`. All suites run with `passWithNoTests`. Integration tests can bootstrap a real module through
`createIntegrationTestModule()` in `test/utils/helper.ts`.
