\# TokTickIT Lab 3 API Specification



\*\*Course:\*\* CPE334 Introduction to Software Engineering in the Age of AI Agents

\*\*Lab:\*\* 3 — TokTickIT Users, Roles, IT Staff Ticketing, and Admin Screens

\*\*Base Increment:\*\* Lab 2

\*\*API Style:\*\* REST

\*\*Authentication:\*\* Server-managed authenticated session

\*\*Database:\*\* PostgreSQL with Prisma



\---



\## 1. API Goals



The Lab 3 API extends the completed Lab 2 API to support real authentication, role-based authorization, IT Staff Ticket operations, Public Comments, Internal Notes, and Administrator User Management.



All protected operations must be authorized by the backend. Frontend controls must not be treated as security controls.



The API must preserve existing Lab 2 Ticket and Attachment behavior while replacing the temporary Development Requester identity with the authenticated User identity.



\---



\## 2. Roles



Lab 3 supports exactly one role per User.



| Role          | Value           | Main API Capabilities                                                                        |

| ------------- | --------------- | -------------------------------------------------------------------------------------------- |

| Requester     | `REQUESTER`     | Own Tickets, Attachments, Public Comments, Problem Appears Resolved                          |

| IT Staff      | `IT\_STAFF`      | Ticket Queue, Ticket Detail, ownership, IT Priority, status, Public Comments, Internal Notes |

| Administrator | `ADMINISTRATOR` | User Management and permitted account operations                                             |



The backend must enforce these permissions.



\---



\## 3. Authentication and Session



\### 3.1 Authentication Mechanism



TokTickIT will use a server-managed authenticated session.



After successful login:



1\. The backend creates an authenticated session.

2\. The session identifier is returned through an HttpOnly cookie.

3\. The browser automatically sends the cookie with authenticated requests.

4\. The client does not store passwords, password hashes, or session secrets in local storage.

5\. The backend determines the authenticated User from the session.



The exact session implementation must follow the security capabilities of the existing course stack.



\### 3.2 Cookie Requirements



The authentication cookie should use:



\* `HttpOnly`

\* Appropriate `SameSite`

\* `Secure` in HTTPS environments

\* A defined expiration or idle timeout

\* Server-side invalidation on logout



Development configuration may allow HTTP on localhost where required.



\### 3.3 Password Storage



Passwords must never be stored as plaintext.



The database stores only a secure password hash.



Password hashing must use a suitable password-hashing algorithm supported by the project stack.



\### 3.4 Session Expiration



Authenticated sessions must have a defined expiration policy.



An expired session is treated as unauthenticated and must not access protected resources.



\### 3.5 Logout



Logout invalidates the current authenticated session.



After logout, protected endpoints must reject the previous session.



\---



\# 4. Common API Conventions



\## 4.1 Base URL



The existing server base URL is used.



For local development:



```text

http://localhost:3000

```



The exact API prefix must follow the existing Lab 2 server conventions.



\---



\## 4.2 JSON



JSON is the default request and response format unless otherwise specified.



Successful responses should return predictable JSON objects.



\---



\## 4.3 Common HTTP Status Codes



| Status                      | Meaning                                                                 |

| --------------------------- | ----------------------------------------------------------------------- |

| `200 OK`                    | Successful retrieval or update                                          |

| `201 Created`               | Successful creation                                                     |

| `204 No Content`            | Successful operation with no response body                              |

| `400 Bad Request`           | Invalid request format or validation                                    |

| `401 Unauthorized`          | Missing or invalid authentication                                       |

| `403 Forbidden`             | Authenticated user lacks permission                                     |

| `404 Not Found`             | Resource unavailable to the authenticated user                          |

| `409 Conflict`              | Resource conflicts, such as duplicate email                             |

| `422 Unprocessable Entity`  | Structurally valid request with invalid business data, when appropriate |

| `500 Internal Server Error` | Unexpected server failure                                               |



The implementation should use the smallest consistent set required by the existing project conventions.



\---



\## 4.4 Safe Error Response



Protected APIs must not leak sensitive information.



The general error shape is:



```json

{

&#x20; "error": {

&#x20;   "code": "ERROR\_CODE",

&#x20;   "message": "Safe human-readable message"

&#x20; }

}

```



Authentication and authorization errors must not expose:



