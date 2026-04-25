import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetTrips, useDeleteTrip, getGetTripsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, MapPin, Edit, Star, Loader2, ImageIcon, Upload, Link2 } from "lucide-react";
import { format } from "date-fns";
import { useCurrency } from "@/i18n/CurrencyContext";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";

type Category = "trip" | "umrah" | "domestic";

const EMPTY_FORM = {
  title: "", description: "", destination: "", country: "", imageUrl: "",
  price: 0, duration: 1, maxCapacity: 10, startDate: "", endDate: "",
  featured: false, includes: "", category: "trip" as Category,
};

type FormData = typeof EMPTY_FORM;

export default function ManageTrips() {
  const { formatPrice } = useCurrency();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<Category>("trip");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: allTrips, isLoading } = useGetTrips();
  const trips = allTrips?.filter(t => (t as any).category === activeTab) ?? [];

  const deleteTrip = useDeleteTrip({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTripsQueryKey() });
        toast({ title: activeTab === "umrah" ? "تم حذف باقة العمرة" : "تم حذف الرحلة" });
      },
      onError: () => toast({ variant: "destructive", title: "حدث خطأ أثناء الحذف" }),
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const base64: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch(`${BASE}/admin/upload-image`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mimeType: file.type }),
      });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      set("imageUrl", url);
      toast({ title: "تم رفع الصورة بنجاح" });
    } catch {
      toast({ variant: "destructive", title: "فشل رفع الصورة" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.")) {
      deleteTrip.mutate({ id });
    }
  };

  const openAdd = () => {
    setEditId(null);
    setFormData({ ...EMPTY_FORM, category: activeTab });
    setDialogOpen(true);
  };

  const openEdit = (trip: any) => {
    setEditId(trip.id);
    setFormData({
      title: trip.title ?? "",
      description: trip.description ?? "",
      destination: trip.destination ?? "",
      country: trip.country ?? "",
      imageUrl: trip.imageUrl ?? "",
      price: trip.price ?? 0,
      duration: trip.duration ?? 1,
      maxCapacity: trip.maxCapacity ?? 10,
      startDate: trip.startDate ?? "",
      endDate: trip.endDate ?? "",
      featured: trip.featured ?? false,
      includes: (trip.includes ?? []).join("\n"),
      category: (trip as any).category ?? activeTab,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...formData,
        includes: formData.includes.split("\n").filter(i => i.trim() !== ""),
        price: Number(formData.price),
        duration: Number(formData.duration),
        maxCapacity: Number(formData.maxCapacity),
      };
      const url = editId ? `${BASE}/trips/${editId}` : `${BASE}/trips`;
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      queryClient.invalidateQueries({ queryKey: getGetTripsQueryKey() });
      toast({ title: editId ? "تم تعديل البيانات بنجاح" : (activeTab === "umrah" ? "تمت إضافة باقة العمرة" : "تمت إضافة الرحلة") });
      setDialogOpen(false);
    } catch {
      toast({ variant: "destructive", title: "حدث خطأ أثناء الحفظ" });
    } finally {
      setSaving(false);
    }
  };

  const set = (field: keyof FormData, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  const inp = "h-10 rounded-xl border-border/60 focus-visible:ring-primary/40";
  const lbl = "text-sm font-medium text-muted-foreground";

  const tabs: { key: Category; label: string; emoji: string }[] = [
    { key: "trip", label: "الرحلات المميزة", emoji: "✈️" },
    { key: "umrah", label: "باقات العمرة", emoji: "🕋" },
    { key: "domestic", label: "الرحلات الداخلية", emoji: "🏔️" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold">إدارة الرحلات والعمرة</h1>
        <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20" onClick={openAdd}>
          <Plus className="w-4 h-4" />
          {activeTab === "umrah" ? "إضافة باقة عمرة" : activeTab === "domestic" ? "إضافة رحلة داخلية" : "إضافة رحلة"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-muted/40 p-1 rounded-2xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.key
                ? "bg-background shadow text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{tab.emoji}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> جاري التحميل...
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-3">{activeTab === "umrah" ? "🕋" : activeTab === "domestic" ? "🏔️" : "✈️"}</p>
            <p className="font-semibold">لا توجد {activeTab === "umrah" ? "باقات عمرة" : activeTab === "domestic" ? "رحلات داخلية" : "رحلات"} بعد</p>
            <p className="text-sm mt-1">اضغط «إضافة» لإنشاء أول {activeTab === "umrah" ? "باقة" : "رحلة"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border/40">
                <tr>
                  <th className="text-right px-4 py-3 font-semibold">{activeTab === "umrah" ? "الباقة" : activeTab === "domestic" ? "الرحلة الداخلية" : "الرحلة"}</th>
                  <th className="text-right px-4 py-3 font-semibold">الوجهة</th>
                  <th className="text-right px-4 py-3 font-semibold">التاريخ</th>
                  <th className="text-right px-4 py-3 font-semibold">السعر</th>
                  <th className="text-right px-4 py-3 font-semibold">الشواغر</th>
                  <th className="text-right px-4 py-3 font-semibold">مميزة</th>
                  <th className="text-center px-4 py-3 font-semibold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {trips.map(trip => (
                  <tr key={trip.id} className="border-t border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        {trip.imageUrl ? (
                          <img src={trip.imageUrl} className="w-12 h-12 rounded-xl object-cover border border-border/30" alt="" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-semibold">{trip.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-muted-foreground whitespace-nowrap">
                        <MapPin className="w-3.5 h-3.5" /> {trip.destination}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground text-xs">
                      {trip.startDate ? format(new Date(trip.startDate), "dd MMM") : "—"} ← {trip.endDate ? format(new Date(trip.endDate), "dd MMM yyyy") : "—"}
                    </td>
                    <td className="px-4 py-3 font-bold whitespace-nowrap" dir="ltr">{formatPrice(trip.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${trip.availableSpots > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {trip.availableSpots} / {trip.maxCapacity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {trip.featured && <Star className="w-4 h-4 text-amber-500 fill-amber-500 mx-auto" />}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => openEdit(trip)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(trip.id)} disabled={deleteTrip.isPending}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editId ? "تعديل" : "إضافة"} {formData.category === "umrah" ? "باقة عمرة" : "رحلة"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            {/* Category selector */}
            <div className="flex gap-2 bg-muted/40 p-1 rounded-xl">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => set("category", tab.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                    formData.category === tab.key ? "bg-background shadow text-primary" : "text-muted-foreground"
                  }`}
                >
                  {tab.emoji} {tab.label}
                </button>
              ))}
            </div>

            {/* Image section */}
            <div className="space-y-3">
              <Label className={lbl}>الصورة</Label>
              {/* Mode toggle */}
              <div className="flex gap-2 bg-muted/40 p-1 rounded-xl w-fit">
                <button type="button" onClick={() => setImageMode("upload")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${imageMode === "upload" ? "bg-background shadow text-primary" : "text-muted-foreground"}`}>
                  <Upload className="w-3.5 h-3.5" /> رفع من الجهاز
                </button>
                <button type="button" onClick={() => setImageMode("url")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${imageMode === "url" ? "bg-background shadow text-primary" : "text-muted-foreground"}`}>
                  <Link2 className="w-3.5 h-3.5" /> رابط URL
                </button>
              </div>

              {imageMode === "upload" ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border/60 rounded-2xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-sm">جاري الرفع...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="w-8 h-8" />
                      <p className="text-sm font-medium">اضغط لاختيار صورة</p>
                      <p className="text-xs">JPG، PNG، WEBP — حجم أقصى 10MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              ) : (
                <Input
                  dir="ltr"
                  className={inp}
                  value={formData.imageUrl}
                  onChange={e => set("imageUrl", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              )}

              {/* Preview */}
              {formData.imageUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-border/40 h-40 bg-muted group">
                  <img src={formData.imageUrl} alt="preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                  <button type="button" onClick={() => set("imageUrl", "")}
                    className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    حذف
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={lbl}>{formData.category === "umrah" ? "اسم الباقة" : "عنوان الرحلة"}</Label>
                <Input required className={inp} value={formData.title} onChange={e => set("title", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className={lbl}>الوجهة (المدينة)</Label>
                <Input required className={inp} value={formData.destination} onChange={e => set("destination", e.target.value)} placeholder={formData.category === "umrah" ? "مكة المكرمة" : ""} />
              </div>
              <div className="space-y-2">
                <Label className={lbl}>الدولة</Label>
                <Input required className={inp} value={formData.country} onChange={e => set("country", e.target.value)} placeholder={formData.category === "umrah" ? "المملكة العربية السعودية" : ""} />
              </div>
              <div className="space-y-2">
                <Label className={lbl}>السعر (دج)</Label>
                <Input type="number" required min={0} className={inp} value={formData.price} onChange={e => set("price", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className={lbl}>المدة (أيام)</Label>
                <Input type="number" required min={1} className={inp} value={formData.duration} onChange={e => set("duration", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className={lbl}>السعة القصوى (أشخاص)</Label>
                <Input type="number" required min={1} className={inp} value={formData.maxCapacity} onChange={e => set("maxCapacity", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className={lbl}>تاريخ البداية</Label>
                <Input type="date" required className={inp} value={formData.startDate} onChange={e => set("startDate", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className={lbl}>تاريخ النهاية</Label>
                <Input type="date" required className={inp} value={formData.endDate} onChange={e => set("endDate", e.target.value)} />
              </div>
            </div>

            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <Checkbox id="featured" checked={formData.featured} onCheckedChange={c => set("featured", !!c)} />
              <Label htmlFor="featured" className="cursor-pointer text-amber-800 font-medium">
                ⭐ {formData.category === "umrah" ? "باقة مميزة (تعرض في الصفحة الرئيسية)" : "رحلة مميزة (تعرض في الصفحة الرئيسية)"}
              </Label>
            </div>

            <div className="space-y-2">
              <Label className={lbl}>الوصف</Label>
              <Textarea required rows={3} className="rounded-xl border-border/60 focus-visible:ring-primary/40 resize-none" value={formData.description} onChange={e => set("description", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className={lbl}>ماذا تشمل؟ (عنصر واحد في كل سطر)</Label>
              <Textarea rows={4} className="rounded-xl border-border/60 focus-visible:ring-primary/40 resize-none" value={formData.includes} onChange={e => set("includes", e.target.value)}
                placeholder={formData.category === "umrah" ? "تذاكر الطيران ذهاباً وإياباً\nإقامة في فندق 5 نجوم قرب الحرم\nوجبات مشمولة\nتأشيرة العمرة" : "تذاكر الطيران\nإقامة في فندق 5 نجوم\nجولات سياحية..."}
              />
            </div>

            <div className="flex gap-3 pt-2 border-t">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setDialogOpen(false)}>إلغاء</Button>
              <Button type="submit" className="flex-1 rounded-xl gap-2" disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...</> : editId ? "حفظ التعديلات" : "إضافة"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
