import { Plus, X, PenTool, Presentation, FileText, Table } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, BoardTabType } from "@/stores/useAppStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WhiteboardTab, SlideTab, PageTab, SheetTab } from "@/components/board";

const tabTypeIcons: Record<BoardTabType, typeof PenTool> = {
  whiteboard: PenTool,
  slide: Presentation,
  page: FileText,
  sheet: Table,
};

const tabTypeLabels: Record<BoardTabType, string> = {
  whiteboard: "Whiteboard",
  slide: "Slides",
  page: "Page",
  sheet: "Sheet",
};

export function BoardView() {
  const { boardTabs, activeTabId, addBoardTab, removeBoardTab, setActiveTab } = useAppStore();
  const activeTab = boardTabs.find((t) => t.id === activeTabId);

  return (
    <div className="flex h-full flex-col" style={{ background: "hsl(var(--neu-bg))" }}>
      {/* Tab Bar — inset groove with raised tabs */}
      <div
        className="flex items-center gap-2 px-4 pt-3 pb-0"
        style={{
          background: "hsl(var(--neu-bg))",
          boxShadow: "0 4px 8px hsl(var(--neu-shadow-dark) / 0.3)",
        }}
      >
        <div className="flex items-center gap-2 flex-1 overflow-x-auto pb-3">
          {boardTabs.map((tab) => {
            const Icon = tabTypeIcons[tab.type];
            const isActive = tab.id === activeTabId;

            return (
              <div
                key={tab.id}
                className={cn(
                  "group flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer select-none whitespace-nowrap",
                  isActive ? "text-ink" : "text-ink-light hover:text-ink"
                )}
                style={{
                  background: "hsl(var(--neu-bg))",
                  boxShadow: isActive
                    ? "inset 3px 3px 7px hsl(var(--neu-shadow-dark)), inset -3px -3px 7px hsl(var(--neu-shadow-light)), 0 0 0 2px hsl(var(--spark)/0.3)"
                    : "4px 4px 8px hsl(var(--neu-shadow-dark)), -4px -4px 8px hsl(var(--neu-shadow-light))",
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-spark")} />
                <span className="max-w-[120px] truncate">{tab.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBoardTab(tab.id);
                  }}
                  className="ml-1 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}

          {/* Add Tab Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-light hover:text-ink transition-all duration-200 mb-0.5"
                style={{
                  background: "hsl(var(--neu-bg))",
                  boxShadow: "3px 3px 7px hsl(var(--neu-shadow-dark)), -3px -3px 7px hsl(var(--neu-shadow-light))",
                }}
              >
                <Plus className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {(Object.keys(tabTypeIcons) as BoardTabType[]).map((type) => {
                const Icon = tabTypeIcons[type];
                return (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => addBoardTab(type)}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tabTypeLabels[type]}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab ? (
          <div className="h-full">
            {activeTab.type === "whiteboard" && <WhiteboardTab tabId={activeTab.id} />}
            {activeTab.type === "slide" && <SlideTab tabId={activeTab.id} />}
            {activeTab.type === "page" && <PageTab tabId={activeTab.id} />}
            {activeTab.type === "sheet" && <SheetTab tabId={activeTab.id} />}
          </div>
        ) : (
          <EmptyBoardState onAddTab={addBoardTab} />
        )}
      </div>
    </div>
  );
}

function EmptyBoardState({ onAddTab }: { onAddTab: (type: BoardTabType) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center p-8">
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl text-4xl"
        style={{
          background: "hsl(var(--neu-bg))",
          boxShadow: "10px 10px 20px hsl(var(--neu-shadow-dark)), -10px -10px 20px hsl(var(--neu-shadow-light))",
        }}
      >
        📋
      </div>
      <h2 className="mb-2 text-2xl font-bold text-ink">Your Board is Empty</h2>
      <p className="mb-10 max-w-md text-ink-light text-sm leading-relaxed">
        Create a new tab to start working. Choose from Whiteboard, Slides, Page, or Sheet.
      </p>
      
      <div className="grid grid-cols-2 gap-5">
        {(Object.keys(tabTypeIcons) as BoardTabType[]).map((type) => {
          const Icon = tabTypeIcons[type];
          return (
            <button
              key={type}
              onClick={() => onAddTab(type)}
              className="flex flex-col items-center gap-3 rounded-2xl px-10 py-6 text-ink-light hover:text-ink transition-all duration-200"
              style={{
                background: "hsl(var(--neu-bg))",
                boxShadow: "8px 8px 16px hsl(var(--neu-shadow-dark)), -8px -8px 16px hsl(var(--neu-shadow-light))",
              }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "inset 5px 5px 10px hsl(var(--neu-shadow-dark)), inset -5px -5px 10px hsl(var(--neu-shadow-light))";
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "8px 8px 16px hsl(var(--neu-shadow-dark)), -8px -8px 16px hsl(var(--neu-shadow-light))";
              }}
            >
              <Icon className="h-9 w-9 text-spark" />
              <span className="font-semibold text-sm">{tabTypeLabels[type]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
