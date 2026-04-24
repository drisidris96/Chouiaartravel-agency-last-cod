import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Star, Users, Hotel, HeadphonesIcon, Phone, Loader2, Calendar, CheckCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCurrency } from "@/i18n/CurrencyContext";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";

type UmrahPackage = {
  id: number;
  title: string;
  description: string;
  destination: string;
  imageUrl: string | null;
  price: number;
  duration: number;
  maxCapacity: number;
  availableSpots: number;
  startDate: string;
  endDate: string;
  featured: boolean;
  includes: string[];
};

const CARD_COLORS = [
  "from-slate-500 to-slate-700",
  "from-amber-500 to-amber-700",
  "from-yellow-500 to-yellow-700",
  "from-primary to-primary/80",
  "from-emerald-500 to-emerald-700",
];

export default function Umrah() {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  const [packages, setPackages] = useState<UmrahPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/trips?category=umrah`)
      .then(r => r.json())
      .then(data => setPackages(Array.isArray(data) ? data : []))
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  }, []);

  const whyUs = [
    { icon: Star, title: t("umrah.why1"), desc: t("umrah.why1Desc") },
    { icon: Users, title: t("umrah.why2"), desc: t("umrah.why2Desc") },
    { icon: HeadphonesIcon, title: t("umrah.why3"), desc: t("umrah.why3Desc") },
    { icon: Hotel, title: t("umrah.why4"), desc: t("umrah.why4Desc") },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/mecca-bg.jpg" alt="Umrah" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-block bg-primary/20 text-primary border border-primary/30 px-5 py-2 rounded-full text-sm font-bold mb-5 backdrop-blur">
              {t("umrah.badge")}
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
              {t("umrah.title")} <span className="text-primary">{t("umrah.titleHighlight")}</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              {t("umrah.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-center mb-12">{t("umrah.whyTitle")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUs.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center p-6 bg-card rounded-2xl border border-border/50 hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-serif font-bold mb-4">{t("umrah.packagesTitle")}</h2>
            <p className="text-muted-foreground text-lg">{t("umrah.packagesSubtitle")}</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" /> جاري تحميل الباقات...
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-5xl mb-4">🕋</p>
              <p className="text-lg font-semibold">الباقات قيد الإعداد</p>
              <p className="text-sm mt-2">تواصل معنا للاستفسار عن باقات العمرة المتاحة</p>
              <Link href="/contact">
                <Button className="mt-6 rounded-full gap-2" size="lg">
                  <Phone className="w-4 h-4" /> تواصل معنا
                </Button>
              </Link>
            </div>
          ) : (
            <div className={`grid gap-8 ${packages.length === 1 ? "max-w-md mx-auto" : packages.length === 2 ? "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto" : "grid-cols-1 md:grid-cols-3"}`}>
              {packages.map((pkg, i) => {
                const color = CARD_COLORS[i % CARD_COLORS.length];
                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`relative rounded-3xl overflow-hidden border ${pkg.featured ? "border-primary shadow-2xl shadow-primary/20 scale-105" : "border-border/50 shadow-lg"}`}
                  >
                    {pkg.featured && (
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                        <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                          {t("umrah.mostPopular")}
                        </span>
                      </div>
                    )}

                    {/* Card header — image or gradient */}
                    {pkg.imageUrl ? (
                      <div className="relative h-44 overflow-hidden">
                        <img src={pkg.imageUrl} alt={pkg.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40" />
                        <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                          <h3 className="text-2xl font-bold mb-0.5">{pkg.title}</h3>
                          <p className="text-white/80 text-sm">{pkg.duration} أيام • {pkg.destination}</p>
                        </div>
                      </div>
                    ) : (
                      <div className={`bg-gradient-to-br ${color} p-8 text-white`}>
                        <h3 className="text-2xl font-bold mb-1">{pkg.title}</h3>
                        <p className="text-white/70 text-sm">{pkg.duration} أيام • {pkg.destination}</p>
                      </div>
                    )}

                    <div className="bg-card p-6">
                      {/* Price & spots */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">السعر</p>
                          <p className="text-2xl font-bold text-primary" dir="ltr">{formatPrice(pkg.price)}</p>
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-muted-foreground">الأماكن المتاحة</p>
                          <p className={`font-bold text-sm ${pkg.availableSpots > 0 ? "text-emerald-600" : "text-destructive"}`}>
                            {pkg.availableSpots} / {pkg.maxCapacity}
                          </p>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 bg-muted/40 rounded-xl px-3 py-2">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {new Date(pkg.startDate).toLocaleDateString("ar-DZ")} ← {new Date(pkg.endDate).toLocaleDateString("ar-DZ")}
                      </div>

                      {/* Description */}
                      {pkg.description && (
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{pkg.description}</p>
                      )}

                      {/* Includes */}
                      {pkg.includes.length > 0 && (
                        <ul className="space-y-1.5 mb-5">
                          {pkg.includes.map((item, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <Link href="/contact">
                        <Button className="w-full rounded-full" variant={pkg.featured ? "default" : "outline"}>
                          {t("umrah.bookNow")}
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">{t("umrah.ctaTitle")}</h2>
          <p className="text-muted-foreground mb-8 text-lg">{t("umrah.ctaSubtitle")}</p>
          <Link href="/contact">
            <Button size="lg" className="rounded-full h-13 px-10 gap-2">
              <Phone className="w-5 h-5" />
              {t("umrah.ctaBtn")}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
