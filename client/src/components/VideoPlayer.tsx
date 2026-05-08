import { useState } from "react";
import { Volume2, VolumeX, Maximize2, Globe } from "lucide-react";
import { Button } from "./ui/button";

interface Subtitle {
  start: number;
  end: number;
  text: string;
}

interface VideoPlayerProps {
  src: string;
  title?: string;
  subtitles?: Record<string, Subtitle[]>;
  defaultLanguage?: string;
  autoPlay?: boolean;
}

const SUBTITLE_DATA: Record<string, Subtitle[]> = {
  en: [
    { start: 0, end: 5, text: "Welcome to AI Content Engine" },
    { start: 5, end: 10, text: "Create viral content with AI in seconds" },
    { start: 10, end: 15, text: "Chat with your personal AI assistant" },
    { start: 15, end: 20, text: "Connect all your social accounts securely" },
    { start: 20, end: 25, text: "Schedule posts to multiple platforms at once" },
    { start: 25, end: 30, text: "Track your automation performance in real-time. Start growing your audience today with AI Content Engine." },
  ],
  hi: [
    { start: 0, end: 5, text: "AI Content Engine mein aapka swagat hai" },
    { start: 5, end: 10, text: "AI ke saath viral content banaye seconds mein" },
    { start: 10, end: 15, text: "Apne personal AI assistant ke saath chat kare" },
    { start: 15, end: 20, text: "Sab social accounts ko securely connect kare" },
    { start: 20, end: 25, text: "Multiple platforms par ek saath posts schedule kare" },
    { start: 25, end: 30, text: "Real-time mein apna automation performance track kare. AI Content Engine ke saath aaj hi shuru kare." },
  ],
  es: [
    { start: 0, end: 5, text: "Bienvenido a AI Content Engine" },
    { start: 5, end: 10, text: "Crea contenido viral con IA en segundos" },
    { start: 10, end: 15, text: "Chatea con tu asistente de IA personal" },
    { start: 15, end: 20, text: "Conecta todas tus cuentas de redes sociales de forma segura" },
    { start: 20, end: 25, text: "Programa publicaciones en múltiples plataformas a la vez" },
    { start: 25, end: 30, text: "Realiza un seguimiento del rendimiento de tu automatización en tiempo real. Comienza a crecer tu audiencia hoy." },
  ],
  fr: [
    { start: 0, end: 5, text: "Bienvenue sur AI Content Engine" },
    { start: 5, end: 10, text: "Créez du contenu viral avec l'IA en secondes" },
    { start: 10, end: 15, text: "Discutez avec votre assistant IA personnel" },
    { start: 15, end: 20, text: "Connectez tous vos comptes de réseaux sociaux en toute sécurité" },
    { start: 20, end: 25, text: "Programmez des publications sur plusieurs plateformes à la fois" },
    { start: 25, end: 30, text: "Suivez les performances de votre automatisation en temps réel. Commencez à développer votre audience aujourd'hui." },
  ],
  de: [
    { start: 0, end: 5, text: "Willkommen bei AI Content Engine" },
    { start: 5, end: 10, text: "Erstellen Sie virale Inhalte mit KI in Sekunden" },
    { start: 10, end: 15, text: "Chatten Sie mit Ihrem persönlichen KI-Assistenten" },
    { start: 15, end: 20, text: "Verbinden Sie alle Ihre Social-Media-Konten sicher" },
    { start: 20, end: 25, text: "Planen Sie Beiträge auf mehreren Plattformen gleichzeitig" },
    { start: 25, end: 30, text: "Verfolgen Sie die Leistung Ihrer Automatisierung in Echtzeit. Beginnen Sie heute mit dem Wachstum Ihrer Zielgruppe." },
  ],
  pt: [
    { start: 0, end: 5, text: "Bem-vindo ao AI Content Engine" },
    { start: 5, end: 10, text: "Crie conteúdo viral com IA em segundos" },
    { start: 10, end: 15, text: "Converse com seu assistente de IA pessoal" },
    { start: 15, end: 20, text: "Conecte todas as suas contas de redes sociais com segurança" },
    { start: 20, end: 25, text: "Agende postagens em várias plataformas simultaneamente" },
    { start: 25, end: 30, text: "Acompanhe o desempenho da sua automação em tempo real. Comece a crescer sua audiência hoje." },
  ],
  ja: [
    { start: 0, end: 5, text: "AI Content Engineへようこそ" },
    { start: 5, end: 10, text: "AIを使用してバイラルコンテンツを数秒で作成" },
    { start: 10, end: 15, text: "パーソナルAIアシスタントとチャット" },
    { start: 15, end: 20, text: "すべてのソーシャルメディアアカウントを安全に接続" },
    { start: 20, end: 25, text: "複数のプラットフォームに同時に投稿をスケジュール" },
    { start: 25, end: 30, text: "リアルタイムで自動化のパフォーマンスを追跡。今日からオーディエンスを成長させましょう。" },
  ],
  zh: [
    { start: 0, end: 5, text: "欢迎来到AI内容引擎" },
    { start: 5, end: 10, text: "使用AI在几秒内创建病毒式内容" },
    { start: 10, end: 15, text: "与您的个人AI助手聊天" },
    { start: 15, end: 20, text: "安全地连接所有社交媒体帐户" },
    { start: 20, end: 25, text: "同时在多个平台上安排帖子" },
    { start: 25, end: 30, text: "实时跟踪您的自动化性能。立即开始增长您的受众。" },
  ],
  ar: [
    { start: 0, end: 5, text: "مرحبا بك في محرك المحتوى بالذكاء الاصطناعي" },
    { start: 5, end: 10, text: "أنشئ محتوى فيروسي مع الذكاء الاصطناعي في ثوان" },
    { start: 10, end: 15, text: "تحدث مع مساعدك الذكي الشخصي" },
    { start: 15, end: 20, text: "قم بربط جميع حسابات وسائل التواصل الاجتماعي بأمان" },
    { start: 20, end: 25, text: "جدول المنشورات على منصات متعددة في نفس الوقت" },
    { start: 25, end: 30, text: "تتبع أداء الأتمتة الخاصة بك في الوقت الفعلي. ابدأ بتنمية جمهورك اليوم." },
  ],
  ru: [
    { start: 0, end: 5, text: "Добро пожаловать в AI Content Engine" },
    { start: 5, end: 10, text: "Создавайте вирусный контент с помощью ИИ за секунды" },
    { start: 10, end: 15, text: "Общайтесь со своим личным помощником на основе ИИ" },
    { start: 15, end: 20, text: "Безопасно подключайте все свои учетные записи в социальных сетях" },
    { start: 20, end: 25, text: "Планируйте посты на нескольких платформах одновременно" },
    { start: 25, end: 30, text: "Отслеживайте производительность вашей автоматизации в реальном времени. Начните развивать свою аудиторию сегодня." },
  ],
};

