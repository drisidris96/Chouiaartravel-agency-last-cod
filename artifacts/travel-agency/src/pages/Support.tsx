import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Phone, MessageCircle, Mail, Facebook, HelpCircle, Send,
  CheckCircle, ArrowRight, Clock, Shield, Headphones,
  Paperclip, X, FileText, Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { useLocation } from "wouter";

const BASE_URL = import.meta.env.BASE_URL ?? "/";
const API = BASE_URL.replace(/\/$/, "") + "/api";

const MAX_FILES = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

interface AttachmentFile {
  name: string;
  type: string;
  size: number;
  data: string;
}

export default function Support() {
  const { toast } = useToast();
  const { t, dir } = useLanguage();
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inp = "w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm";

  const contactChannels = [
    {
      icon: MessageCircle,
      title: t("support.whatsapp"),
      subtitle: t("support.whatsappSub"),
      value: "+213 774 71 84 96",
      color: "bg-emerald-500",
      href: "https://wa.me/213774718496",
      cta: t("support.whatsappCta"),
    },
    {
      icon: Phone,
      title: t("support.phone"),
      subtitle: t("support.phoneSub"),
      value: "+213 74 71 84 96",
      color: "bg-blue-500",
      href: "tel:+21374718496",
      cta: t("support.phoneCta"),
    },
    {
      icon: Mail,
      title: t("support.email"),
      subtitle: t("support.emailSub"),
      value: "chouiaartravelagency@gmail.com",
      color: "bg-red-500",
      href: "mailto:chouiaartravelagency@gmail.com",
      cta: t("support.emailCta"),
    },
    {
      icon: Facebook,
      title: t("support.facebook"),
      subtitle: t("support.facebookSub"),
      value: "Chouiaar Travel Agency",
      color: "bg-indigo-600",
      href: "https://www.facebook.com/share/1CEBKfuqDo/",
      cta: t("support.facebookCta"),
    },
  ];

  const faqs = [
    { q: t("support.faq1q"), a: t("support.faq1a") },
    { q: t("support.faq2q"), a: t("support.faq2a") },
    { q: t("support.faq3q"), a: t("support.faq3a") },
    { q: t("support.faq4q"), a: t("support.faq4a") },
  ];

  const stats = [
    { icon: Clock, label: t("support.statAvailable"), sub: t("support.statAvailableSub") },
    { icon: Shield, label: t("support.statSecure"), sub: t("support.statSecureSub") },
    { icon: CheckCircle, label: t("support.statReply"), sub: t("support.statReplySub") },
  ];

  const processFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);
    const remaining = MAX_FILES - attachments.length;
    if (remaining <= 0) {
      toast({ variant: "destructive", title: t("support.attachMax") });
      return;
    }
    let added = 0;
    const newAttachments: AttachmentFile[] = [];
    const promises = arr.slice(0, remaining).map((file) => {
      return new Promise<void>((resolve) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
          toast({ variant: "destructive", title: `"${file.name}"`, description: "JPG/PNG/PDF" });
          return resolve();
        }
        if (file.size > MAX_FILE_BYTES) {
          toast({ variant: "destructive", title: `"${file.name}" — > 5MB` });
          return resolve();
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = (e.target?.result as string).split(",")[1];
          newAttachments.push({ name: file.name, type: file.type, size: file.size, data });
          added++;
          resolve();
        };
        reader.readAsDataURL(file);
      });
    });
    Promise.all(promises).then(() => {
      if (added > 0) setAttachments((prev) => [...prev, ...newAttachments]);
    });
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone && !form.email) {
      toast({ variant: "destructive", title: t("support.contactRequired") });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          attachments: attachments.map(({ name, type, data }) => ({ name, type, data })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSent(true);
      setForm({ name: "", phone: "", email: "", message: "" });
      setAttachments([]);
    } catch (err: any) {
      toast({ variant: "destructive", title: t("support.sendFailed"), description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-[85vh] py-10 px-4" dir={dir}>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl mb-10">
        <div className="absolute inset-0 bg-gradient-to-bl from-primary via-primary/90 to-secondary" />
        <div className="absolute inset-0 opacity-10 bg-[url('/images/login-bg.jpg')] bg-cover bg-center" />
        <div className="relative z-10 text-center py-14 px-6 text-primary-foreground">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">{t("support.heroTitle")}</h1>
            <p className="text-primary-foreground/80 max-w-md mx-auto text-base">
              {t("support.heroDesc")}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl">

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {stats.map(({ icon: Icon, label, sub }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border/50 rounded-2xl p-4 text-center shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <p className="font-bold text-sm">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Left: Contact channels + FAQ */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                {t("support.channelsTitle")}
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {contactChannels.map((ch, i) => (
                  <motion.a
                    key={i}
                    href={ch.href}
                    target={ch.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-4 bg-card border border-border/50 rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                  >
                    <div className={`w-11 h-11 rounded-xl ${ch.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <ch.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{ch.title}</p>
                      <p className="text-xs text-muted-foreground">{ch.subtitle}</p>
                      <p className="text-xs font-mono text-primary mt-0.5 truncate" dir="ltr">{ch.value}</p>
                    </div>
                    <ArrowRight className={`w-4 h-4 text-muted-foreground group-hover:text-primary transition-all ${dir === "rtl" ? "group-hover:translate-x-[-4px]" : "group-hover:translate-x-[4px]"}`} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                {t("support.faqTitle")}
              </h2>
              <div className="space-y-2">
                {faqs.map((faq, i) => (
                  <div key={i} className="bg-card border border-border/50 rounded-2xl overflow-hidden">
                    <button
                      className="w-full text-start px-4 py-3.5 font-semibold text-sm flex items-center justify-between hover:bg-muted/50 transition-colors"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      {faq.q}
                      <span className={`text-primary transition-transform ${openFaq === i ? "rotate-90" : ""}`}>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Contact form */}
          <div>
            <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg sticky top-24">
              <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                {t("support.formTitle")}
              </h2>
              <p className="text-sm text-muted-foreground mb-5">{t("support.formDesc")}</p>

              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{t("support.successTitle")}</h3>
                  <p className="text-muted-foreground text-sm mb-5">{t("support.successDesc")}</p>
                  <Button variant="outline" className="rounded-xl" onClick={() => setSent(false)}>
                    {t("support.sendAnother")}
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">{t("support.fieldName")}</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={t("support.fieldNamePh")}
                      className={inp}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5">{t("support.fieldPhone")}</label>
                      <input
                        type="tel"
                        dir="ltr"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+213 ..."
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5">{t("support.fieldEmail")}</label>
                      <input
                        type="email"
                        dir="ltr"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="email@example.com"
                        className={inp}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-2">{t("support.contactNote")}</p>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">{t("support.fieldMessage")}</label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder={t("support.fieldMessagePh")}
                      className={`${inp} resize-none`}
                    />
                  </div>

                  {/* File upload zone */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1">
                      <Paperclip className="w-3.5 h-3.5" />
                      {t("support.attachLabel")}
                      <span className="text-muted-foreground font-normal">{t("support.attachLimit")}</span>
                    </label>

                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
                        dragging
                          ? "border-primary bg-primary/5 scale-[1.01]"
                          : "border-border/60 hover:border-primary/50 hover:bg-muted/30"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                        onChange={(e) => e.target.files && processFiles(e.target.files)}
                      />
                      <Paperclip className="w-5 h-5 text-muted-foreground mx-auto mb-1.5" />
                      <p className="text-xs text-muted-foreground">
                        {t("support.attachDrop")} <span className="text-primary font-semibold">{t("support.attachClick")}</span>
                      </p>
                      {attachments.length >= MAX_FILES && (
                        <p className="text-xs text-amber-600 mt-1">{t("support.attachMax")}</p>
                      )}
                    </div>

                    {/* Attached files list */}
                    {attachments.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {attachments.map((file, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-xs"
                          >
                            {file.type === "application/pdf" ? (
                              <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            )}
                            <span className="flex-1 truncate font-medium">{file.name}</span>
                            <span className="text-muted-foreground flex-shrink-0">{formatSize(file.size)}</span>
                            <button
                              type="button"
                              onClick={() => removeAttachment(idx)}
                              className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full h-12 rounded-xl font-bold gap-2" disabled={loading}>
                    <Send className="w-4 h-4" />
                    {loading ? t("support.sending") : t("support.send")}
                  </Button>
                </form>
              )}

              {/* Back to login */}
              <div className="mt-4 pt-4 border-t border-border/40 text-center">
                <button
                  onClick={() => setLocation("/login")}
                  className="text-sm text-primary hover:underline"
                >
                  {t("support.backToLogin")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
