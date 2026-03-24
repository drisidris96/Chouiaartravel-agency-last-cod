import { Router, type IRouter } from "express";
import { db, serviceRequestsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middleware/requireAdmin";

const router: IRouter = Router();

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per file
const MAX_FILES = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];

router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, address, phone, passportNumber, serviceDescription, attachments } = req.body;
    if (!firstName || !lastName || !address || !phone || !passportNumber || !serviceDescription) {
      res.status(400).json({ error: "bad_request", message: "جميع الحقول مطلوبة" });
      return;
    }

    // Validate attachments if provided
    let safeAttachments: { name: string; type: string; data: string }[] = [];
    if (attachments && Array.isArray(attachments)) {
      if (attachments.length > MAX_FILES) {
        res.status(400).json({ error: "bad_request", message: `الحد الأقصى ${MAX_FILES} ملفات` });
        return;
      }
      for (const file of attachments) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          res.status(400).json({ error: "bad_request", message: "نوع الملف غير مسموح به. المسموح: JPG, PNG, PDF" });
          return;
        }
        const byteSize = Math.ceil((file.data.length * 3) / 4);
        if (byteSize > MAX_FILE_SIZE) {
          res.status(400).json({ error: "bad_request", message: "حجم الملف يتجاوز 5 ميغابايت" });
          return;
        }
        safeAttachments.push({ name: file.name, type: file.type, data: file.data });
      }
    }

    const [request] = await db
      .insert(serviceRequestsTable)
      .values({ firstName, lastName, address, phone, passportNumber, serviceDescription, attachments: safeAttachments })
      .returning();
    res.status(201).json({ request, message: "تم إرسال طلبك بنجاح" });
  } catch (err) {
    req.log.error({ err }, "Create service request error");
    res.status(500).json({ error: "internal_error", message: "خطأ في الخادم" });
  }
});

router.get("/", requireAdmin, async (req, res) => {
  try {
    const requests = await db.select().from(serviceRequestsTable).orderBy(desc(serviceRequestsTable.createdAt));
    res.json({ requests });
  } catch (err) {
    req.log.error({ err }, "Get service requests error");
    res.status(500).json({ error: "internal_error", message: "خطأ في الخادم" });
  }
});

router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const [updated] = await db
      .update(serviceRequestsTable)
      .set({ status })
      .where(eq(serviceRequestsTable.id, Number(req.params.id)))
      .returning();
    res.json({ request: updated });
  } catch (err) {
    req.log.error({ err }, "Update service request error");
    res.status(500).json({ error: "internal_error", message: "خطأ في الخادم" });
  }
});

export default router;
