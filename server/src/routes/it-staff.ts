import { Router, type Request, type Response } from "express";
import { UserRole, CurrentStatus } from "@prisma/client";
import { getPrisma } from "../prisma.js";
import {
  requireAuthentication,
  requirePasswordChangeCompleted,
  requireRoles,
  requireTrustedOrigin,
} from "../auth/middleware.js";

export const itStaffRouter = Router();

function error(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}
itStaffRouter.get(
  "/staff",
  requireAuthentication,
  requirePasswordChangeCompleted,
  requireRoles(UserRole.IT_STAFF),
  async (_req: Request, res: Response) => {
    try {
      const staff = await getPrisma().user.findMany({
        where: {
          role: UserRole.IT_STAFF,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      return res.status(200).json(staff);
    } catch (cause) {
      console.error("IT Staff list failed:", cause);

      return error(
        res,
        500,
        "IT_STAFF_LIST_UNAVAILABLE",
        "Unable to load IT Staff members.",
      );
    }
  },
);

itStaffRouter.get(
  "/staff",
  requireAuthentication,
  requirePasswordChangeCompleted,
  requireRoles(UserRole.IT_STAFF),
  async (_req: Request, res: Response) => {
    try {
      const staff = await getPrisma().user.findMany({
        where: {
          role: UserRole.IT_STAFF,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      return res.status(200).json(staff);
    } catch (cause) {
      console.error("IT Staff users failed:", cause);

      return error(
        res,
        500,
        "IT_STAFF_USERS_UNAVAILABLE",
        "Unable to load IT Staff users."
      );
    }
  }
);

itStaffRouter.get(
  "/users",
  requireAuthentication,
  requirePasswordChangeCompleted,
  requireRoles(UserRole.IT_STAFF),
  async (_req: Request, res: Response) => {
    try {
      const users = await getPrisma().user.findMany({
        where: {
          role: UserRole.IT_STAFF,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      return res.status(200).json({
        items: users,
      });
    } catch (cause) {
      console.error("IT Staff users failed:", cause);

      return error(
        res,
        500,
        "IT_STAFF_USERS_UNAVAILABLE",
        "Unable to load IT Staff users.",
      );
    }
  },
);

itStaffRouter.get(
  "/tickets",
  requireAuthentication,
  requirePasswordChangeCompleted,
  requireRoles(UserRole.IT_STAFF),
  async (req: Request, res: Response) => {
    try {
      const search =
        typeof req.query.search === "string"
          ? req.query.search.trim()
          : "";

      const status =
        typeof req.query.status === "string"
          ? req.query.status
          : undefined;

      const assignedTo =
        typeof req.query.assignedTo === "string"
          ? req.query.assignedTo
          : undefined;
      
      const sort =
        typeof req.query.sort === "string"
          ? req.query.sort
          : undefined;

      const requestedPage = Number(req.query.page);
      const requestedPageSize = Number(req.query.pageSize);

      const page =
        Number.isInteger(requestedPage) && requestedPage > 0
          ? requestedPage
          : 1;

      const pageSize =
        Number.isInteger(requestedPageSize) &&
        requestedPageSize > 0 &&
        requestedPageSize <= 50
          ? requestedPageSize
          : 10;

      const where = {
        ...(search
          ? {
              OR: [
                {
                  ticketNumber: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  summary: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              ],
            }
          : {}),
        ...(status &&
        Object.values(CurrentStatus).includes(
          status as CurrentStatus,
        )
          ? {
              currentStatus: status as CurrentStatus,
            }
          : {}),
        ...(assignedTo === "unassigned"
          ? { assignedStaffId: null }
          : assignedTo === "me"
            ? { assignedStaffId: req.auth!.user.id }
            : {}),
      };

      const prisma = getPrisma();

let orderBy: any = {
  updatedAt: "desc",
};

switch (sort) {
  case "ticketNumber":
    orderBy = {
      ticketNumber: "asc",
    };
    break;

  case "createdAsc":
    orderBy = {
      createdAt: "asc",
    };
    break;

  case "createdDesc":
    orderBy = {
      createdAt: "desc",
    };
    break;

  case "updatedAsc":
    orderBy = {
      updatedAt: "asc",
    };
    break;

  case "updatedDesc":
  default:
    orderBy = {
      updatedAt: "desc",
    };
    break;
}

const [total, tickets] = await Promise.all([
  prisma.ticket.count({
    where,
  }),

  prisma.ticket.findMany({
    where,
    orderBy,
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      category: true,

      relatedSystem: true,

      assignedStaff: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
      },

      attachments: {
        where: {
          removedAt: null,
        },
      },
    },
  }),
]);

return res.status(200).json({
  tickets,
  total,
  page,
  pageSize,
  totalPages: Math.ceil(total / pageSize),
});
    } catch (cause) {
      console.error(
        "IT Staff ticket queue failed:",
        cause,
      );

      return error(
        res,
        500,
        "IT_STAFF_QUEUE_UNAVAILABLE",
        "Unable to load the IT Staff ticket queue.",
      );
    }
  },
);

itStaffRouter.patch(
  "/tickets/:ticketId/resolution-summary",
  requireAuthentication,
  requirePasswordChangeCompleted,
  requireRoles(UserRole.IT_STAFF),
  requireTrustedOrigin,
  async (req: Request, res: Response) => {
    const ticketId = Number(req.params.ticketId);

    const resolutionSummary =
      typeof req.body.resolutionSummary === "string"
        ? req.body.resolutionSummary.trim()
        : "";

    if (
      !Number.isInteger(ticketId) ||
      ticketId <= 0
    ) {
      return error(
        res,
        400,
        "INVALID_TICKET_ID",
        "Ticket ID is invalid.",
      );
    }

    if (resolutionSummary.length > 5000) {
      return error(
        res,
        400,
        "INVALID_RESOLUTION_SUMMARY",
        "Resolution Summary is too long.",
      );
    }

    try {
      const ticket =
        await getPrisma().ticket.findUnique({
          where: {
            id: ticketId,
          },
          select: {
            id: true,
          },
        });

      if (!ticket) {
        return error(
          res,
          404,
          "TICKET_NOT_FOUND",
          "Ticket was not found.",
        );
      }

      const updatedTicket =
        await getPrisma().ticket.update({
          where: {
            id: ticketId,
          },
          data: {
            resolutionSummary:
              resolutionSummary || null,
          },
        });

      return res.status(200).json(updatedTicket);
    } catch (cause) {
      console.error(
        "IT Staff resolution summary update failed:",
        cause,
      );

      return error(
        res,
        500,
        "IT_STAFF_RESOLUTION_UNAVAILABLE",
        "Unable to update the resolution summary.",
      );
    }
  },
);

itStaffRouter.get(
  "/staff",
  requireAuthentication,
  requirePasswordChangeCompleted,
  requireRoles(UserRole.IT_STAFF),
  async (_req: Request, res: Response) => {
    try {
      const staff = await getPrisma().user.findMany({
        where: {
          role: UserRole.IT_STAFF,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      return res.status(200).json(staff);
    } catch (cause) {
      console.error(
        "IT Staff list failed:",
        cause,
      );

      return error(
        res,
        500,
        "IT_STAFF_LIST_UNAVAILABLE",
        "Unable to load IT Staff members.",
      );
    }
  },
);

itStaffRouter.get(
  "/tickets/:ticketId",
  requireAuthentication,
  requirePasswordChangeCompleted,
  requireRoles(UserRole.IT_STAFF),
  async (req: Request, res: Response) => {
    const ticketId = Number(req.params.ticketId);

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return error(res, 400, "INVALID_TICKET_ID", "Ticket ID is invalid.");
    }

    try {
      const ticket = await getPrisma().ticket.findUnique({
        where: { id: ticketId },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          category: true,
          relatedSystem: true,
          assignedStaff: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
            },
          },
          attachments: {
            where: { removedAt: null },
          },
          publicComments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
          internalNotes: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      if (!ticket) {
        return error(res, 404, "TICKET_NOT_FOUND", "Ticket was not found.");
      }

      return res.status(200).json(ticket);
    } catch (cause) {
      console.error("IT Staff ticket details failed:", cause);
      return error(
        res,
        500,
        "IT_STAFF_TICKET_UNAVAILABLE",
        "Unable to load the IT Staff ticket."
      );
    }
  }
);

itStaffRouter.get(
  "/tickets/:ticketId/attachments/:attachmentId",
  async (req, res) => {
    const ticketId = Number(req.params.ticketId);
    const attachmentId = Number(req.params.attachmentId);

    if (
      !Number.isInteger(ticketId) ||
      ticketId <= 0 ||
      !Number.isInteger(attachmentId) ||
      attachmentId <= 0
    ) {
      return res.status(400).json({
        error: "Invalid ticket or attachment ID",
      });
    }

    try {
      const prisma = getPrisma();

      const attachment = await prisma.attachment.findFirst({
        where: {
          id: attachmentId,
          ticketId,
          removedAt: null,
        },
      });

      if (!attachment) {
        return res.status(404).json({
          error: "Attachment not found",
        });
      }

      return res.download(
        attachment.storagePath,
        attachment.originalFileName,
      );
    } catch (error) {
      console.error("Failed to download IT Staff attachment:", error);

      return res.status(500).json({
        error: "Failed to download attachment",
      });
    }
  },
);

itStaffRouter.post(
  "/tickets/:ticketId/claim",
  requireAuthentication,
  requirePasswordChangeCompleted,
  requireRoles(UserRole.IT_STAFF),
  requireTrustedOrigin,
  async (req: Request, res: Response) => {
    const ticketId = Number(req.params.ticketId);

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return error(res, 400, "INVALID_TICKET_ID", "Ticket ID is invalid.");
    }

    try {
      const ticket = await getPrisma().ticket.findUnique({
        where: { id: ticketId },
        select: {
          id: true,
          assignedStaffId: true,
        },
      });

      if (!ticket) {
        return error(res, 404, "TICKET_NOT_FOUND", "Ticket was not found.");
      }

      if (ticket.assignedStaffId !== null) {
        return error(
          res,
          409,
          "TICKET_ALREADY_ASSIGNED",
          "This ticket is already assigned to an IT Staff member."
        );
      }

      const updatedTicket = await getPrisma().ticket.update({
        where: { id: ticketId },
        data: {
          assignedStaffId: req.auth!.user.id,
        },
        include: {
          assignedStaff: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
            },
          },
        },
      });

      return res.status(200).json(updatedTicket);
    } catch (cause) {
      console.error("IT Staff ticket claim failed:", cause);
      return error(
        res,
        500,
        "IT_STAFF_CLAIM_UNAVAILABLE",
        "Unable to claim the ticket."
      );
    }
  }
);


itStaffRouter.patch(
  "/tickets/:ticketId/assignment",
  requireAuthentication,
  requirePasswordChangeCompleted,
  requireRoles(UserRole.IT_STAFF),
  requireTrustedOrigin,
  async (req: Request, res: Response) => {
    const ticketId = Number(req.params.ticketId);
    const assignedStaffId = Number(req.body.assignedStaffId);

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return error(res, 400, "INVALID_TICKET_ID", "Ticket ID is invalid.");
    }

    if (!Number.isInteger(assignedStaffId) || assignedStaffId <= 0) {
      return error(
        res,
        400,
        "INVALID_ASSIGNED_STAFF",
        "Assigned IT Staff ID is invalid."
      );
    }

    try {
      const ticket = await getPrisma().ticket.findUnique({
        where: { id: ticketId },
        select: {
          id: true,
        },
      });

      if (!ticket) {
        return error(res, 404, "TICKET_NOT_FOUND", "Ticket was not found.");
      }

      const staff = await getPrisma().user.findFirst({
        where: {
          id: assignedStaffId,
          role: UserRole.IT_STAFF,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

      if (!staff) {
        return error(
          res,
          400,
          "INVALID_ASSIGNED_STAFF",
          "The selected IT Staff member is not active."
        );
      }

      const updatedTicket = await getPrisma().ticket.update({
        where: { id: ticketId },
        data: {
          assignedStaffId: staff.id,
        },
        include: {
          assignedStaff: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
            },
          },
        },
      });

      return res.status(200).json(updatedTicket);
    } catch (cause) {
      console.error("IT Staff ticket reassignment failed:", cause);
      return error(
        res,
        500,
        "IT_STAFF_REASSIGN_UNAVAILABLE",
        "Unable to reassign the ticket."
      );
    }
  }
);

itStaffRouter.patch(
  "/tickets/:ticketId/priority",
  requireAuthentication,
  requirePasswordChangeCompleted,
  requireRoles(
  UserRole.IT_STAFF,
  UserRole.ADMINISTRATOR,
),
  requireTrustedOrigin,
  async (req: Request, res: Response) => {
    const ticketId = Number(req.params.ticketId);
    const itPriority = req.body.itPriority;

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return error(res, 400, "INVALID_TICKET_ID", "Ticket ID is invalid.");
    }

    if (!Object.values(["LOW", "MEDIUM", "HIGH"]).includes(itPriority)) {
      return error(
        res,
        400,
        "INVALID_IT_PRIORITY",
        "IT Priority must be LOW, MEDIUM, or HIGH."
      );
    }

    try {
      const ticket = await getPrisma().ticket.findUnique({
        where: { id: ticketId },
        select: {
          id: true,
        },
      });

      if (!ticket) {
        return error(res, 404, "TICKET_NOT_FOUND", "Ticket was not found.");
      }

      const updatedTicket = await getPrisma().ticket.update({
        where: { id: ticketId },
        data: {
          itPriority,
        },
        select: {
          id: true,
          itPriority: true,
        },
      });

      return res.status(200).json(updatedTicket);
    } catch (cause) {
      console.error("IT Staff priority update failed:", cause);
      return error(
        res,
        500,
        "IT_STAFF_PRIORITY_UNAVAILABLE",
        "Unable to update IT Priority."
      );
    }
  }
);

itStaffRouter.post(
  "/tickets/:ticketId/comments",
  requireAuthentication,
  requirePasswordChangeCompleted,
  requireRoles(UserRole.IT_STAFF),
  requireTrustedOrigin,
  async (req: Request, res: Response) => {
    const ticketId = Number(req.params.ticketId);
    const body = typeof req.body.body === "string" ? req.body.body.trim() : "";

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return error(res, 400, "INVALID_TICKET_ID", "Ticket ID is invalid.");
    }

    if (!body) {
      return error(
        res,
        400,
        "INVALID_COMMENT",
        "Comment body is required."
      );
    }

    try {
      const ticket = await getPrisma().ticket.findUnique({
        where: { id: ticketId },
        select: {
          id: true,
        },
      });

      if (!ticket) {
        return error(res, 404, "TICKET_NOT_FOUND", "Ticket was not found.");
      }

      const comment = await getPrisma().publicComment.create({
        data: {
          ticketId,
          authorId: req.auth!.user.id,
          body,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return res.status(201).json(comment);
    } catch (cause) {
      console.error("IT Staff public comment failed:", cause);
      return error(
        res,
        500,
        "IT_STAFF_COMMENT_UNAVAILABLE",
        "Unable to add the public comment."
      );
    }
  }
);

itStaffRouter.post(
  "/tickets/:ticketId/notes",
  requireAuthentication,
  requirePasswordChangeCompleted,
  requireRoles(UserRole.IT_STAFF),
  requireTrustedOrigin,
  async (req: Request, res: Response) => {
    const ticketId = Number(req.params.ticketId);
    const body = typeof req.body.body === "string" ? req.body.body.trim() : "";

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return error(res, 400, "INVALID_TICKET_ID", "Ticket ID is invalid.");
    }

    if (!body) {
      return error(
        res,
        400,
        "INVALID_INTERNAL_NOTE",
        "Internal note body is required."
      );
    }

    try {
      const ticket = await getPrisma().ticket.findUnique({
        where: { id: ticketId },
        select: {
          id: true,
        },
      });

      if (!ticket) {
        return error(res, 404, "TICKET_NOT_FOUND", "Ticket was not found.");
      }

      const note = await getPrisma().internalNote.create({
        data: {
          ticketId,
          authorId: req.auth!.user.id,
          body,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return res.status(201).json(note);
    } catch (cause) {
      console.error("IT Staff internal note failed:", cause);
      return error(
        res,
        500,
        "IT_STAFF_NOTE_UNAVAILABLE",
        "Unable to add the internal note."
      );
    }
  }
);

itStaffRouter.patch(
  "/tickets/:ticketId/status",
  requireAuthentication,
  requirePasswordChangeCompleted,
  requireRoles(UserRole.IT_STAFF),
  requireTrustedOrigin,
  async (req: Request, res: Response) => {
    const ticketId = Number(req.params.ticketId);
    const currentStatus = req.body.currentStatus;

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return error(res, 400, "INVALID_TICKET_ID", "Ticket ID is invalid.");
    }

    if (!Object.values(CurrentStatus).includes(currentStatus)) {
      return error(
        res,
        400,
        "INVALID_STATUS",
        "The selected ticket status is invalid."
      );
    }

    try {
      const ticket = await getPrisma().ticket.findUnique({
        where: { id: ticketId },
        select: {
          id: true,
        },
      });

      if (!ticket) {
        return error(res, 404, "TICKET_NOT_FOUND", "Ticket was not found.");
      }

      const updatedTicket = await getPrisma().ticket.update({
        where: { id: ticketId },
        data: {
          currentStatus,
        },
        select: {
          id: true,
          currentStatus: true,
        },
      });

      return res.status(200).json(updatedTicket);
    } catch (cause) {
      console.error("IT Staff status update failed:", cause);
      return error(
        res,
        500,
        "IT_STAFF_STATUS_UNAVAILABLE",
        "Unable to update ticket status."
      );
    }
  }
);