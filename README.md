# TokTickIT - IT Support Ticketing System

TokTickIT is a web-based IT support ticketing system developed as part of the CPE334 Software Engineering course at King Mongkut's University of Technology Thonburi (KMUTT).

The project was developed incrementally from Lab 1 to Lab 4, covering software requirements, system design, implementation, testing, and integration.

## Project Overview

TokTickIT provides a platform for managing IT support requests between Requesters, IT Staff, and Administrators. Users can create and track support tickets, communicate about technical problems, manage ticket assignments, record troubleshooting activities, and monitor ticket progress.

## Development Labs

### Lab 1 - Project Foundation

Established the initial project foundation and organized the work for the TokTickIT system.

### Lab 2 - Requester Ticketing MVP and UI Foundation

Introduced the initial ticketing functionality and user interface.

- Requester ticket creation.
- Ticket information and category selection.
- Ticket system selection.
- Ticket priority and description.
- Attachment support.
- Ticket listing and filtering.
- Basic requester interface.
- Initial UI foundation using the Zen Green design.

### Lab 3 - Authentication and Role-Based Management

Expanded the application with authentication and role-based functionality.

- Login using email and password.
- Initial password change.
- Role-based access control.
- Requester ticket management.
- IT Staff ticket queue and ticket details.
- Ticket assignment and priority management.
- Public Comments and Internal Notes.
- Administrator user management.
- User searching, filtering, sorting, editing, and activation/deactivation.
- Responsive interface for desktop, tablet, and mobile.

### Lab 4 - Actions Taken, Ticket Workflow, and Dashboards

Extended the ticketing system with operational tracking and dashboard functionality.

- Actions Taken records associated with support tickets.
- Authorized IT Staff and Administrators can create and update Actions Taken.
- Requesters can view Actions Taken for their own tickets without editing them.
- Action performer information is associated with the authenticated user.
- Ticket status transitions are validated by the backend.
- Requester personal dashboard.
- IT Staff operational dashboard.
- Navigation to assigned tickets.
- Frontend, backend, and Playwright end-to-end regression testing.

## User Roles

| Role | Responsibilities |
|---|---|
| REQUESTER | Creates and manages personal support tickets and views ticket updates. |
| IT_STAFF | Handles support tickets, manages assignments and priorities, updates ticket status, and records Actions Taken. |
| ADMINISTRATOR | Manages system users and administrative operations. |

## Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Bootstrap

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL

### Testing
- Vitest
- React Testing Library
- Supertest
- Playwright

### Development Tools
- Git and GitHub
- Visual Studio Code
- npm

## Main Application Features

- Role-based authentication and authorization.
- Ticket creation and management.
- Ticket categories and affected systems.
- Ticket attachments.
- Ticket assignment and priority management.
- Public Comments and Internal Notes.
- Actions Taken tracking.
- Ticket status workflow.
- Requester and IT Staff dashboards.
- Administrator user management.
- Responsive user interface.

## Project Setup

### Requirements

- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the repository

```powershell
git clone <repository-url>
cd toktickit
```

### 2. Install dependencies

Install root dependencies:

```powershell
npm install
```

Install backend dependencies:

```powershell
cd server
npm install
cd ..
```

Install frontend dependencies:

```powershell
cd client
npm install
cd ..
```

### 3. Configure environment variables

Configure the required environment variables using the project's environment configuration.

Make sure PostgreSQL is running and the database connection is configured correctly.

Do not commit `.env` files, passwords, database credentials, or other secrets.

### 4. Start the backend

Open a terminal:

```powershell
cd server
npm run dev
```

Backend address:

```text
http://localhost:3000
```

### 5. Start the frontend

Open another terminal:

```powershell
cd client
npm run dev
```

Frontend address:

```text
http://localhost:5173
```

## Testing

### Backend Tests

Run from the server directory:

```powershell
cd server
npm test
```

### Frontend Tests

Run from the client directory:

```powershell
cd client
npm test
```

### Frontend Production Build

```powershell
cd client
npm run build
```

### Lab 4 End-to-End Tests

Run from the project root:

```powershell
npx playwright test e2e/lab-04
```

Run with a visible browser:

```powershell
npx playwright test e2e/lab-04 --headed
```

The Playwright configuration uses Chromium and the frontend base URL `http://localhost:5173`.

## Documentation

Project specifications, testing documents, and review records are organized under:

```text
docs/
├── lab-03/
└── lab-04/
```

Lab 4 documentation includes:

- `specification.md` - requirements and acceptance criteria.
- `api-spec.md` - API specification.
- `ui-spec.md` - UI specification.
- `tests.md` - test plan and test results.
- `ai-use.md` - AI use and reflection.
- `reviewer.md` - peer review and integration record.

## Test Evidence and Screenshots

Lab 4 Playwright screenshots are stored in:

```text
artifacts/lab-04/screenshots/
```

They provide visual evidence for Actions Taken, requester read-only access, dashboards, and ticket status updates.

## Repository Structure

```text
toktickit/
├── client/
│   ├── src/
│   └── tests/
├── server/
│   ├── src/
│   └── tests/
├── docs/
│   ├── lab-03/
│   └── lab-04/
├── e2e/
│   └── lab-04/
├── artifacts/
│   └── lab-04/
│       └── screenshots/
├── package.json
├── package-lock.json
├── playwright.config.ts
└── README.md
```

## Project Verification

Verification results should be recorded separately for each lab and test category.

For Lab 4, record the actual results of:

- Backend tests.
- Frontend tests.
- Frontend production build.
- Playwright end-to-end tests.

Only report test counts and results that have been confirmed by actual test execution.

