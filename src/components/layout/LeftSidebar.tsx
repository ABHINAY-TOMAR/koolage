import { useState } from "react";
import {
  Settings, ChevronLeft, ChevronRight, Pin, PinOff,
  LayoutGrid, Image, Video, Mic, FileText,
  Brain, Presentation, Table, Download,
  Clock, Plus, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, AppMode } from "@/stores/useAppStore";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SettingsDialog } from "./SettingsDialog";

const NEU_BG = "hsl(var(--neu-bg))";

const HISTORY_ITEMS = [
  { id: "h1", title: "AI Study Guide - Physics",  time: "2h ago"    },
  { id: "h2", title: "Quantum Computing Slides",   time: "Yesterday" },
  { id: "h3", title: "Machine Learning Notes",     time: "Yesterday" },
  { id: "h4", title: "React Architecture Map",     time: "2 days ago"},
  { id: "h5", title: "Biology Chapter 5 Podcast",  time: "3 days ago"},
  { id: "h6", title: "CSS Grid Cheatsheet",        time: "4 days ago"},
  { id: "h7", title: "Calculus Problem Set",       time: "Last week" },
  { id: "h8", title: "Marketing Strategy Deck",    time: "Last week" },
];

interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  mode?: AppMode;
}

const TOP_NAV: NavItem[] = [
  { id: "new-chat", icon: Plus,   label: "New Chat", mode: "chat" },
  { id: "search",   icon: Search, label: "Search"   },
];

const CONTENT_NAV: NavItem[] = [
  { id: "gallery",       icon: LayoutGrid,   label: "Gallery",       mode: "explore" },
  { id: "illustrations", icon: Image,        label: "Illustrations", mode: "explore" },
  { id: "videos",        icon: Video,        label: "Videos",        mode: "explore" },
  { id: "podcasts",      icon: Mic,          label: "Podcasts",      mode: "explore" },
  { id: "docs",          icon: FileText,     label: "Docs",          mode: "board"   },
  { id: "maps",          icon: Brain,        label: "Maps",          mode: "board"   },
  { id: "slides",        icon: Presentation, label: "Slides",        mode: "board"   },
  { id: "sheets",        icon: Table,        label: "Sheets",        mode: "board"   },
  { id: "downloads",     icon: Download,     label: "Downloads"                      },
];

