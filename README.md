# Galactic Spacefarer Adventure

A SAP CAP (Node.js) application for the Galactic Spacefarer Adventure take-home exercise.

## Task coverage

| # | Task | Where |
|---|------|-------|
| 1 | Spacefarer data model + relationships | `db/schema.cds` |
| 2 | CAP service definition, CRUD, protected | `srv/service.cds` |
| 3 | `@Before`/`@After` event handlers (validation, enhancement, welcome email) | `srv/service.js`, `srv/lib/mailer.js` |
| 4 | List Report Fiori app (sort/filter/pagination) | `app/spacefarerapp/` |
| 5 | Object Page (view + edit) | `app/spacefarerapp/`, `srv/annotations.cds` |
| — | SQLite for local dev | `package.json` → `@cap-js/sqlite` |
| — | Authorized-users-only + Planet X/Y isolation | `srv/service.cds` (`@restrict`), `srv/service.js` (`before READ`) |
| — | Tests | `test/spacefarers.test.cjs` |

## Stack

- **SAP CAP** (`@sap/cds`) — data model, service definition, event handlers
- **SQLite** — local development database
- **Fiori Elements** (List Report + Object Page) — driven by CDS UI annotations

## Project layout

```
db/
  schema.cds           # Task 1 – Spacefarer data model (+ Departments, Positions)
  data/*.csv            # sample data for local testing
srv/
  service.cds           # Task 2 – service definition + role-based @restrict
  service.js             # Task 3 – @before / @after event handlers
  annotations.cds        # Task 4/5 – Fiori List Report + Object Page annotations
  lib/mailer.js          # nodemailer-based welcome email (Task 3 @After)
app/
  spacefarerapp/         # Task 4/5 – generated Fiori Elements app (List Report + Object Page)
test/
  spacefarers.test.cjs   # integration tests (auth, planet isolation, before/after CREATE)
.env.example             # optional SMTP config template for the mailer
```

## Running locally

```bash
npm install
npm start          # or: npx cds watch
```

This starts the service at `http://localhost:4004`.

- OData endpoint: `http://localhost:4004/odata/v4/spacefarer/Spacefarers`
- Fiori preview (List Report): `http://localhost:4004/$fiori-preview/SpacefarerService/Spacefarers`

### Mock users (local dev auth)

CAP's built-in mock auth strategy is active locally, extended with a `planet` attribute per user (see `package.json` → `cds.requires.auth.users`) to demonstrate the Planet X/Y isolation rule.

| user  | role    | planet |
|-------|---------|--------|
| alice | admin   | Earth  |
| bob   | (none)  | Mars   |

Example:

```bash
# READ — any authenticated user, results scoped to their planet
curl -u alice: http://localhost:4004/odata/v4/spacefarer/Spacefarers   # only sees Earth-department spacefarers
curl -u bob:   http://localhost:4004/odata/v4/spacefarer/Spacefarers   # only sees Mars-department spacefarers

# CREATE — admin only
curl -u alice: -X POST http://localhost:4004/odata/v4/spacefarer/Spacefarers \
  -H "Content-Type: application/json" \
  -d '{"name":"Nova Stardancer","originPlanet":"Saturn","spacesuitColor":"Green"}'
```

## Running tests

```bash
npm test
```

Runs 5 integration tests against an in-memory CAP server (via `@cap-js/cds-test` + Node's built-in test runner):
- Planet X/Y isolation on READ
- `@restrict`-based authorization (non-admin CREATE is forbidden)
- `@before` validation (negative stardust rejected on draft activation)
- `@before` validation (invalid email format rejected on draft activation)
- `@before`/`@after` defaults and welcome-email trigger on draft activation

## Notes on the task requirements

- **Authorization**: `srv/service.cds` restricts `CREATE`/`UPDATE`/`DELETE` to the `admin` role via `@restrict`; `READ` requires any authenticated user.
- **Planet X / Planet Y isolation**: `srv/service.js` includes a `before READ` handler that scopes results to the requesting user's `planet` attribute (in a real BTP deployment this would come from XSUAA/IAS token attributes; here it's demonstrated locally via the mock users' `planet` attribute in `package.json`).
- **@After event**: sends a real welcome email via `srv/lib/mailer.js` (using [nodemailer](https://nodemailer.com/)). Without `SMTP_HOST` configured it uses nodemailer's JSON transport (no network call, but exercises the full send API — see console log). Copy `.env.example` to `.env` and fill in `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `MAIL_FROM` to send through a real SMTP server. Note: with draft mode enabled (see below), this fires on **draft activation**, not on the initial draft POST.
- **Fiori UI**: the List Report / Object Page were generated with the SAP Fiori Tools application generator (`yo @sap/fiori`) against this CAP project's `SpacefarerService`, producing a standalone app under `app/spacefarerapp/`. It uses draft-based editing (`@odata.draft.enabled` on the `Spacefarers` entity) so the Object Page supports the required Edit flow for stardust collection and spacesuit color.
- **Database**: SQLite is used for local development (`@cap-js/sqlite`), swappable for HANA in a real BTP deployment.