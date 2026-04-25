import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Trash2, RefreshCw, User, Phone, Mail, Users, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useCurrency } from "@/i18n/CurrencyContext";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";

type BookingStatus = "pending" | "confirmed" | "cancelled";

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending:   { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  confirmed: { label: "مؤكد",         color: "bg-green-100 text-green-700 border-green-200",   icon: CheckCircle },
  cancelled: { label: "ملغي",         color: "bg-red-100 text-red-700 border-red-200",         icon: XCircle },
};

export default function ManageBookings() {
  const { data: bookings, isLoading, refetch } = useQuery<any[]>({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/admin/bookings`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const updateStatus = async (id: number, status: BookingStatus, reason?: string) => {
    try {
      await fetch(`${BASE}/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, rejectionReason: reason ?? null }),
      });
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast({
        title: status === "confirmed" ? "✅ تم تأكيد الحجز"
             : status === "cancelled" ? "❌ تم إلغاء الحجز"
             : "🔄 تم إعادة تفعيل الحجز",
      });
    } catch {
      toast({ variant: "destructive", title: "فشل تحديث الحالة" });
    }
  };

  const handleConfirm = (id: number) => updateStatus(id, "confirmed");

  const handleCancel = (id: number) => {
    setPendingCancelId(id);
    setRejectionReason("");
    setCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (!pendingCancelId) return;
    setCancelling(true);
    await updateStatus(pendingCancelId, "cancelled", rejectionReason.trim() || undefined);
    setCancelling(false);
    setCancelDialogOpen(false);
    setPendingCancelId(null);
    setRejectionReason("");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الحجز نهائياً؟")) return;
    try {
      const res = await fetch(`${BASE}/bookings/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
        toast({ title: "تم حذف الحجز" });
      } else {
        toast({ variant: "destructive", title: "فشل الحذف" });
      }
    } catch {
      toast({ variant: "destructive", title: "خطأ في الاتصال" });
    }
  };

  const allBookings = (bookings ?? []) as any[];
  const filtered = filter === "all" ? allBookings : allBookings.filter((b) => b.status === filter);

  const counts = {
    all: allBookings.length,
    pending: allBookings.filter((b) => b.status === "pending").length,
    confirmed: allBookings.filter((b) => b.status === "confirmed").length,
    cancelled: allBookings.filter((b) => b.status === "cancelled").length,
  };

  const tabs: { key: "all" | BookingStatus; label: string; count: number }[] = [
    { key: "all",       label: "الكل",          count: counts.all },
    { key: "pending",   label: "قيد الانتظار",  count: counts.pending },
    { key: "confirmed", label: "مؤكدة",         count: counts.confirmed },
    { key: "cancelled", label: "ملغاة",         count: counts.cancelled },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة الحجوزات</h1>
          <p className="text-muted-foreground text-sm">{counts.pending} حجز ينتظر المراجعة</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4" /> تحديث
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              filter === t.key
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-card border-border/50 text-muted-foreground hover:border-primary/40"
            }`}>
            {t.label}
            <span className={`mr-1.5 px-1.5 py-0.5 rounded-full text-xs ${filter === t.key ? "bg-white/20" : "bg-muted"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 animate-spin text-primary ml-2" />
          <span className="text-muted-foreground">جاري التحميل...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border/50 rounded-3xl">
          <p className="text-4xl mb-3">🎫</p>
          <p className="text-muted-foreground font-medium">لا توجد حجوزات</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((booking: any) => {
            const cfg = STATUS_CONFIG[booking.status as BookingStatus] ?? STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            return (
              <div key={booking.id} className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-2 bg-gradient-to-l from-primary to-primary/60" />
                <div className="p-5 space-y-4">

                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">#{booking.id} · {format(new Date(booking.createdAt), "dd MMM yyyy")}</p>
                      <p className="font-bold text-base mt-0.5 line-clamp-1">{booking.trip?.title || `رحلة #${booking.tripId}`}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${cfg.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Guest info */}
                  <div className="bg-muted/40 rounded-2xl p-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="font-semibold">{booking.guestName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span dir="ltr">{booking.guestPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span dir="ltr" className="truncate">{booking.guestEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span>{booking.numberOfPeople} أشخاص</span>
                      <span className="font-bold text-primary mr-auto">{formatPrice(booking.totalPrice)}</span>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 text-sm text-yellow-800">
                      💬 {booking.specialRequests}
                    </div>
                  )}

                  {booking.status === "cancelled" && booking.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">سبب الإلغاء: </span>
                        {booking.rejectionReason}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-1.5">
                    {booking.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleConfirm(booking.id)}>
                          <CheckCircle className="w-4 h-4 ml-1" /> تأكيد
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 rounded-xl border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => handleCancel(booking.id)}>
                          <XCircle className="w-4 h-4 ml-1" /> رفض
                        </Button>
                      </div>
                    )}
                    {booking.status === "confirmed" && (
                      <Button size="sm" variant="outline" className="w-full rounded-xl border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => handleCancel(booking.id)}>
                        <XCircle className="w-4 h-4 ml-1" /> إلغاء الحجز
                      </Button>
                    )}
                    {booking.status === "cancelled" && (
                      <Button size="sm" variant="outline" className="w-full rounded-xl"
                        onClick={() => updateStatus(booking.id, "pending")}>
                        <RefreshCw className="w-4 h-4 ml-1" /> إعادة تفعيل
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="w-full rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(booking.id)}>
                      <Trash2 className="w-4 h-4 ml-1" /> حذف نهائياً
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Reason Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent dir="rtl" className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              إلغاء الحجز
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              هل أنت متأكد من إلغاء هذا الحجز؟ يمكنك إضافة سبب الإلغاء ليظهر للزبون في حسابه.
            </p>
            <div className="space-y-2">
              <Label>سبب الإلغاء (اختياري)</Label>
              <Textarea
                placeholder="مثال: الرحلة كاملة في هذا التاريخ..."
                className="rounded-xl resize-none"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 flex-row-reverse sm:flex-row-reverse">
            <Button variant="outline" className="rounded-xl" onClick={() => setCancelDialogOpen(false)}>
              تراجع
            </Button>
            <Button className="rounded-xl bg-red-600 hover:bg-red-700 text-white" onClick={confirmCancel} disabled={cancelling}>
              <XCircle className="w-4 h-4 ml-1" />
              {cancelling ? "جاري الإلغاء..." : "تأكيد الإلغاء"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
