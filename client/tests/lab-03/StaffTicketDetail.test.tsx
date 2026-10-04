import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ITStaffTicketDetail from "../../src/ITStaffTicketDetail.js";

const mockGetITStaffTicket = vi.fn();
const mockGetITStaffUsers = vi.fn();
const mockUpdateITStaffPriority = vi.fn();
const mockUpdateITStaffTicketStatus = vi.fn();
const mockUpdateITStaffResolutionSummary = vi.fn();
const mockAddITStaffPublicComment = vi.fn();
const mockAddITStaffInternalNote = vi.fn();
const mockClaimITStaffTicket = vi.fn();
const mockReassignITStaffTicket = vi.fn();
const mockDownloadITStaffAttachment = vi.fn();

vi.mock("../../src/api.js", () => ({
  getITStaffTicket: (...args: unknown[]) =>
    mockGetITStaffTicket(...args),

  getITStaffUsers: (...args: unknown[]) =>
    mockGetITStaffUsers(...args),

  updateITStaffPriority: (...args: unknown[]) =>
    mockUpdateITStaffPriority(...args),

  updateITStaffTicketStatus: (...args: unknown[]) =>
    mockUpdateITStaffTicketStatus(...args),

  updateITStaffResolutionSummary: (
    ...args: unknown[]
  ) => mockUpdateITStaffResolutionSummary(...args),

  addITStaffPublicComment: (
    ...args: unknown[]
  ) => mockAddITStaffPublicComment(...args),

  addITStaffInternalNote: (
    ...args: unknown[]
  ) => mockAddITStaffInternalNote(...args),

  claimITStaffTicket: (...args: unknown[]) =>
    mockClaimITStaffTicket(...args),

  reassignITStaffTicket: (
    ...args: unknown[]
  ) => mockReassignITStaffTicket(...args),

  downloadITStaffAttachment: (
    ...args: unknown[]
  ) => mockDownloadITStaffAttachment(...args),
}));

