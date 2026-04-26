import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Building2, User, CreditCard, Calendar, MapPin, Phone, Briefcase, Mail,
  CheckCircle, XCircle, Clock, Loader2, Eye, Trash2, Users, FileText, Sparkles
} from "lucide-react";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";

type ResidencyRequest = {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  profession: string;
  address: string;
  phone: string;
  email: string | null;
  passportNumber: string;
  passportExpiryDate: string;
  country: string;
  residencyType: string;
  durationYears: string | null;
  sponsorName: string | null;
  sponsorContact: string | null;
  travelDate: string | null;
  notes: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
};

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  pending:    { label: "في الانتظار", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  processing: { label: "قيد المعالجة", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Loader2 },
  approved:   { label: "مقبول",        color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  rejected:   { label: "مرفوض",        color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  cancelled:  { label: "ملغي",         color: "bg-gray-100 text-gray-700 border-gray-200", icon: XCircle },
};

const TYPE_LABELS: Record<string, { label: string; icon: any }> = {
  work:       { label: "إقامة عمل",         icon: Briefcase },
  family:     { label: "إقامة عائلية",      icon: Users },
  investment: { label: "إقامة استثمارية",   icon: Building2 },
  study:      { label: "إقامة دراسية",      icon: FileText },
  medical:    { label: "إقامة علاجية",      icon: Sparkles },
  golden:     { label: "الإقامة الذهبية",   icon: Sparkles },
};

export default function ManageResidencyRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ResidencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${BASE}/residency-requests`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setRequests(data.residencyRequests);
    } catch {
      toast({ variant: "destructive", title: "خطأ في تحميل الطلبات" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateStatus = async (id: number, status: string, adminNotes?: string) => {
    try {
      const res = await fetch(`${BASE}/residency-requests/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, adminNotes }),
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(prev => prev.map(r => r.id === id ? data.residencyRequest : r));
        toast({ title: "تم تحديث حالة الطلب" });
      }
    } catch {
      toast({ variant: "destructive", title: "خطأ في تحديث الطلب" });
    }
  };

  const deleteRequest = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطلب نهائياً؟")) return;
    try {
      const res = await fetch(`${BASE}/residency-requests/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setRequests(prev => prev.filter(r => r.id !== id));
        toast({ title: "تم حذف الطلب" });
      }
    } catch {
      toast({ variant: "destructive", title: "خطأ في الحذف" });
    }
  };

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);
  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    processing: requests.filter(r => r.status === "processing").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-8 h-8 text-emerald-600" />
        <div>
          <h1 className="text-2xl md:text-3xl font-black">طلبات إقامة دول الخليج</h1>
          <p className="text-sm text-muted-foreground">إدارة جميع طلبات الإقامة الواردة</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(counts).map(([key, n]) => (
          <button key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              filter === key ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
              : "bg-muted hover:bg-muted/70"
            }`}
          >
            {key === "all" ? "الكل" : STATUS_MAP[key]?.label} ({n})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-3xl border border-border/50">
          <Building2 className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">لا توجد طلبات في هذه الفئة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const St = STATUS_MAP[r.status] || STATUS_MAP.pending;
            const Tp = TYPE_LABELS[r.residencyType] || TYPE_LABELS.work;
            const StIcon = St.icon;
            const TpIcon = Tp.icon;
            const isOpen = expandedId === r.id;
            return (
              <div key={r.id} className="bg-card border-2 border-border/50 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="p-4 md:p-5 flex flex-wrap items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <TpIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-black text-lg">{r.firstName} {r.lastName}</div>
                    <div className="text-sm text-muted-foreground flex flex-wrap gap-x-3">
                      <span>{r.country}</span><span>•</span>
                      <span>{Tp.label}</span><span>•</span>
                      <span dir="ltr">{r.phone}</span>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${St.color}`}>
                    <StIcon className={`w-3.5 h-3.5 ${r.status === "processing" ? "animate-spin" : ""}`} />
                    {St.label}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => setExpandedId(isOpen ? null : r.id)}>
                    <Eye className="w-4 h-4" /> {isOpen ? "إخفاء" : "عرض"}
                  </Button>
                </div>

                {isOpen && (
                  <div className="border-t border-border/50 p-5 bg-muted/20 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="font-bold text-emerald-600">البيانات الشخصية</div>
                        <div className="flex gap-2"><User className="w-4 h-4 text-muted-foreground" /> {r.firstName} {r.lastName}</div>
                        <div className="flex gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /> {r.birthDate} — {r.birthPlace}</div>
                        <div className="flex gap-2"><Briefcase className="w-4 h-4 text-muted-foreground" /> {r.profession}</div>
                        <div className="flex gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> <span dir="ltr">{r.phone}</span></div>
                        {r.email && <div className="flex gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> <span dir="ltr">{r.email}</span></div>}
                        <div className="flex gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /> {r.address}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="font-bold text-emerald-600">تفاصيل الطلب</div>
                        <div className="flex gap-2"><Building2 className="w-4 h-4 text-muted-foreground" /> {r.country}</div>
                        <div className="flex gap-2"><CreditCard className="w-4 h-4 text-muted-foreground" /> <span dir="ltr">{r.passportNumber}</span> — انتهاء: {r.passportExpiryDate}</div>
                        {r.durationYears && <div className="flex gap-2"><Clock className="w-4 h-4 text-muted-foreground" /> {r.durationYears} سنة</div>}
                        {r.travelDate && <div className="flex gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /> سفر: {r.travelDate}</div>}
                        {r.sponsorName && <div className="flex gap-2"><Users className="w-4 h-4 text-muted-foreground" /> الكفيل: {r.sponsorName}</div>}
                        {r.sponsorContact && <div className="flex gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> {r.sponsorContact}</div>}
                        {r.notes && <div className="flex gap-2"><FileText className="w-4 h-4 text-muted-foreground mt-1" /> {r.notes}</div>}
                      </div>
                    </div>

                    <div className="border-t border-border/50 pt-4 space-y-3">
                      <div className="font-bold text-sm">تحديث الحالة</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(STATUS_MAP).map(([key, s]) => (
                          <Button key={key} size="sm" variant={r.status === key ? "default" : "outline"}
                            onClick={() => updateStatus(r.id, key)}>
                            {s.label}
                          </Button>
                        ))}
                      </div>
                      <textarea defaultValue={r.adminNotes || ""} placeholder="ملاحظات إدارية (اختياري)..."
                        onBlur={(e) => { if (e.target.value !== (r.adminNotes || "")) updateStatus(r.id, r.status, e.target.value); }}
                        className="w-full p-3 border-2 border-border rounded-xl bg-background text-sm resize-none" rows={2} />
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>تاريخ الطلب: {new Date(r.createdAt).toLocaleString("ar-DZ")}</span>
                        <Button size="sm" variant="destructive" onClick={() => deleteRequest(r.id)}>
                          <Trash2 className="w-4 h-4" /> حذف الطلب
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
