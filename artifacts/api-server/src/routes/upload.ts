import { Router, type IRouter } from "express";
import multer from "multer";
import path from "node:path";
import { mkdirSync } from "node:fs";
import { requireAdmin } from "../middleware/requireAdmin";

const router: IRouter = Router();

const uploadsDir = process.env.UPLOADS_DIR ?? path.resolve(process.cwd(), "uploads");
mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.post("/admin/upload-image", requireAdmin, upload.single("image"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "bad_request", message: "لم يتم إرسال صورة صالحة" });
    return;
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

export default router;
