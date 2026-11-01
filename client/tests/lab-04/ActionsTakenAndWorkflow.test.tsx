
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ITStaffTicketDetail from "../../src/ITStaffTicketDetail.js";

const mockGetITStaffTicket = vi.fn();
const mockGetITStaffUsers = vi.fn();
const mockGetActionsTaken = vi.fn();
const mockCreateActionTaken = vi.fn();
const mockUpdateActionTaken = vi.fn();
const mockUpdateITStaffPriority = vi.fn();
const mockUpdateITStaffTicketStatus = vi.fn();
const mockUpdateITStaffResolutionSummary = vi.fn();
const mockAddITStaffPublicComment = vi.fn();
const mockAddITStaffInternalNote = vi.fn();
const mockClaimITStaffTicket = vi.fn();
const mockReassignITStaffTicket = vi.fn();
const mockDownloadITStaffAttachment = vi.fn();

vi.mock("../../src/api.js", () => ({
  getITStaffTicket: (...args: unknown[]) =>
    mockGetITStaffTicket(...args),
  getITStaffUsers: (...args: unknown[]) =>
    mockGetITStaffUsers(...args),
  getActionsTaken: (...args: unknown[]) =>
    mockGetActionsTaken(...args),
  createActionTaken: (...args: unknown[]) =>
    mockCreateActionTaken(...args),
  updateActionTaken: (...args: unknown[]) =>
    mockUpdateActionTaken(...args),
  updateITStaffPriority: (...args: unknown[]) =>
    mockUpdateITStaffPriority(...args),
  updateITStaffTicketStatus: (...args: unknown[]) =>
    mockUpdateITStaffTicketStatus(...args),
  updateITStaffResolutionSummary: (...args: unknown[]) =>
    mockUpdateITStaffResolutionSummary(...args),
  addITStaffPublicComment: (...args: unknown[]) =>
    mockAddITStaffPublicComment(...args),
  addITStaffInternalNote: (...args: unknown[]) =>
    mockAddITStaffInternalNote(...args),
  claimITStaffTicket: (...args: unknown[]) =>
    mockClaimITStaffTicket(...args),
  reassignITStaffTicket: (...args: unknown[]) =>
    mockReassignITStaffTicket(...args),
  downloadITStaffAttachment: (...args: unknown[]) =>
    mockDownloadITStaffAttachment(...args),
}));

