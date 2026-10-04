import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../src/App.js";

const mockGetCurrentUser = vi.fn();
const mockChangePassword = vi.fn();
const mockLogout = vi.fn();

vi.mock("../../src/authApi.js", () => ({
  login: vi.fn(),
  getCurrentUser: (...args: unknown[]) =>
    mockGetCurrentUser(...args),
  logout: (...args: unknown[]) => mockLogout(...args),
  changePassword: (...args: unknown[]) =>
    mockChangePassword(...args),
}));

vi.mock("../../src/api.js", () => ({
  getCategories: vi.fn().mockResolvedValue([]),
  getRelatedSystems: vi.fn().mockResolvedValue([]),
}));

function getInputFromLabel(labelText: string): HTMLInputElement {
  const label = screen.getByText(labelText, {
    selector: "label",
  });

  return label.querySelector("input") as HTMLInputElement;
}

describe("Lab 3 Change Password UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetCurrentUser.mockResolvedValue({
      id: "1",
      name: "Admin User",
      email: "admin@example.com",
      role: "ADMINISTRATOR",
      mustChangePassword: true,
    });

    mockChangePassword.mockResolvedValue({
      id: "1",
      name: "Admin User",
      email: "admin@example.com",
      role: "ADMINISTRATOR",
      mustChangePassword: false,
    });
  });

  it("shows the mandatory password change screen", async () => {
    render(<App />);

    expect(
      await screen.findByRole("heading", {
        name: /change your password/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /requires an initial password change/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/signed in as/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /change password/i,
      }),
    ).toBeInTheDocument();
  });

  it("allows all password fields to be shown and hidden", async () => {
    const user = userEvent.setup();

    render(<App />);

    const currentPassword =
      await screen.findByLabelText("Current password");

    const newPassword =
      screen.getByLabelText("New password");

    const confirmPassword =
      screen.getByLabelText("Confirm new password");

    expect(currentPassword).toHaveAttribute(
      "type",
      "password",
    );

    expect(newPassword).toHaveAttribute(
      "type",
      "password",
    );

    expect(confirmPassword).toHaveAttribute(
      "type",
      "password",
    );

    const showButtons = screen.getAllByRole(
      "button",
      {
        name: /show password/i,
      },
    );

    expect(showButtons).toHaveLength(3);

    for (const button of showButtons) {
      await user.click(button);
    }

    expect(currentPassword).toHaveAttribute(
      "type",
      "text",
    );

    expect(newPassword).toHaveAttribute(
      "type",
      "text",
    );

    expect(confirmPassword).toHaveAttribute(
      "type",
      "text",
    );
  });

  it("submits the new password", async () => {
    const user = userEvent.setup();

    render(<App />);

    const currentPassword =
      await screen.findByLabelText("Current password");

    const newPassword =
      screen.getByLabelText("New password");

    const confirmPassword =
      screen.getByLabelText("Confirm new password");

    await user.type(
      currentPassword,
      "OldPassword123!",
    );

    await user.type(
      newPassword,
      "NewPassword123!",
    );

    await user.type(
      confirmPassword,
      "NewPassword123!",
    );

    await user.click(
      screen.getByRole("button", {
        name: /change password/i,
      }),
    );

    await waitFor(() => {
  expect(mockChangePassword).toHaveBeenCalledWith(
    "OldPassword123!",
    "NewPassword123!",
    "NewPassword123!",
  );
});
  });
});