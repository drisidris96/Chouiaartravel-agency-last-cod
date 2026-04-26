import { Router, type IRouter } from "express";
import { db, announcementsTable } from "@workspace/db";
import { eq, asc, desc, and, or, isNull, lte, gte } from "drizzle-orm";
import { requireAdmin } from "../middleware/requireAdmin";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  try {
    const now = new Date();
    const items = await db
      .select()
      .from(announcementsTable)
      .where(
        and(
          eq(announcementsTable.active, true),
          or(isNull(announcementsTable.startDate), lte(announcementsTable.startDate, now)),
          or(isNull(announcementsTable.endDate), gte(announcementsTable.endDate, now)),
        )
      )
      .orderBy(asc(announcementsTable.sortOrder), desc(announcementsTable.createdAt));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "internal_error", message: "Internal server error" });
  }
});

router.get("/all", requireAdmin, async (_req, res) => {
  try {
    const items = await db
      .select()
      .from(announcementsTable)
      .orderBy(asc(announcementsTable.sortOrder), desc(announcementsTable.createdAt));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "internal_error", message: "Internal server error" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const {
      title, content, fontSize, fontColor, bgColor,
      position, alignment, icon, linkUrl, active, sortOrder,
      verticalOffset, horizontalOffset, width,
      transparentBg, borderColor, borderWidth, fontFamily,
      textShadow, fontWeight, letterSpacing, animation,
      startDate, endDate,
    } = req.body ?? {};
    if (!content || typeof content !== "string") {
      res.status(400).json({ error: "bad_request", message: "Content is required" });
      return;
    }
    const [item] = await db.insert(announcementsTable).values({
      title: title ?? null,
      content,
      fontSize: Number(fontSize) || 18,
      fontColor: fontColor || "#ffffff",
      bgColor: bgColor || "#c0392b",
      position: position || "top",
      alignment: alignment || "center",
      icon: icon ?? null,
      linkUrl: linkUrl ?? null,
      active: active ?? true,
      sortOrder: Number(sortOrder) || 0,
      verticalOffset: Number(verticalOffset) || 0,
      horizontalOffset: Number(horizontalOffset) || 0,
      width: width || "full",
      transparentBg: Boolean(transparentBg),
      borderColor: borderColor ?? null,
      borderWidth: Number(borderWidth) || 0,
      fontFamily: fontFamily ?? null,
      textShadow: textShadow ?? null,
      fontWeight: fontWeight ?? null,
      letterSpacing: Number(letterSpacing) || 0,
      animation: animation ?? null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    }).returning();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: "internal_error", message: "Internal server error" });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      title, content, fontSize, fontColor, bgColor,
      position, alignment, icon, linkUrl, active, sortOrder,
      verticalOffset, horizontalOffset, width,
      transparentBg, borderColor, borderWidth, fontFamily,
      textShadow, fontWeight, letterSpacing, animation,
      startDate, endDate,
    } = req.body ?? {};
    const [item] = await db.update(announcementsTable).set({
      title: title ?? null,
      content,
      fontSize: Number(fontSize) || 18,
      fontColor: fontColor || "#ffffff",
      bgColor: bgColor || "#c0392b",
      position: position || "top",
      alignment: alignment || "center",
      icon: icon ?? null,
      linkUrl: linkUrl ?? null,
      active: active ?? true,
      sortOrder: Number(sortOrder) || 0,
      verticalOffset: Number(verticalOffset) || 0,
      horizontalOffset: Number(horizontalOffset) || 0,
      width: width || "full",
      transparentBg: Boolean(transparentBg),
      borderColor: borderColor ?? null,
      borderWidth: Number(borderWidth) || 0,
      fontFamily: fontFamily ?? null,
      textShadow: textShadow ?? null,
      fontWeight: fontWeight ?? null,
      letterSpacing: Number(letterSpacing) || 0,
      animation: animation ?? null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    }).where(eq(announcementsTable.id, id)).returning();
    if (!item) {
      res.status(404).json({ error: "not_found", message: "Announcement not found" });
      return;
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "internal_error", message: "Internal server error" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(announcementsTable).where(eq(announcementsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "internal_error", message: "Internal server error" });
  }
});

export default router;