\* Password hashes.

\* Session identifiers.

\* Internal stack traces.

\* Database details.

\* Another user's protected Ticket existence.

\* Internal Note content.

\* Sensitive account information.



\---



\# 5. Authentication API



\## 5.1 Login



\### Endpoint



```http

POST /auth/login

```



\### Request



```json

{

&#x20; "email": "user@example.com",

&#x20; "password": "ExamplePassword123!"

}

```



\### Validation



\* Email is required.

\* Email must have a valid format.

\* Password is required.

\* Empty or whitespace-only values are rejected.



\### Success



```http

200 OK

```



Example:



```json

{

&#x20; "user": {

&#x20;   "id": "user-id",

&#x20;   "name": "Example User",

&#x20;   "email": "user@example.com",

&#x20;   "role": "REQUESTER",

&#x20;   "isActive": true,

&#x20;   "mustChangePassword": false

&#x20; }

}

```



The response must not contain the password or password hash.



\### Initial Password



If the account requires a password change:



```json

{

&#x20; "user": {

&#x20;   "id": "user-id",

&#x20;   "name": "Example User",

&#x20;   "email": "user@example.com",

&#x20;   "role": "REQUESTER",

&#x20;   "isActive": true,

&#x20;   "mustChangePassword": true

&#x20; }

}

```



The authenticated session may be established, but normal application APIs must remain unavailable until the password is changed.



\### Invalid Credentials



```http

401 Unauthorized

```



Use a safe message such as:



```json

{

&#x20; "error": {

&#x20;   "code": "INVALID\_CREDENTIALS",

&#x20;   "message": "Invalid email or password."

&#x20; }

}

```



The response must not reveal whether the email exists.



\### Inactive Account



An inactive account must not authenticate.



The response must use safe account-state feedback without exposing unnecessary account information.



\---



\# 6. Logout API



\### Endpoint



```http

POST /auth/logout

```



\### Authentication



Authenticated session required.



\### Success



```http

204 No Content

```



The server invalidates the session.



After logout, protected API requests using the old session must return:



```http

401 Unauthorized

```



\---



\# 7. Current User API



\### Endpoint



```http

GET /auth/me

```



\### Authentication



Authenticated session required.



\### Success



```http

200 OK

```



Example:



```json

{

&#x20; "user": {

&#x20;   "id": "user-id",

&#x20;   "name": "Example User",

&#x20;   "email": "user@example.com",

&#x20;   "role": "IT\_STAFF",

&#x20;   "isActive": true,

&#x20;   "mustChangePassword": false

&#x20; }

}

```



The response must not contain the password hash.



\### Unauthenticated



```http

401 Unauthorized

```



\---



\# 8. Change Initial Password API



\### Endpoint



```http

POST /auth/change-password

```



\### Authentication



Authenticated session required.



A user whose account requires a password change may access this endpoint before entering the normal application.



\### Request



```json

{

&#x20; "currentPassword": "InitialPassword123!",

&#x20; "newPassword": "NewPassword123!",

&#x20; "confirmPassword": "NewPassword123!"

}

```



\### Validation



The API must validate:



\* Current password.

\* New password.

\* Password confirmation.

\* Password policy.

\* New password differs from the current password where required by the approved policy.



\### Success



```http

200 OK

```



Example:



```json

{

&#x20; "user": {

&#x20;   "id": "user-id",

&#x20;   "name": "Example User",

&#x20;   "email": "user@example.com",

&#x20;   "role": "REQUESTER",

&#x20;   "isActive": true,

&#x20;   "mustChangePassword": false

&#x20; }

}

```



After successful change, the user may access normal application APIs.



\### Invalid Password



```http

400 Bad Request

```



or:



```http

401 Unauthorized

```



according to the final implementation convention.



No password information is returned.



\---



\# 9. Protected Requester APIs



Lab 3 retains the Lab 2 Ticket and Attachment capabilities.



The key change is that Requester identity is obtained from the authenticated session.



A client-provided `requesterId` must not override the authenticated identity.



\---



\## 9.1 List My Tickets



\### Endpoint



```http

GET /tickets

```



\### Authentication



Authenticated Requester required.



\### Query Parameters



Existing Lab 2 query parameters may continue to be supported, including:



