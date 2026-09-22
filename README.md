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

---

## Paging & Sorting — `@libs/paging`

Three layers, importable independently:

| Import                 | Contains                                                       |
| ---------------------- | -------------------------------------------------------------- |
| `@libs/paging/core`    | `PageRequest`, `Sort`, `Order`, `Direction`, `Page`, `Slice`    |
| `@libs/paging/http`    | `@Paginate`, `PageResponse`, `@ApiPaginatedResponse`, parsers   |
| `@libs/paging/typeorm` | `paginate()`, `applySort()`                                     |

`core` has no Nest or TypeORM dependency — it is plain value objects, safe to use and unit-test anywhere.

### End to end

```typescript
// controller
@Get()
@ApiPaginatedResponse(UserDetails)
public async findAll(
    @Query() filter: UserFilter,
    @Paginate({ last_name: 'lastName', created_at: 'createdAt' }) pageRequest: PageRequest,
): Promise<PageResponse<UserDetails>> {
    const page = await this.userService.findAll(filter, pageRequest);
    return PageResponse.from(page.map(user => new UserDetails(user)));
}

// service
public async findAll(filter: UserFilter, pageRequest: PageRequest): Promise<Page<User>> {
    const qb = this.userRepository.createQueryBuilder('u');
    if (filter.deleted) qb.withDeleted();
    return paginate(qb, 'u', pageRequest);
}
```

```
GET /api/users?page=1&size=10&sort=last_name,ASC&sort=created_at,DESC
```

### `PageRequest`

Immutable, 0-indexed, and carries its own `Sort`. Built through `PageRequest.of()` — the constructor is private.

```typescript
const request = PageRequest.of(0, 20, Sort.by('lastName'));

request.offset; // → 0, ready for TypeORM's .skip()
request.next(); // → PageRequest.of(1, 20, sort)
request.previousOrFirst();
request.first();
request.withSort(Sort.of(Order.desc('createdAt')));
request.hasPrevious();
```

It rejects `page < 0` and `size < 1`. An upper bound on `size` is deliberately *not* enforced here — that is endpoint
policy, so it lives in the HTTP layer (`@Paginate` caps it at 100).

### `Sort` / `Order` / `Direction`

Immutable, ordered sort instructions. `Order` is built through `Order.asc()` / `Order.desc()`.

```typescript
Sort.by('lastName', 'firstName'); // both ascending
Sort.of(Order.desc('createdAt'), Order.asc('name'));
Sort.unsorted();

Sort.by('lastName').and(Sort.of(Order.desc('createdAt'))); // lastName ASC, then createdAt DESC

sort.isSorted();
sort.toArray(); // readonly Order[]
for (const order of sort) { /* Sort is iterable */ }
```

### `Page` / `Slice`

`Slice<T>` is a page of results that only knows whether another page exists — fetch `size + 1` rows and pass whether
the extra row showed up. No `COUNT(*)` query.

`Page<T>` extends it with a total count, for "page 3 of 12 / 57 results" style navigation.

```typescript
const slice = new Slice(rows, pageRequest, hasNext);
const page = new Page(rows, pageRequest, totalCount);

page.content; // readonly T[]
page.page; // current page index
page.count; // page size
page.sort;
page.totalCount;
page.totalPages;

page.hasContent();
page.hasNext;
page.hasPrevious();
page.isFirst();
page.isLast();

page.nextPageRequest(); // PageRequest | undefined
page.previousPageRequest(); // PageRequest | undefined

page.map(user => new UserDetails(user)); // Page<UserDetails>, metadata preserved
```

### `@Paginate(sortableFields?)`

Param decorator that parses `page`, `size`, and `sort` into a `PageRequest`, and registers the matching Swagger
`@ApiQuery` docs on the route.

- `page` defaults to `0`, `size` to `20`; non-numeric values fall back to those defaults.
- `size` above `100` throws `BadRequestException`.
- `sort` is repeatable and takes `field,DIRECTION`; direction defaults to `ASC`.
- Sorting by a field outside the whitelist throws `BadRequestException`.

The whitelist accepts either form:

```typescript
// exposed name == entity property
@Paginate(['name', 'createdAt'])

// exposed name mapped to entity property — keeps the public API snake_case
@Paginate({ last_name: 'lastName', created_at: 'createdAt' })
```

Passing nothing (or an empty list) means nothing is sortable, and no `sort` query param is documented.

### `paginate()` / `applySort()`

TypeORM bindings. `applySort()` turns a `Sort` into `ORDER BY` clauses prefixed with the query alias; `paginate()`
applies the sort plus `skip`/`take`, runs `getManyAndCount()`, and wraps the result in a `Page`.

```typescript
const page = await paginate(qb, 'u', pageRequest);
```

> `skip`/`take` can miscount when the query joins a to-many relation. Split the query or use a subquery in that case.

### `PageResponse<T>` and `@ApiPaginatedResponse(Dto)`

`PageResponse` is the wire shape — a Swagger-annotated DTO, kept separate from the internal `Page`. Build it with
`PageResponse.from(page)`.

```jsonc
{
    "content": [],
    "page": 0,
    "count": 20,
    "total_pages": 3,
    "total_count": 57,
    "is_last": false
}
```

`@ApiPaginatedResponse(Dto)` documents the response, composing `PageResponse`'s schema with `content` typed as
`Dto[]` — NestJS Swagger cannot infer that from the generic on its own.
