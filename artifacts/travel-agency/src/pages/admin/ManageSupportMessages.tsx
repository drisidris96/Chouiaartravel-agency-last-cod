import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Phone, Mail, Paperclip, FileImage, File, CheckCircle, Clock, Trash2, RefreshCw, ChevronDown, ChevronUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";

interface Attachment {
  name: string;
  type: string;
  data: string;
}

interface SupportMessage {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  attachments: Attachment[];
  isRead: boolean;
  createdAt: string;
}

function AttachmentButton({ file }: { file: Attachment }) {
  const isImage = file.type.startsWith("image/");
  const Icon = isImage ? FileImage : File;

  const handleDownload = () => {
    const byteChars = atob(file.data);
    const bytes = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
    const blob = new Blob([bytes], { type: file.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors border border-blue-200"
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="max-w-[120px] truncate">{file.name}</span>
      <Download className="w-3 h-3 opacity-60" />
    </button>
  );
}

function MessageCard({
  msg,
  onMarkRead,
  onDelete,
}: {
  msg: SupportMessage;
  onMarkRead: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(!msg.isRead);

  return (
    <div className={`bg-card border rounded-3xl overflow-hidden shadow-sm transition-shadow hover:shadow-md ${!msg.isRead ? "border-primary/40" : "border-border/50"}`}>
      <div className={`h-1.5 ${!msg.isRead ? "bg-gradient-to-l from-primary to-blue-500" : "bg-muted"}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!msg.isRead ? "bg-primary/10" : "bg-muted"}`}>
              <MessageCircle className={`w-5 h-5 ${!msg.isRead ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base">{msg.name}</span>
                {!msg.isRead && (
                  <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">جديد</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {format(new Date(msg.createdAt), "dd MMM yyyy — HH:mm")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!msg.isRead && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                title="تحديد كمقروءة"
                onClick={() => onMarkRead(msg.id)}
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
              title="حذف"
              onClick={() => onDelete(msg.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
          {msg.phone && (
            <span className="flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-lg" dir="ltr">
              <Phone className="w-3.5 h-3.5" /> {msg.phone}
            </span>
          )}
          {msg.email && (
            <span className="flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-lg" dir="ltr">
              <Mail className="w-3.5 h-3.5" /> {msg.email}
            </span>
          )}
          {msg.attachments?.length > 0 && (
            <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100">
              <Paperclip className="w-3.5 h-3.5" /> {msg.attachments.length} مرفق
            </span>
          )}
        </div>

        {expanded && (
          <div className="space-y-3 mt-3 pt-3 border-t border-border/40">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{msg.message}</p>

            {msg.attachments?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {msg.attachments.map((file, i) => (
                  <AttachmentButton key={i} file={file} />
                ))}
              </div>
            )}

            {msg.isRead && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 pt-1">
                <CheckCircle className="w-3.5 h-3.5" /> تم القراءة
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ManageSupportMessages() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/support`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages((data.messages || []).reverse());
    } catch {
      toast({ variant: "destructive", title: "فشل تحميل الرسائل" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleMarkRead = async (id: number) => {
    try {
      const res = await fetch(`${BASE}/support/${id}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
      toast({ title: "تم تحديد الرسالة كمقروءة" });
    } catch {
      toast({ variant: "destructive", title: "حدث خطأ" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الرسالة؟")) return;
    try {
      const res = await fetch(`${BASE}/support/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      setMessages(prev => prev.filter(m => m.id !== id));
      toast({ title: "تم حذف الرسالة" });
    } catch {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const filtered = messages.filter(m => {
    if (filter === "unread") return !m.isRead;
    if (filter === "read") return m.isRead;
    return true;
  });

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-serif font-bold">رسائل الدعم</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-bold text-primary">{unreadCount}</span> رسالة غير مقروءة
            </p>
          )}
        </div>
        <Button variant="outline" className="rounded-xl gap-2" onClick={fetchMessages} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          تحديث
        </Button>
      </div>

      <div className="flex gap-2 bg-muted/40 p-1 rounded-2xl w-fit">
        {([
          { key: "all", label: "الكل" },
          { key: "unread", label: `غير مقروءة (${unreadCount})` },
          { key: "read", label: "مقروءة" },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              filter === tab.key
                ? "bg-background shadow text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
          <RefreshCw className="w-5 h-5 animate-spin" /> جاري التحميل...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-5xl mb-4">📭</p>
          <p className="font-semibold text-lg">لا توجد رسائل</p>
          <p className="text-sm mt-1">ستظهر هنا رسائل العملاء من صفحة الدعم</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(msg => (
            <MessageCard
              key={msg.id}
              msg={msg}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
