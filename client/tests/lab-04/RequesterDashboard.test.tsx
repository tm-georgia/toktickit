
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RequesterDashboard from "../../src/RequesterDashboard.js";

const mockGetRequesterDashboard = vi.fn();

vi.mock("../../src/api.js", () => ({
  getRequesterDashboard: (...args: unknown[]) =>
    mockGetRequesterDashboard(...args),
}));

describe("Lab 4 Requester Dashboard UI", () => {
  const onBack = vi.fn();
  const onViewTicket = vi.fn();
  const onViewAllTickets = vi.fn();

  const dashboard = {
    metrics: {
      openTickets: 3,
      waitingForRequester: 1,
      recentlyUpdated: 2,
      recentlyResolved: 1,
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

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRequesterDashboard.mockResolvedValue(dashboard);
  });

  it("shows the dashboard metrics and ticket lists", async () => {
    render(
      <RequesterDashboard
        onBack={onBack}
        onViewTicket={onViewTicket}
        onViewAllTickets={onViewAllTickets}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "My Dashboard" }),
    ).toBeInTheDocument();

    expect(
      await screen.findByText("Cannot access campus Wi-Fi"),
    ).toBeInTheDocument();

    expect(screen.getByText("Printer problem")).toBeInTheDocument();
    expect(
      screen.getByText("Please provide more information"),
    ).toBeInTheDocument();

    expect(screen.getByText("Open Tickets")).toBeInTheDocument();
    expect(screen.getByText("Waiting for You")).toBeInTheDocument();
    expect(screen.getByText("Recently Updated")).toBeInTheDocument();
    expect(screen.getByText("Recently Resolved")).toBeInTheDocument();

    expect(screen.getByText("TCK-20261028-0001")).toBeInTheDocument();
    expect(mockGetRequesterDashboard).toHaveBeenCalledTimes(1);
  });

  it("opens a ticket when its row is clicked", async () => {
    const user = userEvent.setup();

    render(
      <RequesterDashboard
        onBack={onBack}
        onViewTicket={onViewTicket}
        onViewAllTickets={onViewAllTickets}
      />,
    );

    await screen.findByText("Cannot access campus Wi-Fi");

    await user.click(
      screen.getByRole("button", {
        name: /TCK-20261028-0001/,
      }),
    );

    expect(onViewTicket).toHaveBeenCalledWith(101);
  });

  it("navigates back home and to My Tickets", async () => {
    const user = userEvent.setup();

    render(
      <RequesterDashboard
        onBack={onBack}
        onViewTicket={onViewTicket}
        onViewAllTickets={onViewAllTickets}
      />,
    );

    await screen.findByText("Cannot access campus Wi-Fi");

    await user.click(
      screen.getByRole("button", { name: "Back to Home" }),
    );
    await user.click(
      screen.getByRole("button", { name: "View My Tickets" }),
    );

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onViewAllTickets).toHaveBeenCalledTimes(1);
  });

  it("shows empty messages when no tickets are returned", async () => {
    mockGetRequesterDashboard.mockResolvedValue({
      metrics: {
        openTickets: 0,
        waitingForRequester: 0,
        recentlyUpdated: 0,
        recentlyResolved: 0,
      },
      recentTickets: [],
      recentlyResolvedTickets: [],
      attentionTickets: [],
    });

    render(
      <RequesterDashboard
        onBack={onBack}
        onViewTicket={onViewTicket}
        onViewAllTickets={onViewAllTickets}
      />,
    );

    expect(
      await screen.findByText(
        "You have no recently updated tickets.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("You have no recently resolved tickets."),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "You have no tickets requiring your attention.",
      ),
    ).toBeInTheDocument();
  });

  it("shows an error and retries loading the dashboard", async () => {
    const user = userEvent.setup();

    mockGetRequesterDashboard
      .mockRejectedValueOnce(new Error("Unable to load requester dashboard"))
      .mockResolvedValueOnce(dashboard);

    render(
      <RequesterDashboard
        onBack={onBack}
        onViewTicket={onViewTicket}
        onViewAllTickets={onViewAllTickets}
      />,
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Unable to load requester dashboard");

    await user.click(
      screen.getByRole("button", { name: "Try Again" }),
    );

    await waitFor(() => {
      expect(mockGetRequesterDashboard).toHaveBeenCalledTimes(2);
    });

    expect(
      await screen.findByText("Cannot access campus Wi-Fi"),
    ).toBeInTheDocument();
  });
});
