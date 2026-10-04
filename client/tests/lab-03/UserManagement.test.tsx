import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminUserManagement from "../../src/AdminUserManagement.js";

const mockGetAdminUsers = vi.fn();
const mockCreateAdminUser = vi.fn();
const mockUpdateAdminUser = vi.fn();
const mockUpdateAdminUserStatus = vi.fn();
const mockResetAdminUserPassword = vi.fn();

vi.mock("../../src/api.js", () => ({
  getAdminUsers: (...args: unknown[]) =>
    mockGetAdminUsers(...args),
  createAdminUser: (...args: unknown[]) =>
    mockCreateAdminUser(...args),
  updateAdminUser: (...args: unknown[]) =>
    mockUpdateAdminUser(...args),
  updateAdminUserStatus: (...args: unknown[]) =>
    mockUpdateAdminUserStatus(...args),
  resetAdminUserPassword: (...args: unknown[]) =>
    mockResetAdminUserPassword(...args),
}));

describe("Lab 3 Administrator User Management UI", () => {
  const user = {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "ADMINISTRATOR" as const,
    mustChangePassword: false,
  };

  const mockOnBack = vi.fn();

  const users = [
    {
      id: 1,
      name: "Aye Aye",
      email: "ayeaye@example.com",
      role: "REQUESTER",
      isActive: true,
      mustChangePassword: false,
    },
    {
      id: 2,
      name: "Nandar IT",
      email: "nandar.it@example.com",
      role: "IT_STAFF",
      isActive: true,
      mustChangePassword: false,
    },
    {
      id: 3,
      name: "Kyaw IT",
      email: "kyaw.it@example.com",
      role: "IT_STAFF",
      isActive: false,
      mustChangePassword: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetAdminUsers.mockResolvedValue(users);

    mockCreateAdminUser.mockResolvedValue({
      id: 4,
      name: "New User",
      email: "newuser@example.com",
      role: "REQUESTER",
      isActive: true,
      mustChangePassword: true,
    });

    mockUpdateAdminUser.mockResolvedValue(users[0]);

    mockUpdateAdminUserStatus.mockResolvedValue({
      ...users[1],
      isActive: false,
    });

    mockResetAdminUserPassword.mockResolvedValue({
      ...users[0],
    });
  });

  it("shows the User Management page and users", async () => {
    render(
      <AdminUserManagement
        user={user as any}
        onBack={mockOnBack}
      />,
    );

    expect(
      await screen.findByRole("heading", {
        name: "Users",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Aye Aye"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Nandar IT"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Kyaw IT"),
    ).toBeInTheDocument();

    expect(mockGetAdminUsers).toHaveBeenCalled();
  });

  it("allows searching users", async () => {
    const testUser = userEvent.setup();

    render(
      <AdminUserManagement
        user={user as any}
        onBack={mockOnBack}
      />,
    );

    await screen.findByText("Aye Aye");

    const searchInput =
      screen.getByRole("searchbox", {
        name: "Search users",
      });

    await testUser.type(searchInput, "Nandar");

    expect(
      screen.getByText("Nandar IT"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Aye Aye"),
    ).not.toBeInTheDocument();
  });

  it("allows filtering users by role", async () => {
    const testUser = userEvent.setup();

    render(
      <AdminUserManagement
        user={user as any}
        onBack={mockOnBack}
      />,
    );

    await screen.findByText("Aye Aye");

    const roleFilter =
      screen.getByRole("combobox", {
        name: "Filter by role",
      });

    await testUser.selectOptions(
      roleFilter,
      "IT_STAFF",
    );

    expect(
      screen.getByText("Nandar IT"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Kyaw IT"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Aye Aye"),
    ).not.toBeInTheDocument();
  });

  it("allows sorting names", async () => {
    const testUser = userEvent.setup();

    render(
      <AdminUserManagement
        user={user as any}
        onBack={mockOnBack}
      />,
    );

    await screen.findByText("Aye Aye");

    const sortButton =
      screen.getByRole("button", {
        name: "Sort names descending",
      });

    expect(sortButton).toBeInTheDocument();

    await testUser.click(sortButton);

    expect(
      screen.getByRole("button", {
        name: "Sort names ascending",
      }),
    ).toBeInTheDocument();
  });

  it("opens the Create User form", async () => {
    const testUser = userEvent.setup();

    render(
      <AdminUserManagement
        user={user as any}
        onBack={mockOnBack}
      />,
    );

    await screen.findByText("Aye Aye");

    await testUser.click(
      screen.getByRole("button", {
        name: /\+ Create User/i,
      }),
    );

    expect(
      screen.getByText("Full Name"),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter full name"),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter email address"),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter initial password"),
    ).toBeInTheDocument();
  });

  it("creates a new user", async () => {
    const testUser = userEvent.setup();

    render(
      <AdminUserManagement
        user={user as any}
        onBack={mockOnBack}
      />,
    );

    await screen.findByText("Aye Aye");

    await testUser.click(
      screen.getByRole("button", {
        name: /\+ Create User/i,
      }),
    );

    await testUser.type(
      screen.getByPlaceholderText("Enter full name"),
      "New User",
    );

    await testUser.type(
      screen.getByPlaceholderText("Enter email address"),
      "newuser@example.com",
    );

    await testUser.type(
      screen.getByPlaceholderText("Enter initial password"),
      "NewPassword123!",
    );

    await testUser.click(
      screen.getByRole("button", {
        name: "Save User",
      }),
    );

    await waitFor(() => {
      expect(mockCreateAdminUser).toHaveBeenCalledWith({
        name: "New User",
        email: "newuser@example.com",
        role: "REQUESTER",
        initialPassword: "NewPassword123!",
      });
    });
  });

  it("allows the initial password to be shown and hidden", async () => {
    const testUser = userEvent.setup();

    render(
      <AdminUserManagement
        user={user as any}
        onBack={mockOnBack}
      />,
    );

    await screen.findByText("Aye Aye");

    await testUser.click(
      screen.getByRole("button", {
        name: /\+ Create User/i,
      }),
    );

    const passwordInput =
      screen.getByPlaceholderText(
        "Enter initial password",
      );

    expect(passwordInput).toHaveAttribute(
      "type",
      "password",
    );

    await testUser.click(
      screen.getByRole("button", {
        name: "Show password",
      }),
    );

    expect(passwordInput).toHaveAttribute(
      "type",
      "text",
    );

    expect(
      screen.getByRole("button", {
        name: "Hide password",
      }),
    ).toBeInTheDocument();

    await testUser.click(
      screen.getByRole("button", {
        name: "Hide password",
      }),
    );

    expect(passwordInput).toHaveAttribute(
      "type",
      "password",
    );
  });

  it("opens the edit form and updates a user", async () => {
    const testUser = userEvent.setup();

    render(
      <AdminUserManagement
        user={user as any}
        onBack={mockOnBack}
      />,
    );

    await screen.findByText("Aye Aye");

    const editButtons =
      screen.getAllByRole("button", {
        name: "Edit",
      });

    await testUser.click(editButtons[0]);

    expect(
      screen.getByText("Full Name"),
    ).toBeInTheDocument();

    const nameInput =
      screen.getByPlaceholderText(
        "Enter full name",
      );

    await testUser.clear(nameInput);

    await testUser.type(
      nameInput,
      "Aye Aye Updated",
    );

    await testUser.click(
      screen.getByRole("button", {
        name: "Save User",
      }),
    );

    await waitFor(() => {
      expect(mockUpdateAdminUser).toHaveBeenCalledWith(
        1,
        {
          name: "Aye Aye Updated",
          email: "ayeaye@example.com",
          role: "REQUESTER",
        },
      );
    });
  });

 it("deactivates and activates a user", async () => {
  const testUser = userEvent.setup();

  const { unmount } = render(
    <AdminUserManagement
      user={user as any}
      onBack={mockOnBack}
    />,
  );

  await screen.findByText("Aye Aye");

  const deactivateButtons =
    screen.getAllByRole("button", {
      name: "Deactivate",
    });

  expect(deactivateButtons).toHaveLength(2);

  await testUser.click(deactivateButtons[1]);

  await waitFor(() => {
    expect(
      mockUpdateAdminUserStatus,
    ).toHaveBeenCalledWith(2, false);
  });

  unmount();

  vi.clearAllMocks();

  mockGetAdminUsers.mockResolvedValue([
    users[0],
    {
      ...users[1],
      isActive: false,
    },
    users[2],
  ]);

  render(
    <AdminUserManagement
      user={user as any}
      onBack={mockOnBack}
    />,
  );

  const activateButtons =
    await screen.findAllByRole("button", {
      name: "Activate",
    });

  expect(activateButtons).toHaveLength(2);
});

  it("has a Back button", async () => {
    const testUser = userEvent.setup();

    render(
      <AdminUserManagement
        user={user as any}
        onBack={mockOnBack}
      />,
    );

    await screen.findByText("Aye Aye");

    await testUser.click(
      screen.getByRole("button", {
        name: /Back/i,
      }),
    );

    expect(mockOnBack).toHaveBeenCalled();
  });
});