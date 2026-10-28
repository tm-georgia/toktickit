
import { Router, type Request, type Response } from "express";
import { UserRole } from "@prisma/client";
import { getPrisma } from "../prisma.js";
import {
  requireRoles,
  requireTrustedOrigin,
} from "../auth/middleware.js";

export const actionsTakenRouter = Router();

const actionInclude = {
  performedBy: {
    select: {
      id: true,
      name: true,
    },
  },
};

const allowedFields = [
  "actionDateTime",
  "actionDescription",
  "result",
  "followUpRequired",
  "followUpNote",
  "attachmentNotes",
];

function apiError(
  res: Response,
  status: number,
  code: string,
  message: string
) {
  return res.status(status).json({
    error: { code, message },
  });
}

function positiveId(value: string): number | null {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function validText(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= 2000
  );
}

function validOptionalText(
  value: unknown
): value is string | null {
  return (
    value === null ||
    (typeof value === "string" && value.length <= 2000)
  );
}

function validDate(value: unknown): Date | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function hasUnknownFields(body: Record<string, unknown>) {
  return Object.keys(body).some(
    (key) => !allowedFields.includes(key)
  );
}

function publicAction<T extends { performedByUserId: number }>(
  action: T
) {
  const { performedByUserId: _privateId, ...safeAction } = action;
  return safeAction;
}

async function findAccessibleTicket(
  ticketId: number,
  req: Request,
  res: Response
) {
  const ticket = await getPrisma().ticket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      requesterId: true,
    },
  });

  if (!ticket) {
    apiError(res, 404, "TICKET_NOT_FOUND", "Ticket not found.");
    return null;
  }

  const role = req.auth!.user.role;

  if (
    role === UserRole.REQUESTER &&
    ticket.requesterId !== req.auth!.user.id
  ) {
    apiError(res, 404, "TICKET_NOT_FOUND", "Ticket not found.");
    return null;
  }

  if (
    role !== UserRole.REQUESTER &&
    role !== UserRole.IT_STAFF &&
    role !== UserRole.ADMINISTRATOR
  ) {
    apiError(res, 403, "FORBIDDEN", "Access denied.");
    return null;
  }

  return ticket;
}

// GET /api/tickets/:ticketId/actions-taken
actionsTakenRouter.get(
  "/:ticketId/actions-taken",
  async (req: Request, res: Response) => {
    const ticketId = positiveId(req.params.ticketId);

    if (ticketId === null) {
      return apiError(res, 400, "INVALID_TICKET_ID", "Invalid ticket ID.");
    }

    try {
      const ticket = await findAccessibleTicket(ticketId, req, res);
      if (!ticket) return;

      const actions = await getPrisma().actionTaken.findMany({
        where: { ticketId },
        include: actionInclude,
        orderBy: [
          { actionDateTime: "asc" },
          { id: "asc" },
        ],
      });

      return res.json(actions.map(publicAction));
    } catch (error) {
      console.error("Failed to load Actions Taken:", error);
      return apiError(
        res,
        500,
        "INTERNAL_ERROR",
        "Failed to load Actions Taken."
      );
    }
  }
);

// POST /api/tickets/:ticketId/actions-taken
actionsTakenRouter.post(
  "/:ticketId/actions-taken",
  requireRoles(UserRole.IT_STAFF, UserRole.ADMINISTRATOR),
  requireTrustedOrigin,
  async (req: Request, res: Response) => {
    const ticketId = positiveId(req.params.ticketId);

    if (ticketId === null) {
      return apiError(res, 400, "INVALID_TICKET_ID", "Invalid ticket ID.");
    }

    if (!isObject(req.body)) {
      return apiError(res, 400, "INVALID_BODY", "A JSON object is required.");
    }

    if (
      Object.prototype.hasOwnProperty.call(req.body, "performedBy") ||
      Object.prototype.hasOwnProperty.call(req.body, "performedByUserId")
    ) {
      return apiError(
        res,
        400,
        "INVALID_PERFORMER",
        "The performer is determined by the authenticated user."
      );
    }

    if (hasUnknownFields(req.body)) {
      return apiError(
        res,
        400,
        "INVALID_FIELD",
        "The request contains an unsupported field."
      );
    }

    const actionDateTime = validDate(req.body.actionDateTime);
    const actionDescription = req.body.actionDescription;
    const result = req.body.result;
    const followUpRequired = req.body.followUpRequired;
    const followUpNote = req.body.followUpNote;
    const attachmentNotes = req.body.attachmentNotes;

    if (
      !actionDateTime ||
      !validText(actionDescription) ||
      !validText(result) ||
      typeof followUpRequired !== "boolean"
    ) {
      return apiError(
        res,
        400,
        "INVALID_ACTION",
        "A valid date, action description, result, and follow-up flag are required."
      );
    }

    if (
      followUpRequired &&
      !validText(followUpNote)
    ) {
      return apiError(
        res,
        400,
        "FOLLOW_UP_NOTE_REQUIRED",
        "A follow-up note is required when follow-up is needed."
      );
    }

    if (
      followUpNote !== undefined &&
      !validOptionalText(followUpNote)
    ) {
      return apiError(
        res,
        400,
        "INVALID_FOLLOW_UP_NOTE",
        "The follow-up note must be text of at most 2000 characters or null."
      );
    }

    if (
      attachmentNotes !== undefined &&
      !validOptionalText(attachmentNotes)
    ) {
      return apiError(
        res,
        400,
        "INVALID_ATTACHMENT_NOTES",
        "Attachment notes must be text of at most 2000 characters or null."
      );
    }

    try {
      const ticket = await getPrisma().ticket.findUnique({
        where: { id: ticketId },
        select: { id: true },
      });

      if (!ticket) {
        return apiError(res, 404, "TICKET_NOT_FOUND", "Ticket not found.");
      }

      const action = await getPrisma().actionTaken.create({
        data: {
          ticketId,
          actionDateTime,
          actionDescription: actionDescription.trim(),
          result: result.trim(),
          performedByUserId: req.auth!.user.id,
          followUpRequired,
          followUpNote:
            followUpNote === undefined || followUpNote === null
              ? null
              : (followUpNote as string).trim(),
          attachmentNotes:
            attachmentNotes === undefined || attachmentNotes === null
              ? null
              : (attachmentNotes as string).trim(),
        },
        include: actionInclude,
      });

      return res.status(201).json(publicAction(action));
    } catch (error) {
      console.error("Failed to create Actions Taken:", error);
      return apiError(
        res,
        500,
        "INTERNAL_ERROR",
        "Failed to create Actions Taken."
      );
    }
  }
);

