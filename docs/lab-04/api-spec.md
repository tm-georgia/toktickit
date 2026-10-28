# TokTickIT Lab 4 API Specification

## 1. General Rules

- All endpoints use the application's existing authentication mechanism.
- The authenticated session determines the current user and role.
- The backend enforces authorization, ownership, validation, and workflow rules.
- Client-supplied user IDs must not override the authenticated identity.
- Preserve existing API response conventions where practical.
- Dashboard endpoints return concise summaries rather than entire Ticket collections.
- Do not expose passwords, secrets, stack traces, or internal database errors.

The paths below are proposed names. Align them with the existing Express routes
before implementation.

## 2. Actions Taken Data Contract

### 2.1 Action Taken Fields

A response may contain:

- `id`: identifier
- `ticketId`: parent Ticket identifier
- `actionDateTime`: date/time of the recorded action
- `actionDescription`: description of work performed
- `result`: outcome of the work
- `performedBy`: safe public representation of the authenticated performer
- `followUpRequired`: boolean
- `followUpNote`: string or null
- `attachmentNotes`: string or null
- `createdAt`: record creation timestamp
- `updatedAt`: record update timestamp

Do not return private account fields or authentication data.

### 2.2 List Actions Taken

**Proposed endpoint:** `GET /api/tickets/:ticketId/actions-taken`

Authorization:
- IT Staff and Administrators may read records for Tickets they are authorized
  to access.
- Requesters may read records only for their own Tickets.

Success:
- `200 OK`
- Return an ordered list of Actions Taken belonging to the requested Ticket.
- If no actions exist, return an empty list.

Errors:
- `401 Unauthorized`: no valid authenticated session.
- `403 Forbidden`: the user is not authorized to access the Ticket.
- `404 Not Found`: the Ticket does not exist, according to the application's
  safe resource-disclosure policy.

### 2.3 Create Action Taken

**Proposed endpoint:** `POST /api/tickets/:ticketId/actions-taken`

Example request:

    {
      "actionDateTime": "2026-10-24T09:30:00.000Z",
      "actionDescription": "Checked the network connection.",
      "result": "Connection restored.",
      "followUpRequired": false,
      "followUpNote": null,
      "attachmentNotes": "No additional file."
    }

The example date/time is illustrative. The client must submit a valid date/time
in the agreed format.

The request must not set `performedBy` or override the authenticated performer.

Authorization:
- IT Staff and Administrators with access to the Ticket may create a record.
- Requesters may not create a record.

Validation:
- Ticket must exist.
- Action Date/Time must be valid.
- Action Description must not be empty.
- Result must not be empty.
- Follow-Up Required must be a boolean.
- Follow-Up Note is required when Follow-Up Required is true.
- Field lengths must follow the project's validation conventions.

Success:
- `201 Created`
- Return the saved Action Taken, including the authenticated performer.

Errors:
- `400 Bad Request`: invalid fields or failed validation.
- `401 Unauthorized`: no valid session.
- `403 Forbidden`: insufficient permission.
- `404 Not Found`: Ticket not found.
- `409 Conflict`: duplicate or conflicting submission when detected.
- `500 Internal Server Error`: safe generic error response.

### 2.4 Update Action Taken

**Proposed endpoint:** `PATCH /api/tickets/:ticketId/actions-taken/:actionId`

Example request:

    {
      "actionDescription": "Rechecked the network connection.",
      "result": "Connection is stable.",
      "followUpRequired": true,
      "followUpNote": "Confirm stability with the Requester tomorrow.",
      "attachmentNotes": "Refer to the connection test screenshot."
    }

Only permitted fields may be updated. The backend must verify that the Action
Taken belongs to the Ticket in the URL and that the user is authorized.

The client must not replace the performer identity by supplying another user ID.

Success:
- `200 OK`
- Return the updated Action Taken.

Errors:
- `400 Bad Request`: invalid fields.
- `401 Unauthorized`: no valid session.
- `403 Forbidden`: insufficient permission.
- `404 Not Found`: Ticket or Action Taken not found.
- `409 Conflict`: stale update or concurrent modification.

No delete endpoint is required unless it is explicitly approved in the
engineering contract.

## 3. Requester Dashboard

**Proposed endpoint:** `GET /api/dashboard/requester`

The server derives the Requester identity from the authenticated session.

Example response:

    {
      "metrics": {
        "openTickets": 0,
        "waitingForRequester": 0,
        "recentlyUpdated": 0,
        "recentlyResolved": 0
      },
      "recentTickets": [],
      "attentionTickets": []
    }

The values above illustrate the response shape only; they are not live data.