```text

search

categoryId

relatedSystemId

priority

status

sort

page

pageSize

```



The exact existing Lab 2 behavior remains unchanged unless explicitly extended by Lab 3.



\### Ownership



The backend determines the Requester from the authenticated session.



Example:



```text

Authenticated User = U001

```



The query must return only Tickets owned by `U001`.



A client request such as:



```text

/tickets?requesterId=U002

```



must not return U002's Tickets.



\---



\## 9.2 Create Ticket



\### Endpoint



```http

POST /tickets

```



\### Authentication



Authenticated Requester required.



The Ticket's Requester identity is taken from the authenticated session.



The client must not choose another Requester identity.



Existing Lab 2 validation remains in force, including:



\* Summary length.

\* Description length.

\* Category.

\* Related System.

\* Requested Priority.

\* Attachments where applicable.



\---



\## 9.3 Get Ticket



\### Endpoint



```http

GET /tickets/:ticketId

```



\### Authentication



Authenticated Requester required.



\### Authorization



The backend must return the Ticket only when the authenticated Requester owns it.



Unauthorized or inaccessible Tickets must not expose whether another user's Ticket exists.



\---



\## 9.4 Attachment APIs



Existing Lab 2 Attachment APIs continue to use authenticated ownership.



A Requester may access only Attachments belonging to their permitted Tickets.



A client-supplied requester identity must not bypass ownership checks.



\---



\# 10. Problem Appears Resolved API



\### Endpoint



```http

POST /tickets/:ticketId/problem-appears-resolved

```



\### Authentication



Authenticated Requester required.



\### Authorization



The Requester must own the Ticket.



\### Success



```http

200 OK

```



Example:



```json

{

&#x20; "ticketId": "ticket-id",

&#x20; "problemAppearsResolved": true

}

```



This action does not formally set the Ticket status to `Resolved` or `Closed`.



\---



\# 11. Public Comments API



Public Comments are visible to permitted Requesters, IT Staff, and Administrators.



They are append-only in Lab 3.



\---



\## 11.1 Create Public Comment



\### Endpoint



```http

POST /tickets/:ticketId/comments

```



\### Authentication



Authenticated user required.



\### Authorization



The user must have permission to access the Ticket.



Permitted roles:



\* Requester

\* IT Staff

\* Administrator



Requester access is restricted to their own Tickets.



\### Request



```json

{

&#x20; "content": "The issue is still happening."

}

```



\### Validation



\* Content is required.

\* Whitespace-only content is rejected.

\* Content length must be within the configured Lab 3 limit.

\* Content must be safely rendered.



\### Success



```http

201 Created

```



Example:



```json

{

&#x20; "comment": {

&#x20;   "id": "comment-id",

&#x20;   "ticketId": "ticket-id",

&#x20;   "author": {

&#x20;     "id": "user-id",

&#x20;     "name": "Example User",

&#x20;     "role": "REQUESTER"

&#x20;   },

&#x20;   "content": "The issue is still happening.",

&#x20;   "createdAt": "2026-09-18T00:00:00.000Z"

&#x20; }

}

```



The author and creation time are determined by the backend.



\---



\## 11.2 Get Public Comments



\### Endpoint



```http

GET /tickets/:ticketId/comments

```



\### Authentication



Authenticated user required.



\### Authorization



The user must have permission to view the Ticket.



Internal Notes must never be included in this response.



\### Success



```http

200 OK

```



\---



\# 12. Internal Notes API



Internal Notes are private operational records.



They are visible only to IT Staff and Administrators.



They are append-only in Lab 3.



\---



\## 12.1 Create Internal Note



\### Endpoint



```http

POST /tickets/:ticketId/notes

```



\### Authentication



Authenticated IT Staff or Administrator required.



\### Request



```json

{

&#x20; "content": "Checked the VPN gateway configuration."

}

```



\### Validation



\* Content is required.

\* Whitespace-only content is rejected.

\* Content length must be within the configured limit.

\* Content must be safely rendered.



\### Success



```http

201 Created

```



Example:



```json

{

&#x20; "note": {

&#x20;   "id": "note-id",

&#x20;   "ticketId": "ticket-id",

&#x20;   "author": {

&#x20;     "id": "user-id",

&#x20;     "name": "IT Staff User",

&#x20;     "role": "IT\_STAFF"

&#x20;   },

&#x20;   "content": "Checked the VPN gateway configuration.",

&#x20;   "createdAt": "2026-09-18T00:00:00.000Z"

&#x20; }

}

```



