import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { Save, Eye, EyeOff } from "lucide-react";

const BASE_API = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";

const fontSizeOptions = [
  { value: "small",  ar: "صغير",   fr: "Petit",   en: "Small" },
  { value: "medium", ar: "متوسط",  fr: "Moyen",   en: "Medium" },
  { value: "large",  ar: "كبير",   fr: "Grand",   en: "Large" },
  { value: "xlarge", ar: "كبير جداً", fr: "Très grand", en: "X-Large" },
];

const positionOptions = [
  { value: "top",        ar: "أعلى الصفحة",   fr: "Haut de page",   en: "Top of page" },
  { value: "below_hero", ar: "أسفل الهيرو",   fr: "Sous le hero",   en: "Below hero" },
];

const labels = {
  ar: {
    title: "إعدادات الصفحة الرئيسية",
    subtitle: "تحكّم في النص والإعلانات التي تظهر في الصفحة الرئيسية",
    bannerText: "نص الإعلان",
    bannerTextPlaceholder: "اكتب هنا النص الذي سيظهر في الصفحة...",
    fontSize: "حجم الخط",
    textColor: "لون النص",
    bgColor: "لون الخلفية",
    position: "موضع الإعلان",
    visible: "إظهار الإعلان",
    save: "حفظ الإعدادات",
    saved: "تم الحفظ ✓",
    preview: "معاينة",
    bold: "خط عريض",
    italic: "مائل",
    centered: "توسيط النص",
  },
  fr: {
    title: "Paramètres de la page d'accueil",
    subtitle: "Contrôlez le texte et les annonces affichés sur la page d'accueil",
    bannerText: "Texte de l'annonce",
    bannerTextPlaceholder: "Écrivez ici le texte qui apparaîtra...",
    fontSize: "Taille de police",
    textColor: "Couleur du texte",
    bgColor: "Couleur de fond",
    position: "Position de l'annonce",
    visible: "Afficher l'annonce",
    save: "Enregistrer",
    saved: "Enregistré ✓",
    preview: "Aperçu",
    bold: "Gras",
    italic: "Italique",
    centered: "Centrer le texte",
  },
  en: {
    title: "Homepage Settings",
    subtitle: "Control the text and announcements shown on the homepage",
    bannerText: "Announcement Text",
    bannerTextPlaceholder: "Write the text that will appear here...",
    fontSize: "Font Size",
    textColor: "Text Color",
    bgColor: "Background Color",
    position: "Banner Position",
    visible: "Show Announcement",
    save: "Save Settings",
    saved: "Saved ✓",
    preview: "Preview",
    bold: "Bold",
    italic: "Italic",
    centered: "Center Text",
  },
};

const fontSizeMap: Record<string, string> = {
  small: "text-sm",
  medium: "text-base",
  large: "text-xl",
  xlarge: "text-3xl",
};

