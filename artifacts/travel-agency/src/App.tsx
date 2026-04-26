import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { LanguageProvider, useLanguage } from "@/i18n/LanguageContext";
import { CurrencyProvider } from "@/i18n/CurrencyContext";

// Layouts
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Pages
import Home from "@/pages/Home";
import Trips from "@/pages/Trips";
import TripDetails from "@/pages/TripDetails";
import Login from "@/pages/Login";
import VisasHub from "@/pages/VisasHub";
import Visas from "@/pages/Visas";
import VisasRegular from "@/pages/VisasRegular";
import VisasAppointments from "@/pages/VisasAppointments";
import Umrah from "@/pages/Umrah";
import DomesticTrips from "@/pages/DomesticTrips";
import Contact from "@/pages/Contact";
import Reservations from "@/pages/Reservations";
import AdminDashboard from "@/pages/admin/Dashboard";
import ManageTrips from "@/pages/admin/ManageTrips";
import ManageBookings from "@/pages/admin/ManageBookings";
import ManageReservations from "@/pages/admin/ManageReservations";
import ManageServiceRequests from "@/pages/admin/ManageServiceRequests";
import ManageVisaRequests from "@/pages/admin/ManageVisaRequests";
import ManageResidencyRequests from "@/pages/admin/ManageResidencyRequests";
import GulfResidency from "@/pages/GulfResidency";
import ManageSupportMessages from "@/pages/admin/ManageSupportMessages";
import ManageAnnouncements from "@/pages/admin/ManageAnnouncements";
import Profile from "@/pages/Profile";
import Support from "@/pages/Support";
import VisaTrack from "@/pages/VisaTrack";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function UserRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isLoading && !user) setLocation("/login");
  }, [user, isLoading, setLocation]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">{t("common.loading")}</div>;
  if (!user) return null;

  return <Component />;
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) setLocation("/login");
  }, [user, isLoading, setLocation]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">{t("common.loading")}</div>;
  if (!user || user.role !== "admin") return null;

  return <Component />;
}

const adminTabsMap = {
  ar: [
    { path: "/admin", label: "نظرة عامة" },
    { path: "/admin/trips", label: "🗂️ إضافة الباقات والرحلات" },
    { path: "/admin/bookings", label: "🎫 طلبات حجز الرحلات" },
    { path: "/admin/reservations", label: "🏨 طلبات الإقامة والطيران" },
    { path: "/admin/visas", label: "🌍 طلبات الفيزا" },
    { path: "/admin/residency", label: "🏛️ طلبات الإقامة الخليجية" },
    { path: "/admin/services", label: "✨ خدمات أخرى" },
    { path: "/admin/support", label: "📩 رسائل الدعم" },
    { path: "/admin/announcements", label: "📢 الإعلانات" },
  ],
  fr: [
    { path: "/admin", label: "Aperçu" },
    { path: "/admin/trips", label: "🗂️ Gérer les forfaits" },
    { path: "/admin/bookings", label: "🎫 Réservations de voyages" },
    { path: "/admin/reservations", label: "🏨 Demandes d'hébergement et vols" },
    { path: "/admin/visas", label: "🌍 Demandes de visa" },
    { path: "/admin/residency", label: "🏛️ Résidence Golfe" },
    { path: "/admin/services", label: "✨ Autres services" },
    { path: "/admin/support", label: "📩 Messages de support" },
    { path: "/admin/announcements", label: "📢 Annonces" },
  ],
  en: [
    { path: "/admin", label: "Overview" },
    { path: "/admin/trips", label: "🗂️ Manage Packages" },
    { path: "/admin/bookings", label: "🎫 Trip Booking Requests" },
    { path: "/admin/reservations", label: "🏨 Hotel & Flight Requests" },
    { path: "/admin/visas", label: "🌍 Visa Requests" },
    { path: "/admin/residency", label: "🏛️ Gulf Residency" },
    { path: "/admin/services", label: "✨ Other Services" },
    { path: "/admin/support", label: "📩 Support Messages" },
    { path: "/admin/announcements", label: "📢 Announcements" },
  ],
};

const BASE_API = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";

type PendingCounts = { reservations: number; visas: number; services: number; bookings: number; support: number; residency: number };