describe("Lab 3 IT Staff Ticket Detail UI", () => {
const user = {
  id: "2",
  name: "Nandar IT",
  email: "nandar.it@example.com",
  role: "IT_STAFF" as const,
  mustChangePassword: false,
};

  const mockOnBack = vi.fn();

  const ticket = {
    id: 1,
    ticketNumber: "TCK-20260921-0002",
    ticketDate: "2026-09-21T08:30:00.000Z",
    createdAt: "2026-09-21T08:30:00.000Z",
    updatedAt: "2026-09-21T10:30:00.000Z",

    summary: "Cannot connect to campus Wi-Fi",

    description:
      "The requester cannot connect to the campus Wi-Fi network.",

    requestedPriority: "HIGH",
    itPriority: "MEDIUM",
    currentStatus: "OPEN",

    resolutionSummary: "",

    requester: {
      id: 10,
      name: "Aye Aye",
      email: "ayeaye@example.com",
    },

    category: {
      id: 1,
      name: "Network",
    },

    relatedSystem: {
      id: 1,
      name: "Campus Wi-Fi",
    },

    assignedStaff: {
      id: 2,
      name: "Nandar IT",
      email: "nandar.it@example.com",
    },

    publicComments: [
      {
        id: 1,
        body: "I still cannot connect to Wi-Fi.",
        createdAt: "2026-09-21T09:00:00.000Z",
        author: {
          id: 10,
          name: "Aye Aye",
          role: "REQUESTER",
        },
      },
    ],

    internalNotes: [
      {
        id: 2,
        body: "Checked the campus Wi-Fi service.",
        createdAt: "2026-09-21T09:30:00.000Z",
        author: {
          id: 2,
          name: "Nandar IT",
          role: "IT_STAFF",
        },
      },
    ],

    attachments: [
      {
        id: 5,
        originalFileName: "wifi-error.png",
        sizeBytes: 2048,
        mimeType: "image/png",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetITStaffTicket.mockResolvedValue(ticket);

    mockGetITStaffUsers.mockResolvedValue([
      {
        id: 2,
        name: "Nandar IT",
        email: "nandar.it@example.com",
      },
      {
        id: 3,
        name: "Kyaw IT",
        email: "kyaw.it@example.com",
      },
    ]);

    mockUpdateITStaffPriority.mockResolvedValue(ticket);
    mockUpdateITStaffTicketStatus.mockResolvedValue(ticket);
    mockUpdateITStaffResolutionSummary.mockResolvedValue(
      ticket,
    );

    mockAddITStaffPublicComment.mockResolvedValue({
      id: 10,
    });

    mockAddITStaffInternalNote.mockResolvedValue({
      id: 11,
    });

    mockClaimITStaffTicket.mockResolvedValue({
      ...ticket,
      assignedStaff: {
        id: 2,
        name: "Nandar IT",
        email: "nandar.it@example.com",
      },
    });

    mockReassignITStaffTicket.mockResolvedValue(ticket);

    mockDownloadITStaffAttachment.mockResolvedValue(
      new Blob(["test"]),
    );
  });

  it("shows the ticket detail and ticket information", async () => {
    render(
      <ITStaffTicketDetail
        user={user as any}
        ticketId={1}
        onBack={mockOnBack}
      />,
    );

    expect(
      await screen.findByRole("heading", {
        name: "Ticket Detail",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue(
        "TCK-20260921-0002",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("Aye Aye"),
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("Network"),
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("Campus Wi-Fi"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("HIGH"),
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue(
        "Cannot connect to campus Wi-Fi",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue(
        "The requester cannot connect to the campus Wi-Fi network.",
      ),
    ).toBeInTheDocument();
  });

  it("loads IT Staff users and shows the ticket owner", async () => {
    render(
      <ITStaffTicketDetail
        user={user as any}
        ticketId={1}
        onBack={mockOnBack}
      />,
    );

    const ownerSelect =
      await screen.findByDisplayValue(
        "Nandar IT — nandar.it@example.com",
      );

    expect(ownerSelect).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "Kyaw IT — kyaw.it@example.com",
      }),
    ).toBeInTheDocument();
  });

  it("allows IT Priority and Status to be changed", async () => {
    const userEventSetup = userEvent.setup();

    render(
      <ITStaffTicketDetail
        user={user as any}
        ticketId={1}
        onBack={mockOnBack}
      />,
    );

    await screen.findByRole("heading", {
      name: "Ticket Detail",
    });

    const selects =
      screen.getAllByRole("combobox");

    expect(selects.length).toBeGreaterThanOrEqual(3);

    await userEventSetup.selectOptions(
      selects[0],
      "HIGH",
    );

    await userEventSetup.selectOptions(
      selects[1],
      "IN_PROGRESS",
    );

    expect(
      selects[0],
    ).toHaveValue("HIGH");

    expect(
      selects[1],
    ).toHaveValue("IN_PROGRESS");
  });

  it("shows Public Comments and allows posting a comment", async () => {
    const userEventSetup = userEvent.setup();

    render(
      <ITStaffTicketDetail
        user={user as any}
        ticketId={1}
        onBack={mockOnBack}
      />,
    );

    expect(
      await screen.findByRole("heading", {
        name: "Public Comments",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "I still cannot connect to Wi-Fi.",
      ),
    ).toBeInTheDocument();

    const commentBox =
      screen.getByPlaceholderText(
        "Write a message that the requester can see...",
      );

    await userEventSetup.type(
      commentBox,
      "Please try connecting again.",
    );

    await userEventSetup.click(
      screen.getByRole("button", {
        name: "Post Comment",
      }),
    );

    await waitFor(() => {
      expect(
        mockAddITStaffPublicComment,
      ).toHaveBeenCalledWith(
        1,
        "Please try connecting again.",
      );
    });
  });

  it("shows Internal Notes and allows adding a note", async () => {
    const userEventSetup = userEvent.setup();

    render(
      <ITStaffTicketDetail
        user={user as any}
        ticketId={1}
        onBack={mockOnBack}
      />,
    );

    await screen.findByRole("heading", {
      name: "Public Comments",
    });

    await userEventSetup.click(
      screen.getByRole("button", {
        name: /Internal Notes/i,
      }),
    );

    expect(
      await screen.findByRole("heading", {
        name: "Internal Notes",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Private information for IT Staff only.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("PRIVATE"),
    ).toBeInTheDocument();

    const noteBox =
      screen.getByPlaceholderText(
        "Write a private internal note...",
      );

    await userEventSetup.type(
      noteBox,
      "Restarted the network adapter.",
    );

    await userEventSetup.click(
      screen.getByRole("button", {
        name: "Add Internal Note",
      }),
    );

    await waitFor(() => {
      expect(
        mockAddITStaffInternalNote,
      ).toHaveBeenCalledWith(
        1,
        "Restarted the network adapter.",
      );
    });
  });

  it("shows attachments", async () => {
    const userEventSetup = userEvent.setup();

    render(
      <ITStaffTicketDetail
        user={user as any}
        ticketId={1}
        onBack={mockOnBack}
      />,
    );

    await screen.findByRole("heading", {
      name: "Public Comments",
    });

    await userEventSetup.click(
      screen.getByRole("button", {
        name: /Attachments/i,
      }),
    );

    expect(
      await screen.findByText("wifi-error.png"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Download",
      }),
    ).toBeInTheDocument();
  });

  it("shows Service Actions and can claim the ticket", async () => {
    const userEventSetup = userEvent.setup();

    render(
      <ITStaffTicketDetail
        user={user as any}
        ticketId={1}
        onBack={mockOnBack}
      />,
    );

    await screen.findByRole("heading", {
      name: "Public Comments",
    });

    await userEventSetup.click(
      screen.getByRole("button", {
        name: /Service Actions/i,
      }),
    );

    expect(
      await screen.findByRole("heading", {
        name: "Service Actions",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Ticket Ownership"),
    ).toBeInTheDocument();

    await userEventSetup.click(
      screen.getByRole("button", {
        name: "Claim Ticket",
      }),
    );

    await waitFor(() => {
      expect(
        mockClaimITStaffTicket,
      ).toHaveBeenCalledWith(1);
    });
  });

  it("saves ticket changes", async () => {
    const userEventSetup = userEvent.setup();

    render(
      <ITStaffTicketDetail
        user={user as any}
        ticketId={1}
        onBack={mockOnBack}
      />,
    );

    await screen.findByRole("heading", {
      name: "Public Comments",
    });

    await userEventSetup.click(
      screen.getByRole("button", {
        name: /Service Actions/i,
      }),
    );

    await screen.findByRole("heading", {
      name: "Service Actions",
    });

    await userEventSetup.click(
      screen.getByRole("button", {
        name: "Save Changes",
      }),
    );

    await waitFor(() => {
      expect(
        mockUpdateITStaffPriority,
      ).toHaveBeenCalledWith(
        1,
        "MEDIUM",
      );

      expect(
        mockUpdateITStaffTicketStatus,
      ).toHaveBeenCalledWith(
        1,
        "OPEN",
      );

      expect(
        mockUpdateITStaffResolutionSummary,
      ).toHaveBeenCalledWith(
        1,
        "",
      );
    });
  });

  it("goes back to the queue", async () => {
    const userEventSetup = userEvent.setup();

    render(
      <ITStaffTicketDetail
        user={user as any}
        ticketId={1}
        onBack={mockOnBack}
      />,
    );

    await screen.findByRole("heading", {
      name: "Public Comments",
    });

    await userEventSetup.click(
      screen.getByRole("button", {
        name: /Back to Queue/i,
      }),
    );

    expect(mockOnBack).toHaveBeenCalled();
  });
});