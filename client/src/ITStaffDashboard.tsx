
import { useCallback, useEffect, useState } from "react";
import { getITStaffTicketQueue } from "./api.js";
import type { ITStaffTicketQueueItem } from "./api.js";

interface ITStaffDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  onBack: () => void;
  onOpenQueue: (filters?: {
    status?: string;
    assignedTo?: string;
  }) => void;
  onOpenTicket: (ticketId: number) => void;
  onCreateTicket?: () => void;
}

interface DashboardMetrics {
  newTickets: number;
  openTickets: number;
  inProgressTickets: number;
  waitingTickets: number;
  myAssigned: number;
}

const emptyMetrics: DashboardMetrics = {
  newTickets: 0,
  openTickets: 0,
  inProgressTickets: 0,
  waitingTickets: 0,
  myAssigned: 0,
};

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

function formatDate(date: string): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ITStaffDashboard({
  user,
  onBack,
  onOpenQueue,
  onOpenTicket,
  onCreateTicket,
}: ITStaffDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics>(emptyMetrics);
  const [recentTickets, setRecentTickets] = useState<
    ITStaffTicketQueueItem[]
  >([]);
  const [lastRefreshed, setLastRefreshed] = useState("Not refreshed yet");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const [
        newResult,
        openResult,
        inProgressResult,
        waitingResult,
        assignedResult,
      ] = await Promise.all([
        getITStaffTicketQueue({
          status: "NEW",
          page: 1,
          pageSize: 1,
        }),
        getITStaffTicketQueue({
          status: "OPEN",
          page: 1,
          pageSize: 1,
        }),
        getITStaffTicketQueue({
          status: "IN_PROGRESS",
          page: 1,
          pageSize: 1,
        }),
        getITStaffTicketQueue({
          status: "WAITING_FOR_REQUESTER",
          page: 1,
          pageSize: 1,
        }),
        getITStaffTicketQueue({
          assignedTo: "me",
          sort: "updatedDesc",
          page: 1,
          pageSize: 5,
        }),
      ]);

      setMetrics({
        newTickets: newResult.total,
        openTickets: openResult.total,
        inProgressTickets: inProgressResult.total,
        waitingTickets: waitingResult.total,
        myAssigned: assignedResult.total,
      });

      setRecentTickets(assignedResult.tickets);
      setLastRefreshed(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    } catch (error) {
      console.error("Unable to load IT Staff dashboard:", error);
      setErrorMessage(
        "Unable to load dashboard data. Please try refreshing.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const metricCards = [
    {
      title: "New",
      count: metrics.newTickets,
      filters: { status: "NEW" },
    },
    {
      title: "Open",
      count: metrics.openTickets,
      filters: { status: "OPEN" },
    },
    {
      title: "In Progress",
      count: metrics.inProgressTickets,
      filters: { status: "IN_PROGRESS" },
    },
    {
      title: "Waiting for Requester",
      count: metrics.waitingTickets,
      filters: { status: "WAITING_FOR_REQUESTER" },
    },
    {
      title: "My Assigned",
      count: metrics.myAssigned,
      filters: { assignedTo: "me" },
    },
  ];

  return (
    <div className="staff-dashboard-page">

      {/* TOP NAVIGATION */}
      <header className="staff-navbar">

        <button
          type="button"
          className="staff-brand"
          onClick={onBack}
        >
          <span className="staff-logo">◷</span>
          <span>TokTickIT</span>
        </button>

        <nav className="staff-nav-links">

          <button
            type="button"
            className="staff-nav-link active"
            onClick={onBack}
          >
            <span>▣</span>
            Dashboard
          </button>

          <button
            type="button"
            className="staff-nav-link"
            onClick={() => onCreateTicket?.()}
          >
            <span>⊕</span>
            Create Ticket
          </button>

        </nav>

        <div className="staff-profile">
          <span className="staff-avatar">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <span>Profile</span>
          <span>⌄</span>
        </div>

      </header>

      {/* MAIN CONTENT */}
      <main className="staff-dashboard-content">

        {/* WELCOME SECTION */}
        <section className="staff-welcome">

          <div>
            <h1>Welcome back, {user.name}!</h1>
            <p>Here's what's happening with your queue today.</p>
          </div>

          <button
            type="button"
            className="staff-refresh-button"
            onClick={() => void loadDashboard()}
            disabled={loading}
          >
            {loading ? "↻ Loading..." : "↻ Refresh"}
          </button>

        </section>

        {/* REFRESH INFORMATION */}
        <span className="staff-refresh-info">
          Last refreshed: {lastRefreshed}
        </span>

        {/* ERROR MESSAGE */}
        {errorMessage && (
          <p role="alert">{errorMessage}</p>
        )}

        {/* FIVE SUMMARY CARDS */}
        <section className="staff-metrics">

          {metricCards.map((metric) => (
            <button
              type="button"
              className="staff-metric-card"
              key={metric.title}
              onClick={() => onOpenQueue(metric.filters)}
            >

              <span className="staff-metric-title">
                {metric.title}
              </span>

              <strong>
                {loading ? "..." : metric.count}
              </strong>

              <small>
                <span>●</span> View all
              </small>

            </button>
          ))}

        </section>

        {/* RECENT TICKETS + QUICK ACTIONS */}
        <section className="staff-dashboard-grid">

          {/* LEFT: RECENT TICKETS */}
          <section className="staff-panel staff-recent-panel">

            <div className="staff-panel-heading">
              <h2>My Recent Tickets</h2>

              <button
                type="button"
                onClick={() => onOpenQueue({ assignedTo: "me" })}
              >
                View all
              </button>
            </div>

            <div className="staff-ticket-list">

              {loading ? (
                <p>Loading your tickets...</p>
              ) : recentTickets.length === 0 ? (
                <p>You don't have any assigned tickets yet.</p>
              ) : (
                recentTickets.map((ticket) => (
                  <button
                    type="button"
                    className="staff-ticket-row"
                    key={ticket.id}
                    onClick={() => onOpenTicket(ticket.id)}
                  >

                    <div className="staff-ticket-main">

                      <strong>
                        {ticket.ticketNumber}
                      </strong>

                      <span>{ticket.summary}</span>

                    </div>

                    <div className="staff-ticket-meta">

                      <span
                        className={`staff-status status-${ticket.currentStatus
                          .toLowerCase()
                          .replaceAll("_", "-")}`}
                      >
                        {formatStatus(ticket.currentStatus)}
                      </span>

                      <time>{formatDate(ticket.updatedAt)}</time>

                    </div>

                  </button>
                ))
              )}

            </div>

          </section>

          {/* RIGHT: QUICK ACTIONS */}
          <aside className="staff-panel staff-quick-actions">

            <h2>Quick Actions</h2>

            <div className="staff-action-grid">

              <button
                type="button"
                className="staff-action-card"
                onClick={() => onCreateTicket?.()}
              >
                <span className="staff-action-icon">+</span>
                <strong>Create Ticket</strong>
              </button>

              <button
                type="button"
                className="staff-action-card"
                onClick={() => onOpenQueue()}
              >
                <span className="staff-action-icon">⌕</span>
                <strong>Search Tickets</strong>
              </button>

              <button
                type="button"
                className="staff-action-card"
                onClick={() => onOpenQueue({ assignedTo: "me" })}
              >
                <span className="staff-action-icon">▤</span>
                <strong>My Queue</strong>
              </button>

            </div>

          </aside>

        </section>

      </main>

    </div>
  );
}