\---



\## 12.2 Get Internal Notes



\### Endpoint



```http

GET /tickets/:ticketId/notes

```



\### Authentication



Authenticated IT Staff or Administrator required.



\### Requester Behavior



A Requester must receive:



```http

403 Forbidden

```



or another approved safe authorization response without exposing note content.



The API must not return Internal Notes to Requesters.



\---



\# 13. IT Staff Ticket Queue API



\## 13.1 Get Queue



\### Endpoint



```http

GET /staff/tickets

```



\### Authentication



Authenticated IT Staff required.



\### Query Parameters



The Queue API supports:



```text

search

status

requestedPriority

itPriority

ownerId

categoryId

relatedSystemId

sort

page

pageSize

```



The final supported fields must remain consistent with `ui-spec.md`.



\### Search



The default searchable fields are:



\* Ticket Number.

\* Summary.



Additional fields may be added if justified without creating an unnecessarily complex queue.



\### Filters



Supported filters include:



\* Status.

\* Requested Priority.

\* IT Priority.

\* Owner.

\* Category.

\* Related System.



\### Sorting



The API shall support defined sort values.



Planned values:



```text

updatedDesc

ticketDate

ticketNumber

requestedPriority

itPriority

status

```



Invalid sort values must be rejected safely.



\### Pagination



The API shall support:



```text

page

pageSize

```



Allowed page sizes:



```text

10

20

50

```



The response includes pagination metadata.



\### Example Response



```json

{

&#x20; "items": \[

&#x20;   {

&#x20;     "id": "ticket-id",

&#x20;     "ticketNumber": "TCK-20260918-0001",

&#x20;     "summary": "VPN connection failure",

&#x20;     "category": {

&#x20;       "id": "category-id",

&#x20;       "name": "Network"

&#x20;     },

&#x20;     "requestedPriority": "HIGH",

&#x20;     "itPriority": "HIGH",

&#x20;     "status": "IN\_PROGRESS",

&#x20;     "owner": {

&#x20;       "id": "staff-id",

&#x20;       "name": "IT Staff User"

&#x20;     },

&#x20;     "updatedAt": "2026-09-18T00:00:00.000Z"

&#x20;   }

&#x20; ],

&#x20; "pagination": {

&#x20;   "page": 1,

&#x20;   "pageSize": 20,

&#x20;   "totalItems": 1,

&#x20;   "totalPages": 1

&#x20; }

}

```



\---



\# 14. IT Staff Ticket Detail API



\## 14.1 Get Ticket Detail



\### Endpoint



```http

GET /staff/tickets/:ticketId

```



\### Authentication



Authenticated IT Staff required.



\### Response



The response may include:



\* Ticket information.

\* Requester information permitted for IT Staff.

\* Category.

\* Related System.

\* Requested Priority.

\* IT Priority.

\* Status.

\* Owner.

\* Attachments.

\* Public Comments.

\* Internal Notes.



Private information must remain restricted according to role.



\---



\# 15. Ticket Ownership API



\## 15.1 Claim Ticket



\### Endpoint



```http

POST /staff/tickets/:ticketId/claim

```



\### Authentication



IT Staff required.



\### Behavior



The authenticated IT Staff user becomes the Ticket Owner.



\### Success



```http

200 OK

```



\---



\## 15.2 Assign or Reassign Ticket



\### Endpoint



```http

PATCH /staff/tickets/:ticketId/owner

```



\### Request



```json

{

&#x20; "ownerId": "staff-user-id"

}

```



\### Validation



The target owner must be an active permitted staff account.



An invalid or inactive owner must be rejected.



\### Success



```http

200 OK

```



The response returns the updated Ticket ownership.



\---



\## 15.3 Unassign Ticket



If unassignment is supported by the final UI and business rules:



```http

PATCH /staff/tickets/:ticketId/owner

```



with:



```json

{

&#x20; "ownerId": null

}

```



The implementation must define whether unassignment is permitted. The default Lab 3 workflow keeps an explicit unassigned state but does not require an unassign action.



\---



\# 16. IT Priority API



