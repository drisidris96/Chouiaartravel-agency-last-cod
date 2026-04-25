import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Hotel, Plane, Globe, Clock, CheckCircle, XCircle, User, CreditCard, Calendar, MapPin, RefreshCw, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";

type Status = "pending" | "confirmed" | "cancelled";
type ReservationType = "hotel" | "flight" | "both";

interface Reservation {
  id: number;
  type: ReservationType;
  firstName: string;
  lastName: string;
  passportNumber: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  notes?: string;
  status: Status;
  rejectionReason?: string;
  createdAt: string;
}

const TYPE_LABELS: Record<ReservationType, { label: string; icon: typeof Hotel; color: string }> = {
  hotel:  { label: "حجز فندقي",   icon: Hotel,  color: "bg-blue-100 text-blue-700 border-blue-200" },
  flight: { label: "تذكرة طيران", icon: Plane,  color: "bg-purple-100 text-purple-700 border-purple-200" },
  both:   { label: "فندق + طيران", icon: Globe, color: "bg-orange-100 text-orange-700 border-orange-200" },
};

const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: typeof Clock }> = {
  pending:   { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  confirmed: { label: "مؤكد",         color: "bg-green-100 text-green-700 border-green-200",  icon: CheckCircle },
  cancelled: { label: "ملغي",         color: "bg-red-100 text-red-700 border-red-200",        icon: XCircle },
};

function TicketCard({ r, onConfirm, onCancel, onReactivate, onDelete }: {
  r: Reservation;
  onConfirm: (id: number) => void;
  onCancel: (id: number) => void;
  onReactivate: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const type = TYPE_LABELS[r.type];
  const status = STATUS_CONFIG[r.status];
  const TypeIcon = type.icon;
  const StatusIcon = status.icon;

  const days = Math.ceil(
    (new Date(r.returnDate).getTime() - new Date(r.departureDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="h-2 bg-gradient-to-l from-primary to-primary/60" />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${type.color}`}>
              <TypeIcon className="w-5 h-5" />
            </div>
            <div>
              <p className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${type.color}`}>
                {type.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">#{r.id} · {new Date(r.createdAt).toLocaleDateString("ar-DZ")}</p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border ${status.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {status.label}
          </span>
        </div>

        <div className="bg-muted/40 rounded-2xl p-4 mb-4 space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="font-bold text-lg">{r.firstName} {r.lastName}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-muted-foreground font-mono">{r.passportNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="font-semibold text-sm">{r.destination}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-primary/5 rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">الذهاب</p>
            <div className="flex items-center justify-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <p className="font-bold text-sm">{r.departureDate}</p>
            </div>
          </div>
          <div className="text-muted-foreground text-xs text-center px-2">
            <div className="font-bold text-primary">{days}</div>
            <div>يوم</div>
          </div>
          <div className="flex-1 bg-primary/5 rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">العودة</p>
            <div className="flex items-center justify-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <p className="font-bold text-sm">{r.returnDate}</p>
            </div>
          </div>
        </div>

        {r.notes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2.5 mb-4 text-sm text-yellow-800">
            💬 {r.notes}
          </div>
        )}

        {r.status === "cancelled" && r.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4 text-sm text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">سبب الإلغاء:</p>
              <p>{r.rejectionReason}</p>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          {r.status === "pending" && (
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white"
                onClick={() => onConfirm(r.id)}>
                <CheckCircle className="w-4 h-4 ml-1" /> تأكيد
              </Button>
              <Button size="sm" variant="outline" className="flex-1 rounded-xl border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => onCancel(r.id)}>
                <XCircle className="w-4 h-4 ml-1" /> رفض
              </Button>
            </div>
          )}
          {r.status === "confirmed" && (
            <Button size="sm" variant="outline" className="w-full rounded-xl border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => onCancel(r.id)}>
              <XCircle className="w-4 h-4 ml-1" /> إلغاء الحجز
            </Button>
          )}
          {r.status === "cancelled" && (
            <Button size="sm" variant="outline" className="w-full rounded-xl"
              onClick={() => onReactivate(r.id)}>
              <RefreshCw className="w-4 h-4 ml-1" /> إعادة تفعيل
            </Button>
          )}
          <Button size="sm" variant="outline" className="w-full rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(r.id)}>
            <Trash2 className="w-4 h-4 ml-1" /> حذف الطلب نهائياً
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ManageReservations() {
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Status>("all");

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/reservations`, { credentials: "include" });
      const data = await res.json();
      setReservations(data.reservations ?? []);
    } catch {
      toast({ variant: "destructive", title: "فشل تحميل الحجوزات" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الحجز نهائياً؟")) return;
    try {
      const res = await fetch(`${BASE}/reservations/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setReservations(prev => prev.filter(r => r.id !== id));
        toast({ title: "تم حذف الحجز" });
      } else {
        toast({ variant: "destructive", title: "فشل الحذف" });
      }
    } catch {
      toast({ variant: "destructive", title: "خطأ في الاتصال" });
    }
  };

  const updateStatus = async (id: number, status: Status, reason?: string) => {
    try {
      await fetch(`${BASE}/reservations/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, rejectionReason: reason ?? null }),
      });
      setReservations(prev => prev.map(r =>
        r.id === id ? { ...r, status, rejectionReason: status === "cancelled" ? (reason ?? undefined) : undefined } : r
      ));
      toast({
        title: status === "confirmed" ? "✅ تم تأكيد الحجز"
             : status === "cancelled" ? "❌ تم إلغاء الحجز"
             : "🔄 تم إعادة تفعيل الحجز"
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

  const handleReactivate = (id: number) => updateStatus(id, "pending");

  const confirmCancel = async () => {
    if (!pendingCancelId) return;
    setCancelling(true);
    await updateStatus(pendingCancelId, "cancelled", rejectionReason.trim() || undefined);
    setCancelling(false);
    setCancelDialogOpen(false);
    setPendingCancelId(null);
    setRejectionReason("");
  };

  const filtered = filter === "all" ? reservations : reservations.filter(r => r.status === filter);
  const counts = {
    all: reservations.length,
    pending: reservations.filter(r => r.status === "pending").length,
    confirmed: reservations.filter(r => r.status === "confirmed").length,
    cancelled: reservations.filter(r => r.status === "cancelled").length,
  };

  const tabs: { key: "all" | Status; label: string; count: number }[] = [
    { key: "all",       label: "الكل",          count: counts.all },
    { key: "pending",   label: "قيد الانتظار",  count: counts.pending },
    { key: "confirmed", label: "مؤكدة",         count: counts.confirmed },
    { key: "cancelled", label: "ملغاة",         count: counts.cancelled },
  ];

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">طلبات الحجز</h1>
          <p className="text-muted-foreground text-sm">{counts.pending} طلب ينتظر المراجعة</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={fetchReservations}>
          <RefreshCw className="w-4 h-4" /> تحديث
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 animate-spin text-primary ml-2" />
          <span className="text-muted-foreground">جاري التحميل...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border/50 rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Hotel className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">لا توجد حجوزات</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((r) => (
            <TicketCard
              key={r.id}
              r={r}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              onReactivate={handleReactivate}
              onDelete={handleDelete}
            />
          ))}
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
                placeholder="مثال: الرحلة غير متوفرة في هذا التاريخ..."
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
            <Button
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmCancel}
              disabled={cancelling}
            >
              <XCircle className="w-4 h-4 ml-1" />
              {cancelling ? "جاري الإلغاء..." : "تأكيد الإلغاء"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
