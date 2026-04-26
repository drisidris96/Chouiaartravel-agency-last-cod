import { Router, type IRouter } from "express";
import { db, residencyRequestsTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { requireAdmin } from "../middleware/requireAdmin";

const router: IRouter = Router();

router.post("/", async (req, res) => {
  try {
    const {
      firstName, lastName, birthDate, birthPlace, profession,
      address, phone, email, passportNumber, passportExpiryDate,
      country, residencyType, durationYears, sponsorName, sponsorContact,
      travelDate, notes,
    } = req.body;

    if (!firstName || !lastName || !birthDate || !birthPlace || !profession ||
        !address || !phone || !passportNumber || !passportExpiryDate || !country) {
      res.status(400).json({ error: "bad_request", message: "جميع الحقول المطلوبة يجب ملؤها" });
      return;
    }

    const [residencyRequest] = await db
      .insert(residencyRequestsTable)
      .values({
        firstName, lastName, birthDate, birthPlace, profession,
        address, phone,
        email: email || null,
        passportNumber, passportExpiryDate, country,
        residencyType: residencyType || "work",
        durationYears: durationYears || null,
        sponsorName: sponsorName || null,
        sponsorContact: sponsorContact || null,
        travelDate: travelDate || null,
        notes: notes || null,
      })
      .returning();

    res.status(201).json({ residencyRequest, message: "تم تسجيل طلب الإقامة بنجاح" });
  } catch (err) {
    req.log.error({ err }, "Create residency request error");
    res.status(500).json({ error: "internal_error", message: "خطأ في الخادم" });
  }
});

router.get("/", requireAdmin, async (_req, res) => {
  try {
    const residencyRequests = await db.select().from(residencyRequestsTable).orderBy(desc(residencyRequestsTable.createdAt));
    res.json({ residencyRequests });
  } catch (err) {
    res.status(500).json({ error: "internal_error", message: "خطأ في الخادم" });
  }
});

router.get("/pending-count", requireAdmin, async (_req, res) => {
  try {
    const [r] = await db.select({ count: count() }).from(residencyRequestsTable).where(eq(residencyRequestsTable.status, "pending"));
    res.json({ count: r?.count ?? 0 });
  } catch {
    res.status(500).json({ error: "internal_error" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(residencyRequestsTable).where(eq(residencyRequestsTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "internal_error", message: "خطأ في الخادم" });
  }
});

router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const updateData: any = { status };
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const [updated] = await db
      .update(residencyRequestsTable)
      .set(updateData)
      .where(eq(residencyRequestsTable.id, Number(req.params.id)))
      .returning();
    res.json({ residencyRequest: updated });
  } catch (err) {
    res.status(500).json({ error: "internal_error", message: "خطأ في الخادم" });
  }
});

export default router;
