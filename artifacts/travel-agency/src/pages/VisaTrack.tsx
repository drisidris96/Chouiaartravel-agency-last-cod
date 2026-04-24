import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, CheckCircle, XCircle, Clock, Loader2,
  Globe, Calendar, CreditCard, User, FileText, AlertCircle, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";

type TrackRequest = {
  id: number;
  firstName: string;
  lastName: string;
  passportNumber: string;
  destination: string;
  visaType: string | null;
  travelDate: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
};

const STATUS_CONFIG: Record<string, { label: Record<string, string>; color: string; bg: string; icon: any; step: number }> = {
  pending:    { label: { ar: "في الانتظار", fr: "En attente", en: "Pending" },        color: "text-amber-600",  bg: "bg-amber-50 border-amber-200",  icon: Clock,       step: 1 },
  processing: { label: { ar: "قيد المعالجة", fr: "En traitement", en: "Processing" }, color: "text-blue-600",   bg: "bg-blue-50 border-blue-200",    icon: Loader2,     step: 2 },
  approved:   { label: { ar: "مقبول", fr: "Approuvé", en: "Approved" },               color: "text-green-600",  bg: "bg-green-50 border-green-200",  icon: CheckCircle, step: 3 },
  rejected:   { label: { ar: "مرفوض", fr: "Refusé", en: "Rejected" },                color: "text-red-600",    bg: "bg-red-50 border-red-200",      icon: XCircle,     step: 0 },
  cancelled:  { label: { ar: "ملغي", fr: "Annulé", en: "Cancelled" },                color: "text-gray-600",   bg: "bg-gray-50 border-gray-200",    icon: XCircle,     step: 0 },
};

const VISA_LABELS: Record<string, Record<string, string>> = {
  tourism:  { ar: "سياحية", fr: "Tourisme", en: "Tourism" },
  business: { ar: "أعمال", fr: "Affaires", en: "Business" },
  medical:  { ar: "علاجية", fr: "Médical", en: "Medical" },
  transit:  { ar: "عبور", fr: "Transit", en: "Transit" },
  family:   { ar: "زيارة عائلية", fr: "Visite familiale", en: "Family Visit" },
};

const STEPS = [
  { key: "pending",    ar: "استلام الطلب",   fr: "Réception",    en: "Received" },
  { key: "processing", ar: "قيد المعالجة",    fr: "En traitement", en: "Processing" },
  { key: "approved",   ar: "تم القبول",      fr: "Approuvé",      en: "Approved" },
];

