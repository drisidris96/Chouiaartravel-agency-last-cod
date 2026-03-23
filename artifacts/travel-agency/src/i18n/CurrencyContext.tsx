import { createContext, useContext, useState, ReactNode } from "react";

// Rate = how many DZD equals 1 unit of this currency
export const CURRENCIES = [
  { code: "DZD", symbol: "د.ج", name: "الدينار الجزائري", flag: "🇩🇿", rate: 1      },
  { code: "EUR", symbol: "€",   name: "اليورو",            flag: "🇪🇺", rate: 145.5  },
  { code: "USD", symbol: "$",   name: "الدولار الأمريكي",  flag: "🇺🇸", rate: 134.2  },
  { code: "SAR", symbol: "ر.س", name: "الريال السعودي",    flag: "🇸🇦", rate: 35.8   },
] as const;

export type CurrencyCode = typeof CURRENCIES[number]["code"];

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  /** Convert from a base currency to the selected display currency */
  formatPrice: (amount: number, baseCurrency?: CurrencyCode) => string;
  currentCurrency: typeof CURRENCIES[number];
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    return (localStorage.getItem("selectedCurrency") as CurrencyCode) || "EUR";
  });

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem("selectedCurrency", code);
  };

  const currentCurrency = CURRENCIES.find(c => c.code === currency)!;

  const formatPrice = (amount: number, baseCurrency: CurrencyCode = "EUR"): string => {
    const baseRate = CURRENCIES.find(c => c.code === baseCurrency)?.rate ?? 1;
    const targetRate = currentCurrency.rate;
    const converted = (amount * baseRate) / targetRate;

    const formatted = converted.toLocaleString("fr-DZ", {
      minimumFractionDigits: currency === "DZD" ? 0 : 2,
      maximumFractionDigits: currency === "DZD" ? 0 : 2,
    });
    return `${formatted} ${currentCurrency.symbol}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, currentCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