describe("Lab 4 Actions Taken and Ticket Workflow UI", () => {
  const user = {
  id: "2",
  name: "Nandar IT",
  email: "nandar.it@example.com",
  role: "IT_STAFF" as const,
  mustChangePassword: false,
  isActive: true,
};
  const ticket = {
    id: 1,
    ticketNumber: "TCK-20260921-0002",
    ticketDate: "2026-09-21T08:30:00.000Z",
    createdAt: "2026-09-21T08:30:00.000Z",
    updatedAt: "2026-09-21T10:30:00.000Z",
    summary: "Cannot connect to campus Wi-Fi",
    description:
      "The requester cannot connect to the campus Wi-Fi network.",
    requestedPriority: "HIGH",
    itPriority: "MEDIUM",
    currentStatus: "OPEN",
    resolutionSummary: "",
    requester: {
      id: 10,
      name: "Aye Aye",
      email: "ayeaye@example.com",
    },
    category: {
      id: 1,
      name: "Network",
    },
    relatedSystem: {
      id: 1,
      name: "Campus Wi-Fi",
    },
    assignedStaff: {
      id: 2,
      name: "Nandar IT",
      email: "nandar.it@example.com",
    },
    publicComments: [
      {
        id: 1,
        body: "I still cannot connect to Wi-Fi.",
        createdAt: "2026-09-21T09:00:00.000Z",
        author: {
          id: 10,
          name: "Aye Aye",
          role: "REQUESTER",
        },
      },
    ],
    internalNotes: [
      {
        id: 2,
        body: "Checked the campus Wi-Fi service.",
        createdAt: "2026-09-21T09:30:00.000Z",
        author: {
          id: 2,
          name: "Nandar IT",
          role: "IT_STAFF",
        },
      },
    ],
    attachments: [
      {
        id: 5,
        originalFileName: "wifi-error.png",
        sizeBytes: 2048,
        mimeType: "image/png",
      },
    ],
  };

  const action = {
    id: 301,
    ticketId: 1,
    actionDateTime: "2026-09-21T10:00:00.000Z",
    actionDescription: "Restarted the Wi-Fi access point",
    result: "Wi-Fi connection restored",
    performedBy: {
      id: 2,
      name: "Nandar IT",
    },
    followUpRequired: true,
    followUpNote: "Check connection tomorrow",
    attachmentNotes: "Router log reviewed",
  };

  const renderTicketDetail = () =>
    render(
      <ITStaffTicketDetail
        user={user}
        ticketId={1}
        onBack={vi.fn()}
      />,
    );

  const openActionsTakenTab = async (
    userEventInstance: ReturnType<typeof userEvent.setup>,
  ) => {
    await userEventInstance.click(
      await screen.findByRole("button", {
        name: /Actions Taken/,
      }),
    );

    await screen.findByText("Actions Taken History");
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(window, "alert").mockImplementation(() => {});

    mockGetITStaffTicket.mockResolvedValue(ticket);

    mockGetITStaffUsers.mockResolvedValue([
      {
        id: 2,
        name: "Nandar IT",
        email: "nandar.it@example.com",
      },
      {
        id: 3,
        name: "Kyaw IT",
        email: "kyaw.it@example.com",
      },
    ]);

    mockGetActionsTaken.mockResolvedValue([action]);

    mockCreateActionTaken.mockResolvedValue(action);
    mockUpdateActionTaken.mockResolvedValue(action);

    mockUpdateITStaffPriority.mockResolvedValue(ticket);
    mockUpdateITStaffTicketStatus.mockResolvedValue(ticket);
    mockUpdateITStaffResolutionSummary.mockResolvedValue(ticket);

    mockAddITStaffPublicComment.mockResolvedValue({});
    mockAddITStaffInternalNote.mockResolvedValue({});
    mockClaimITStaffTicket.mockResolvedValue(ticket);
    mockReassignITStaffTicket.mockResolvedValue(ticket);
    mockDownloadITStaffAttachment.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads and displays Actions Taken history", async () => {
    const userEventInstance = userEvent.setup();

    renderTicketDetail();

    await openActionsTakenTab(userEventInstance);

    expect(
      screen.getByText("Restarted the Wi-Fi access point"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Wi-Fi connection restored"),
    ).toBeInTheDocument();

    expect(screen.getByText("Nandar IT")).toBeInTheDocument();

    expect(mockGetActionsTaken).toHaveBeenCalledWith(1);
  });

  it("records a new Action Taken successfully", async () => {
    const userEventInstance = userEvent.setup();

    renderTicketDetail();

    await openActionsTakenTab(userEventInstance);

    const dateField = screen.getByLabelText(
      "Action Date and Time",
    );

    await userEventInstance.clear(dateField);

    await userEventInstance.type(
      dateField,
      "2026-09-21T10:00",
    );

    await userEventInstance.type(
      screen.getByPlaceholderText(
        "Describe the work performed...",
      ),
      "Restarted the Wi-Fi access point",
    );

    await userEventInstance.type(
      screen.getByPlaceholderText(
        "Describe the outcome...",
      ),
      "Wi-Fi connection restored",
    );

    await userEventInstance.click(
      screen.getByRole("button", {
        name: /Record Action/,
      }),
    );

    await waitFor(() => {
      expect(mockCreateActionTaken).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          actionDateTime: new Date(
            "2026-09-21T10:00",
          ).toISOString(),
          actionDescription: "Restarted the Wi-Fi access point",
          result: "Wi-Fi connection restored",
          followUpRequired: false,
          followUpNote: null,
          attachmentNotes: null,
        }),
      );
    });

    expect(
      await screen.findByText(
        "Action Taken recorded successfully.",
      ),
    ).toBeInTheDocument();
  });

  it("requires a follow-up note when follow-up is selected", async () => {
    const userEventInstance = userEvent.setup();

    renderTicketDetail();

    await openActionsTakenTab(userEventInstance);

    const dateField = screen.getByLabelText(
      "Action Date and Time",
    );

    await userEventInstance.clear(dateField);

    await userEventInstance.type(
      dateField,
      "2026-09-21T10:00",
    );

    await userEventInstance.type(
      screen.getByPlaceholderText(
        "Describe the work performed...",
      ),
      "Restarted the Wi-Fi access point",
    );

    await userEventInstance.type(
      screen.getByPlaceholderText(
        "Describe the outcome...",
      ),
      "Wi-Fi connection restored",
    );

    await userEventInstance.click(
      screen.getByRole("checkbox", {
        name: /Follow-up Required/,
      }),
    );

    const followUpField =
      screen.getByPlaceholderText(
        "Explain what follow-up is needed...",
      );

    expect(followUpField).toBeInTheDocument();
    expect(followUpField).toHaveValue("");

    const actionForm = screen
      .getByRole("button", { name: /Record Action/ })
      .closest("form");

    expect(actionForm).not.toBeNull();

    fireEvent.submit(actionForm!);

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Please enter a follow-up note.");

    expect(mockCreateActionTaken).not.toHaveBeenCalled();
  });

  it("allows an existing Action Taken record to be edited", async () => {
    const userEventInstance = userEvent.setup();

    renderTicketDetail();

    await openActionsTakenTab(userEventInstance);

    expect(
      screen.getByText("Restarted the Wi-Fi access point"),
    ).toBeInTheDocument();

    await userEventInstance.click(
      screen.getByRole("button", {
        name: /Edit/,
      }),
    );

    const resultField = screen.getByPlaceholderText(
      "Describe the outcome...",
    );

    await userEventInstance.clear(resultField);

    await userEventInstance.type(
      resultField,
      "Wi-Fi connection restored and tested",
    );

    await userEventInstance.click(
      screen.getByRole("button", {
        name: /Save Action Changes/,
      }),
    );

    await waitFor(() => {
      expect(mockUpdateActionTaken).toHaveBeenCalledWith(
        1,
        301,
        expect.objectContaining({
          result: "Wi-Fi connection restored and tested",
        }),
      );
    });

    expect(
      await screen.findByText(
        "Action Taken updated successfully.",
      ),
    ).toBeInTheDocument();
  });

  it("saves ticket priority, status, and resolution summary", async () => {
    const userEventInstance = userEvent.setup();

    renderTicketDetail();

    const summaryField =
      await screen.findByLabelText("Resolution Summary");

    await userEventInstance.clear(summaryField);

    await userEventInstance.type(
      summaryField,
      "Restarted the access point and restored Wi-Fi.",
    );

    await userEventInstance.click(
      screen.getByRole("button", {
        name: /Service Actions/,
      }),
    );

    const selects = screen.getAllByRole("combobox");

    await userEventInstance.selectOptions(
      selects[0],
      "HIGH",
    );

    await userEventInstance.selectOptions(
      selects[1],
      "IN_PROGRESS",
    );

    await userEventInstance.click(
      screen.getByRole("button", {
        name: /Save Changes/,
      }),
    );

    await waitFor(() => {
      expect(mockUpdateITStaffPriority).toHaveBeenCalledWith(
        1,
        "HIGH",
      );

      expect(mockUpdateITStaffTicketStatus).toHaveBeenCalledWith(
        1,
        "IN_PROGRESS",
      );

      expect(
        mockUpdateITStaffResolutionSummary,
      ).toHaveBeenCalledWith(
        1,
        "Restarted the access point and restored Wi-Fi.",
      );
    });
  });
});
