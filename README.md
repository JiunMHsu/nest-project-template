# NestJS Project Template

A NestJS starting point with framework-agnostic building blocks: paging, sorting, filtering, and a few entity/DTO base
classes. Drop in a feature module and get consistent, documented, paginated endpoints without re-solving the plumbing.

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

`commons/` holds Nest-coupled helpers. `libs/` holds self-contained packages: `core` has no framework dependency,
`http` is the Nest/Swagger layer, `typeorm` is the persistence layer.

---

## Setup

### 1. Environment variables

```bash
cp .env.schema .env
```

Config is read once at startup in `src/infrastructure/config/app.config.ts` and exported as a plain `config` object —
no `ConfigService` indirection.

| Variable                 | Default                        | Notes                                                       |
| ------------------------ | ------------------------------ | ----------------------------------------------------------- |
| `NODE_ENV`               | `development`                  | `development` \| `production` \| `test`                     |
| `APP_NAME`               | `App`                          |                                                             |
| `APP_HOST`               | `127.0.0.1`                    |                                                             |
| `APP_PORT`               | `9898`                         |                                                             |
| `APP_URL`                | `http://<APP_HOST>:<APP_PORT>` | Public base URL                                             |
| `CORS_ORIGINS`           | `http://localhost:5173`        | Comma-separated; parsed into `config.cors` but not wired up |
| `JWT_SECRET`             | —                              | Lazy getter; throws only when first read                    |
| `JWT_EXPIRES_IN`         | `3600`                         | Seconds                                                     |
| `JWT_REFRESH_SECRET`     | —                              | Lazy getter; throws only when first read                    |
| `JWT_REFRESH_EXPIRES_IN` | `604800`                       | Seconds                                                     |
| `HASH_SALT`              | `10`                           | bcrypt rounds                                               |
| `DB_HOST`                | `localhost`                    |                                                             |
| `DB_PORT`                | `5432`                         |                                                             |
| `DB_USERNAME`            | `postgres`                     |                                                             |
| `DB_PASSWORD`            | `postgres`                     |                                                             |
| `DB_NAME`                | `nest_template`                |                                                             |
| `DB_SYNCHRONIZE`         | `false`                        | Forced off in production                                    |
| `DB_DROP_SCHEMA`         | `false`                        | Forced off in production                                    |
| `ADMIN_EMAIL`            | `admin@admin.com`              | Seed admin account                                          |
| `ADMIN_PASSWORD`         | `admin`                        | Seed admin account                                          |

### 2. Install and run

```bash
pnpm install

pnpm run dev                        # watch mode
pnpm run build && pnpm run prod     # production
```

Routes are served under the `api` global prefix; Swagger UI is at `/api/docs`.

---

## Database

`DatabaseModule` is commented out in `InfrastructureModule` — uncomment the import and the `imports` entry there once
you have a database to connect to.

The data source (`src/infrastructure/database/postgres/postgres.datasource.ts`) uses `SnakeNamingStrategy`
(camelCase → snake_case columns) and `useUTC: true`, and resolves entities and migrations from `dist/`, so all CLI
scripts build first.

### Migrations

```bash
pnpm run migration:gen MigrationName     # generate from entity changes
pnpm run migration:create MigrationName  # empty migration
pnpm run migration:run
pnpm run migration:revert
pnpm run migration:show
pnpm run migration:drop                  # drops the whole schema
```

### Seeding

`SeederService` ships with empty `clear()` and `seed()` — fill them in per project. The seeder runs as its own Nest
application context, independent of `DatabaseModule`.

```bash
pnpm run seed
pnpm run seed:clear
```

`SeedOptions` parses `--clear`, `--superuser-email=`, and `--superuser-password=`. The two superuser arguments are
all-or-nothing: passing one without the other throws.

---

## Testing

```bash
pnpm test                    # all suites
pnpm run test:unit
pnpm run test:integration
pnpm run test:e2e
pnpm run test:watch
pnpm run test:cov
```

