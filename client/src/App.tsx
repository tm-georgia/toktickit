import { useEffect, useState } from "react";
import {
  checkSystem,
  Category,
  DevelopmentRequester,
  getDevelopmentRequesters,
} from "./api.js";

// UI states for the system check.
type UiState = "idle" | "loading" | "success" | "error";

export default function App() {
  const [state, setState] = useState<UiState>("idle");
  const [categories, setCategories] = useState<Category[]>([]);

  // Development Requester state
  const [requesters, setRequesters] = useState<DevelopmentRequester[]>([]);
  const [selectedRequester, setSelectedRequester] =
    useState<DevelopmentRequester | null>(null);
  const [requesterLoading, setRequesterLoading] = useState(true);
  const [requesterError, setRequesterError] = useState(false);

  // Load Development Requesters when the page opens.
  useEffect(() => {
    async function loadRequesters() {
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

    loadRequesters();
  }, []);

  async function handleCheck() {
    setState("loading");

    try {
      const result = await checkSystem();

      setCategories(result.categories);
      setState("success");
    } catch (error) {
      console.error("System check failed:", error);
      setState("error");
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 640 }}>
      <h1 className="h3 mb-4">
        TokTickIT{" "}
        <span className="text-success">IT Service Desk</span>
      </h1>

      {/* Development Requester Selection */}
      <section className="mb-4">
        <h2 className="h5">Select Development Requester</h2>

        {requesterLoading && (
          <p>Loading requesters...</p>
        )}

        {requesterError && (
          <div className="alert alert-danger">
            Unable to load development requesters. Please try again.
          </div>
        )}

        {!requesterLoading && !requesterError && (
          <div>
            <label htmlFor="requester" className="form-label">
              Requester
            </label>

            <select
              id="requester"
              className="form-select"
              value={selectedRequester?.id ?? ""}
              onChange={(event) => {
                const requester = requesters.find(
                  (item) => item.id === Number(event.target.value)
                );

                setSelectedRequester(requester ?? null);
              }}
            >
              <option value="">Select a requester</option>

              {requesters.map((requester) => (
                <option key={requester.id} value={requester.id}>
                  {requester.name} ({requester.email})
                </option>
              ))}
            </select>

            {selectedRequester && (
              <p className="mt-2 text-success">
                Selected: {selectedRequester.name}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Existing Lab 1 System Check */}
      <button
        className="btn btn-success"
        onClick={handleCheck}
        disabled={state === "loading"}
      >
        {state === "loading" ? "Loading…" : "Check System"}
      </button>

      {state === "loading" && (
        <p className="mt-3">Checking system...</p>
      )}

      {state === "success" && (
        <div className="mt-3">
          <p>Online</p>

          <h2>IT Request Categories</h2>

          <ul>
            {categories.map((category) => (
              <li key={category.id}>{category.name}</li>
            ))}
          </ul>
        </div>
      )}

      {state === "error" && (
        <div className="mt-3">
          <p>Offline</p>
          <p>
            Unable to connect to the backend or load categories.
          </p>
        </div>
      )}
    </div>
  );
}