import { Router, type Request, type Response } from "express";
import { UserRole } from "@prisma/client";
import { getPrisma } from "../prisma.js";
import { hashPassword, validatePassword } from "../auth/password.js";
import {
  requireAuthentication,
  requirePasswordChangeCompleted,
  requireRoles,
  requireTrustedOrigin,
} from "../auth/middleware.js";
import { toPublicUser } from "../auth/types.js";

export const adminRouter = Router();

function error(
  res: Response,
  status: number,
  code: string,
  message: string
): Response {
  return res.status(status).json({ error: { code, message } });
}

adminRouter.use(
  requireAuthentication,
  requirePasswordChangeCompleted,
  requireRoles(UserRole.ADMINISTRATOR)
);

adminRouter.get("/users", async (_req: Request, res: Response) => {
  try {
    const users = await getPrisma().user.findMany({
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });

    return res.status(200).json({
      users: users.map(toPublicUser),
    });
  } catch (cause) {
    console.error("Admin user list failed:", cause);
    return error(
      res,
      500,
      "ADMIN_USER_LIST_UNAVAILABLE",
      "Unable to load users."
    );
  }
});

adminRouter.post(
  "/users",
  requireTrustedOrigin,
  async (req: Request, res: Response) => {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";
    const role =
      typeof req.body.role === "string" ? req.body.role.trim() : "";
    const initialPassword =
      typeof req.body.initialPassword === "string"
        ? req.body.initialPassword
        : "";

    if (!name || !email || !role || !initialPassword) {
      return error(
        res,
        400,
        "INVALID_USER_DATA",
        "Name, email, role, and initial password are required."
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return error(res, 400, "INVALID_USER_DATA", "Email address is invalid.");
    }

    if (
      role !== UserRole.REQUESTER &&
      role !== UserRole.IT_STAFF &&
      role !== UserRole.ADMINISTRATOR
    ) {
      return error(res, 400, "INVALID_USER_DATA", "User role is invalid.");
    }

    const passwordError = validatePassword(initialPassword);

    if (passwordError) {
      return error(res, 400, "INVALID_USER_DATA", passwordError);
    }

    try {
      const existingUser = await getPrisma().user.findFirst({
        where: {
          email: {
            equals: email,
            mode: "insensitive",
          },
        },
      });

      if (existingUser) {
        return error(
          res,
          409,
          "EMAIL_ALREADY_EXISTS",
          "A user with this email already exists."
        );
      }

      const user = await getPrisma().user.create({
        data: {
          name,
          email,
          passwordHash: await hashPassword(initialPassword),
          role: role as UserRole,
          isActive: true,
          mustChangePassword: true,
        },
      });

      return res.status(201).json({
        user: toPublicUser(user),
      });
    } catch (cause) {
      console.error("Admin user creation failed:", cause);
      return error(
        res,
        500,
        "ADMIN_USER_CREATE_UNAVAILABLE",
        "Unable to create user."
      );
    }
  }
);

adminRouter.patch(
  "/users/:userId",
  requireTrustedOrigin,
  async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return error(res, 400, "INVALID_USER_ID", "User ID is invalid.");
    }

    const name =
      typeof req.body.name === "string" ? req.body.name.trim() : undefined;

    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : undefined;

    const role =
      typeof req.body.role === "string" ? req.body.role.trim() : undefined;

    if (name !== undefined && !name) {
      return error(res, 400, "INVALID_USER_DATA", "Name cannot be empty.");
    }

    if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return error(res, 400, "INVALID_USER_DATA", "Email address is invalid.");
    }

    if (
      role !== undefined &&
      role !== UserRole.REQUESTER &&
      role !== UserRole.IT_STAFF &&
      role !== UserRole.ADMINISTRATOR
    ) {
      return error(res, 400, "INVALID_USER_DATA", "User role is invalid.");
    }

    if (name === undefined && email === undefined && role === undefined) {
      return error(
        res,
        400,
        "INVALID_USER_DATA",
        "At least one user field must be provided."
      );
    }

    try {
      const existingUser = await getPrisma().user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        return error(res, 404, "USER_NOT_FOUND", "User was not found.");
      }

      if (
  role !== undefined &&
  role !== UserRole.ADMINISTRATOR &&
  existingUser.role === UserRole.ADMINISTRATOR &&
  existingUser.isActive
) {
  const activeAdministratorCount = await getPrisma().user.count({
    where: {
      role: UserRole.ADMINISTRATOR,
      isActive: true,
    },
  });

  if (activeAdministratorCount <= 1) {
    return error(
      res,
      400,
      "CANNOT_REMOVE_LAST_ADMINISTRATOR",
      "The system must have at least one active Administrator."
    );
  }
}

      if (email !== undefined) {
        const emailOwner = await getPrisma().user.findFirst({
          where: {
            email: {
              equals: email,
              mode: "insensitive",
            },
            id: {
              not: userId,
            },
          },
        });

        if (emailOwner) {
          return error(
            res,
            409,
            "EMAIL_ALREADY_EXISTS",
            "A user with this email already exists."
          );
        }
      }

      const user = await getPrisma().user.update({
        where: { id: userId },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(email !== undefined ? { email } : {}),
          ...(role !== undefined ? { role: role as UserRole } : {}),
        },
      });

      return res.status(200).json({
        user: toPublicUser(user),
      });
    } catch (cause) {
      console.error("Admin user update failed:", cause);
      return error(
        res,
        500,
        "ADMIN_USER_UPDATE_UNAVAILABLE",
        "Unable to update user."
      );
    }
  }
);

