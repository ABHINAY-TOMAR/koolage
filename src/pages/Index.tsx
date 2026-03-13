import { useEffect } from "react";
import { AppShell } from "@/components/layout";
import { ChatView, BoardView, ExploreView } from "@/components/views";
import { useAppStore } from "@/stores/useAppStore";

const Index = () => {
  const { mode } = useAppStore();

  return (
    <AppShell>
      {mode === "chat" && <ChatView />}
      {mode === "board" && <BoardView />}
      {mode === "explore" && <ExploreView />}
    </AppShell>
  );
};

export default Index;
