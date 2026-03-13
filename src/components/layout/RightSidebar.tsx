import { useState } from "react";
import {
  Sparkles, Wand2, Download, Share2, X,
  Youtube, Speech, Wrench, SendHorizontal,
  Presentation, FileText, Table, Brain,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";

const NEU_BG = "hsl(var(--neu-bg))";

type SideTab = "tools" | "ai";

// ── Context-aware tools per tab type ────────────────────────
function getContextTools(mode: string, tabType?: string) {
  if (mode === "board" && tabType) {
    switch (tabType) {
      case "whiteboard":
        return [
          { icon: Brain,        label: "Generate Map",   action: "generate-map",  desc: "AI mind map" },
          { icon: Wand2,        label: "Auto Layout",    action: "auto-layout",   desc: "Reorganize nodes" },
          { icon: Share2,       label: "Share Board",    action: "share",         desc: "Get share link" },
          { icon: Download,     label: "Export PNG",     action: "export-png",    desc: "Save as image" },
        ];
      case "slide":
        return [
          { icon: Sparkles,     label: "Generate Deck",  action: "generate-deck", desc: "AI slide deck" },
          { icon: Presentation, label: "Present Mode",   action: "present",       desc: "Full screen" },
          { icon: Share2,       label: "Share Deck",     action: "share",         desc: "Get share link" },
          { icon: Download,     label: "Export PPTX",    action: "export-pptx",   desc: "PowerPoint file" },
        ];
      case "page":
        return [
          { icon: Wand2,        label: "AI Write",       action: "ai-write",      desc: "Generate content" },
          { icon: FileText,     label: "Summarize",      action: "summarize",     desc: "Condense text" },
          { icon: Share2,       label: "Share Doc",      action: "share",         desc: "Get share link" },
          { icon: Download,     label: "Export PDF",     action: "export-pdf",    desc: "Save as PDF" },
        ];
      case "sheet":
        return [
          { icon: Sparkles,     label: "AI Formula",     action: "ai-formula",    desc: "Generate formula" },
          { icon: Table,        label: "Auto Fill",      action: "auto-fill",     desc: "Fill series" },
          { icon: Share2,       label: "Share Sheet",    action: "share",         desc: "Get share link" },
          { icon: Download,     label: "Export CSV",     action: "export-csv",    desc: "Save as CSV" },
        ];
    }
  }
  return [
    { icon: Youtube,  label: "Open Video",     action: "open-video",    desc: "Embed YouTube" },
    { icon: Speech,   label: "Text to Speech", action: "open-tts",      desc: "Read text aloud" },
    { icon: Share2,   label: "Share",          action: "share",         desc: "Get share link" },
  ];
}

// ── Tools tab ────────────────────────────────────────────────
function ToolsTab() {
  const { mode, activeTabId, boardTabs, showDock } = useAppStore();
  const activeTab = boardTabs.find((t) => t.id === activeTabId);
  const tools = getContextTools(mode, activeTab?.type);

  const handleToolClick = (action: string) => {
    switch (action) {
      case "open-video": {
        const url = prompt("Enter YouTube URL:");
        if (url) showDock({ type: "youtube", url });
        break;
      }
      case "open-tts": {
        const text = prompt("Enter text to read aloud:");
        if (text) showDock({ type: "tts", text });
        break;
      }
      default:
        break;
    }
  };

  return (
    <div className="space-y-2 p-3">
      {/* Context label */}
      {mode === "board" && activeTab && (
        <div className="mb-3 rounded-xl px-3 py-2" style={{ background: NEU_BG, boxShadow: "inset 2px 2px 5px hsl(var(--neu-shadow-dark)), inset -2px -2px 5px hsl(var(--neu-shadow-light))" }}>
          <p className="text-[10px] text-ink-faint uppercase tracking-wide font-semibold">Active</p>
          <p className="text-xs font-bold text-ink truncate">{activeTab.title}</p>
        </div>
      )}

      {tools.map((tool) => (
        <button
          key={tool.action}
          onClick={() => handleToolClick(tool.action)}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 hover:scale-[1.01]"
          style={{ background: NEU_BG, boxShadow: "4px 4px 9px hsl(var(--neu-shadow-dark)), -4px -4px 9px hsl(var(--neu-shadow-light))" }}
          onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "inset 3px 3px 7px hsl(var(--neu-shadow-dark)), inset -3px -3px 7px hsl(var(--neu-shadow-light))"; }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "4px 4px 9px hsl(var(--neu-shadow-dark)), -4px -4px 9px hsl(var(--neu-shadow-light))"; }}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg, hsl(var(--spark-glow)), hsl(var(--spark)))", boxShadow: "0 0 10px hsl(var(--spark)/0.3)" }}
          >
            <tool.icon className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink leading-tight">{tool.label}</p>
            <p className="text-[10px] text-ink-faint">{tool.desc}</p>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-ink-faint opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      ))}
    </div>
  );
}