export default function VideoPlayer({
  src,
  title = "AI Content Engine Demo",
  subtitles = SUBTITLE_DATA,
  defaultLanguage = "en",
  autoPlay = false,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getCurrentSubtitle = () => {
    const currentSubs = subtitles[selectedLanguage] || [];
    return currentSubs.find(
      (sub) => currentTime >= sub.start && currentTime < sub.end
    )?.text;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleFullscreen = () => {
    const videoElement = document.getElementById(`video-${title}`) as HTMLVideoElement;
    if (videoElement) {
      if (!document.fullscreenElement) {
        videoElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (time: number) => {
    if (!time) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-black rounded-lg overflow-hidden shadow-2xl">
      {/* Video Container */}
      <div className="relative bg-black aspect-video">
        <video
          id={`video-${title}`}
          src={src}
          className="w-full h-full"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onVolumeChange={(e) => setIsMuted(e.currentTarget.muted)}
          muted={isMuted}
          controls={false}
        />

        {/* Subtitle Overlay */}
        {getCurrentSubtitle() && (
          <div className="absolute bottom-24 left-0 right-0 text-center px-4 py-2">
            <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg inline-block max-w-2xl">
              <p className="text-white text-lg font-medium">{getCurrentSubtitle()}</p>
            </div>
          </div>
        )}

        {/* Play Button Overlay */}
        {!isPlaying && (
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition"
          >
            <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition">
              <div className="w-0 h-0 border-l-12 border-l-transparent border-r-0 border-t-8 border-t-transparent border-b-8 border-b-transparent ml-1" style={{
                borderLeft: "15px solid #000",
                borderTop: "10px solid transparent",
                borderBottom: "10px solid transparent",
              }} />
            </div>
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="bg-slate-900 p-4 space-y-3">
        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-10">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => {
              const video = document.getElementById(`video-${title}`) as HTMLVideoElement;
              if (video) {
                video.currentTime = parseFloat(e.target.value);
              }
            }}
            className="flex-1 h-1 bg-gray-700 rounded cursor-pointer accent-purple-500"
          />
          <span className="text-xs text-gray-400 w-10 text-right">{formatTime(duration)}</span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <Button
              onClick={handlePlayPause}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-slate-800"
            >
              {isPlaying ? "⏸" : "▶"}
            </Button>

            {/* Mute */}
            <Button
              onClick={() => {
                const video = document.getElementById(`video-${title}`) as HTMLVideoElement;
                if (video) {
                  video.muted = !video.muted;
                  setIsMuted(!isMuted);
                }
              }}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-slate-800"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center gap-1">
              <Globe size={16} className="text-gray-400" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-slate-800 text-white text-xs px-2 py-1 rounded border border-slate-700 cursor-pointer"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="pt">Português</option>
                <option value="ja">日本語</option>
                <option value="zh">中文</option>
                <option value="ar">العربية</option>
                <option value="ru">Русский</option>
              </select>
            </div>

            {/* Fullscreen */}
            <Button
              onClick={handleFullscreen}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-slate-800"
            >
              <Maximize2 size={18} />
            </Button>
          </div>
        </div>

        {/* Title */}
        <div className="text-sm text-gray-300 text-center">{title}</div>
      </div>
    </div>
  );
}
