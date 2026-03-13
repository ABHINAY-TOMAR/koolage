import { useState, useRef, useEffect } from "react";
import {
  MessageSquare, LayoutDashboard, Compass, User,
  Settings, BookMarked, LogOut, Edit3, X, PanelRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, AppMode } from "@/stores/useAppStore";
import { SettingsDialog } from "./SettingsDialog";

// Remove unused NEU_BG const since we use tailwind classes now

const modeItems: { mode: AppMode; icon: typeof MessageSquare; label: string }[] = [
  { mode: "chat",    icon: MessageSquare,   label: "Chat"    },
  { mode: "board",   icon: LayoutDashboard, label: "Board"   },
  { mode: "explore", icon: Compass,         label: "Explore" },
];

// ── Profile panel ────────────────────────────────────────────
function ProfilePanel({ onClose, onSettings }: { onClose: () => void; onSettings: () => void }) {
  const menu = [
    { icon: Edit3,      label: "Edit Profile",      action: onClose },
    { icon: BookMarked, label: "Saved Content",       action: onClose },
    { icon: Settings,   label: "Settings",            action: () => { onClose(); onSettings(); } },
  ];

  return (
    <div
      className="absolute top-full right-0 mt-2 z-50"
      className="absolute top-full right-0 mt-2 z-50 w-[300px] rounded-[20px] overflow-hidden bg-[hsl(var(--neu-bg))] shadow-[12px_12px_28px_hsl(var(--neu-shadow-dark)),-8px_-8px_20px_hsl(var(--neu-shadow-light)),0_0_0_1px_hsl(var(--neu-shadow-dark)/0.12)]"
    >
      {/* Hero */}
      <div className="relative p-5 pb-4 bg-gradient-to-br from-[#fb923c] to-[#f97316]">
        <button
          onClick={onClose}
          title="Close profile panel"
          aria-label="Close profile panel"
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(0,0,0,0.2)]"
        >
          <X className="h-3 w-3 text-white" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-black text-white bg-[rgba(255,255,255,0.22)] shadow-[0_4px_14px_rgba(0,0,0,0.2)]"
          >
            U
          </div>
          <div>
            <p className="font-black text-white text-base leading-tight">User</p>
            <p className="text-white/60 text-xs mt-0.5">user@kolage.ai</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="p-3">
        {menu.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-light transition-all duration-150"
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "hsl(var(--neu-bg-dark))"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}

        <div className="mt-1 h-[1px] bg-[hsl(var(--neu-shadow-dark)/0.2)]" />

        <button
          onClick={onClose}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 hover:text-red-500 transition-all duration-150 mt-1"
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ── TopNav ───────────────────────────────────────────────────
export function TopNav() {
  const { mode, setMode, rightSidebarOpen, toggleRightSidebar } = useAppStore();

  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile panel on outside click
  useEffect(() => {
    if (!showProfile) return;
    const fn = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [showProfile]);

  return (
    <>
    <header
      className="flex h-16 items-center justify-between px-5 relative z-30 bg-[hsl(var(--neu-bg))] border-b-2 border-[hsl(var(--neu-shadow-dark)/0.2)]"
    >
      {/* Spacer left (mirrors right side width for true centering) */}
      <div className="flex items-center w-48" />

      {/* Mode switcher — absolutely centered */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <div
          className="flex items-center gap-1 rounded-2xl p-1.5 neu-inset bg-[hsl(var(--neu-bg))]"
        >
          {modeItems.map((item) => {
            const active = mode === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => setMode(item.mode)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 select-none",
                  active ? "neu-spark text-white" : "text-ink-light hover:text-ink"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">

        {/* ── Right Sidebar Toggle ── */}
        <button
          onClick={toggleRightSidebar}
          aria-label="Toggle right panel"
          className={cn("flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200", rightSidebarOpen ? "bg-gradient-to-br from-[#fb923c] to-[#f97316] shadow-[inset_3px_3px_7px_rgba(0,0,0,0.15)]" : "bg-[hsl(var(--neu-bg))] shadow-[4px_4px_10px_hsl(var(--neu-shadow-dark)),-4px_-4px_10px_hsl(var(--neu-shadow-light))]")}
        >
          <PanelRight
            className={cn("h-4 w-4 transition-colors", rightSidebarOpen ? "text-[#fff]" : "text-[hsl(var(--ink-light))]")}
          />
        </button>

        {/* Profile avatar */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(v => !v)}
            title="Profile"
            aria-label="Profile"
            className={cn("flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200", showProfile ? "bg-gradient-to-br from-[#fb923c] to-[#f97316] shadow-[inset_2px_2px_6px_rgba(0,0,0,0.2)]" : "bg-[hsl(var(--neu-bg))] shadow-[4px_4px_10px_hsl(var(--neu-shadow-dark)),-4px_-4px_10px_hsl(var(--neu-shadow-light))]")}
          >
            <User className={cn("h-5 w-5", showProfile ? "text-white" : "text-ink-light")} />
          </button>
          {showProfile && (
            <ProfilePanel
              onClose={() => setShowProfile(false)}
              onSettings={() => setShowSettings(true)}
            />
          )}
        </div>
      </div>
    </header>

    <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </>
  );
}
