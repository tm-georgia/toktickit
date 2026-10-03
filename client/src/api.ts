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
  itPriority: "LOW" | "MEDIUM" | "HIGH";
  currentStatus: "NEW";
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
}

export interface ITStaffTicket {
  id: number;
  ticketNumber: string;
  ticketDate: string;
  requester: DevelopmentRequester;
  category: Category;
  relatedSystem: RelatedSystem;
  summary: string;
  description: string;
  resolutionSummary: string | null;
  requestedPriority: "LOW" | "MEDIUM" | "HIGH";
  currentStatus:
    | "NEW"
    | "OPEN"
    | "IN_PROGRESS"
    | "WAITING_FOR_REQUESTER"
    | "RESOLVED"
    | "CLOSED"
    | "REOPENED"
    | "CANCELLED";
  itPriority: "LOW" | "MEDIUM" | "HIGH" | null;
  assignedStaff: {
    id: number;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  } | null;
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
  publicComments: ITStaffComment[];
  internalNotes: ITStaffComment[];
}

export interface ITStaffComment {
  id: number;
  body: string;
  createdAt: string;
  author: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
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
  tickets: TicketListItem[];
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
  if (response.status === 401) {
    throw new Error(
      "Your session has expired. Please log in again.",
    );
  }

  if (response.status === 403) {
    throw new Error(
      "You do not have permission to view the IT Staff ticket queue.",
    );
  }

  throw new Error(
    `Unable to load IT Staff tickets. Server returned ${response.status}.`,
  );
}

  return response.json();
}

