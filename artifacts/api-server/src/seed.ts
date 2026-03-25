import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { logger } from "./lib/logger";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "travel-agency-salt").digest("hex");
}

const ADMIN_EMAIL = "admin@chouiaar.com";
const ADMIN_PASSWORD = "germany@123GERMANY1234";

export async function seedAdmin() {
  try {
    const [existing] = await db
      .select({ id: usersTable.id, password: usersTable.password })
      .from(usersTable)
      .where(eq(usersTable.email, ADMIN_EMAIL));

    const correctHash = hashPassword(ADMIN_PASSWORD);

    if (existing) {
      if (existing.password !== correctHash) {
        await db
          .update(usersTable)
          .set({ password: correctHash })
          .where(eq(usersTable.email, ADMIN_EMAIL));
        logger.info("Admin password updated");
      } else {
        logger.info("Admin user already exists, skipping seed");
      }
      return;
    }

    await db.insert(usersTable).values({
      email: ADMIN_EMAIL,
      password: correctHash,
      name: "Admin Chouiaar",
      role: "admin",
      verified: true,
    });

    logger.info("Admin user seeded successfully");
  } catch (err) {
    logger.error({ err }, "Failed to seed admin user");
  }
}
