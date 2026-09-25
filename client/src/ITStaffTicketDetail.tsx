import { useEffect, useState } from "react";
import {
  Attachment,
  CreatedTicket,
  getTicketById,
} from "./api.js";
import type { User } from "./authApi.js";

interface ITStaffTicketDetailProps {
  user: User;
  ticketId: number;
  onBack: () => void;
}

type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_FOR_REQUESTER"
  | "RESOLVED"
  | "CLOSED"
  | "REOPENED"
  | "CANCELLED";

type ITPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

export default function ITStaffTicketDetail({
  user,
  ticketId,
  onBack,
}: ITStaffTicketDetailProps) {
  const [ticket, setTicket] =
    useState<CreatedTicket | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [status, setStatus] =
    useState<TicketStatus>("OPEN");

  const [owner, setOwner] =
    useState("UNASSIGNED");

  const [itPriority, setItPriority] =
    useState<ITPriority>("MEDIUM");

  const [resolutionSummary, setResolutionSummary] =
    useState("");

  const [publicComment, setPublicComment] =
    useState("");

  const [internalNote, setInternalNote] =
    useState("");

  const [publicComments, setPublicComments] =
    useState<string[]>([]);

  const [internalNotes, setInternalNotes] =
    useState<string[]>([]);

  useEffect(() => {
    async function loadTicket() {
      setLoading(true);
      setError("");

      try {
        const data = await getTicketById(ticketId);

        setTicket(data);

        if (data.currentStatus === "NEW") {
          setStatus("OPEN");
        } else {
          setStatus(
            data.currentStatus as TicketStatus
          );
        }
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

  function saveChanges() {
    alert("Ticket changes saved.");
  }

  function postPublicComment() {
    const comment = publicComment.trim();

    if (!comment) {
      alert("Please enter a public comment.");
      return;
    }

    setPublicComments((previous) => [
      ...previous,
      comment,
    ]);

    setPublicComment("");

    alert("Public comment added.");
  }

  function addInternalNote() {
    const note = internalNote.trim();

    if (!note) {
      alert("Please enter an internal note.");
      return;
    }

    setInternalNotes((previous) => [
      ...previous,
      note,
    ]);

    setInternalNote("");

    alert("Internal note added.");
  }

  function claimTicket() {
    setOwner(user.id);
    alert("Ticket claimed.");
  }

  function reassignTicket() {
    if (owner === "UNASSIGNED") {
      alert("Please select an IT Staff owner first.");
      return;
    }

    alert("Ticket reassigned.");
  }

  if (loading) {
    return (
      <main className="ticket-main">
        <section className="ticket-card it-staff-detail-page">
          <div className="tickets-state">
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
        
        <section className="ticket-card it-staff-detail-page">
          <div className="tickets-state error-state">
            <h1>Unable to load ticket</h1>

            <p>
              {error || "Ticket not found."}
            </p>

            <button
              type="button"
              className="secondary-button"
              onClick={onBack}
            >
              ← Back to Queue
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="ticket-main">

        <div
      style={{
        color: "red",
        fontSize: "30px",
        fontWeight: "bold",
        padding: "20px",
      }}
    >
      ISSUE 7 TEST
    </div>
    
      <section className="ticket-card it-staff-detail-page">

        <div className="ticket-detail-topbar">
          <div className="breadcrumb">
            <span>My Queue</span>
            <span>›</span>
            <strong>Ticket Detail</strong>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={onBack}
          >
            ← Back to Queue
          </button>
        </div>

        <section className="ticket-information-card">

          <h1>Ticket Detail</h1>

          <div className="ticket-field-grid">

            <div className="detail-field">
              <label>Ticket No.</label>

              <input
                value={ticket.ticketNumber}
                readOnly
              />
            </div>

            <div className="detail-field">
              <label>Requester</label>

              <input
                value={ticket.requester.name}
                readOnly
              />
            </div>

            <div className="detail-field">
              <label>Category</label>

              <input
                value={ticket.category.name}
                readOnly
              />
            </div>

            <div className="detail-field">
              <label>Related System</label>

              <input
                value={ticket.relatedSystem.name}
                readOnly
              />
            </div>

            <div className="detail-field">
              <label>Requested Priority</label>

              <span className="priority-badge">
                {ticket.requestedPriority}
              </span>
            </div>

            <div className="detail-field editable-field">
              <label>IT Priority</label>

              <select
                value={itPriority}
                onChange={(event) =>
                  setItPriority(
                    event.target.value as ITPriority
                  )
                }
              >
                <option value="LOW">
                  Low
                </option>

                <option value="MEDIUM">
                  Medium
                </option>

                <option value="HIGH">
                  High
                </option>

                <option value="URGENT">
                  Urgent
                </option>
              </select>
            </div>

            <div className="detail-field editable-field">
              <label>Status</label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as TicketStatus
                  )
                }
              >
                <option value="OPEN">
                  Open
                </option>

                <option value="IN_PROGRESS">
                  In Progress
                </option>

                <option value="WAITING_FOR_REQUESTER">
                  Waiting for Requester
                </option>

                <option value="RESOLVED">
                  Resolved
                </option>

                <option value="CLOSED">
                  Closed
                </option>

                <option value="REOPENED">
                  Reopened
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>
              </select>
            </div>

            <div className="detail-field editable-field">
              <label>Ticket Owner</label>

              <select
                value={owner}
                onChange={(event) =>
                  setOwner(event.target.value)
                }
              >
                <option value="UNASSIGNED">
                  Unassigned
                </option>

                <option value={user.id}>
                  {user.name} — IT Staff
                </option>

                <option value="NANDAR_IT">
                  Nandar IT
                </option>
              </select>
            </div>

          </div>

          <div className="detail-wide-field">
            <label>Summary</label>

            <input
              value={ticket.summary}
              readOnly
            />
          </div>

          <div className="detail-wide-field">
            <label>Description</label>

            <textarea
              value={ticket.description}
              readOnly
            />
          </div>

          <div className="detail-wide-field editable-field">
            <label>Resolution Summary</label>

            <textarea
              value={resolutionSummary}
              onChange={(event) =>
                setResolutionSummary(
                  event.target.value
                )
              }
              placeholder="Add resolution summary..."
            />
          </div>

          <div className="ownership-actions">

            <div>
              <strong>Ticket Ownership</strong>

              <p>
                Current owner:{" "}
                {owner === "UNASSIGNED"
                  ? "Unassigned"
                  : owner === user.id
                    ? user.name
                    : "Nandar IT"}
              </p>
            </div>

            <div className="action-buttons">

              <button
                type="button"
                className="secondary-button"
                onClick={claimTicket}
              >
                Claim Ticket
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={reassignTicket}
              >
                Reassign
              </button>

            </div>

          </div>

          <div className="ticket-action-row">
            <button
              type="button"
              className="primary-button"
              onClick={saveChanges}
            >
              Save Changes
            </button>
          </div>

        </section>

        <section className="operational-section">

          <div className="section-heading">
            <div>
              <h2>📎 Attachments</h2>

              <p>
                Existing attachments submitted with this ticket.
              </p>
            </div>
          </div>

          {ticket.attachments.length === 0 ? (
            <div className="empty-state-box">
              No attachments.
            </div>
          ) : (
            <div className="attachment-list">

              {ticket.attachments.map(
                (attachment: Attachment) => (
                  <div
                    key={attachment.id}
                    className="attachment-item"
                  >
                    <div>
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

                    <button
                      type="button"
                      className="secondary-button"
                    >
                      View
                    </button>
                  </div>
                )
              )}

            </div>
          )}

        </section>

        <section className="operational-section public-comments-panel">

          <div className="section-heading">
            <div>
              <h2>💬 Public Comments</h2>

              <p>
                Visible to the requester.
              </p>
            </div>

            <span className="visibility-badge public">
              PUBLIC
            </span>
          </div>

          <div className="comment-list">

            {publicComments.length === 0 ? (
              <div className="empty-state-box">
                No public comments yet.
              </div>
            ) : (
              publicComments.map(
                (comment, index) => (
                  <article
                    key={index}
                    className="comment-item"
                  >
                    <div className="comment-avatar">
                      {user.name
                        .split(" ")
                        .map(
                          (part) => part[0]
                        )
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div className="comment-body">

                      <div className="comment-header">
                        <strong>
                          {user.name}
                        </strong>

                        <span className="role-badge">
                          IT Staff
                        </span>
                      </div>

                      <p>{comment}</p>

                    </div>
                  </article>
                )
              )
            )}

          </div>

          <div className="comment-form">

            <textarea
              value={publicComment}
              onChange={(event) =>
                setPublicComment(
                  event.target.value
                )
              }
              placeholder="Write a message that the requester can see..."
            />

            <button
              type="button"
              className="primary-button"
              onClick={postPublicComment}
            >
              Post Public Comment
            </button>

          </div>

        </section>

        <section className="operational-section internal-notes-panel">

          <div className="section-heading">

            <div>
              <h2>🔒 Internal Notes</h2>

              <p>
                Private information for IT Staff only.
              </p>
            </div>

            <span className="visibility-badge private">
              PRIVATE
            </span>

          </div>

          <div className="security-warning">
            🔒 Internal notes are NOT visible to the requester.
            Do not post requester-facing information here.
          </div>

          <div className="comment-list">

            {internalNotes.length === 0 ? (
              <div className="empty-state-box">
                No internal notes yet.
              </div>
            ) : (
              internalNotes.map(
                (note, index) => (
                  <article
                    key={index}
                    className="internal-note-item"
                  >
                    <strong>
                      {user.name}
                    </strong>

                    <span className="role-badge">
                      IT Staff
                    </span>

                    <p>{note}</p>
                  </article>
                )
              )
            )}

          </div>

          <div className="comment-form">

            <textarea
              value={internalNote}
              onChange={(event) =>
                setInternalNote(
                  event.target.value
                )
              }
              placeholder="Write a private internal note..."
            />

            <button
              type="button"
              className="internal-note-button"
              onClick={addInternalNote}
            >
              Add Internal Note
            </button>

          </div>

        </section>

      </section>

      <style>{`

        .it-staff-detail-page {
          width: 100%;
          box-sizing: border-box;
        }

        .ticket-detail-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #5A6B63;
          font-size: 14px;
        }

        .breadcrumb strong {
          color: #26332D;
        }

        .ticket-information-card,
        .operational-section {
          padding: 20px;
          border: 1px solid #D5E4DC;
          border-radius: 10px;
          background: #FFFFFF;
          margin-bottom: 20px;
        }

        .ticket-information-card h1 {
          margin: 0 0 20px;
          color: #006B3C;
          font-size: 22px;
        }

        .ticket-field-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .detail-field label,
        .detail-wide-field label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          color: #26332D;
          font-size: 13px;
        }

        .detail-field input,
        .detail-field select,
        .detail-wide-field input,
        .detail-wide-field textarea {
          width: 100%;
          box-sizing: border-box;
          min-height: 42px;
          padding: 10px 12px;
          border: 1px solid #D5E4DC;
          border-radius: 6px;
          background: #FFFFFF;
          font-size: 14px;
        }

        .editable-field select,
        .editable-field textarea {
          border-color: #006B3C;
          background: #F5FBF7;
        }

        .detail-wide-field {
          margin-top: 16px;
        }

        .detail-wide-field textarea {
          min-height: 80px;
          resize: vertical;
        }

        .priority-badge {
          display: inline-flex;
          align-items: center;
          min-height: 32px;
          padding: 4px 12px;
          border-radius: 999px;
          background: #FFF4CC;
          color: #92400E;
          font-size: 13px;
          font-weight: 700;
        }

        .ownership-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-top: 20px;
          padding: 16px;
          border: 1px solid #D5E4DC;
          border-radius: 8px;
          background: #F5F7F6;
        }

        .ownership-actions p {
          margin: 6px 0 0;
          color: #5A6B63;
          font-size: 14px;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
        }

        .ticket-action-row {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 16px;
        }

        .section-heading h2 {
          margin: 0 0 5px;
          color: #006B3C;
          font-size: 18px;
        }

        .section-heading p {
          margin: 0;
          color: #5A6B63;
          font-size: 13px;
        }

        .visibility-badge {
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
        }

        .visibility-badge.public {
          background: #EAF6EF;
          color: #006B3C;
        }

        .visibility-badge.private {
          background: #FFF4CC;
          color: #7A5600;
        }

        .empty-state-box {
          padding: 16px;
          border: 1px dashed #C8D8D0;
          border-radius: 8px;
          color: #5A6B63;
          background: #F9FBFA;
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

        .attachment-item div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .attachment-item span {
          color: #5A6B63;
          font-size: 13px;
        }

        .public-comments-panel {
          border-left: 4px solid #006B3C;
        }

        .internal-notes-panel {
          background: #FFF9E8;
          border: 1px solid #F0D68A;
          border-left: 4px solid #C28A00;
        }

        .security-warning {
          margin-bottom: 16px;
          padding: 12px;
          border-radius: 7px;
          background: #FFF1C7;
          color: #765600;
          font-size: 13px;
          font-weight: 600;
        }

        .comment-form {
          display: flex;
          gap: 10px;
          align-items: stretch;
          margin-top: 16px;
        }

        .comment-form textarea {
          flex: 1;
          min-height: 70px;
          padding: 10px 12px;
          border: 1px solid #D5E4DC;
          border-radius: 6px;
          resize: vertical;
          box-sizing: border-box;
        }

        .comment-form button {
          min-width: 170px;
        }

        .comment-list {
          display: grid;
          gap: 10px;
        }

        .comment-item {
          display: flex;
          gap: 12px;
          padding: 14px;
          border: 1px solid #D5E4DC;
          border-radius: 8px;
          background: #F9FBFA;
        }

        .comment-avatar {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #EAF6EF;
          color: #006B3C;
          font-weight: 700;
        }

        .comment-body {
          flex: 1;
        }

        .comment-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .comment-body p {
          margin: 0;
        }

        .role-badge {
          padding: 3px 8px;
          border-radius: 999px;
          background: #EAF6EF;
          color: #006B3C;
          font-size: 11px;
          font-weight: 700;
        }

        .internal-note-item {
          padding: 14px;
          border: 1px solid #E6CB7A;
          border-radius: 8px;
          background: #FFFDF5;
        }

        .internal-note-item .role-badge {
          margin-left: 8px;
        }

        .internal-note-item p {
          margin: 8px 0 0;
        }

        .internal-note-button {
          min-height: 44px;
          padding: 10px 16px;
          border: 1px solid #C28A00;
          border-radius: 6px;
          background: #FFF4CC;
          color: #7A5600;
          font-weight: 700;
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .ticket-field-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 767px) {

          .ticket-main {
            padding: 12px;
            box-sizing: border-box;
          }

          .ticket-detail-topbar {
            flex-direction: column;
            align-items: stretch;
          }

          .ticket-detail-topbar button {
            width: 100%;
          }

          .ticket-field-grid {
            grid-template-columns: 1fr;
          }

          .ticket-information-card,
          .operational-section {
            padding: 14px;
          }

          .ownership-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .action-buttons {
            flex-direction: column;
          }

          .action-buttons button {
            width: 100%;
          }

          .ticket-action-row {
            justify-content: stretch;
          }

          .ticket-action-row button {
            width: 100%;
          }

          .section-heading {
            flex-direction: column;
          }

          .comment-form {
            flex-direction: column;
          }

          .comment-form textarea,
          .comment-form button {
            width: 100%;
            box-sizing: border-box;
          }

          .attachment-item {
            align-items: stretch;
            flex-direction: column;
          }
        }

      `}</style>
    </main>
  );
}