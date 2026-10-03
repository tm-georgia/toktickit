import { useEffect, useState } from "react";
import {
  Attachment,
  ITStaffTicket,
  addITStaffInternalNote,
  addITStaffPublicComment,
  claimITStaffTicket,
  downloadITStaffAttachment,
  getITStaffTicket,
  getITStaffUsers,
  reassignITStaffTicket,
  updateITStaffPriority,
  updateITStaffResolutionSummary,
  updateITStaffTicketStatus,
} from "./api.js";
import type { User } from "./authApi.js";
import type { ITStaffUser } from "./api.js";

interface ITStaffTicketDetailProps {
  user: User;
  ticketId: number;
  onBack: () => void;
}

type TicketStatus =
  | "NEW"
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
  | "HIGH";

export default function ITStaffTicketDetail({
  user,
  ticketId,
  onBack,
}: ITStaffTicketDetailProps) {
  const [ticket, setTicket] =
  useState<ITStaffTicket | null>(null);

  const [loading, setLoading] = useState(true);
  const [resolutionSummary, setResolutionSummary] = useState("");
  const [error, setError] = useState("");

  const [status, setStatus] =
    useState<TicketStatus>("OPEN");

  const [owner, setOwner] =
  useState<number | null>(null);

  const [itPriority, setItPriority] =
  useState<ITPriority>("MEDIUM");

const [publicComment, setPublicComment] =
  useState("");

const [internalNote, setInternalNote] =
  useState("");

const [activeTab, setActiveTab] = useState<
  "comments" | "notes" | "attachments" | "actions"
>("comments");

const [staffUsers, setStaffUsers] = useState<ITStaffUser[]>([]);

  useEffect(() => {
  async function loadTicket() {
    setLoading(true);
    setError("");

    try {
      const data = await getITStaffTicket(ticketId);

      setTicket(data);

      setStatus(data.currentStatus as TicketStatus);

      setItPriority(
        data.itPriority === "LOW" ||
          data.itPriority === "MEDIUM" ||
          data.itPriority === "HIGH"
          ? data.itPriority
          : "MEDIUM"
      );

      setOwner(data.assignedStaff?.id ?? null);

      setResolutionSummary(data.resolutionSummary ?? "");
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

  void loadTicket();
}, [ticketId]);

useEffect(() => {
  async function loadStaffUsers() {
    try {
      const users = await getITStaffUsers();
      setStaffUsers(users);
    } catch (cause) {
      console.error("Failed to load IT Staff users:", cause);
    }
  }

  void loadStaffUsers();
}, []);

async function handleDownloadAttachment(attachment: Attachment) {
  try {
    setError("");

    const blob = await downloadITStaffAttachment(
      ticketId,
      attachment.id,
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = attachment.originalFileName;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to download attachment.",
    );
  }
}

  async function saveChanges() {
  try {
    setError("");

    await updateITStaffPriority(
      ticketId,
      itPriority
    );

    await updateITStaffTicketStatus(
      ticketId,
      status
    );

    await updateITStaffResolutionSummary(
      ticketId,
      resolutionSummary,
    );

    const updatedTicket =
      await getITStaffTicket(ticketId);

    setTicket(updatedTicket);

   setStatus(updatedTicket.currentStatus as TicketStatus);

    setItPriority(
      updatedTicket.itPriority === "LOW" ||
        updatedTicket.itPriority === "MEDIUM" ||
        updatedTicket.itPriority === "HIGH"
        ? updatedTicket.itPriority
        : "MEDIUM"
    );

    alert("Ticket changes saved.");
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to save ticket changes."
    );
  }
}

async function postPublicComment() {
  const comment = publicComment.trim();

  if (!comment) {
    alert("Please enter a public comment.");
    return;
  }

  try {
    setError("");

    await addITStaffPublicComment(ticketId, comment);

    const refreshedTicket = await getITStaffTicket(ticketId);

    setTicket(refreshedTicket);
    setPublicComment("");
    setActiveTab("comments");
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to add public comment."
    );
  }
}
async function addInternalNote() {
  const note = internalNote.trim();

  if (!note) {
    alert("Please enter an internal note.");
    return;
  }

  try {
    setError("");

    await addITStaffInternalNote(ticketId, note);

    const refreshedTicket = await getITStaffTicket(ticketId);

    setTicket(refreshedTicket);
    setInternalNote("");
    setActiveTab("notes");
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to add internal note."
    );
  }
}
 async function claimTicket() {
  try {
    setError("");

    const updatedTicket =
      await claimITStaffTicket(ticketId);

    setTicket(updatedTicket);
    setOwner(updatedTicket.assignedStaff?.id ?? null);

    alert("Ticket claimed.");
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to claim ticket."
    );
  }
}

  async function reassignTicket() {
  if (owner === null) {
    alert("Please select an IT Staff owner first.");
    return;
  }

  try {
    setError("");

    const updatedTicket =
      await reassignITStaffTicket(
        ticketId,
        owner
      );

    setTicket(updatedTicket);
setOwner(updatedTicket.assignedStaff?.id ?? null);

alert("Ticket reassigned.");

  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to reassign ticket."
    );
  }
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
  className="secondary-button detail-back-button"
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
                 <option value="NEW">New</option>
  <option value="OPEN">Open</option>
  <option value="IN_PROGRESS">In Progress</option>
  <option value="WAITING_FOR_REQUESTER">
    Waiting for Requester
  </option>
  <option value="RESOLVED">Resolved</option>
  <option value="CLOSED">Closed</option>
  <option value="REOPENED">Reopened</option>
  <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="detail-field editable-field">
              <label>Ticket Owner</label>

              <select
  value={owner ?? ""}
  onChange={(event) =>
    setOwner(
      event.target.value
        ? Number(event.target.value)
        : null
    )
  }
