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
  transparentBg?: boolean;
  borderColor?: string | null;
  borderWidth?: number;
  fontFamily?: string | null;
  textShadow?: string | null;
  fontWeight?: string | null;
  letterSpacing?: number;
  animation?: string | null;
}

const ANIMATION_STYLES = `
@keyframes ann-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
@keyframes ann-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-3px)} 75%{transform:translateX(3px)} }
@keyframes ann-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
@keyframes ann-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes ann-glow { 0%,100%{filter:brightness(1) drop-shadow(0 0 0 currentColor)} 50%{filter:brightness(1.3) drop-shadow(0 0 12px currentColor)} }
@keyframes ann-slide-rtl { 0%{transform:translateX(100%)} 100%{transform:translateX(-100%)} }
.ann-blink{animation:ann-blink 1.2s ease-in-out infinite}
.ann-shake{animation:ann-shake 0.5s ease-in-out infinite}
.ann-pulse{animation:ann-pulse 1.8s ease-in-out infinite}
.ann-bounce{animation:ann-bounce 1.5s ease-in-out infinite}
.ann-glow{animation:ann-glow 2s ease-in-out infinite}
.ann-marquee{overflow:hidden;white-space:nowrap}
.ann-marquee > *{display:inline-block;animation:ann-slide-rtl 18s linear infinite}
`;

const WIDTH_MAP: Record<string, string> = {
  narrow: "max-w-md",
  medium: "max-w-2xl",
  wide: "max-w-5xl",
  full: "max-w-full",
};

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";

interface Props {
  position: "top" | "middle" | "bottom" | "hero";
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
      <style dangerouslySetInnerHTML={{ __html: ANIMATION_STYLES }} />
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
                backgroundColor: a.transparentBg ? "transparent" : a.bgColor,
                marginTop: a.verticalOffset || 0,
                marginLeft: (a.horizontalOffset || 0) > 0 ? a.horizontalOffset : undefined,
                marginRight: (a.horizontalOffset || 0) < 0 ? -(a.horizontalOffset || 0) : undefined,
                border: (a.borderWidth || 0) > 0 && a.borderColor ? `${a.borderWidth}px solid ${a.borderColor}` : undefined,
                fontFamily: a.fontFamily || undefined,
                boxShadow: a.transparentBg ? "none" : undefined,
              }}
              className={`mx-auto rounded-md ${a.transparentBg ? "" : "shadow-md"} ${WIDTH_MAP[a.width || "full"] || "max-w-full"} ${a.animation && a.animation !== "marquee" ? `ann-${a.animation}` : ""} ${a.animation === "marquee" ? "ann-marquee" : ""}`}
            >
              <Wrapper
                {...wrapperProps}
                className="container mx-auto px-4 py-3 flex items-center justify-center gap-3 cursor-pointer"
                style={{
                  color: a.fontColor,
                  textAlign: a.alignment as any,
                  textShadow: a.textShadow || undefined,
                  fontWeight: (a.fontWeight as any) || undefined,
                  letterSpacing: a.letterSpacing ? `${a.letterSpacing}px` : undefined,
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
