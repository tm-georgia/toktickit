# Lab 2 REST API Specification

## 1. API Conventions

### Base URL
All API routes are prefixed with `/api`.

### Content Types
- Standard JSON endpoints: `Content-Type: application/json`
- File upload endpoint: `Content-Type: multipart/form-data`
- File download endpoint: binary stream with corresponding `Content-Type` and `Content-Disposition` header

### Requester Context Header
Because real authentication is excluded until Lab 3, the client communicates the active Development Requester testing identity using the custom HTTP header:

```http
X-Requester-Id: <integer>
```

- Every requester-scoped endpoint (`GET /api/tickets`, `GET /api/tickets/:id`, `POST /api/tickets`, `POST /api/tickets/:id/attachments`, `GET /api/attachments/:id/download`, `DELETE /api/attachments/:id`) **must** receive `X-Requester-Id`.
- If `X-Requester-Id` is missing, invalid, or references a non-existent/inactive requester, the server responds with `HTTP 400 Bad Request` or `HTTP 401 Unauthorized`.
- For browser file download links where headers cannot be easily attached by native anchor clicks, the query parameter `?requesterId=<integer>` is supported as an equivalent fallback on `GET /api/attachments/:id/download`.

### Error Response Schema
All error responses adhere to a consistent JSON structure:

```json
{
  "error": "Human-readable error message",
  "details": [
    {
      "field": "summary",
      "message": "Summary must be at least 5 characters"
    }
  ]
}
```
*(The `details` array is optional and included primarily for HTTP 400 validation errors).*

### Unauthorized / Forbidden Access Convention
To prevent resource enumeration and protect requester privacy (BR-11, BR-35), attempting to access or modify a Ticket or Attachment belonging to another Requester returns `HTTP 404 Not Found` with:

```json
{
  "error": "Ticket not found or access denied"
}
```

---

## 2. Reference Data Endpoints

### 2.1 GET /api/development-requesters

Retrieves all active Development Requesters for the identity selector.

- **Method**: `GET`
- **Path**: `/api/development-requesters`
- **Authentication/Context**: None required

#### Success Response
- **Status**: `200 OK`
- **Body**:
```json
[
  {
    "id": 1,
    "name": "Alice Tan",
    "email": "alice@example.com"
  },
  {
    "id": 2,
    "name": "Bob Smith",
    "email": "bob@example.com"
  }
]
```

---

### 2.2 GET /api/categories

Retrieves all active IT ticket categories.

- **Method**: `GET`
- **Path**: `/api/categories`
- **Authentication/Context**: None required

#### Success Response
- **Status**: `200 OK`
- **Body**:
```json
[
  {
    "id": 1,
    "name": "Account and Access"
  },
  {
    "id": 2,
    "name": "Hardware"
  },
  {
    "id": 3,
    "name": "Software"
  },
  {
    "id": 4,
    "name": "Network"
  }
]
```

---

### 2.3 GET /api/related-systems

Retrieves all active Related Systems.

- **Method**: `GET`
- **Path**: `/api/related-systems`
- **Authentication/Context**: None required

#### Success Response
- **Status**: `200 OK`
- **Body**:
```json
[
  {
    "id": 1,
    "name": "Email"
  },
  {
    "id": 2,
    "name": "Campus Wi-Fi"
  },
  {
    "id": 3,
    "name": "VPN"
  },
  {
    "id": 4,
    "name": "LEB2 App"
  },
  {
    "id": 5,
    "name": "Grade Submission App"
  },
  {
    "id": 6,
    "name": "Printer"
  },
  {
    "id": 7,
    "name": "Corporate Laptop"
  }
]
```

---

## 3. Ticket Endpoints

### 3.1 POST /api/tickets

Creates a new ticket under the active Development Requester context.

- **Method**: `POST`
- **Path**: `/api/tickets`
- **Headers**:
  - `Content-Type: application/json`
  - `X-Requester-Id: <integer>`

#### Request Body
```json
{
  "requesterId": 1,
  "categoryId": 2,
  "relatedSystemId": 7,
  "summary": "Laptop display flickering intermittently",
  "description": "Whenever the laptop hinge is adjusted past 90 degrees, the display turns black and flickers.",
  "requestedPriority": "HIGH"
}
```

*Validation Rules*:
- `requesterId`: Required, integer, must match active `X-Requester-Id` and exist in database.
- `categoryId`: Required, integer, must exist and be active in database.
- `relatedSystemId`: Required, integer, must exist and be active in database.
- `summary`: Required string, 5–200 characters after trimming leading/trailing whitespace.
- `description`: Required string, 10–2000 characters after trimming leading/trailing whitespace.
- `requestedPriority`: Required enum: `"LOW"`, `"MEDIUM"`, `"HIGH"`.

