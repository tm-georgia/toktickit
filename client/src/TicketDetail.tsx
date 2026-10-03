import { useEffect, useState } from "react";
import {
  Attachment,
  CreatedTicket,
  getAttachmentDownloadUrl,
  getTicketById,
  removeAttachment,
  uploadAttachment,
} from "./api.js";
import type { User } from "./authApi.js";

interface TicketDetailProps {
  user: User;
  ticketId: number;
  onBack: () => void;
}

type DisplayStatus =
  | "NEW"
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_FOR_REQUESTER"
  | "RESOLVED"
  | "CLOSED"
  | "REOPENED"
  | "CANCELLED";

export default function TicketDetail({
  user,
  ticketId,
  onBack,
}: TicketDetailProps) {
  const [ticket, setTicket] = useState<CreatedTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [uploadingAttachment, setUploadingAttachment] = useState(false);
const [attachmentError, setAttachmentError] = useState("");
const [removingAttachmentId, setRemovingAttachmentId] = useState<number | null>(null);
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
  return ticket?.currentStatus as DisplayStatus;
}

  function statusLabel(value: DisplayStatus) {
  if (value === "NEW") return "New";
  if (value === "OPEN") return "Open";
  if (value === "IN_PROGRESS") return "In Progress";
  if (value === "WAITING_FOR_REQUESTER") {
    return "Waiting for Requester";
  }
  if (value === "RESOLVED") return "Resolved";
  if (value === "CLOSED") return "Closed";
  if (value === "REOPENED") return "Reopened";
  return "Cancelled";
}
function statusBadgeStyle(value: DisplayStatus) {
  if (value === "NEW") {
    return {
      backgroundColor: "#F3F4F6",
      color: "#374151",
      border: "1px solid #D1D5DB",
    };
  }

  if (value === "OPEN") {
    return {
      backgroundColor: "#EAF2FF",
      color: "#1D4ED8",
      border: "1px solid #BFDBFE",
    };
  }

  if (value === "IN_PROGRESS") {
    return {
      backgroundColor: "#FFF4CC",
      color: "#92400E",
      border: "1px solid #F3D27A",
    };
  }

  if (value === "WAITING_FOR_REQUESTER") {
    return {
      backgroundColor: "#FFF7ED",
      color: "#9A3412",
      border: "1px solid #FED7AA",
    };
  }

  if (value === "RESOLVED") {
    return {
      backgroundColor: "#EAF6EF",
      color: "#166534",
      border: "1px solid #B8D9C7",
    };
  }

  if (value === "CLOSED") {
    return {
      backgroundColor: "#E5E7EB",
      color: "#374151",
      border: "1px solid #D1D5DB",
    };
  }

  if (value === "REOPENED") {
    return {
      backgroundColor: "#F3E8FF",
      color: "#7E22CE",
      border: "1px solid #D8B4FE",
    };
  }

  return {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
    border: "1px solid #FECACA",
  };
}

  if (loading) {
    return (
      <main className="ticket-detail-main">
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
      <main className="ticket-detail-main">
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

  async function handleUploadAttachment() {
  if (!selectedFile || !ticket) {
    return;
  }

  setAttachmentError("");
  setUploadingAttachment(true);

  try {
    const uploadedAttachment = await uploadAttachment(
      ticket.id,
      selectedFile
    );

    setTicket((currentTicket) =>
      currentTicket
        ? {
            ...currentTicket,
            attachments: [
              uploadedAttachment,
              ...currentTicket.attachments,
            ],
          }
        : currentTicket
    );

    setSelectedFile(null);

    const fileInput = document.getElementById(
      "ticket-attachment-input"
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = "";
    }
  } catch (error) {
    setAttachmentError(
      error instanceof Error
        ? error.message
        : "Unable to upload attachment."
    );
  } finally {
    setUploadingAttachment(false);
  }
}

async function handleRemoveAttachment(
  attachment: Attachment
) {
  const confirmed = window.confirm(
    `Remove "${attachment.originalFileName}"?`
  );

  if (!confirmed) {
    return;
  }

  setAttachmentError("");
  setRemovingAttachmentId(attachment.id);

  try {
    await removeAttachment(ticket!.id, attachment.id);

    setTicket((currentTicket) =>
      currentTicket
        ? {
            ...currentTicket,
            attachments: currentTicket.attachments.filter(
              (item) => item.id !== attachment.id
            ),
          }
        : currentTicket
    );
  } catch (error) {
    setAttachmentError(
      error instanceof Error
        ? error.message
        : "Unable to remove attachment."
    );
  } finally {
    setRemovingAttachmentId(null);
  }
}

  return (
    <main className="ticket-detail-main">
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
  <span>IT Priority</span>
  <strong>{ticket.itPriority}</strong>
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

  <p className="attachment-help">
    Upload JPG, JPEG, PNG, WEBP, or PDF files.
    Maximum 5 MB per file and 5 active attachments.
  </p>

  <div className="attachment-upload">
    <input
      id="ticket-attachment-input"
      type="file"
      accept=".jpg,.jpeg,.png,.webp,.pdf"
      disabled={
        uploadingAttachment ||
        ticket.attachments.length >= 5
      }
      onChange={(event) => {
        setAttachmentError("");

        const file = event.target.files?.[0] ?? null;

        if (!file) {
          setSelectedFile(null);
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          setSelectedFile(null);
          event.target.value = "";
          setAttachmentError(
            "File size must not exceed 5 MB."
          );
          return;
        }

        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "application/pdf",
        ];

        if (!allowedTypes.includes(file.type)) {
          setSelectedFile(null);
          event.target.value = "";
          setAttachmentError(
            "Unsupported file type. Please choose JPG, JPEG, PNG, WEBP, or PDF."
          );
          return;
        }

        setSelectedFile(file);
      }}
    />

    <button
      type="button"
      className="primary-button"
      disabled={
        !selectedFile ||
        uploadingAttachment ||
        ticket.attachments.length >= 5
      }
      onClick={() => void handleUploadAttachment()}
    >
      {uploadingAttachment ? "Uploading..." : "Upload"}
    </button>
  </div>

  {ticket.attachments.length >= 5 && (
    <p className="attachment-limit-message">
      You have reached the maximum of 5 active attachments.
    </p>
  )}

  {attachmentError && (
    <p className="attachment-error">
      {attachmentError}
    </p>
  )}

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
            <div className="attachment-info">
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

            <div className="attachment-actions">
              <a
                className="secondary-button"
                href={getAttachmentDownloadUrl(
                  ticket.id,
                  attachment.id
                )}
                target="_blank"
                rel="noreferrer"
              >
                Download
              </a>

              <button
                type="button"
                className="secondary-button"
                disabled={
                  removingAttachmentId === attachment.id
                }
                onClick={() =>
                  void handleRemoveAttachment(attachment)
                }
              >
                {removingAttachmentId === attachment.id
                  ? "Removing..."
                  : "Remove"}
              </button>
            </div>
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

        .ticket-detail-main {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow-x: hidden;
}

        .ticket-detail-page {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
          overflow: hidden;
        }

        .ticket-detail-header {
          width: 100%;
          margin-bottom: 20px;
          min-width: 0;
        }

        .ticket-detail-header h1 {
          margin: 18px 0 6px;
          overflow-wrap: anywhere;
        }

        .ticket-detail-header p {
          margin: 0;
          overflow-wrap: anywhere;
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
          box-sizing: border-box;
          min-width: 0;
        }

        .ticket-detail-status > span:first-child {
          font-weight: 700;
          color: #006B3C;
        }

        .ticket-detail-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 24px;
          min-width: 0;
        }

        .detail-field {
          min-width: 0;
          padding: 16px;
          border: 1px solid #D5E4DC;
          border-radius: 8px;
          background: #F5F7F6;
          box-sizing: border-box;
        }

        .detail-field span {
          display: block;
          margin-bottom: 6px;
          color: #5A6B63;
          font-size: 13px;
        }

        .detail-field strong {
          display: block;
          color: #26332D;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .ticket-detail-section {
          width: 100%;
          min-width: 0;
          margin-top: 24px;
          padding: 20px;
          border: 1px solid #D5E4DC;
          border-radius: 10px;
          background: white;
          box-sizing: border-box;
        }

        .ticket-detail-section h2 {
          margin: 0 0 12px;
          color: #006B3C;
          font-size: 18px;
        }

        .ticket-detail-section p {
          margin: 0;
          line-height: 1.6;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .ticket-description {
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .attachment-list {
          display: grid;
          gap: 10px;
          min-width: 0;
        }

        .attachment-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          min-width: 0;
          padding: 12px;
          border: 1px solid #D5E4DC;
          border-radius: 8px;
          background: #F5F7F6;
          box-sizing: border-box;
        }

        .attachment-item strong {
          min-width: 0;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .attachment-item span {
          flex-shrink: 0;
          color: #5A6B63;
          font-size: 13px;
        }

        .attachment-help {
  margin: 0 0 14px;
  color: #5A6B63;
  font-size: 14px;
}

.attachment-upload {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.attachment-upload input[type="file"] {
  max-width: 100%;
}

.attachment-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.attachment-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.attachment-error {
  margin: 8px 0;
  color: #B42318;
  font-size: 14px;
}

.attachment-limit-message {
  margin: 8px 0;
  color: #5A6B63;
  font-size: 14px;
}
        .empty-comments {
          padding: 16px;
          border-radius: 8px;
          background: #F5F7F6;
          box-sizing: border-box;
        }

        .resolved-section {
          background: #EAF6EF;
        }

        .resolved-section p {
          margin-bottom: 16px;
        }

        /*
         * Medium screen / half-screen laptop
         */
        @media (max-width: 1000px) {
          .ticket-detail-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        /*
         * Narrow screen
         */
        @media (max-width: 700px) {
          .ticket-detail-main {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  padding: 12px;
  box-sizing: border-box;
  overflow-x: hidden;
}

          .ticket-detail-page {
            width: 100%;
            max-width: 100%;
            min-width: 0;
          }

          .ticket-detail-header h1 {
            font-size: 24px;
          }

          .ticket-detail-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .ticket-detail-status {
            align-items: flex-start;
            flex-direction: column;
          }

          .ticket-detail-section {
            padding: 16px;
          }

          .attachment-item {
            align-items: flex-start;
            flex-direction: column;
          }

          .attachment-item span {
            flex-shrink: 1;
          }

          .home-actions {
            width: 100%;
            box-sizing: border-box;
          }

          .home-actions button {
            max-width: 100%;
          }
        }

        /*
         * Very narrow browser
         */
        @media (max-width: 450px) {
          .ticket-detail-main {
            padding: 8px;
          }

          .ticket-detail-section {
            padding: 12px;
          }

          .ticket-detail-status {
            padding: 12px;
          }

          .detail-field {
            padding: 12px;
          }

          .ticket-detail-header h1 {
            font-size: 21px;
          }

          .ticket-detail-section h2 {
            font-size: 16px;
          }
        }
      `}</style>
</main>
  );
}