// ── AI Assist tab ────────────────────────────────────────────
function AIAssistTab() {
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hi! I can help you write, summarize, brainstorm ideas, or answer questions. What would you like to do?" },
  ]);

  const handleSend = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    setHistory((h) => [
      ...h,
      { role: "user", text: trimmed },
      { role: "ai", text: "✨ AI is thinking… (connect your API to get real responses)" },
    ]);
    setPrompt("");
  };

  return (
    <div className="flex flex-col h-full p-3 gap-3">
      {/* Chat history */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0 max-h-72">
        {history.map((msg, i) => (
          <div
            key={i}
            className={cn("rounded-xl px-3 py-2.5 text-xs leading-relaxed", msg.role === "user" ? "ml-4 text-white" : "mr-4 text-ink")}
            style={{
              background: msg.role === "user"
                ? "linear-gradient(135deg, hsl(var(--spark-glow)), hsl(var(--spark)))"
                : NEU_BG,
              boxShadow: msg.role === "ai"
                ? "inset 2px 2px 5px hsl(var(--neu-shadow-dark)), inset -2px -2px 5px hsl(var(--neu-shadow-light))"
                : "none",
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Quick prompts */}
      <div className="flex gap-1.5 flex-wrap">
        {["Summarize", "Brainstorm", "Rewrite", "Explain"].map((q) => (
          <button
            key={q}
            onClick={() => setPrompt(q + " ")}
            className="rounded-full px-2.5 py-1 text-[10px] font-medium text-ink-light transition-all duration-150"
            style={{ background: NEU_BG, boxShadow: "2px 2px 5px hsl(var(--neu-shadow-dark)), -2px -2px 5px hsl(var(--neu-shadow-light))" }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div
        className="flex items-end gap-2 rounded-xl p-2"
        style={{ background: NEU_BG, boxShadow: "inset 3px 3px 7px hsl(var(--neu-shadow-dark)), inset -3px -3px 7px hsl(var(--neu-shadow-light))" }}
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Ask AI anything…"
          rows={2}
          className="flex-1 resize-none bg-transparent text-xs text-ink placeholder:text-ink-faint outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!prompt.trim()}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 disabled:opacity-30"
          style={{ background: "linear-gradient(135deg, hsl(var(--spark-glow)), hsl(var(--spark)))", boxShadow: "0 0 8px hsl(var(--spark)/0.4)" }}
        >
          <SendHorizontal className="h-3.5 w-3.5 text-white" />
        </button>
      </div>
    </div>
  );
}

// ── RightSidebar ─────────────────────────────────────────────
export function RightSidebar() {
  const { rightSidebarOpen, setRightSidebarOpen } = useAppStore();
  const [activeTab, setActiveTab] = useState<SideTab>("tools");

  if (!rightSidebarOpen) return null;

  const tabs: { id: SideTab; icon: typeof Wrench; label: string }[] = [
    { id: "tools", icon: Wrench,    label: "Tools"     },
    { id: "ai",    icon: Sparkles,  label: "AI Assist" },
  ];

  return (
    <aside
      className="flex w-64 flex-col animate-slide-in-right"
      style={{ background: NEU_BG, boxShadow: "-4px 0 16px hsl(var(--neu-shadow-dark) / 0.35)", borderLeft: "1px solid hsl(var(--neu-shadow-dark)/0.2)" }}
    >
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg, hsl(var(--spark-glow)), hsl(var(--spark)))", boxShadow: "0 0 8px hsl(var(--spark)/0.3)" }}
          >
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-ink">Panel</span>
        </div>
        <button
          onClick={() => setRightSidebarOpen(false)}
          aria-label="Close panel"
          className="flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200"
          style={{ background: NEU_BG, boxShadow: "3px 3px 6px hsl(var(--neu-shadow-dark)), -3px -3px 6px hsl(var(--neu-shadow-light))" }}
        >
          <X className="h-3.5 w-3.5 text-ink-light" />
        </button>
      </div>

      {/* Tab bar */}
      <div
        className="mx-3 mb-2 flex gap-1 rounded-xl p-1"
        style={{ background: NEU_BG, boxShadow: "inset 3px 3px 7px hsl(var(--neu-shadow-dark)), inset -3px -3px 7px hsl(var(--neu-shadow-light))" }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all duration-200"
            style={{
              background: activeTab === t.id
                ? "linear-gradient(135deg, hsl(var(--spark-glow)), hsl(var(--spark)))"
                : "transparent",
              color: activeTab === t.id ? "#fff" : "hsl(var(--ink-light))",
              boxShadow: activeTab === t.id ? "2px 2px 6px rgba(0,0,0,0.12)" : "none",
            }}
          >
            <t.icon className="h-3 w-3" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "tools" ? <ToolsTab /> : <AIAssistTab />}
      </div>
    </aside>
  );
}
