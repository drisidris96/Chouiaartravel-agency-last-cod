import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Building2, CheckCircle, ChevronLeft, ArrowLeft, Sparkles, Search,
  User, CreditCard, Calendar, FileText, Phone, Briefcase, MapPin, Mail, Clock, Users
} from "lucide-react";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";

const GULF_COUNTRIES = [
  { code: "SA", name: "المملكة العربية السعودية", flag: "🇸🇦", desc: "العمل، عائلية، استثمار" },
  { code: "AE", name: "الإمارات العربية المتحدة", flag: "🇦🇪", desc: "العمل، ذهبية، شراكة" },
  { code: "QA", name: "قطر", flag: "🇶🇦", desc: "العمل، عائلية" },
  { code: "KW", name: "الكويت", flag: "🇰🇼", desc: "العمل، عائلية" },
  { code: "BH", name: "البحرين", flag: "🇧🇭", desc: "العمل، استثمار" },
  { code: "OM", name: "سلطنة عُمان", flag: "🇴🇲", desc: "العمل، استثمار" },
];

const RESIDENCY_TYPES = [
  { id: "work", label: "إقامة عمل", icon: Briefcase, desc: "بكفالة صاحب عمل أو شركة", gradient: "from-blue-500 via-blue-600 to-cyan-700" },
  { id: "family", label: "إقامة عائلية", icon: Users, desc: "للزوجة والأبناء بكفالة قريب مقيم", gradient: "from-pink-500 via-rose-600 to-red-600" },
  { id: "investment", label: "إقامة استثمارية", icon: Building2, desc: "للمستثمرين وأصحاب الأعمال", gradient: "from-emerald-500 via-teal-600 to-cyan-700" },
  { id: "study", label: "إقامة دراسية", icon: FileText, desc: "للطلاب الملتحقين بالجامعات", gradient: "from-violet-500 via-purple-600 to-fuchsia-700" },
  { id: "medical", label: "إقامة علاجية", icon: Sparkles, desc: "للعلاج في المستشفيات المعتمدة", gradient: "from-amber-500 via-orange-600 to-red-600" },
  { id: "golden", label: "الإقامة الذهبية", icon: Sparkles, desc: "للموهوبين والمستثمرين الكبار", gradient: "from-yellow-500 via-amber-500 to-orange-600" },
];

type Step = "country" | "type" | "form" | "done";