\### Endpoint



```http

PATCH /staff/tickets/:ticketId/it-priority

```



\### Authentication



IT Staff required.



\### Request



```json

{

&#x20; "itPriority": "HIGH"

}

```



Allowed values:



```text

LOW

MEDIUM

HIGH

```



\### Rule



Changing IT Priority must not change Requested Priority.



\### Success



```http

200 OK

```



\---



\# 17. Ticket Status API



\### Endpoint



```http

PATCH /staff/tickets/:ticketId/status

```



\### Authentication



IT Staff required.



\### Request



```json

{

&#x20; "status": "IN\_PROGRESS"

}

```



\### Allowed Status Values



```text

NEW

OPEN

IN\_PROGRESS

WAITING\_FOR\_REQUESTER

RESOLVED

CLOSED

REOPENED

CANCELLED

```



\### Transition Validation



The backend must validate the transition from the current status to the requested status.



For example:



```text

NEW → OPEN

```



is valid.



An unsupported transition such as:



```text

CLOSED → IN\_PROGRESS

```



must be rejected unless the approved transition matrix explicitly permits it.



\### Success



```http

200 OK

```



\---



\# 18. Administrator User Management API



All User Management APIs require an authenticated Administrator.



\---



\## 18.1 List Users



\### Endpoint



```http

GET /admin/users

```



\### Authentication



Administrator required.



\### Query Parameters



```text

search

role

```



`search` may match:



\* Name.

\* Email.



`role` is optional.



\### Example



```http

GET /admin/users?search=alice\&role=REQUESTER

```



\### Response



```json

{

&#x20; "users": \[

&#x20;   {

&#x20;     "id": "user-id",

&#x20;     "name": "Alice Example",

&#x20;     "email": "alice@example.com",

&#x20;     "role": "REQUESTER",

&#x20;     "isActive": true,

&#x20;     "mustChangePassword": false

&#x20;   }

&#x20; ]

}

```



Password hashes and authentication secrets must never be returned.



User-list pagination is not required for Lab 3.



\---



\# 19. Create User API



\### Endpoint



```http

POST /admin/users

```



\### Authentication



Administrator required.



\### Request



```json

{

&#x20; "name": "New User",

&#x20; "email": "newuser@example.com",

&#x20; "role": "REQUESTER",

&#x20; "isActive": true,

&#x20; "initialPassword": "InitialPassword123!"

}

```



\### Validation



\* Name is required.

\* Email is required and valid.

\* Email must be unique.

\* Role must be one of:



&#x20; \* `REQUESTER`

&#x20; \* `IT\_STAFF`

&#x20; \* `ADMINISTRATOR`

\* Initial password must satisfy the password policy.

\* User receives exactly one role.

\* Password must be hashed before storage.



\### Success



```http

201 Created

```



The created user is returned without the password or password hash.



The new user must have the appropriate initial-password-change state.



\### Duplicate Email



```http

409 Conflict

```



\---



\# 20. Update User API



\### Endpoint



```http

PATCH /admin/users/:userId

```



\### Authentication



Administrator required.



\### Request



```json

{

&#x20; "name": "Updated User",

&#x20; "email": "updated@example.com",

&#x20; "role": "IT\_STAFF",

&#x20; "isActive": true

}

```



All fields are optional for partial update, but at least one valid field must be provided.



\### Validation



\* Email must remain unique.

\* Role must be valid.

\* Name must be valid.

\* Activation state must obey Administrator safety rules.



\### Self-Deactivation



An Administrator cannot deactivate their own account.



The API returns:



```http

403 Forbidden

```



when the operation is not permitted.



\### Last Active Administrator



The system must not allow an operation that leaves zero active Administrators.



The API rejects the operation with a safe error.



\---



\# 21. Set New Initial Password API



\### Endpoint



```http

POST /admin/users/:userId/initial-password

```



\### Authentication



Administrator required.



\### Request



```json

{

&#x20; "initialPassword": "NewInitialPassword123!"

}

```



\### Behavior



The backend:



1\. Validates the new password.

2\. Hashes it.

3\. Stores only the password hash.

4\. Marks the account as requiring a password change.

5\. Does not expose the password in the response.



\### Success



```http

200 OK

```



Example:



```json

{

&#x20; "user": {

&#x20;   "id": "user-id",

&#x20;   "name": "Example User",

&#x20;   "email": "example@example.com",

&#x20;   "role": "REQUESTER",

&#x20;   "isActive": true,

&#x20;   "mustChangePassword": true

&#x20; }

}

```



\---



\# 22. Authorization Matrix



The backend shall enforce the following minimum matrix:



| API Capability           |     Requester | IT Staff | Administrator |

| ------------------------ | ------------: | -------: | ------------: |

| Login                    |        Public |   Public |        Public |

| Logout                   |             ✓ |        ✓ |             ✓ |

| Current User             |             ✓ |        ✓ |             ✓ |

| Change Password          |             ✓ |        ✓ |             ✓ |

| Own Tickets              |             ✓ |        — |             — |

| Own Attachments          |             ✓ |        — |             — |

| Public Comments          | Own/Permitted |        ✓ |             ✓ |

| Problem Appears Resolved |           Own |        — |             — |

| Staff Queue              |             — |        ✓ |             — |

| Staff Ticket Detail      |             — |        ✓ |             — |

| Claim Ticket             |             — |        ✓ |             — |

| Assign/Reassign Ticket   |             — |        ✓ |             — |

| IT Priority              |             — |        ✓ |             — |

| Ticket Status            |             — |        ✓ |             — |

| Internal Notes           |             — |        ✓ |             ✓ |

| List Users               |             — |        — |             ✓ |

| Create User              |             — |        — |             ✓ |

| Update User              |             — |        — |             ✓ |

| Set Initial Password     |             — |        — |             ✓ |



An unauthenticated request to any protected endpoint receives `401 Unauthorized`.



An authenticated user without permission receives `403 Forbidden`.



\---



\# 23. Safe Authorization Behavior



The backend must distinguish:



\### Unauthenticated



```http

401 Unauthorized

```



Used when no valid authenticated session exists.



\### Authenticated but Forbidden



```http

403 Forbidden

```



Used when the user is authenticated but lacks the required role or permission.



\### Invalid Input



```http

400 Bad Request

```



Used for malformed or invalid request values.



\### Missing or Inaccessible Resource



```http

404 Not Found

```



may be used where returning `404` prevents disclosure of another user's protected resource.



\### Conflict



```http

409 Conflict

```



Used for cases such as duplicate email addresses.



\### Unexpected Error



```http

500 Internal Server Error

```



The response must not contain stack traces, SQL errors, password information, or other internal implementation details.



\---



\# 24. Queue Query Contract



The IT Staff Ticket Queue supports:



\### Searchable



\* Ticket Number.

\* Summary.



\### Filterable



\* Status.

\* Requested Priority.

\* IT Priority.

\* Owner.

\* Category.

\* Related System.



\### Sortable



The initial supported values are:



```text

updatedDesc

ticketDate

ticketNumber

requestedPriority

itPriority

status

```



\### Pagination



Supported page sizes:



```text

10

20

50

```



Default:



```text

page = 1

pageSize = 20

sort = updatedDesc

```



Invalid page numbers, page sizes, filter values, or sort values must be rejected safely or normalized according to the final implementation decision.



\---



\# 25. Validation Rules



The API must validate all client input server-side.



Validation includes:



\* Required fields.

\* String length.

\* Whitespace-only values.

\* Email format.

\* Email uniqueness.

\* Role values.

\* Priority values.

\* Status values.

\* Status transitions.

\* User activation rules.

\* Ticket ownership.

\* Comment and note content.

\* Password policy.

\* Query parameters.



Frontend validation improves usability but does not replace backend validation.



\---



\# 26. Database and API Consistency



API changes must use the Prisma data model and migrations introduced for Lab 3.



The implementation must not recreate or discard the Lab 2 database.



Existing:



\* Categories.

\* Related Systems.

\* Tickets.

\* Attachments.



must remain valid.



The migration must preserve existing Requester Ticket ownership.



\---



\# 27. Security Requirements



The API implementation must satisfy the following:



1\. Passwords are never stored in plaintext.

2\. Password hashes are never returned to clients.

3\. Session secrets are never returned to clients.

4\. Authentication is required for protected endpoints.

5\. Role checks are performed server-side.

6\. Ownership checks are performed server-side.

7\. Client-supplied requester identity cannot override the authenticated identity.

