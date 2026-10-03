import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createAdminUser,
  getAdminUsers,
  resetAdminUserPassword,
  updateAdminUser,
  updateAdminUserStatus,
  type AdminUser,
  type AdminUserRole,
} from "./api.js";
import type { User } from "./authApi.js";

type AdminUserManagementProps = {
  user: User;
  onBack: () => void;
};

const roles: AdminUserRole[] = [
  "REQUESTER",
  "IT_STAFF",
  "ADMINISTRATOR",
];

const PAGE_SIZE = 10;

function roleLabel(role: AdminUserRole): string {
  if (role === "IT_STAFF") {
    return "IT Staff";
  }

  if (role === "ADMINISTRATOR") {
    return "Administrator";
  }

  return "Requester";
}

function formatStatus(isActive: boolean): string {
  return isActive ? "Active" : "Inactive";
}

export default function AdminUserManagement({
  user,
  onBack,
}: AdminUserManagementProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "" | AdminUserRole
  >("");
const [nameSort, setNameSort] = useState<
  "asc" | "desc"
>("asc");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] =
    useState<AdminUser | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] =
    useState<AdminUserRole>("REQUESTER");
  const [initialPassword, setInitialPassword] = useState("");
const [showInitialPassword, setShowInitialPassword] =
  useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load users.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