>
  <option value="">
    Unassigned
  </option>
   {staffUsers.map((staff) => (
    <option key={staff.id} value={staff.id}>
      {staff.name} — {staff.email}
    </option>
  ))}
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

        <div className="detail-field detail-field-wide resolution-summary-field">
  <label htmlFor="resolution-summary">
    Resolution Summary
  </label>

  <textarea
    id="resolution-summary"
    value={resolutionSummary}
    onChange={(event) =>
      setResolutionSummary(event.target.value)
    }
    placeholder="Enter the resolution or solution for this ticket..."
    rows={4}
  />
</div>

        </section>

        <section className="operational-section ticket-operations">

  <div className="ticket-tabs">

    <button
      type="button"
      className={
        activeTab === "comments"
          ? "ticket-tab active"
          : "ticket-tab"
      }
      onClick={() => setActiveTab("comments")}
    >
      💬 Public Comments
      <span>{ticket.publicComments.length}</span>
    </button>

    <button
      type="button"
      className={
        activeTab === "notes"
          ? "ticket-tab active private-tab"
          : "ticket-tab private-tab"
      }
      onClick={() => setActiveTab("notes")}
    >
      🔒 Internal Notes
      <span>{ticket.internalNotes.length}</span>
    </button>

    <button
      type="button"
      className={
        activeTab === "attachments"
          ? "ticket-tab active"
          : "ticket-tab"
      }
      onClick={() => setActiveTab("attachments")}
    >
      📎 Attachments
      <span>{ticket.attachments.length}</span>
    </button>

    <button
      type="button"
      className={
        activeTab === "actions"
          ? "ticket-tab active"
          : "ticket-tab"
      }
      onClick={() => setActiveTab("actions")}
    >
      🛠 Service Actions
    </button>

  </div>


  {activeTab === "comments" && (
    <section className="tab-panel public-comments-panel">

      <div className="section-heading">
        <div>
          <h2>Public Comments</h2>
          <p>
            Visible to the requester and IT Staff.
          </p>
        </div>

        <span className="visibility-badge public">
          PUBLIC
        </span>
      </div>

      <div className="comment-list">

        {ticket.publicComments.length === 0 ? (
          <div className="empty-state-box">
            No public comments yet.
          </div>
        ) : (
          ticket.publicComments.map((comment) => (
            <article
              key={comment.id}
              className="comment-item"
            >

              <div className="comment-avatar">
                {comment.author.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div className="comment-body">

                <div className="comment-header">

                  <strong>
                    {comment.author.name}
                  </strong>

                  <span className="role-badge">
                    {comment.author.role}
                  </span>

                  <span className="comment-date">
                    {new Date(
                      comment.createdAt
                    ).toLocaleString()}
                  </span>

                </div>

                <p>{comment.body}</p>

              </div>

            </article>
          ))
        )}

      </div>

      <div className="comment-form">

        <textarea
          value={publicComment}
          onChange={(event) =>
            setPublicComment(event.target.value)
          }
          placeholder="Write a message that the requester can see..."
        />

        <button
          type="button"
          className="comment-submit-button"
          onClick={postPublicComment}
        >
          Post Comment
        </button>

      </div>

    </section>
  )}


  {activeTab === "notes" && (
    <section className="tab-panel internal-notes-panel">

      <div className="section-heading">

        <div>
          <h2>Internal Notes</h2>
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

        {ticket.internalNotes.length === 0 ? (
          <div className="empty-state-box">
            No internal notes yet.
          </div>
        ) : (
          ticket.internalNotes.map((note) => (
            <article
              key={note.id}
              className="internal-note-item"
            >

              <div className="comment-header">

                <strong>
                  {note.author.name}
                </strong>

                <span className="role-badge">
                  {note.author.role}
                </span>

                <span className="comment-date">
                  {new Date(
                    note.createdAt
                  ).toLocaleString()}
                </span>

              </div>

              <p>{note.body}</p>

            </article>
          ))
        )}

      </div>

      <div className="comment-form">

        <textarea
          value={internalNote}
          onChange={(event) =>
            setInternalNote(event.target.value)
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
  )}


  {activeTab === "attachments" && (
    <section className="tab-panel">

      <div className="section-heading">

        <div>
          <h2>Attachments</h2>
          <p>
            Existing files submitted with this ticket.
          </p>
        </div>

      </div>

      {ticket.attachments.length === 0 ? (
        <div className="empty-state-box">
          No attachments.
        </div>
      ) : (
        <div className="attachment-list">

        {ticket.attachments.map((attachment) => (
  <div key={attachment.id} className="attachment-item">
    <div>
      <strong>{attachment.originalFileName}</strong>
      <span>
        {Math.round(attachment.sizeBytes / 1024)} KB
      </span>
    </div>

    <button
      type="button"
      className="secondary-button"
      onClick={() => handleDownloadAttachment(attachment)}
    >
      Download
    </button>
  </div>
))}  

        </div>
      )}

    </section>
  )}


  {activeTab === "actions" && (
    <section className="tab-panel service-actions-panel">

      <div className="section-heading">

        <div>
          <h2>Service Actions</h2>
          <p>
            Actions available to IT Staff for this ticket.
          </p>
        </div>

      </div>

      <div className="service-action-grid">

        <div className="service-action-card">

          <strong>Ticket Ownership</strong>

          <p>
            Current owner:{" "}
            {owner === null
              ? "Unassigned"
              : ticket.assignedStaff?.name ??
                "Assigned IT Staff"}
          </p>

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


        <div className="service-action-card">

          <strong>IT Priority</strong>

          <select
            value={itPriority}
            onChange={(event) =>
              setItPriority(
                event.target.value as ITPriority
              )
            }
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>

        </div>


        <div className="service-action-card">

          <strong>Ticket Status</strong>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as TicketStatus
              )
            }
          >
            <option value="OPEN">Open</option>
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

      </div>

      <div className="ticket-action-row">

        <button
          type="button"
          className="service-save-button"
          onClick={saveChanges}
        >
          Save Changes
        </button>

      </div>

    </section>
  )}

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

        .ticket-operations {
  padding: 0;
  overflow: hidden;
}

