import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Hotel, Plane, CheckCircle, Globe, Search, Sparkles,
  User, CreditCard, Calendar, FileText, ChevronLeft, ArrowLeft
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";

const COUNTRIES = [
  { code: "SA", name: "المملكة العربية السعودية", flag: "🇸🇦" },
  { code: "AE", name: "الإمارات العربية المتحدة", flag: "🇦🇪" },
  { code: "TR", name: "تركيا", flag: "🇹🇷" },
  { code: "EG", name: "مصر", flag: "🇪🇬" },
  { code: "MA", name: "المغرب", flag: "🇲🇦" },
  { code: "TN", name: "تونس", flag: "🇹🇳" },
  { code: "FR", name: "فرنسا", flag: "🇫🇷" },
  { code: "ES", name: "إسبانيا", flag: "🇪🇸" },
  { code: "IT", name: "إيطاليا", flag: "🇮🇹" },
  { code: "DE", name: "ألمانيا", flag: "🇩🇪" },
  { code: "GB", name: "المملكة المتحدة", flag: "🇬🇧" },
  { code: "PT", name: "البرتغال", flag: "🇵🇹" },
  { code: "GR", name: "اليونان", flag: "🇬🇷" },
  { code: "ID", name: "إندونيسيا (بالي)", flag: "🇮🇩" },
  { code: "TH", name: "تايلاند", flag: "🇹🇭" },
  { code: "MY", name: "ماليزيا", flag: "🇲🇾" },
  { code: "IN", name: "الهند", flag: "🇮🇳" },
  { code: "QA", name: "قطر", flag: "🇶🇦" },
  { code: "KW", name: "الكويت", flag: "🇰🇼" },
  { code: "JO", name: "الأردن", flag: "🇯🇴" },
  { code: "LB", name: "لبنان", flag: "🇱🇧" },
  { code: "DZ", name: "الجزائر", flag: "🇩🇿" },
  { code: "US", name: "الولايات المتحدة", flag: "🇺🇸" },
  { code: "CA", name: "كندا", flag: "🇨🇦" },
  { code: "AU", name: "أستراليا", flag: "🇦🇺" },
  { code: "MV", name: "جزر المالديف", flag: "🇲🇻" },
  { code: "ZA", name: "جنوب أفريقيا", flag: "🇿🇦" },
  { code: "SN", name: "السنغال", flag: "🇸🇳" },
];

type Step = "type" | "country" | "form" | "done";

