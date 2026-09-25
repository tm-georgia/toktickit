import "./App.css";
import { FormEvent, useEffect, useState } from "react";
import MyTickets from "./MyTickets.js";
import CreateTicket from "./CreateTicket.js";
import TicketDetail from "./TicketDetail.js";
import ITStaffTicketDetail from "./ITStaffTicketDetail.js";
import {
  getCategories,
  getRelatedSystems,
  type Category,
  type RelatedSystem,
} from "./api.js";
import {
  changePassword,
  getCurrentUser,
  login,
  logout,
  type User,
} from "./authApi.js";

type Page =
  | "home"
  | "login"
  | "change-password"
  | "my-tickets"
  | "create-ticket"
  | "ticket-detail"
  | "it-staff-ticket-detail";

function LoginScreen({
  onLogin,
}: {
  onLogin: (user: User) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);
      onLogin(user);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to log in.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark">TokTickIT</div>

        <h1>Sign in</h1>
        <p className="auth-description">
          Sign in to access the TokTickIT ticketing system.
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}

function ChangePasswordScreen({
  user,
  onPasswordChanged,
}: {
  user: User;
  onPasswordChanged: (user: User) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRules = {
    length: newPassword.length >= 12,
    lowercase: /[a-z]/.test(newPassword),
    uppercase: /[A-Z]/.test(newPassword),
    numeric: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };

  const passwordsMatch =
    newPassword.length > 0 &&
    newPassword === confirmPassword;

  const passwordValid =
    passwordRules.length &&
    passwordRules.lowercase &&
    passwordRules.uppercase &&
    passwordRules.numeric &&
    passwordRules.special;

  const canSubmit =
    currentPassword.length > 0 &&
    passwordValid &&
    passwordsMatch &&
    !loading;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!passwordValid) {
      setError("Please meet all password requirements.");
      return;
    }

    if (!passwordsMatch) {
      setError("New password and confirmation do not match.");
      return;
    }

    setLoading(true);

    try {
      const updatedUser = await changePassword(
        currentPassword,
        newPassword,
        confirmPassword,
      );

      onPasswordChanged(updatedUser);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to change password.",
      );
    } finally {
      setLoading(false);
    }
  }

  function PasswordToggle({
    visible,
    onToggle,
  }: {
    visible: boolean;
    onToggle: () => void;
  }) {
    return (
      <button
        type="button"
        className="password-toggle"
        onClick={onToggle}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? "◉" : "◌"}
      </button>
    );
  }

  function PasswordRule({
    valid,
    children,
  }: {
    valid: boolean;
    children: React.ReactNode;
  }) {
    return (
      <li className={valid ? "password-rule valid" : "password-rule"}>
        <span className="password-rule-icon">
          {valid ? "✓" : "○"}
        </span>
        <span>{children}</span>
      </li>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark">TokTickIT</div>

        <h1>Change your password</h1>

        <p className="auth-description">
          Your account requires an initial password change before you
          can continue.
        </p>

        <p className="user-info">
          Signed in as <strong>{user.email}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            Current password
            <div className="password-input-wrapper">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(event.target.value)
                }
                autoComplete="current-password"
                required
              />

              <PasswordToggle
                visible={showCurrentPassword}
                onToggle={() =>
                  setShowCurrentPassword(
                    (current) => !current,
                  )
                }
              />
            </div>
          </label>

          <label>
            New password
            <div className="password-input-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                autoComplete="new-password"
                required
              />

              <PasswordToggle
                visible={showNewPassword}
                onToggle={() =>
                  setShowNewPassword(
                    (current) => !current,
                  )
                }
              />
            </div>
          </label>

          <div className="password-requirements">
            <p>Password requirements:</p>

            <ul>
              <PasswordRule valid={passwordRules.length}>
                At least 12 characters
              </PasswordRule>

              <PasswordRule valid={passwordRules.lowercase}>
                At least one lowercase letter
              </PasswordRule>

              <PasswordRule valid={passwordRules.uppercase}>
                At least one uppercase letter
              </PasswordRule>

              <PasswordRule valid={passwordRules.numeric}>
                At least one number
              </PasswordRule>

              <PasswordRule valid={passwordRules.special}>
                At least one special character
              </PasswordRule>
            </ul>
          </div>

          <label>
            Confirm new password
            <div className="password-input-wrapper">
              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                autoComplete="new-password"
                required
              />

              <PasswordToggle
                visible={showConfirmPassword}
                onToggle={() =>
                  setShowConfirmPassword(
                    (current) => !current,
                  )
                }
              />
            </div>
          </label>

          {confirmPassword.length > 0 && (
            <div
              className={
                passwordsMatch
                  ? "password-match valid"
                  : "password-match"
              }
            >
              <span>
                {passwordsMatch ? "✓" : "○"}
              </span>
              <span>
                {passwordsMatch
                  ? "Passwords match"
                  : "Passwords do not match"}
              </span>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
          >
            {loading
              ? "Changing password..."
              : "Change password"}
          </button>
        </form>
      </section>
    </main>
  );
}

function RoleHome({
  user,
  onLogout,
  onNavigate,
  onOpenITStaffTicket,
}: {
  user: User;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
  onOpenITStaffTicket: (ticketId: number) => void;
}) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <div className="brand-mark">TokTickIT</div>
          <span>Ticketing System</span>
        </div>

        <div className="user-section">
          <div>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
            <span>{user.role}</span>
          </div>

          <button type="button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className="page-content">
        <section className="welcome-card">
          <h1>Welcome, {user.name}</h1>

          <p>
            You are signed in as{" "}
            <strong>{user.role}</strong>.
          </p>

          <div className="role-card">
            {user.role === "REQUESTER" && (
              <>
                <h2>Requester</h2>

                <p>
                  Manage your IT support requests.
                </p>

                <div className="home-actions">
                  <button
                    type="button"
                    onClick={() =>
                      onNavigate("my-tickets")
                    }
                  >
                    My Tickets
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onNavigate("create-ticket")
                    }
                  >
                    Create Ticket
                  </button>
                </div>
              </>
            )}

            {user.role === "IT_STAFF" && (
  <>
    <h2>IT Staff</h2>

    <p>
      View and manage assigned IT support
      tickets.
    </p>

    <div className="home-actions">
      <button
        type="button"
        onClick={() =>
          onOpenITStaffTicket(2)
        }
      >
        Open Ticket TCK-20260921-0002
      </button>
    </div>
  </>
)}

            {user.role === "ADMINISTRATOR" && (
              <>
                <h2>Administrator</h2>

                <p>
                  Manage TokTickIT users and access.
                </p>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<Page>("login");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(
  null
);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
const [relatedSystems, setRelatedSystems] =
  useState<RelatedSystem[]>([]);
const [referenceLoading, setReferenceLoading] =
  useState(false);

  useEffect(() => {
    async function restoreSession() {
      try {
        const currentUser = await getCurrentUser();

        setUser(currentUser);

        if (currentUser.mustChangePassword) {
          setPage("change-password");
        } else {
          setPage("home");
        }
      } catch {
        setUser(null);
        setPage("login");
      } finally {
        setLoading(false);
      }
    }

    void restoreSession();
  }, []);

  useEffect(() => {
  if (
    !user ||
    user.mustChangePassword ||
    user.role !== "REQUESTER"
  ) {
    return;
  }

  async function loadReferenceData() {
    setReferenceLoading(true);

    try {
      const [categoryData, systemData] =
        await Promise.all([
          getCategories(),
          getRelatedSystems(),
        ]);

      setCategories(categoryData);
      setRelatedSystems(systemData);
    } catch (cause) {
      console.error(
        "Failed to load reference data:",
        cause
      );
    } finally {
      setReferenceLoading(false);
    }
  }

  void loadReferenceData();
}, [user]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setUser(null);
      setPage("login");
    }
  }

  if (loading) {
    return (
      <main className="loading-page">
        <div>Loading...</div>
      </main>
    );
  }

  if (!user || page === "login") {
    return (
      <LoginScreen
        onLogin={(loggedInUser) => {
          setUser(loggedInUser);

          if (loggedInUser.mustChangePassword) {
            setPage("change-password");
          } else {
            setPage("home");
          }
        }}
      />
    );
  }

  if (page === "change-password") {
  return (
    <ChangePasswordScreen
      user={user}
      onPasswordChanged={(updatedUser) => {
        setUser(updatedUser);
        setPage("home");
      }}
    />
  );
}

if (page === "my-tickets" && user.role === "REQUESTER") {
  return (
    <MyTickets
      user={user}
      categories={categories}
      relatedSystems={relatedSystems}
      onBack={() => setPage("home")}
      onCreateTicket={() => setPage("create-ticket")}
      onViewTicket={(ticketId) => {
  setSelectedTicketId(ticketId);
  setPage("ticket-detail");
}}
    />
  );
}

if (page === "create-ticket" && user.role === "REQUESTER") {
  return (
    <CreateTicket
      user={user}
      categories={categories}
      relatedSystems={relatedSystems}
      onBack={() => setPage("home")}
      onCreated={() => setPage("my-tickets")}
    />
  );
}

if (
  page === "ticket-detail" &&
  user.role === "REQUESTER" &&
  selectedTicketId !== null
) {
  return (
    <TicketDetail
      user={user}
      ticketId={selectedTicketId}
      onBack={() => setPage("my-tickets")}
    />
  );
}

if (
  page === "it-staff-ticket-detail" &&
  user.role === "IT_STAFF" &&
  selectedTicketId !== null
) {
  return (
    
    <ITStaffTicketDetail
    
      user={user}
      ticketId={selectedTicketId}
      onBack={() => setPage("home")}
    />
    
    
  );
}

return (
  <RoleHome
    user={user}
    onLogout={handleLogout}
    onNavigate={setPage}
    onOpenITStaffTicket={(ticketId) => {
      setSelectedTicketId(ticketId);
      setPage("it-staff-ticket-detail");
    }}
  />
);
}

export default App;