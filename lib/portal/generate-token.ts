import { randomBytes } from "node:crypto";

/** 48-char hex token for portal / pay / approval links. */
export function generatePortalToken(): string {
  return randomBytes(24).toString("hex");
}