export default function Reservations() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("type");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<{ code: string; name: string; flag: string } | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", passportNumber: "",
    departureDate: "", returnDate: "", notes: "",
  });

  const TYPES = [
    {
      id: "hotel",
      label: t("reservations.hotel"),
      icon: Hotel,
      desc: t("reservations.hotelDesc"),
      gradient: "from-emerald-500 via-teal-600 to-cyan-700",
      glow: "group-hover:shadow-emerald-500/40",
      tag: "🏨 إقامة فاخرة",
    },
    {
      id: "flight",
      label: t("reservations.flight"),
      icon: Plane,
      desc: t("reservations.flightDesc"),
      gradient: "from-sky-500 via-blue-600 to-indigo-700",
      glow: "group-hover:shadow-blue-500/40",
      tag: "✈️ أفضل الأسعار",
    },
    {
      id: "both",
      label: t("reservations.both"),
      icon: Globe,
      desc: t("reservations.bothDesc"),
      gradient: "from-amber-500 via-orange-600 to-rose-600",
      glow: "group-hover:shadow-orange-500/40",
      tag: "🎁 باقة كاملة",
    },
  ];

  const filtered = COUNTRIES.filter(
    (c) => c.name.includes(search) || c.flag.includes(search)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.departureDate || !form.returnDate) {
      toast({ variant: "destructive", title: t("reservations.enterDates") });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          firstName: form.firstName,
          lastName: form.lastName,
          passportNumber: form.passportNumber,
          destination: selectedCountry?.name,
          departureDate: form.departureDate,
          returnDate: form.returnDate,
          notes: form.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStep("done");
    } catch (err: any) {
      toast({ variant: "destructive", title: t("reservations.failed"), description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("type");
    setSelectedType("");
    setSelectedCountry(null);
    setSearch("");
    setForm({ firstName: "", lastName: "", passportNumber: "", departureDate: "", returnDate: "", notes: "" });
  };

  const inputCls = "w-full px-4 py-3.5 rounded-2xl border-2 border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all";

  const stepIndex = ["type","country","form","done"].indexOf(step);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* HERO حديث */}
      <section className="relative overflow-hidden pt-16 pb-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl animate-pulse" style={{ animationDelay: "1.2s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <div className="container mx-auto px-4 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-white/10 backdrop-blur border border-primary/20 px-5 py-2 rounded-full text-sm font-bold mb-6 shadow-lg">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">
                {t("reservations.badge")}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 leading-tight">
              {t("reservations.title")}{" "}
              <span className="bg-gradient-to-r from-primary via-amber-500 to-orange-600 bg-clip-text text-transparent">
                {t("reservations.titleHighlight")}
              </span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              {t("reservations.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* مؤشّر الخطوات الحديث */}
      <div className="container mx-auto px-4 max-w-3xl -mt-6 mb-10 relative z-10">
        <div className="bg-card border border-border/50 backdrop-blur rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between gap-2">
            {(["type","country","form"] as Step[]).map((s, i) => {
              const isActive = step === s;
              const isDone = stepIndex > i;
              const labels = [t("reservations.stepType"), t("reservations.stepDest"), t("reservations.stepData")];
              return (
                <div key={s} className="flex-1 flex items-center gap-2">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <motion.div
                      animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                      transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-base font-black transition-all ${
                        isActive ? "bg-gradient-to-br from-primary to-amber-500 text-white shadow-lg shadow-primary/40 scale-110"
                        : isDone ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md"
                        : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isDone ? "✓" : i + 1}
                    </motion.div>
                    <span className={`text-xs font-bold ${isActive ? "text-primary" : isDone ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {labels[i]}
                    </span>
                  </div>
                  {i < 2 && (
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden -mt-6">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: isDone ? "100%" : "0%" }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* المحتوى */}
      <div className="container mx-auto px-4 max-w-4xl pb-20">
        <AnimatePresence mode="wait">

          {/* الخطوة 1: نوع الحجز */}
          {step === "type" && (
            <motion.div key="type" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <h2 className="text-3xl font-black text-center mb-2">{t("reservations.chooseType")}</h2>
              <p className="text-center text-muted-foreground mb-10">اختر الخدمة التي تناسب احتياجاتك</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {TYPES.map((tp, i) => {
                  const Icon = tp.icon;
                  return (
                    <motion.button
                      key={tp.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.12 }}
                      whileHover={{ y: -8 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setSelectedType(tp.id); setStep("country"); }}
                      className={`group relative text-start rounded-3xl overflow-hidden bg-gradient-to-br ${tp.gradient} p-[2px] shadow-xl hover:shadow-2xl ${tp.glow} transition-all duration-500`}
                    >
                      <div className="relative bg-card rounded-[22px] p-7 h-full flex flex-col overflow-hidden">
                        <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full bg-gradient-to-br ${tp.gradient} opacity-10 group-hover:opacity-20 blur-2xl transition-opacity`} />

                        <div className="flex items-start justify-between mb-6 relative">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tp.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                            <Icon className="w-8 h-8 text-white" strokeWidth={2.2} />
                          </div>
                          <span className={`text-xs font-black px-3 py-1.5 rounded-full bg-gradient-to-r ${tp.gradient} text-white shadow-md`}>
                            {tp.tag}
                          </span>
                        </div>

                        <h2 className="text-xl font-black mb-2 group-hover:text-primary transition-colors">{tp.label}</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{tp.desc}</p>

                        <div className={`flex items-center justify-between p-3 rounded-xl bg-gradient-to-r ${tp.gradient} text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-all`}>
                          <span>اختر هذا</span>
                          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* الخطوة 2: اختيار الدولة */}
          {step === "country" && (
            <motion.div key="country" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep("type")} className="p-2.5 rounded-xl hover:bg-muted transition-colors border border-border/50">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black">{t("reservations.chooseDest")}</h2>
                  <p className="text-sm text-muted-foreground">اختر الوجهة التي تحلم بها</p>
                </div>
              </div>

              <div className="relative mb-6">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("reservations.searchCountry")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 rounded-2xl border-2 border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-base shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[520px] overflow-y-auto pr-1 pb-2">
                {filtered.map((c, i) => (
                  <motion.button
                    key={c.code}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    whileHover={{ y: -4, scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setSelectedCountry(c); setStep("form"); }}
                    className="flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border-2 border-border/50 bg-card hover:border-primary hover:bg-gradient-to-br hover:from-primary/5 hover:to-amber-500/5 hover:shadow-lg transition-all text-center group"
                  >
                    <span className="text-4xl group-hover:scale-110 transition-transform">{c.flag}</span>
                    <span className="font-bold text-xs group-hover:text-primary transition-colors line-clamp-2">{c.name}</span>
                  </motion.button>
                ))}
                {filtered.length === 0 && (
                  <p className="col-span-full text-center text-muted-foreground py-10">{t("reservations.noResults")}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* الخطوة 3: تعبئة البيانات */}
          {step === "form" && (
            <motion.div key="form" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep("country")} className="p-2.5 rounded-xl hover:bg-muted transition-colors border border-border/50">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black">{t("reservations.bookingData")}</h2>
                  <p className="text-sm text-muted-foreground">أدخل معلوماتك بدقة لإتمام الحجز</p>
                </div>
              </div>

              {/* ملخص الاختيارات */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-2 bg-gradient-to-r from-primary to-amber-500 text-white px-4 py-2.5 rounded-2xl text-sm font-bold shadow-md">
                  {selectedType === "hotel" ? <Hotel className="w-4 h-4" /> : selectedType === "flight" ? <Plane className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  {TYPES.find(tp => tp.id === selectedType)?.label}
                </div>
                <div className="flex items-center gap-2 bg-card border-2 border-border/50 px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm">
                  <span className="text-lg">{selectedCountry?.flag}</span>
                  {selectedCountry?.name}
                </div>
              </div>

              <div className="bg-card border-2 border-border/50 rounded-3xl p-6 md:p-8 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold mb-2">
                        <User className="w-4 h-4 text-primary" /> {t("reservations.firstName")} *
                      </label>
                      <input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})}
                        placeholder={t("reservations.firstNamePh")} className={inputCls} />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold mb-2">
                        <User className="w-4 h-4 text-primary" /> {t("reservations.lastName")} *
                      </label>
                      <input required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})}
                        placeholder={t("reservations.lastNamePh")} className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-2">
                      <CreditCard className="w-4 h-4 text-primary" /> {t("reservations.passport")} *
                    </label>
                    <input required dir="ltr" value={form.passportNumber}
                      onChange={e => setForm({...form, passportNumber: e.target.value})}
                      placeholder="A 00000000" className={inputCls} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold mb-2">
                        <Calendar className="w-4 h-4 text-primary" /> {t("reservations.departure")} *
                      </label>
                      <input required type="date" dir="ltr" value={form.departureDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={e => setForm({...form, departureDate: e.target.value})}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold mb-2">
                        <Calendar className="w-4 h-4 text-primary" /> {t("reservations.returnDate")} *
                      </label>
                      <input required type="date" dir="ltr" value={form.returnDate}
                        min={form.departureDate || new Date().toISOString().split("T")[0]}
                        onChange={e => setForm({...form, returnDate: e.target.value})}
                        className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-2">
                      <FileText className="w-4 h-4 text-primary" /> {t("reservations.notes")}
                    </label>
                    <textarea rows={3} value={form.notes}
                      onChange={e => setForm({...form, notes: e.target.value})}
                      placeholder={t("reservations.notesPh")}
                      className={`${inputCls} resize-none`} />
                  </div>

                  <Button type="submit" size="lg"
                    className="w-full h-14 text-lg rounded-2xl shadow-xl shadow-primary/30 bg-gradient-to-r from-primary via-amber-500 to-orange-600 hover:opacity-95 font-black"
                    disabled={loading}>
                    {loading ? t("reservations.sending") : `🚀 ${t("reservations.confirm")}`}
                  </Button>
                </form>
              </div>
            </motion.div>
          )}

          {/* النجاح */}
          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
                className="relative w-32 h-32 mx-auto mb-6"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 blur-2xl opacity-50" />
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl">
                  <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
                </div>
              </motion.div>
              <h2 className="text-4xl font-black mb-3 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {t("reservations.successTitle")}
              </h2>
              <p className="text-muted-foreground text-lg mb-2">
                {t("reservations.successThank")} <strong className="text-foreground">{form.firstName} {form.lastName}</strong>!
              </p>
              <p className="text-muted-foreground mb-8">
                {t("reservations.successTeam")}
              </p>
              <div className="bg-gradient-to-br from-primary/5 to-amber-500/5 border-2 border-primary/20 rounded-3xl p-6 max-w-md mx-auto mb-8 text-right shadow-lg">
                <p className="text-sm font-black text-primary mb-4 text-center flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" /> {t("reservations.summary")}
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-border/50 pb-2"><span className="text-muted-foreground">{t("reservations.summaryType")}</span><span className="font-bold">{TYPES.find(tp=>tp.id===selectedType)?.label}</span></div>
                  <div className="flex justify-between border-b border-border/50 pb-2"><span className="text-muted-foreground">{t("reservations.summaryDest")}</span><span className="font-bold">{selectedCountry?.flag} {selectedCountry?.name}</span></div>
                  <div className="flex justify-between border-b border-border/50 pb-2"><span className="text-muted-foreground">{t("reservations.summaryDep")}</span><span className="font-bold">{form.departureDate}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("reservations.summaryRet")}</span><span className="font-bold">{form.returnDate}</span></div>
                </div>
              </div>
              <Button onClick={reset} size="lg" className="rounded-2xl px-10 bg-gradient-to-r from-primary to-amber-500 font-black shadow-xl">
                {t("reservations.newBooking")}
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
