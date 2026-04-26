import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const announcementsTable = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title"),
  content: text("content").notNull(),
  fontSize: integer("font_size").notNull().default(18),
  fontColor: text("font_color").notNull().default("#ffffff"),
  bgColor: text("bg_color").notNull().default("#c0392b"),
  position: text("position").notNull().default("top"),
  alignment: text("alignment").notNull().default("center"),
  icon: text("icon"),
  linkUrl: text("link_url"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  verticalOffset: integer("vertical_offset").notNull().default(0),
  horizontalOffset: integer("horizontal_offset").notNull().default(0),
  width: text("width").notNull().default("full"),
  transparentBg: boolean("transparent_bg").notNull().default(false),
  borderColor: text("border_color"),
  borderWidth: integer("border_width").notNull().default(0),
  fontFamily: text("font_family"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Announcement = typeof announcementsTable.$inferSelect;
export type InsertAnnouncement = typeof announcementsTable.$inferInsert;
