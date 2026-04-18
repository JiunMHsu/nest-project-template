# NestJS Project Template

A production-ready NestJS template with built-in utilities for querying, pagination, sorting, date handling, and more.
Designed to provide a consistent, well-tested foundation so new features can be built without re-solving the same
infrastructure problems.

## Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Framework  | NestJS 11                           |
| Language   | TypeScript 6                        |
| Database   | PostgreSQL + TypeORM 0.3            |
| Validation | class-validator + class-transformer |
| Date/Time  | Luxon                               |
| Testing    | Vitest                              |
| Build      | SWC                                 |

---

## Project Structure

```
src/
├── commons/
│   ├── abstracts/          # Base entity and response DTO classes
│   ├── constants/          # App-wide constants (timezone, etc.)
│   ├── decorators/         # Swagger helpers
│   ├── filters/            # Exception filters
│   ├── guards/             # Auth guards
│   ├── querying/           # Query builder, pagination, sorting, filter DTOs
│   ├── transformers/       # class-transformer decorators
│   └── utils/              # String, number, date, enum, entity utilities
├── features/               # Domain feature modules
├── health/                 # Health check endpoint
└── infrastructure/         # Config, database, logger, migrations
```

---

## Setup

### 1. Environment variables

Copy `.env.schema` to `.env` and fill in your values:

```bash
cp .env.schema .env
```

| Variable                 | Default                 | Description                                                      |
|--------------------------|-------------------------|------------------------------------------------------------------|
| `NODE_ENV`               | `development`           | Runtime environment                                              |
| `LOGGER_LEVEL`           | `log`                   | NestJS logger level (`log`, `warn`, `error`, `debug`, `verbose`) |
| `APP_HOST`               | `0.0.0.0`               | Server bind address                                              |
| `APP_PORT`               | `7878`                  | Server port                                                      |
| `APP_URL`                | —                       | Public base URL of the app                                       |
| `CORS_ORIGINS`           | `http://localhost:5173` | Comma-separated list of allowed CORS origins                     |
| `JWT_SECRET`             | —                       | Secret for access tokens                                         |
| `JWT_EXPIRES_IN`         | `3600`                  | Access token lifetime in seconds                                 |
| `JWT_REFRESH_SECRET`     | —                       | Secret for refresh tokens                                        |
| `JWT_REFRESH_EXPIRES_IN` | `604800`                | Refresh token lifetime in seconds                                |
| `HASH_SALT`              | `5`                     | bcrypt salt rounds                                               |
| `DB_HOST`                | `localhost`             | PostgreSQL host                                                  |
| `DB_PORT`                | `5432`                  | PostgreSQL port                                                  |
| `DB_USER`                | —                       | PostgreSQL user                                                  |
| `DB_PASSWORD`            | —                       | PostgreSQL password                                              |
| `DB_NAME`                | —                       | PostgreSQL database name                                         |
| `ADMIN_EMAIL`            | —                       | Seed admin account email                                         |
| `ADMIN_PASSWORD`         | —                       | Seed admin account password                                      |

### 2. Install dependencies

```bash
npm install
```

### 3. Run

```bash
# Development (watch mode)
npm run dev

# Production
npm run build && npm run prod
```

---

## Database

The database module is included but commented out in `InfrastructureModule` — enable it when ready:

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

### Migrations

```bash
# Generate a migration from entity changes
npm run migration:gen --name=migration-name

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

### Seeding

```bash
# Run seeders
npm run seed

# Clear data and re-seed
npm run seed:clear
```

---

## Testing

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

Tests live in `test/unit/`, `test/integration/`, and `test/e2e/` and mirror the `src/` structure.

---

## Commons — Built-in Utilities

### QueryBuilder

A fluent wrapper around TypeORM's `SelectQueryBuilder` that adds field whitelisting, null-aware filters, automatic
soft-delete filtering, and integrated pagination.

All active-record queries automatically exclude soft-deleted rows (`deletedAt IS NULL`). All filter methods are
chainable and skip `undefined` values, making them safe to call directly with optional DTO fields.

```typescript
const results = await new QueryBuilder(
    repo.createQueryBuilder('u'),
    'u',
    sorting.getCriteria(), // from @Sorting()
    ['name', 'email', 'status'], // allowed filter fields (optional)
)
    .withDeleted(filter.deleted)
    .equals('u.status', filter.status)
    .contains('u.name', filter.search)
    .between('u.createdAt', filter.creationDateRange)
    .between('u.updatedAt', filter.updateDateRange)
    .in('u.roleId', filter.roleIds)
    .getPage(paging); // or .getMany()
