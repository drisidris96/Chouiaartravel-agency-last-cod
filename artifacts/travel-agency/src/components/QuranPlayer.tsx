import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ChevronDown } from "lucide-react";

const SURAHS = [
  "الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس",
  "هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه",
  "الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم",
  "لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر",
  "فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق",
  "الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة",
  "الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج",
  "نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس",
  "التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد",
  "الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات",
  "القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر",
  "المسد","الإخلاص","الفلق","الناس",
];

const cdn = (id: string) => (n: number) =>
  `https://cdn.islamic.network/quran/audio-surah/128/${id}/${n}.mp3`;

const mp3q = (id: string) => (n: number) =>
  `https://server8.mp3quran.net/${id}/${String(n).padStart(3, "0")}.mp3`;

const RECITERS: { name: string; getUrl: (n: number) => string }[] = [
  { name: "مشاري العفاسي",        getUrl: cdn("ar.alafasy") },
  { name: "عبدالرحمن السديس",     getUrl: cdn("ar.abdurrahmaansudais") },
  { name: "محمود خليل الحصري",    getUrl: cdn("ar.husary") },
  { name: "محمد صديق المنشاوي",   getUrl: cdn("ar.minshawi") },
  { name: "عبد الباسط عبد الصمد", getUrl: cdn("ar.abdulbasitmurattal") },
  { name: "ماهر المعيقلي",        getUrl: cdn("ar.mahermuaiqly") },
  { name: "سعود الشريم",          getUrl: cdn("ar.saoodshuraym") },
  { name: "محمد أيوب",            getUrl: cdn("ar.muhammadayyoub") },
  { name: "علي الحذيفي",          getUrl: cdn("ar.hudhaify") },
  { name: "إدريس أبكر",           getUrl: mp3q("abkr") },
];

export default function QuranPlayer() {
  const [surahIdx, setSurahIdx] = useState(0);
  const [reciterIdx, setReciterIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showSurahList, setShowSurahList] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const surahNum = surahIdx + 1;
  const reciter = RECITERS[reciterIdx];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = reciter.getUrl(surahNum);
    setProgress(0);
    setDuration(0);
    setError(false);
    if (playing) {
      setLoading(true);
      audio.load();
      audio.play().catch(() => { setPlaying(false); setLoading(false); });
    }
  }, [surahIdx, reciterIdx]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      if (!audio.src || audio.src === window.location.href) {
        audio.src = reciter.getUrl(surahNum);
      }
      setLoading(true);
      setError(false);
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const prev = () => setSurahIdx(i => (i - 1 + SURAHS.length) % SURAHS.length);
  const next = () => setSurahIdx(i => (i + 1) % SURAHS.length);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <section className="pt-8 pb-6 bg-secondary/90">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-4">
          <h2 className="text-white text-3xl md:text-4xl font-bold font-serif tracking-widest drop-shadow-lg"
              style={{ WebkitTextStroke: "1.5px #c8a84b", textShadow: "0 0 18px rgba(200,168,75,0.5)" }}>
            🤲 صدقة جارية
          </h2>
          <p className="text-white/60 text-xs mt-0.5">استمع إلى كلام الله</p>
        </div>
        {error && (
          <p className="text-center text-red-400 text-xs mb-3">⚠️ تعذّر تحميل الصوت — جرّب قارئاً آخر</p>
        )}
        <div className="bg-card border border-border/60 rounded-3xl shadow-2xl">
          <div className="bg-gradient-to-l from-primary/90 to-primary/70 px-6 py-4 flex items-center justify-between rounded-t-3xl">
            <div className="text-white">
              <p className="text-xs opacity-80 mb-0.5">القرآن الكريم</p>
              <h3 className="font-bold text-lg font-serif">سورة {SURAHS[surahIdx]}</h3>
              <p className="text-xs opacity-70">{reciter.name}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
              🕌
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-8 text-left">{fmt(progress)}</span>
              <input
                type="range" min={0} max={duration || 1} value={progress} step={0.5}
                onChange={e => {
                  const v = Number(e.target.value);
                  setProgress(v);
                  if (audioRef.current) audioRef.current.currentTime = v;
                }}
                className="flex-1 h-1.5 rounded-full accent-primary cursor-pointer"
              />
              <span className="text-xs text-muted-foreground w-8">{fmt(duration)}</span>
            </div>

            <div className="flex items-center justify-between">
              <button onClick={() => setMuted(m => !m)} className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground">
                {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <div className="flex items-center gap-3">
                <button onClick={prev} className="p-2.5 rounded-full bg-muted hover:bg-primary/10 transition-colors">
                  <SkipForward className="w-5 h-5 text-foreground" />
                </button>
                <button
                  onClick={togglePlay}
                  disabled={loading}
                  className="w-13 h-13 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60"
                  style={{ width: 52, height: 52 }}
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : playing ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 mr-[-2px]" />
                  )}
                </button>
                <button onClick={next} className="p-2.5 rounded-full bg-muted hover:bg-primary/10 transition-colors">
                  <SkipBack className="w-5 h-5 text-foreground" />
                </button>
              </div>

              <div className="relative">
                <select
                  value={reciterIdx}
                  onChange={e => { setReciterIdx(Number(e.target.value)); setPlaying(false); }}
                  className="text-xs bg-muted border border-border rounded-xl px-2 py-1.5 pr-6 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
                >
                  {RECITERS.map((r, i) => <option key={i} value={i}>{r.name}</option>)}
                </select>
                <ChevronDown className="w-3 h-3 absolute left-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowSurahList(s => !s)}
                className="w-full flex items-center justify-between bg-muted/60 hover:bg-muted px-4 py-2.5 rounded-2xl text-sm font-medium transition-colors border border-border/40"
              >
                <span>اختر السورة — {surahIdx + 1}. {SURAHS[surahIdx]}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showSurahList ? "rotate-180" : ""}`} />
              </button>

              {showSurahList && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-border/60 rounded-2xl shadow-xl z-20 max-h-56 overflow-y-auto">
                  {SURAHS.map((name, i) => (
                    <button
                      key={i}
                      onClick={() => { setSurahIdx(i); setShowSurahList(false); setPlaying(false); }}
                      className={`w-full text-right px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors flex items-center gap-2 ${i === surahIdx ? "bg-primary/10 text-primary font-bold" : ""}`}
                    >
                      <span className="text-xs text-muted-foreground w-6 text-left">{i + 1}</span>
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        preload="none"
        onTimeUpdate={() => setProgress(audioRef.current?.currentTime ?? 0)}
        onDurationChange={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => { setPlaying(false); next(); }}
        onPlay={() => { setPlaying(true); setLoading(false); setError(false); }}
        onPause={() => setPlaying(false)}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onError={() => { setError(true); setPlaying(false); setLoading(false); }}
      />
    </section>
  );
}
