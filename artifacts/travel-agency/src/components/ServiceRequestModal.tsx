import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, User, MapPin, Phone, CreditCard, FileText, CheckCircle, Send, Sparkles, Paperclip, Trash2, FileImage, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";

interface Attachment {
  name: string;
  type: string;
  data: string; // base64
  size: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ServiceRequestModal({ open, onClose }: Props) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    firstName: "", lastName: "", address: "",
    phone: "", passportNumber: "", serviceDescription: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (attachments.length + files.length > 5) {
      toast({ variant: "destructive", title: "الحد الأقصى 5 ملفات" });
      return;
    }
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: `${file.name}: الحجم يتجاوز 5 ميغابايت` });
        return;
      }
      const allowed = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
      if (!allowed.includes(file.type)) {
        toast({ variant: "destructive", title: `${file.name}: نوع غير مسموح. استخدم JPG أو PNG أو PDF` });
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = (ev.target?.result as string).split(",")[1];
        setAttachments((prev) => [...prev, { name: file.name, type: file.type, data: base64, size: file.size }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/service-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          attachments: attachments.map(({ name, type, data }) => ({ name, type, data })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDone(true);
    } catch (err: any) {
      toast({ variant: "destructive", title: t("serviceModal.sendFailed"), description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setDone(false);
      setAttachments([]);
      setForm({ firstName: "", lastName: "", address: "", phone: "", passportNumber: "", serviceDescription: "" });
    }, 300);
  };

  const inp = "w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="bg-background rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

              <div className="relative bg-gradient-to-l from-primary to-primary/80 rounded-t-3xl px-6 py-5 text-primary-foreground">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{t("serviceModal.title")}</h2>
                    <p className="text-primary-foreground/80 text-sm">{t("serviceModal.subtitle")}</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="absolute top-4 left-4 w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6">
                {done ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{t("serviceModal.successTitle")}</h3>
                    <p className="text-muted-foreground mb-6">{t("serviceModal.successDesc")}</p>
                    <Button onClick={handleClose} className="rounded-2xl px-8">{t("serviceModal.close")}</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-foreground">
                          <User className="w-3.5 h-3.5 text-primary" /> {t("serviceModal.firstName")} *
                        </label>
                        <input required value={form.firstName} onChange={set("firstName")} placeholder={t("serviceModal.firstNamePh")} className={inp} />
                      </div>
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-foreground">
                          <User className="w-3.5 h-3.5 text-primary" /> {t("serviceModal.lastName")} *
                        </label>
                        <input required value={form.lastName} onChange={set("lastName")} placeholder={t("serviceModal.lastNamePh")} className={inp} />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-foreground">
                        <MapPin className="w-3.5 h-3.5 text-primary" /> {t("serviceModal.address")} *
                      </label>
                      <input required value={form.address} onChange={set("address")} placeholder={t("serviceModal.addressPh")} className={inp} />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-foreground">
                        <Phone className="w-3.5 h-3.5 text-primary" /> {t("serviceModal.phone")} *
                      </label>
                      <input required type="tel" dir="ltr" value={form.phone} onChange={set("phone")} placeholder="+213 XX XX XX XX" className={inp} />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-foreground">
                        <CreditCard className="w-3.5 h-3.5 text-primary" /> {t("serviceModal.passport")} *
                      </label>
                      <input required dir="ltr" value={form.passportNumber} onChange={set("passportNumber")} placeholder="A 00000000" className={inp} />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-foreground">
                        <FileText className="w-3.5 h-3.5 text-primary" /> {t("serviceModal.serviceDesc")} *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={form.serviceDescription}
                        onChange={set("serviceDescription")}
                        placeholder={t("serviceModal.serviceDescPh")}
                        className={`${inp} resize-none`}
                      />
                    </div>

                    {/* File Attachments */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-foreground">
                        <Paperclip className="w-3.5 h-3.5 text-primary" />
                        المرفقات
                        <span className="text-muted-foreground font-normal">(اختياري — JPG, PNG, PDF — حتى 5 ملفات / 5MB لكل ملف)</span>
                      </label>

                      {/* Upload zone */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-primary/30 rounded-xl p-4 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-colors"
                      >
                        <Paperclip className="w-6 h-6 text-primary/50 mx-auto mb-1" />
                        <p className="text-sm text-muted-foreground">اضغط لرفع ملف</p>
                        <p className="text-xs text-muted-foreground/60 mt-0.5">{attachments.length}/5 ملفات</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                        onChange={handleFiles}
                      />

                      {/* File list */}
                      {attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {attachments.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2">
                              {file.type.startsWith("image/") ? (
                                <FileImage className="w-4 h-4 text-primary shrink-0" />
                              ) : (
                                <File className="w-4 h-4 text-red-500 shrink-0" />
                              )}
                              <span className="text-xs flex-1 truncate">{file.name}</span>
                              <span className="text-xs text-muted-foreground shrink-0">{formatSize(file.size)}</span>
                              <button
                                type="button"
                                onClick={() => removeAttachment(idx)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button type="submit" size="lg" className="w-full rounded-2xl h-12 font-bold gap-2" disabled={loading}>
                      <Send className="w-4 h-4" />
                      {loading ? t("serviceModal.sending") : t("serviceModal.send")}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