```

**Filter methods:**

| Method                              | SQL equivalent             | Notes                                                    |
|-------------------------------------|----------------------------|----------------------------------------------------------|
| `.equals(field, value)`             | `= value` / `IS NULL`      | Null produces `IS NULL`                                  |
| `.notEquals(field, value)`          | `!= value` / `IS NOT NULL` | Null produces `IS NOT NULL`                              |
| `.greaterThan(field, value)`        | `> value`                  |                                                          |
| `.lessThan(field, value)`           | `< value`                  |                                                          |
| `.greaterThanOrEqual(field, value)` | `>= value`                 |                                                          |
| `.lessThanOrEqual(field, value)`    | `<= value`                 |                                                          |
| `.like(field, pattern)`             | `LIKE pattern`             | Raw pattern — caller places `%` / `_` wildcards          |
| `.startsWith(field, pattern)`       | `LIKE 'pattern%'`          | Auto-escapes `%` and `_` in pattern                      |
| `.endsWith(field, pattern)`         | `LIKE '%pattern'`          | Auto-escapes `%` and `_` in pattern                      |
| `.contains(field, pattern)`         | `LIKE '%pattern%'`         | Auto-escapes `%` and `_` in pattern                      |
| `.in(field, values)`                | `IN (...)`                 | Empty array → `1=0` (zero results, not all results)      |
| `.between(field, from, to)`         | `>= from AND <= to`        | Either bound may be omitted                              |
| `.between(field, DateRange)`        | `>= from AND <= to`        | Accepts a `DateRange` object directly                    |
| `.withDeleted(flag?)`               | skips `deletedAt IS NULL`  | Pass `filter.deleted`; defaults to `true` if no argument |

---

### Pagination

**`PageRequest`** holds validated pagination parameters. Pages are 0-indexed.

```typescript
const paging = new PageRequest(0, 20); // page, size
// paging.offset → 0  (ready for TypeORM's .skip())
```

Constraints: `page >= 0`, `1 <= size <= 100`. Constructor throws on violation.

**`@Paging()`** — param decorator that parses `?page=` and `?size=` from the request. Non-numeric values fall back to
defaults (`page=0`, `size=20`). Invalid values throw `BadRequestException`.

```typescript
@Get()
findAll(@Paging()
paging: PageRequest
)
{ ...
}
// GET /items?page=1&size=10
```

---

**`PageResponse<T>`** is the standard paginated response shape.

```typescript
// { page, size, total, totalPages, data: T[] }
const page = await queryBuilder.getPage(paging);

// Synchronous item mapping
const dto = page.transform(entity => new EntityDto(entity));

// Async item mapping (runs in parallel)
const enriched = await page.transformAsync(async e => enrich(e));

// Get a PageRequest for the next page (null if on the last page)
const next = page.getNextPageRequest();
```

**`@ApiPaginatedResponse(Dto)`** — Swagger decorator for paginated endpoints:

```typescript
@ApiPaginatedResponse(ItemDto)
@Get()
findAll(@Paging()
paging: PageRequest
):
Promise < PageResponse < ItemDto >> { ... }
```

---

### Sorting

**`@Sorting(validFields)`** — param decorator that parses one or more `?sortBy=` values.

Format: `sortBy=field,direction` — direction defaults to `ASC` if omitted.
Fields `id`, `createdAt`, and `updatedAt` are always allowed.
Invalid fields throw `BadRequestException`.

```typescript
@Get()
findAll(@Sorting(['name', 'status'])
sorting: SortRequest
)
{
    const criteria = sorting.getCriteria();
    // Pass directly to QueryBuilder:
    new QueryBuilder(qb, 'u', criteria)
...
}
// GET /items?sortBy=name,ASC&sortBy=createdAt,DESC
```

---

### Query Params

**`@QueryParams()`** — param decorator that parses, transforms, and validates query parameters into a typed DTO.
Comma-separated string values are automatically split into arrays. Invalid input throws `BadRequestException`.

```typescript
@Get()
findAll(@QueryParams()
filter: ItemFilterDto
)
{ ...
}
// GET /items?status=active&tags=a,b,c
// → filter.tags = ['a', 'b', 'c']
```

---

### EntitySpecification

Abstract base class for filter DTOs. Provides out of the box:

| Field           | Type      | Description                                          |
|-----------------|-----------|------------------------------------------------------|
| `id`            | `string`  | Filter by exact UUID                                 |
| `createdAfter`  | `Date`    | Lower bound on `createdAt` (Buenos Aires local time) |
| `createdBefore` | `Date`    | Upper bound on `createdAt` (Buenos Aires local time) |
| `updatedAfter`  | `Date`    | Lower bound on `updatedAt` (Buenos Aires local time) |
| `updatedBefore` | `Date`    | Upper bound on `updatedAt` (Buenos Aires local time) |
| `deleted`       | `boolean` | When `true`, bypasses the `deletedAt IS NULL` gate   |

Date fields use `@TransformToUTC()` — clients send Buenos Aires local time, the DTO receives UTC.

Two getters compose the flat date fields into `DateRange` objects for use with `QueryBuilder.between()`:

```typescript
filter.creationDateRange; // → { from: createdAfter, to: createdBefore }
filter.updateDateRange; // → { from: updatedAfter, to: updatedBefore }
```

```typescript
export class ItemFilterDto extends EntitySpecification {
    @IsOptional()
    @IsString()
    name?: string;
}

// In service:
queryBuilder
    .withDeleted(filter.deleted)
    .between('u.createdAt', filter.creationDateRange)
    .between('u.updatedAt', filter.updateDateRange);
