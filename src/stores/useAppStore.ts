import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppMode = 'chat' | 'board' | 'explore';
export type BoardTabType = 'whiteboard' | 'slide' | 'page' | 'sheet';

export interface BoardTab {
  id: string;
  type: BoardTabType;
  title: string;
}

interface AppState {
  // Navigation
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  
  // Sidebar
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setLeftSidebarOpen: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;
  
  // Board Tabs
  boardTabs: BoardTab[];
  activeTabId: string | null;
  addBoardTab: (type: BoardTabType, title?: string) => string;
  removeBoardTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabTitle: (id: string, title: string) => void;
  
  // Floating Dock
  dockVisible: boolean;
  dockContent: { type: 'youtube' | 'tts'; url?: string; text?: string } | null;
  dockPosition: { x: number; y: number; width: number; height: number } | null;
  showDock: (content: { type: 'youtube' | 'tts'; url?: string; text?: string }) => void;
  hideDock: () => void;
  updateDockPosition: (position: { x: number; y: number; width: number; height: number }) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Navigation
      mode: 'chat',
      setMode: (mode) => set({ mode }),
      
      // Sidebar
      leftSidebarOpen: true,
      rightSidebarOpen: false,
      toggleLeftSidebar: () => set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),
      toggleRightSidebar: () => set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen })),
      setLeftSidebarOpen: (open) => set({ leftSidebarOpen: open }),
      setRightSidebarOpen: (open) => set({ rightSidebarOpen: open }),
      
      // Board Tabs
      boardTabs: [],
      activeTabId: null,
      addBoardTab: (type, title) => {
        const id = generateId();
        const typeLabels: Record<BoardTabType, string> = {
          whiteboard: 'Whiteboard',
          slide: 'Slides',
          page: 'Page',
          sheet: 'Sheet',
        };
        const newTab: BoardTab = {
          id,
          type,
          title: title || `${typeLabels[type]} ${get().boardTabs.filter(t => t.type === type).length + 1}`,
        };
        set((state) => ({
          boardTabs: [...state.boardTabs, newTab],
          activeTabId: id,
        }));
        return id;
      },
      removeBoardTab: (id) => {
        set((state) => {
          const newTabs = state.boardTabs.filter(t => t.id !== id);
          let newActiveId = state.activeTabId;
          
          if (state.activeTabId === id) {
            const removedIndex = state.boardTabs.findIndex(t => t.id === id);
            if (newTabs.length > 0) {
              newActiveId = newTabs[Math.min(removedIndex, newTabs.length - 1)].id;
            } else {
              newActiveId = null;
            }
          }
          
          return { boardTabs: newTabs, activeTabId: newActiveId };
        });
      },
      setActiveTab: (id) => set({ activeTabId: id }),
      updateTabTitle: (id, title) => {
        set((state) => ({
          boardTabs: state.boardTabs.map(t => t.id === id ? { ...t, title } : t),
        }));
      },
      
      // Floating Dock
      dockVisible: false,
      dockContent: null,
      dockPosition: null,
      showDock: (content) => set({ dockVisible: true, dockContent: content }),
      hideDock: () => set({ dockVisible: false, dockContent: null }),
      updateDockPosition: (position) => set({ dockPosition: position }),
    }),
    {
      name: 'koolage-app-store',
      partialize: (state) => ({
        mode: state.mode,
        leftSidebarOpen: state.leftSidebarOpen,
        boardTabs: state.boardTabs,
        activeTabId: state.activeTabId,
      }),
    }
  )
);