export default function GulfResidency() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("country");
  const [selectedCountry, setSelectedCountry] = useState<typeof GULF_COUNTRIES[0] | null>(null);
  const [selectedType, setSelectedType] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", birthDate: "", birthPlace: "", profession: "",
    address: "", phone: "", email: "",
    passportNumber: "", passportExpiryDate: "",
    durationYears: "1", sponsorName: "", sponsorContact: "",
    travelDate: "", notes: "",
  });

  const filteredCountries = GULF_COUNTRIES.filter(c => c.name.includes(search));
  const stepIndex = ["country","type","form","done"].indexOf(step);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/residency-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          country: selectedCountry?.name,
          residencyType: selectedType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "حدث خطأ");
      setStep("done");
    } catch (err: any) {
      toast({ variant: "destructive", title: "فشل إرسال الطلب", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("country");
    setSelectedCountry(null);
    setSelectedType("");
    setSearch("");
    setForm({
      firstName: "", lastName: "", birthDate: "", birthPlace: "", profession: "",
      address: "", phone: "", email: "",
      passportNumber: "", passportExpiryDate: "",
      durationYears: "1", sponsorName: "", sponsorContact: "",
      travelDate: "", notes: "",
    });
  };

  const inputCls = "w-full px-4 py-3.5 rounded-2xl border-2 border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* HERO */}
      <section className="relative overflow-hidden pt-16 pb-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl animate-pulse" style={{ animationDelay: "1.2s" }} />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-white/10 backdrop-blur border border-emerald-500/30 px-5 py-2 rounded-full text-sm font-bold mb-6 shadow-lg">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
                إقامة دول الخليج العربي
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 leading-tight">
              إقامة في{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-600 bg-clip-text text-transparent">
                الخليج العربي
              </span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              نقدّم لك خدمة استخراج الإقامة في جميع دول الخليج بمختلف أنواعها
            </p>
          </motion.div>
        </div>
      </section>

      {/* مؤشّر الخطوات */}
      <div className="container mx-auto px-4 max-w-3xl -mt-6 mb-10 relative z-10">
        <div className="bg-card border border-border/50 backdrop-blur rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between gap-2">
            {(["country","type","form"] as Step[]).map((s, i) => {
              const isActive = step === s;
              const isDone = stepIndex > i;
              const labels = ["اختر الدولة", "نوع الإقامة", "البيانات"];
              return (
                <div key={s} className="flex-1 flex items-center gap-2">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <motion.div
                      animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                      transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-base font-black transition-all ${
                        isActive ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/40 scale-110"
                        : isDone ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md"
                        : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isDone ? "✓" : i + 1}
                    </motion.div>
                    <span className={`text-xs font-bold ${isActive ? "text-emerald-600" : isDone ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {labels[i]}
                    </span>
                  </div>
                  {i < 2 && (
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden -mt-6">
                      <motion.div initial={{ width: 0 }} animate={{ width: isDone ? "100%" : "0%" }} className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl pb-20">
        <AnimatePresence mode="wait">
          {/* الخطوة 1: الدولة */}
          {step === "country" && (
            <motion.div key="country" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <h2 className="text-3xl font-black text-center mb-2">اختر دولة الإقامة</h2>
              <p className="text-center text-muted-foreground mb-8">في أي دولة من دول الخليج تريد الإقامة؟</p>

              <div className="relative mb-6 max-w-md mx-auto">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="text" placeholder="ابحث عن دولة..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 rounded-2xl border-2 border-border bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-base shadow-sm" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCountries.map((c, i) => (
                  <motion.button
                    key={c.code}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setSelectedCountry(c); setStep("type"); }}
                    className="group relative text-start rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-amber-600 p-[2px] shadow-xl hover:shadow-2xl hover:shadow-emerald-500/40 transition-all"
                  >
                    <div className="relative bg-card rounded-[22px] p-6 h-full overflow-hidden">
                      <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 opacity-10 group-hover:opacity-20 blur-2xl transition-opacity" />
                      <div className="flex items-center gap-4 mb-3 relative">
                        <span className="text-6xl group-hover:scale-110 transition-transform">{c.flag}</span>
                        <div className="flex-1">
                          <h3 className="font-black text-lg group-hover:text-emerald-600 transition-colors">{c.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-md">
                        <span>اختر هذه الدولة</span>
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* الخطوة 2: نوع الإقامة */}
          {step === "type" && (
            <motion.div key="type" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep("country")} className="p-2.5 rounded-xl hover:bg-muted transition-colors border border-border/50">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black">اختر نوع الإقامة</h2>
                  <p className="text-sm text-muted-foreground">{selectedCountry?.flag} {selectedCountry?.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {RESIDENCY_TYPES.map((tp, i) => {
                  const Icon = tp.icon;
                  return (
                    <motion.button
                      key={tp.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      whileHover={{ y: -6 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setSelectedType(tp.id); setStep("form"); }}
                      className={`group relative text-start rounded-3xl overflow-hidden bg-gradient-to-br ${tp.gradient} p-[2px] shadow-xl hover:shadow-2xl transition-all`}
                    >
                      <div className="relative bg-card rounded-[22px] p-6 h-full flex flex-col overflow-hidden">
                        <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br ${tp.gradient} opacity-10 group-hover:opacity-20 blur-2xl transition-opacity`} />
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tp.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all mb-4`}>
                          <Icon className="w-7 h-7 text-white" strokeWidth={2.2} />
                        </div>
                        <h3 className="font-black text-lg mb-1 group-hover:text-primary transition-colors">{tp.label}</h3>
                        <p className="text-sm text-muted-foreground flex-1">{tp.desc}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* الخطوة 3: النموذج */}
          {step === "form" && (
            <motion.div key="form" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep("type")} className="p-2.5 rounded-xl hover:bg-muted transition-colors border border-border/50">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black">معلومات الطلب</h2>
                  <p className="text-sm text-muted-foreground">أدخل بياناتك الشخصية بدقة</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2.5 rounded-2xl text-sm font-bold shadow-md">
                  <span className="text-lg">{selectedCountry?.flag}</span>{selectedCountry?.name}
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2.5 rounded-2xl text-sm font-bold shadow-md">
                  {RESIDENCY_TYPES.find(t => t.id === selectedType)?.label}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="bg-card border-2 border-border/50 rounded-3xl p-6 md:p-8 shadow-xl space-y-5">
                <h3 className="font-black text-lg flex items-center gap-2 border-b pb-3"><User className="w-5 h-5 text-emerald-600" /> البيانات الشخصية</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold mb-2 block">الاسم *</label>
                    <input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm font-bold mb-2 block">اللقب *</label>
                    <input required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm font-bold mb-2 block flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-600" />تاريخ الميلاد *</label>
                    <input required type="date" dir="ltr" value={form.birthDate} onChange={e => setForm({...form, birthDate: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm font-bold mb-2 block flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-600" />مكان الميلاد *</label>
                    <input required value={form.birthPlace} onChange={e => setForm({...form, birthPlace: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm font-bold mb-2 block flex items-center gap-2"><Briefcase className="w-4 h-4 text-emerald-600" />المهنة *</label>
                    <input required value={form.profession} onChange={e => setForm({...form, profession: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm font-bold mb-2 block flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-600" />الهاتف *</label>
                    <input required dir="ltr" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+213..." className={inputCls} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-bold mb-2 block flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-600" />العنوان *</label>
                    <input required value={form.address} onChange={e => setForm({...form, address: e.target.value})} className={inputCls} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-bold mb-2 block flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-600" />البريد الإلكتروني (اختياري)</label>
                    <input type="email" dir="ltr" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={inputCls} />
                  </div>
                </div>

                <h3 className="font-black text-lg flex items-center gap-2 border-b pb-3 pt-3"><CreditCard className="w-5 h-5 text-emerald-600" /> جواز السفر</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold mb-2 block">رقم الجواز *</label>
                    <input required dir="ltr" value={form.passportNumber} onChange={e => setForm({...form, passportNumber: e.target.value})} placeholder="A 00000000" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm font-bold mb-2 block">تاريخ انتهاء الجواز *</label>
                    <input required type="date" dir="ltr" value={form.passportExpiryDate} onChange={e => setForm({...form, passportExpiryDate: e.target.value})} className={inputCls} />
                  </div>
                </div>

                <h3 className="font-black text-lg flex items-center gap-2 border-b pb-3 pt-3"><Building2 className="w-5 h-5 text-emerald-600" /> تفاصيل الإقامة</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold mb-2 block flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-600" />مدة الإقامة المطلوبة</label>
                    <select value={form.durationYears} onChange={e => setForm({...form, durationYears: e.target.value})} className={inputCls}>
                      <option value="1">سنة واحدة</option>
                      <option value="2">سنتان</option>
                      <option value="3">3 سنوات</option>
                      <option value="5">5 سنوات</option>
                      <option value="10">10 سنوات</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold mb-2 block">تاريخ السفر التقريبي</label>
                    <input type="date" dir="ltr" value={form.travelDate} onChange={e => setForm({...form, travelDate: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm font-bold mb-2 block">اسم الكفيل / الشركة (إن وُجد)</label>
                    <input value={form.sponsorName} onChange={e => setForm({...form, sponsorName: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-sm font-bold mb-2 block">معلومات الاتصال بالكفيل</label>
                    <input value={form.sponsorContact} onChange={e => setForm({...form, sponsorContact: e.target.value})} placeholder="هاتف أو بريد" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold mb-2 block flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-600" />ملاحظات إضافية</label>
                  <textarea rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className={`${inputCls} resize-none`} placeholder="أي معلومات إضافية تريد إخبارنا بها..." />
                </div>

                <Button type="submit" size="lg"
                  className="w-full h-14 text-lg rounded-2xl shadow-xl shadow-emerald-500/30 bg-gradient-to-r from-emerald-500 via-teal-600 to-amber-600 hover:opacity-95 font-black"
                  disabled={loading}>
                  {loading ? "جاري الإرسال..." : "🚀 إرسال طلب الإقامة"}
                </Button>
              </form>
            </motion.div>
          )}

          {/* النجاح */}
          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 12 }} className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 blur-2xl opacity-50" />
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl">
                  <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
                </div>
              </motion.div>
              <h2 className="text-4xl font-black mb-3 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">تم استلام طلبك بنجاح!</h2>
              <p className="text-muted-foreground text-lg mb-2">شكراً <strong className="text-foreground">{form.firstName} {form.lastName}</strong>!</p>
              <p className="text-muted-foreground mb-8">سيتواصل معك فريقنا قريباً لتأكيد التفاصيل وإكمال الإجراءات.</p>
              <div className="bg-gradient-to-br from-emerald-500/5 to-amber-500/5 border-2 border-emerald-500/20 rounded-3xl p-6 max-w-md mx-auto mb-8 text-right shadow-lg">
                <p className="text-sm font-black text-emerald-600 mb-4 text-center flex items-center justify-center gap-2"><Sparkles className="w-4 h-4" /> ملخّص الطلب</p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-border/50 pb-2"><span className="text-muted-foreground">الدولة</span><span className="font-bold">{selectedCountry?.flag} {selectedCountry?.name}</span></div>
                  <div className="flex justify-between border-b border-border/50 pb-2"><span className="text-muted-foreground">نوع الإقامة</span><span className="font-bold">{RESIDENCY_TYPES.find(t => t.id === selectedType)?.label}</span></div>
                  <div className="flex justify-between border-b border-border/50 pb-2"><span className="text-muted-foreground">المدة</span><span className="font-bold">{form.durationYears} سنة</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">رقم الجواز</span><span className="font-bold" dir="ltr">{form.passportNumber}</span></div>
                </div>
              </div>
              <Button onClick={reset} size="lg" className="rounded-2xl px-10 bg-gradient-to-r from-emerald-500 to-teal-600 font-black shadow-xl">طلب جديد</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
