const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface Category {
  id: number;
  name: string;
}

export interface RelatedSystem {
  id: number;
  name: string;
}

export interface SystemStatus {
  online: boolean;
  categories: Category[];
}

export interface DevelopmentRequester {
  id: number;
  name: string;
  email: string;
}

export interface CreateTicketInput {
  requesterId: number;
  categoryId: number;
  relatedSystemId: number;
  summary: string;
  description: string;
  requestedPriority: "LOW" | "MEDIUM" | "HIGH";
}

export interface CreatedTicket {
  id: number;
  ticketNumber: string;
  ticketDate: string;
  requester: DevelopmentRequester;
  category: Category;
  relatedSystem: RelatedSystem;
  summary: string;
  description: string;
  requestedPriority: "LOW" | "MEDIUM" | "HIGH";
  currentStatus: "NEW";
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
}

export interface Attachment {
  id: number;
  ticketId: number;
  originalFileName: string;
  storedFileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  uploadedAt: string;
  removedAt: string | null;
  removalReason: string | null;
}

export interface TicketListItem {
  id: number;
  ticketNumber: string;
  ticketDate: string;
  summary: string;
  description: string;
  requestedPriority: "LOW" | "MEDIUM" | "HIGH";
  currentStatus: "NEW";
  createdAt: string;
  updatedAt: string;
  requester: DevelopmentRequester;
  category: Category;
  relatedSystem: RelatedSystem;
}

export interface GetTicketsParams {
  requesterId: number;
  search?: string;
  categoryId?: number;
  relatedSystemId?: number;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  status?: "NEW";
  sort?: "updatedDesc" | "ticketDate" | "ticketNumber" | "priority";
  page?: number;
  pageSize?: 10 | 20 | 50;
}

export interface TicketListResponse {
  items: TicketListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export async function getDevelopmentRequesters(): Promise<
  DevelopmentRequester[]
> {
  const response = await fetch(
    `${API_URL}/api/requesters`
  );

  if (!response.ok) {
    throw new Error("Unable to load requesters");
  }

  return response.json();
}

// Issue 17 — load active categories for Create Ticket.
export async function getCategories(): Promise<Category[]> {
  const response = await fetch(
    `${API_URL}/api/categories`
  );

  if (!response.ok) {
    throw new Error("Unable to load categories");
  }

  return response.json();
}

// Issue 17 — load active related systems for Create Ticket.
export async function getRelatedSystems(): Promise<
  RelatedSystem[]
> {
  const response = await fetch(
    `${API_URL}/api/related-systems`
  );

  if (!response.ok) {
    throw new Error(
      "Unable to load related systems"
    );
  }

  return response.json();
}

// Issue 17 — create a new ticket.
export async function createTicket(
  ticket: CreateTicketInput
): Promise<CreatedTicket> {
  const response = await fetch(
    `${API_URL}/api/tickets`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requester-Id": String(ticket.requesterId),
      },
      body: JSON.stringify(ticket),
    }
  );

  if (!response.ok) {
    let message = "Unable to create ticket";

    try {
      const errorBody = await response.json();

      if (
        Array.isArray(errorBody.details) &&
        errorBody.details.length > 0
      ) {
        message = errorBody.details.join(", ");
      } else if (
        typeof errorBody.error === "string"
      ) {
        message = errorBody.error;
      }
    } catch {
      // Keep the safe default error message.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function getTickets(
  params: GetTicketsParams
): Promise<TicketListResponse> {
  const query = new URLSearchParams();

  query.set("requesterId", String(params.requesterId));

  if (params.search) {
    query.set("search", params.search);
  }

  if (params.categoryId !== undefined) {
    query.set("categoryId", String(params.categoryId));
  }

  if (params.relatedSystemId !== undefined) {
    query.set(
      "relatedSystemId",
      String(params.relatedSystemId)
    );
  }

  if (params.priority) {
    query.set("priority", params.priority);
  }

  if (params.status) {
    query.set("status", params.status);
  }

  if (params.sort) {
    query.set("sort", params.sort);
  }

  if (params.page !== undefined) {
    query.set("page", String(params.page));
  }

  if (params.pageSize !== undefined) {
    query.set("pageSize", String(params.pageSize));
  }

  const response = await fetch(
    `${API_URL}/api/tickets?${query.toString()}`,
    {
      headers: {
        "X-Requester-Id": String(params.requesterId),
      },
    }
  );

  if (!response.ok) {
    throw new Error("Unable to load tickets");
  }

  return response.json();
}
// Issue 2 + Issue 4 — call the backend.
// Steps: fetch `${API_URL}/api/health`; if not ok, throw.
//        then fetch `${API_URL}/api/categories`; if not ok, throw.
//        return { online: true, categories }.
// Throwing on failure lets the UI show a single Offline/error state.
export async function checkSystem(): Promise<SystemStatus> {
  const healthResponse = await fetch(
    `${API_URL}/api/health`
  );

  if (!healthResponse.ok) {
    throw new Error("Backend is unavailable");
  }

  const categoriesResponse = await fetch(
    `${API_URL}/api/categories`
  );

  if (!categoriesResponse.ok) {
    throw new Error("Unable to load categories");
  }

  const categories: Category[] =
    await categoriesResponse.json();

  return {
    online: true,
    categories,
  };
}
export async function uploadAttachment(
  ticketId: number,
  requesterId: number,
  file: File
): Promise<Attachment> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/api/tickets/${ticketId}/attachments`,
    {
      method: "POST",
      headers: {
        "X-Requester-Id": String(requesterId),
      },
      body: formData,
    }
  );

  if (!response.ok) {
    let message = "Unable to upload attachment";
    try {
      const errorBody = await response.json();
      if (typeof errorBody.error === "string") {
        message = errorBody.error;
      }
    } catch {
      // Keep safe default
    }
    throw new Error(message);
  }

  return response.json();
}

export function getAttachmentDownloadUrl(
  ticketId: number,
  attachmentId: number
): string {
  return `${API_URL}/api/tickets/${ticketId}/attachments/${attachmentId}`;
}

export async function removeAttachment(
  ticketId: number,
  attachmentId: number,
  requesterId: number
): Promise<Attachment> {
  const response = await fetch(
    `${API_URL}/api/tickets/${ticketId}/attachments/${attachmentId}`,
    {
      method: "DELETE",
      headers: {
        "X-Requester-Id": String(requesterId),
      },
    }
  );

  if (!response.ok) {
    let message = "Unable to remove attachment";
    try {
      const errorBody = await response.json();
      if (typeof errorBody.error === "string") {
        message = errorBody.error;
      }
    } catch {
      // Keep safe default
    }
    throw new Error(message);
  }

  return response.json();
}

export async function getTicketById(
  ticketId: number,
  requesterId: number
): Promise<CreatedTicket> {
  const response = await fetch(
    `${API_URL}/api/tickets/${ticketId}`,
    {
      headers: {
        "X-Requester-Id": String(requesterId),
      },
    }
  );

  if (!response.ok) {
    throw new Error("Unable to load ticket");
  }

  return response.json();
}