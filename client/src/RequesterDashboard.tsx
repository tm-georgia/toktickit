
import { useEffect, useState } from "react";
import {
  getRequesterDashboard,
  getTickets,
  type RequesterDashboardResponse,
  type RequesterDashboardTicket,
} from "./api.js";

interface RequesterDashboardProps {
  onBack: () => void;
  onViewTicket: (ticketId: number) => void;
  onViewAllTickets: () => void;
  onCreateTicket?: () => void;
  userName?: string;
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClass(status: string) {
  return `status-${status.toLowerCase().replaceAll("_", "-")}`;
}

function TicketList({
  tickets,
  onViewTicket,
  emptyMessage,
}: {
  tickets: RequesterDashboardTicket[];
  onViewTicket: (ticketId: number) => void;
  emptyMessage: string;
}) {
  if (tickets.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <div className="requester-ticket-list">
      {tickets.map((ticket) => (
        <button
          type="button"
          className="requester-ticket"
          key={ticket.id}
          onClick={() => onViewTicket(ticket.id)}
        >
          <div className="requester-ticket-main">
            <strong>{ticket.ticketNumber}</strong>
            <span>{ticket.summary}</span>
          </div>

          <div className="requester-ticket-meta">
            <span
              className={`requester-status ${getStatusClass(ticket.currentStatus)}`}
            >
              {formatStatus(ticket.currentStatus)}
            </span>

            <time>{formatDate(ticket.updatedAt)}</time>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function RequesterDashboard({
  onBack,
  onViewTicket,
  onViewAllTickets,
  onCreateTicket,
  userName = "Requester",
}: RequesterDashboardProps) {
  const [dashboard, setDashboard] =
    useState<RequesterDashboardResponse | null>(null);

  const [recentTickets, setRecentTickets] =
    useState<RequesterDashboardTicket[]>([]);

  const [resolvedTickets, setResolvedTickets] =
    useState<RequesterDashboardTicket[]>([]);

  const [attentionTickets, setAttentionTickets] =
    useState<RequesterDashboardTicket[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [dashboardResult, ticketResult] = await Promise.all([
          getRequesterDashboard(),
          getTickets({
            page: 1,
            pageSize: 50,
            sort: "updatedDesc",
          }),
        ]);

        const allTickets: RequesterDashboardTicket[] =
          Array.isArray(ticketResult.tickets)
            ? ticketResult.tickets.map((ticket) => ({
                id: ticket.id,
                ticketNumber: ticket.ticketNumber,
                summary: ticket.summary,
                currentStatus: ticket.currentStatus as RequesterDashboardTicket["currentStatus"],
                requestedPriority: ticket.requestedPriority,
                updatedAt: ticket.updatedAt,
              }))
            : [];

        const recent = allTickets.slice(0, 5);

        const resolved = allTickets
          .filter((ticket) => ticket.currentStatus === "RESOLVED")
          .slice(0, 5);

        const attention = allTickets
          .filter(
            (ticket) => ticket.currentStatus === "WAITING_FOR_REQUESTER"
          )
          .slice(0, 5);

        if (isMounted) {
          setDashboard(dashboardResult);
          setRecentTickets(recent);
          setResolvedTickets(resolved);
          setAttentionTickets(attention);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your dashboard."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = dashboard
    ? [
        {
          title: "My Open Tickets",
          count: dashboard.metrics.openTickets,
        },
        {
          title: "In Progress",
          count: dashboard.metrics.inProgressTickets,
        },
        {
          title: "Resolved",
          count: dashboard.metrics.resolvedTickets,
        },
        {
          title: "Closed",
          count: dashboard.metrics.closedTickets,
        },
      ]
    : [];

  return (
    <div className="requester-dashboard-page">
      <header className="requester-navbar">
        <button
          className="requester-brand"
          onClick={onBack}
          type="button"
        >
          <span className="requester-logo">◷</span>
          <span>TokTickIT</span>
        </button>

        <nav className="requester-nav-links">
          <button
            className="requester-nav-link active"
            type="button"
            onClick={onViewAllTickets}
          >
            <span>▣</span>
            My Tickets
          </button>

          <button
            className="requester-nav-link"
            type="button"
            onClick={onCreateTicket}
          >
            <span>⊕</span>
            Create Ticket
          </button>
        </nav>

        <button className="requester-profile" type="button">
          <span className="requester-avatar">
            {userName.charAt(0).toUpperCase()}
          </span>
          <span>{userName}</span>
          <span>⌄</span>
        </button>
      </header>

      <main className="requester-content">
        <section className="requester-welcome">
          <h1>Welcome, {userName}!</h1>
          <p>Here's the latest on your requests.</p>
        </section>

        {loading && <p>Loading your dashboard...</p>}

        {!loading && error && (
          <section className="requester-panel">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Reload Dashboard
            </button>
          </section>
        )}

        {!loading && !error && dashboard && (
          <>
            <section className="requester-metrics">
              {metrics.map((metric) => (
                <button
                  className="requester-metric"
                  key={metric.title}
                  type="button"
                  onClick={onViewAllTickets}
                >
                  <span className="metric-title">{metric.title}</span>
                  <strong>{metric.count}</strong>
                  <span className="metric-link">View all</span>
                </button>
              ))}
            </section>

            <section className="requester-dashboard-grid">
              <section className="requester-panel recent-panel">
                <div className="requester-panel-heading">
                  <h2>My Recent Tickets</h2>
                  <button type="button" onClick={onViewAllTickets}>
                    View all
                  </button>
                </div>

                <TicketList
                  tickets={recentTickets}
                  onViewTicket={onViewTicket}
                  emptyMessage="You haven't submitted any tickets yet."
                />
              </section>

              <aside className="requester-panel quick-actions">
                <h2>Quick Actions</h2>

                <button
                  type="button"
                  className="requester-action"
                  onClick={onCreateTicket}
                >
                  <span className="requester-action-icon">+</span>
                  <span className="requester-action-text">
                    <strong>Create Ticket</strong>
                    <small>Submit a new request</small>
                  </span>
                </button>

                <button
                  type="button"
                  className="requester-action"
                  onClick={onViewAllTickets}
                >
                  <span className="requester-action-icon ticket-icon">
                    ▣
                  </span>
                  <span className="requester-action-text">
                    <strong>View My Tickets</strong>
                    <small>Track existing requests</small>
                  </span>
                </button>
              </aside>
            </section>

            <section className="requester-panel">
              <div className="requester-panel-heading">
                <h2>Recently Resolved</h2>
                <button type="button" onClick={onViewAllTickets}>
                  View all
                </button>
              </div>

              <TicketList
                tickets={resolvedTickets}
                onViewTicket={onViewTicket}
                emptyMessage="No resolved tickets found."
              />
            </section>

            <section className="requester-panel">
              <div className="requester-panel-heading">
                <h2>Needs Your Attention</h2>
                <button type="button" onClick={onViewAllTickets}>
                  View all
                </button>
              </div>

              <p>These tickets are waiting for your response.</p>

              <TicketList
                tickets={attentionTickets}
                onViewTicket={onViewTicket}
                emptyMessage="You have no tickets waiting for your response."
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
