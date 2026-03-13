import { useState, useEffect } from "react";
import {
  Moon, Sun, Monitor, RotateCcw, Bell, BellOff,
  Palette, Bot, Shield, Accessibility, Keyboard,
  ChevronRight, Check, Volume2, VolumeX, Eye, EyeOff,
  Zap, Globe, Save,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ── Theme helpers ──────────────────────────────────────────
type Theme = "light" | "dark" | "system";

function getTheme(): Theme {
  return (localStorage.getItem("kolage-theme") as Theme) || "system";
}
function applyTheme(t: Theme) {
  localStorage.setItem("kolage-theme", t);
  const root = document.documentElement;
  if (t === "dark") root.classList.add("dark");
  else if (t === "light") root.classList.remove("dark");
  else root.classList.toggle("dark", window.matchMedia("(prefers-color-scheme: dark)").matches);
}
// Init on load
applyTheme(getTheme());

// ── Local storage helpers ──────────────────────────────────
function ls<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v !== null ? (JSON.parse(v) as T) : fallback; }
  catch { return fallback; }
}
function lsSet(key: string, val: unknown) { localStorage.setItem(key, JSON.stringify(val)); }

// ── Sub-components ─────────────────────────────────────────
const NEU_BG = "hsl(var(--neu-bg))";
const RAISED = "4px 4px 10px hsl(var(--neu-shadow-dark)), -4px -4px 10px hsl(var(--neu-shadow-light))";
const INSET  = "inset 3px 3px 7px hsl(var(--neu-shadow-dark)), inset -3px -3px 7px hsl(var(--neu-shadow-light))";

function SectionTitle({ icon: Icon, label }: { icon: typeof Sun; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "hsl(var(--spark))", boxShadow: "0 0 8px hsl(var(--spark)/0.35)" }}>
        <Icon className="h-3.5 w-3.5 text-white" />
      </div>
      <h3 className="text-sm font-bold text-ink">{label}</h3>
    </div>
  );
}

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        {description && <p className="text-xs text-ink-faint mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative shrink-0 h-6 w-11 rounded-full transition-all duration-300"
        style={{
          background: checked ? "hsl(var(--spark))" : NEU_BG,
          boxShadow: checked ? "inset 2px 2px 5px rgba(0,0,0,0.2)" : INSET,
        }}
      >
        <span
          className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-all duration-300 shadow-sm"
          style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
        />
      </button>
    </div>
  );
}

function SelectRow({ label, value, options, onChange, description }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void; description?: string;
}) {
  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink">{label}</p>
          {description && <p className="text-xs text-ink-faint mt-0.5">{description}</p>}
        </div>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="rounded-xl px-3 py-1.5 text-sm text-ink outline-none cursor-pointer"
          style={{ background: NEU_BG, boxShadow: RAISED, border: "none" }}
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="my-1" style={{ height: 1, background: "hsl(var(--neu-shadow-dark)/0.2)" }} />;
}

