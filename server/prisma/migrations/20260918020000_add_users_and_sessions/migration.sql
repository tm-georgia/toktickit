-- Lab 3 authentication foundation. This is intentionally non-destructive:
-- PostgreSQL renames the requester table in place and updates the referenced
-- relation of Ticket.requesterId without changing ticket or requester IDs.
CREATE TYPE "UserRole" AS ENUM ('REQUESTER', 'IT_STAFF', 'ADMINISTRATOR');

ALTER TABLE "DevelopmentRequester" RENAME TO "User";
ALTER TABLE "User" RENAME CONSTRAINT "DevelopmentRequester_pkey" TO "User_pkey";
ALTER INDEX "DevelopmentRequester_email_key" RENAME TO "User_email_key";

ALTER TABLE "User"
  ADD COLUMN "passwordHash" TEXT NOT NULL DEFAULT 'scrypt$16384$8$1$UjHVXJC4Rncm0-zOlUjFQw$8pM8OeIsWNukQzS9XxjflgUukMvSVTX48f9tRleZGHiav3HThCHzDPQjHCxsOxpyun9OHGQtjJMFKABCL_SjCw',
  ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'REQUESTER',
  ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- The legacy exact-case unique index remains. This additional invariant safely
-- aborts the migration if existing values differ only by email casing.
CREATE UNIQUE INDEX "User_email_lower_key" ON "User" (LOWER("email"));

CREATE TABLE "Session" (
  "id" SERIAL NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "userId" INTEGER NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

ALTER TABLE "Session"
  ADD CONSTRAINT "Session_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
