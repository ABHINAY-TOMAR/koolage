import { useState, useEffect, useCallback, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { X, Minus, Play, Pause, Volume2, VolumeX, Youtube, Speech } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { cn } from '@/lib/utils';

interface DockPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

const DEFAULT_POSITION: DockPosition = {
  x: window.innerWidth - 420,
  y: window.innerHeight - 320,
  width: 400,
  height: 300,
};

const MIN_SIZE = { width: 280, height: 200 };

const neuRaised = "6px 6px 14px hsl(var(--neu-shadow-dark)), -6px -6px 14px hsl(var(--neu-shadow-light))";
const neuBg = "hsl(var(--neu-bg))";

export function FloatingDock() {
  const { dockVisible, dockContent, hideDock } = useAppStore();
  const [position, setPosition] = useState<DockPosition>(() => {
    const saved = localStorage.getItem('kolage-dock-position');
    return saved ? JSON.parse(saved) : DEFAULT_POSITION;
  });
  const [minimized, setMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    localStorage.setItem('kolage-dock-position', JSON.stringify(position));
  }, [position]);

  const startTTS = useCallback(() => {
    if (dockContent?.type === 'tts' && dockContent.text) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(dockContent.text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onend = () => setIsPlaying(false);
      speechRef.current = utterance;
      speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  }, [dockContent]);

  const toggleTTS = useCallback(() => {
    if (isPlaying) {
      speechSynthesis.pause();
      setIsPlaying(false);
    } else if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setIsPlaying(true);
    } else {
      startTTS();
    }
  }, [isPlaying, startTTS]);

  const stopTTS = useCallback(() => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    return () => { speechSynthesis.cancel(); };
  }, []);

  useEffect(() => {
    if (!dockVisible) stopTTS();
  }, [dockVisible, stopTTS]);

  if (!dockVisible || !dockContent) return null;

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match?.[1] || '';
  };

  return (
    <Rnd
      position={{ x: position.x, y: position.y }}
      size={{ width: position.width, height: minimized ? 52 : position.height }}
      minWidth={MIN_SIZE.width}
      minHeight={MIN_SIZE.height}
      bounds="window"
      dragHandleClassName="dock-handle"
      onDragStop={(_, d) => {
        setPosition(prev => ({ ...prev, x: d.x, y: d.y }));
      }}
      onResizeStop={(_, __, ref, ___, pos) => {
        setPosition({
          x: pos.x,
          y: pos.y,
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
      }}
      enableResizing={!minimized}
      className="z-50"
    >
      <div
        className={cn(
          "flex flex-col overflow-hidden rounded-2xl transition-all duration-200",
          minimized ? "h-[52px]" : "h-full"
        )}
        style={{
          background: neuBg,
          boxShadow: neuRaised,
        }}
      >
        {/* Header / drag handle */}
        <div
          className="dock-handle flex h-[52px] shrink-0 items-center justify-between px-4 cursor-grab active:cursor-grabbing rounded-t-2xl"
          style={{
            background: neuBg,
            boxShadow: "0 3px 8px hsl(var(--neu-shadow-dark) / 0.3)",
          }}
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            {dockContent.type === 'youtube' ? (
              <>
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-lg"
                  style={{
                    background: "hsl(0 72% 51%)",
                    boxShadow: "2px 2px 5px hsl(var(--neu-shadow-dark)), -1px -1px 3px hsl(var(--neu-shadow-light))",
                  }}
                >
                  <Youtube className="h-3.5 w-3.5 text-white" />
                </div>
                <span>Video Player</span>
              </>
            ) : (
              <>
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-lg"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--spark-glow)), hsl(var(--spark)))",
                    boxShadow: "2px 2px 5px hsl(var(--neu-shadow-dark)), -1px -1px 3px hsl(var(--neu-shadow-light))",
                  }}
                >
                  <Speech className="h-3.5 w-3.5 text-white" />
                </div>
                <span>Text to Speech</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMinimized(!minimized)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-light hover:text-ink transition-all"
              style={{
                background: neuBg,
                boxShadow: "2px 2px 5px hsl(var(--neu-shadow-dark)), -2px -2px 5px hsl(var(--neu-shadow-light))",
              }}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={hideDock}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-light hover:text-destructive transition-all"
              style={{
                background: neuBg,
                boxShadow: "2px 2px 5px hsl(var(--neu-shadow-dark)), -2px -2px 5px hsl(var(--neu-shadow-light))",
              }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!minimized && (
          <div className="flex-1 overflow-hidden">
            {dockContent.type === 'youtube' && dockContent.url && (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${getYouTubeId(dockContent.url)}?autoplay=0`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="border-0"
              />
            )}

            {dockContent.type === 'tts' && (
              <div className="flex h-full flex-col items-center justify-center gap-5 p-5">
                {/* Text preview — inset */}
                <div
                  className="max-h-28 w-full overflow-y-auto rounded-xl p-3 text-sm text-ink-light"
                  style={{
                    background: neuBg,
                    boxShadow: "inset 3px 3px 7px hsl(var(--neu-shadow-dark)), inset -3px -3px 7px hsl(var(--neu-shadow-light))",
                  }}
                >
                  {dockContent.text?.slice(0, 200)}
                  {(dockContent.text?.length || 0) > 200 && '...'}
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Play/Pause — spark glow */}
                  <button
                    onClick={toggleTTS}
                    className="flex h-14 w-14 items-center justify-center rounded-full text-white transition-all duration-200"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--spark-glow)), hsl(var(--spark)))",
                      boxShadow: "4px 4px 10px hsl(var(--neu-shadow-dark)), -2px -2px 6px hsl(var(--neu-shadow-light)), 0 0 18px hsl(var(--spark)/0.4)",
                    }}
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6 ml-0.5" />
                    )}
                  </button>

                  {/* Mute */}
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-ink-light hover:text-ink transition-all duration-200"
                    style={{
                      background: neuBg,
                      boxShadow: isMuted
                        ? "inset 2px 2px 5px hsl(var(--neu-shadow-dark)), inset -2px -2px 5px hsl(var(--neu-shadow-light))"
                        : "3px 3px 7px hsl(var(--neu-shadow-dark)), -3px -3px 7px hsl(var(--neu-shadow-light))",
                    }}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                </div>

                <p className="text-xs text-ink-faint">
                  {isPlaying ? 'Playing...' : 'Press play to listen'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Rnd>
  );
}
