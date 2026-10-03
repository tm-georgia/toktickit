import { useEffect, useState } from "react";
import {
  getITStaffTicketQueue,
  ITStaffTicketQueueItem,
} from "./api.js";

type Props = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  onOpenTicket: (ticketId: number) => void;
  onBack: () => void;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatStatus(
  status: ITStaffTicketQueueItem["currentStatus"],
) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPriority(priority: string | null) {
  if (!priority) {
    return "Not set";
  }

  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

export default function ITStaffTicketQueue({
  user,
  onOpenTicket,
  onBack,
}: Props) {
  const PAGE_SIZE = 10;

  const [tickets, setTickets] = useState<
    ITStaffTicketQueueItem[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [sort, setSort] = useState("updatedDesc");

  const [page, setPage] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const hasFilters =
    search.trim() !== "" ||
    status !== "" ||
    assignedTo !== "";

  const loadTickets = async (
    requestedPage = 1,
    filterOverrides?: {
      search?: string;
      status?: string;
      assignedTo?: string;
      sort?: string;
    },
  ) => {
    try {
      setLoading(true);
      setError("");
      setForbidden(false);

      const currentSearch =
        filterOverrides?.search ?? search;

      const currentStatus =
        filterOverrides?.status ?? status;

      const currentAssignedTo =
        filterOverrides?.assignedTo ?? assignedTo;

      const currentSort =
        filterOverrides?.sort ?? sort;

      const result = await getITStaffTicketQueue({
        search: currentSearch.trim() || undefined,
        status: currentStatus || undefined,
        assignedTo: currentAssignedTo || undefined,
        sort: currentSort,
        page: requestedPage,
        pageSize: PAGE_SIZE,
      });

      console.log(
        "IT STAFF QUEUE RESULT:",
        result,
      );

      setTickets(result.tickets ?? []);
      setTotalTickets(result.total);
      setTotalPages(result.totalPages);
      setPage(result.page);
    } catch (err) {
      console.error(
        "IT STAFF QUEUE ERROR:",
        err,
      );

      const message =
        err instanceof Error
          ? err.message
          : "Unable to load IT Staff tickets.";

      setError(message);

      if (
        err instanceof Error &&
        (
          err.message.includes("permission") ||
          err.message.includes("permission to view")
        )
      ) {
        setForbidden(true);
      }

      setTickets([]);
      setTotalTickets(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets(1);
  }, []);

  const visibleTickets = tickets;

  const showingFrom =
    totalTickets === 0
      ? 0
      : (page - 1) * PAGE_SIZE + 1;

  const showingTo = Math.min(
    page * PAGE_SIZE,
    totalTickets,
  );

  const pageNumbers: number[] = [];

  for (let i = 1; i <= totalPages; i += 1) {
    if (
      i === 1 ||
      i === totalPages ||
      Math.abs(i - page) <= 2
    ) {
      pageNumbers.push(i);
    }
  }

  const uniquePageNumbers = [
    ...new Set(pageNumbers),
  ];

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setAssignedTo("");
    setSort("updatedDesc");

    loadTickets(1, {
      search: "",
      status: "",
      assignedTo: "",
      sort: "updatedDesc",
    });
  };

  return (
    <div className="it-queue-page">
      <div className="it-queue-header">
        <div>
          <button
            type="button"
            className="it-queue-back-button"
            onClick={onBack}
          >
            ← Back
          </button>

          <h1>IT Staff Ticket Queue</h1>

          <p>
            View and manage support tickets assigned to IT
            Staff.
          </p>
        </div>

        <button
          type="button"
          className="it-queue-refresh-button"
          onClick={() => loadTickets(1)}
          disabled={loading}
        >
          ↻ {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="it-queue-filter-card">
        <div className="it-queue-search-wrapper">
          <span className="it-queue-search-icon">
            ⌕
          </span>

          <input
            type="text"
            value={search}
            placeholder="Search by ticket number or summary..."
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                loadTickets(1);
              }
            }}
          />
        </div>

        <div className="it-queue-filter-field">
          <label>Status</label>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
            }}
          >
            <option value="">All Status</option>
            <option value="NEW">New</option>
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
            <option value="CLOSED">Closed</option>
            <option value="REOPENED">
              Reopened
            </option>
            <option value="CANCELLED">
              Cancelled
            </option>
          </select>
        </div>

        <div className="it-queue-filter-field">
          <label>Assignment</label>

          <select
            value={assignedTo}
            onChange={(event) => {
              setAssignedTo(event.target.value);
            }}
          >
            <option value="">
              All Tickets
            </option>

            <option value="me">
              Assigned to Me
            </option>

            <option value="unassigned">
              Unassigned
            </option>
          </select>
        </div>

        <div className="it-queue-filter-field">
          <label>Sort By</label>

          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
            }}
          >
            <option value="updatedDesc">
              Last Updated — Newest
            </option>

            <option value="updatedAsc">
              Last Updated — Oldest
            </option>

            <option value="createdDesc">
              Created Date — Newest
            </option>

            <option value="createdAsc">
              Created Date — Oldest
            </option>

            <option value="ticketNumber">
              Ticket Number
            </option>
          </select>
        </div>

        <button
          type="button"
          className="it-queue-search-button"
          onClick={() => loadTickets(1)}
          disabled={loading}
        >
          Search
        </button>
      </div>

      {loading && (
        <div className="it-queue-state-card">
          <strong>
            Loading ticket queue...
          </strong>

          <p>
            Fetching the latest tickets from the
            server.
          </p>
        </div>
      )}

      {!loading && forbidden && (
        <div className="it-queue-state-card it-queue-forbidden">
          <strong>Access denied</strong>

          <p>
            Your account does not have permission to
            view the IT Staff ticket queue.
          </p>

          <button
            type="button"
            className="it-queue-search-button"
            onClick={onBack}
          >
            Back to Home
          </button>
        </div>
      )}

      {!loading &&
        error &&
        !forbidden && (
          <div className="it-queue-state-card it-queue-error">
            <strong>
              Unable to load tickets
            </strong>

            <p>{error}</p>

            <button
              type="button"
              className="it-queue-search-button"
              onClick={() => loadTickets(1)}
            >
              Try Again
            </button>
          </div>
        )}

      {!loading &&
        !error &&
        !forbidden && (
          <div className="it-queue-table-card">
            {totalTickets === 0 ? (
              <div className="it-queue-empty">
                <strong>
                  {hasFilters
                    ? "No matching tickets"
                    : "No tickets available"}
                </strong>

                <p>
                  {hasFilters
                    ? "No tickets match the current search or filters. Try changing your filters."
                    : "There are currently no tickets in the IT Staff queue."}
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    className="it-queue-search-button"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="it-queue-table-wrapper">
                  <table className="it-queue-table">
                    <thead>
                      <tr>
                        <th>Ticket No.</th>
                        <th>Created Date</th>
                        <th>Summary</th>
                        <th>Category</th>
                        <th>Requested Priority</th>
                        <th>IT Priority</th>
                        <th>Current Status</th>
                        <th>Requestor</th>
                        <th>Ticket Owner</th>
                        <th>Last Updated</th>
                      </tr>
                    </thead>

                    <tbody>
                      {visibleTickets.map(
                        (ticket) => (
                          <tr key={ticket.id}>
                            <td>
                              <button
                                type="button"
                                className="it-queue-ticket-link"
                                onClick={() =>
                                  onOpenTicket(
                                    ticket.id,
                                  )
                                }
                              >
                                {ticket.ticketNumber}
                              </button>
                            </td>

                            <td>
                              {formatDate(
                                ticket.createdAt ??
                                  ticket.ticketDate,
                              )}
                            </td>

                            <td>
                              <div className="it-queue-summary">
                                {ticket.summary}
                              </div>
                            </td>

                            <td>
                              {ticket.category?.name ??
                                "—"}
                            </td>

                            <td>
                              <span
                                className={`it-priority-badge ${String(
                                  ticket.requestedPriority,
                                ).toLowerCase()}`}
                              >
                                {formatPriority(
                                  ticket.requestedPriority,
                                )}
                              </span>
                            </td>

                            <td>
                              {ticket.itPriority ? (
                                <span
                                  className={`it-priority-badge ${ticket.itPriority.toLowerCase()}`}
                                >
                                  {formatPriority(
                                    ticket.itPriority,
                                  )}
                                </span>
                              ) : (
                                <span className="it-not-set">
                                  Not set
                                </span>
                              )}
                            </td>

                            <td>
                              <span
                                className={`it-status-badge ${ticket.currentStatus.toLowerCase()}`}
                              >
                                {formatStatus(
                                  ticket.currentStatus,
                                )}
                              </span>
                            </td>

                            <td>
                              {ticket.requester?.name ?? "Unknown"}
                            </td>

                            <td>
                              {ticket.assignedStaff?.name ?? "Unassigned"}
                            </td>

                            <td>
                              {formatDate(
                                ticket.updatedAt,
                              )}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="it-queue-footer">
                  <div className="it-queue-showing">
                    Showing {showingFrom} to{" "}
                    {showingTo} of{" "}
                    {totalTickets} tickets
                  </div>

                  <div className="it-queue-pagination">
                    <button
                      type="button"
                      disabled={page === 1 || loading}
                      onClick={() =>
                        loadTickets(
                          Math.max(
                            1,
                            page - 1,
                          ),
                        )
                      }
                    >
                      ‹ Previous
                    </button>

                    {uniquePageNumbers.map(
                      (
                        pageNumber,
                        index,
                      ) => {
                        const previous =
                          uniquePageNumbers[
                            index - 1
                          ];

                        const needsDots =
                          previous !==
                            undefined &&
                          pageNumber -
                            previous >
                            1;

                        return (
                          <span
                            key={pageNumber}
                            className="it-queue-page-group"
                          >
                            {needsDots && (
                              <span className="it-queue-dots">
                                ...
                              </span>
                            )}

                            <button
                              type="button"
                              className={
                                pageNumber ===
                                page
                                  ? "active"
                                  : ""
                              }
                              disabled={loading}
                              onClick={() =>
                                loadTickets(
                                  pageNumber,
                                )
                              }
                            >
                              {pageNumber}
                            </button>
                          </span>
                        );
                      },
                    )}

                    <button
                      type="button"
                      disabled={
                        page === totalPages ||
                        loading
                      }
                      onClick={() =>
                        loadTickets(
                          Math.min(
                            totalPages,
                            page + 1,
                          ),
                        )
                      }
                    >
                      Next ›
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
    </div>
  );
}
