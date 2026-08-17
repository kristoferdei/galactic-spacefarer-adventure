# Galactic Spacefarer Adventure

A SAP CAP (Node.js) application for the Galactic Spacefarer Adventure take-home exercise.

## Stack

- **SAP CAP** (`@sap/cds`) — data model, service definition, event handlers
- **SQLite** — local development database
- **Fiori Elements** (List Report + Object Page) — driven by CDS UI annotations

## Project layout

```
db/
  schema.cds        # Task 1 – Spacefarer data model (+ Departments, Positions)
  data/*.csv         # sample data for local testing
srv/
  service.cds        # Task 2 – service definition + role-based @restrict
  service.js          # Task 3 – @before / @after event handlers
  annotations.cds     # Task 4/5 – Fiori List Report + Object Page annotations
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

CAP's built-in mock auth strategy is active locally. Useful test users (see `cds env get requires.auth`):

| user  | role    |
|-------|---------|
| alice | admin   |
| bob   | (none)  |

Example:

```bash
# READ — any authenticated user
curl -u alice: http://localhost:4004/odata/v4/spacefarer/Spacefarers

# CREATE — admin only
curl -u alice: -X POST http://localhost:4004/odata/v4/spacefarer/Spacefarers \
  -H "Content-Type: application/json" \
  -d '{"name":"Nova Stardancer","originPlanet":"Saturn","spacesuitColor":"Green"}'
```

## Notes on the task requirements

- **Authorization**: `srv/service.cds` restricts `CREATE`/`UPDATE`/`DELETE` to the `admin` role via `@restrict`; `READ` requires any authenticated user.
- **Planet X / Planet Y isolation**: `srv/service.js` includes a `before READ` handler that scopes results to the requesting user's `planet` attribute (would come from XSUAA/IAS token attributes in a real BTP deployment; falls back gracefully when not present, e.g. for local mock auth).
- **Fiori UI**: the List Report / Object Page are generated from the `@UI.*` annotations in `srv/annotations.cds` via the built-in CAP Fiori preview. For a deployable standalone Fiori Elements app, open this project in VS Code with the **SAP Fiori Tools - Application Modeler** extension and generate an app against the `SpacefarerService` OData service — it will reuse these same annotations.
- **Database**: SQLite is used for local development (`@cap-js/sqlite`), swappable for HANA in a real BTP deployment.

## Deadline

Take-home for a SAP BTP Full-Stack assessment — awaiting confirmation on the exact deadline (Tue Aug 18 vs Thu Aug 20, 2026) and repo visibility (public/private).
