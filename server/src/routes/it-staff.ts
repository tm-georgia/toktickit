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
        ...(status && Object.values(CurrentStatus).includes(status as CurrentStatus)
          ? { currentStatus: status as CurrentStatus }
          : {}),
        ...(assignedTo === "unassigned"
          ? { assignedStaffId: null }
          : assignedTo === "me"
            ? { assignedStaffId: req.auth!.user.id }
            : {}),
      };

      const tickets = await getPrisma().ticket.findMany({
        where,
        orderBy: { updatedAt: "desc" },
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
        },
      });

      return res.status(200).json({ items: tickets });
    } catch (cause) {
      console.error("IT Staff ticket queue failed:", cause);
      return error(
        res,
        500,
        "IT_STAFF_QUEUE_UNAVAILABLE",
        "Unable to load the IT Staff ticket queue."
      );
    }
  }
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
  requireRoles(UserRole.IT_STAFF),
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