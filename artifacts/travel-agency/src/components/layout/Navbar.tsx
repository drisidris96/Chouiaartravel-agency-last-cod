import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  LogOut, LayoutDashboard, Home, FileText, Star, CalendarCheck, Phone,
  Sparkles, User, LogIn, UserPlus, Map, ChevronDown, Menu, X
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { ServiceRequestModal } from "@/components/ServiceRequestModal";
import { useToast } from "@/hooks/use-toast";
import { useLanguage, LanguageSwitcher } from "@/i18n/LanguageContext";
import { ClockBar } from "./ClockBar";
import { NotificationBell } from "@/components/NotificationBell";
import { CurrencyConverter } from "@/components/CurrencyConverter";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => { setMobileOpen(false); setProfileOpen(false); }, [location]);

  const requireAuth = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      toast({ variant: "destructive", title: t("nav.mustLogin"), description: t("nav.mustLoginDesc") });
      setLocation("/login");
    }
  };

  const links = [
    { href: "/",                 label: t("nav.home"),         icon: Home,          color: "from-sky-500 to-blue-600" },
    { href: "/visas",            label: "التأشيرات",           icon: FileText,      color: "from-emerald-500 to-teal-600" },
    { href: "/umrah",            label: t("nav.umrah"),        icon: Star,          color: "from-amber-500 to-orange-600" },
    { href: "/domestic-trips",   label: "الرحلات الداخلية",   icon: Map,           color: "from-rose-500 to-pink-600" },
    { href: "/reservations",     label: t("nav.reservations"), icon: CalendarCheck, color: "from-violet-500 to-purple-600" },
    { href: "/contact",          label: t("nav.contact"),      icon: Phone,         color: "from-cyan-500 to-blue-600" },
  ];

  const isActive = (href: string) => href === "/visas" ? location.startsWith("/visas") : location === href;

  const goTo = (href: string) => {
    if (!user) {
      toast({ variant: "destructive", title: t("nav.mustLogin"), description: t("nav.mustLoginDesc") });
      setLocation("/login");
      return;
    }
    setLocation(href);
  };

  return (
    <>
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? "shadow-2xl shadow-primary/5" : "shadow-md"}`}>
        <ClockBar />

        {/* الشريط العلوي — Logo + أدوات */}
        <div className={`relative transition-all duration-300 ${
          scrolled
            ? "bg-background/85 backdrop-blur-xl border-b border-border/40"
            : "bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-md border-b border-border/30"
        }`}>
          {/* تأثير ضوء خفيف */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
            <div className="absolute top-0 right-1/4 w-72 h-32 bg-primary/10 blur-3xl rounded-full" />
            <div className="absolute top-0 left-1/4 w-72 h-32 bg-blue-500/10 blur-3xl rounded-full" />
          </div>

          <div className="relative w-full px-3 sm:px-5 h-[72px] flex items-center justify-between gap-2 sm:gap-4">

            {/* الشعار + الاسم */}
            <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-primary via-amber-500 to-orange-500 rounded-2xl opacity-60 group-hover:opacity-100 blur-md transition-opacity duration-500" />
                <img
                  src="/images/logo-chouiaar.jpg"
                  alt={t("nav.agencyName")}
                  className="relative h-12 w-12 md:h-14 md:w-14 rounded-2xl object-cover border-2 border-white dark:border-white/20 group-hover:scale-105 transition-transform duration-300 shadow-lg"
                />
              </div>
              <div className="hidden sm:flex flex-col leading-tight items-start">
                <span
                  className="text-lg md:text-2xl font-extrabold bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent"
                  style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}
                >
                  {t("nav.agencyName")}
                </span>
                <span
                  className="text-[10px] md:text-xs font-semibold text-muted-foreground/70 tracking-[0.2em] uppercase"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {t("nav.agencyNameEn")}
                </span>
              </div>
            </Link>

            {/* الأدوات (يمين في RTL ← يسار في الـ DOM) */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <div className="hidden md:flex items-center gap-1.5">
                <CurrencyConverter />
                <LanguageSwitcher />
              </div>

              {user ? (
                <>
                  <NotificationBell isAdmin={user.role === "admin"} />

                  {user.role === "admin" && (
                    <Link href="/admin">
                      <button className={`hidden sm:flex items-center gap-1.5 h-10 px-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                        location.startsWith("/admin")
                          ? "bg-gradient-to-r from-primary to-amber-500 text-white shadow-lg shadow-primary/30"
                          : "bg-muted/60 hover:bg-primary/10 hover:text-primary border border-border/50"
                      }`}>
                        <LayoutDashboard className="w-4 h-4" />
                        <span>{t("nav.dashboard")}</span>
                      </button>
                    </Link>
                  )}

                  {/* قائمة الحساب المنسدلة */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2 h-10 ps-1 pe-3 rounded-2xl bg-gradient-to-r from-muted/80 to-muted/40 hover:from-primary/15 hover:to-primary/5 transition-all duration-300 border border-border/50 hover:border-primary/40 group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white shadow-md">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="hidden sm:inline text-sm font-bold">حسابي</span>
                      <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-muted-foreground transition-transform duration-300 ${profileOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {profileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute end-0 mt-2 w-64 bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden z-50"
                        >
                          <div className="p-4 bg-gradient-to-br from-primary/10 via-transparent to-amber-500/10 border-b border-border/50">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white shadow-md">
                                <User className="w-6 h-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-black text-sm truncate">{(user as any)?.firstName || (user as any)?.name || "المستخدم"}</div>
                                <div className="text-xs text-muted-foreground truncate">{(user as any)?.email || ""}</div>
                              </div>
                            </div>
                          </div>
                          <div className="p-2">
                            <Link href="/profile">
                              <button className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-primary/10 transition-colors text-sm font-semibold">
                                <User className="w-4 h-4 text-primary" />
                                <span>الملف الشخصي</span>
                              </button>
                            </Link>
                            <div className="md:hidden border-t border-border/50 my-2 pt-2">
                              <div className="flex items-center justify-between px-2 py-1">
                                <CurrencyConverter />
                                <LanguageSwitcher />
                              </div>
                            </div>
                            <button
                              onClick={() => { setProfileOpen(false); logout(); }}
                              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-destructive/10 text-destructive transition-colors text-sm font-semibold mt-1"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>تسجيل الخروج</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <button className="hidden sm:flex items-center gap-1.5 h-10 px-3.5 rounded-2xl text-sm font-bold border border-border/60 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all duration-200">
                      <LogIn className="w-4 h-4" />
                      <span>{t("nav.login")}</span>
                    </button>
                  </Link>
                  <Link href="/login?tab=register">
                    <button className="flex items-center gap-1.5 h-10 px-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-primary to-amber-500 text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-200">
                      <UserPlus className="w-4 h-4" />
                      <span className="hidden sm:inline">{t("nav.register")}</span>
                    </button>
                  </Link>
                </>
              )}

              {/* زر القائمة للجوال */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-2xl bg-muted/60 hover:bg-primary/10 hover:text-primary border border-border/50 transition-all"
                aria-label="menu"
              >
                <AnimatePresence mode="wait">
                  {mobileOpen ? (
                    <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* شريط الروابط — للشاشات الكبيرة */}
        <div className="hidden lg:block bg-card/60 backdrop-blur-xl border-b border-border/40 relative">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-1 py-2">
              {links.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <button
                    key={link.href}
                    onClick={() => goTo(link.href)}
                    className={`relative group flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                      active ? "text-primary" : "text-foreground/70 hover:text-primary"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="navHighlight"
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${link.color} opacity-15 border border-primary/30`}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon className={`w-4 h-4 transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`} />
                      {link.label}
                    </span>
                    {active && (
                      <motion.span
                        layoutId="navUnderline"
                        className={`absolute -bottom-2 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-gradient-to-r ${link.color} shadow-md`}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}

              {/* خدمات أخرى */}
              <button
                onClick={(e) => { if (!user) { requireAuth(e); return; } setModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 text-white shadow-md shadow-fuchsia-500/30 hover:shadow-lg hover:shadow-fuchsia-500/40 hover:scale-105 transition-all duration-300 ms-2"
              >
                <Sparkles className="w-4 h-4" />
                {t("nav.otherServices")}
              </button>
            </div>
          </div>
        </div>

        {/* القائمة المنسدلة للجوال */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden bg-card/95 backdrop-blur-xl border-b border-border/40 overflow-hidden"
            >
              <div className="p-3 grid grid-cols-2 gap-2">
                {links.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <button
                      key={link.href}
                      onClick={() => goTo(link.href)}
                      className={`flex items-center gap-2 px-3 py-3 rounded-2xl text-sm font-bold transition-all duration-200 border ${
                        active
                          ? `bg-gradient-to-r ${link.color} text-white border-transparent shadow-md`
                          : "bg-muted/40 text-foreground border-border/50 hover:border-primary/40"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{link.label}</span>
                    </button>
                  );
                })}

                <button
                  onClick={(e) => { if (!user) { requireAuth(e); return; } setModalOpen(true); }}
                  className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 text-white shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  {t("nav.otherServices")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <ServiceRequestModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