Required behavior:
- Return only data belonging to the authenticated Requester.
- Calculate metrics using database queries.
- Return concise Ticket summaries.
- Return zero counts and empty arrays when no records match.
- Use a documented list limit and date/time policy.
- Do not trust a Requester ID supplied by the browser.

Success:
- `200 OK`

Errors:
- `401 Unauthorized`: no valid session.
- `403 Forbidden`: user role is not permitted to access this dashboard.
- `500 Internal Server Error`: safe generic error response.

## 4. IT Staff Dashboard

**Proposed endpoint:** `GET /api/dashboard/staff`

Administrators may access the staff dashboard if permitted by the role policy.

Example response:

    {
      "metrics": {
        "unassignedTickets": 0,
        "myTickets": 0,
        "byStatus": {},
        "byITPriority": {}
      },
      "recentTickets": [],
      "myRecentActions": []
    }

The values above illustrate the response shape only; they are not live data.

Required behavior:
- Calculate counts from authoritative database records.
- Use the authenticated user to calculate My Tickets and current-user actions.
- Define the Ticket scope used for grouped counts.
- Exclude statuses according to the approved metric definitions.
- Return empty arrays and zero counts when no records match.
- Provide enough identifiers and summary fields for UI drill-down.
- Do not return the entire Ticket table.

Success:
- `200 OK`

Errors:
- `401 Unauthorized`: no valid session.
- `403 Forbidden`: role is not permitted.
- `500 Internal Server Error`: safe generic error response.

## 5. Ticket Workflow

Use the existing Ticket update endpoint if it already supports status changes.
Do not introduce a second competing status-update route without a reason.

A workflow request must:
- identify the requested next status;
- validate that the transition is allowed from the current status;
- validate the user's role and Ticket access;
- enforce all resolution prerequisites on the backend;
- detect or safely reject stale updates;
- return the updated Ticket summary after success.

The backend is authoritative even if a client manually sends an unauthorized
status or bypasses the UI.

### 5.1 Conflict Detection

Use the project's established concurrency approach. If optimistic concurrency
is added, the request must provide the expected version or equivalent update
token. The backend must compare it with the current record before saving.

If the record has changed since it was loaded:
- do not silently overwrite the newer value;
- return `409 Conflict`;
- provide a safe message asking the user to reload the latest Ticket.

Do not add a version field without implementing and testing the complete
read-update-conflict flow.

## 6. Authorization Summary

| Operation | Requester | IT Staff | Administrator |
|---|---|---|---|
| Read Actions Taken for own Ticket | Yes | If authorized | Yes |
| Read Actions Taken for another Requester's Ticket | No | If authorized | Yes |
| Create Actions Taken | No | If authorized | Yes |
| Update Actions Taken | No | If authorized | Yes |
| Read Requester dashboard | Own data | No, unless explicitly approved | No, unless explicitly approved |
| Read IT Staff dashboard | No | Yes | Yes, if permitted |
| Change Ticket status | Only explicitly permitted transitions | Approved transitions | Approved transitions |

Every permission must be enforced by the backend.

## 7. Error Response Convention

Use the existing API error format where possible. The logical error structure
should communicate a safe message and, where useful, a field-level validation
summary.

Do not return:
- stack traces;
- SQL or Prisma internals;
- passwords or tokens;
- sensitive information about another user's Ticket.

Expected status codes:
- `200 OK`: successful read or update.
- `201 Created`: successful creation.
- `400 Bad Request`: invalid request or validation failure.
- `401 Unauthorized`: unauthenticated request.
- `403 Forbidden`: authenticated but not permitted.
- `404 Not Found`: resource not found.
- `409 Conflict`: stale update or detected conflicting operation.
- `500 Internal Server Error`: unexpected failure with a safe message.

## 8. Duplicate Requests and Retries

Disable repeat submission in the UI while a request is pending. The backend
must safely handle repeated or conflicting requests according to the operation.

Do not assume that disabling a button alone prevents duplicates. Add an
idempotency mechanism only if its behavior and storage are explicitly defined
and tested.

## 9. API Tests Required

- Valid Action Taken creation.
- Missing required fields.
- Follow-Up Note required when follow-up is true.
- Authenticated performer is saved automatically.
- Requester cannot create or update Actions Taken.
- Requester cannot read another user's Actions Taken.
- IT Staff cannot access unauthorized Tickets.
- Action Taken must belong to the Ticket in the URL.
- Missing Ticket and missing Action Taken behavior.
- Requester dashboard ownership isolation.
- Staff dashboard metric correctness.
- Empty dashboard results.
- Invalid status transitions.
- Resolution feedback does not directly set Resolved.
- Stale or concurrent update conflict.
- Safe error response for unexpected failures.