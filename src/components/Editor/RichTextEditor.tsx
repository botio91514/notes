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
  const [fontFamily, setFontFamily] = useState('Inter');

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

  const applyHighlight = (color: string) => {
    execCommand('hiliteColor', color);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Floating Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-2 z-10 mb-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-2"
      >
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
            <button
              onClick={() => execCommand('bold')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Bold (Cmd+B)"
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => execCommand('italic')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Italic (Cmd+I)"
            >
              <Italic size={16} />
            </button>
            <button
              onClick={() => execCommand('underline')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Underline (Cmd+U)"
            >
              <Underline size={16} />
            </button>
            <button
              onClick={() => execCommand('strikeThrough')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Strikethrough"
            >
              <Strikethrough size={16} />
            </button>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
            <select
              onChange={(e) => setHeading(parseInt(e.target.value))}
              className="px-2 py-1 rounded-lg bg-transparent border-none text-sm focus:ring-2 focus:ring-indigo-500 max-w-[110px]"
            >
              <option value="">Heading</option>
              <option value="1">H1</option>
              <option value="2">H2</option>
              <option value="3">H3</option>
            </select>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
            <button
              onClick={() => setAlignment('left')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Align Left"
            >
              <AlignLeft size={16} />
            </button>
            <button
              onClick={() => setAlignment('center')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Align Center"
            >
              <AlignCenter size={16} />
            </button>
            <button
              onClick={() => setAlignment('right')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Align Right"
            >
              <AlignRight size={16} />
            </button>
            <button
              onClick={() => setAlignment('justify')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Justify"
            >
              <AlignJustify size={16} />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2">
            <button
              onClick={() => execCommand('insertUnorderedList')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Bullet List"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => execCommand('insertOrderedList')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Numbered List"
            >
              <ListOrdered size={16} />
            </button>
          </div>

          {/* Color Picker */}
          <div className="relative flex items-center gap-1">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Text Color"
            >
              <Palette size={16} />
            </button>
            
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-12 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-20 max-w-[220px]"
              >
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {[
                    '#000000', '#DC2626', '#EA580C', '#D97706', '#65A30D', '#059669',
                    '#0891B2', '#2563EB', '#7C3AED', '#C026D3', '#BE185D', '#6B7280'
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => applyColor(color)}
                      className="w-8 h-8 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => applyColor(e.target.value)}
                  className="w-full h-8 rounded cursor-pointer"
                />
              </motion.div>
            )}
          </div>

          {/* Font Size */}
          <div className="flex items-center gap-1">
            <Type size={16} />
            <select
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="px-2 py-1 rounded-lg bg-transparent border-none text-sm focus:ring-2 focus:ring-indigo-500"
            >
              {[12, 14, 16, 18, 20, 24, 28, 32].map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className={`
          min-h-[400px] p-6 rounded-xl border border-gray-200 dark:border-gray-700 
          bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 
          prose prose-lg max-w-none dark:prose-invert
        `}
        style={{ fontSize: `${fontSize}px`, fontFamily }}
        data-placeholder={placeholder}
      />
      
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};