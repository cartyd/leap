# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common Commands

### Development
- `npm run dev` - Start development server with hot-reload (tsx watch)
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production server

### Testing
- `npm test` - Run all tests (Jest)
- `npm run test:watch` - Run tests in watch mode for TDD
- `npm run test:e2e` - Run E2E tests with Playwright (headless)
- `npm run test:e2e:ui` - Run E2E tests in UI mode (interactive debugging)
- `npm run test:e2e:headed` - Run E2E tests with visible browser
- `npm run test:e2e:debug` - Run E2E tests in debug mode

### Database
- `npm run db:generate` - Generate Prisma Client after schema changes
- `npm run db:migrate` - Create and apply database migrations
- `npm run db:studio` - Open Prisma Studio GUI for database inspection

## Architecture Overview

This is a **multi-step form wizard application** for collecting Emergency Assistance Fund applications. The architecture emphasizes:

### Core Tech Stack
- **Backend**: Fastify server with TypeScript
- **Frontend**: HTMX for progressive enhancement (no client-side framework)
- **Templating**: Nunjucks with server-side rendering
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (production)
- **Validation**: Zod schemas with conditional validation rules

### Application Flow Pattern
The app uses a **draft-first approach** with auto-save:

1. **Draft Creation**: Applications start as DRAFT status with empty data structure
2. **Progressive Filling**: Users complete 6 steps, each saving partial data via deep merge
3. **HTMX Enhancements**: 
   - Inline validation on blur/change
   - Auto-save with 500ms delay
   - Dynamic form sections (vendor rows, resources contacted)
4. **Review & Submit**: Final validation converts DRAFT → SUBMITTED (immutable)
5. **Admin Panel**: Basic auth protected routes for viewing/managing applications

### Data Architecture
- **Application Model**: Single table with JSON `data` column containing all form fields
- **Upload Model**: Separate table for file attachments (PAYSTUB_W2 | ID | OTHER categories)
- **Status Enum**: DRAFT (editable) | SUBMITTED (locked)
- **Deep Merge Strategy**: Partial updates merge with existing data without overwriting sibling fields

### Key Validation Rules (Zod)
The app uses **conditional validation** patterns:
- If `hasInsurance = true` AND `coverageType = 'Private'` → require `privateInsuranceName`
- If `rxCoverage = 'Copay'` → require `copayAmount`
- If `receives.ssdi` OR `receives.ssi = true` → require `receives.monthlyAmount`
- If `unemployment.receiving = true` → require `unemployment.amount`
- All schemas have both lenient (step-by-step) and strict (submit) validation modes

### Path Aliases (tsconfig.json)
- `@config/*` → `src/config/*`
- `@routes/*` → `src/routes/*`
- `@services/*` → `src/services/*`
- `@schemas/*` → `src/schemas/*`
- `@middleware/*` → `src/middleware/*`

### Security Features
- **Helmet**: Security headers with CSP allowing HTMX from unpkg.com
- **Rate Limiting**: 100 requests per 15 minutes
- **CSRF Protection**: Double-submit cookie pattern (token + HMAC signature)
- **Basic Auth**: Admin routes protected with username/password from env vars
- **PII Masking**: Sensitive data excluded from Pino logs
- **File Upload Validation**: MIME type and size checks

## Project Structure

```
src/
├── server.ts              # Entry point
├── app.ts                 # Fastify instance + middleware registration
├── config/                # Environment configuration
├── middleware/            # auth, csrf, error-handler
├── routes/                # Route handlers (applications, steps, validation, uploads, admin, partials)
├── services/              # Business logic (application.service, upload.service)
├── schemas/               # Zod validation schemas (application.schema.ts)
└── views/                 # Nunjucks templates
tests/
└── unit/                  # Jest tests organized by domain
prisma/
└── schema.prisma          # Database schema (SQLite → PostgreSQL portable)
```

## Development Patterns

### Adding New Form Fields
1. Update the Zod schema in `src/schemas/application.schema.ts`
2. Add to the appropriate step schema (step1-6) for lenient validation
3. Add to `applicationDataSchema` for strict submit validation
4. Update the service layer if new conditional validation is needed
5. Update Nunjucks templates in `src/views/`

### HTMX Integration
- Forms use `hx-post` with `hx-target` for inline validation
- Auto-save triggers: `hx-trigger="change delay:500ms"`
- Dynamic partials: `hx-get /partials/resource-row` returns HTML fragments
- CSRF tokens passed via hidden `_csrf` form fields

### Testing Strategy

#### Unit Tests (Jest)
Tests use **table-driven patterns** with valid, invalid, and edge cases:
```typescript
const testCases: TestCase[] = [
  { name: 'valid case', input: {...}, shouldPass: true },
  { name: 'invalid case', input: {...}, shouldPass: false, expectedErrors: ['field'] }
];
testCases.forEach(({ name, input, shouldPass, expectedErrors }) => {
  it(name, () => { /* test logic */ });
});
```

#### E2E Tests (Playwright)
End-to-end tests cover:
- **Complete user flows**: Full 6-step application submission
- **Validation**: Required field and conditional validation
- **Auto-save**: HTMX-based draft saving with delays
- **Navigation**: Back/forward data preservation
- **Admin panel**: Authentication, application viewing, reset functionality
- Tests located in `tests/e2e/` with comprehensive documentation

### Database Migrations
When modifying the schema:
1. Edit `prisma/schema.prisma`
2. Run `npm run db:migrate` to create migration
3. Run `npm run db:generate` to update Prisma Client types
4. For production PostgreSQL, update datasource provider and DATABASE_URL

### Switching SQLite to PostgreSQL
1. Update `prisma/schema.prisma`: `provider = "postgresql"`
2. Update `.env`: `DATABASE_URL="postgresql://user:pass@host:5432/dbname"`
3. Run migrations: `npm run db:migrate`
4. Consider migrating file uploads to cloud storage (S3, GCS)

## Important Constraints

### Immutability After Submit
Once an application reaches SUBMITTED status:
- `updateApplication()` throws error: "Cannot modify submitted application"
- Only admin can reset via `POST /admin/applications/:id/reset`

### Deep Merge Behavior
The `updateApplication()` service uses recursive deep merge:
- Nested objects merge field-by-field
- Arrays are replaced entirely (not merged)
- Empty strings and undefined are preserved in the merge

### Nunjucks Custom Filters
Available in all templates:
- `{{ value | currency }}` - Formats numbers as USD
- `{{ value | date }}` - Formats ISO dates as MM/DD/YYYY

### File Upload Constraints
- Max size: 10MB (configurable via `MAX_FILE_SIZE` env var)
- Allowed categories: PAYSTUB_W2, ID, OTHER
- Storage: Local filesystem in dev (`./uploads/:appId/`)
- MIME type validation enforced by Fastify multipart plugin

## Running Single Tests

Jest configuration points to `tests/` directory:
```bash
# Run specific test file
npm test -- unit/schemas/application.schema.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="Medical Coverage"

# Run with coverage
npm test -- --coverage
```
