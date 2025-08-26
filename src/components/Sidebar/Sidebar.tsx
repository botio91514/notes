import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Filter, 
  Settings,
  Moon,
  Sun,
  Sparkles,
  Shield,
  Menu,
  X,
  Pin,
  FileText,
  Home
} from 'lucide-react';
import { NoteCard } from '../Notes/NoteCard';
import { Note } from '../../types';

interface SidebarProps {
  notes: Note[];
  pinnedNotes: Note[];
  regularNotes: Note[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  onCreateNote: () => void;
  onEditNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDecryptNote: (id: string, password: string) => void;
  selectedNoteId?: string;
  isDark: boolean;
  onToggleTheme: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onShowWelcome?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  pinnedNotes,
  regularNotes,
  searchQuery,
  setSearchQuery,
  selectedTags,
  setSelectedTags,
  onCreateNote,
  onEditNote,
  onDeleteNote,
  onTogglePin,
  onDecryptNote,
  selectedNoteId,
  isDark,
  onToggleTheme,
  isCollapsed = false,
  onToggleCollapse,
  onShowWelcome
}) => {
  const [showFilters, setShowFilters] = useState(false);
  
  // Get all unique tags from notes
  const allTags = Array.from(
    new Set(notes.flatMap(note => note.tags))
  ).sort();

  const toggleTag = (tag: string) => {
    setSelectedTags(
      selectedTags.includes(tag)
        ? selectedTags.filter(t => t !== tag)
        : [...selectedTags, tag]
    );
  };

  return (
    <motion.div
      animate={{ width: isCollapsed ? 64 : 360 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-full md:w-auto md:h-screen bg-white dark:bg-gray-900 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 flex-shrink-0 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className={`${isCollapsed ? 'flex flex-col items-center gap-2' : 'flex items-center justify-between mb-4'}`}>
          <motion.h1 
            animate={{ opacity: isCollapsed ? 0 : 1 }}
            className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            {!isCollapsed && 'Notes'}
          </motion.h1>
          
          <div className={`${isCollapsed ? 'flex flex-col items-center gap-2' : 'flex items-center gap-2'}`}>
            {onShowWelcome && (
              <button
                onClick={onShowWelcome}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Welcome Screen"
              >
                <Home size={20} />
              </button>
            )}
            
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isCollapsed ? <Menu size={20} /> : <X size={20} />}
              </button>
            )}
          </div>
        </div>

        {!isCollapsed && (
          <>
            {/* Search */}
            <div className="relative mb-4">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mb-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCreateNote}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus size={18} />
                New Note
              </motion.button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters || selectedTags.length > 0
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title="Filters"
              >
                <Filter size={18} />
              </button>
            </div>

            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <h4 className="font-medium mb-2 text-sm text-gray-700 dark:text-gray-300">Filter by tags:</h4>
                  <div className="flex flex-wrap gap-1">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-2 py-1 rounded-full text-xs transition-colors ${
                          selectedTags.includes(tag)
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {isCollapsed ? (
          /* Collapsed view with just icons */
          <div className="p-2 space-y-2">
            <button
              onClick={onCreateNote}
              className="w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="New Note"
            >
              <Plus size={24} className="mx-auto" />
            </button>
            
            {notes.slice(0, 10).map((note) => (
              <button
                key={note.id}
                onClick={() => onEditNote(note.id)}
                className={`w-full p-3 rounded-lg transition-colors ${
                  selectedNoteId === note.id
                    ? 'bg-indigo-100 dark:bg-indigo-900'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={note.title || 'Untitled'}
              >
                <FileText size={20} className="mx-auto" />
                {note.isPinned && (
                  <Pin size={12} className="absolute top-1 right-1 text-indigo-500" />
                )}
              </button>
            ))}
          </div>
        ) : (
          /* Full view */
          <div className="p-4 space-y-6">
            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Pin size={16} className="text-indigo-500" />
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">
                    Pinned ({pinnedNotes.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={onEditNote}
                      onDelete={onDeleteNote}
                      onTogglePin={onTogglePin}
                      onDecrypt={onDecryptNote}
                      isSelected={selectedNoteId === note.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Notes */}
            {regularNotes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={16} className="text-gray-500" />
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">
                    Notes ({notes.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {regularNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={onEditNote}
                      onDelete={onDeleteNote}
                      onTogglePin={onTogglePin}
                      onDecrypt={onDecryptNote}
                      isSelected={selectedNoteId === note.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {notes.length === 0 && !searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <Sparkles size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  No notes yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Create your first note to get started
                </p>
                <button
                  onClick={onCreateNote}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create Note
                </button>
              </motion.div>
            )}

            {/* No Results */}
            {notes.length === 0 && searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <Search size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  No results found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search terms
                </p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};