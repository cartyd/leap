

## LLM Build Instructions: HTMX + Node.js (TypeScript) Form Capture + Review

### 1) Goal and Scope

Build a small web app that:

1. Collects applicant information from pages 1–3 of the “Emergency Assistance Fund” application.
2. Saves progress as the user fills it out (draft mode).
3. Shows a **Review** screen that renders the user’s entries in a clean, printable format.
4. Submits the final application and locks edits (unless an admin resets).

Must include these form sections (pages 1–3):

* Applicant & guardian info
* Medical history
* Medical coverage
* Income verification + employment info (applicant + spouse)
* Dependents + residency
* Resources contacted + outcomes
* Nature of request narrative
* Vendors 1–3 (payee details + amounts)
* Applicant signature + date (e-sign typed name acceptable)

### 2) Tech Requirements

Generate code using:

* **Node.js + TypeScript**
* **Fastify** server
* **Zod** for validation
* **Pino** for logging
* **HTMX** for partial page updates
* Server-side rendering using a simple template approach (choose one and implement):

  * EJS or Nunjucks, OR
  * plain string templates (OK if clean)
* Persistence: **SQLite for local dev** (via Prisma or better-sqlite3) and provide a path to swap to Postgres later.

Security basics:

* Helmet (or Fastify security headers)
* Rate limiting
* CSRF protection (double-submit cookie OR server token included in forms)
* Input sanitation + output escaping
* No PII in logs

### 3) Data Model (define strongly typed)

Create a single `Application` entity with:

* `id` (uuid)
* `status` enum: `DRAFT | SUBMITTED`
* `createdAt`, `updatedAt`, `submittedAt?`

Include nested data (either JSON columns or normalized tables—your choice, but be consistent):

* `guardianName?`
* `applicant`: { firstName, middleInitial?, lastName, email, dob, address1, city, state, zip, county, phoneHome?, phoneCell? }
* `request`: { assistanceFor, approximateCost }
* `medicalHistory`: { diagnosisYear, lupusType: 'Discoid'|'Systemic'|'Both'|'Unknown', physicianName, physicianPhone }
* `medicalCoverage`: { hasInsurance, coverageType: 'Medicaid'|'Medicare'|'Private'|'None', privateInsuranceName?, rxCoverage: 'Yes'|'No'|'Copay', copayAmount? }
* `income`: {
  appliedDisability: boolean,
  receives: { ssdi: boolean, ssi: boolean, monthlyAmount? },
  currentlyEmployed: boolean,
  unemployment: { receiving: boolean, amount? },
  otherIncome?
  }
* `employmentApplicant`: { employerName?, status: 'Full-Time'|'Part-Time'|'Other'|'Unemployed', otherStatusText?, grossIncome? }
* `spouse`: { name?, phone?, employerName?, status?, otherStatusText?, grossTaxableIncome? }
* `dependents`: { count?, agesText? }
* `residencyGA`: boolean
* `resourcesContacted`: array of up to 4 items: { nameOrAgency?, outcome? }
* `natureOfRequest`: long text
* `vendors`: array of 3 items: {
  vendorName?, contactPerson?, address?, city?, state?, zip?, telephone?, fax?, email?,
  totalAmountOwed?, amountRequesting?
  }
* `certification`: { applicantSignatureTyped, dateSigned } (store ISO date)

Validation rules (implement with Zod):

* Required: applicant first/last name, email, dob, address/city/state/zip/county, assistanceFor, approximateCost, residencyGA, natureOfRequest, at least vendor 1 name + amountRequesting (if you want strict), signature + dateSigned on submit.
* Format: email valid; phone loosely validated; currency numeric >= 0; year is 4-digit reasonable range.
* Conditional:

  * If hasInsurance = true and coverageType = Private => require privateInsuranceName.
  * If rxCoverage = Copay => require copayAmount.
  * If unemployment.receiving = true => require unemployment.amount.
  * If receives.ssdi or receives.ssi => require monthlyAmount.

