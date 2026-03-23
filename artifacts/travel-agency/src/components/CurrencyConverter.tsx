import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { CURRENCIES, useCurrency } from "@/i18n/CurrencyContext";

export function CurrencyConverter() {
  const { currency, setCurrency, currentCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-muted/60 hover:bg-primary/10 transition-colors border border-border/40 text-xs font-semibold"
      >
        <span>{currentCurrency.flag}</span>
        <span className="hidden sm:inline">{currentCurrency.code}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 bg-card border border-border/50 rounded-2xl shadow-2xl z-50 w-52 overflow-hidden ltr:right-0 rtl:left-0"
          >
            <div className="p-2">
              <p className="text-xs text-muted-foreground px-3 py-1.5 font-medium">اختر العملة</p>
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => { setCurrency(c.code); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm text-right ${
                    currency === c.code
                      ? "bg-primary/10 text-primary font-bold"
                      : "hover:bg-muted/60"
                  }`}
                >
                  <span className="text-lg">{c.flag}</span>
                  <div className="flex flex-col items-start flex-1">
                    <span className="font-semibold">{c.code} — {c.symbol}</span>
                    <span className="text-xs text-muted-foreground">{c.name}</span>
                  </div>
                  {currency === c.code && (
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
            <div className="border-t border-border/40 px-3 py-2 text-center">
              <p className="text-xs text-muted-foreground">* أسعار تقريبية للاسترشاد فقط</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
