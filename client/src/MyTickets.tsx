import { useEffect, useState } from "react";
import {
  Category,
  DevelopmentRequester,
  RelatedSystem,
  TicketListItem,
  getTickets,
} from "./api.js";

interface MyTicketsProps {
  requester: DevelopmentRequester;
  categories: Category[];
  relatedSystems: RelatedSystem[];
  onBack: () => void;
  onCreateTicket: () => void;
  onViewTicket: (ticketId: number) => void;
}

type Priority = "" | "LOW" | "MEDIUM" | "HIGH";
type Status = "" | "NEW";
type DisplayStatus =
  | "NEW"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "PENDING";
type SortOption =
  | "updatedDesc"
  | "ticketDate"
  | "ticketNumber"
  | "priority";

export default function MyTickets({
  requester,
  categories,
  relatedSystems,
  onBack,
  onCreateTicket,
  onViewTicket,
}: MyTicketsProps) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [relatedSystemId, setRelatedSystemId] = useState("");
  const [priority, setPriority] = useState<Priority>("");
  const [status, setStatus] = useState<Status>("");
  const [sort, setSort] = useState<SortOption>("updatedDesc");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<10 | 20 | 50>(10);

  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTickets() {
    setLoading(true);
    setError("");

    try {
      const response = await getTickets({
        requesterId: requester.id,
        search,
        categoryId: categoryId ? Number(categoryId) : undefined,
        relatedSystemId: relatedSystemId
          ? Number(relatedSystemId)
          : undefined,
        priority: priority || undefined,
        status: status || undefined,
        sort,
        page,
        pageSize,
      });

      setTickets(response.items);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setTickets([]);
      setTotal(0);
      setTotalPages(0);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load tickets. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, [
    requester.id,
    search,
    categoryId,
    relatedSystemId,
    priority,
    status,
    sort,
    page,
    pageSize,
  ]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleCategoryChange(value: string) {
    setCategoryId(value);
    setPage(1);
  }

  function handleRelatedSystemChange(value: string) {
    setRelatedSystemId(value);
    setPage(1);
  }

  function handlePriorityChange(value: Priority) {
    setPriority(value);
    setPage(1);
  }

  function handleStatusChange(value: Status) {
    setStatus(value);
    setPage(1);
  }

  function handleSortChange(value: SortOption) {
    setSort(value);
    setPage(1);
  }

  function handlePageSizeChange(value: string) {
    setPageSize(Number(value) as 10 | 20 | 50);
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setCategoryId("");
    setRelatedSystemId("");
    setPriority("");
    setStatus("");
    setSort("updatedDesc");
    setPage(1);
  }

  const hasFilters =
    search.trim() !== "" ||
    categoryId !== "" ||
    relatedSystemId !== "" ||
    priority !== "" ||
    status !== "";

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  function priorityLabel(value: Priority) {
    if (value === "HIGH") return "HIGH";
    if (value === "MEDIUM") return "MEDIUM";
    if (value === "LOW") return "LOW";
    return "";
  }

  function priorityBadgeStyle(value: Priority) {
    if (value === "HIGH") {
      return {
        backgroundColor: "#FDE8E8",
        color: "#B91C1C",
        border: "1px solid #F5B5B5",
      };
    }

    if (value === "MEDIUM") {
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
  function itPriority(value: Priority) {
    if (value === "HIGH") return "HIGH";
    if (value === "MEDIUM") return "HIGH";
    if (value === "LOW") return "MEDIUM";
    return "";
  }
  function statusLabel(value: DisplayStatus) {
    if (value === "NEW") return "Open";
    if (value === "IN_PROGRESS") return "In Progress";
    if (value === "RESOLVED") return "Resolved";
    if (value === "PENDING") return "Pending";
    return value;
  }

  function statusBadgeStyle(value: DisplayStatus) {
    if (value === "NEW") {
      return {
        backgroundColor: "#EAF2FF",
        color: "#1D4ED8",
        border: "1px solid #B8D0F5",
      };
    }

    if (value === "IN_PROGRESS" || value === "RESOLVED") {
      return {
        backgroundColor: "#EAF6EF",
        color: "#166534",
        border: "1px solid #B8D9C7",
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

  function displayStatus(ticketId: number): DisplayStatus {
    const statuses: DisplayStatus[] = [
      "NEW",
      "IN_PROGRESS",
      "RESOLVED",
      "PENDING",
    ];

    return statuses[ticketId % statuses.length];
  }

  return (
    <main className="ticket-main">
      <section className="ticket-card my-tickets-page">
        <div className="my-tickets-header">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="secondary-button"
            >
              Back
            </button>

            <h1>My Tickets</h1>

            <p>
              Viewing tickets for{" "}
              <strong>{requester.name}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onCreateTicket}
            className="primary-button"
          >
            Create Ticket
          </button>
        </div>

        <div className="filters-card">
          <div className="search-field">
            <label htmlFor="ticket-search">
              Search tickets
            </label>

            <input
              id="ticket-search"
              type="search"
              value={search}
              onChange={(event) =>
                handleSearchChange(event.target.value)
              }
              placeholder="Search by ticket number or summary"
            />
          </div>

          <div className="filter-grid">
            <div>
              <label htmlFor="category-filter">
                Category
              </label>

              <select
                id="category-filter"
                value={categoryId}
                onChange={(event) =>
                  handleCategoryChange(event.target.value)
                }
              >
                <option value="">All</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="related-system-filter">
                Related System
              </label>

              <select
                id="related-system-filter"
                value={relatedSystemId}
                onChange={(event) =>
                  handleRelatedSystemChange(event.target.value)
                }
              >
                <option value="">All</option>

                {relatedSystems.map((system) => (
                  <option key={system.id} value={system.id}>
                    {system.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="priority-filter">
                Requested Priority
              </label>

              <select
                id="priority-filter"
                value={priority}
                onChange={(event) =>
                  handlePriorityChange(
                    event.target.value as Priority
                  )
                }
              >
                <option value="">All</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>

            <div>
              <label htmlFor="status-filter">
                Current Status
              </label>

              <select
                id="status-filter"
                value={status}
                onChange={(event) =>
                  handleStatusChange(
                    event.target.value as Status
                  )
                }
              >
                <option value="">All</option>
                <option value="NEW">NEW</option>
              </select>
            </div>

            <div>
              <label htmlFor="sort-filter">
                Sort by
              </label>

              <select
                id="sort-filter"
                value={sort}
                onChange={(event) =>
                  handleSortChange(
                    event.target.value as SortOption
                  )
                }
              >
                <option value="updatedDesc">
                  Last Updated
                </option>
                <option value="ticketDate">
                  Ticket Date
                </option>
                <option value="ticketNumber">
                  Ticket Number
                </option>
                <option value="priority">
                  Priority
                </option>
              </select>
            </div>

            <div className="clear-filter-container">
              <button
                type="button"
                onClick={clearFilters}
                className="secondary-button"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="tickets-state" role="status">
            <div className="spinner" />
            <p>Loading tickets...</p>
          </div>
        ) : error ? (
          <div className="tickets-state error-state" role="alert">
            <p>{error}</p>

            <button
              type="button"
              onClick={loadTickets}
              className="secondary-button"
            >
              Retry
            </button>
          </div>
        ) : total === 0 && !hasFilters ? (
          <div className="tickets-state">
            <p>You have no tickets yet.</p>

            <button
              type="button"
              onClick={onCreateTicket}
              className="primary-button"
            >
              Create Ticket
            </button>
          </div>
        ) : total === 0 && hasFilters ? (
          <div className="tickets-state">
            <p>No tickets match your search or filters.</p>

            <button
              type="button"
              onClick={clearFilters}
              className="secondary-button"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="ticket-table-container">
              <table className="ticket-table">
                <thead>
                  <tr>
                    <th>Ticket Number</th>
                    <th>Summary</th>
                    <th>Category</th>
                    <th>Related System</th>
                    <th>Requested Priority</th>
                    <th>IT Priority</th>
                    <th>Curent Status</th>
                    <th>Last Updated</th>
                    
                  </tr>
                </thead>

                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>
                        <strong><button
  type="button"
  onClick={() => onViewTicket(ticket.id)}
  style={{
    background: "none",
    border: "none",
    padding: 0,
    color: "#006B3C",
    textDecoration: "underline",
    cursor: "pointer",
    fontWeight: 600,
  }}
>
  {ticket.ticketNumber}
</button></strong>
                      </td>

                      <td>{ticket.summary}</td>

                      <td>{ticket.category.name}</td>

                      <td>{ticket.relatedSystem.name}</td>

                      <td>
                        <span
                          className="ticket-badge priority-badge"
                          style={{
                            ...priorityBadgeStyle(itPriority(ticket.requestedPriority)),
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: 600,
                         }}
                        >
                          {itPriority(ticket.requestedPriority)}
                        </span>
                      </td>

                      <td>
                        <span
                         className="ticket-badge priority-badge"
                         style={{
                           ...priorityBadgeStyle(ticket.requestedPriority),
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {priorityLabel(ticket.requestedPriority)}
                        </span>
                      </td>

                      <td>
                        <span
                          className="ticket-badge status-badge"
                          style={{
                            ...statusBadgeStyle(displayStatus(ticket.id)),
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: 600,
                        }}
                    >
                        {statusLabel(displayStatus(ticket.id))}
                        </span>
                    </td>

                      <td>{formatDate(ticket.updatedAt)}</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mobile-ticket-list">
              {tickets.map((ticket) => (
                <article
                  key={ticket.id}
                  className="mobile-ticket-card"
                >
                  <div className="mobile-ticket-header">
                    <strong>{ticket.ticketNumber}</strong>

                    <span
                      className="ticket-badge status-badge"
                      style={{
                        ...statusBadgeStyle(ticket.currentStatus),
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      {statusLabel(ticket.currentStatus)}
                    </span>
                  </div>

                  <h2>{ticket.summary}</h2>

                  <p>
                    <strong>Category:</strong>{" "}
                    {ticket.category.name}
                  </p>

                  <p>
                    <strong>Priority:</strong>{" "}
                    <span className="ticket-badge priority-badge">
                      {ticket.requestedPriority}
                    </span>
                  </p>

                  <p>
                    <strong>Last Updated:</strong>{" "}
                    {formatDate(ticket.updatedAt)}
                  </p>

                  <button
                    type="button"
                    disabled
                    className="view-ticket-button mobile-view-button"
                  >
                    View Ticket
                  </button>
                </article>
              ))}
            </div>

            <div className="pagination">
              <div className="page-size">
                <label htmlFor="page-size">
                  Show
                </label>

                <select
                  id="page-size"
                  value={pageSize}
                  onChange={(event) =>
                    handlePageSizeChange(event.target.value)
                  }
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>

              <div className="pagination-controls">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((current) => current - 1)
                  }
                  className="secondary-button"
                >
                  Previous
                </button>

                <span>
                  Page {page} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((current) => current + 1)
                  }
                  className="secondary-button"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <style>{`
        .my-tickets-page {
          width: 100%;
        }

        .my-tickets-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 24px;
        }

        .my-tickets-header h1 {
          margin: 18px 0 6px;
        }

        .my-tickets-header p {
          margin: 0;
        }

        .primary-button,
        .secondary-button,
        .view-ticket-button {
          min-height: 44px;
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
        }

        .primary-button {
          border: 1px solid #006B3C;
          background: #006B3C;
          color: white;
        }

        .secondary-button {
          border: 1px solid #B8D9C7;
          background: #EAF6EF;
          color: #006B3C;
        }

        .view-ticket-button {
          border: 1px solid #B8D9C7;
          background: #EAF6EF;
          color: #006B3C;
        }

        .view-ticket-button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .primary-button:focus-visible,
        .secondary-button:focus-visible,
        .view-ticket-button:focus-visible,
        input:focus-visible,
        select:focus-visible {
          outline: 3px solid #80C9A4;
          outline-offset: 2px;
        }

        .filters-card {
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid #D5E4DC;
          border-radius: 10px;
          background: #F5F7F6;
        }

        .search-field {
          margin-bottom: 18px;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .filter-grid > div {
          min-width: 0;
        }

        .filters-card label {
          display: block;
          margin-bottom: 7px;
          font-weight: 600;
        }

        .filters-card input,
        .filters-card select,
        .page-size select {
          width: 100%;
          min-height: 44px;
          padding: 10px 12px;
          border: 1px solid #B8D9C7;
          border-radius: 6px;
          background: white;
          font-size: 15px;
          box-sizing: border-box;
        }

        .clear-filter-container {
          display: flex;
          align-items: flex-end;
        }

        .clear-filter-container button {
          width: 100%;
        }

        .ticket-table-container {
          width: 100%;
          overflow-x: hidden;
        }

        .ticket-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  table-layout: fixed;
}

.ticket-table th,
.ticket-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #DDE8E2;
  text-align: left;
  vertical-align: middle;
}

.ticket-table th {
  background: #EAF6EF;
  color: #006B3C;
  font-weight: 700;
}

/* Column widths */
.ticket-table th:nth-child(1),
.ticket-table td:nth-child(1) {
  width: 12%;
}

.ticket-table th:nth-child(2),
.ticket-table td:nth-child(2) {
  width: 20%;
}

.ticket-table th:nth-child(3),
.ticket-table td:nth-child(3) {
  width: 13%;
}

.ticket-table th:nth-child(4),
.ticket-table td:nth-child(4) {
  width: 14%;
}

.ticket-table th:nth-child(5),
.ticket-table td:nth-child(5) {
  width: 11%;
}

.ticket-table th:nth-child(6),
.ticket-table td:nth-child(6) {
  width: 12%;
}

.ticket-table th:nth-child(7),
.ticket-table td:nth-child(7) {
  width: 10%;
}

.ticket-table th:nth-child(8),
.ticket-table td:nth-child(8) {
  width: 18%;
}

        .ticket-badge {
          display: inline-block;
          padding: 5px 8px;
          margin: 2px 4px 2px 0;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.2;
        }

        .status-badge {
          background: #EAF6EF;
          color: #006B3C;
        }

        .priority-badge {
          background: #F1F3F2;
          color: #26332D;
        }

        .mobile-ticket-list {
          display: none;
        }

        .tickets-state {
          min-height: 220px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 16px;
          text-align: center;
        }

        .tickets-state p {
          margin: 0;
        }

        .error-state {
          color: #8A1C1C;
        }

        .spinner {
          width: 36px;
          height: 36px;
          border: 4px solid #D5E4DC;
          border-top-color: #006B3C;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-top: 24px;
        }

        .page-size {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .page-size select {
          width: auto;
          min-width: 80px;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        @media (max-width: 991px) {
          .filter-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .ticket-table-container {
            display: none;
          }

          .mobile-ticket-list {
            display: grid;
            gap: 16px;
          }

          .mobile-ticket-card {
            padding: 18px;
            border: 1px solid #D5E4DC;
            border-radius: 10px;
            background: white;
          }

          .mobile-ticket-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
          }

          .mobile-ticket-card h2 {
            margin: 14px 0;
            font-size: 18px;
          }

          .mobile-ticket-card p {
            margin: 9px 0;
          }

          .mobile-view-button {
            width: 100%;
            margin-top: 10px;
          }
        }

        @media (max-width: 600px) {
          .my-tickets-header {
            flex-direction: column;
          }

          .my-tickets-header > div,
          .my-tickets-header > button {
            width: 100%;
          }

          .filter-grid {
            grid-template-columns: 1fr;
          }

          .pagination {
            flex-direction: column;
            align-items: stretch;
          }

          .page-size {
            justify-content: space-between;
          }

          .pagination-controls {
            justify-content: space-between;
          }

          .pagination-controls button {
            flex: 1;
          }
        }
      `}</style>
    </main>
  );
}
