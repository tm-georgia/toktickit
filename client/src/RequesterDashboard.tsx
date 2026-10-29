
import { useEffect, useState } from "react";
import {
  getRequesterDashboard,
  type RequesterDashboardResponse,
  type RequesterDashboardTicket,
} from "./api.js";

interface RequesterDashboardProps {
  onBack: () => void;
  onViewTicket: (ticketId: number) => void;
  onViewAllTickets: () => void;
}

function formatStatus(status: string): string {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function TicketList({
  title,
  tickets,
  emptyMessage,
  onViewTicket,
}: {
  title: string;
  tickets: RequesterDashboardTicket[];
  emptyMessage: string;
  onViewTicket: (ticketId: number) => void;
}) {
  return (
    <section className="dashboard-section">
      <h2>{title}</h2>

      {tickets.length === 0 ? (
        <p className="dashboard-empty">{emptyMessage}</p>
      ) : (
        <div className="dashboard-ticket-list">
          {tickets.map((ticket) => (
            <button
              className="dashboard-ticket"
              type="button"
              key={ticket.id}
              onClick={() => onViewTicket(ticket.id)}
            >
              <span className="dashboard-ticket-main">
                <strong>{ticket.ticketNumber}</strong>
                <span>{ticket.summary}</span>
              </span>

              <span className="dashboard-ticket-details">
                <span className="dashboard-status">
                  {formatStatus(ticket.currentStatus)}
                </span>
                <span>
                  Updated{" "}
                  {new Date(ticket.updatedAt).toLocaleDateString()}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default function RequesterDashboard({
  onBack,
  onViewTicket,
  onViewAllTickets,
}: RequesterDashboardProps) {
  const [dashboard, setDashboard] =
    useState<RequesterDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const result = await getRequesterDashboard();
      setDashboard(result);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load your dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <div className="brand-mark">TokTickIT</div>
          <span>Ticketing System</span>
        </div>

        <button type="button" onClick={onBack}>
          Back to Home
        </button>
      </header>

      <main className="page-content requester-dashboard">
        <div className="dashboard-heading">
          <div>
            <h1>My Dashboard</h1>
            <p>Check the status of your IT support requests.</p>
          </div>

          <button type="button" onClick={onViewAllTickets}>
            View My Tickets
          </button>
        </div>

        {loading && (
          <p className="dashboard-message" role="status">
            Loading your dashboard...
          </p>
        )}

        {!loading && error && (
          <section className="dashboard-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => void loadDashboard()}>
              Try Again
            </button>
          </section>
        )}

        {!loading && !error && dashboard && (
          <>
            <section className="dashboard-metrics" aria-label="Ticket metrics">
              <button
                className="dashboard-metric"
                type="button"
                onClick={onViewAllTickets}
              >
                <span>Open Tickets</span>
                <strong>{dashboard.metrics.openTickets}</strong>
              </button>

              <button
                className="dashboard-metric"
                type="button"
                onClick={onViewAllTickets}
              >
                <span>Waiting for You</span>
                <strong>{dashboard.metrics.waitingForRequester}</strong>
              </button>

              <button
                className="dashboard-metric"
                type="button"
                onClick={onViewAllTickets}
              >
                <span>Recently Updated</span>
                <strong>{dashboard.metrics.recentlyUpdated}</strong>
              </button>

              <button
                className="dashboard-metric"
                type="button"
                onClick={onViewAllTickets}
              >
                <span>Recently Resolved</span>
                <strong>{dashboard.metrics.recentlyResolved}</strong>
              </button>
            </section>

            <TicketList
              title="Recently Updated Tickets"
              tickets={dashboard.recentTickets}
              emptyMessage="You have no recently updated tickets."
              onViewTicket={onViewTicket}
            />

            <TicketList
              title="Recently Resolved Tickets"
              tickets={dashboard.recentlyResolvedTickets}
              emptyMessage="You have no recently resolved tickets."
              onViewTicket={onViewTicket}
            />

            <TicketList
              title="Tickets Requiring Your Attention"
              tickets={dashboard.attentionTickets}
              emptyMessage="You have no tickets requiring your attention."
              onViewTicket={onViewTicket}
            />
          </>
        )}
      </main>
    </div>
  );
}
