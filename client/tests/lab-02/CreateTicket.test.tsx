import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../src/App";

const mockGetDevelopmentRequesters = vi.fn();
const mockGetCategories = vi.fn();
const mockGetRelatedSystems = vi.fn();
const mockCreateTicket = vi.fn();

vi.mock("../../src/api", () => ({
  getDevelopmentRequesters: (...args: unknown[]) =>
    mockGetDevelopmentRequesters(...args),
  getCategories: (...args: unknown[]) => mockGetCategories(...args),
  getRelatedSystems: (...args: unknown[]) =>
    mockGetRelatedSystems(...args),
  createTicket: (...args: unknown[]) => mockCreateTicket(...args),
  checkSystem: vi.fn(),
}));

const requester = {
  id: 1,
  name: "Aung Aung",
  email: "aung.aung@example.com",
  isActive: true,
};

const categories = [
  { id: 1, name: "Account and Access" },
  { id: 2, name: "Hardware" },
];

const relatedSystems = [
  { id: 1, name: "Email" },
  { id: 2, name: "Campus Wi-Fi" },
];

const createdTicket = {
  id: 100,
  ticketNumber: "TCK-20260905-0001",
  ticketDate: "2026-09-05T10:00:00.000Z",
  requester,
  category: categories[0],
  relatedSystem: relatedSystems[0],
  summary: "Cannot access email",
  description: "I cannot access my university email account.",
  requestedPriority: "HIGH" as const,
  currentStatus: "NEW" as const,
  createdAt: "2026-09-05T10:00:00.000Z",
  updatedAt: "2026-09-05T10:00:00.000Z",
  attachments: [],
};

beforeEach(() => {
  vi.clearAllMocks();

  mockGetDevelopmentRequesters.mockResolvedValue([requester]);
  mockGetCategories.mockResolvedValue(categories);
  mockGetRelatedSystems.mockResolvedValue(relatedSystems);
  mockCreateTicket.mockResolvedValue(createdTicket);
});

async function openCreateTicket() {
  const user = userEvent.setup();

  render(<App />);

  const requesterSelect = await screen.findByLabelText(/requester/i);

  await waitFor(() => {
    expect(
      screen.getByRole("option", { name: /Aung Aung/i })
    ).toBeInTheDocument();
  });

  await user.selectOptions(requesterSelect, "1");

  await waitFor(() => {
    expect(
      screen.getByRole("heading", { name: /welcome, aung aung/i })
    ).toBeInTheDocument();
  });

  await user.click(
    screen.getByRole("button", { name: /^Create Ticket$/i })
  );

  await waitFor(() => {
    expect(
      screen.getByRole("heading", { name: /create ticket/i })
    ).toBeInTheDocument();
  });
}

describe("Create Ticket", () => {
  it("opens the Create Ticket screen and loads reference data", async () => {
    await openCreateTicket();

    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/related system/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/requested priority/i)).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Account and Access" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Email" })
    ).toBeInTheDocument();
  });

  it("shows validation errors and does not submit an invalid form", async () => {
    await openCreateTicket();

    await userEvent.click(
      screen.getByRole("button", { name: /create ticket/i })
    );

    expect(
  	await screen.findByText(/summary is required/i)
    ).toBeInTheDocument();

    expect(
  	await screen.findByText(/description is required/i)
    ).toBeInTheDocument();
    expect(mockCreateTicket).not.toHaveBeenCalled();
  });

  it("creates a ticket and shows the generated ticket number", async () => {
    await openCreateTicket();

    await userEvent.selectOptions(
      screen.getByLabelText(/category/i),
      "1"
    );

    await userEvent.selectOptions(
      screen.getByLabelText(/related system/i),
      "1"
    );

    await userEvent.selectOptions(
      screen.getByLabelText(/requested priority/i),
      "HIGH"
    );

    await userEvent.type(
      screen.getByLabelText(/summary/i),
      "Cannot access email"
    );

    await userEvent.type(
      screen.getByLabelText(/description/i),
      "I cannot access my university email account."
    );

    await userEvent.click(
      screen.getByRole("button", { name: /create ticket/i })
    );

    await waitFor(() => {
      expect(mockCreateTicket).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByText("Ticket created successfully.")
    ).toBeInTheDocument();

    expect(
      screen.getByText("TCK-20260905-0001")
    ).toBeInTheDocument();

    expect(mockCreateTicket).toHaveBeenCalledWith({
      requesterId: 1,
      categoryId: 1,
      relatedSystemId: 1,
      summary: "Cannot access email",
      description: "I cannot access my university email account.",
      requestedPriority: "HIGH",
    });
  });

  it("shows an API error and preserves entered values", async () => {
    mockCreateTicket.mockRejectedValueOnce(
      new Error("Unable to create ticket")
    );

    await openCreateTicket();

    await userEvent.selectOptions(
      screen.getByLabelText(/category/i),
      "1"
    );

    await userEvent.selectOptions(
      screen.getByLabelText(/related system/i),
      "1"
    );

    await userEvent.type(
      screen.getByLabelText(/summary/i),
      "Email problem"
    );

    await userEvent.type(
      screen.getByLabelText(/description/i),
      "My email is not working correctly."
    );

    await userEvent.click(
      screen.getByRole("button", { name: /create ticket/i })
    );

    expect(
      await screen.findByText("Unable to create ticket")
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/summary/i)).toHaveValue(
      "Email problem"
    );

    expect(screen.getByLabelText(/description/i)).toHaveValue(
      "My email is not working correctly."
    );
  });
});