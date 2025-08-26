import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  Plus,
  Settings,
  Moon,
  Sun,
  Shield,
  Sparkles,
  Download,
  Upload,
  Mic,
  Languages,
  Clock,
  Share2
} from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import { CommandItem } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNote: () => void;
  onToggleTheme: () => void;
  isDark: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onCreateNote,
  onToggleTheme,
  isDark
}) => {
  const [query, setQuery] = useState('');
  
  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    if (isOpen) {
      onClose();
    } else {
      // This would be handled by parent component
    }
  });

  useHotkeys('escape', () => {
    if (isOpen) onClose();
  });

  const commands: CommandItem[] = useMemo(() => [
    {
      id: 'new-note',
      title: 'New Note',
      description: 'Create a new note',
      icon: <Plus size={18} />,
      action: () => {
        onCreateNote();
        onClose();
      },
      category: 'Notes'
    },
    {
      id: 'toggle-theme',
      title: `Switch to ${isDark ? 'Light' : 'Dark'} Mode`,
      description: 'Toggle theme',
      icon: isDark ? <Sun size={18} /> : <Moon size={18} />,
      action: () => {
        onToggleTheme();
        onClose();
      },
      category: 'Settings'
    },
    {
      id: 'voice-input',
      title: 'Voice Input',
      description: 'Create note with voice',
      icon: <Mic size={18} />,
      action: () => {
        // Voice input functionality would go here
        onClose();
      },
      category: 'AI'
    },
    {
      id: 'ai-summarize',
      title: 'AI Summarize',
      description: 'Summarize current note',
      icon: <Sparkles size={18} />,
      action: () => {
        // AI summarize functionality would go here
        onClose();
      },
      category: 'AI'
    },
    {
      id: 'translate',
      title: 'Translate Note',
      description: 'Translate to another language',
      icon: <Languages size={18} />,
      action: () => {
        // Translation functionality would go here
        onClose();
      },
      category: 'AI'
    },
    {
      id: 'encrypt-note',
      title: 'Encrypt Note',
      description: 'Add password protection',
      icon: <Shield size={18} />,
      action: () => {
        // Encryption functionality would go here
        onClose();
      },
      category: 'Security'
    },
    {
      id: 'export-notes',
      title: 'Export Notes',
      description: 'Download all notes',
      icon: <Download size={18} />,
      action: () => {
        // Export functionality would go here
        onClose();
      },
      category: 'Data'
    },
    {
      id: 'import-notes',
      title: 'Import Notes',
      description: 'Upload notes from file',
      icon: <Upload size={18} />,
      action: () => {
        // Import functionality would go here
        onClose();
      },
      category: 'Data'
    },
    {
      id: 'version-history',
      title: 'Version History',
      description: 'View note versions',
      icon: <Clock size={18} />,
      action: () => {
        // Version history functionality would go here
        onClose();
      },
      category: 'Notes'
    },
    {
      id: 'share-note',
      title: 'Share Note',
      description: 'Generate share link',
      icon: <Share2 size={18} />,
      action: () => {
        // Share functionality would go here
        onClose();
      },
      category: 'Notes'
    }
  ], [isDark, onCreateNote, onToggleTheme, onClose]);

  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    
    return commands.filter(command =>
      command.title.toLowerCase().includes(query.toLowerCase()) ||
      command.description?.toLowerCase().includes(query.toLowerCase()) ||
      command.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [commands, query]);

  const categories = useMemo(() => {
    const cats = new Set(filteredCommands.map(cmd => cmd.category));
    return Array.from(cats).sort();
  }, [filteredCommands]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Type a command or search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-transparent border-none outline-none text-lg placeholder-gray-400"
                  autoFocus
                />
              </div>
            </div>

            {/* Commands List */}
            <div className="max-h-96 overflow-y-auto">
              {categories.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No commands found for "{query}"
                </div>
              ) : (
                categories.map(category => (
                  <div key={category}>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-700/50">
                      {category}
                    </div>
                    {filteredCommands
                      .filter(cmd => cmd.category === category)
                      .map((command, index) => (
                        <motion.button
                          key={command.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={command.action}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                          <div className="text-gray-600 dark:text-gray-400">
                            {command.icon}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {command.title}
                            </div>
                            {command.description && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {command.description}
                              </div>
                            )}
                          </div>
                        </motion.button>
                      ))
                    }
                  </div>
                ))
              )}
            </div>

            {/* Footer removed as requested */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};