Tests live in `test/unit/`, `test/integration/`, and `test/e2e/`, each with its own Vitest config sharing
`vitest.config.ts`. All suites run with `passWithNoTests`. `test/unit/` mirrors `src/`, so a helper's spec sits at the
same path under `test/unit/`.

Helpers in `test/utils/`:

| Helper                          | Use                                                           |
| ------------------------------- | ------------------------------------------------------------- |
| `createIntegrationTestModule()` | Boots a real module with config, TypeORM, and events          |
| `createHttpContext()`           | Fake `ExecutionContext` for interceptors and param decorators |
| `getParamFactory()`             | Pulls a `createParamDecorator` factory out of route metadata  |
| `createMock()`                  | `vitest-mock-extended` re-export                              |

The last two let `@Paginate` and `LogInterceptor` be tested without booting an HTTP server.

---

## Paging & Sorting — `@libs/paging`

Three layers, importable independently:

| Import                 | Contains                                                      |
| ---------------------- | ------------------------------------------------------------- |
| `@libs/paging/core`    | `PageRequest`, `Sort`, `Order`, `Direction`, `Page`, `Slice`  |
| `@libs/paging/http`    | `@Paginate`, `PageResponse`, `@ApiPaginatedResponse`, parsers |
| `@libs/paging/typeorm` | `paginate()`, `applySort()`                                   |

`core` is plain value objects with no Nest or TypeORM dependency.

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

Sortable fields are whitelisted per endpoint; everything else is a 400.

```
GET /api/users?page=1&size=10&sort=last_name,asc&sort=created_at,desc
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

Rejects `page < 0` and `size < 1`. An upper bound on `size` is endpoint policy, so it lives in the HTTP layer
(`@Paginate` caps it at 100) rather than here.

### `Sort` / `Order` / `Direction`

Immutable, ordered sort instructions. `Direction` is `'asc' | 'desc'`.

```typescript
Sort.by('lastName', 'firstName'); // both ascending
Sort.of(Order.desc('createdAt'), Order.asc('name'));
Sort.unsorted();

Order.asc('name');
Order.desc('createdAt');
Order.of('createdAt', direction); // direction optional, defaults to ascending

Sort.by('lastName').and(Sort.of(Order.desc('createdAt'))); // lastName asc, then createdAt desc

sort.isSorted();
sort.toArray(); // readonly Order[]
for (const order of sort) {
    /* Sort is iterable */
}
```

### `Page` / `Slice`

`Slice<T>` only knows whether another page exists — fetch `size + 1` rows and pass whether the extra row showed up.
No `COUNT(*)` query. `Page<T>` extends it with a total count, for "page 3 of 12 / 57 results" navigation.

```typescript
const slice = new Slice(rows, pageRequest, hasNext);
const page = new Page(rows, pageRequest, totalCount);

// content (readonly T[]), page, count, sort — plus totalCount and totalPages on Page
// hasContent(), hasNext, hasPrevious(), isFirst(), isLast()
// nextPageRequest() / previousPageRequest() → PageRequest | undefined

