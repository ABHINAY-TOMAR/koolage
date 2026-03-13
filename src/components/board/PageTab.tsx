import React, { useCallback, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Wand2, Loader2, Expand, Minimize2, SpellCheck, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useAI } from '@/hooks/useAI';
import { useGamificationStore } from '@/stores/useGamificationStore';
import './PageTab.css';

interface PageTabProps {
  tabId: string;
  initialContent?: string;
  onSave?: (content: string) => void;
}

type TextAction = 'expand' | 'shorten' | 'fix-grammar' | 'translate' | 'generate';

export function PageTab({ tabId, initialContent = '', onSave }: PageTabProps) {
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedAction, setSelectedAction] = useState<TextAction>('generate');
  const { expandText, isLoading } = useAI();
  const { trackAction } = useGamificationStore();
  const streamingTextRef = useRef('');

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent || '<p>Start typing your notes here...</p>',
    onUpdate: ({ editor }) => {
      onSave?.(editor.getHTML());
    },
  });

  const handleAIAction = useCallback(async (action: TextAction, text?: string) => {
    if (!editor) return;
    
    const inputText = text || editor.getText();
    if (!inputText.trim()) return;

    setShowWriteModal(false);
    streamingTextRef.current = '';

    // Get current cursor position or end of document
    const { from, to } = editor.state.selection;
    const hasSelection = from !== to;

    // If there's a selection for actions, delete it first
    if (hasSelection && action !== 'generate') {
      editor.chain().focus().deleteSelection().run();
    }

    await expandText(
      inputText,
      action,
      (token) => {
        streamingTextRef.current += token;
        // Insert token at current position
        editor.chain().focus().insertContent(token).run();
      },
      () => {
        streamingTextRef.current = '';
        setPrompt('');
        trackAction('write');
      }
    );
  }, [editor, expandText]);

  const handleToolbarAIWrite = () => {
    const selectedText = editor?.state.selection.empty 
      ? '' 
      : editor?.state.doc.textBetween(
          editor.state.selection.from,
          editor.state.selection.to
        );
    
    if (selectedText) {
      setPrompt(selectedText);
    }
    setShowWriteModal(true);
  };

  const handleQuickAction = (action: TextAction) => {
    const selectedText = editor?.state.doc.textBetween(
      editor?.state.selection.from || 0,
      editor?.state.selection.to || 0
    );
    
    if (selectedText) {
      handleAIAction(action, selectedText);
    }
  };

  if (!editor) {
    return <div className="h-full bg-paper" />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="border-b border-border bg-paper-elevated px-4 py-3 flex gap-2 flex-wrap">
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          variant={editor.isActive('bold') ? 'default' : 'outline'}
          size="sm"
          className="text-xs"
        >
          Bold
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          variant={editor.isActive('italic') ? 'default' : 'outline'}
          size="sm"
          className="text-xs"
        >
          Italic
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'outline'}
          size="sm"
          className="text-xs"
        >
          H1
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
          size="sm"
          className="text-xs"
        >
          H2
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          variant={editor.isActive('bulletList') ? 'default' : 'outline'}
          size="sm"
          className="text-xs"
        >
          List
        </Button>
        <div className="ml-auto flex gap-2">
          {/* Quick actions dropdown for selected text */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isLoading || editor.state.selection.empty}
              >
                <Wand2 className="h-4 w-4" />
                Edit Selection
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleQuickAction('expand')}>
                <Expand className="h-4 w-4 mr-2" />
                Expand
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleQuickAction('shorten')}>
                <Minimize2 className="h-4 w-4 mr-2" />
                Shorten
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleQuickAction('fix-grammar')}>
                <SpellCheck className="h-4 w-4 mr-2" />
                Fix Grammar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleQuickAction('translate')}>
                <Languages className="h-4 w-4 mr-2" />
                Translate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={handleToolbarAIWrite}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            {isLoading ? 'Writing...' : 'AI Write'}
          </Button>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 overflow-auto bg-paper p-8">
        <div className="bg-white rounded-lg shadow-desk p-12 min-h-full max-w-2xl mx-auto">
          <EditorContent editor={editor} className="page-editor" />
        </div>
      </div>

      {/* AI Write Modal */}
      <Dialog open={showWriteModal} onOpenChange={setShowWriteModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-spark" />
              AI Writing Assistant
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="What would you like AI to write? (e.g., 'Write an introduction about climate change')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWriteModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleAIAction('generate', prompt)} 
              disabled={!prompt.trim() || isLoading}
              className="bg-spark hover:bg-spark/90 text-accent-foreground"
            >
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
