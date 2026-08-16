import { useState } from "react";
import { checkSystem, Category } from "./api.js";

// UI states you must handle for Issue 4: idle, loading, success, error.
type UiState = "idle" | "loading" | "success" | "error";

export default function App() {
  const [state, setState] = useState<UiState>("idle");
  const [categories, setCategories] = useState<Category[]>([]);
  void categories;

  async function handleCheck() {
  setState("loading");

  try {
    const result = await checkSystem();

    setCategories(result.categories);
    setState("success");
  } catch (error) {
    setState("error");
  }
}

  return (
    <div className="container py-5" style={{ maxWidth: 640 }}>
      <h1 className="h3 mb-4">
        TokTickIT <span className="text-success">IT Service Desk</span>
      </h1>

      <button className="btn btn-success" onClick={handleCheck} disabled={state === "loading"}>
        {state === "loading" ? "Loading…" : "Check System"}
      </button>

      {state === "loading" && (
  <p>Checking system...</p>
)}

{state === "success" && (
  <div>
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
  <div>
    <p>Offline</p>
    <p>Unable to connect to the backend or load categories.</p>
  </div>
)}
    </div>
  );
}
