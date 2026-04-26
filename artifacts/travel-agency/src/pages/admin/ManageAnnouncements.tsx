import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Loader2, Megaphone, Eye, EyeOff, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";

interface Announcement {
  id: number;
  title?: string | null;
  content: string;
  fontSize: number;
  fontColor: string;
  bgColor: string;
  position: string;
  alignment: string;
  icon?: string | null;
  linkUrl?: string | null;
  active: boolean;
  sortOrder: number;
  verticalOffset: number;
  horizontalOffset: number;
  width: string;
  transparentBg: boolean;
  borderColor: string | null;
  borderWidth: number;
  fontFamily: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

const FONT_OPTIONS = [
  { value: "", label: "افتراضي" },
  { value: "Cairo, sans-serif", label: "Cairo (كايرو - عصري)" },
  { value: "Tajawal, sans-serif", label: "Tajawal (تجوال - بسيط وواضح)" },
  { value: "Almarai, sans-serif", label: "Almarai (المراعي - أنيق)" },
  { value: "Amiri, serif", label: "Amiri (أميري - تراثي)" },
  { value: "Reem Kufi, sans-serif", label: "Reem Kufi (ريم كوفي - حروف مزخرفة)" },
  { value: "Noto Naskh Arabic, serif", label: "Noto Naskh (نسخ كلاسيكي)" },
  { value: "Markazi Text, serif", label: "Markazi (مركزي - أنيق)" },
  { value: "Lateef, serif", label: "Lateef (لطيف - خط اليد)" },
];

const EMPTY: Omit<Announcement, "id"> = {
  title: "",
  content: "",
  fontSize: 18,
  fontColor: "#ffffff",
  bgColor: "#c0392b",
  position: "top",
  alignment: "center",
  icon: "",
  linkUrl: "",
  active: true,
  sortOrder: 0,
  verticalOffset: 0,
  horizontalOffset: 0,
  width: "full",
  transparentBg: false,
  borderColor: "#c0392b",
  borderWidth: 0,
  fontFamily: "",
  startDate: "",
  endDate: "",
};

function toDateInput(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const DIAGRAM_WIDTH: Record<string, string> = {
  narrow: "w-1/3",
  medium: "w-1/2",
  wide: "w-3/4",
  full: "w-full",
};

function PageDiagram({
  position, verticalOffset, horizontalOffset, width, bgColor, fontColor, text, icon,
}: {
  position: string;
  verticalOffset: number;
  horizontalOffset: number;
  width: string;
  bgColor: string;
  fontColor: string;
  text: string;
  icon: string;
}) {
  const banner = (
    <div
      style={{
        backgroundColor: bgColor,
        color: fontColor,
        marginTop: verticalOffset / 4,
        marginLeft: horizontalOffset > 0 ? horizontalOffset / 4 : undefined,
        marginRight: horizontalOffset < 0 ? -horizontalOffset / 4 : undefined,
      }}
      className={`mx-auto text-[10px] py-1.5 px-2 rounded text-center font-bold truncate shadow-sm ${DIAGRAM_WIDTH[width] || "w-full"}`}
    >
      {icon} {text.length > 40 ? text.slice(0, 40) + "…" : text}
    </div>
  );
  const Section = ({ label, h, color }: { label: string; h: number; color: string }) => (
    <div
      className="rounded text-[9px] flex items-center justify-center text-gray-700 border"
      style={{ height: h, backgroundColor: color }}
    >
      {label}
    </div>
  );
  return (
    <div className="space-y-1.5 max-w-xs mx-auto" dir="rtl">
      <Section label="🟧 الشريط العلوي البرتقالي (القائمة)" h={20} color="#fef3c7" />
      {position === "top" && banner}
      <Section label="🖼️ Slideshow / صور الواجهة" h={50} color="#dbeafe" />
      <Section label="🕌 مشغل القرآن الكريم" h={26} color="#d1fae5" />
      {position === "middle" && banner}
      <Section label="📋 بطاقات الخدمات" h={40} color="#fef3c7" />
      <Section label="✈️ الرحلات والباقات" h={40} color="#fce7f3" />
      {position === "bottom" && banner}
      <Section label="📞 الفوتر / تواصل معنا" h={20} color="#e5e7eb" />
    </div>
  );
}

export default function ManageAnnouncements() {
  const { toast } = useToast();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/announcements/all`, { credentials: "include" });
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY);
    setDialogOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setEditId(a.id);
    setForm({
      title: a.title ?? "",
      content: a.content,
      fontSize: a.fontSize,
      fontColor: a.fontColor,
      bgColor: a.bgColor,
      position: a.position,
      alignment: a.alignment,
      icon: a.icon ?? "",
      linkUrl: a.linkUrl ?? "",
      active: a.active,
      sortOrder: a.sortOrder,
      verticalOffset: a.verticalOffset ?? 0,
      horizontalOffset: a.horizontalOffset ?? 0,
      width: a.width ?? "full",
      transparentBg: a.transparentBg ?? false,
      borderColor: a.borderColor ?? "#c0392b",
      borderWidth: a.borderWidth ?? 0,
      fontFamily: a.fontFamily ?? "",
      startDate: toDateInput(a.startDate),
      endDate: toDateInput(a.endDate),
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.content.trim()) {
      toast({ variant: "destructive", title: "محتوى الإعلان مطلوب" });
      return;
    }
    setSaving(true);
    try {
      const url = editId ? `${BASE}/announcements/${editId}` : `${BASE}/announcements`;
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast({ title: editId ? "تم تحديث الإعلان" : "تم إضافة الإعلان" });
      setDialogOpen(false);
      load();
    } catch {
      toast({ variant: "destructive", title: "حدث خطأ أثناء الحفظ" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;
    try {
      const res = await fetch(`${BASE}/announcements/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      toast({ title: "تم حذف الإعلان" });
      load();
    } catch {
      toast({ variant: "destructive", title: "حدث خطأ أثناء الحذف" });
    }
  };