.ticket-tabs {
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid #D5E4DC;
  background: #FFFFFF;
  overflow-x: auto;
}

.ticket-tab {
  min-height: 58px;
  padding: 0 18px;
  border: none;
  border-bottom: 3px solid transparent;
  background: #FFFFFF;
  color: #5A6B63;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.ticket-tab:hover {
  background: #F5F7F6;
}

.ticket-tab.active {
  border-bottom-color: #006B3C;
  color: #006B3C;
  background: #F5FBF7;
}

.ticket-tab.private-tab.active {
  border-bottom-color: #C28A00;
  color: #7A5600;
  background: #FFF9E8;
}

.ticket-tab span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  margin-left: 7px;
  padding: 0 5px;
  border-radius: 999px;
  background: #EAF6EF;
  color: #006B3C;
  font-size: 11px;
}

.ticket-tab.private-tab span {
  background: #FFF4CC;
  color: #7A5600;
}

.tab-panel {
  padding: 20px;
}

.comment-date {
  margin-left: auto;
  color: #7A8A82;
  font-size: 12px;
}

.service-actions-panel {
  background: #F9FBFA;
}

.service-action-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 8px;
}

.service-action-card {
  padding: 18px;
  border: 1px solid #D5E4DC;
  border-radius: 10px;
  background: #FFFFFF;
  box-shadow: 0 2px 8px rgba(0, 107, 60, 0.06);
}

.service-action-card > strong {
  display: block;
  margin-bottom: 8px;
  color: #26332D;
  font-size: 15px;
}

.service-action-card p {
  margin: 8px 0 14px;
  color: #5A6B63;
  font-size: 14px;
}

.service-action-card select {
  width: 100%;
  min-height: 42px;
  padding: 9px 10px;
  border: 1px solid #D5E4DC;
  border-radius: 6px;
  background: #FFFFFF;
}