8\. Internal Notes are never returned to Requesters.

9\. Protected resource existence must not be unnecessarily disclosed.

10\. Error responses must not contain stack traces or database details.

11\. Comment and note content must be safely rendered.

12\. Authentication secrets must not be committed to Git.

13\. Seed credentials are local-development credentials only.

14\. Logout invalidates authenticated access.

15\. Password-change requirements are enforced by the backend.



\---



\# 28. Regression Requirements



The Lab 3 API must preserve the completed Lab 2 behavior.



Regression verification must include:



\* Requester Ticket creation.

\* Requester Ticket retrieval.

\* Requester Ticket ownership.

\* Category retrieval.

\* Related System behavior.

\* Ticket validation.

\* Attachment upload.

\* Attachment retrieval.

\* Attachment ownership.

\* Attachment removal behavior.

\* Existing Ticket data after migration.



The temporary `requesterId` development mechanism must not be required for authenticated normal application behavior.



\---



\# 29. API Acceptance Traceability



| Acceptance Criterion | API Areas                     |

| -------------------- | ----------------------------- |

| AC-01                | Login                         |

| AC-02                | Login, Change Password        |

| AC-03                | Login                         |

| AC-04                | Logout, Protected APIs        |

| AC-05                | Requester Ticket APIs         |

| AC-06                | Internal Notes                |

| AC-07                | Staff Ticket Queue            |

| AC-08                | Ticket Ownership              |

| AC-09                | IT Priority                   |

| AC-10                | Ticket Status                 |

| AC-11                | Public Comments               |

| AC-12                | Internal Notes                |

| AC-13                | User List                     |

| AC-14                | Create User                   |

| AC-15                | User Create/Update            |

| AC-16                | Update User                   |

| AC-17                | Initial Password              |

| AC-18                | Administrator Safety          |

| AC-19                | Administrator Safety          |

| AC-20                | Authentication/Authorization  |

| AC-21                | Migration/Requester APIs      |

| AC-22                | UI/API support                |

| AC-23                | Validation and error handling |



\---



\# 30. Out of Scope API Operations



The following APIs shall not be implemented for Lab 3:



\* User deletion.

\* Bulk user operations.

\* User import.

\* User export.

\* Multiple roles per user.

\* Role history.

\* Account audit history.

\* Password-reset email.

\* Email invitation.

\* MFA.

\* Social login.

\* SSO.

\* Self-registration.

\* SLA calculation.

\* Escalation.

\* Notification services.

\* Actions Taken.

\* Advanced account recovery.

\* Organization or department management.



\---



\# 31. API Definition of Done



The Lab 3 API contract is considered ready for implementation when:



\* \[ ] Authentication endpoints are defined.

\* \[ ] Logout is defined.

\* \[ ] Current-user retrieval is defined.

\* \[ ] Mandatory password change is defined.

\* \[ ] Session behavior is documented.

\* \[ ] Requester ownership is based on authenticated identity.

\* \[ ] Lab 2 Ticket APIs are mapped to authenticated ownership.

\* \[ ] Attachment authorization is preserved.

\* \[ ] IT Staff Queue API is defined.

\* \[ ] IT Staff Ticket Detail API is defined.

\* \[ ] Ticket ownership APIs are defined.

\* \[ ] IT Priority API is defined.

\* \[ ] Status transition API is defined.

\* \[ ] Public Comment APIs are defined.

\* \[ ] Internal Note APIs are defined.

\* \[ ] Administrator User Management APIs are defined.

\* \[ ] Duplicate email handling is defined.

\* \[ ] Administrator safety rules are defined.

\* \[ ] Authentication and authorization errors are defined.

\* \[ ] Validation rules are defined.

\* \[ ] Safe error behavior is defined.

\* \[ ] Queue search, filters, sorting, and pagination are defined.

\* \[ ] API acceptance criteria are traceable.

\* \[ ] No excluded Lab 3 functionality is included accidentally.



\---



\## 32. Implementation Note



This document is the API contract for Lab 3 implementation. Exact route registration, controller/service structure, Prisma queries, session-library configuration, and test implementation must conform to this contract while following the existing TokTickIT project architecture.



If an implementation detail must change during development, the engineering contract must be updated before the implementation is treated as complete.