export default function VisaTrack() {
  const { t, dir, language } = useLanguage();
  const lang = language as "ar" | "fr" | "en";

  const [passport, setPassport] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TrackRequest[] | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passport.trim() || !phone.trim()) return;
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const res = await fetch(
        `${BASE}/visa-requests/track?passport=${encodeURIComponent(passport.trim())}&phone=${encodeURIComponent(phone.trim())}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "خطأ");
      setResults(data.requests);
    } catch (err: any) {
      setError(err.message || "خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => STATUS_CONFIG[status]?.label[lang] ?? status;
  const getVisaLabel = (type: string | null) => type ? (VISA_LABELS[type]?.[lang] ?? type) : "—";

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString(lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-FR" : "en-GB");
  };

  const inp = "w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm";

  const labels = {
    ar: {
      title: "تتبع طلب التأشيرة",
      subtitle: "أدخل رقم جواز سفرك ورقم هاتفك لمعرفة حالة طلبك",
      passportLabel: "رقم جواز السفر",
      phoneLabel: "رقم الهاتف",
      searchBtn: "بحث عن الطلب",
      searching: "جاري البحث...",
      noResults: "لم يُعثر على أي طلب بهذه البيانات",
      noResultsSub: "تأكد من رقم الجواز ورقم الهاتف المستخدم عند التقديم",
      requestId: "رقم الطلب",
      destination: "الوجهة",
      visaType: "نوع التأشيرة",
      travelDate: "تاريخ السفر",
      submittedOn: "تاريخ الطلب",
      status: "حالة الطلب",
      adminNotes: "ملاحظات الإدارة",
      tryAgain: "بحث جديد",
      timeline: "مراحل المعالجة",
    },
    fr: {
      title: "Suivi de demande de visa",
      subtitle: "Entrez votre numéro de passeport et téléphone pour vérifier l'état de votre demande",
      passportLabel: "Numéro de passeport",
      phoneLabel: "Numéro de téléphone",
      searchBtn: "Rechercher",
      searching: "Recherche...",
      noResults: "Aucune demande trouvée avec ces informations",
      noResultsSub: "Vérifiez le numéro de passeport et le téléphone utilisé lors de la soumission",
      requestId: "N° de demande",
      destination: "Destination",
      visaType: "Type de visa",
      travelDate: "Date de voyage",
      submittedOn: "Date de soumission",
      status: "Statut",
      adminNotes: "Notes de l'administration",
      tryAgain: "Nouvelle recherche",
      timeline: "Étapes de traitement",
    },
    en: {
      title: "Visa Request Tracking",
      subtitle: "Enter your passport number and phone number to check your request status",
      passportLabel: "Passport Number",
      phoneLabel: "Phone Number",
      searchBtn: "Track Request",
      searching: "Searching...",
      noResults: "No request found with this information",
      noResultsSub: "Please verify your passport number and the phone number used during submission",
      requestId: "Request ID",
      destination: "Destination",
      visaType: "Visa Type",
      travelDate: "Travel Date",
      submittedOn: "Submitted On",
      status: "Status",
      adminNotes: "Admin Notes",
      tryAgain: "New Search",
      timeline: "Processing Steps",
    },
  };

  const L = labels[lang] ?? labels.ar;

  return (
    <div className="min-h-[85vh] py-10 px-4" dir={dir}>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl mb-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary" />
        <div className="relative z-10 text-center py-14 px-6 text-primary-foreground">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">{L.title}</h1>
            <p className="text-primary-foreground/80 max-w-md mx-auto text-base">{L.subtitle}</p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto max-w-2xl">
        {/* Search form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg mb-8"
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5">{L.passportLabel}</label>
              <input
                required
                dir="ltr"
                value={passport}
                onChange={e => setPassport(e.target.value)}
                placeholder="A12345678"
                className={inp}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">{L.phoneLabel}</label>
              <input
                required
                type="tel"
                dir="ltr"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+213 ..."
                className={inp}
              />
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl font-bold gap-2" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{L.searching}</> : <><Search className="w-4 h-4" />{L.searchBtn}</>}
            </Button>
          </form>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 mb-6 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        {/* No results */}
        {results !== null && results.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 bg-card border border-border/50 rounded-3xl">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">{L.noResults}</h3>
            <p className="text-muted-foreground text-sm mb-6">{L.noResultsSub}</p>
            <Button variant="outline" className="rounded-xl gap-2" onClick={() => setResults(null)}>
              <RefreshCw className="w-4 h-4" />{L.tryAgain}
            </Button>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {results && results.length > 0 && results.map((req, i) => {
            const cfg = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending;
            const Icon = cfg.icon;
            const currentStep = cfg.step;
            const isRejected = req.status === "rejected" || req.status === "cancelled";

            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border/50 rounded-3xl shadow-lg mb-6 overflow-hidden"
              >
                {/* Status header */}
                <div className={`px-6 py-4 border-b ${cfg.bg} flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg} border ${cfg.bg.split(" ")[1]}`}>
                      <Icon className={`w-5 h-5 ${cfg.color} ${req.status === "processing" ? "animate-spin" : ""}`} />
                    </div>
                    <div>
                      <p className={`font-bold text-base ${cfg.color}`}>{getStatusLabel(req.status)}</p>
                      <p className="text-xs text-muted-foreground">{L.status}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground bg-background/70 px-3 py-1 rounded-full border">
                    #{req.id}
                  </span>
                </div>

                {/* Progress steps */}
                {!isRejected && (
                  <div className="px-6 py-5 border-b border-border/40">
                    <p className="text-xs font-semibold text-muted-foreground mb-4">{L.timeline}</p>
                    <div className="flex items-center gap-0">
                      {STEPS.map((step, idx) => {
                        const stepNum = idx + 1;
                        const isDone = currentStep >= stepNum;
                        const isCurrent = currentStep === stepNum;
                        return (
                          <div key={step.key} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center gap-1">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                                isDone
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "bg-background border-border text-muted-foreground"
                              } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}>
                                {isDone ? <CheckCircle className="w-4 h-4" /> : stepNum}
                              </div>
                              <span className={`text-xs font-medium text-center leading-tight max-w-[60px] ${isDone ? "text-primary" : "text-muted-foreground"}`}>
                                {step[lang] ?? step.ar}
                              </span>
                            </div>
                            {idx < STEPS.length - 1 && (
                              <div className={`flex-1 h-0.5 mx-1 mb-5 ${currentStep > stepNum ? "bg-primary" : "bg-border"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Details */}
                <div className="px-6 py-5 grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{L.requestId}</p>
                      <p className="font-semibold text-sm">{req.firstName} {req.lastName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{L.destination}</p>
                      <p className="font-semibold text-sm">{req.destination}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CreditCard className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{L.visaType}</p>
                      <p className="font-semibold text-sm">{getVisaLabel(req.visaType)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{L.travelDate}</p>
                      <p className="font-semibold text-sm">{formatDate(req.travelDate)}</p>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-start gap-2">
                    <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{L.submittedOn}</p>
                      <p className="font-semibold text-sm">{formatDate(req.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Admin notes */}
                {req.adminNotes && (
                  <div className="mx-6 mb-5 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
                    <p className="text-xs font-semibold text-primary mb-1">{L.adminNotes}</p>
                    <p className="text-sm text-foreground leading-relaxed">{req.adminNotes}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
