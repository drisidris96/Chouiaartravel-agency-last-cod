import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useGetTrips } from "@workspace/api-client-react";
import { TripCard } from "@/components/TripCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe2, ShieldCheck, HeadphonesIcon, FileText, Star, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";

const touristSlides = [
  { src: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?q=80&w=1600&auto=format&fit=crop", label: "مكة المكرمة" },
  { src: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1600&auto=format&fit=crop", label: "إسطنبول" },
  { src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600&auto=format&fit=crop", label: "دبي" },
  { src: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1600&auto=format&fit=crop", label: "باريس" },
  { src: "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?q=80&w=1600&auto=format&fit=crop", label: "الكعبة المشرفة" },
  { src: "https://images.unsplash.com/photo-1489493887464-892be6d1daae?q=80&w=1600&auto=format&fit=crop", label: "المغرب" },
];

export default function Home() {
  const { data: featuredTrips, isLoading } = useGetTrips({ featured: true });
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % touristSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + touristSlides.length) % touristSlides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % touristSlides.length);

  return (
    <div>
      <section className="relative min-h-[85vh] flex flex-col items-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?q=80&w=2000&auto=format&fit=crop" 
            alt="Luxury Travel" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-secondary/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex justify-center mb-6"
            >
              <div className="flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-primary/40 text-white px-6 py-2.5 rounded-full shadow-lg">
                <span className="text-yellow-300 text-lg">✨</span>
                <span className="font-bold text-xl md:text-2xl tracking-wide">ترقّبوا الافتتاح الرسمي للوكالة قريباً</span>
                <span className="text-yellow-300 text-lg">✨</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <img
                src="/images/logo-chouiaar.jpg"
                alt={t("nav.agencyName")}
                className="h-28 md:h-36 w-auto rounded-2xl shadow-2xl border-2 border-white/20"
              />
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-3 leading-tight">
              {t("home.heroTitle")}
            </h1>
            <p className="text-primary text-xl md:text-2xl font-bold mb-5 tracking-wide">
              {t("home.heroSubtitle")}
            </p>
            <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed font-light max-w-2xl mx-auto">
              {t("home.heroDesc")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
              <Link href="/trips">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300">
                  {t("home.trips")}
                </Button>
              </Link>
              <Link href="/umrah">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300">
                  {t("home.umrahPackages")}
                </Button>
              </Link>
              <Link href="/visa-track">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  تتبع طلب التأشيرة
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300">
                  {t("home.contactUs")}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Carousel inside Hero — directly below buttons */}
          <div className="relative w-full mt-16 mb-6 h-[260px] md:h-[340px] rounded-3xl overflow-hidden shadow-2xl">
            {touristSlides.map((slide, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-700 ${i === currentSlide ? "opacity-100" : "opacity-0"}`}
              >
                <img src={slide.src} alt={slide.label} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/50 text-white text-lg font-extrabold px-5 py-1.5 rounded-full backdrop-blur-sm whitespace-nowrap">
                  {slide.label}
                </div>
              </div>
            ))}

            <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/50 backdrop-blur-sm text-white rounded-full p-2.5 transition-all shadow-lg">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/50 backdrop-blur-sm text-white rounded-full p-2.5 transition-all shadow-lg">
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {touristSlides.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all duration-200 ${i === currentSlide ? "bg-primary w-5" : "bg-white/60 w-2"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3 Service Categories */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "🕋",
                title: "الخدمات الدينية والسفر الدولي",
                items: [
                  "تنظيم رحلات العمرة والحج",
                  "حجز تذاكر الطيران الداخلية والدولية",
                  "استخراج التأشيرات السياحية",
                  "معالجة ملفات التأشيرات (EU - أمريكا - كندا - تركيا …)",
                  "إقامة دول الخليج",
                ],
              },
              {
                icon: "🌍",
                title: "الخدمات السياحية والإقامة",
                items: [
                  "تنظيم رحلات سياحية داخل الجزائر وخارجها",
                  "حجز الفنادق والشقق السياحية",
                  "إعداد البرامج السياحية المخصصة (Individual & Group)",
                  "تنظيم رحلات شهر العسل والعروض الخاصة",
                ],
              },
              {
                icon: "🚌",
                title: "الخدمات اللوجستية والمرافقة",
                items: [
                  "خدمات النقل السياحي (حافلات، سيارات مع سائق)",
                  "خدمة الاستقبال والتوديع في المطار",
                  "تأجير السيارات بدون سائق",
                  "تنظيم الرحلات الجماعية للشركات والمؤسسات",
                  "خدمات الإرشاد السياحي (مرشدين محترفين)",
                ],
              },
            ].map((cat, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl">{cat.icon}</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 leading-snug">{cat.title}</h3>
                </div>
                <ul className="space-y-3">
                  {cat.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-base font-bold text-gray-700">
                      <span className="text-primary flex-shrink-0 mt-0.5 font-extrabold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-bold mb-2 block text-sm uppercase tracking-wider">{t("home.servicesLabel")}</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">{t("home.servicesTitle")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { icon: Globe2, label: t("home.svcTrips"), href: "/trips", desc: t("home.svcTripsDesc") },
              { icon: FileText, label: t("home.svcVisas"), href: "/visas", desc: t("home.svcVisasDesc") },
              { icon: Star, label: t("home.svcUmrah"), href: "/umrah", desc: t("home.svcUmrahDesc") },
              { icon: ShieldCheck, label: t("home.svcSafe"), href: "/trips", desc: t("home.svcSafeDesc") },
              { icon: HeadphonesIcon, label: t("home.svcSupport"), href: "/contact", desc: t("home.svcSupportDesc") },
            ].map((item, i) => (
              <Link key={i} href={item.href}>
                <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-card border border-border/50 shadow-sm hover:border-primary/40 hover:shadow-lg hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-base font-bold mb-2">{item.label}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-bold mb-2 block">{t("home.specialOffers")}</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              {t("home.featuredTrips")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {t("home.featuredDesc")}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col space-y-4">
                  <Skeleton className="h-64 rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : featuredTrips && featuredTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              {t("home.noFeatured")}
            </div>
          )}

          <div className="mt-16 text-center">
            <Link href="/trips">
              <Button size="lg" variant="outline" className="h-14 px-10 rounded-full border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300">
                {t("home.viewAll")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
