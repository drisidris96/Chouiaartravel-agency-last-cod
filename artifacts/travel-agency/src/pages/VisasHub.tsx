import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Globe, FileText, CalendarClock, Search, ArrowLeft, Sparkles, ShieldCheck, Clock4, CheckCircle2, Building2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function VisasHub() {
  const [, setLocation] = useLocation();
  const { lang, dir } = useLanguage();

  const cards = [
    {
      icon: Globe,
      title: "التأشيرات الإلكترونية",
      subtitle: "بدون زيارة السفارة",
      desc: "تقديم الطلب أونلاين 100%، استلام التأشيرة على بريدك الإلكتروني خلال أيام",
      tags: ["آسيا", "إفريقيا", "الأمريكتان", "أوقيانوسيا"],
      gradient: "from-cyan-500 via-blue-600 to-indigo-700",
      glow: "group-hover:shadow-blue-500/50",
      iconBg: "bg-white/20",
      badgeText: "E-Visa",
      href: "/visas/electronic",
      stat: "+50",
      statLabel: "دولة متاحة",
    },
    {
      icon: FileText,
      title: "التأشيرات العادية",
      subtitle: "تقديم الملف لدى السفارة",
      desc: "نتولى تجهيز ملفك بالكامل ومتابعته لدى القنصلية حتى الحصول على التأشيرة",
      tags: ["أوروبا", "أمريكا", "آسيا", "غيرها"],
      gradient: "from-amber-500 via-orange-600 to-red-600",
      glow: "group-hover:shadow-orange-500/50",
      iconBg: "bg-white/20",
      badgeText: "Embassy",
      href: "/visas/regular",
      stat: "+30",
      statLabel: "دولة مدعومة",
    },
    {
      icon: CalendarClock,
      title: "حجز مواعيد الفيزا",
      subtitle: "RDV فوري وسريع",
      desc: "حجز مواعيد السفارات بسرعة وضمان أقرب التواريخ المتاحة لجميع الوجهات",
      tags: ["شنغن", "أمريكا", "كندا", "بريطانيا"],
      gradient: "from-violet-500 via-purple-600 to-fuchsia-700",
      glow: "group-hover:shadow-purple-500/50",
      iconBg: "bg-white/20",
      badgeText: "RDV",
      href: "/visas/appointments",
      stat: "24h",
      statLabel: "متوسط الحجز",
    },
    {
      icon: Building2,
      title: "إقامة دول الخليج",
      subtitle: "إقامة في السعودية، الإمارات، قطر...",
      desc: "نوفّر خدمة استخراج الإقامة في جميع دول الخليج: عمل، عائلية، استثمار، دراسة وغيرها",
      tags: ["السعودية", "الإمارات", "قطر", "الكويت", "البحرين", "عُمان"],
      gradient: "from-emerald-500 via-teal-600 to-amber-600",
      glow: "group-hover:shadow-emerald-500/50",
      iconBg: "bg-white/20",
      badgeText: "Residency",
      href: "/visas/gulf-residency",
      stat: "6",
      statLabel: "دول الخليج",
    },
  ];

  const features = [
    { icon: ShieldCheck, label: "خبرة موثوقة", value: "+10 سنوات" },
    { icon: CheckCircle2, label: "نسبة نجاح", value: "+95%" },
    { icon: Clock4, label: "متابعة", value: "24/7" },
    { icon: Sparkles, label: "ملفات معالجة", value: "+5000" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* HERO حديث مع خلفية تفاعلية */}
      <section className="relative overflow-hidden pt-16 pb-24">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <div className="container mx-auto px-4 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-white/10 backdrop-blur border border-primary/20 px-5 py-2 rounded-full text-sm font-bold mb-6 shadow-lg">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">خدمات التأشيرات الاحترافية</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 leading-tight">
              بوابة <span className="bg-gradient-to-r from-primary via-amber-500 to-orange-600 bg-clip-text text-transparent">التأشيرات</span>
              <br />
              <span className="text-3xl md:text-4xl text-muted-foreground font-bold">إلى جميع دول العالم</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10">
              اختر الخدمة المناسبة — تأشيرات إلكترونية، عادية، حجز مواعيد، أو إقامة دول الخليج
            </p>

            {/* شريط الإحصائيات */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
            >
              {features.map((f, i) => {
                const Ic = f.icon;
                return (
                  <motion.div
                    key={i}
                    whileHover={{ y: -4 }}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur border border-border/50 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Ic className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-xl font-black text-primary">{f.value}</div>
                    <div className="text-xs text-muted-foreground font-medium">{f.label}</div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* البطاقات الرئيسية الحديثة */}
      <div className="container mx-auto px-4 -mt-10 relative z-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.href}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLocation(card.href)}
                className={`group relative text-start rounded-3xl overflow-hidden bg-gradient-to-br ${card.gradient} p-[2px] shadow-xl hover:shadow-2xl ${card.glow} transition-all duration-500`}
              >
                {/* المحتوى الداخلي */}
                <div className="relative bg-card rounded-[22px] p-7 h-full flex flex-col overflow-hidden">
                  {/* تأثير الضوء عند المرور */}
                  <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 group-hover:opacity-20 blur-2xl transition-opacity`} />

                  {/* الرأس: أيقونة + شارة */}
                  <div className="flex items-start justify-between mb-6 relative">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" strokeWidth={2.2} />
                    </div>
                    <span className={`text-xs font-black px-3 py-1.5 rounded-full bg-gradient-to-r ${card.gradient} text-white shadow-md`}>
                      {card.badgeText}
                    </span>
                  </div>

                  {/* الإحصائية */}
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className={`text-3xl font-black bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                      {card.stat}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">{card.statLabel}</span>
                  </div>

                  {/* العنوان والوصف */}
                  <h2 className="text-xl font-black mb-1 group-hover:text-primary transition-colors">{card.title}</h2>
                  <p className="text-sm font-bold text-muted-foreground mb-3">{card.subtitle}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{card.desc}</p>

                  {/* وسوم الدول */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {card.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-bold px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* زر الإجراء */}
                  <div className={`flex items-center justify-between p-3 rounded-xl bg-gradient-to-r ${card.gradient} text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-all`}>
                    <span>اضغط للبدء</span>
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* بطاقة متابعة الطلب — تصميم بانر كبير حديث */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-6xl mx-auto mt-8"
        >
          <Link href="/visa-track">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.995 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 cursor-pointer group shadow-2xl"
              dir={dir}
            >
              {/* خلفية ديكور */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -top-20 left-10 w-72 h-72 rounded-full bg-primary blur-3xl" />
                <div className="absolute -bottom-20 right-10 w-72 h-72 rounded-full bg-blue-500 blur-3xl" />
              </div>
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:20px_20px]" />

              <div className="relative flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center flex-shrink-0 shadow-xl group-hover:rotate-6 transition-transform">
                  <Search className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1 text-center md:text-start">
                  <div className="inline-block bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full mb-2">
                    {lang === "ar" ? "🔔 خدمة المتابعة" : lang === "fr" ? "🔔 Suivi" : "🔔 Tracking"}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                    {lang === "ar" ? "تابع حالة طلب التأشيرة" : lang === "fr" ? "Suivez votre demande de visa" : "Track Your Visa Request"}
                  </h2>
                  <p className="text-sm md:text-base text-white/70">
                    {lang === "ar" ? "هل قدّمت طلباً سابقاً؟ تحقق من حالته فوراً برقم جواز سفرك ورقم هاتفك" : lang === "fr" ? "Vérifiez l'état de votre demande avec votre passeport" : "Check your request status with your passport and phone"}
                  </p>
                </div>
                <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-bold shadow-lg group-hover:shadow-2xl group-hover:bg-primary group-hover:text-white transition-all">
                  <span>{lang === "ar" ? "تحقّق الآن" : lang === "fr" ? "Vérifier" : "Check Now"}</span>
                  <ArrowLeft className={`w-5 h-5 group-hover:-translate-x-1 transition-transform ${dir === "ltr" ? "rotate-180" : ""}`} />
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
