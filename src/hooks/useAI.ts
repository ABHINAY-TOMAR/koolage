import { useState, useCallback } from 'react';
import { toast } from 'sonner';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface MindMapNode {
  id: string;
  data: { label: string };
  position: { x: number; y: number };
  type?: string;
}

interface MindMapEdge {
  id: string;
  source: string;
  target: string;
}

interface Slide {
  id: string;
  title: string;
  content: string;
}

export function useAI() {
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((status: number, error?: string) => {
    if (status === 429) {
      toast.error('Rate limited. Please try again in a moment.');
    } else if (status === 402) {
      toast.error('Out of AI credits. Add funds in Settings.');
    } else {
      toast.error(error || 'AI error. Please try again.');
    }
  }, []);

  const streamChat = useCallback(async (
    messages: Message[],
    onDelta: (text: string) => void,
    onDone: () => void
  ) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        handleError(response.status);
        return;
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            onDone();
            return;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onDelta(content);
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      onDone();
    } catch (e) {
      console.error('streamChat error:', e);
      toast.error('Failed to connect to AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const generateMindMap = useCallback(async (topic: string): Promise<{ nodes: MindMapNode[]; edges: MindMapEdge[] } | null> => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-mindmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        handleError(response.status);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (e) {
      console.error('generateMindMap error:', e);
      toast.error('Failed to generate mind map. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const generateSlides = useCallback(async (
    topic: string, 
    style: string = 'professional'
  ): Promise<{ slides: Slide[] } | null> => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-slides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ topic, style }),
      });

      if (!response.ok) {
        handleError(response.status);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (e) {
      console.error('generateSlides error:', e);
      toast.error('Failed to generate slides. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const expandText = useCallback(async (
    text: string,
    action: 'expand' | 'shorten' | 'fix-grammar' | 'translate' | 'generate',
    onDelta: (text: string) => void,
    onDone: () => void
  ) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/expand-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ text, action }),
      });

      if (!response.ok) {
        handleError(response.status);
        return;
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            onDone();
            return;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onDelta(content);
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      onDone();
    } catch (e) {
      console.error('expandText error:', e);
      toast.error('Failed to process text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  return {
    isLoading,
    streamChat,
    generateMindMap,
    generateSlides,
    expandText,
  };
}
