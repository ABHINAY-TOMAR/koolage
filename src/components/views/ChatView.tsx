import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Sparkles, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useGamificationStore } from "@/stores/useGamificationStore";
import { useAI } from "@/hooks/useAI";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const quickActions = [
  "📚 Generate a Mind Map",
  "📝 Create a Slide Deck",
  "✍️ Expand my notes",
  "🧠 Quiz me on a topic",
];

export function ChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const { trackAction } = useGamificationStore();
  const { streamChat, isLoading } = useAI();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    trackAction('chat');

    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    const chatMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
    
    await streamChat(
      chatMessages,
      (token) => {
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: m.content + token } : m)
        );
      },
      () => {}
    );
  };

  return (
    <div
      className="flex h-full flex-col"
      style={{ background: "hsl(var(--neu-bg))" }}
    >
      {/* Messages Area */}
      <div className="flex-1 overflow-auto p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            {/* Hero Icon */}
            <div
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl"
              style={{
                background: "hsl(var(--neu-bg))",
                boxShadow: "10px 10px 20px hsl(var(--neu-shadow-dark)), -10px -10px 20px hsl(var(--neu-shadow-light)), 0 0 30px hsl(var(--spark)/0.2)",
              }}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--spark-glow)), hsl(var(--spark)))",
                  boxShadow: "0 0 20px hsl(var(--spark)/0.5)",
                }}
              >
                <Sparkles className="h-7 w-7 text-white" />
              </div>
            </div>

            <h2 className="mb-2 text-2xl font-bold text-ink">Welcome to Kolage</h2>
            <p className="max-w-md text-ink-light text-sm leading-relaxed">
              Your AI-powered study companion. Upload a PDF, ask questions, or generate a mind map to get started.
            </p>

            {/* Quick Action Cards */}
            <div className="mt-10 grid grid-cols-2 gap-4 w-full max-w-sm">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => setInput(action.replace(/^[^\s]+\s/, ""))}
                  className="rounded-2xl px-4 py-4 text-sm text-left font-medium text-ink-light hover:text-ink transition-all duration-200"
                  style={{
                    background: "hsl(var(--neu-bg))",
                    boxShadow: "6px 6px 12px hsl(var(--neu-shadow-dark)), -6px -6px 12px hsl(var(--neu-shadow-light))",
                  }}
                  onMouseDown={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "inset 4px 4px 8px hsl(var(--neu-shadow-dark)), inset -4px -4px 8px hsl(var(--neu-shadow-light))";
                  }}
                  onMouseUp={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "6px 6px 12px hsl(var(--neu-shadow-dark)), -6px -6px 12px hsl(var(--neu-shadow-light))";
                  }}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed"
                  style={
                    message.role === "user"
                      ? {
                          background: "linear-gradient(135deg, hsl(var(--spark-glow)), hsl(var(--spark)))",
                          boxShadow: "4px 4px 10px hsl(var(--neu-shadow-dark)), -2px -2px 6px hsl(var(--neu-shadow-light)), 0 0 15px hsl(var(--spark)/0.25)",
                          color: "white",
                        }
                      : {
                          background: "hsl(var(--neu-bg))",
                          boxShadow: "6px 6px 12px hsl(var(--neu-shadow-dark)), -6px -6px 12px hsl(var(--neu-shadow-light))",
                          color: "hsl(var(--ink))",
                        }
                  }
                >
                  {message.content ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin opacity-50" />
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-5">
        <div className="mx-auto max-w-3xl">
          {/* Input container — inset neumorph tray */}
          <div
            className="flex items-end gap-3 rounded-3xl p-3"
            style={{
              background: "hsl(var(--neu-bg))",
              boxShadow: "inset 4px 4px 10px hsl(var(--neu-shadow-dark)), inset -4px -4px 10px hsl(var(--neu-shadow-light))",
            }}
          >
            {/* Attach button */}
            <button
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200"
              style={{
                background: "hsl(var(--neu-bg))",
                boxShadow: "3px 3px 6px hsl(var(--neu-shadow-dark)), -3px -3px 6px hsl(var(--neu-shadow-light))",
              }}
            >
              <Paperclip className="h-5 w-5 text-ink-light" />
            </button>
            
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message Kolage..."
              className="min-h-[40px] max-h-[200px] flex-1 resize-none border-0 bg-transparent p-1 text-ink placeholder:text-ink-faint focus-visible:ring-0 focus-visible:outline-none"
              rows={1}
            />
            
            {/* Send button — spark glow */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-all duration-200 disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, hsl(var(--spark-glow)), hsl(var(--spark)))",
                boxShadow: "3px 3px 8px hsl(var(--neu-shadow-dark)), -1px -1px 4px hsl(var(--neu-shadow-light)), 0 0 12px hsl(var(--spark)/0.3)",
              }}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          
          <p className="mt-2.5 text-center text-xs text-ink-faint">
            Kolage can make mistakes. Consider checking important info.
          </p>
        </div>
      </div>
    </div>
  );
}
