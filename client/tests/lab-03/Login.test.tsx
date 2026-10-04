import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../src/App.js";

const mockLogin = vi.fn();
const mockGetCurrentUser = vi.fn();
const mockLogout = vi.fn();

vi.mock("../../src/authApi.js", () => ({
  login: (...args: unknown[]) => mockLogin(...args),
  getCurrentUser: (...args: unknown[]) =>
    mockGetCurrentUser(...args),
  logout: (...args: unknown[]) => mockLogout(...args),
  changePassword: vi.fn(),
}));

vi.mock("../../src/api.js", () => ({
  getCategories: vi.fn().mockResolvedValue([]),
  getRelatedSystems: vi.fn().mockResolvedValue([]),
}));

describe("Lab 3 Login UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetCurrentUser.mockRejectedValue(
      new Error("Not authenticated"),
    );
  });

  it("shows the login form", async () => {
    render(<App />);

    expect(
      await screen.findByRole("heading", {
        name: /sign in/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Email"),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter your password"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /sign in/i,
      }),
    ).toBeInTheDocument();
  });

  it("allows the password to be shown and hidden", async () => {
    const user = userEvent.setup();

    render(<App />);

    const passwordInput =
      await screen.findByPlaceholderText(
        "Enter your password",
      );

    expect(passwordInput).toHaveAttribute(
      "type",
      "password",
    );

    await user.click(
      screen.getByRole("button", {
        name: /show password/i,
      }),
    );

    expect(passwordInput).toHaveAttribute(
      "type",
      "text",
    );

    expect(
      screen.getByRole("button", {
        name: /hide password/i,
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /hide password/i,
      }),
    );

    expect(passwordInput).toHaveAttribute(
      "type",
      "password",
    );
  });

  it("logs in with the entered email and password", async () => {
    const user = userEvent.setup();

    mockLogin.mockResolvedValue({
      id: "1",
      name: "Admin User",
      email: "admin@example.com",
      role: "ADMINISTRATOR",
      mustChangePassword: false,
    });

    render(<App />);

    const emailInput =
      await screen.findByLabelText("Email");

    const passwordInput =
      screen.getByPlaceholderText(
        "Enter your password",
      );

    await user.type(
      emailInput,
      "admin@example.com",
    );

    await user.type(
      passwordInput,
      "AdminPassword123!",
    );

    await user.click(
      screen.getByRole("button", {
        name: /sign in/i,
      }),
    );

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        "admin@example.com",
        "AdminPassword123!",
      );
    });

    expect(
      await screen.findByText(/user management/i),
    ).toBeInTheDocument();
  });
});