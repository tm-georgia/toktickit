
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ITStaffDashboard from "../../src/ITStaffDashboard.js";

const mockGetITStaffTicketQueue = vi.fn();

vi.mock("../../src/api.js", () => ({
  getITStaffTicketQueue: (...args: unknown[]) =>
    mockGetITStaffTicketQueue(...args),
}));

describe("Lab 4 IT Staff Dashboard UI", () => {
  const onBack = vi.fn();
  const onOpenQueue = vi.fn();
  const onOpenTicket = vi.fn();
  const onCreateTicket = vi.fn();

  const recentTicket = {
    id: 201,
    ticketNumber: "TCK-20261029-0001",
    summary: "Cannot connect to campus Wi-Fi",
    currentStatus: "IN_PROGRESS",
    updatedAt: "2026-10-29T10:30:00.000Z",
  };

  const renderDashboard = () =>
    render(
      <ITStaffDashboard
        user={{
          id: "2",
          name: "Nandar IT",
          email: "nandar.it@example.com",
          role: "IT_STAFF",
        }}
        onBack={onBack}
        onOpenQueue={onOpenQueue}
        onOpenTicket={onOpenTicket}
        onCreateTicket={onCreateTicket}
      />,
    );

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetITStaffTicketQueue.mockImplementation(
      async (params: Record<string, unknown> = {}) => {
        if (params.status === "NEW") {
          return { total: 4, tickets: [] };
        }

        if (params.status === "OPEN") {
          return { total: 3, tickets: [] };
        }

        if (params.status === "IN_PROGRESS") {
          return { total: 2, tickets: [] };
        }

        if (params.status === "WAITING_FOR_REQUESTER") {
          return { total: 1, tickets: [] };
        }

        if (params.assignedTo === "me") {
          return { total: 5, tickets: [recentTicket] };
        }

        return { total: 0, tickets: [] };
      },
    );
  });

  it("shows the staff welcome message and all five dashboard metrics", async () => {
    renderDashboard();

    expect(
      screen.getByRole("heading", {
        name: "Welcome back, Nandar IT!",
      }),
    ).toBeInTheDocument();

    expect(
      await screen.findByText("TCK-20261029-0001"),
    ).toBeInTheDocument();

    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();

    expect(mockGetITStaffTicketQueue).toHaveBeenCalledTimes(5);
  });

  it("opens the correct queue when a metric card is selected", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await screen.findByText("TCK-20261029-0001");

    await user.click(
      screen.getByRole("button", {
        name: /Waiting for Requester/,
      }),
    );

    expect(onOpenQueue).toHaveBeenCalledWith({
      status: "WAITING_FOR_REQUESTER",
    });

    await user.click(
      screen.getByRole("button", {
        name: /My Assigned/,
      }),
    );

    expect(onOpenQueue).toHaveBeenCalledWith({
      assignedTo: "me",
    });
  });

  it("opens a ticket when a recent ticket is selected", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(
      await screen.findByRole("button", {
        name: /TCK-20261029-0001/,
      }),
    );

    expect(onOpenTicket).toHaveBeenCalledWith(201);
  });

  it("supports the dashboard navigation and quick actions", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await screen.findByText("TCK-20261029-0001");

    // Return to the previous page.
    await user.click(
      screen.getByRole("button", {
        name: /TokTickIT/,
      }),
    );

    expect(onBack).toHaveBeenCalled();

    // Open Create Ticket.
    await user.click(
      screen.getAllByRole("button", {
        name: /Create Ticket/,
      })[0],
    );

    expect(onCreateTicket).toHaveBeenCalled();

    // Open Search Tickets.
    await user.click(
      screen.getByRole("button", {
        name: /Search Tickets/,
      }),
    );

    expect(onOpenQueue).toHaveBeenCalledWith();

    // Open My Queue.
    await user.click(
      screen.getByRole("button", {
        name: /My Queue/,
      }),
    );

    expect(onOpenQueue).toHaveBeenCalledWith({
      assignedTo: "me",
    });
  });

  it("shows an empty message when there are no assigned tickets", async () => {
    mockGetITStaffTicketQueue.mockResolvedValue({
      total: 0,
      tickets: [],
    });

    renderDashboard();

    expect(
      await screen.findByText(
        "You don't have any assigned tickets yet.",
      ),
    ).toBeInTheDocument();
  });

  it("shows an error message when dashboard data cannot be loaded", async () => {
    mockGetITStaffTicketQueue.mockRejectedValue(
      new Error("Network error"),
    );

    renderDashboard();

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(
      "Unable to load dashboard data. Please try refreshing.",
    );
  });

  it("refreshes the dashboard when the Refresh button is clicked", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await screen.findByText("TCK-20261029-0001");

    expect(mockGetITStaffTicketQueue).toHaveBeenCalledTimes(5);

    await user.click(
      screen.getByRole("button", {
        name: /Refresh/,
      }),
    );

    await waitFor(() => {
      expect(mockGetITStaffTicketQueue).toHaveBeenCalledTimes(10);
    });
  });
});