// Issue 17 — load active categories for Create Ticket.
export async function getCategories(): Promise<Category[]> {
  const response = await fetch(
    `${API_URL}/api/categories`,
    {
    credentials: "include",
  }
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
    `${API_URL}/api/related-systems`,
    {
    credentials: "include",
  }
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
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
    
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
      credentials: "include",
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
  file: File
): Promise<Attachment> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
  `${API_URL}/api/tickets/${ticketId}/attachments`,
  {
    method: "POST",
    credentials: "include",
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

export async function updateITStaffResolutionSummary(
  ticketId: number,
  resolutionSummary: string,
): Promise<ITStaffTicket> {
  const response = await fetch(
    `${API_URL}/api/it-staff/tickets/${ticketId}/resolution-summary`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resolutionSummary,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      "Unable to update resolution summary.",
    );
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
): Promise<Attachment> {
  const response = await fetch(
  `${API_URL}/api/tickets/${ticketId}/attachments/${attachmentId}`,
  {
    method: "DELETE",
    credentials: "include",
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
  ticketId: number
): Promise<CreatedTicket> {
  const response = await fetch(
    `${API_URL}/api/tickets/${ticketId}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Unable to load ticket");
  }

  return response.json();
}

export async function getITStaffTicket(
  ticketId: number
): Promise<ITStaffTicket> {
  const response = await fetch(
    `${API_URL}/api/it-staff/tickets/${ticketId}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Unable to load IT Staff ticket");
  }

  return response.json();
}

export interface ITStaffTicketQueueItem {
  id: number;
  ticketNumber: string;
  ticketDate: string;
  createdAt: string;
  summary: string;

  requester: {
    id: number;
    name: string;
    email: string;
  };

  category: {
    id: number;
    name: string;
  };

  relatedSystem: {
    id: number;
    name: string;
  };

  requestedPriority: "LOW" | "MEDIUM" | "HIGH";

  itPriority: "LOW" | "MEDIUM" | "HIGH" | null;

  currentStatus:
    | "NEW"
    | "OPEN"
    | "IN_PROGRESS"
    | "WAITING_FOR_REQUESTER"
    | "RESOLVED"
    | "CLOSED"
    | "REOPENED"
    | "CANCELLED";

  assignedStaff: {
    id: number;
    name: string;
    email: string;
  } | null;

  resolutionSummary: string | null;

  updatedAt: string;
}

export interface ITStaffTicketQueueResponse {
  tickets: ITStaffTicketQueueItem[];
    total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ITStaffUser {
  id: number;
  name: string;
  email: string;
  role: "IT_STAFF";
  isActive: boolean;

}

export async function getITStaffUsers(): Promise<ITStaffUser[]> {
  const response = await fetch(`${API_URL}/api/it-staff/staff`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to load IT Staff members.");
  }

  return response.json();
}

export async function getITStaffTicketQueue(
  params: {
    search?: string;
    status?: string;
    assignedTo?: string;
    sort?: string;
    page?: number;
    pageSize?: number;
  } = {},
): Promise<ITStaffTicketQueueResponse> {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.assignedTo) {
    searchParams.set("assignedTo", params.assignedTo);
  }
  
  if (params.sort) {
  searchParams.set("sort", params.sort);
} 

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize !== undefined) {
    searchParams.set("pageSize", String(params.pageSize));
  }

  const query = searchParams.toString();

  const response = await fetch(
    `${API_URL}/api/it-staff/tickets${query ? `?${query}` : ""}`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to load IT Staff tickets.");
  }

  return response.json();
}

export async function claimITStaffTicket(
  ticketId: number
): Promise<ITStaffTicket> {
  const response = await fetch(
    `${API_URL}/api/it-staff/tickets/${ticketId}/claim`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  if (!response.ok) {
    let message = "Unable to claim ticket";

    try {
      const errorBody = await response.json();

      if (typeof errorBody.error === "string") {
        message = errorBody.error;
      }
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function reassignITStaffTicket(
  ticketId: number,
  staffId: number
): Promise<ITStaffTicket> {
  const response = await fetch(
    `${API_URL}/api/it-staff/tickets/${ticketId}/assignment`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assignedStaffId: staffId,
      }),
    }
  );

  if (!response.ok) {
    let message = "Unable to reassign ticket";

    try {
      const errorBody = await response.json();

      if (typeof errorBody.error === "string") {
        message = errorBody.error;
      }
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function updateITStaffPriority(
  ticketId: number,
  priority: "LOW" | "MEDIUM" | "HIGH"
): Promise<ITStaffTicket> {
  const response = await fetch(
    `${API_URL}/api/it-staff/tickets/${ticketId}/priority`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itPriority: priority,
      }),
    }
  );

  if (!response.ok) {
    let message = "Unable to update IT priority";

    try {
      const errorBody = await response.json();

      if (typeof errorBody.error === "string") {
        message = errorBody.error;
      }
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function updateITStaffTicketStatus(
  ticketId: number,
  status:
    | "NEW"
    | "OPEN"
    | "IN_PROGRESS"
    | "WAITING_FOR_REQUESTER"
    | "RESOLVED"
    | "CLOSED"
    | "REOPENED"
    | "CANCELLED"
): Promise<ITStaffTicket>{
  const response = await fetch(
    `${API_URL}/api/it-staff/tickets/${ticketId}/status`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentStatus: status,
      }),
    }
  );

  if (!response.ok) {
    let message = "Unable to update ticket status";

    try {
      const errorBody = await response.json();

      if (typeof errorBody.error === "string") {
        message = errorBody.error;
      }
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function addITStaffPublicComment(
  ticketId: number,
  body: string
): Promise<ITStaffTicket> {
  const response = await fetch(
    `${API_URL}/api/it-staff/tickets/${ticketId}/comments`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body }),
    }
  );

  if (!response.ok) {
    let message = "Unable to add public comment";

    try {
      const errorBody = await response.json();

      if (typeof errorBody.error === "string") {
        message = errorBody.error;
      }
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function addITStaffInternalNote(
  ticketId: number,
  body: string
): Promise<ITStaffTicket> {
  const response = await fetch(
    `${API_URL}/api/it-staff/tickets/${ticketId}/notes`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body }),
    }
  );

  if (!response.ok) {
    let message = "Unable to add internal note";

    try {
      const errorBody = await response.json();

      if (typeof errorBody.error === "string") {
        message = errorBody.error;
      }
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  return response.json();
}

export function getITStaffAttachmentDownloadUrl(
  ticketId: number,
  attachmentId: number,
): string {
  return `${API_URL}/api/it-staff/tickets/${ticketId}/attachments/${attachmentId}`;
}

export async function downloadITStaffAttachment(
  ticketId: number,
  attachmentId: number,
): Promise<Blob> {
  const response = await fetch(
    `${API_URL}/api/it-staff/tickets/${ticketId}/attachments/${attachmentId}`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    let message = "Unable to download attachment";

    try {
      const errorBody = await response.json();

      if (typeof errorBody.error === "string") {
        message = errorBody.error;
      }
    } catch {
      // Ignore non-JSON error responses.
    }

    throw new Error(message);
  }

  return response.blob();
}

export type AdminUserRole =
  | "REQUESTER"
  | "IT_STAFF"
  | "ADMINISTRATOR";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: AdminUserRole;
  isActive: boolean;
  mustChangePassword: boolean;
}

export interface AdminUserListResponse {
  users: AdminUser[];
}

async function getAdminErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = await response.json();

    if (
      body?.error &&
      typeof body.error.message === "string"
    ) {
      return body.error.message;
    }

    if (typeof body?.error === "string") {
      return body.error;
    }
  } catch {
    // Keep the safe fallback message.
  }

  return fallback;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await fetch(
    `${API_URL}/api/admin/users`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getAdminErrorMessage(
        response,
        "Unable to load users.",
      ),
    );
  }

  const data: AdminUserListResponse =
    await response.json();

  return data.users;
}

export async function createAdminUser(input: {
  name: string;
  email: string;
  role: AdminUserRole;
  initialPassword: string;
}): Promise<AdminUser> {
  const response = await fetch(
    `${API_URL}/api/admin/users`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getAdminErrorMessage(
        response,
        "Unable to create user.",
      ),
    );
  }

  const data: { user: AdminUser } =
    await response.json();

  return data.user;
}

export async function updateAdminUser(
  userId: number,
  input: {
    name?: string;
    email?: string;
    role?: AdminUserRole;
  },
): Promise<AdminUser> {
  const response = await fetch(
    `${API_URL}/api/admin/users/${userId}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getAdminErrorMessage(
        response,
        "Unable to update user.",
      ),
    );
  }

  const data: { user: AdminUser } =
    await response.json();

  return data.user;
}

export async function updateAdminUserStatus(
  userId: number,
  isActive: boolean,
): Promise<AdminUser> {
  const response = await fetch(
    `${API_URL}/api/admin/users/${userId}/status`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isActive,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getAdminErrorMessage(
        response,
        "Unable to update user status.",
      ),
    );
  }

  const data: { user: AdminUser } =
    await response.json();

  return data.user;
}

export async function resetAdminUserPassword(
  userId: number,
  initialPassword: string,
): Promise<AdminUser> {
  const response = await fetch(
    `${API_URL}/api/admin/users/${userId}/password`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        initialPassword,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getAdminErrorMessage(
        response,
        "Unable to set the new initial password.",
      ),
    );
  }

  const data: { user: AdminUser } =
    await response.json();

  return data.user;
}