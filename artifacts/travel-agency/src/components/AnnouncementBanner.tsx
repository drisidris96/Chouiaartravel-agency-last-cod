import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Announcement {
  id: number;
  title?: string | null;
  content: string;
  fontSize: number;
  fontColor: string;
  bgColor: string;
  position: string;
  alignment: string;
  icon?: string | null;
  linkUrl?: string | null;
  active: boolean;
  sortOrder: number;
  verticalOffset?: number;
  horizontalOffset?: number;
  width?: string;
}

const WIDTH_MAP: Record<string, string> = {
  narrow: "max-w-md",
  medium: "max-w-2xl",
  wide: "max-w-5xl",
  full: "max-w-full",
};

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";

interface Props {
  position: "top" | "middle" | "bottom";
}

export default function AnnouncementBanner({ position }: Props) {
  const [items, setItems] = useState<Announcement[]>([]);

  useEffect(() => {
    fetch(`${BASE}/announcements`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Announcement[]) => setItems(data.filter((a) => a.position === position)))
      .catch(() => setItems([]));
  }, [position]);

  if (items.length === 0) return null;

  return (
    <div className="w-full">
      <AnimatePresence>
        {items.map((a) => {
          const Wrapper: any = a.linkUrl ? "a" : "div";
          const wrapperProps: any = a.linkUrl
            ? { href: a.linkUrl, target: "_blank", rel: "noopener noreferrer" }
            : {};
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              style={{
                backgroundColor: a.bgColor,
                marginTop: a.verticalOffset || 0,
                marginLeft: (a.horizontalOffset || 0) > 0 ? a.horizontalOffset : undefined,
                marginRight: (a.horizontalOffset || 0) < 0 ? -(a.horizontalOffset || 0) : undefined,
              }}
              className={`mx-auto shadow-md rounded-md ${WIDTH_MAP[a.width || "full"] || "max-w-full"}`}
            >
              <Wrapper
                {...wrapperProps}
                className="container mx-auto px-4 py-3 flex items-center justify-center gap-3 cursor-pointer"
                style={{
                  color: a.fontColor,
                  textAlign: a.alignment as any,
                  justifyContent:
                    a.alignment === "left"
                      ? "flex-start"
                      : a.alignment === "right"
                      ? "flex-end"
                      : "center",
                }}
              >
                {a.icon && <span style={{ fontSize: a.fontSize + 4 }}>{a.icon}</span>}
                <div>
                  {a.title && (
                    <div
                      style={{ fontSize: a.fontSize + 2, fontWeight: 700, lineHeight: 1.3 }}
                    >
                      {a.title}
                    </div>
                  )}
                  <div style={{ fontSize: a.fontSize, lineHeight: 1.5 }}>{a.content}</div>
                </div>
              </Wrapper>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
