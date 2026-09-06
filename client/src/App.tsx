import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  Category,
  CreateTicketInput,
  DevelopmentRequester,
  RelatedSystem,
  createTicket,
  getCategories,
  getDevelopmentRequesters,
  getRelatedSystems,
} from "./api.js";

import MyTickets from "./MyTickets.js";

type Page = "home" | "create" | "tickets" | "detail";

type FormErrors = {
  categoryId?: string;
  relatedSystemId?: string;
  summary?: string;
  description?: string;
  requestedPriority?: string;
};

const EMPTY_ERRORS: FormErrors = {};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "11px 12px",
  border: "1px solid #AFC7BA",
  borderRadius: "6px",
  backgroundColor: "white",
  color: "#17352A",
  fontSize: "16px",
};

const labelStyle = {
  display: "block",
  fontWeight: 600,
  marginBottom: "8px",
};

const errorStyle = {
  color: "#9B2C2C",
  fontSize: "14px",
  marginTop: "6px",
  marginBottom: 0,
};

export default function App() {
  // --------------------------------------------------
  // Development Requester
  // --------------------------------------------------

  const [requesters, setRequesters] = useState<
    DevelopmentRequester[]
  >([]);

  const [selectedRequester, setSelectedRequester] =
    useState<DevelopmentRequester | null>(null);

  const [requesterLoading, setRequesterLoading] =
    useState(true);

  const [requesterError, setRequesterError] =
    useState(false);

  const [continueLoading, setContinueLoading] =
    useState(false);

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  const [page, setPage] = useState<Page>("home");

  // --------------------------------------------------
  // Create Ticket reference data
  // --------------------------------------------------

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [relatedSystems, setRelatedSystems] =
    useState<RelatedSystem[]>([]);

  const [referenceLoading, setReferenceLoading] =
    useState(false);

  const [referenceError, setReferenceError] =
    useState(false);

  // --------------------------------------------------
  // Create Ticket form
  // --------------------------------------------------

  const [categoryId, setCategoryId] = useState("");

  const [relatedSystemId, setRelatedSystemId] =
    useState("");

  const [requestedPriority, setRequestedPriority] =
    useState<CreateTicketInput["requestedPriority"]>(
      "MEDIUM"
    );

  const [summary, setSummary] = useState("");

  const [description, setDescription] = useState("");

  const [errors, setErrors] =
    useState<FormErrors>(EMPTY_ERRORS);

  const [submitError, setSubmitError] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [createdTicket, setCreatedTicket] =
    useState<Awaited<ReturnType<typeof createTicket>> | null>(
      null
    );

  // --------------------------------------------------
  // Load Development Requesters
  // --------------------------------------------------

  async function loadRequesters() {
    setRequesterLoading(true);
    setRequesterError(false);

    try {
      const result = await getDevelopmentRequesters();

      setRequesters(result);
    } catch (error) {
      console.error(
        "Failed to load requesters:",
        error
      );

      setRequesterError(true);
    } finally {
      setRequesterLoading(false);
    }
  }

  useEffect(() => {
    loadRequesters();
  }, []);

  // --------------------------------------------------
  // Load Create Ticket reference data
  // --------------------------------------------------

  async function loadCreateTicketReferenceData() {
    setReferenceLoading(true);
    setReferenceError(false);

    try {
      const [
        categoryResult,
        relatedSystemResult,
      ] = await Promise.all([
        getCategories(),
        getRelatedSystems(),
      ]);

      setCategories(categoryResult);
      setRelatedSystems(relatedSystemResult);
    } catch (error) {
      console.error(
        "Failed to load ticket reference data:",
        error
      );

      setReferenceError(true);
    } finally {
      setReferenceLoading(false);
    }
  }

  // --------------------------------------------------
  // Requester actions
  // --------------------------------------------------

  function handleContinue() {
    if (!selectedRequester) {
      return;
    }

    setContinueLoading(true);

    setTimeout(() => {
      setPage("home");
      setContinueLoading(false);
    }, 300);
  }

  function handleChangeRequester() {
    setPage("home");
    setSelectedRequester(null);

    resetCreateForm();
  }
  
  function handleOpenMyTicket() {
  setPage("tickets");
  }

  function handleViewCreatedTicket() {
  setPage("detail");
  }

  function handleRequesterChange(
    event: ChangeEvent<HTMLSelectElement>
  ) {
    const requester = requesters.find(
      (item) =>
        item.id === Number(event.target.value)
    );

    setSelectedRequester(requester ?? null);
    setPage("home");
  }

  // --------------------------------------------------
  // Create Ticket actions
  // --------------------------------------------------

  function resetCreateForm() {
    setCategoryId("");
    setRelatedSystemId("");
    setRequestedPriority("MEDIUM");
    setSummary("");
    setDescription("");
    setErrors(EMPTY_ERRORS);
    setSubmitError("");
    setCreatedTicket(null);
  }

  function handleOpenCreateTicket() {
    resetCreateForm();

    setPage("create");

    loadCreateTicketReferenceData();
  }

  // --------------------------------------------------
  // Validation
  // --------------------------------------------------

  function validateForm(): FormErrors {
    const newErrors: FormErrors = {};

    if (!categoryId) {
      newErrors.categoryId =
        "Category is required.";
    }

    if (!relatedSystemId) {
      newErrors.relatedSystemId =
        "Related System is required.";
    }

    const trimmedSummary = summary.trim();

    if (!trimmedSummary) {
      newErrors.summary =
        "Summary is required.";
    } else if (trimmedSummary.length < 5) {
      newErrors.summary =
        "Summary must be at least 5 characters.";
    } else if (trimmedSummary.length > 200) {
      newErrors.summary =
        "Summary must not exceed 200 characters.";
    }

    const trimmedDescription =
      description.trim();

    if (!trimmedDescription) {
      newErrors.description =
        "Description is required.";
    } else if (trimmedDescription.length < 10) {
      newErrors.description =
        "Description must be at least 10 characters.";
    } else if (trimmedDescription.length > 2000) {
      newErrors.description =
        "Description must not exceed 2000 characters.";
    }

    if (
      requestedPriority !== "LOW" &&
      requestedPriority !== "MEDIUM" &&
      requestedPriority !== "HIGH"
    ) {
      newErrors.requestedPriority =
        "Requested Priority is required.";
    }

    return newErrors;
  }

  // --------------------------------------------------
  // Create Ticket submission
  // --------------------------------------------------

  async function handleCreateTicket(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!selectedRequester) {
      setSubmitError(
        "Please select a Development Requester first."
      );

      return;
    }

    const validationErrors =
      validateForm();

    setErrors(validationErrors);
    setSubmitError("");

    if (
      Object.keys(validationErrors).length > 0
    ) {
      return;
    }

    setSubmitting(true);

    try {
      const ticket = await createTicket({
        requesterId: selectedRequester.id,
        categoryId: Number(categoryId),
        relatedSystemId: Number(
          relatedSystemId
        ),
        summary: summary.trim(),
        description: description.trim(),
        requestedPriority,
      });

      setCreatedTicket(ticket);
    } catch (error) {
      console.error(
        "Failed to create ticket:",
        error
      );

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to create ticket. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // --------------------------------------------------
  // IMPORTANT:
  // Calculate requester ID before JSX rendering.
  // This avoids TypeScript's `never` narrowing
  // inside the !selectedRequester branch.
  // --------------------------------------------------

  const selectedRequesterId =
    selectedRequester === null
      ? ""
      : String(selectedRequester.id);

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5F7F6",
        color: "#17352A",
      }}
    >
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          button:focus-visible,
          input:focus-visible,
          select:focus-visible,
          textarea:focus-visible {
            outline: 3px solid #7BC89C;
            outline-offset: 2px;
          }

          textarea {
            resize: vertical;
          }

          @media (max-width: 767px) {
            .ticket-main {
              padding: 20px 14px !important;
            }

            .ticket-card {
              padding: 20px !important;
            }

            .classification-grid {
              grid-template-columns: 1fr !important;
            }

            .action-row {
              flex-direction: column !important;
            }

            .action-row button {
              width: 100% !important;
            }
          }
        `}
      </style>

      {/* Application shell */}
      <header
        style={{
          backgroundColor: "#006B3C",
          color: "white",
          padding: "16px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1140px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: 700,
            }}
          >
            TokTickIT
          </h1>

          {selectedRequester && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <span>
                Requester:{" "}
                <strong>
                  {selectedRequester.name}
                </strong>
              </span>

              <button
                type="button"
                onClick={handleChangeRequester}
                disabled={submitting}
                style={{
                  border: "1px solid white",
                  backgroundColor: "transparent",
                  color: "white",
                  borderRadius: "6px",
                  padding: "7px 12px",
                  cursor: submitting
                    ? "not-allowed"
                    : "pointer",
                  fontWeight: 600,
                }}
              >
                Change Requester
              </button>
            </div>
          )}
        </div>
      </header>

      <main
        className="ticket-main"
        style={{
          maxWidth: "1140px",
          margin: "0 auto",
          padding: "32px 20px",
        }}
      >
        {/* ==========================================
            REQUESTER SELECTION
            ========================================== */}

        {!selectedRequester ? (
          <section
            className="ticket-card"
            style={{
              maxWidth: "640px",
              margin: "20px auto",
              backgroundColor: "white",
              border: "1px solid #D8E5DE",
              borderRadius: "12px",
              padding: "28px",
              boxShadow:
                "0 2px 8px rgba(0, 0, 0, 0.06)",
            }}
          >
            <h2
              style={{
                color: "#006B3C",
                marginTop: 0,
                marginBottom: "12px",
              }}
            >
              Select Development Requester
            </h2>

            <p
              style={{
                lineHeight: 1.6,
                marginBottom: "24px",
              }}
            >
              Select a Development Requester to
              test requester-specific ticket
              behavior. This is not a login screen.
              Authentication and role-based access
              will be introduced in Lab 3.
            </p>

            {/* Loading */}
            {requesterLoading && (
              <div
                role="status"
                aria-live="polite"
                style={{
                  backgroundColor: "#EAF6EF",
                  padding: "14px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              >
                Loading Development Requesters...
              </div>
            )}

            {/* Error */}
            {requesterError &&
              !requesterLoading && (
                <div
                  role="alert"
                  style={{
                    backgroundColor: "#FFF3F3",
                    border:
                      "1px solid #E3B8B8",
                    padding: "16px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                  }}
                >
                  <p
                    style={{
                      marginTop: 0,
                    }}
                  >
                    We could not load the
                    Development Requesters.
                  </p>

                  <p>
                    Please check the connection
                    and try again.
                  </p>

                  <button
                    type="button"
                    onClick={loadRequesters}
                    style={{
                      backgroundColor:
                        "#006B3C",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding:
                        "9px 16px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Try Again
                  </button>
                </div>
              )}

            {/* Empty */}
            {!requesterLoading &&
              !requesterError &&
              requesters.length === 0 && (
                <div
                  role="status"
                  style={{
                    backgroundColor: "#EAF6EF",
                    padding: "16px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                  }}
                >
                  No active Development
                  Requesters are available.
                  Please contact the administrator
                  or try again later.
                </div>
              )}

            {/* Requester form */}
            {!requesterLoading &&
              !requesterError &&
              requesters.length > 0 && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleContinue();
                  }}
                >
                  <div
                    style={{
                      marginBottom: "20px",
                    }}
                  >
                    <label
                      htmlFor="requester"
                      style={labelStyle}
                    >
                      Requester
                    </label>

                    <select
                      id="requester"
                      value={selectedRequesterId}
                      onChange={
                        handleRequesterChange
                      }
                      aria-describedby="requester-help"
                      style={inputStyle}
                    >
                      <option value="">
                        Select a requester
                      </option>

                      {requesters.map(
                        (requester) => (
                          <option
                            key={requester.id}
                            value={
                              requester.id
                            }
                          >
                            {requester.name} (
                            {requester.email})
                          </option>
                        )
                      )}
                    </select>

                    <p
                      id="requester-help"
                      style={{
                        fontSize: "14px",
                        color: "#53685D",
                        marginTop: "8px",
                      }}
                    >
                      Choose an active
                      Development Requester
                      for Lab 2 testing.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      !selectedRequester ||
                      continueLoading
                    }
                    style={{
                      width: "100%",
                      backgroundColor:
                        selectedRequester &&
                        !continueLoading
                          ? "#006B3C"
                          : "#AABDB3",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding:
                        "12px 18px",
                      cursor:
                        selectedRequester &&
                        !continueLoading
                          ? "pointer"
                          : "not-allowed",
                      fontSize: "16px",
                      fontWeight: 700,
                    }}
                  >
                    {continueLoading
                      ? "Continuing..."
                      : "Continue"}
                  </button>
                </form>
              )}
          </section>
        ) : page === "home" ? (
          /* ==========================================
             HOME
             ========================================== */

          <section
            className="ticket-card"
            style={{
              backgroundColor: "white",
              border: "1px solid #D8E5DE",
              borderRadius: "12px",
              padding: "28px",
              boxShadow:
                "0 2px 8px rgba(0, 0, 0, 0.06)",
            }}
          >
            <h2
              style={{
                color: "#006B3C",
                marginTop: 0,
              }}
            >
              Welcome, {selectedRequester.name}
            </h2>

            <p>
              You are currently testing
              TokTickIT as{" "}
              <strong>
                {selectedRequester.name}
              </strong>
              .
            </p>

            <nav
              aria-label="Main navigation"
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginTop: "24px",
              }}
            >
              {/* Issue #18 */}
              <button
              type="button"
              onClick={handleOpenMyTicket}
              style={{
                backgroundColor: "#EAF6EF",
                color: "#006B3C",
                border: "1px solid #B8D9C7",
                borderRadius: "6px",
                padding: "10px 16px",
                fontWeight: 600,
                cursor: "pointer",
              }}
              >
                My Tickets
              </button>

              {/* Issue #17 */}
              <button
                type="button"
                onClick={
                  handleOpenCreateTicket
                }
                style={{
                  backgroundColor:
                    "#006B3C",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding:
                    "10px 16px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Create Ticket
              </button>
            </nav>
          </section>
         ) : page === "tickets" ? (
        /* ==========================================
           MY TICKETS
           ========================================== */

          <MyTickets
            requester={selectedRequester}
            categories={categories}
            relatedSystems={relatedSystems}
            onBack={() => setPage("home")}
            onCreateTicket={handleOpenCreateTicket}
          />
      ) : page === "detail" ? (
  <div
    style={{
      maxWidth: "900px",
      margin: "0 auto",
      padding: "24px",
    }}
  >
    <h2
      style={{
        color: "#006B3C",
        marginBottom: "24px",
      }}
    >
      Ticket Detail
    </h2>

    {createdTicket && (
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #D8E5DE",
          borderRadius: "8px",
          padding: "24px",
        }}
      >
        <p>
          <strong>Ticket Number:</strong>{" "}
          {createdTicket.ticketNumber}
        </p>

        <p>
          <strong>Ticket Date:</strong>{" "}
          {new Date(
            createdTicket.ticketDate
          ).toLocaleString()}
        </p>

        <p>
          <strong>Summary:</strong>{" "}
          {createdTicket.summary}
        </p>

        <p>
          <strong>Description:</strong>{" "}
          {createdTicket.description}
        </p>

        <p>
          <strong>Category:</strong>{" "}
          {createdTicket.category.name}
        </p>

        <p>
          <strong>Related System:</strong>{" "}
          {createdTicket.relatedSystem.name}
        </p>

        <p>
          <strong>Requested Priority:</strong>{" "}
          {createdTicket.requestedPriority}
        </p>

        <p>
          <strong>Status:</strong> Open
        </p>

        <button
          type="button"
          onClick={() => setPage("create")}
          style={{
            backgroundColor: "#006B3C",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "10px 16px",
            fontWeight: 600,
            cursor: "pointer",
            marginTop: "16px",
          }}
        >
          Back
        </button>
      </div>
    )}
  </div>
) : (
          /* ==========================================
             CREATE TICKET
             ========================================== */

          <section
            className="ticket-card"
            style={{
              backgroundColor: "white",
              border: "1px solid #D8E5DE",
              borderRadius: "12px",
              padding: "28px",
              boxShadow:
                "0 2px 8px rgba(0, 0, 0, 0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
                marginBottom: "24px",
              }}
            >
              <div>
                <h2
                  style={{
                    color: "#006B3C",
                    margin: 0,
                  }}
                >
                  Create Ticket
                </h2>

                <p
                  style={{
                    marginBottom: 0,
                    color: "#53685D",
                  }}
                >
                  Submit a new IT support
                  request.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPage("home");
                  resetCreateForm();
                }}
                disabled={submitting}
                style={{
                  backgroundColor:
                    "#FFFFFF",
                  color: "#006B3C",
                  border:
                    "1px solid #AFC7BA",
                  borderRadius: "6px",
                  padding:
                    "9px 16px",
                  fontWeight: 600,
                  cursor: submitting
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                Cancel
              </button>
            </div>

            {/* ========================================
                SUCCESS
                ======================================== */}

            {createdTicket ? (
              <div>
                <div
                  role="status"
                  aria-live="polite"
                  style={{
                    backgroundColor:
                      "#EAF6EF",
                    border:
                      "1px solid #B8D9C7",
                    borderRadius: "8px",
                    padding: "20px",
                    marginBottom:
                      "24px",
                  }}
                >
                  <h3
                    style={{
                      color: "#006B3C",
                      marginTop: 0,
                    }}
                  >
                    Ticket created successfully.
                  </h3>

                  <p
                    style={{
                      marginBottom:
                        "8px",
                    }}
                  >
                    Ticket Number:
                  </p>

                  <strong
                    style={{
                      fontSize: "24px",
                      color: "#006B3C",
                    }}
                  >
                    {
                      createdTicket.ticketNumber
                    }
                  </strong>

                  <p
                    style={{
                      marginBottom: 0,
                      marginTop: "12px",
                    }}
                  >
                    Ticket Date:{" "}
                    {new Date(
                      createdTicket.ticketDate
                    ).toLocaleString()}
                  </p>
                </div>

                <div
                  className="action-row"
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Future Issue #19 */}
                  <button
                    type="button"
                    onClick={handleViewCreatedTicket}
                    style={{
                      backgroundColor:
                        "#EAF6EF",
                      color: "#006B3C",
                      border:
                        "1px solid #B8D9C7",
                      borderRadius: "6px",
                      padding:
                        "10px 16px",
                      fontWeight: 600,
                      cursor:
                        "pointer",
                    }}
                  >
                    View Ticket
                  </button>

                  {/* Future Issue #18 */}
                  <button
                    type="button"
                    onClick={() => setPage("tickets")}
                    style={{
                      backgroundColor:
                        "#EAF6EF",
                      color: "#006B3C",
                      border:
                        "1px solid #B8D9C7",
                      borderRadius: "6px",
                      padding:
                        "10px 16px",
                      fontWeight: 600,
                      cursor:
                        "pointer",
                      
                    }}
                  >
                    My Tickets
                  </button>

                  <button
                    type="button"
                    onClick={
                      resetCreateForm
                    }
                    style={{
                      backgroundColor:
                        "#006B3C",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding:
                        "10px 16px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Create Another Ticket
                  </button>
                </div>
              </div>
            ) : (
              /* ======================================
                 CREATE FORM
                 ====================================== */

              <form
                onSubmit={
                  handleCreateTicket
                }
              >
                {/* System-generated */}
                <fieldset
                  disabled={submitting}
                  style={{
                    border:
                      "1px solid #D8E5DE",
                    borderRadius: "8px",
                    padding: "20px",
                    marginBottom:
                      "24px",
                    backgroundColor:
                      "#F5F7F6",
                  }}
                >
                  <legend
                    style={{
                      padding:
                        "0 8px",
                      fontWeight: 700,
                      color: "#006B3C",
                    }}
                  >
                    Ticket Information
                  </legend>

                  <div
                    className="classification-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(3, minmax(0, 1fr))",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label
                        style={
                          labelStyle
                        }
                      >
                        Ticket Number
                      </label>

                      <div
                        style={{
                          ...inputStyle,
                          backgroundColor:
                            "#EEF2EF",
                          color:
                            "#64766C",
                        }}
                      >
                        Generated after
                        submission
                      </div>
                    </div>

                    <div>
                      <label
                        style={
                          labelStyle
                        }
                      >
                        Ticket Date
                      </label>

                      <div
                        style={{
                          ...inputStyle,
                          backgroundColor:
                            "#EEF2EF",
                          color:
                            "#64766C",
                        }}
                      >
                        Generated after
                        submission
                      </div>
                    </div>

                    <div>
                      <label
                        style={
                          labelStyle
                        }
                      >
                        Requester
                      </label>

                      <div
                        style={{
                          ...inputStyle,
                          backgroundColor:
                            "#F1F3EE",
                          color:
                            "#53685D",
                        }}
                      >
                        {
                          selectedRequester.name
                        }
                      </div>
                    </div>
                  </div>
                </fieldset>

                {/* Reference loading */}
                {referenceLoading && (
                  <div
                    role="status"
                    aria-live="polite"
                    style={{
                      backgroundColor:
                        "#EAF6EF",
                      padding: "14px",
                      borderRadius:
                        "8px",
                      marginBottom:
                        "20px",
                    }}
                  >
                    Loading Categories and
                    Related Systems...
                  </div>
                )}

                {/* Reference error */}
                {referenceError &&
                  !referenceLoading && (
                    <div
                      role="alert"
                      style={{
                        backgroundColor:
                          "#FFF3F3",
                        border:
                          "1px solid #E3B8B8",
                        padding: "16px",
                        borderRadius:
                          "8px",
                        marginBottom:
                          "20px",
                      }}
                    >
                      Unable to load
                      Categories and
                      Related Systems.
                      Please try again.

                      <div
                        style={{
                          marginTop:
                            "12px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={
                            loadCreateTicketReferenceData
                          }
                          style={{
                            backgroundColor:
                              "#006B3C",
                            color:
                              "white",
                            border:
                              "none",
                            borderRadius:
                              "6px",
                            padding:
                              "9px 16px",
                            cursor:
                              "pointer",
                            fontWeight:
                              600,
                          }}
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  )}

                {!referenceError && (
                  <>
                    {/* Classification */}
                    <fieldset
                      disabled={
                        submitting ||
                        referenceLoading
                      }
                      style={{
                        border: "none",
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      <legend
                        style={{
                          fontSize:
                            "18px",
                          fontWeight: 700,
                          color:
                            "#006B3C",
                          marginBottom:
                            "16px",
                        }}
                      >
                        Classification
                      </legend>

                      <div
                        className="classification-grid"
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(3, minmax(0, 1fr))",
                          gap: "20px",
                          marginBottom:
                            "24px",
                        }}
                      >
                        {/* Category */}
                        <div>
                          <label
                            htmlFor="category"
                            style={
                              labelStyle
                            }
                          >
                            Category{" "}
                            <span
                              style={{
                                color:
                                  "#9B2C2C",
                              }}
                              aria-hidden="true"
                            >
                              *
                            </span>
                          </label>

                          <select
                            id="category"
                            value={
                              categoryId
                            }
                            onChange={(
                              event
                            ) => {
                              setCategoryId(
                                event.target
                                  .value
                              );

                              setErrors(
                                (
                                  current
                                ) => ({
                                  ...current,
                                  categoryId:
                                    undefined,
                                })
                              );
                            }}
                            aria-required="true"
                            aria-invalid={Boolean(
                              errors.categoryId
                            )}
                            style={{
                              ...inputStyle,
                              borderColor:
                                errors.categoryId
                                  ? "#9B2C2C"
                                  : "#AFC7BA",
                            }}
                          >
                            <option value="">
                              Select a
                              category
                            </option>

                            {categories.map(
                              (
                                category
                              ) => (
                                <option
                                  key={
                                    category.id
                                  }
                                  value={
                                    category.id
                                  }
                                >
                                  {
                                    category.name
                                  }
                                </option>
                              )
                            )}
                          </select>

                          {errors.categoryId && (
                            <p
                              role="alert"
                              style={
                                errorStyle
                              }
                            >
                              {
                                errors.categoryId
                              }
                            </p>
                          )}
                        </div>

                        {/* Related System */}
                        <div>
                          <label
                            htmlFor="related-system"
                            style={
                              labelStyle
                            }
                          >
                            Related System{" "}
                            <span
                              style={{
                                color:
                                  "#9B2C2C",
                              }}
                              aria-hidden="true"
                            >
                              *
                            </span>
                          </label>

                          <select
                            id="related-system"
                            value={
                              relatedSystemId
                            }
                            onChange={(
                              event
                            ) => {
                              setRelatedSystemId(
                                event.target
                                  .value
                              );

                              setErrors(
                                (
                                  current
                                ) => ({
                                  ...current,
                                  relatedSystemId:
                                    undefined,
                                })
                              );
                            }}
                            aria-required="true"
                            aria-invalid={Boolean(
                              errors.relatedSystemId
                            )}
                            style={{
                              ...inputStyle,
                              borderColor:
                                errors.relatedSystemId
                                  ? "#9B2C2C"
                                  : "#AFC7BA",
                            }}
                          >
                            <option value="">
                              Select a
                              related system
                            </option>

                            {relatedSystems.map(
                              (
                                system
                              ) => (
                                <option
                                  key={
                                    system.id
                                  }
                                  value={
                                    system.id
                                  }
                                >
                                  {
                                    system.name
                                  }
                                </option>
                              )
                            )}
                          </select>

                          {errors.relatedSystemId && (
                            <p
                              role="alert"
                              style={
                                errorStyle
                              }
                            >
                              {
                                errors.relatedSystemId
                              }
                            </p>
                          )}
                        </div>

                        {/* Priority */}
                        <div>
                          <label
                            htmlFor="priority"
                            style={
                              labelStyle
                            }
                          >
                            Requested Priority{" "}
                            <span
                              style={{
                                color:
                                  "#9B2C2C",
                              }}
                              aria-hidden="true"
                            >
                              *
                            </span>
                          </label>

                          <select
                            id="priority"
                            value={
                              requestedPriority
                            }
                            onChange={(
                              event
                            ) => {
                              setRequestedPriority(
                                event.target
                                  .value as CreateTicketInput["requestedPriority"]
                              );

                              setErrors(
                                (
                                  current
                                ) => ({
                                  ...current,
                                  requestedPriority:
                                    undefined,
                                })
                              );
                            }}
                            aria-required="true"
                            aria-invalid={Boolean(
                              errors.requestedPriority
                            )}
                            style={{
                              ...inputStyle,
                              borderColor:
                                errors.requestedPriority
                                  ? "#9B2C2C"
                                  : "#AFC7BA",
                            }}
                          >
                            <option value="LOW">
                              LOW
                            </option>

                            <option value="MEDIUM">
                              MEDIUM
                            </option>

                            <option value="HIGH">
                              HIGH
                            </option>
                          </select>

                          {errors.requestedPriority && (
                            <p
                              role="alert"
                              style={
                                errorStyle
                              }
                            >
                              {
                                errors.requestedPriority
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </fieldset>

                    {/* Main Information */}
                    <fieldset
                      disabled={
                        submitting ||
                        referenceLoading
                      }
                      style={{
                        border: "none",
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      <legend
                        style={{
                          fontSize:
                            "18px",
                          fontWeight: 700,
                          color:
                            "#006B3C",
                          marginBottom:
                            "16px",
                        }}
                      >
                        Main Information
                      </legend>

                      {/* Summary */}
                      <div
                        style={{
                          marginBottom:
                            "20px",
                        }}
                      >
                        <label
                          htmlFor="summary"
                          style={
                            labelStyle
                          }
                        >
                          Summary{" "}
                          <span
                            style={{
                              color:
                                "#9B2C2C",
                            }}
                            aria-hidden="true"
                          >
                            *
                          </span>
                        </label>

                        <input
                          id="summary"
                          type="text"
                          value={summary}
                          onChange={(
                            event
                          ) => {
                            setSummary(
                              event.target
                                .value
                            );

                            setErrors(
                              (
                                current
                              ) => ({
                                ...current,
                                summary:
                                  undefined,
                              })
                            );
                          }}
                          maxLength={200}
                          aria-required="true"
                          aria-invalid={Boolean(
                            errors.summary
                          )}
                          aria-describedby="summary-help"
                          style={{
                            ...inputStyle,
                            borderColor:
                              errors.summary
                                ? "#9B2C2C"
                                : "#AFC7BA",
                          }}
                        />

                        <p
                          id="summary-help"
                          style={{
                            fontSize:
                              "14px",
                            color:
                              "#53685D",
                            marginTop:
                              "6px",
                            marginBottom:
                              0,
                          }}
                        >
                          {
                            summary.trim()
                              .length
                          }
                          /200 characters
                        </p>

                        {errors.summary && (
                          <p
                            role="alert"
                            style={
                              errorStyle
                            }
                          >
                            {
                              errors.summary
                            }
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      <div
                        style={{
                          marginBottom:
                            "24px",
                        }}
                      >
                        <label
                          htmlFor="description"
                          style={
                            labelStyle
                          }
                        >
                          Description{" "}
                          <span
                            style={{
                              color:
                                "#9B2C2C",
                            }}
                            aria-hidden="true"
                          >
                            *
                          </span>
                        </label>

                        <textarea
                          id="description"
                          value={
                            description
                          }
                          onChange={(
                            event
                          ) => {
                            setDescription(
                              event.target
                                .value
                            );

                            setErrors(
                              (
                                current
                              ) => ({
                                ...current,
                                description:
                                  undefined,
                              })
                            );
                          }}
                          rows={8}
                          maxLength={2000}
                          aria-required="true"
                          aria-invalid={Boolean(
                            errors.description
                          )}
                          aria-describedby="description-help"
                          style={{
                            ...inputStyle,
                            minHeight:
                              "160px",
                            borderColor:
                              errors.description
                                ? "#9B2C2C"
                                : "#AFC7BA",
                          }}
                        />

                        <p
                          id="description-help"
                          style={{
                            fontSize:
                              "14px",
                            color:
                              "#53685D",
                            marginTop:
                              "6px",
                            marginBottom:
                              0,
                          }}
                        >
                          {
                            description.trim()
                              .length
                          }
                          /2000 characters
                        </p>

                        {errors.description && (
                          <p
                            role="alert"
                            style={
                              errorStyle
                            }
                          >
                            {
                              errors.description
                            }
                          </p>
                        )}
                      </div>
                    </fieldset>

                    {/* API error */}
                    {submitError && (
                      <div
                        role="alert"
                        style={{
                          backgroundColor:
                            "#FFF3F3",
                          border:
                            "1px solid #E3B8B8",
                          color:
                            "#7A2020",
                          padding: "14px",
                          borderRadius:
                            "8px",
                          marginBottom:
                            "20px",
                        }}
                      >
                        {submitError}
                      </div>
                    )}

                    {/* Actions */}
                    <div
                      className="action-row"
                      style={{
                        display: "flex",
                        justifyContent:
                          "flex-end",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setPage("home");
                          resetCreateForm();
                        }}
                        disabled={
                          submitting
                        }
                        style={{
                          backgroundColor:
                            "#FFFFFF",
                          color:
                            "#006B3C",
                          border:
                            "1px solid #AFC7BA",
                          borderRadius:
                            "6px",
                          padding:
                            "11px 20px",
                          fontWeight:
                            600,
                          cursor:
                            submitting
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        Cancel / Clear
                      </button>

                      <button
                        type="submit"
                        disabled={
                          submitting ||
                          referenceLoading ||
                          referenceError
                        }
                        style={{
                          backgroundColor:
                            submitting ||
                            referenceLoading ||
                            referenceError
                              ? "#AABDB3"
                              : "#006B3C",
                          color: "white",
                          border: "none",
                          borderRadius:
                            "6px",
                          padding:
                            "11px 24px",
                          fontWeight:
                            700,
                          fontSize:
                            "16px",
                          cursor:
                            submitting ||
                            referenceLoading ||
                            referenceError
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        {submitting
                          ? "Creating Ticket..."
                          : "Create Ticket"}
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </section>
        )}
      </main>
    </div>
  );
}