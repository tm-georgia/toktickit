import { useEffect, useState } from "react";
import {
  Attachment,
  CreatedTicket,
  getTicketById,
} from "./api.js";
import type { User } from "./authApi.js";

interface TicketDetailProps {
  user: User;
  ticketId: number;
  onBack: () => void;
}

type DisplayStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "PENDING";

export default function TicketDetail({
  user,
  ticketId,
  onBack,
}: TicketDetailProps) {
  const [ticket, setTicket] = useState<CreatedTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTicket() {
      setLoading(true);
      setError("");

      try {
        const data = await getTicketById(ticketId);
        setTicket(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load ticket."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTicket();
  }, [ticketId]);

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  function displayStatus(): DisplayStatus {
    const statuses: DisplayStatus[] = [
      "OPEN",
      "IN_PROGRESS",
      "RESOLVED",
      "PENDING",
    ];

    return statuses[ticketId % statuses.length];
  }

  function statusLabel(value: DisplayStatus) {
    if (value === "OPEN") return "Open";
    if (value === "IN_PROGRESS") return "In Progress";
    if (value === "RESOLVED") return "Resolved";
    return "Pending";
  }

  function statusBadgeStyle(value: DisplayStatus) {
    if (value === "OPEN") {
      return {
        backgroundColor: "#EAF2FF",
        color: "#1D4ED8",
        border: "1px solid #BFDBFE",
      };
    }

    if (value === "PENDING") {
      return {
        backgroundColor: "#FFF4CC",
        color: "#92400E",
        border: "1px solid #F3D27A",
      };
    }

    return {
      backgroundColor: "#EAF6EF",
      color: "#166534",
      border: "1px solid #B8D9C7",
    };
  }

  if (loading) {
    return (
      <main className="ticket-main">
        <section className="ticket-card ticket-detail-page">
          <div className="tickets-state" role="status">
            <div className="spinner" />
            <p>Loading ticket...</p>
          </div>
        </section>
      </main>
    );
  }

  if (error || !ticket) {
    return (
      <main className="ticket-main">
        <section className="ticket-card ticket-detail-page">
          <div className="tickets-state error-state">
            <h1>Unable to load ticket</h1>
            <p>{error || "Ticket not found."}</p>

            <button
              type="button"
              className="secondary-button"
              onClick={onBack}
            >
              Back to My Tickets
            </button>
          </div>
        </section>
      </main>
    );
  }

  const status = displayStatus();

  return (
    <main className="ticket-main">
      <section className="ticket-card ticket-detail-page">
        <div className="ticket-detail-header">
          <div>
            <div className="home-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onBack}
            >
              Back
            </button>
            </div>

            <h1>Ticket Detail</h1>
            <p>
              Ticket Number:{" "}
              <strong>{ticket.ticketNumber}</strong>
            </p>
          </div>
        </div>

        <div className="ticket-detail-status">
          <span>Status</span>

          <span
            className="ticket-badge"
            style={{
              ...statusBadgeStyle(status),
              display: "inline-block",
              padding: "5px 12px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            {statusLabel(status)}
          </span>
        </div>

        <div className="ticket-detail-grid">
          <div className="detail-field">
            <span>Requester</span>
            <strong>{user.name}</strong>
          </div>

          <div className="detail-field">
            <span>Ticket Date</span>
            <strong>{formatDate(ticket.ticketDate)}</strong>
          </div>

          <div className="detail-field">
            <span>Category</span>
            <strong>{ticket.category.name}</strong>
          </div>

          <div className="detail-field">
            <span>Related System</span>
            <strong>{ticket.relatedSystem.name}</strong>
          </div>

          <div className="detail-field">
            <span>Requested Priority</span>
            <strong>{ticket.requestedPriority}</strong>
          </div>

          <div className="detail-field">
            <span>Last Updated</span>
            <strong>{formatDate(ticket.updatedAt)}</strong>
          </div>
        </div>

        <div className="ticket-detail-section">
          <h2>Summary</h2>
          <p>{ticket.summary}</p>
        </div>

        <div className="ticket-detail-section">
          <h2>Description</h2>
          <p className="ticket-description">
            {ticket.description}
          </p>
        </div>

        <div className="ticket-detail-section">
          <h2>Attachments</h2>

          {ticket.attachments.length === 0 ? (
            <p>No attachments.</p>
          ) : (
            <div className="attachment-list">
              {ticket.attachments.map(
                (attachment: Attachment) => (
                  <div
                    key={attachment.id}
                    className="attachment-item"
                  >
                    <strong>
                      {attachment.originalFileName}
                    </strong>

                    <span>
                      {Math.round(
                        attachment.sizeBytes / 1024
                      )}{" "}
                      KB
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div className="ticket-detail-section">
          <h2>Public Comments</h2>

          <div className="empty-comments">
            <p>No public comments yet.</p>
          </div>
        </div>

        <div className="ticket-detail-section resolved-section">
          <h2>Problem Appears Resolved?</h2>

          <p>
            If your problem has been resolved, you can let IT
            Staff know.
          </p>
          <div className="home-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() =>
              alert("Problem reported as resolved.")
            }
          >
            Problem Appears Resolved
          </button>
          </div>
        </div>
      </section>

      <style>{`
        .ticket-detail-page {
          width: 100%;
        }

        .ticket-detail-header {
          margin-bottom: 20px;
        }

        .ticket-detail-header h1 {
          margin: 18px 0 6px;
        }

        .ticket-detail-header p {
          margin: 0;
        }

        .ticket-detail-status {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding: 16px;
          border: 1px solid #D5E4DC;
          border-radius: 10px;
          background: #F5F7F6;
        }

        .ticket-detail-status > span:first-child {
          font-weight: 700;
          color: #006B3C;
        }

        .ticket-detail-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 24px;
        }

        .detail-field {
          padding: 16px;
          border: 1px solid #D5E4DC;
          border-radius: 8px;
          background: #F5F7F6;
        }

        .detail-field span {
          display: block;
          margin-bottom: 6px;
          color: #5A6B63;
          font-size: 13px;
        }

        .detail-field strong {
          color: #26332D;
        }

        .ticket-detail-section {
          margin-top: 24px;
          padding: 20px;
          border: 1px solid #D5E4DC;
          border-radius: 10px;
          background: white;
        }

        .ticket-detail-section h2 {
          margin: 0 0 12px;
          color: #006B3C;
          font-size: 18px;
        }

        .ticket-detail-section p {
          margin: 0;
          line-height: 1.6;
        }

        .ticket-description {
          white-space: pre-wrap;
        }

        .attachment-list {
          display: grid;
          gap: 10px;
        }

        .attachment-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid #D5E4DC;
          border-radius: 8px;
          background: #F5F7F6;
        }

        .attachment-item span {
          color: #5A6B63;
          font-size: 13px;
        }

        .empty-comments {
          padding: 16px;
          border-radius: 8px;
          background: #F5F7F6;
        }

        .resolved-section {
          background: #EAF6EF;
        }

        .resolved-section p {
          margin-bottom: 16px;
        }

        @media (max-width: 900px) {
  .ticket-detail-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .ticket-main {
    padding: 16px;
    box-sizing: border-box;
  }

  .ticket-detail-page {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .ticket-detail-header {
    width: 100%;
  }

  .ticket-detail-header h1 {
    font-size: 24px;
  }

  .ticket-detail-grid {
    grid-template-columns: 1fr;
  }

  .ticket-detail-status {
    align-items: flex-start;
    flex-direction: column;
  }

  .ticket-detail-section {
    padding: 16px;
    box-sizing: border-box;
  }

  .attachment-item {
    align-items: flex-start;
    flex-direction: column;
  }

  .home-actions {
    width: 100%;
    flex-direction: column;
  }

  .home-actions button {
    width: 100%;
  }
}
      `}</style>
    </main>
  );
}