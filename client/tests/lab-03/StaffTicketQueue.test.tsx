import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ITStaffTicketQueue from "../../src/ITStaffTicketQueue.js";

const mockGetITStaffTicketQueue = vi.fn();

vi.mock("../../src/api.js", () => ({
  getITStaffTicketQueue: (...args: unknown[]) =>
    mockGetITStaffTicketQueue(...args),
}));

describe("Lab 3 IT Staff Ticket Queue UI", () => {
  const user = {
    id: "2",
    name: "Nandar IT",
    email: "nandar.it@example.com",
    role: "IT_STAFF",
  };

  const mockOnOpenTicket = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetITStaffTicketQueue.mockResolvedValue({
      tickets: [
        {
          id: 1,
          ticketNumber: "TCK-20260921-0002",
          ticketDate: "2026-09-21T08:30:00.000Z",
          createdAt: "2026-09-21T08:30:00.000Z",
          updatedAt: "2026-09-21T10:30:00.000Z",
          summary: "Cannot connect to campus Wi-Fi",
          requestedPriority: "HIGH",
          itPriority: "URGENT",
          currentStatus: "OPEN",
          category: {
            name: "Network",
          },
          requester: {
            name: "Aye Aye",
          },
          assignedStaff: {
            name: "Nandar IT",
          },
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });
  });

  it("shows the IT Staff ticket queue", async () => {
    render(
      <ITStaffTicketQueue
        user={user}
        onOpenTicket={mockOnOpenTicket}
        onBack={mockOnBack}
      />,
    );

    expect(
      await screen.findByRole("heading", {
        name: /IT Staff Ticket Queue/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /View and manage support tickets assigned to IT Staff/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /refresh/i,
      }),
    ).toBeInTheDocument();
  });

  it("displays ticket information from the backend", async () => {
    render(
      <ITStaffTicketQueue
        user={user}
        onOpenTicket={mockOnOpenTicket}
        onBack={mockOnBack}
      />,
    );

    expect(
      await screen.findByText("TCK-20260921-0002"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Cannot connect to campus Wi-Fi"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Network"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("High"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Urgent"),
    ).toBeInTheDocument();

    expect(
  document.querySelector(".it-status-badge"),
).toHaveTextContent("Open");

    expect(
      screen.getByText("Aye Aye"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Nandar IT"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Showing 1 to 1 of 1 tickets"),
    ).toBeInTheDocument();
  });

  it("opens a ticket when the ticket number is clicked", async () => {
    const userEventSetup = userEvent.setup();

    render(
      <ITStaffTicketQueue
        user={user}
        onOpenTicket={mockOnOpenTicket}
        onBack={mockOnBack}
      />,
    );

    const ticketButton =
      await screen.findByRole("button", {
        name: "TCK-20260921-0002",
      });

    await userEventSetup.click(ticketButton);

    expect(mockOnOpenTicket).toHaveBeenCalledWith(1);
  });

  it("searches the queue using the search field", async () => {
    const userEventSetup = userEvent.setup();

    render(
      <ITStaffTicketQueue
        user={user}
        onOpenTicket={mockOnOpenTicket}
        onBack={mockOnBack}
      />,
    );

    const searchInput =
      await screen.findByPlaceholderText(
        "Search by ticket number or summary...",
      );

    await userEventSetup.type(
      searchInput,
      "Wi-Fi",
    );

    await userEventSetup.click(
      screen.getByRole("button", {
        name: /^Search$/,
      }),
    );

    await waitFor(() => {
      expect(
        mockGetITStaffTicketQueue,
      ).toHaveBeenLastCalledWith({
        search: "Wi-Fi",
        status: undefined,
        assignedTo: undefined,
        sort: "updatedDesc",
        page: 1,
        pageSize: 10,
      });
    });
  });

  it("supports status and assignment filters", async () => {
    const userEventSetup = userEvent.setup();

    render(
      <ITStaffTicketQueue
        user={user}
        onOpenTicket={mockOnOpenTicket}
        onBack={mockOnBack}
      />,
    );

    await screen.findByText(
      "TCK-20260921-0002",
    );

    const selects = screen.getAllByRole("combobox");

    expect(selects).toHaveLength(3);

    await userEventSetup.selectOptions(
      selects[0],
      "OPEN",
    );

    await userEventSetup.selectOptions(
      selects[1],
      "me",
    );

    await userEventSetup.click(
      screen.getByRole("button", {
        name: /^Search$/,
      }),
    );

    await waitFor(() => {
      expect(
        mockGetITStaffTicketQueue,
      ).toHaveBeenLastCalledWith({
        search: undefined,
        status: "OPEN",
        assignedTo: "me",
        sort: "updatedDesc",
        page: 1,
        pageSize: 10,
      });
    });
  });

  it("goes back when Back is clicked", async () => {
    const userEventSetup = userEvent.setup();

    render(
      <ITStaffTicketQueue
        user={user}
        onOpenTicket={mockOnOpenTicket}
        onBack={mockOnBack}
      />,
    );

    await screen.findByText(
      "TCK-20260921-0002",
    );

    await userEventSetup.click(
      screen.getByRole("button", {
        name: /back/i,
      }),
    );

    expect(mockOnBack).toHaveBeenCalled();
  });
});