function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { lang } = useLanguage();
  const [counts, setCounts] = useState<PendingCounts>({ reservations: 0, visas: 0, services: 0, bookings: 0, support: 0, residency: 0 });

  const fetchResidencyCount = async () => {
    try {
      const r = await fetch(`${BASE_API}/residency-requests/pending-count`, { credentials: "include" });
      if (r.ok) {
        const d = await r.json();
        setCounts((c) => ({ ...c, residency: d.count || 0 }));
      }
    } catch {}
  };

  useEffect(() => {
    fetch(`${BASE_API}/admin/pending-counts`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setCounts((c) => ({ ...c, ...data })); })
      .catch(() => {});
    fetchResidencyCount();

    const interval = setInterval(() => {
      fetch(`${BASE_API}/admin/pending-counts`, { credentials: "include" })
        .then((r) => r.ok ? r.json() : null)
        .then((data) => { if (data) setCounts((c) => ({ ...c, ...data })); })
        .catch(() => {});
      fetchResidencyCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const badgeMap: Record<string, number> = {
    "/admin/reservations": counts.reservations,
    "/admin/visas": counts.visas,
    "/admin/residency": counts.residency,
    "/admin/services": counts.services,
    "/admin/bookings": counts.bookings,
    "/admin/support": counts.support,
  };

  const tabs = adminTabsMap[lang] || adminTabsMap.ar;

  return (
    <div className="container mx-auto px-4 py-10 flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm sticky top-28">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const badge = badgeMap[tab.path] ?? 0;
              return (
                <button
                  key={tab.path}
                  onClick={() => setLocation(tab.path)}
                  className={`w-full text-start px-4 py-3 rounded-xl transition-all flex items-center justify-between gap-2 ${
                    location === tab.path
                      ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span>{tab.label}</span>
                  {badge > 0 && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center ${
                      location === tab.path
                        ? "bg-white text-primary"
                        : "bg-red-500 text-white"
                    }`}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </aside>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Switch>
          {/* Login — public */}
          <Route path="/login" component={Login} />

          {/* Support — public (accessible without login) */}
          <Route path="/support" component={Support} />

          {/* Visa Track — requires login */}
          <Route path="/visa-track">{() => <UserRoute component={VisaTrack} />}</Route>

          {/* Protected Routes — require login */}
          <Route path="/">{() => <UserRoute component={Home} />}</Route>
          <Route path="/trips">{() => <UserRoute component={Trips} />}</Route>
          <Route path="/trips/:id">{() => <UserRoute component={TripDetails} />}</Route>
          <Route path="/visas">{() => <UserRoute component={VisasHub} />}</Route>
          <Route path="/visas/electronic">{() => <UserRoute component={Visas} />}</Route>
          <Route path="/visas/regular">{() => <UserRoute component={VisasRegular} />}</Route>
          <Route path="/visas/appointments">{() => <UserRoute component={VisasAppointments} />}</Route>
          <Route path="/visas/gulf-residency">{() => <UserRoute component={GulfResidency} />}</Route>
          <Route path="/umrah">{() => <UserRoute component={Umrah} />}</Route>
          <Route path="/domestic-trips">{() => <UserRoute component={DomesticTrips} />}</Route>
          <Route path="/contact">{() => <UserRoute component={Contact} />}</Route>
          <Route path="/reservations">{() => <UserRoute component={Reservations} />}</Route>
          <Route path="/profile">{() => <UserRoute component={Profile} />}</Route>

          {/* Admin Routes */}
          <Route path="/admin">
            {() => (
              <ProtectedRoute component={() => (
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              )} />
            )}
          </Route>
          <Route path="/admin/trips">
            {() => (
              <ProtectedRoute component={() => (
                <AdminLayout>
                  <ManageTrips />
                </AdminLayout>
              )} />
            )}
          </Route>
          <Route path="/admin/bookings">
            {() => (
              <ProtectedRoute component={() => (
                <AdminLayout>
                  <ManageBookings />
                </AdminLayout>
              )} />
            )}
          </Route>
          <Route path="/admin/reservations">
            {() => (
              <ProtectedRoute component={() => (
                <AdminLayout>
                  <ManageReservations />
                </AdminLayout>
              )} />
            )}
          </Route>
          <Route path="/admin/visas">
            {() => (
              <ProtectedRoute component={() => (
                <AdminLayout>
                  <ManageVisaRequests />
                </AdminLayout>
              )} />
            )}
          </Route>
          <Route path="/admin/residency">
            {() => (
              <ProtectedRoute component={() => (
                <AdminLayout>
                  <ManageResidencyRequests />
                </AdminLayout>
              )} />
            )}
          </Route>
          <Route path="/admin/services">
            {() => (
              <ProtectedRoute component={() => (
                <AdminLayout>
                  <ManageServiceRequests />
                </AdminLayout>
              )} />
            )}
          </Route>
          <Route path="/admin/support">
            {() => (
              <ProtectedRoute component={() => (
                <AdminLayout>
                  <ManageSupportMessages />
                </AdminLayout>
              )} />
            )}
          </Route>
          <Route path="/admin/announcements">
            {() => (
              <ProtectedRoute component={() => (
                <AdminLayout>
                  <ManageAnnouncements />
                </AdminLayout>
              )} />
            )}
          </Route>

          {/* Fallback */}
          <Route component={NotFound} />
        </Switch>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function DirectionWrapper({ children }: { children: React.ReactNode }) {
  const { dir } = useLanguage();
  return (
    <div dir={dir} className="antialiased selection:bg-primary/20 selection:text-primary">
      {children}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <LanguageProvider>
            <CurrencyProvider>
              <AuthProvider>
                <DirectionWrapper>
                  <Router />
                </DirectionWrapper>
              </AuthProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
