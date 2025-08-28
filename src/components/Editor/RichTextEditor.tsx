import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Type,
  List,
  ListOrdered
} from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
// AI actions are handled from AI Tools now; inline imports removed

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Start writing...",
  className = ""
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(16);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const [localToast, setLocalToast] = useState<{ id: number; text: string } | null>(null);

  // Helper will be inlined in handlers; previous memoized version removed

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Keyboard shortcuts
  useHotkeys('mod+b', (e) => {
    e.preventDefault();
    execCommand('bold');
  });

  useHotkeys('mod+i', (e) => {
    e.preventDefault();
    execCommand('italic');
  });

  useHotkeys('mod+u', (e) => {
    e.preventDefault();
    execCommand('underline');
  });

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const setAlignment = (alignment: string) => {
    const alignmentMap = {
      left: 'justifyLeft',
      center: 'justifyCenter',
      right: 'justifyRight',
      justify: 'justifyFull'
    };
    execCommand(alignmentMap[alignment as keyof typeof alignmentMap]);
  };

  const setHeading = (level: number) => {
    execCommand('formatBlock', `h${level}`);
  };

  const applyColor = (color: string) => {
    setCurrentColor(color);
    execCommand('foreColor', color);
    setShowColorPicker(false);
  };

  // applyHighlight unused

  // Remove existing AI markup helpers
  const clearAIHighlights = () => {
    if (!editorRef.current) return;
    const container = editorRef.current;
    const selectors = ['span[data-glossary]', 'span[data-grammar]'];
    selectors.forEach(sel => {
      container.querySelectorAll(sel).forEach((el) => {
        const span = el as HTMLSpanElement;
        const parent = span.parentNode;
        if (!parent) return;
        while (span.firstChild) parent.insertBefore(span.firstChild, span);
        parent.removeChild(span);
      });
    });
  };

  const clearGlossaryHighlights = () => {
    if (!editorRef.current) return;
    editorRef.current.querySelectorAll('span[data-glossary]')?.forEach((el) => {
      const span = el as HTMLSpanElement;
      const parent = span.parentNode; if (!parent) return;
      while (span.firstChild) parent.insertBefore(span.firstChild, span);
      parent.removeChild(span);
    });
  };

  const clearGrammarHighlights = () => {
    if (!editorRef.current) return;
    editorRef.current.querySelectorAll('span[data-grammar]')?.forEach((el) => {
      const span = el as HTMLSpanElement;
      const parent = span.parentNode; if (!parent) return;
      while (span.firstChild) parent.insertBefore(span.firstChild, span);
      parent.removeChild(span);
    });
  };

  // Wrap occurrences of a target string in text nodes under root
  const wrapOccurrences = (root: Node, target: string, wrapperClass: string, attrs: Record<string, string>) => {
    if (!target) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const textNodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const t = node as Text;
      if (t.nodeValue && t.nodeValue.toLowerCase().includes(target.toLowerCase())) textNodes.push(t);
    }
    textNodes.forEach((textNode) => {
      const value = textNode.nodeValue || '';
      const index = value.toLowerCase().indexOf(target.toLowerCase());
      if (index === -1) return;
      const before = value.slice(0, index);
      const match = value.slice(index, index + target.length);
      const after = value.slice(index + target.length);
      const span = document.createElement('span');
      span.className = `${wrapperClass} ai-flash`;
      Object.entries(attrs).forEach(([k, v]) => span.setAttribute(k, v));
      span.textContent = match;
      const frag = document.createDocumentFragment();
      if (before) frag.appendChild(document.createTextNode(before));
      frag.appendChild(span);
      if (after) frag.appendChild(document.createTextNode(after));
      textNode.replaceWith(frag);
    });
  };

  // Disable automatic analysis; actions run only on button click

  // Tooltip handlers
  useEffect(() => {
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const def = target.getAttribute('data-glossary') || target.getAttribute('data-grammar');
      if (def) {
        setTooltip({ x: e.clientX + 12, y: e.clientY + 12, text: def });
      } else {
        setTooltip(null);
      }
    };
    const onScroll = () => setTooltip(null);
    const root = editorRef.current;
    if (!root) return;
    root.addEventListener('mousemove', onMouseOver);
    root.addEventListener('mouseleave', () => setTooltip(null));
    window.addEventListener('scroll', onScroll, true);
    return () => {
      root && root.removeEventListener('mousemove', onMouseOver);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-t-xl p-3 mb-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => document.execCommand('bold')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Bold"
            >
              <strong>B</strong>
            </button>
            <button
              onClick={() => document.execCommand('italic')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Italic"
            >
              <em>I</em>
            </button>
            <button
              onClick={() => document.execCommand('underline')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Underline"
            >
              <u>U</u>
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => document.execCommand('justifyLeft')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Align Left"
            >
              <span className="text-sm">⫷</span>
            </button>
            <button
              onClick={() => document.execCommand('justifyCenter')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Align Center"
            >
              <span className="text-sm">⫸</span>
            </button>
            <button
              onClick={() => document.execCommand('justifyRight')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Align Right"
            >
              <span className="text-sm">⫹</span>
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => document.execCommand('insertUnorderedList')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Bullet List"
            >
              <span className="text-sm">•</span>
            </button>
            <button
              onClick={() => document.execCommand('insertOrderedList')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Numbered List"
            >
              <span className="text-sm">1.</span>
            </button>
          </div>

          {/* Font Size */}
          <div className="flex items-center gap-1">
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value={12}>12px</option>
              <option value={14}>14px</option>
              <option value={16}>16px</option>
              <option value={18}>18px</option>
              <option value={20}>20px</option>
              <option value={24}>24px</option>
              <option value={28}>28px</option>
              <option value={32}>32px</option>
            </select>
          </div>

          {/* Color Picker */}
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={currentColor}
              onChange={(e) => applyColor(e.target.value)}
              className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-transparent"
              title="Text Color"
            />
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className={`
            min-h-[400px] p-6 rounded-xl border border-gray-200 dark:border-gray-700 
            bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 
            prose prose-lg max-w-none dark:prose-invert
          `}
          style={{ fontSize: `${fontSize}px`, fontFamily: 'Inter', color: currentColor }}
          data-placeholder={placeholder}
        />
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg max-w-xs"
          style={{
            left: tooltip.x,
            top: tooltip.y - 40
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};