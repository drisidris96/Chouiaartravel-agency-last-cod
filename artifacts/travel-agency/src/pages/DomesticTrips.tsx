import { useState, useEffect } from "react";
import { useGetTrips } from "@workspace/api-client-react";
import { TripCard } from "@/components/TripCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";

export default function DomesticTrips() {
  const [destination, setDestination] = useState("");
  const [debouncedDestination, setDebouncedDestination] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedDestination(destination), 500);
    return () => clearTimeout(handler);
  }, [destination]);

  const { data: allTrips, isLoading } = useGetTrips({
    destination: debouncedDestination || undefined,
  });

  const trips = allTrips?.filter((t: any) => t.category === "domestic") ?? [];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500 text-white py-20 mb-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/30" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white/20" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MapPin className="w-8 h-8" />
            <span className="text-lg font-medium opacity-90">اكتشف الجزائر</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">الرحلات الداخلية</h1>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            استكشف جمال الجزائر من الشمال إلى الجنوب — رحلات سياحية داخلية بأسعار مميزة
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filter */}
        <aside className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg shadow-black/5 sticky top-28">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">تصفية النتائج</h2>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="destination">الوجهة</Label>
                <div className="relative">
                  <Search className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="destination"
                    placeholder="ابحث عن وجهة..."
                    className="pr-10 rounded-xl bg-muted/50"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Trips Grid */}
        <main className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col space-y-4">
                  <Skeleton className="h-64 rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : trips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {trips.map((trip: any) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-border/50 border-dashed">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <MapPin className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">لا توجد رحلات داخلية متاحة حالياً</h3>
              <p className="text-muted-foreground max-w-sm">
                سيتم إضافة الرحلات الداخلية قريباً — تابعونا
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