// ── Settings sections ──────────────────────────────────────
const TABS = [
  { id: "appearance",    label: "Appearance",     icon: Palette       },
  { id: "notifications", label: "Notifications",  icon: Bell          },
  { id: "ai",           label: "AI & Generation", icon: Bot           },
  { id: "privacy",      label: "Privacy",         icon: Shield        },
  { id: "accessibility",label: "Accessibility",   icon: Accessibility },
  { id: "danger",       label: "Danger Zone",     icon: RotateCcw     },
] as const;
type TabId = typeof TABS[number]["id"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: Props) {
  const [tab, setTab] = useState<TabId>("appearance");

  // Appearance
  const [theme,    setThemeState] = useState<Theme>(getTheme);
  const [fontSize, setFontSize]   = useState(() => ls("kolage-font-size", "Medium"));
  const [density,  setDensity]    = useState(() => ls("kolage-density",   "Comfortable"));

  // Notifications
  const [notifQuests,      setNotifQuests]      = useState(() => ls("notif-quests",      true));
  const [notifAchieve,     setNotifAchieve]     = useState(() => ls("notif-achieve",     true));
  const [notifStreak,      setNotifStreak]      = useState(() => ls("notif-streak",      true));
  const [notifSound,       setNotifSound]       = useState(() => ls("notif-sound",       true));
  const [notifNewContent,  setNotifNewContent]  = useState(() => ls("notif-content",     false));

  // AI
  const [aiModel,    setAiModel]    = useState(() => ls("ai-model",     "Gemini Pro"));
  const [aiLang,     setAiLang]     = useState(() => ls("ai-lang",      "English"));
  const [autoSave,   setAutoSave]   = useState(() => ls("ai-autosave",  true));
  const [aiSuggest,  setAiSuggest]  = useState(() => ls("ai-suggest",   true));
  const [smartSumm,  setSmartSumm]  = useState(() => ls("ai-smartsumm", true));

  // Privacy
  const [analytics,  setAnalytics]  = useState(() => ls("priv-analytics",  true));
  const [history,    setHistory]    = useState(() => ls("priv-history",     true));
  const [publicProf, setPublicProf] = useState(() => ls("priv-publicprof",  true));
  const [datashare,  setDatashare]  = useState(() => ls("priv-datashare",   false));

  // Accessibility
  const [reduceMotion, setReduceMotion] = useState(() => ls("a11y-motion",   false));
  const [highContrast, setHighContrast] = useState(() => ls("a11y-contrast", false));
  const [shortcuts,    setShortcuts]    = useState(() => ls("a11y-shortcuts", true));

  // Persist
  useEffect(() => { applyTheme(theme); }, [theme]);
  useEffect(() => { lsSet("kolage-font-size", fontSize); }, [fontSize]);
  useEffect(() => { lsSet("kolage-density",   density); }, [density]);
  useEffect(() => { lsSet("notif-quests",     notifQuests); }, [notifQuests]);
  useEffect(() => { lsSet("notif-achieve",    notifAchieve); }, [notifAchieve]);
  useEffect(() => { lsSet("notif-streak",     notifStreak); }, [notifStreak]);
  useEffect(() => { lsSet("notif-sound",      notifSound); }, [notifSound]);
  useEffect(() => { lsSet("notif-content",    notifNewContent); }, [notifNewContent]);
  useEffect(() => { lsSet("ai-model",         aiModel); }, [aiModel]);
  useEffect(() => { lsSet("ai-lang",          aiLang); }, [aiLang]);
  useEffect(() => { lsSet("ai-autosave",      autoSave); }, [autoSave]);
  useEffect(() => { lsSet("ai-suggest",       aiSuggest); }, [aiSuggest]);
  useEffect(() => { lsSet("ai-smartsumm",     smartSumm); }, [smartSumm]);
  useEffect(() => { lsSet("priv-analytics",   analytics); }, [analytics]);
  useEffect(() => { lsSet("priv-history",     history); }, [history]);
  useEffect(() => { lsSet("priv-publicprof",  publicProf); }, [publicProf]);
  useEffect(() => { lsSet("priv-datashare",   datashare); }, [datashare]);
  useEffect(() => { lsSet("a11y-motion",      reduceMotion); }, [reduceMotion]);
  useEffect(() => { lsSet("a11y-contrast",    highContrast); }, [highContrast]);
  useEffect(() => { lsSet("a11y-shortcuts",   shortcuts); }, [shortcuts]);

  const handleReset = () => {
    if (confirm("This will clear all local data (settings, gamification, history). Continue?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const themes: { id: Theme; icon: typeof Sun; label: string }[] = [
    { id: "light",  icon: Sun,     label: "Light"  },
    { id: "dark",   icon: Moon,    label: "Dark"   },
    { id: "system", icon: Monitor, label: "System" },
  ];

  const SHORTCUTS = [
    { keys: "Ctrl + K", action: "Global search"        },
    { keys: "Ctrl + /", action: "New chat"              },
    { keys: "Ctrl + B", action: "Toggle sidebar"        },
    { keys: "Ctrl + Z", action: "Undo (whiteboard)"     },
    { keys: "Ctrl + S", action: "Save current document" },
    { keys: "Esc",      action: "Close panel / dialog"  },
    { keys: "V",        action: "Select tool (board)"   },
    { keys: "P",        action: "Pencil tool (board)"   },
    { keys: "H",        action: "Pan tool (board)"      },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden"
        style={{
          maxWidth: 700,
          width: "95vw",
          background: NEU_BG,
          boxShadow: "12px 12px 28px hsl(var(--neu-shadow-dark)), -8px -8px 20px hsl(var(--neu-shadow-light))",
          border: "none",
          borderRadius: 24,
        }}
      >
        <div className="flex h-[560px]">
          {/* ── Sidebar tabs ── */}
          <div
            className="flex flex-col gap-0.5 p-3 w-48 shrink-0"
            style={{ background: NEU_BG, borderRight: "1px solid hsl(var(--neu-shadow-dark)/0.25)" }}
          >
            <p className="px-3 pt-2 pb-3 text-base font-black text-ink">Settings</p>
            {TABS.map(t => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-left transition-all duration-150",
                    t.id === "danger" ? (active ? "text-red-500" : "text-red-400 hover:text-red-500") : ""
                  )}
                  style={{
                    background:  active ? "hsl(var(--neu-bg-dark))" : "transparent",
                    color:       t.id === "danger" ? undefined : active ? "hsl(var(--ink))" : "hsl(var(--ink-light))",
                    fontWeight:  active ? 600 : 400,
                    boxShadow:   active ? INSET : "none",
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "hsl(var(--neu-bg-dark))"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <t.icon className="h-4 w-4 shrink-0" />
                  {t.label}
                  {active && <ChevronRight className="ml-auto h-3 w-3 opacity-50" />}
                </button>
              );
            })}
            {/* Version */}
            <div className="mt-auto px-3 pb-2">
              <p className="text-[10px] text-ink-faint">Kolage v1.0</p>
              <p className="text-[10px] text-ink-faint">Built with ❤️</p>
            </div>
          </div>

          {/* ── Content pane ── */}
          <div className="flex-1 overflow-y-auto p-6">

            {/* APPEARANCE */}
            {tab === "appearance" && (
              <div>
                <SectionTitle icon={Palette} label="Appearance" />

                {/* Theme */}
                <div className="mb-5">
                  <p className="text-xs font-semibold text-ink-faint uppercase tracking-wider mb-3">Theme</p>
                  <div className="grid grid-cols-3 gap-2">
                    {themes.map(({ id, icon: Icon, label }) => {
                      const active = theme === id;
                      return (
                        <button
                          key={id}
                          onClick={() => setThemeState(id)}
                          className="flex flex-col items-center gap-2 rounded-2xl py-4 transition-all duration-200"
                          style={{
                            background: active ? "hsl(var(--spark))" : NEU_BG,
                            boxShadow: active ? "inset 2px 2px 6px rgba(0,0,0,0.15)" : RAISED,
                            color: active ? "#fff" : "hsl(var(--ink-light))",
                          }}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs font-semibold">{label}</span>
                          {active && <Check className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Divider />

                {/* Font size */}
                <SelectRow
                  label="Font Size"
                  description="Controls text size across the app"
                  value={fontSize}
                  options={["Small", "Medium", "Large", "Extra Large"]}
                  onChange={setFontSize}
                />
                <Divider />
                <SelectRow
                  label="Layout Density"
                  description="How compact or spacious the UI feels"
                  value={density}
                  options={["Compact", "Comfortable", "Spacious"]}
                  onChange={setDensity}
                />
              </div>
            )}

            {/* NOTIFICATIONS */}
            {tab === "notifications" && (
              <div>
                <SectionTitle icon={Bell} label="Notifications" />
                <Toggle checked={notifQuests}     onChange={setNotifQuests}     label="Daily Quest reminders"      description="Nudges when new quests are available" />
                <Divider />
                <Toggle checked={notifAchieve}    onChange={setNotifAchieve}    label="Achievement unlocked"       description="Celebrate when you hit a milestone" />
                <Divider />
                <Toggle checked={notifStreak}     onChange={setNotifStreak}     label="Streak alerts"              description="Remind me before my streak breaks" />
                <Divider />
                <Toggle checked={notifNewContent} onChange={setNotifNewContent} label="New community content"      description="Notify when trending content is posted" />
                <Divider />
                <Toggle checked={notifSound}      onChange={setNotifSound}      label="Sound effects"              description="Play sounds for achievements and XP" />
              </div>
            )}

            {/* AI */}
            {tab === "ai" && (
              <div>
                <SectionTitle icon={Bot} label="AI & Generation" />
                <SelectRow
                  label="AI Model"
                  description="Model used for chat and generation"
                  value={aiModel}
                  options={["Gemini Pro", "Gemini Flash", "Gemini Ultra"]}
                  onChange={setAiModel}
                />
                <Divider />
                <SelectRow
                  label="Response Language"
                  description="Language for AI-generated content"
                  value={aiLang}
                  options={["English", "Hindi", "Spanish", "French", "German", "Japanese"]}
                  onChange={setAiLang}
                />
                <Divider />
                <Toggle checked={autoSave}  onChange={setAutoSave}  label="Auto-save generations"      description="Automatically save AI outputs to history" />
                <Divider />
                <Toggle checked={aiSuggest} onChange={setAiSuggest} label="Smart suggestions"          description="AI suggests follow-up questions and next steps" />
                <Divider />
                <Toggle checked={smartSumm} onChange={setSmartSumm} label="Auto-summarise long chats"  description="Condense long sessions into a summary card" />
              </div>
            )}

            {/* PRIVACY */}
            {tab === "privacy" && (
              <div>
                <SectionTitle icon={Shield} label="Privacy" />
                <Toggle checked={analytics}  onChange={setAnalytics}  label="Usage analytics"       description="Share anonymous usage data to improve Kolage" />
                <Divider />
                <Toggle checked={history}    onChange={setHistory}    label="Save chat history"     description="Keep a local history of your AI conversations" />
                <Divider />
                <Toggle checked={publicProf} onChange={setPublicProf} label="Public profile"         description="Allow others to see your level and achievements" />
                <Divider />
                <Toggle checked={datashare}  onChange={setDatashare}  label="Content contributions" description="Contribute anonymised study data to the community" />

                <div className="mt-6 rounded-2xl p-4" style={{ background: NEU_BG, boxShadow: INSET }}>
                  <p className="text-xs font-semibold text-ink mb-1">🔒 Your data is local-first</p>
                  <p className="text-xs text-ink-faint leading-relaxed">
                    Kolage stores all your data on your device. Nothing is sent to our servers
                    without your explicit consent. You can export or delete your data at any time.
                  </p>
                </div>
              </div>
            )}

            {/* ACCESSIBILITY */}
            {tab === "accessibility" && (
              <div>
                <SectionTitle icon={Accessibility} label="Accessibility" />
                <Toggle checked={reduceMotion} onChange={setReduceMotion} label="Reduce motion"         description="Minimise animations and transitions" />
                <Divider />
                <Toggle checked={highContrast} onChange={setHighContrast} label="High contrast mode"    description="Increase contrast for better readability" />
                <Divider />
                <Toggle checked={shortcuts}    onChange={setShortcuts}    label="Enable keyboard shortcuts" description="Use keyboard shortcuts to navigate faster" />

                {shortcuts && (
                  <div className="mt-5">
                    <p className="text-xs font-semibold text-ink-faint uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Keyboard className="h-3.5 w-3.5" /> Keyboard Shortcuts
                    </p>
                    <div className="rounded-2xl overflow-hidden" style={{ boxShadow: INSET, background: NEU_BG }}>
                      {SHORTCUTS.map((s, i) => (
                        <div key={i} className={cn("flex items-center justify-between px-4 py-2.5", i < SHORTCUTS.length - 1 && "border-b border-neu-shadow-dark/10")}>
                          <span className="text-xs text-ink-light">{s.action}</span>
                          <kbd className="rounded-lg px-2 py-1 text-[10px] font-bold text-ink" style={{ background: NEU_BG, boxShadow: RAISED }}>
                            {s.keys}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DANGER ZONE */}
            {tab === "danger" && (
              <div>
                <SectionTitle icon={RotateCcw} label="Danger Zone" />

                <div className="space-y-4">
                  <div className="rounded-2xl p-4" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <p className="text-sm font-bold text-red-500 mb-1">Clear Chat History</p>
                    <p className="text-xs text-ink-faint mb-3">Permanently delete all chat sessions. This cannot be undone.</p>
                    <button
                      onClick={() => { if (confirm("Clear all chat history?")) localStorage.removeItem("kolage-history"); }}
                      className="rounded-xl px-4 py-2 text-xs font-bold text-red-500 transition-all duration-200"
                      style={{ background: NEU_BG, boxShadow: RAISED, border: "1px solid rgba(239,68,68,0.3)" }}
                    >
                      Clear History
                    </button>
                  </div>

                  <div className="rounded-2xl p-4" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <p className="text-sm font-bold text-red-500 mb-1">Reset Gamification</p>
                    <p className="text-xs text-ink-faint mb-3">Reset your level, XP, coins, and quests to zero.</p>
                    <button
                      onClick={() => {
                        if (confirm("Reset all gamification data?")) {
                          ["kolage-xp","kolage-coins","kolage-streak","kolage-quests"].forEach(k => localStorage.removeItem(k));
                          window.location.reload();
                        }
                      }}
                      className="rounded-xl px-4 py-2 text-xs font-bold text-red-500 transition-all duration-200"
                      style={{ background: NEU_BG, boxShadow: RAISED, border: "1px solid rgba(239,68,68,0.3)" }}
                    >
                      Reset Progress
                    </button>
                  </div>

                  <div className="rounded-2xl p-4" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.35)" }}>
                    <p className="text-sm font-black text-red-600 mb-1">⚠️ Reset All Data</p>
                    <p className="text-xs text-ink-faint mb-3">Wipe everything — settings, history, gamification. App will reload fresh.</p>
                    <button
                      onClick={handleReset}
                      className="rounded-xl px-4 py-2 text-xs font-black text-white transition-all duration-200"
                      style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 0 10px rgba(239,68,68,0.4)" }}
                    >
                      Reset Everything
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