const filteredUsers = useMemo(() => {
  const query = search.trim().toLowerCase();

  return users
    .filter((currentUser) => {
      const matchesSearch =
        !query ||
        currentUser.name.toLowerCase().includes(query) ||
        currentUser.email.toLowerCase().includes(query);

      const matchesRole =
        !roleFilter ||
        currentUser.role === roleFilter;

      return (
        matchesSearch &&
        matchesRole 
      );
    })
    .sort((firstUser, secondUser) => {
      const comparison = firstUser.name.localeCompare(
        secondUser.name,
        undefined,
        { sensitivity: "base" },
      );

      return nameSort === "asc"
        ? comparison
        : -comparison;
    });
}, [
  users,
  search,
  roleFilter,
  nameSort,
]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / PAGE_SIZE),
  );

  const paginatedUsers = useMemo(() => {
    const startIndex =
      (currentPage - 1) * PAGE_SIZE;

    return filteredUsers.slice(
      startIndex,
      startIndex + PAGE_SIZE,
    );
  }, [filteredUsers, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function resetForm() {
    setName("");
    setEmail("");
    setRole("REQUESTER");
    setInitialPassword("");
    setEditingUser(null);
    setShowForm(false);
  }

  function startCreate() {
    setError("");
    setSuccess("");

    setName("");
    setEmail("");
    setRole("REQUESTER");
    setInitialPassword("");

    setEditingUser(null);
    setShowForm(true);
  }

  function startEdit(currentUser: AdminUser) {
    setError("");
    setSuccess("");

    setName(currentUser.name);
    setEmail(currentUser.email);
    setRole(currentUser.role);
    setInitialPassword("");

    setEditingUser(currentUser);
    setShowForm(true);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  function handleRoleFilterChange(
    value: "" | AdminUserRole,
  ) {
    setRoleFilter(value);
    setCurrentPage(1);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setError("Name is required.");
      return;
    }

    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        trimmedEmail,
      )
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!editingUser && !initialPassword) {
      setError("Initial password is required.");
      return;
    }

    setProcessing(true);

    try {
      if (editingUser) {
        const updatedUser = await updateAdminUser(
          editingUser.id,
          {
            name: trimmedName,
            email: trimmedEmail,
            role,
          },
        );

        let finalUser = updatedUser;

        if (initialPassword) {
          finalUser = await resetAdminUserPassword(
            editingUser.id,
            initialPassword,
          );
        }

        setUsers((currentUsers) =>
          currentUsers.map((currentUser) =>
            currentUser.id === finalUser.id
              ? finalUser
              : currentUser,
          ),
        );

        setSuccess("User updated successfully.");
      } else {
        const createdUser = await createAdminUser({
          name: trimmedName,
          email: trimmedEmail,
          role,
          initialPassword,
        });

        setUsers((currentUsers) => [
          ...currentUsers,
          createdUser,
        ]);

        setSuccess("User created successfully.");
        setCurrentPage(1);
      }

      resetForm();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to save user.",
      );
    } finally {
      setProcessing(false);
    }
  }

  async function handleToggleStatus(
    currentUser: AdminUser,
  ) {
    setError("");
    setSuccess("");

    if (
      currentUser.id === Number(user.id) &&
      currentUser.isActive
    ) {
      setError(
        "You cannot deactivate your own account.",
      );
      return;
    }

    setProcessing(true);

    try {
      const updatedUser =
        await updateAdminUserStatus(
          currentUser.id,
          !currentUser.isActive,
        );

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item.id === updatedUser.id
            ? updatedUser
            : item,
        ),
      );

      setSuccess(
        updatedUser.isActive
          ? "User activated successfully."
          : "User deactivated successfully.",
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to update user status.",
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-topbar">
        <button
          type="button"
          className="admin-back-button"
          onClick={onBack}
        >
          ← Back
        </button>
      </div>

      <div className="admin-layout">
        <section className="admin-users-panel">
          <div className="admin-users-header">
            <div>
              <h1>Users</h1>
              <p>
                Manage TokTickIT user accounts and access.
              </p>
            </div>

            <button
              type="button"
              className="admin-create-button"
              onClick={startCreate}
              disabled={processing}
            >
              + Create User
            </button>
          </div>

          {error && (
            <div
              className="admin-feedback admin-feedback-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="admin-feedback admin-feedback-success"
              role="status"
            >
              {success}
            </div>
          )}

          <div className="admin-search-row">
            <div className="admin-search-box">
              <span>⌕</span>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  handleSearchChange(
                    event.target.value,
                  )
                }
                placeholder="Search users..."
                aria-label="Search users"
              />
            </div>

            <div className="admin-filter-box">
              <span>☷</span>

              <select
                value={roleFilter}
                onChange={(event) =>
                  handleRoleFilterChange(
                    event.target.value as
                      | ""
                      | AdminUserRole,
                  )
                }
                aria-label="Filter by role"
              >
                <option value="">All roles</option>

                {roles.map((item) => (
                  <option key={item} value={item}>
                    {roleLabel(item)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-table-card">
            {loading ? (
              <div className="admin-table-message">
                Loading users...
              </div>
            ) : paginatedUsers.length === 0 ? (
              <div className="admin-table-message">
                No users match your search.
              </div>
            ) : (
              <>
                <div className="admin-table-wrapper">
                  <table className="admin-users-table">
                    <thead>
                      <tr>
                        <th>
  <button
    type="button"
    className="admin-sort-button"
    onClick={() =>
      setNameSort((currentSort) =>
        currentSort === "asc"
          ? "desc"
          : "asc",
      )
    }
    aria-label={`Sort names ${
      nameSort === "asc"
        ? "descending"
        : "ascending"
    }`}
  >
    Name
    <span>
      {nameSort === "asc" ? " ↑" : " ↓"}
    </span>
  </button>
</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedUsers.map(
                        (currentUser) => (
                          <tr
                            key={currentUser.id}
                          >
                            <td data-label="Name">
                              <div className="admin-user-name">
                                {currentUser.name}
                              </div>

                              <div className="admin-user-email">
                                {currentUser.email}
                              </div>
                            </td>

                            <td data-label="Role">
                              <span
                                className={`admin-role-badge admin-role-${currentUser.role.toLowerCase()}`}
                              >
                                {roleLabel(
                                  currentUser.role,
                                )}
                              </span>
                            </td>

                            <td data-label="Status">
                              <span
                                className={`admin-status-badge ${
                                  currentUser.isActive
                                    ? "admin-status-active"
                                    : "admin-status-inactive"
                                }`}
                              >
                                {formatStatus(
                                  currentUser.isActive,
                                )}
                              </span>
                            </td>

                            <td data-label="Action">
                              <div className="admin-row-actions">
                                <button
                                  type="button"
                                  className="admin-edit-button"
                                  onClick={() =>
                                    startEdit(
                                      currentUser,
                                    )
                                  }
                                  disabled={
                                    processing
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="admin-status-button"
                                  onClick={() =>
                                    void handleToggleStatus(
                                      currentUser,
                                    )
                                  }
                                  disabled={
                                    processing ||
                                    currentUser.id ===
                                      Number(user.id)
                                  }
                                >
                                  {currentUser.isActive
                                    ? "Deactivate"
                                    : "Activate"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="admin-pagination">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          Math.max(1, page - 1),
                      )
                    }
                    disabled={currentPage === 1}
                  >
                    ‹ Prev
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={
                        currentPage === page
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setCurrentPage(page)
                      }
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          Math.min(
                            totalPages,
                            page + 1,
                          ),
                      )
                    }
                    disabled={
                      currentPage === totalPages
                    }
                  >
                    Next ›
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        {showForm && (
          <aside className="admin-form-panel">
            <div className="admin-form-header">
              <div>
                <h2>
                  {editingUser
                    ? "Edit User"
                    : "Create New User"}
                </h2>

                <p>
                  {editingUser
                    ? "Update account information."
                    : "Add a new TokTickIT user."}
                </p>
              </div>

              <button
                type="button"
                className="admin-close-button"
                onClick={resetForm}
                disabled={processing}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form
              className="admin-user-form"
              onSubmit={handleSubmit}
            >
              <label>
                <span>
                  Full Name <b>*</b>
                </span>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  disabled={processing}
                  placeholder="Enter full name"
                />
              </label>

              <label>
                <span>
                  Email Address <b>*</b>
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  disabled={processing}
                  placeholder="Enter email address"
                />
              </label>

              <label>
                <span>
                  Role <b>*</b>
                </span>

                <select
                  value={role}
                  onChange={(event) =>
                    setRole(
                      event.target.value as
                        AdminUserRole,
                    )
                  }
                  disabled={processing}
                >
                  {roles.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {roleLabel(item)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="admin-active-section">
                <span className="admin-field-title">
                  Active
                </span>

                <div className="admin-active-status">
                  <span className="admin-active-dot" />
                  <span>
                    {editingUser
                      ? editingUser.isActive
                        ? "Yes"
                        : "No"
                      : "Yes"}
                  </span>
                </div>
              </div>

              <label>
  <span>
    {editingUser
      ? "New Initial Password"
      : "Initial Password"}
  </span>

  <div className="admin-password-input">
    <input
      type={
        showInitialPassword
          ? "text"
          : "password"
      }
      value={initialPassword}
      onChange={(event) =>
        setInitialPassword(event.target.value)
      }
      disabled={processing}
      placeholder={
        editingUser
          ? "Leave blank to keep current password"
          : "Enter initial password"
      }
    />

    <button
      type="button"
      className="admin-password-toggle"
      onClick={() =>
        setShowInitialPassword(
          (visible) => !visible,
        )
      }
      disabled={processing}
      aria-label={
        showInitialPassword
          ? "Hide password"
          : "Show password"
      }
    >
       {showInitialPassword ? "◉" : "◌"}
    </button>
  </div>

  <small>
    {editingUser
      ? "Set a new password if needed."
      : "User will be required to change it on first login."}
  </small>
</label>

              <div className="admin-form-actions">
                <button
                  type="submit"
                  className="admin-save-button"
                  disabled={processing}
                >
                  {processing
                    ? "Saving..."
                    : "Save User"}
                </button>

                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={resetForm}
                  disabled={processing}
                >
                  Cancel
                </button>
              </div>

              {editingUser && (
                <button
                  type="button"
                  className="admin-panel-status-button"
                  onClick={() =>
                    void handleToggleStatus(
                      editingUser,
                    )
                  }
                  disabled={
                    processing ||
                    editingUser.id ===
                      Number(user.id)
                  }
                >
                  {editingUser.isActive
                    ? "Deactivate User"
                    : "Activate User"}
                </button>
              )}
            </form>
          </aside>
        )}
      </div>
    </main>
  );
}