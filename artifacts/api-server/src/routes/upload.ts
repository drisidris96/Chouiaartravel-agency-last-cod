import { Router, type IRouter } from "express";
import path from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";
import { requireAdmin } from "../middleware/requireAdmin";

const router: IRouter = Router();

const uploadsDir = process.env.UPLOADS_DIR ?? path.resolve(process.cwd(), "uploads");
mkdirSync(uploadsDir, { recursive: true });

router.post("/admin/upload-image", requireAdmin, (req, res) => {
  try {
    const { base64, mimeType } = req.body as { base64?: string; mimeType?: string };

    if (!base64 || !mimeType) {
      res.status(400).json({ error: "bad_request", message: "يجب إرسال base64 و mimeType" });
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(mimeType)) {
      res.status(400).json({ error: "bad_request", message: "نوع الملف غير مسموح" });
      return;
    }

    const ext = mimeType.split("/")[1].replace("jpeg", "jpg");
    const filename = `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    const data = base64.replace(/^data:image\/[a-z]+;base64,/, "");
    const buffer = Buffer.from(data, "base64");

    if (buffer.length > 10 * 1024 * 1024) {
      res.status(400).json({ error: "bad_request", message: "حجم الصورة يتجاوز 10MB" });
      return;
    }

    writeFileSync(filePath, buffer);
    res.json({ url: `/uploads/${filename}` });
  } catch (err) {
    res.status(500).json({ error: "internal_error", message: "خطأ في رفع الصورة" });
  }
});

export default router;
