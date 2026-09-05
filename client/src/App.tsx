import { useEffect, useState } from "react";
import {
  DevelopmentRequester,
  getDevelopmentRequesters,
} from "./api.js";

export default function App() {
  const [requesters, setRequesters] = useState<DevelopmentRequester[]>([]);
  const [selectedRequester, setSelectedRequester] =
    useState<DevelopmentRequester | null>(null);

  const [requesterLoading, setRequesterLoading] = useState(true);
  const [requesterError, setRequesterError] = useState(false);
  const [continueLoading, setContinueLoading] = useState(false);

  const [isSelected, setIsSelected] = useState(false);

  async function loadRequesters() {
    setRequesterLoading(true);
    setRequesterError(false);

    try {
      const result = await getDevelopmentRequesters();
      setRequesters(result);
    } catch (error) {
      console.error("Failed to load requesters:", error);
      setRequesterError(true);
    } finally {
      setRequesterLoading(false);
    }
  }

  useEffect(() => {
    loadRequesters();
  }, []);

  function handleContinue() {
    if (!selectedRequester) {
      return;
    }

    setContinueLoading(true);

    // Simulate completing the requester selection.
    // Requester-specific pages can use this selected requester later.
    setTimeout(() => {
      setIsSelected(true);
      setContinueLoading(false);
    }, 300);
  }

  function handleChangeRequester() {
    setIsSelected(false);
    setSelectedRequester(null);
  }

  function handleRequesterChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const requester = requesters.find(
      (item) => item.id === Number(event.target.value)
    );

    setSelectedRequester(requester ?? null);

    // Reload requester-specific data whenever the selection changes.
    // This will be connected to requester-specific APIs as those features
    // are implemented.
    setIsSelected(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5F7F6",
        color: "#17352A",
      }}
    >
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
            maxWidth: "960px",
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

          {isSelected && selectedRequester && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <span>
                Requester: <strong>{selectedRequester.name}</strong>
              </span>

              <button
                type="button"
                onClick={handleChangeRequester}
                style={{
                  border: "1px solid white",
                  backgroundColor: "transparent",
                  color: "white",
                  borderRadius: "6px",
                  padding: "7px 12px",
                  cursor: "pointer",
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
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          padding: "32px 20px",
        }}
      >
        {!isSelected ? (
          <section
            style={{
              maxWidth: "640px",
              margin: "20px auto",
              backgroundColor: "white",
              border: "1px solid #D8E5DE",
              borderRadius: "12px",
              padding: "28px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
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
              Select a Development Requester to test requester-specific
              ticket behavior. This is not a login screen. Authentication
              and role-based access will be introduced in Lab 3.
            </p>

            {/* Loading state */}
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

            {/* API failure state */}
            {requesterError && !requesterLoading && (
              <div
                role="alert"
                style={{
                  backgroundColor: "#FFF3F3",
                  border: "1px solid #E3B8B8",
                  padding: "16px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              >
                <p style={{ marginTop: 0 }}>
                  We could not load the Development Requesters.
                </p>

                <p>
                  Please check the connection and try again.
                </p>

                <button
                  type="button"
                  onClick={loadRequesters}
                  style={{
                    backgroundColor: "#006B3C",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "9px 16px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty state */}
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
                  No active Development Requesters are available.
                  Please contact the administrator or try again later.
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
                  <div style={{ marginBottom: "20px" }}>
                    <label
                      htmlFor="requester"
                      style={{
                        display: "block",
                        fontWeight: 600,
                        marginBottom: "8px",
                      }}
                    >
                      Requester
                    </label>

                    <select
                      id="requester"
                      value={selectedRequester?.id ?? ""}
                      onChange={handleRequesterChange}
                      aria-describedby="requester-help"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "11px 12px",
                        border: "1px solid #AFC7BA",
                        borderRadius: "6px",
                        backgroundColor: "white",
                        color: "#17352A",
                        fontSize: "16px",
                      }}
                    >
                      <option value="">Select a requester</option>

                      {requesters.map((requester) => (
                        <option key={requester.id} value={requester.id}>
                          {requester.name} ({requester.email})
                        </option>
                      ))}
                    </select>

                    <p
                      id="requester-help"
                      style={{
                        fontSize: "14px",
                        color: "#53685D",
                        marginTop: "8px",
                      }}
                    >
                      Choose an active Development Requester for Lab 2
                      testing.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedRequester || continueLoading}
                    style={{
                      width: "100%",
                      backgroundColor:
                        selectedRequester && !continueLoading
                          ? "#006B3C"
                          : "#AABDB3",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "12px 18px",
                      cursor:
                        selectedRequester && !continueLoading
                          ? "pointer"
                          : "not-allowed",
                      fontSize: "16px",
                      fontWeight: 700,
                    }}
                  >
                    {continueLoading ? "Continuing..." : "Continue"}
                  </button>
                </form>
              )}
          </section>
        ) : (
          <section
            style={{
              backgroundColor: "white",
              border: "1px solid #D8E5DE",
              borderRadius: "12px",
              padding: "28px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            }}
          >
            <h2 style={{ color: "#006B3C", marginTop: 0 }}>
              Welcome, {selectedRequester?.name}
            </h2>

            <p>
              You are currently testing TokTickIT as{" "}
              <strong>{selectedRequester?.name}</strong>.
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
              <button
                type="button"
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

              <button
                type="button"
                style={{
                  backgroundColor: "#006B3C",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "10px 16px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Create Ticket
              </button>
            </nav>
          </section>
        )}
      </main>
    </div>
  );
}