### 4) Routes and HTMX Flow

Implement these routes:

**Public**

* `GET /` → landing page with “Start Application” button.
* `POST /applications` → create draft application and redirect to `/applications/:id/step/1`

**Steps (multi-page wizard)**

* `GET /applications/:id/step/:n` → render full page template with the step form.
* `POST /applications/:id/step/:n` → validate step payload; save; redirect to next step.

Use HTMX enhancements:

* Inline validation: on blur/change, `hx-post` to `POST /applications/:id/validate/:section` returning a small snippet showing errors next to fields.
* Auto-save draft: `hx-trigger="change delay:500ms"` to `POST /applications/:id/autosave` (returns “Saved” timestamp snippet).
* “Add resource row” button: `hx-get /partials/resource-row` returns a new row up to 4 max.
* Vendors section: pre-render 3 vendor blocks; optionally allow hide/show vendor 2/3.

**Review**

* `GET /applications/:id/review` → server-render a read-only summary (table-like).
* Each review section includes an “Edit” link back to its step.

**Submit**

* `POST /applications/:id/submit`:

  * Re-validate entire application with stricter rules.
  * Set status to `SUBMITTED`, write `submittedAt`.
  * Render confirmation screen with application ID and print view.
  * Disable edits (block POST to steps if submitted).

### 5) UI Requirements (HTMX + accessible HTML)

* Use semantic HTML (`<fieldset>`, `<legend>`, `<label for>`)
* Display required fields with an asterisk
* Error messages inline near fields
* Review page grouped by:

  1. Applicant & request
  2. Medical history & coverage
  3. Income & employment
  4. Dependents/residency/resources
  5. Nature of request
  6. Vendors 1–3
  7. Certification/signature
* Add a “Print Review” button using CSS print styles.

### 6) File Upload Placeholders (even if not fully implemented)

The form references attachments (pay stubs/W2, ID). Build a minimal upload feature:

* `POST /applications/:id/uploads` with multipart file
* Save metadata to DB (filename, mime, size, uploadedAt, category: `PAYSTUB_W2 | ID | OTHER`)
* Store locally under `/uploads/:appId/` in dev
* Show uploaded file list in review (do not display raw file inline, just filename + size)

### 7) Database / Persistence

Provide either:

* Prisma schema + migrations (recommended), OR
* SQL schema + a small repository layer

Must include:

* `applications` table
* `uploads` table (optional but recommended)
* Ensure updates update `updatedAt`
* Ensure partial step saves merge safely (don’t wipe fields not present in the step)

### 8) Admin View (minimal)

Add:

* `GET /admin/applications` list drafts/submitted (protect with basic auth env vars)
* `GET /admin/applications/:id` shows review view + uploaded files list
* `POST /admin/applications/:id/reset` sets back to draft (optional)

### 9) Testing

Generate:

* Unit tests for Zod schemas (happy path + conditional validation)
* Route tests for create → save → review → submit
  Use Jest

### 10) Deliverables

Output:

1. Folder structure
2. All code files (server, templates, schemas, db layer)
3. Run instructions (dev + test)
4. Example `.env.example`
5. Notes on how to switch SQLite → Postgres

### 11) Field Mapping (must match the form)

When naming inputs, keep them stable and explicit (dot-notation is OK). Include at least these exact labels/fields derived from the form pages 1–3: guardian name, applicant name parts, email, DOB, address fields, home/cell phone, requesting assistance for, approximate cost, diagnosis year, lupus type (Discoid/Systemic), physician name/phone, insurance yes/no, covered by Medicaid/Medicare/Private + private name, prescription coverage yes/copay/no, applied for disability, receives SSDI/SSI + monthly amount, employed yes/no, unemployment yes/no + amount, other income, employer name/status/gross income, spouse name/phone/employer/status/gross taxable income, dependents count/ages, GA residency yes/no, resources contacted (1–4) + outcomes, nature of request narrative, vendors 1–3 details and totals, applicant signature + date. 