```

---

### Base Classes

**`PersistentEntity`** — abstract TypeORM entity with standard audit columns:

| Column      | Type                | Description                 |
|-------------|---------------------|-----------------------------|
| `id`        | `uuid`              | Primary key, auto-generated |
| `createdAt` | `timestamp`         | Set on insert               |
| `updatedAt` | `timestamp`         | Updated automatically       |
| `deletedAt` | `timestamp \| null` | Soft-delete timestamp       |

```typescript
entity.isActive(); // → true when deletedAt is null
```

**`EntityDetails`** — abstract base DTO for API responses. Converts UTC timestamps from the database to Buenos Aires
local time ISO strings. `deletedAt` is omitted from the JSON response when the entity is not deleted.

```typescript
export class ItemDto extends EntityDetails {
    constructor(entity: Item) {
        super(entity);
        this.name = entity.name;
    }

    name: string;
}
```

---

### DateTime

**`DateConverter.toLocalISO(date)`** — converts a UTC `Date` to an ISO 8601 string in Buenos Aires time (
`America/Argentina/Buenos_Aires`, UTC-3). Returns `undefined` for `null`/`undefined` input.

```typescript
DateConverter.toLocalISO(new Date('2024-07-01T12:00:00Z'));
// → '2024-07-01T09:00:00.000-03:00'
```

**`@TransformToUTC()`** — `class-transformer` property decorator. Accepts a bare ISO 8601 string (no timezone suffix)
and converts it from Buenos Aires local time to a UTC `Date`. Strings with timezone information (`Z`, `±HH:MM`) are
rejected.

```typescript
class FilterDto {
    @TransformToUTC()
    @IsOptional()
    createdAfter?: Date;
}

// ?createdAfter=2024-07-01T09:00:00  →  2024-07-01T12:00:00.000Z
```

---

### Number Utilities

```typescript
roundTo(3.14159, 2); // → 3.14
roundToDefault(1.23456); // → 1.2346  (4 decimal places)
roundToTwoDecimals(10.9876); // → 10.99

sequence(1, 5); // → [1, 2, 3, 4, 5]
sequence(3, 3); // → [3]
```

> `roundTo` uses the multiply-divide method. For financial calculations requiring exact decimal rounding, use a
> dedicated decimal library.

---

### String Utilities

**`StringBuilder`** — fluent string builder for iterative or conditional construction:

```typescript
new StringBuilder().appendLine('Title').appendItemized('Point one').appendItemized('Point two').toString();
// → "Title\n- Point one\n- Point two\n"
```

**`StringSanitizer.removeSpecialChars(input)`** — removes all non-letter, non-digit, non-space characters and trims
whitespace. Preserves Unicode letters (`é`, `ñ`, `中`).

```typescript
StringSanitizer.removeSpecialChars('Hello@World#123!'); // → 'HelloWorld123'
StringSanitizer.removeSpecialChars('café naïve'); // → 'café naïve'
```

---

### RandomString

```typescript
RandomString.generateSecure(32); // crypto.randomBytes — safe for tokens/passwords
RandomString.generateAlphanumeric(); // letters + digits, Math.random
RandomString.generateAlphabetic(); // letters only
RandomString.generateNumeric(6); // digits only → "482957"
RandomString.generate({ with: ['uppercase', 'digits'], length: 8 });
```

> Only `generateSecure()` is cryptographically safe. Use it for anything security-sensitive.

---

### Entity Utilities

**`updateEntity(entity, updates, options?)`** — applies a partial update object to an entity, skipping `undefined`
values and, by default, `null` values. Intended for PATCH handlers.

```typescript
// Only provided fields are written; undefined = skip, null = skip by default
updateEntity(user, { name: 'Jane', phone: undefined });

// Allow explicitly nulling a field
updateEntity(user, { managerId: null }, { allowNull: ['managerId'] });
```

---

### Enum Utilities

```typescript
enum Status {
    Active = 'active',
    Inactive = 'inactive',
}

getEnumValueByString(Status, 'active'); // → 'active'
getEnumValueByString(Status, 'ACTIVE'); // → undefined  (case-sensitive)
getEnumValueByString(Status, undefined); // → undefined

// Map between enums with matching values
convertEnum(SourceEnum.X, TargetEnum);
```

---

## Auth

A `JwtAuthGuard` wrapping Passport's JWT strategy is included at `src/commons/guards/jwt-auth.guard.ts`. JWT
configuration (`secret`, `expiresIn`, `refreshSecret`, `refreshExpiresIn`) is loaded from environment variables via the
app config.

---

## Path Aliases

The following aliases are configured in both `tsconfig.json` and `vitest.config.unit.ts`:

| Alias             | Path                  |
|-------------------|-----------------------|
| `@src`            | `src/`                |
| `@commons`        | `src/commons/`        |
| `@infrastructure` | `src/infrastructure/` |
| `@integrations`   | `src/integrations/`   |
| `@features`       | `src/features/`       |
| `@test`           | `test/`               |
