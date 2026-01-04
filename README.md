# Emergency Assistance Fund Application

A multi-step web application for collecting Emergency Assistance Fund applications with auto-save, inline validation, review, and submission capabilities.

## Tech Stack

- **Backend**: Node.js + TypeScript + Fastify
- **Frontend**: HTMX for progressive enhancement
- **Templating**: Nunjucks
- **Database**: Prisma + SQLite (development) / PostgreSQL (production)
- **Validation**: Zod
- **Logging**: Pino
- **Security**: Helmet, Rate Limiting, CSRF Protection

## Features

- 6-step multi-page form wizard
- Auto-save functionality
- Inline field validation with HTMX
- File uploads for supporting documents
- Review page before submission
- Admin panel for viewing applications
- Responsive design with print-friendly CSS
- CSRF protection
- PII masking in logs

## Prerequisites

- Node.js 18+ and npm
- SQLite3 (for development)
- PostgreSQL (for production)

## Installation

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="file:./dev.db"
SESSION_SECRET=your-secret-key-change-in-production
CSRF_SECRET=your-csrf-secret-change-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme
UPLOADS_DIR=./uploads
MAX_FILE_SIZE=10485760
```

3. **Initialize the database:**

```bash
npm run db:generate
npm run db:migrate
```

This will:
- Generate Prisma Client
- Run database migrations
- Create the SQLite database

4. **Create uploads directory:**

```bash
mkdir -p uploads
```

## Development

Start the development server with hot-reload:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Database Management

- **View database:** `npm run db:studio`
- **Create migration:** `npm run db:migrate`
- **Generate client:** `npm run db:generate`

## Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Building for Production

1. **Build TypeScript:**

```bash
npm run build
```

2. **Start production server:**

```bash
npm start
```

## Migration: SQLite → PostgreSQL

To migrate from SQLite to PostgreSQL:

1. **Update `prisma/schema.prisma`:**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. **Update `.env`:**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/leap?schema=public"
```

3. **Run migrations:**

```bash
npm run db:migrate
```

4. **Update file storage:**

For production, replace local file storage with cloud storage (S3, Google Cloud Storage, etc.)

## Application Flow

### User Flow

1. **Landing Page** (`/`) - Introduction and "Start Application" button
2. **Step 1** - Applicant & Guardian Info + Request Details
3. **Step 2** - Medical History & Coverage
4. **Step 3** - Income & Employment (Applicant + Spouse)
5. **Step 4** - Dependents, Residency, Resources Contacted
6. **Step 5** - Nature of Request + Vendors (1-3)
7. **Step 6** - Certification & Signature
8. **Review Page** - Summary with edit links
9. **Submit** - Final validation and submission
10. **Confirmation** - Success message with application ID

### Admin Features

Access admin panel at `/admin/applications` (requires basic auth):

- View all applications (filter by status)
- View detailed application with uploads
- Reset applications to draft status

Default credentials (change in production):
- Username: `admin`
- Password: `changeme`

## API Endpoints

### Public Routes

- `GET /` - Landing page
- `POST /applications` - Create new draft application
- `GET /applications/:id/step/:n` - Render step form (n = 1-6)
- `POST /applications/:id/step/:n` - Save step and continue
- `POST /applications/:id/autosave` - Auto-save (HTMX)
- `POST /applications/:id/validate/:section` - Inline validation (HTMX)
- `GET /applications/:id/review` - Review page
- `POST /applications/:id/submit` - Submit application
- `POST /applications/:id/uploads` - Upload file
- `GET /partials/resource-row` - Dynamic resource row (HTMX)

### Admin Routes (Protected)

- `GET /admin/applications` - List all applications
- `GET /admin/applications/:id` - View application detail
- `POST /admin/applications/:id/reset` - Reset to draft

## Project Structure

```
leap/
├── src/
│   ├── server.ts              # Entry point
│   ├── app.ts                 # Fastify configuration
│   ├── config/
│   │   └── index.ts           # Environment configuration
│   ├── routes/
│   │   ├── index.ts           # Landing page
│   │   ├── applications.ts    # Application CRUD
│   │   ├── steps.ts           # Multi-step forms
│   │   ├── validation.ts      # Inline validation
│   │   ├── uploads.ts         # File handling
│   │   ├── admin.ts           # Admin panel
│   │   └── partials.ts        # HTMX fragments
│   ├── services/
│   │   ├── application.service.ts   # Application business logic
│   │   └── upload.service.ts        # File handling logic
│   ├── schemas/
│   │   └── application.schema.ts    # Zod validation schemas
│   ├── middleware/
│   │   ├── auth.ts            # Basic auth
│   │   ├── csrf.ts            # CSRF protection
│   │   └── error-handler.ts   # Error handling
│   └── views/                 # Nunjucks templates
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   └── styles.css             # Stylesheets
├── tests/                     # Jest tests
├── uploads/                   # Local file storage (dev)
├── package.json
├── tsconfig.json
└── README.md
```

## Security Features

- **Helmet**: Security headers
- **Rate Limiting**: 100 requests per 15 minutes
- **CSRF Protection**: Double-submit cookie pattern
- **Input Sanitization**: Server-side validation with Zod
- **Output Escaping**: Nunjucks autoescaping
- **PII Protection**: Sensitive data masked in logs
- **Basic Auth**: Admin routes protected
- **File Upload Validation**: Mime type and size checks

## Validation Rules

### Required Fields (on submit)

- Applicant: first name, last name, email, DOB, address, city, state, ZIP, county
- Request: assistance type, approximate cost
- Residency: Georgia residency must be true
- Nature of Request: description required
- Vendor 1: name and amount requesting
- Certification: signature and date

### Conditional Validation

- If has insurance + private → require private insurance name
- If RX coverage = copay → require copay amount
- If receives SSDI/SSI → require monthly amount
- If receiving unemployment → require amount

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | Database connection string | `file:./dev.db` |
| `SESSION_SECRET` | Cookie signing secret | - |
| `CSRF_SECRET` | CSRF token secret | - |
| `ADMIN_USERNAME` | Admin panel username | `admin` |
| `ADMIN_PASSWORD` | Admin panel password | `changeme` |
| `UPLOADS_DIR` | Upload directory path | `./uploads` |
| `MAX_FILE_SIZE` | Max file size in bytes | `10485760` (10MB) |

## Troubleshooting

### Database Issues

If you encounter database errors:

```bash
# Reset database
rm dev.db
npm run db:migrate
```

### Port Already in Use

Change the port in `.env`:

```env
PORT=3001
```

### File Upload Issues

Ensure uploads directory exists and is writable:

```bash
mkdir -p uploads
chmod 755 uploads
```

## License

ISC

## Support

For issues or questions, please contact the development team.