// PATCH /api/tickets/:ticketId/actions-taken/:actionId
actionsTakenRouter.patch(
  "/:ticketId/actions-taken/:actionId",
  requireRoles(UserRole.IT_STAFF, UserRole.ADMINISTRATOR),
  requireTrustedOrigin,
  async (req: Request, res: Response) => {
    const ticketId = positiveId(req.params.ticketId);
    const actionId = positiveId(req.params.actionId);

    if (ticketId === null || actionId === null) {
      return apiError(
        res,
        400,
        "INVALID_ID",
        "Ticket ID and action ID must be positive integers."
      );
    }

    if (!isObject(req.body) || Object.keys(req.body).length === 0) {
      return apiError(
        res,
        400,
        "INVALID_BODY",
        "A non-empty JSON object is required."
      );
    }

    if (hasUnknownFields(req.body)) {
      return apiError(
        res,
        400,
        "INVALID_FIELD",
        "The request contains an unsupported field."
      );
    }

    const body = req.body;

    if (
      body.actionDateTime === undefined &&
      body.actionDescription === undefined &&
      body.result === undefined &&
      body.followUpRequired === undefined &&
      body.followUpNote === undefined &&
      body.attachmentNotes === undefined
    ) {
      return apiError(
        res,
        400,
        "NO_CHANGES",
        "Provide at least one permitted field to update."
      );
    }

    const data: {
      actionDateTime?: Date;
      actionDescription?: string;
      result?: string;
      followUpRequired?: boolean;
      followUpNote?: string | null;
      attachmentNotes?: string | null;
    } = {};

    if (body.actionDateTime !== undefined) {
      const date = validDate(body.actionDateTime);
      if (!date) {
        return apiError(
          res,
          400,
          "INVALID_DATE",
          "A valid action date and time is required."
        );
      }
      data.actionDateTime = date;
    }

    if (body.actionDescription !== undefined) {
      if (!validText(body.actionDescription)) {
        return apiError(
          res,
          400,
          "INVALID_DESCRIPTION",
          "Action description must contain 1 to 2000 characters."
        );
      }
      data.actionDescription = body.actionDescription.trim();
    }

    if (body.result !== undefined) {
      if (!validText(body.result)) {
        return apiError(
          res,
          400,
          "INVALID_RESULT",
          "Result must contain 1 to 2000 characters."
        );
      }
      data.result = body.result.trim();
    }

    if (body.followUpRequired !== undefined) {
      if (typeof body.followUpRequired !== "boolean") {
        return apiError(
          res,
          400,
          "INVALID_FOLLOW_UP",
          "Follow-up required must be true or false."
        );
      }
      data.followUpRequired = body.followUpRequired;
    }

    if (body.followUpNote !== undefined) {
      if (!validOptionalText(body.followUpNote)) {
        return apiError(
          res,
          400,
          "INVALID_FOLLOW_UP_NOTE",
          "Follow-up note must be text of at most 2000 characters or null."
        );
      }
      data.followUpNote =
        body.followUpNote === null
          ? null
          : body.followUpNote.trim();
    }

    if (body.attachmentNotes !== undefined) {
      if (!validOptionalText(body.attachmentNotes)) {
        return apiError(
          res,
          400,
          "INVALID_ATTACHMENT_NOTES",
          "Attachment notes must be text of at most 2000 characters or null."
        );
      }
      data.attachmentNotes =
        body.attachmentNotes === null
          ? null
          : body.attachmentNotes.trim();
    }

    try {
      const ticket = await getPrisma().ticket.findUnique({
        where: { id: ticketId },
        select: { id: true },
      });

      if (!ticket) {
        return apiError(res, 404, "TICKET_NOT_FOUND", "Ticket not found.");
      }

      const existing = await getPrisma().actionTaken.findFirst({
        where: {
          id: actionId,
          ticketId,
        },
      });

      if (!existing) {
        return apiError(res, 404, "ACTION_NOT_FOUND", "Action not found.");
      }

      const finalFollowUpRequired =
        data.followUpRequired ?? existing.followUpRequired;
      const finalFollowUpNote =
        data.followUpNote !== undefined
          ? data.followUpNote
          : existing.followUpNote;

      if (
        finalFollowUpRequired &&
        !validText(finalFollowUpNote)
      ) {
        return apiError(
          res,
          400,
          "FOLLOW_UP_NOTE_REQUIRED",
          "A follow-up note is required when follow-up is needed."
        );
      }

      const updated = await getPrisma().actionTaken.update({
        where: { id: actionId },
        data,
        include: actionInclude,
      });

      return res.json(publicAction(updated));
    } catch (error) {
      console.error("Failed to update Actions Taken:", error);
      return apiError(
        res,
        500,
        "INTERNAL_ERROR",
        "Failed to update Actions Taken."
      );
    }
  }
);