  const toggleActive = async (a: Announcement) => {
    try {
      await fetch(`${BASE}/announcements/${a.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...a, active: !a.active }),
      });
      load();
    } catch {
      toast({ variant: "destructive", title: "تعذر التحديث" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Megaphone className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-serif font-bold">الإعلانات</h1>
        </div>
        <Button onClick={openCreate} className="rounded-full">
          <Plus className="w-4 h-4 ml-2" />
          إعلان جديد
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <Card className="rounded-2xl border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            لا توجد إعلانات بعد. أضف أول إعلان لعرضه على الصفحة الرئيسية.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((a) => (
            <Card key={a.id} className="rounded-2xl overflow-hidden">
              <div
                style={{
                  backgroundColor: a.bgColor,
                  color: a.fontColor,
                  textAlign: a.alignment as any,
                }}
                className="p-4"
              >
                {a.title && (
                  <div style={{ fontSize: a.fontSize + 2, fontWeight: 700 }}>
                    {a.icon} {a.title}
                  </div>
                )}
                <div style={{ fontSize: a.fontSize }}>{!a.title && a.icon} {a.content}</div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 bg-muted rounded">الموقع: {a.position}</span>
                  <span className="px-2 py-1 bg-muted rounded">المحاذاة: {a.alignment}</span>
                  <span className="px-2 py-1 bg-muted rounded">الترتيب: {a.sortOrder}</span>
                  <span className={`px-2 py-1 rounded ${a.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"}`}>
                    {a.active ? "نشط" : "معطّل"}
                  </span>
                  {a.startDate && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                      من: {new Date(a.startDate).toLocaleString("ar")}
                    </span>
                  )}
                  {a.endDate && (
                    <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded">
                      إلى: {new Date(a.endDate).toLocaleString("ar")}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(a)}>
                    <Edit className="w-4 h-4 ml-1" /> تعديل
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleActive(a)}>
                    {a.active ? <EyeOff className="w-4 h-4 ml-1" /> : <Eye className="w-4 h-4 ml-1" />}
                    {a.active ? "إخفاء" : "تفعيل"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(a.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "تعديل الإعلان" : "إعلان جديد"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label>العنوان (اختياري)</Label>
              <Input
                value={form.title ?? ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="عنوان الإعلان"
              />
            </div>

            <div>
              <Label>المحتوى *</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="نص الإعلان..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الأيقونة (إيموجي اختياري)</Label>
                <Input
                  value={form.icon ?? ""}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="🎉 ✈️ 🕋 ⚡"
                />
              </div>
              <div>
                <Label>رابط (اختياري)</Label>
                <Input
                  value={form.linkUrl ?? ""}
                  onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>حجم الخط (px)</Label>
                <Input
                  type="number"
                  min={10}
                  max={60}
                  value={form.fontSize}
                  onChange={(e) => setForm({ ...form, fontSize: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>لون الخط</Label>
                <Input
                  type="color"
                  value={form.fontColor}
                  onChange={(e) => setForm({ ...form, fontColor: e.target.value })}
                  className="h-10 p-1"
                />
              </div>
              <div>
                <Label>لون الخلفية</Label>
                <Input
                  type="color"
                  value={form.bgColor}
                  onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                  className="h-10 p-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>الموقع في الصفحة</Label>
                <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">أعلى الصفحة</SelectItem>
                    <SelectItem value="middle">وسط الصفحة</SelectItem>
                    <SelectItem value="bottom">أسفل الصفحة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>محاذاة النص</Label>
                <Select value={form.alignment} onValueChange={(v) => setForm({ ...form, alignment: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="right">يمين</SelectItem>
                    <SelectItem value="center">وسط</SelectItem>
                    <SelectItem value="left">يسار</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>ترتيب العرض</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>تاريخ البداية (اختياري)</Label>
                <Input
                  type="datetime-local"
                  value={form.startDate ?? ""}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">يبدأ العرض من هذا التاريخ. اتركه فارغاً للعرض فوراً.</p>
              </div>
              <div>
                <Label>تاريخ النهاية (اختياري)</Label>
                <Input
                  type="datetime-local"
                  value={form.endDate ?? ""}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">يتوقف العرض بعد هذا التاريخ. اتركه فارغاً لعرض دائم.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
              <Label>عرض الإعلان للمستخدمين</Label>
            </div>

            <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Label className="font-bold">📍 معاينة الموقع على الصفحة</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setForm({ ...form, verticalOffset: form.verticalOffset - 20 })}
                  >
                    <ArrowUp className="w-4 h-4 ml-1" /> رفع
                  </Button>
                  <span className="text-xs font-mono w-16 text-center bg-background px-2 py-1 rounded">
                    {form.verticalOffset}px
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setForm({ ...form, verticalOffset: form.verticalOffset + 20 })}
                  >
                    <ArrowDown className="w-4 h-4 ml-1" /> تنزيل
                  </Button>
                </div>
              </div>

              <div className="bg-background rounded-md p-2 border">
                <PageDiagram
                  position={form.position}
                  verticalOffset={form.verticalOffset}
                  horizontalOffset={form.horizontalOffset}
                  width={form.width}
                  bgColor={form.bgColor}
                  fontColor={form.fontColor}
                  text={form.content || "نص الإعلان"}
                  icon={form.icon ?? ""}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 items-end">
                <div>
                  <Label className="text-xs">إزاحة عمودية دقيقة (px)</Label>
                  <Input
                    type="number"
                    value={form.verticalOffset}
                    onChange={(e) => setForm({ ...form, verticalOffset: Number(e.target.value) })}
                    min={-300}
                    max={300}
                    step={5}
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setForm({ ...form, verticalOffset: 0, horizontalOffset: 0 })}
                >
                  إعادة تعيين كل الإزاحات
                </Button>
              </div>

              <div className="border-t pt-3 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Label className="font-bold">↔️ التحريك الأفقي</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setForm({ ...form, horizontalOffset: form.horizontalOffset - 20 })}
                    >
                      <ArrowRight className="w-4 h-4 ml-1" /> يمين
                    </Button>
                    <span className="text-xs font-mono w-16 text-center bg-background px-2 py-1 rounded">
                      {form.horizontalOffset}px
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setForm({ ...form, horizontalOffset: form.horizontalOffset + 20 })}
                    >
                      <ArrowLeft className="w-4 h-4 ml-1" /> يسار
                    </Button>
                  </div>
                </div>
                <Input
                  type="number"
                  value={form.horizontalOffset}
                  onChange={(e) => setForm({ ...form, horizontalOffset: Number(e.target.value) })}
                  min={-500}
                  max={500}
                  step={5}
                  placeholder="إزاحة أفقية (px)"
                />
                <p className="text-xs text-muted-foreground">
                  💡 سالب = نحو اليمين، موجب = نحو اليسار (بسبب اتجاه RTL).
                </p>
              </div>

              <div className="border-t pt-3 space-y-2">
                <Label className="font-bold">📏 عرض الإعلان</Label>
                <Select
                  value={form.width}
                  onValueChange={(v) => setForm({ ...form, width: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="narrow">ضيّق (للإعلانات القصيرة)</SelectItem>
                    <SelectItem value="medium">متوسّط</SelectItem>
                    <SelectItem value="wide">عريض</SelectItem>
                    <SelectItem value="full">كامل العرض (افتراضي)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-3 space-y-2">
                <Label className="font-bold">🎨 الخلفية</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="transparent-bg"
                    checked={form.transparentBg}
                    onChange={(e) => setForm({ ...form, transparentBg: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="transparent-bg" className="cursor-pointer">
                    إخفاء الخلفية (نص بدون خلفية ملوّنة)
                  </Label>
                </div>
                {form.transparentBg && (
                  <p className="text-xs text-amber-600">
                    ⚠️ تأكّد أن لون الخط يُرى جيداً على خلفية الصفحة (الأبيض).
                  </p>
                )}
              </div>

              <div className="border-t pt-3 space-y-2">
                <Label className="font-bold">🖼️ إطار حول الإعلان</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">لون الإطار</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        value={form.borderColor || "#c0392b"}
                        onChange={(e) => setForm({ ...form, borderColor: e.target.value })}
                        className="w-12 h-9 p-1"
                      />
                      <Input
                        type="text"
                        value={form.borderColor || ""}
                        onChange={(e) => setForm({ ...form, borderColor: e.target.value })}
                        placeholder="#c0392b"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">سُمك الإطار (px)</Label>
                    <Input
                      type="number"
                      value={form.borderWidth}
                      onChange={(e) => setForm({ ...form, borderWidth: Number(e.target.value) })}
                      min={0}
                      max={20}
                      step={1}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setForm({ ...form, borderWidth: 0 })}
                  >
                    بدون إطار
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setForm({ ...form, borderWidth: 2 })}
                  >
                    إطار رفيع (2px)
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setForm({ ...form, borderWidth: 5 })}
                  >
                    إطار عريض (5px)
                  </Button>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <Label className="font-bold">✍️ نوع الخط</Label>
                <Select
                  value={form.fontFamily || ""}
                  onValueChange={(v) => setForm({ ...form, fontFamily: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((f) => (
                      <SelectItem key={f.value} value={f.value || "default"}>
                        <span style={{ fontFamily: f.value || "inherit" }}>{f.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.fontFamily && (
                  <div
                    className="p-3 rounded border bg-white text-center"
                    style={{ fontFamily: form.fontFamily, fontSize: form.fontSize }}
                  >
                    معاينة الخط: {form.content || "نص الإعلان سيظهر بهذا الخط"}
                  </div>
                )}
              </div>
            </div>

            <div
              className="rounded-lg p-4 border"
              style={{
                backgroundColor: form.bgColor,
                color: form.fontColor,
                textAlign: form.alignment as any,
              }}
            >
              <div className="text-xs opacity-75 mb-2">معاينة شكل الإعلان:</div>
              {form.title && (
                <div style={{ fontSize: form.fontSize + 2, fontWeight: 700 }}>
                  {form.icon} {form.title}
                </div>
              )}
              <div style={{ fontSize: form.fontSize }}>
                {!form.title && form.icon} {form.content || "نص الإعلان سيظهر هنا..."}
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => window.open((import.meta.env.BASE_URL ?? "/"), "_blank")}
            >
              <ExternalLink className="w-4 h-4 ml-2" />
              فتح الصفحة الرئيسية في تبويب جديد للمعاينة الحية
            </Button>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
              <Button onClick={save} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                {editId ? "تحديث" : "إضافة"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
