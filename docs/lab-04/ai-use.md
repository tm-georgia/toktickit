# TokTickIT Lab 4 AI Use and Reflection

## 1. LLM Used

- Tool: ChatGPT
- Model: [Enter the actual model used for this work]
- Purpose: Requirements analysis, specification drafting, test planning,
  implementation support, debugging, and review preparation.

## 2. Selected Prompts

The following prompts represent the types of prompts used during Lab 4.
The final submission should retain only prompts that accurately represent
the work performed.

### Prompt 1 — Requirements Analysis

"Read the Lab 4 assignment requirements and organize the required work into
functional requirements, business rules, acceptance criteria, and a definition
of done. Do not add features outside the approved scope."

### Prompt 2 — Actions Taken Data Model

"Propose a parent-child data model for Actions Taken under a Ticket. Include
the performer relationship, validation rules, indexes, migration safety, and
how existing Tickets with no Actions Taken should behave."

### Prompt 3 — Authorization

"Create an authorization matrix for Requester, IT Staff, and Administrator
operations. Explain how backend authorization prevents a user from accessing
another Requester's Ticket or changing the performer identity."

### Prompt 4 — Ticket Workflow

"Create a testable Ticket status-transition matrix for the supported statuses.
Identify which roles may perform each transition and explain how the backend
rejects invalid or stale updates."

### Prompt 5 — Dashboard Calculations

"Define precise Requester and IT Staff dashboard metrics, including query
scope, empty results, date boundaries, and drill-down destinations. Ensure
metrics are calculated from authoritative database records."

### Prompt 6 — Test DD

"Create a test plan that maps every acceptance criterion to unit, API,
authorization, UI, responsive, migration/regression, performance-smoke, and
end-to-end tests. Mark tests as planned until they have actually run."

### Prompt 7 — Implementation Review

"Review the proposed implementation against the approved specification.
Identify missing requirements, unsafe authorization, data-loss risks, incorrect
dashboard calculations, and regression risks. Do not claim that code or tests
work without evidence."

### Prompt 8 — Debugging

"Analyze this error and the relevant code. Explain the root cause, propose the
smallest safe change, and identify which existing behavior and tests must be
checked before applying it."

### Prompt 9 — UI and Accessibility

"Review the dashboard and Actions Taken UI for responsive behavior, keyboard
focus, accessible labels, clear validation, status visibility, and consistency
with the existing Zen Green design. Do not invent UI controls that have no
working behavior."

### Prompt 10 — Final Regression

"Create a final regression checklist for authentication, Ticket ownership,
attachments, Public Comments, Internal Notes, IT Staff features, Administrator
user management, Actions Taken, Ticket workflow, and dashboards. Include
commands and evidence needed to verify each area."

## 3. Specification-Agent Use

AI assistance was used to organize the assignment into a structured engineering
contract. The specification was reviewed for:
- Requirements traceability.
- Business-rule consistency.
- Authorization boundaries.
- Database and migration safety.
- Dashboard calculation definitions.
- Acceptance criteria and testability.

The final decisions must be checked against the assignment handout and the
actual application. AI-generated suggestions are not treated as verified
implementation facts.

## 4. Coding-Agent Use

AI assistance may be used to:
- Explain existing code and error messages.
- Suggest small implementation changes.
- Draft tests from acceptance criteria.
- Identify authorization and validation gaps.
- Review responsive and accessibility behavior.
- Help interpret test output.

Code changes must be reviewed, run, and tested before being treated as complete.
The coding agent must not silently change unrelated features, reset the
database, remove existing data, or claim success without evidence.

## 5. My Reflection

AI was useful for breaking a large assignment into smaller requirements,
business rules, acceptance criteria, and tests. This made it easier to connect
the specification to implementation and evidence.

However, AI-generated code and specifications still require careful checking.
A proposed endpoint may not match the existing route structure, a suggested
status transition may conflict with an existing business rule, and a passing
single test does not prove that the whole application works. Database migrations
and authorization rules need particular care because a mistake can affect
existing data or expose information to the wrong user.

My approach was to use AI as a support tool rather than accept every suggestion
automatically. I reviewed the proposed changes against the assignment,
checked the existing project conventions, ran relevant tests, and recorded
actual results instead of assuming that generated code was correct.

## 6. Evidence and Limitations

- Record the actual LLM/model used.
- Retain prompts that were actually used.
- Identify significant AI-assisted code or test changes where required by the
  course.
- Verify generated code through review and execution.
- Do not describe unexecuted tests as passing.
- Do not present proposed design decisions as implemented features until they
  are verified.