adminRouter.patch(
  "/users/:userId/status",
  requireTrustedOrigin,
  async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return error(res, 400, "INVALID_USER_ID", "User ID is invalid.");
    }

    if (typeof req.body.isActive !== "boolean") {
      return error(
        res,
        400,
        "INVALID_STATUS",
        "isActive must be a boolean."
      );
    }

    const isActive = req.body.isActive;

    try {
      const user = await getPrisma().user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return error(res, 404, "USER_NOT_FOUND", "User was not found.");
      }

      if (user.id === req.auth!.user.id && !isActive) {
        return error(
          res,
          400,
          "CANNOT_DEACTIVATE_SELF",
          "You cannot deactivate your own account."
        );
      }

      if (!isActive && user.role === UserRole.ADMINISTRATOR) {
  const activeAdministratorCount = await getPrisma().user.count({
    where: {
      role: UserRole.ADMINISTRATOR,
      isActive: true,
    },
  });

  if (activeAdministratorCount <= 1) {
    return error(
      res,
      400,
      "CANNOT_REMOVE_LAST_ADMINISTRATOR",
      "The system must have at least one active Administrator."
    );
  }
}

      const updatedUser = await getPrisma().user.update({
        where: { id: userId },
        data: { isActive },
      });

      return res.status(200).json({
        user: toPublicUser(updatedUser),
      });
    } catch (cause) {
      console.error("Admin user status update failed:", cause);
      return error(
        res,
        500,
        "ADMIN_USER_STATUS_UNAVAILABLE",
        "Unable to update user status."
      );
    }
  }
);

adminRouter.patch(
  "/users/:userId/password",
  requireTrustedOrigin,
  async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return error(res, 400, "INVALID_USER_ID", "User ID is invalid.");
    }

    const initialPassword =
      typeof req.body.initialPassword === "string"
        ? req.body.initialPassword
        : "";

    if (!initialPassword) {
      return error(
        res,
        400,
        "INVALID_PASSWORD",
        "Initial password is required."
      );
    }

    const passwordError = validatePassword(initialPassword);

    if (passwordError) {
      return error(res, 400, "INVALID_PASSWORD", passwordError);
    }

    try {
      const user = await getPrisma().user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return error(res, 404, "USER_NOT_FOUND", "User was not found.");
      }

      const updatedUser = await getPrisma().user.update({
        where: { id: userId },
        data: {
          passwordHash: await hashPassword(initialPassword),
          mustChangePassword: true,
        },
      });

      return res.status(200).json({
        user: toPublicUser(updatedUser),
      });
    } catch (cause) {
      console.error("Admin password reset failed:", cause);
      return error(
        res,
        500,
        "ADMIN_PASSWORD_RESET_UNAVAILABLE",
        "Unable to set the new initial password."
      );
    }
  }
);