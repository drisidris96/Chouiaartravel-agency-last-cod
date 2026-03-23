import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { logger } from "./lib/logger";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "travel-agency-salt").digest("hex");
}

export async function seedAdmin() {
  try {
    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, "admin@chouiaar.com"));

    if (existing) {
      logger.info("Admin user already exists, skipping seed");
      return;
    }

    await db.insert(usersTable).values({
      email: "admin@chouiaar.com",
      password: hashPassword("admin123"),
      name: "Admin Chouiaar",
      role: "admin",
      verified: true,
    });

    logger.info("Admin user seeded successfully");
  } catch (err) {
    logger.error({ err }, "Failed to seed admin user");
  }
}
