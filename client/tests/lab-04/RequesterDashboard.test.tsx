
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RequesterDashboard from "../../src/RequesterDashboard.js";

const mockGetRequesterDashboard = vi.fn();
const mockGetTickets = vi.fn();

vi.mock("../../src/api.js", () => ({
  getRequesterDashboard: (...args: unknown[]) =>
    mockGetRequesterDashboard(...args),
  getTickets: (...args: unknown[]) =>
    mockGetTickets(...args),
}));

describe("Lab 4 Requester Dashboard UI", () => {
  const onBack = vi.fn();
  const onViewTicket = vi.fn();
  const onViewAllTickets = vi.fn();

  const dashboard = {
    metrics: {
      openTickets: 3,
      inProgressTickets: 1,
      resolvedTickets: 1,
      closedTickets: 0,
    },
    recentTickets: [
      {
        id: 101,
        ticketNumber: "TCK-20261028-0001",
        summary: "Cannot access campus Wi-Fi",
        currentStatus: "IN_PROGRESS" as const,
        requestedPriority: "MEDIUM" as const,
        updatedAt: "2026-10-28T10:00:00.000Z",
      },
    ],
    recentlyResolvedTickets: [
      {
        id: 102,
        ticketNumber: "TCK-20261027-0002",
        summary: "Printer problem",
        currentStatus: "RESOLVED" as const,
        requestedPriority: "LOW" as const,
        updatedAt: "2026-10-27T10:00:00.000Z",
      },
    ],
    attentionTickets: [
      {
        id: 103,
        ticketNumber: "TCK-20261026-0003",
        summary: "Please provide more information",
        currentStatus: "WAITING_FOR_REQUESTER" as const,
        requestedPriority: "HIGH" as const,
        updatedAt: "2026-10-26T10:00:00.000Z",
      },
    ],
  };

  const ticketList = {
    tickets: [
      ...dashboard.recentTickets,
      ...dashboard.recentlyResolvedTickets,
      ...dashboard.attentionTickets,
    ],
    page: 1,
    pageSize: 50,
    total: 3,
    totalPages: 1,
  };

  const renderDashboard = () =>
    render(
      <RequesterDashboard
        onBack={onBack}
        onViewTicket={onViewTicket}
        onViewAllTickets={onViewAllTickets}
      />,
    );

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetRequesterDashboard.mockResolvedValue(dashboard);
    mockGetTickets.mockResolvedValue(ticketList);
  });

  it("shows dashboard metrics and ticket lists", async () => {
    renderDashboard();

    expect(
      await screen.findByText("Cannot access campus Wi-Fi"),
    ).toBeInTheDocument();

    expect(screen.getAllByText("Printer problem")).toHaveLength(2);

    expect(
      screen.getAllByText("Please provide more information"),
    ).toHaveLength(2);

    expect(screen.getByText("My Open Tickets")).toBeInTheDocument();
    expect(screen.getAllByText("In Progress")).toHaveLength(2);
    expect(screen.getAllByText("Resolved")).toHaveLength(3);
    expect(screen.getByText("Closed")).toBeInTheDocument();

    expect(screen.getByText("TCK-20261028-0001")).toBeInTheDocument();

    expect(mockGetRequesterDashboard).toHaveBeenCalledTimes(1);
    expect(mockGetTickets).toHaveBeenCalledTimes(1);
  });

  it("opens a ticket when its row is clicked", async () => {
    const user = userEvent.setup();

    renderDashboard();

    await screen.findByText("Cannot access campus Wi-Fi");

    const ticketButton = screen
      .getByText("Cannot access campus Wi-Fi")
      .closest("button");

    expect(ticketButton).not.toBeNull();

    await user.click(ticketButton!);

    expect(onViewTicket).toHaveBeenCalledWith(101);
  });

  it("shows dashboard navigation and quick actions", async () => {
    renderDashboard();

    await screen.findByText("Cannot access campus Wi-Fi");

 expect(
  within(screen.getByRole("navigation")).getByRole("button", {
    name: /My Tickets/,
  }),
).toBeInTheDocument();

   expect(
  screen.getAllByRole("button", {
    name: /Create Ticket/,
  }).length,
).toBeGreaterThan(0);

expect(
  screen.getByRole("button", {
    name: /View My Tickets/,
  }),
).toBeInTheDocument();
  });

  it("shows empty messages when no tickets are returned", async () => {
    mockGetRequesterDashboard.mockResolvedValue({
      metrics: {
        openTickets: 0,
        inProgressTickets: 0,
        resolvedTickets: 0,
        closedTickets: 0,
      },
      recentTickets: [],
      recentlyResolvedTickets: [],
      attentionTickets: [],
    });

    mockGetTickets.mockResolvedValue({
      tickets: [],
      page: 1,
      pageSize: 50,
      total: 0,
      totalPages: 0,
    });

    renderDashboard();

    expect(
      await screen.findByText("You haven't submitted any tickets yet."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("No resolved tickets found."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("You have no tickets waiting for your response."),
    ).toBeInTheDocument();
  });

  it("shows an error when dashboard loading fails", async () => {
    mockGetRequesterDashboard.mockRejectedValueOnce(
      new Error("Unable to load requester dashboard"),
    );

    renderDashboard();

    expect(
      await screen.findByText("Unable to load requester dashboard"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Reload Dashboard",
      }),
    ).toBeInTheDocument();
  });
});