export function LeftSidebar() {
  const { leftSidebarOpen, toggleLeftSidebar, setMode, addBoardTab } = useAppStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeId, setActiveId]         = useState<string>("gallery");
  const [hovered, setHovered]           = useState(false);

  // Sidebar is "open" if pinned OR hovered
  const isOpen = leftSidebarOpen || hovered;

  const handleNavClick = (item: NavItem) => {
    setActiveId(item.id);
    if (item.id === "new-chat") { setMode("chat");  return; }
    if (item.id === "docs")     { setMode("board"); addBoardTab("page");       return; }
    if (item.id === "maps")     { setMode("board"); addBoardTab("whiteboard"); return; }
    if (item.id === "slides")   { setMode("board"); addBoardTab("slide");      return; }
    if (item.id === "sheets")   { setMode("board"); addBoardTab("sheet");      return; }
    if (item.mode) setMode(item.mode);
  };

  const NavButton = ({ item }: { item: NavItem }) => {
    const isActive = activeId === item.id;
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            onClick={() => handleNavClick(item)}
            className={cn(
              "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-150",
              !isOpen && "justify-center px-0 py-3",
            )}
            style={{
              color:      isActive ? "hsl(var(--ink))"         : "hsl(var(--ink-light))",
              background: isActive ? "hsl(var(--neu-bg-dark))" : "transparent",
              fontWeight: isActive ? 600 : 400,
            }}
            onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "hsl(var(--neu-bg-dark))"; }}
            onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            {isActive && isOpen && (
              <div className="absolute left-0 w-0.5 h-4 rounded-r-full" style={{ background: "hsl(var(--spark))" }} />
            )}
            <item.icon
              className={cn("shrink-0 transition-colors", isOpen ? "h-[18px] w-[18px]" : "h-5 w-5")}
              style={{ color: isActive ? "hsl(var(--spark))" : undefined }}
            />
            {isOpen && <span className="truncate">{item.label}</span>}
          </button>
        </TooltipTrigger>
        {!isOpen && (
          <TooltipContent side="right" className="font-medium">{item.label}</TooltipContent>
        )}
      </Tooltip>
    );
  };

  return (
    <>
      <aside
        className={cn(
          "relative flex flex-col transition-all duration-300 ease-in-out z-10 h-full",
          isOpen ? "w-56" : "w-14"
        )}
        style={{ background: NEU_BG, borderRight: "1px solid hsl(var(--neu-shadow-dark)/0.25)" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Logo */}
        <div className={cn("flex h-14 items-center shrink-0", isOpen ? "px-4 gap-3" : "justify-center")}>
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg, hsl(var(--spark-glow)), hsl(var(--spark)))", boxShadow: "0 0 10px hsl(var(--spark)/0.35)" }}
          >
            <span className="text-xs font-bold text-white">K</span>
          </div>
          {isOpen && <span className="font-bold text-base text-ink">Koolage</span>}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto overflow-x-hidden">

            {/* Top nav */}
            <div className={cn("px-2 pb-1 pt-1 space-y-0.5", !isOpen && "px-1")}>
              {TOP_NAV.map(item => <NavButton key={item.id} item={item} />)}
            </div>

            <div className="mx-3 my-2" style={{ height: 1, background: "hsl(var(--neu-shadow-dark)/0.25)" }} />

            {/* Content nav */}
            <div className={cn("px-2 space-y-0.5 relative", !isOpen && "px-1")}>
              {CONTENT_NAV.map(item => <NavButton key={item.id} item={item} />)}
            </div>

            {/* History — expanded */}
            {isOpen && (
              <>
                <div className="mx-3 my-2 mt-3" style={{ height: 1, background: "hsl(var(--neu-shadow-dark)/0.25)" }} />
                <div className="px-4 mb-1">
                  <span className="text-[11px] font-semibold text-ink-faint uppercase tracking-wider">History</span>
                </div>
                <div className="px-2 space-y-0.5 pb-2">
                  {HISTORY_ITEMS.map(h => (
                    <button
                      key={h.id}
                      className="group flex w-full flex-col rounded-xl px-3 py-2 text-left transition-all duration-150"
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "hsl(var(--neu-bg-dark))"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <span className="text-sm text-ink-light group-hover:text-ink truncate transition-colors leading-snug">{h.title}</span>
                      <span className="text-[10px] text-ink-faint mt-0.5">{h.time}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* History icon — collapsed */}
            {!isOpen && (
              <div className="px-1 mt-1">
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      className="flex w-full justify-center rounded-xl py-3 text-ink-faint hover:text-ink transition-colors"
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "hsl(var(--neu-bg-dark))"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <Clock className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">History</TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>

          {/* Bottom pinned: Settings only */}
          <div className="shrink-0 pb-2" style={{ borderTop: "1px solid hsl(var(--neu-shadow-dark)/0.25)" }}>
            <div className={cn("px-2 pt-2", !isOpen && "px-1")}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSettingsOpen(true)}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-light transition-all duration-150",
                      !isOpen && "justify-center px-0 py-3"
                    )}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "hsl(var(--neu-bg-dark))"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <Settings className={cn("shrink-0", isOpen ? "h-[18px] w-[18px]" : "h-5 w-5")} />
                    {isOpen && <span>Settings</span>}
                  </button>
                </TooltipTrigger>
                {!isOpen && <TooltipContent side="right">Settings</TooltipContent>}
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Pin / unpin toggle — only visible when sidebar is open */}
        {isOpen && (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={toggleLeftSidebar}
                className="absolute -right-3.5 top-5 z-20 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
                style={{
                  background: NEU_BG,
                  boxShadow: "3px 3px 8px hsl(var(--neu-shadow-dark)), -3px -3px 8px hsl(var(--neu-shadow-light))",
                  border: "1px solid hsl(var(--neu-shadow-dark)/0.2)",
                }}
              >
                {leftSidebarOpen
                  ? <PinOff className="h-3 w-3" style={{ color: "hsl(var(--spark))" }} />
                  : <Pin    className="h-3 w-3 text-ink-light" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {leftSidebarOpen ? "Unpin sidebar" : "Pin sidebar open"}
            </TooltipContent>
          </Tooltip>
        )}
      </aside>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