page.map(user => new UserDetails(user)); // Page<UserDetails>, metadata preserved
```

### `@Paginate(sortableFields?)`

Param decorator that parses `page`, `size`, and `sort` into a `PageRequest`, and registers the matching Swagger
`@ApiQuery` docs on the route.

- `page` defaults to `0`, `size` to `20`; non-numeric values fall back to those defaults.
- `size` above `100` throws `BadRequestException`.
- `sort` is repeatable and takes `field,direction`. Direction is optional and case-insensitive, defaulting to
  ascending.
- Sorting by a field outside the whitelist throws `BadRequestException`. Only the whitelist's own properties count, so
  inherited keys like `constructor` are rejected.

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

`PageResponse` is the wire shape — a Swagger-annotated DTO kept separate from the internal `Page`. Build it with
`PageResponse.from(page)`.

```jsonc
{
    "content": [],
    "page": 0,
    "count": 20,
    "total_pages": 3,
    "total_count": 57,
    "is_last": false,
}
```

`@ApiPaginatedResponse(Dto)` documents the response, composing `PageResponse`'s schema with `content` typed as
`Dto[]` — NestJS Swagger cannot infer that from the generic on its own.

---

## Filtering — `@libs/filtering`

No query-builder wrapper. Filter DTOs describe what the caller may ask for; the service applies them with plain
TypeORM. `EntityFilter` covers the fields every entity has.

### `EntityFilter`

Abstract base for filter DTOs, bound to a route with a plain `@Query()` — the global `ValidationPipe`
(`transform: true`) instantiates and validates it.

| Query param      | Property        | Type      | Description                             |
| ---------------- | --------------- | --------- | --------------------------------------- |
| `id`             | `id`            | `string`  | Filter by UUID                          |
| `created_after`  | `createdAfter`  | `Date`    | Lower bound on `createdAt`              |
| `created_before` | `createdBefore` | `Date`    | Upper bound on `createdAt`              |
| `updated_after`  | `updatedAfter`  | `Date`    | Lower bound on `updatedAt`              |
| `updated_before` | `updatedBefore` | `Date`    | Upper bound on `updatedAt`              |
| `deleted`        | `deleted`       | `boolean` | Include soft-deleted rows. Default: no. |

Dates are ISO 8601 with an explicit offset or `Z` (`2024-01-01T00:00:00Z`) — no implicit local timezone anywhere in
the API. `deleted` accepts `'true'` / `'false'`; anything else becomes `undefined`.

The query string stays flat rather than using bracket notation. Two getters compose the flat bounds back into a
`DateRange` (`{ from?: Date; to?: Date }`, both optional — apply only what is present):

```typescript
filter.createdDateRange; // → { from: createdAfter, to: createdBefore }
filter.updatedDateRange; // → { from: updatedAfter, to: updatedBefore }
```

### Extending it

Use `@NamedPropertyOptional` for extra fields, so the exposed name and the Swagger docs stay in one place:

```typescript
export class UserFilter extends EntityFilter {
    @NamedPropertyOptional('last_name', { description: 'Partial match on last name' })
    @IsOptional()
    @IsString()
    public lastName?: string;
}
```

The service applies them directly:

```typescript
if (filter.id) qb.andWhere('u.id = :id', { id: filter.id });
if (filter.lastName) qb.andWhere('u.lastName ILIKE :lastName', { lastName: `%${filter.lastName}%` });

const { from, to } = filter.createdDateRange;
if (from) qb.andWhere('u.createdAt >= :from', { from });
if (to) qb.andWhere('u.createdAt <= :to', { to });
```

Soft-delete filtering is TypeORM's own: entities extending `PersistentEntity` have a `@DeleteDateColumn`, so deleted
rows are excluded unless the query opts in with `withDeleted()`.

---

## Commons

### `@NamedProperty` / `@NamedPropertyOptional`

Combines `@Expose({ name })` with `@ApiProperty({ name })`, so a property's public name is declared once for both
serialization and Swagger. This is what keeps the wire format snake_case while the TypeScript stays camelCase.

```typescript
@NamedProperty('created_at', { description: 'Creation timestamp, UTC ISO 8601' })
public readonly createdAt: string;
```

### `PersistentEntity`

Abstract TypeORM entity with the standard audit columns.

| Property    | Column       | Type                | Description                 |
| ----------- | ------------ | ------------------- | --------------------------- |
| `id`        | `id`         | `uuid`              | Primary key, auto-generated |
| `createdAt` | `created_at` | `timestamp`         | Set on insert               |
| `updatedAt` | `updated_at` | `timestamp`         | Updated automatically       |
| `deletedAt` | `deleted_at` | `timestamp \| null` | Soft-delete timestamp       |

```typescript
entity.isActive; // getter → true when deletedAt is null
```

### `EntityDetails`

Base response DTO mirroring `PersistentEntity`. Timestamps serialize as UTC ISO 8601 strings, and `deleted_at` is
omitted when the entity is not soft-deleted.

```typescript
export class UserDetails extends EntityDetails {
    @NamedProperty('last_name')
    public readonly lastName: string;