*Backend Defaults Generated*:
- `ticketNumber`: Format `TCK-YYYYMMDD-NNNN` (unique).
- `ticketDate`: ISO UTC timestamp of creation.
- `currentStatus`: `"NEW"`.

#### Success Response
- **Status**: `201 Created`
- **Body**:
```json
{
  "id": 101,
  "ticketNumber": "TCK-20260901-0001",
  "ticketDate": "2026-09-01T14:30:00.000Z",
  "requesterId": 1,
  "requester": {
    "id": 1,
    "name": "Alice Tan",
    "email": "alice@example.com"
  },
  "categoryId": 2,
  "category": {
    "id": 2,
    "name": "Hardware"
  },
  "relatedSystemId": 7,
  "relatedSystem": {
    "id": 7,
    "name": "Corporate Laptop"
  },
  "summary": "Laptop display flickering intermittently",
  "description": "Whenever the laptop hinge is adjusted past 90 degrees, the display turns black and flickers.",
  "requestedPriority": "HIGH",
  "currentStatus": "NEW",
  "createdAt": "2026-09-01T14:30:00.000Z",
  "updatedAt": "2026-09-01T14:30:00.000Z",
  "attachments": []
}
```

#### Error Responses
- **Status**: `400 Bad Request`
```json
{
  "error": "Validation failed",
  "details": [
    { "field": "summary", "message": "Summary must be between 5 and 200 characters" }
  ]
}
```

---

### 3.2 GET /api/tickets

Retrieves a paginated list of tickets owned by the active Development Requester.

- **Method**: `GET`
- **Path**: `/api/tickets`
- **Headers**:
  - `X-Requester-Id: <integer>` (Required)

#### Query Parameters
| Parameter | Type | Default | Permitted Values / Description |
|---|---|---|---|
| `page` | integer | `1` | $\ge 1$ |
| `pageSize` | integer | `10` | `10`, `20`, `50` |
| `search` | string | `""` | Case-insensitive search on `ticketNumber` and `summary` |
| `categoryId` | integer | (none) | Filter by Category ID |
| `relatedSystemId` | integer | (none) | Filter by Related System ID |
| `requestedPriority`| string | (none) | Filter by enum: `LOW`, `MEDIUM`, `HIGH` |
| `currentStatus` | string | (none) | Filter by enum: `NEW` |
| `sortBy` | string | `updatedAt`| `updatedAt`, `ticketDate`, `ticketNumber`, `requestedPriority`, `currentStatus` |
| `sortOrder` | string | `desc` | `asc`, `desc` |