.attachment-link {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.service-action-card .action-buttons {
  margin-top: 14px;
}

.service-action-card .secondary-button {
  min-height: 40px;
  padding: 9px 14px;
  border: 1px solid #006B3C;
  border-radius: 7px;
  background: #FFFFFF;
  color: #006B3C;
  font-weight: 700;
  cursor: pointer;
}

.service-action-card .secondary-button:hover {
  background: #EAF6EF;
}

@media (max-width: 767px) {
  .ticket-tabs {
    overflow-x: auto;
  }

  .ticket-tab {
    padding: 0 12px;
    font-size: 13px;
  }

  .tab-panel {
    padding: 14px;
  }

  .service-action-grid {
    grid-template-columns: 1fr;
  }

  .comment-date {
    display: block;
    margin-left: 0;
    margin-top: 4px;
  }
}

.ticket-back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #cfd8d2;
  border-radius: 8px;
  background: white;
  color: #344039;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.ticket-back-button:hover {
  border-color: #006b3c;
  background: #f5fbf7;
  color: #006b3c;
}

.service-save-button {
  width: 100%;
  border: 0;
  border-radius: 8px;
  background: #006b3c;
  color: white;
  padding: 12px 18px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.service-save-button:hover {
  background: #00572f;
}

.service-save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
      .it-staff-queue-page {
  width: 100%;
  box-sizing: border-box;
}

.queue-header {
  margin-bottom: 20px;
}

.queue-header h1 {
  margin: 8px 0 6px;
  color: #006B3C;
  font-size: 24px;
}

.queue-header p {
  margin: 0;
  color: #5A6B63;
}

.queue-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.queue-filters input,
.queue-filters select {
  min-height: 42px;
  padding: 9px 12px;
  border: 1px solid #D5E4DC;
  border-radius: 7px;
  background: #FFFFFF;
  box-sizing: border-box;
}

.queue-filters input {
  flex: 1;
}

.queue-filters select {
  min-width: 180px;
}

.queue-list {
  display: grid;
  gap: 12px;
}

.queue-ticket-card {
  width: 100%;
  display: grid;
  grid-template-columns: 1.3fr 2fr auto;
  gap: 20px;
  align-items: center;
  padding: 18px;
  border: 1px solid #D5E4DC;
  border-radius: 10px;
  background: #FFFFFF;
  text-align: left;
  cursor: pointer;
}

.queue-ticket-card:hover {
  border-color: #006B3C;
  background: #F5FBF7;
}

.queue-ticket-number {
  color: #006B3C;
  font-weight: 800;
  font-size: 13px;
}

.queue-ticket-main h2 {
  margin: 6px 0;
  color: #26332D;
  font-size: 16px;
}

.queue-ticket-main p {
  margin: 0;
  color: #5A6B63;
  font-size: 13px;
}

.queue-ticket-meta {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.queue-ticket-meta div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.queue-ticket-meta span {
  color: #7A8A82;
  font-size: 11px;
}

.queue-ticket-meta strong {
  color: #26332D;
  font-size: 12px;
}

.queue-ticket-arrow {
  color: #006B3C;
  font-size: 24px;
  font-weight: 700;
}
.detail-back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid #d6dfda;
  border-radius: 9px;
  background: white;
  color: #155c43;
  font-weight: 600;
  cursor: pointer;
}

.detail-back-button:hover {
  background: #eaf6ef;
  border-color: #006b3c;
}
@media (max-width: 900px) {
  .queue-ticket-card {
    grid-template-columns: 1fr;
  }

  .queue-ticket-meta {
    grid-template-columns: repeat(2, 1fr);
  }

  .queue-ticket-arrow {
    display: none;
  }
}

.resolution-summary-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.resolution-summary-field label {
  color: #155c43;
  font-size: 14px;
  font-weight: 700;
}

.resolution-summary-field textarea {
  width: 100%;
  min-height: 120px;
  box-sizing: border-box;
  padding: 13px 14px;
  border: 1px solid #d6dfda;
  border-radius: 10px;
  background: #ffffff;
  color: #28342f;
  font: inherit;
  line-height: 1.5;
  resize: vertical;
  outline: none;
}

.resolution-summary-field textarea:focus {
  border-color: #006b3c;
  box-shadow: 0 0 0 3px #eaf6ef;
}

.resolution-summary-field textarea::placeholder {
  color: #8a9690;
}

@media (max-width: 600px) {
  .queue-filters {
    flex-direction: column;
  }

  .queue-filters input,
  .queue-filters select,
  .queue-filters button {
    width: 100%;
  }

  .queue-ticket-meta {
    grid-template-columns: 1fr;
  }
}

.comment-submit-button {
  min-height: 44px;
  padding: 10px 18px;
  border: 1px solid #006B3C;
  border-radius: 7px;
  background: #006B3C;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.comment-submit-button:hover {
  background: #0B7A46;
}

      `}</style>
    </main>
  );
}