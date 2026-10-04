# TokTickIT

TokTickIT is a web-based IT support ticketing system developed for CPE334 Software Engineering.

## Lab 3 Features

Lab 3 includes:

* User login with email and password
* Initial password change
* Role-based access control
* Requester ticket management
* IT Staff ticket queue
* IT Staff ticket details
* Ticket assignment and priority management
* Public comments and internal notes
* Administrator user management
* User search, role filtering, sorting, activate/deactivate, and editing
* Responsive UI for desktop, tablet, and mobile
* Zen Green UI design

## User Roles

The system has three roles:

* **REQUESTER** — creates and manages own support tickets
* **IT_STAFF** — views and manages assigned IT support tickets
* **ADMINISTRATOR** — manages system users

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Bootstrap

### Backend

* Node.js
* Express
* TypeScript
* Prisma
* PostgreSQL

### Testing

* Vitest
* React Testing Library
* Supertest
* Playwright

## Running the Project

### Server

```powershell
cd server
npm install
npm run dev
```

The server runs on:

```text
http://localhost:3000
```

### Client

Open another terminal:

```powershell
cd client
npm install
npm run dev
```

The client runs on:

```text
http://localhost:5173
```

## Testing

### Server tests

```powershell
cd server
npm test
```

### Client tests

```powershell
cd client
npm test
```

### Client production build

```powershell
npm run build
```

### Lab 3 E2E tests

From the project root:

```powershell
npx playwright test e2e/lab-03
```

## Lab 3 Documentation

Lab 3 documentation is available in:

```text
docs/lab-03/
```

It contains:

* `specification.md` — Lab 3 specification and acceptance criteria
* `tests.md` — test plan, results, and traceability
* `ui-spec.md` — UI and responsive design specification
* `api-spec.md` — API specification
* `reviewer.md` — peer review record
* `ai-use.md` — AI use and reflection

## Repository Structure

```text
toktickit/
├── client/
│   ├── src/
│   └── tests/
│       └── lab-03/
├── server/
│   ├── src/
│   └── tests/
│       └── lab-03/
├── docs/
│   └── lab-03/
├── e2e/
│   └── lab-03/
├── artifacts/
│   └── lab-03/
│       └── screenshots/
├── package.json
├── playwright.config.ts
└── README.md
```

## Lab 3 Verification

The final Lab 3 verification includes:

* Server tests: **84/84 passed**
* Client Lab 3 tests: **31/31 passed**
* Lab 3 E2E tests: **3/3 passed**
* Production build: **passed**
* Responsive evidence: **12 screenshots**
 