#### Success Response
- **Status**: `200 OK`
- **Body**:
```json
{
  "data": [
    {
      "id": 101,
      "ticketNumber": "TCK-20260901-0001",
      "ticketDate": "2026-09-01T14:30:00.000Z",
      "requesterId": 1,
      "categoryId": 2,
      "category": {
        "id": 2,
        "name": "Hardware"
      },
      "relatedSystemId": 7,
      "relatedSystem": {
        "id": 7,
        "name": "Corporate Laptop"
      },
      "summary": "Laptop display flickering intermittently",
      "description": "Whenever the laptop hinge is adjusted past 90 degrees, the display turns black and flickers.",
      "requestedPriority": "HIGH",
      "currentStatus": "NEW",
      "createdAt": "2026-09-01T14:30:00.000Z",
      "updatedAt": "2026-09-01T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Error Responses
- **Status**: `400 Bad Request` (Invalid query parameters like `pageSize=15` or negative page):
```json
{
  "error": "Invalid pagination or filter parameters"
}
```

---

### 3.3 GET /api/tickets/:id

Retrieves detailed information and attachment metadata for a single ticket owned by the active Requester.

- **Method**: `GET`
- **Path**: `/api/tickets/:id`
- **Headers**:
  - `X-Requester-Id: <integer>` (Required)

#### Success Response
- **Status**: `200 OK`
- **Body**:
```json
{
  "id": 101,
  "ticketNumber": "TCK-20260901-0001",
  "ticketDate": "2026-09-01T14:30:00.000Z",
  "requesterId": 1,
  "requester": {
    "id": 1,
    "name": "Alice Tan",
    "email": "alice@example.com"
  },
  "categoryId": 2,
  "category": {
    "id": 2,
    "name": "Hardware"
  },
  "relatedSystemId": 7,
  "relatedSystem": {
    "id": 7,
    "name": "Corporate Laptop"
  },
  "summary": "Laptop display flickering intermittently",
  "description": "Whenever the laptop hinge is adjusted past 90 degrees, the display turns black and flickers.",
  "requestedPriority": "HIGH",
  "currentStatus": "NEW",
  "createdAt": "2026-09-01T14:30:00.000Z",
  "updatedAt": "2026-09-01T14:30:00.000Z",
  "attachments": [
    {
      "id": 12,
      "ticketId": 101,
      "originalFileName": "screen_glitch.png",
      "storedFileName": "9f8e7d6c-5b4a-3210-fedc-ba9876543210.png",
      "mimeType": "image/png",
      "sizeBytes": 204800,
      "uploadedAt": "2026-09-01T14:35:00.000Z",
      "removedAt": null,
      "removalReason": null
    }
  ]
}
```

#### Error Responses
- **Status**: `404 Not Found` (Ticket does not exist OR `requesterId` does not match `X-Requester-Id`):
```json
{
  "error": "Ticket not found or access denied"
}
```

---

## 4. Attachment Endpoints

Attachments are managed exclusively on existing tickets via the Ticket Detail screen.

### 4.1 POST /api/tickets/:id/attachments

Uploads a single file attachment to an owned ticket.

- **Method**: `POST`
- **Path**: `/api/tickets/:id/attachments`
- **Headers**:
  - `X-Requester-Id: <integer>` (Required)
  - `Content-Type: multipart/form-data`
- **Form Data Field**:
  - `file`: binary file payload

*Attachment Constraints*:
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
- **Allowed extensions**: `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`
- **Maximum file size**: 5 MB ($5 \times 1,024 \times 1,024 = 5,242,880$ bytes)
- **Active attachment limit**: Maximum 5 active (`removedAt == null`) attachments per ticket

#### Success Response
- **Status**: `201 Created`
- **Body**:
```json
{
  "id": 12,
  "ticketId": 101,
  "originalFileName": "screen_glitch.png",
  "storedFileName": "9f8e7d6c-5b4a-3210-fedc-ba9876543210.png",
  "mimeType": "image/png",
  "sizeBytes": 204800,
  "uploadedAt": "2026-09-01T14:35:00.000Z",
  "removedAt": null,
  "removalReason": null
}
```

#### Error Responses
- **Status**: `400 Bad Request` (Invalid MIME type, file size > 5 MB, or active limit of 5 exceeded):
```json
{
  "error": "Maximum of 5 active attachments per ticket exceeded"
}
```
- **Status**: `404 Not Found` (Ticket does not exist or requester is not owner):
```json
{
  "error": "Ticket not found or access denied"
}
```

---

### 4.2 GET /api/attachments/:id/download

Downloads an active file attachment belonging to an owned ticket.

- **Method**: `GET`
- **Path**: `/api/attachments/:id/download`
- **Headers**:
  - `X-Requester-Id: <integer>` (or query parameter `?requesterId=<integer>`)

#### Success Response
- **Status**: `200 OK`
- **Headers**:
  - `Content-Type: <mimeType>` (e.g. `image/png` or `application/pdf`)
  - `Content-Disposition: attachment; filename="screen_glitch.png"`
  - `Content-Length: <sizeBytes>`
- **Body**: Binary file stream

#### Error Responses
- **Status**: `404 Not Found` (Attachment does not exist, ticket is not owned by active requester, or attachment has been soft-removed):
```json
{
  "error": "Attachment not found or access denied"
}
```

---

### 4.3 DELETE /api/attachments/:id

Soft-removes an active attachment from an owned ticket.

- **Method**: `DELETE`
- **Path**: `/api/attachments/:id`
- **Headers**:
  - `X-Requester-Id: <integer>` (Required)
  - `Content-Type: application/json`
- **Request Body**:
```json
{
  "removalReason": "Uploaded outdated log file by mistake"
}
```

*Validation Rules*:
- `removalReason`: Required non-empty string after trimming (minimum 1 character, maximum 500 characters).

#### Success Response
- **Status**: `200 OK`
- **Body**:
```json
{
  "id": 12,
  "ticketId": 101,
  "originalFileName": "screen_glitch.png",
  "storedFileName": "9f8e7d6c-5b4a-3210-fedc-ba9876543210.png",
  "mimeType": "image/png",
  "sizeBytes": 204800,
  "uploadedAt": "2026-09-01T14:35:00.000Z",
  "removedAt": "2026-09-01T15:10:00.000Z",
  "removalReason": "Uploaded outdated log file by mistake"
}
```

#### Error Responses
- **Status**: `400 Bad Request` (Missing or empty `removalReason`, or attachment is already removed):
```json
{
  "error": "A non-empty removal reason is required"
}
```
- **Status**: `404 Not Found` (Attachment does not exist or ticket is not owned by active requester):
```json
{
  "error": "Attachment not found or access denied"
}
```