export default function SiteSettings() {
  const { lang } = useLanguage();
  const t = labels[lang] || labels.ar;

  const [settings, setSettings] = useState({
    banner_visible: "false",
    banner_text: "",
    banner_font_size: "medium",
    banner_text_color: "#ffffff",
    banner_bg_color: "#1a6b3c",
    banner_position: "below_hero",
    banner_bold: "false",
    banner_italic: "false",
    banner_centered: "true",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${BASE_API}/admin/site-settings`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setSettings((prev) => ({ ...prev, ...data })); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (key: string, value: string) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BASE_API}/admin/site-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const previewTextClass = [
    fontSizeMap[settings.banner_font_size] ?? "text-base",
    settings.banner_bold === "true" ? "font-bold" : "font-normal",
    settings.banner_italic === "true" ? "italic" : "",
    settings.banner_centered === "true" ? "text-center" : "text-start",
  ].join(" ");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold">{t.title}</h1>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Visibility */}
          <Card className="rounded-2xl border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">{t.visible}</Label>
                <Switch
                  checked={settings.banner_visible === "true"}
                  onCheckedChange={(v) => set("banner_visible", v ? "true" : "false")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Text */}
          <Card className="rounded-2xl border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t.bannerText}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={settings.banner_text}
                onChange={(e) => set("banner_text", e.target.value)}
                placeholder={t.bannerTextPlaceholder}
                rows={4}
                className="resize-none"
                dir="auto"
              />

              {/* Text style toggles */}
              <div className="flex gap-2">
                <button
                  onClick={() => set("banner_bold", settings.banner_bold === "true" ? "false" : "true")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all ${
                    settings.banner_bold === "true"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  B
                </button>
                <button
                  onClick={() => set("banner_italic", settings.banner_italic === "true" ? "false" : "true")}
                  className={`px-3 py-1.5 rounded-lg text-sm italic border transition-all ${
                    settings.banner_italic === "true"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  I
                </button>
                <button
                  onClick={() => set("banner_centered", settings.banner_centered === "true" ? "false" : "true")}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                    settings.banner_centered === "true"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  ≡
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Font Size */}
          <Card className="rounded-2xl border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t.fontSize}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {fontSizeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => set("banner_font_size", opt.value)}
                    className={`py-2 px-3 rounded-xl text-sm border transition-all ${
                      settings.banner_font_size === opt.value
                        ? "bg-primary text-primary-foreground border-primary font-bold"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {opt[lang as "ar" | "fr" | "en"] || opt.ar}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Colors */}
          <Card className="rounded-2xl border-border/50">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label className="text-sm text-muted-foreground">{t.textColor}</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <input
                      type="color"
                      value={settings.banner_text_color}
                      onChange={(e) => set("banner_text_color", e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-border"
                    />
                    <span className="text-sm font-mono">{settings.banner_text_color}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <Label className="text-sm text-muted-foreground">{t.bgColor}</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <input
                      type="color"
                      value={settings.banner_bg_color}
                      onChange={(e) => set("banner_bg_color", e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-border"
                    />
                    <span className="text-sm font-mono">{settings.banner_bg_color}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Position */}
          <Card className="rounded-2xl border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t.position}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {positionOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => set("banner_position", opt.value)}
                    className={`py-2 px-3 rounded-xl text-sm border transition-all ${
                      settings.banner_position === opt.value
                        ? "bg-primary text-primary-foreground border-primary font-bold"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {opt[lang as "ar" | "fr" | "en"] || opt.ar}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 text-base rounded-xl"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                جاري الحفظ...
              </span>
            ) : saved ? (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" /> {t.saved}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" /> {t.save}
              </span>
            )}
          </Button>
        </div>

        {/* Live Preview */}
        <div className="space-y-4">
          <Card className="rounded-2xl border-border/50 sticky top-28">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {settings.banner_visible === "true" ? <Eye className="w-5 h-5 text-green-500" /> : <EyeOff className="w-5 h-5 text-muted-foreground" />}
                {t.preview}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl overflow-hidden border border-border">
                {settings.banner_visible === "true" && settings.banner_text ? (
                  <div
                    style={{
                      backgroundColor: settings.banner_bg_color,
                      color: settings.banner_text_color,
                    }}
                    className="px-6 py-4"
                  >
                    <p className={previewTextClass} style={{ whiteSpace: "pre-wrap" }}>
                      {settings.banner_text}
                    </p>
                  </div>
                ) : (
                  <div className="px-6 py-8 bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">
                      {settings.banner_visible !== "true"
                        ? "الإعلان مخفي حالياً"
                        : "اكتب نصاً لرؤية المعاينة"}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded-xl text-xs text-muted-foreground space-y-1">
                <p>• حجم الخط: {fontSizeOptions.find(f => f.value === settings.banner_font_size)?.ar}</p>
                <p>• الموضع: {positionOptions.find(p => p.value === settings.banner_position)?.ar}</p>
                <p>• الحالة: {settings.banner_visible === "true" ? "✅ ظاهر" : "❌ مخفي"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