    constructor(user: User) {
        super(user); // id + timestamps
        this.lastName = user.lastName;
    }
}
```

### `DateConverter`

```typescript
DateConverter.toISO(new Date('2024-07-01T12:00:00Z')); // → '2024-07-01T12:00:00.000Z'
DateConverter.toISO(null); // → undefined
```

Null-safe, so it drops straight onto optional fields like `deletedAt`. An invalid `Date` still throws `RangeError`.

### `updateEntity`

Applies a partial update to an entity, skipping `undefined` and — by default — `null`. Meant for PATCH handlers.

```typescript
updateEntity(user, { name: 'Jane', phone: undefined }); // name written, phone skipped

updateEntity(user, { managerId: null }, { allowNull: ['managerId'] }); // explicitly cleared
```

### Enum utilities

```typescript
enum Status {
    Active = 'active',
    Inactive = 'inactive',
}

getEnumValueByString(Status, 'active'); // → 'active'
getEnumValueByString(Status, 'ACTIVE'); // → undefined  (case-sensitive)
getEnumValueByString(Status, undefined); // → undefined

convertEnum(SourceEnum.Active, TargetEnum); // maps between enums with matching values
```

A non-string value throws rather than returning `undefined`.

### `RandomString`

```typescript
RandomString.generateSecure(32); // crypto.randomBytes — safe for tokens/passwords
RandomString.generateAlphanumeric(); // letters + digits, Math.random
RandomString.generateAlphabetic(); // letters only
RandomString.generateNumeric(6); // digits only → "482957"
RandomString.generate({ with: ['uppercase', 'digits'], length: 8 });
```

> Only `generateSecure()` uses a CSPRNG. Use it for anything security-sensitive.

### `validationExceptionFactory`

Installed on the global `ValidationPipe` in `main.ts`. Flattens nested `ValidationError` trees into a single list of
messages, so a failed request returns every problem at once.

---

## Logging

The app uses NestJS's default logger — no `LOG_LEVEL` variable, no custom logger. Use `new Logger(context)` per class.

### Request/response logging

`LogInterceptor` logs a route's body, query, and params and/or its response. `authorization`, `apikey`, and `secret`
keys are redacted at any depth. Payloads that `JSON.stringify` cannot handle degrade instead of throwing — cycles
render as `[Circular]`, anything else as `[Unserializable]` — so logging can never fail the request it is logging.

```typescript
@LogReqRes()   // request and response
@LogRequest()  // request only
@LogResponse() // response only
@Get()
findAll() { ... }
```

---

## Auth

`JwtAuthGuard` (`@commons/guards/jwt-auth.guard`) wraps Passport's JWT strategy. The strategy itself is not included —
add one per project. JWT settings come from `config.jwt`; the two secrets are lazy getters that throw only when first
read, so the template boots without them.

---

## Path Aliases

Declared in `tsconfig.json`:

| Alias             | Path                           |
| ----------------- | ------------------------------ |
| `@src`            | `src/`                         |
| `@commons`        | `src/commons/`                 |
| `@libs`           | `src/libs/`                    |
| `@infrastructure` | `src/infrastructure/`          |
| `@config`         | `src/infrastructure/config/`   |
| `@database`       | `src/infrastructure/database/` |
| `@integrations`   | `src/integrations/`            |
| `@features`       | `src/features/`                |
| `@test`           | `test/`                        |

Vitest resolves aliases separately, in `vitest.config.ts` — keep the two lists in sync when adding one.
